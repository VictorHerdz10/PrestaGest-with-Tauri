use axum::{
    middleware,
    routing::get, 
    Router
};
use crate::server::application::use_cases::user_use_cases::UserUseCases;
use crate::server::domain::repositories::user_repository::UserRepository;
use crate::server::presentation::controllers::user_controller::{
    get_user_by_id, get_user_by_phone,
};
use crate::server::presentation::middleware::rate_limit::normal_rate_limit;

pub fn user_routes<T>(user_use_cases: UserUseCases<T>) -> Router 
where 
    T: UserRepository + Clone + Send + Sync + 'static,
    UserUseCases<T>: Clone + Send + Sync + 'static,
{
    Router::new()
        .route("/:id", get(get_user_by_id))
        .route("/phone/:phone", get(get_user_by_phone))
        .layer(middleware::from_fn(normal_rate_limit))
        .with_state(user_use_cases)
}