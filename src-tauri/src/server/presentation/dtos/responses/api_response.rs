use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ApiResponse {
    pub status_code: u16,
    pub message: String,
    pub error: String,
}



impl ApiResponse {
    pub fn created(message: String) -> Self {
        Self {
            status_code: 201,
            message,
            error: "created".to_string(),
        }
    }
    
    pub fn ok(message: String) -> Self {
        Self {
            status_code: 200,
            message,
            error: "ok".to_string(),
        }
    }
}