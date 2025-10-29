// routes.rs
use axum::{
    middleware, 
    response::Json, 
    routing::get, 
    Router
};
use serde_json::{Value, json};

use crate::{server::presentation::{
    middleware::{
        rate_limit::{normal_rate_limit, strict_rate_limit}, timing_middleware
    },
    routes::api_routes::api_routes,
}, utils::ServiceFactory};

pub fn configure_routes() -> Router {
     let user_use_cases = ServiceFactory::create_user_use_cases();
     let borrower_use_cases = ServiceFactory::create_borrower_use_cases();
    Router::new()
    
    .route("/health", get(health_check)
        .layer(middleware::from_fn(strict_rate_limit))) 
    
    
    .route("/api/hello", get(hello_world)
        .layer(middleware::from_fn(normal_rate_limit)))  
    
    .nest("/api", api_routes(user_use_cases, borrower_use_cases))
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