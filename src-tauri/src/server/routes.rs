use axum::{
    middleware, response::Json, routing::get, Router
};
use serde_json::{Value, json};

use crate::server::presentation::{middleware::jwt_middleware, routes::api_routes::api_routes};


/// Configura todas las rutas de la aplicación
pub fn configure_routes() -> Router {
    Router::new()
        // Ruta de health check
        .route("/health", get(health_check))
        // Ruta de ejemplo
        .route("/api/hello", get(hello_world))
        .layer(middleware::from_fn(jwt_middleware::jwt_middleware)) 
        // API routes (auth, users, etc.)
        .nest("/api", api_routes())
}

/// Endpoint de health check
async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "message": "Servidor funcionando correctamente"
    }))
}

/// Endpoint de ejemplo
async fn hello_world() -> Json<Value> {
    Json(json!({
        "message": "¡Hola desde el servidor Axum!"
    }))
}