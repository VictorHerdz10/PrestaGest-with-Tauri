use axum::{
    middleware, routing::{get, post}, Router
};
use crate::server::presentation::controllers::auth_controller::{register, login, get_authenticated_user};
use crate::server::presentation::middleware::rate_limit::{auth_rate_limit};


/// Configura las rutas de autenticación
pub fn auth_routes() -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/authenticate", get(get_authenticated_user))
        .layer(middleware::from_fn(auth_rate_limit))
}