use axum::{
    routing::{post, get},
    Router,
};
use crate::server::presentation::controllers::auth_controller::{register, login, get_authenticated_user};

/// Configura las rutas de autenticación
pub fn auth_routes() -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/authenticate", get(get_authenticated_user)) // ✅ Nuevo endpoint protegido
}