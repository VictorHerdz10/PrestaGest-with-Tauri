use axum::{middleware, Router};
use crate::server::presentation::routes::{auth_routes::auth_routes, user_routes::user_routes};
use crate::server::presentation::middleware::jwt_middleware::jwt_middleware;
use crate::server::application::use_cases::user_use_cases::UserUseCases;
use crate::server::domain::repositories::user_repository::UserRepository;

pub fn api_routes<T>(user_use_cases: UserUseCases<T>) -> Router 
where 
    T: UserRepository + Clone + Send + Sync + 'static,
{
    Router::new()
        .nest("/auth", auth_routes(user_use_cases.clone()))
        .nest("/users", user_routes(user_use_cases.clone()))
        .layer(middleware::from_fn_with_state(
            user_use_cases, 
            jwt_middleware
        ))
}