use tokio::sync::mpsc;
use warp::ws::Message;

pub struct Client {
    pub user_id: usize,
    pub username: String,
    pub sender: mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>,
}
