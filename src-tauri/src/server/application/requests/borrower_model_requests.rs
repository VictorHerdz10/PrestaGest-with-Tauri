use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct CreateBorrowerRequest {
    pub phone: String,
    pub name: String,
    pub location: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateBorrowerRequest {
    pub phone: Option<String>,
    pub name: Option<String>,
    pub location: Option<String>,
}