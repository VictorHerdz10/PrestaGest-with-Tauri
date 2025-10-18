use axum::{Router, middleware};
use crate::server::presentation::routes::{auth_routes, user_routes};
use crate::server::presentation::middleware::{timing_middleware, jwt_middleware};

/// Configura todas las rutas de la API
pub fn api_routes() -> Router {
    Router::new()
        .nest("/auth", auth_routes::auth_routes())
        .nest("/users", user_routes::user_routes())
        .layer(middleware::from_fn(timing_middleware))
        .layer(middleware::from_fn(jwt_middleware::jwt_middleware)) // ✅ Agregar middleware JWT
}