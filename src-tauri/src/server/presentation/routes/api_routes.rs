// api_routes.rs
use crate::server::presentation::middleware::jwt_middleware;
use crate::server::presentation::routes::{auth_routes, user_routes};
use axum::{middleware, Router};

pub fn api_routes() -> Router {
    Router::new()
        .nest("/auth", auth_routes::auth_routes())
        .nest("/users", user_routes::user_routes())
        .layer(middleware::from_fn(jwt_middleware::jwt_middleware))
}
