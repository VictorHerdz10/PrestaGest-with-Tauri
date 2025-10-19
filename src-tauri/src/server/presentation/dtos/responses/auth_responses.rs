use serde::Serialize;
use crate::server::domain::entities::user::User;

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: i32,
    pub name: String,
    pub phone: String,
    pub role: String,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
        }
    }
}

// Implementación para crear AuthResponse desde User y token
impl AuthResponse {
    pub fn from_user_and_token( token: String) -> Self {
        Self {
            access_token: token,
        }
    }
}
