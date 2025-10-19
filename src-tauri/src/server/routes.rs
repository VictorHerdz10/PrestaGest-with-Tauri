// routes.rs
use axum::{
    middleware, 
    response::Json, 
    routing::get, 
    Router
};
use serde_json::{Value, json};

use crate::server::presentation::{
    middleware::{
        timing_middleware,
        rate_limit::{normal_rate_limit, strict_rate_limit}
    },
    routes::api_routes::api_routes,
};

pub fn configure_routes() -> Router {
    Router::new()
    
    .route("/health", get(health_check)
        .layer(middleware::from_fn(strict_rate_limit))) 
    
    
    .route("/api/hello", get(hello_world)
        .layer(middleware::from_fn(normal_rate_limit)))  
    
    .nest("/api", api_routes())
    .layer(middleware::from_fn(timing_middleware))
}


async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "message": "Servidor funcionando correctamente"
    }))
}


async fn hello_world() -> Json<Value> {
    Json(json!({
        "message": "¡Hola desde el servidor Axum!"
    }))
}