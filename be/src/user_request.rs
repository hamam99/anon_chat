use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct UserRequest {
    pub username: String,
}
