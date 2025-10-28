use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateBorrowerRequestDto {
    #[validate(length(
        min = 8,
        message = "El teléfono debe tener mínimo 8 dígitos"
    ))]
    pub phone: String,
    
    #[validate(length(
        min = 1,
        message = "El nombre no puede estar vacío"
    ))]
    pub name: String,
    
    #[validate(length(
        min = 1,
        message = "La ubicación no puede estar vacía"
    ))]
    pub location: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateBorrowerRequestDto {
    #[validate(length(
        min = 8,
        message = "El teléfono debe tener mínimo 8 dígitos"
    ))]
    pub phone: Option<String>,
    
    #[validate(length(
        min = 1,
        message = "El nombre no puede estar vacío"
    ))]
    pub name: Option<String>,
    
    #[validate(length(
        min = 1,
        message = "La ubicación no puede estar vacía"
    ))]
    pub location: Option<String>,
}