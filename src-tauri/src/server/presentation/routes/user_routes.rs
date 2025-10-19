use crate::server::presentation::controllers::user_controller::{
    get_user_by_id, get_user_by_phone,
};
use crate::server::presentation::middleware::rate_limit::normal_rate_limit;
use axum::middleware;
use axum::{routing::get, Router};

/// Configura las rutas de usuarios
pub fn user_routes() -> Router {
    Router::new()
        .route("/:id", get(get_user_by_id))
        .route("/phone/:phone", get(get_user_by_phone))
        .layer(middleware::from_fn(normal_rate_limit))
}
