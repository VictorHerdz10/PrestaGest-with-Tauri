use axum::{
    extract::{Request},
    middleware::Next,
    response::Response,
    http::{ HeaderMap},
};
use crate::server::application::services::auth_service::AuthService;
use crate::server::infrastructure::database::repositories::user_repository::DieselUserRepository;
use crate::utils::error::AppError;
use crate::get_global_app_state;

#[derive(Clone)]
pub struct UserPayload {
    pub id: i32,
    pub name: String,
    pub phone: String,
    pub role: String,
}

pub async fn jwt_middleware(
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    
    let path = request.uri().path();
    if path.starts_with("/auth/login") || path.starts_with("/auth/register") {
        return Ok(next.run(request).await);
    }

    let auth_header = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| AppError::AuthError("Token de autenticación requerido".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err(AppError::AuthError("Formato de token inválido".to_string()));
    }

    let token = &auth_header[7..]; // Remover "Bearer "

    // Verificar el token JWT usando el auth service
    let app_state = get_global_app_state();
    let user_repository = DieselUserRepository::new(app_state.db.clone());
    let auth_service = AuthService::new(user_repository);

    let user_payload= auth_service.verify_token(token)?;
    request.extensions_mut().insert(user_payload);

    Ok(next.run(request).await)
}