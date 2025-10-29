use crate::server::presentation::middleware::rate_limit::auth_rate_limit;
use crate::server::{
    application::use_cases::borrower_use_cases::BorrowerUseCases,
    domain::repositories::borrower_repository::BorrowerRepository,
    presentation::controllers::borrower_controller::{
        create_borrower, delete_borrower, get_all_borrowers, get_borrower_by_id, update_borrower,
    },
};
use axum::{
    middleware,
    routing::{delete, get, patch, post},
    Router,
};

pub fn borrower_routes<T>(borrower_use_cases: BorrowerUseCases<T>) -> Router
where
    T: BorrowerRepository + Clone + Send + Sync + 'static,
{
    Router::new()
        .route("/", post(create_borrower))
        .route("/", get(get_all_borrowers))
        .route("/:id", get(get_borrower_by_id))
        .route("/:id", patch(update_borrower))
        .route("/:id", delete(delete_borrower))
        .layer(middleware::from_fn(auth_rate_limit))
        .with_state(borrower_use_cases)
}
