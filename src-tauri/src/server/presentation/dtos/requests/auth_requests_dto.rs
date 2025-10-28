use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequestDto {
    #[validate(length(min = 1, message = "El nombre no puede estar vacío"))]
    pub name: String,
    
    #[validate(length(min = 8, message = "El teléfono debe tener mínimo 8 dígitos"))]
    pub phone: String,
    
    #[validate(length(min = 8, message = "La contraseña debe tener mínimo 8 caracteres"))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequestDto {
    #[validate(length(min = 1, message = "El campo de teléfono no puede estar vacío"))]
    pub phone: String,
    
    #[validate(length(min = 1, message = "El campo de la contraseña no puede estar vacío"))]
    pub password: String,
}