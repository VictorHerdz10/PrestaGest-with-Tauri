
#[derive(Debug, Clone)]
pub struct RegisterUserRequest {
    pub name: String,
    pub phone: String,
    pub password: String,
}

#[derive(Debug,Clone)]
pub struct LoginUserRequest{
    pub phone:String,
    pub password:String
}