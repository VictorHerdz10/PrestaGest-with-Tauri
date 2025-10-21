use crate::server::application::use_cases::user_use_cases::UserUseCases;
use crate::server::domain::repositories::user_repository::UserRepository;
use crate::utils::error::AppError;
use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};

pub async fn jwt_middleware<T>(
    State(user_use_cases): State<UserUseCases<T>>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError>
where
    T: UserRepository + Clone + Send + Sync + 'static,
{
    let path = request.uri().path();

    
    if path.starts_with("/auth/login") || path.starts_with("/auth/register") {
        return Ok(next.run(request).await);
    }

    let headers = request.headers();
    let auth_header = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| AppError::AuthError("Token de autenticación requerido".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err(AppError::AuthError("Formato de token inválido".to_string()));
    }

    let token = &auth_header[7..];

    let user_payload = user_use_cases.verify_token(token)?;
    request.extensions_mut().insert(user_payload);

    Ok(next.run(request).await)
}
