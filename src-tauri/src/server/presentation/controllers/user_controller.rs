use axum::{
    extract::{Path},
    Json,
};
use crate::{get_global_app_state};
use crate::server::presentation::dtos::responses::auth_responses::UserResponse;
use  crate::server::infrastructure::database::repositories::user_repository::DieselUserRepository;
use crate::server::application::use_cases::user_use_cases::UserUseCases;
use crate::utils::error::{AppError, Result};

/// Obtener usuario por ID
pub async fn get_user_by_id(
    Path(user_id): Path<i32>,
) -> Result<Json<UserResponse>> {
    let app_state = get_global_app_state(); 
    let user_repository = DieselUserRepository::new(app_state.db.clone());
    let use_cases = UserUseCases::new(user_repository);
    
    let user = use_cases.get_user_by_id(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Usuario no encontrado".to_string()))?;

    Ok(Json(UserResponse::from(user)))
}

/// Obtener usuario por teléfono
pub async fn get_user_by_phone(
    Path(phone): Path<String>,
) -> Result<Json<UserResponse>> {
    let app_state = get_global_app_state(); 
    let user_repository = DieselUserRepository::new(app_state.db.clone());
    let use_cases = UserUseCases::new(user_repository);
    
    let user = use_cases.get_user_by_phone(&phone)
        .await?
        .ok_or_else(|| AppError::NotFound("Usuario no encontrado".to_string()))?;

    Ok(Json(UserResponse::from(user)))
}