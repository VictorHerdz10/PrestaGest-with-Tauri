use axum::{
    middleware, 
    routing::{get, post}, 
    Router
};
use crate::server::{application::use_cases::user_use_cases::UserUseCases, domain::repositories::user_repository::UserRepository, presentation::controllers::auth_controller::{get_authenticated_user, login, register}};
use crate::server::presentation::middleware::rate_limit::auth_rate_limit;

pub fn auth_routes<T>(user_use_cases: UserUseCases<T>) -> Router 
where 
    T: UserRepository + Clone + Send + Sync + 'static,
    UserUseCases<T>: Clone + Send + Sync + 'static,
{
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/authenticate", get(get_authenticated_user))
        .layer(middleware::from_fn(auth_rate_limit))
        .with_state(user_use_cases) 