use super::super::dtos::{
    requests::auth_requests::{LoginRequestDto, RegisterRequestDto},
    responses::auth_responses::{AuthResponse, UserResponse},
};
use crate::server::application::use_cases::user_use_cases::UserUseCases;
use crate::server::domain::repositories::user_repository::UserRepository;
use crate::server::{
    application::requests::auth_model_requests::{LoginUserRequest, RegisterUserRequest},
    domain::entities::user::UserPayload,
};
use crate::utils::error::{AppError, Result};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use validator::Validate;

pub async fn register<T>(
    State(user_use_cases): State<UserUseCases<T>>,
    Json(payload): Json<RegisterRequestDto>,
) -> Result<impl IntoResponse>
where
    T: UserRepository,
{
    payload.validate().map_err(AppError::from)?;

    // Mapear DTO a Model Request
    let register_request = RegisterUserRequest {
        name: payload.name,
        phone: payload.phone,
        password: payload.password,
    };

    user_use_cases.register_user(register_request).await?;

    let response = json!({
        "statusCode": 201,
        "message": "Usuario registrado exitosamente"
    });

    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn login<T>(
    State(user_use_cases): State<UserUseCases<T>>,
    Json(payload): Json<LoginRequestDto>,
) -> Result<Json<AuthResponse>>
where
    T: UserRepository,
{
    payload.validate().map_err(AppError::from)?;

    // Mapear DTO a Model Request
    let login_request = LoginUserRequest {
        phone: payload.phone,
        password: payload.password,
    };

    let (_, token) = user_use_cases.login_user(login_request).await?;

    let auth_response = AuthResponse::from_token(token);
    Ok(Json(auth_response))
}

pub async fn get_authenticated_user<T>(
    State(user_use_cases): State<UserUseCases<T>>,
    request: axum::extract::Request,
) -> Result<Json<UserResponse>>
where
    T: UserRepository,
{
    let user_payload = request
        .extensions()
        .get::<UserPayload>()
        .ok_or_else(|| AppError::AuthError("Usuario no autorizado".to_string()))?;

    if user_payload.role != "admin" {
        let is_admin = user_use_cases.is_admin(&user_payload.phone).await?;
        if !is_admin {
            return Err(AppError::AuthError(
                "Sin permisos para acceder al sistema".to_string(),
            ));
        }
    }

    Ok(Json(UserResponse {
        id: user_payload.id,
        name: user_payload.name.clone(),
        phone: user_payload.phone.clone(),
        role: user_payload.role.clone(),
    }))
}
