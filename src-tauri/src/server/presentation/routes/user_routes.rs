use axum::{
    routing::get,
    Router,
};
use crate::server::presentation::controllers::user_controller::{get_user_by_id,get_user_by_phone};

/// Configura las rutas de usuarios
pub fn user_routes() -> Router {
    Router::new()
        .route("/:id", get(get_user_by_id))
        .route("/phone/:phone", get(get_user_by_phone))
}