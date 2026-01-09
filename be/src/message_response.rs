use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]

pub struct MessageResponse {
    pub sender: String,
    pub message: String,
}
