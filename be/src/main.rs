use futures::{FutureExt, StreamExt};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
};
use tokio::sync::{mpsc, RwLock};
use warp::ws::{Message, WebSocket};
use warp::Filter;

pub mod client;
use crate::client::Client;

pub mod message_response;
use crate::message_response::MessageResponse;

pub mod user_request;
use crate::user_request::UserRequest;

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
type Users = Arc<RwLock<HashMap<usize, Client>>>;

#[tokio::main]
async fn main() {
    let users = Users::default();
    let user_filter = warp::any().map(move || users.clone());

    let chat = warp::path("ws")
        .and(warp::ws())
        .and(user_filter)
        .and(warp::query::<UserRequest>())
        .map(|ws: warp::ws::Ws, users, params: UserRequest| {
            ws.on_upgrade(move |socket| user_connected(socket, users, params.username))
        });

    println!("Server started");
    // warp::serve(chat).run(([127, 0, 0, 1], 3030)).await;
    warp::serve(chat).run(([0, 0, 0, 0], 3030)).await;
}
async fn user_connected(ws: WebSocket, users: Users, username: String) {
    let (user_ws_tx, mut user_ws_rx) = ws.split();
    let (tx, rx) = mpsc::unbounded_channel();

    let rx = tokio_stream::wrappers::UnboundedReceiverStream::new(rx);
    tokio::task::spawn(rx.forward(user_ws_tx).map(|result| {
        if let Err(e) = result {
            eprintln!("websocket send error: {}", e);
        }
    }));

    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
    let new_user = Client {
        sender: tx,
        user_id: my_id,
        username: username.clone(),
    };

    users.write().await.insert(my_id, new_user);

    broadcast_message(
        &users,
        "System",
        &format!("{} has joined the chat", username),
    )
    .await;

    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("websocket error(uid={}): {}", my_id, e);
                break;
            }
        };
        user_message(my_id, msg, &users).await;
    }

    user_disconnected(my_id, &users, &username).await;
}

async fn user_message(my_id: usize, msg: Message, users: &Users) {
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };

    let username = {
        let users_guard = users.read().await;
        users_guard
            .get(&my_id)
            .map(|c| c.username.clone())
            .unwrap_or_else(|| "Anonymous".into())
    };

    broadcast_message(users, &username, msg).await;
}

async fn user_disconnected(my_id: usize, users: &Users, username: &str) {
    users.write().await.remove(&my_id);
    broadcast_message(users, "System", &format!("{} has left the chat", username)).await;
}

async fn broadcast_message(users: &Users, sender_name: &str, message: &str) {
    let formatted_msg = format!("{}: {}", sender_name, message);

    let users_guard = users.read().await;

    let message_response = MessageResponse {
        sender: sender_name.to_string(),
        message: message.to_string(),
    };
    for client in users_guard.values() {
        let _ = client.sender.send(Ok(Message::text(
            serde_json::to_string(&message_response).unwrap(),
        )));
    }
}
