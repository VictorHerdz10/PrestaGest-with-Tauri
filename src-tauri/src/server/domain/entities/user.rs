
#[derive(Debug, Clone)]
pub struct User {
    pub id: i32,
    pub phone: String,
    pub name: String,
    pub password: String,
    pub role: String,
    //pub created_at: String,
    //pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct NewUser {
    pub phone: String,
    pub name: String,
    pub password: String,
    pub role: String,
}

#[derive(Clone)]
pub struct UserPayload {
    pub id: i32,
    pub name: String,
    pub phone: String,
    pub role: String,
}

impl UserPayload {
    pub fn new(id: i32, name: String, phone: String, role: String) -> Self {
        Self { id, name, phone, role }
    }
}