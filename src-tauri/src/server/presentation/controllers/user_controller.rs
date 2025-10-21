use axum::{
    extract::{Path, State},
    Json,
};
use crate::server::application::use_cases::user_use_cases::UserUseCases;
use crate::server::domain::repositories::user_repository::UserRepository;
use crate::server::presentation::dtos::responses::auth_responses::UserResponse;
use crate::utils::error::{AppError, Result};

pub async fn get_user_by_id<T>(
    State(user_use_cases): State<UserUseCases<T>>,
    Path(user_id): Path<i32>,
) -> Result<Json<UserResponse>> 
where 
    T: UserRepository
{
    let user = user_use_cases.get_user_by_id(user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Usuario no encontrado".to_string()))?;

    Ok(Json(UserResponse::from(user)))
}

pub async fn get_user_by_phone<T>(
    State(user_use_cases): State<UserUseCases<T>>,
    Path(phone): Path<String>,
) -> Result<Json<UserResponse>> 
where 
    T: UserRepository
{
    let user = user_use_cases.get_user_by_phone(&phone)
        .await?
        .ok_or_else(|| AppError::NotFound("Usuario no encontrado".to_string()))?;

    Ok(Json(UserResponse::from(user)))
}