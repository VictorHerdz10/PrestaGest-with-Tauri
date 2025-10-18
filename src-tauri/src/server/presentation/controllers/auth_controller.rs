use crate::get_global_app_state;
use crate::server::application::use_cases::user_use_cases::UserUseCases;
use crate::server::infrastructure::database::repositories::user_repository::DieselUserRepository;
use crate::server::presentation::dtos::responses::auth_responses::RegisterResponse;
use crate::server::presentation::{
    dtos::{
        requests::auth_requests::{LoginRequest, RegisterRequest},
        responses::auth_responses::{AuthResponse, UserResponse},
    },
    middleware::jwt_middleware::UserPayload,
};
use crate::utils::error::{AppError, Result};
use axum::{extract::Request, Json};
use validator::Validate;

pub async fn register(Json(payload): Json<RegisterRequest>) -> Result<Json<RegisterResponse>> {
    payload
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    let app_state = get_global_app_state();
    let user_repository = DieselUserRepository::new(app_state.db.clone());
    let use_cases = UserUseCases::new(user_repository);

    use_cases
        .register_user(payload.phone, payload.name, payload.password)
        .await?;

    Ok(Json(RegisterResponse::success()))
}

pub async fn login(Json(payload): Json<LoginRequest>) -> Result<Json<AuthResponse>> {
    payload
        .validate()
        .map_err(|e| AppError::ValidationError(e.to_string()))?;

    let app_state = get_global_app_state();
    let user_repository = DieselUserRepository::new(app_state.db.clone());
    let use_cases = UserUseCases::new(user_repository);

    // Ahora recibimos (User, token) del use case
    let (_, token) = use_cases
        .login_user(payload.phone, payload.password)
        .await?;

    // Construir la respuesta en la capa de presentación
    let auth_response = AuthResponse::from_user_and_token(token);

    Ok(Json(auth_response))
}

pub async fn get_authenticated_user(request: Request) -> Result<Json<UserResponse>> {
    let user_payload = request
        .extensions()
        .get::<UserPayload>()
        .ok_or_else(|| AppError::AuthError("Usuario no autorizado".to_string()))?;

    // Verificar si es admin (similar a tu lógica en NestJS)
    if user_payload.role != "admin" {
        let app_state = get_global_app_state();
        let user_repository = DieselUserRepository::new(app_state.db.clone());
        let use_cases = UserUseCases::new(user_repository);

        let is_admin = use_cases.is_admin(&user_payload.phone).await?;
        if !is_admin {
            return Err(AppError::AuthError(
                "El usuario no tiene los permisos para acceder al sistema".to_string(),
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
