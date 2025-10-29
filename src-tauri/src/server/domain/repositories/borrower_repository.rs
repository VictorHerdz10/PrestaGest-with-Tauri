use crate::server::domain::entities::borrower::{NewBorrower, Borrower};
use crate::utils::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait BorrowerRepository: Clone + Send + Sync {
    async fn create(&self, new_borrower: &NewBorrower) -> Result<Borrower>;
    async fn find_all(&self) -> Result<Vec<Borrower>>;
    async fn find_by_id(&self, id: i32) -> Result<Option<Borrower>>;
    async fn update(&self, id: i32, borrower: &Borrower) -> Result<Borrower>;
    async fn delete(&self, id: i32) -> Result<()>;
    async fn exists_by_phone(&self, phone: &str) -> Result<bool>;
    async fn exists_by_phone_excluding_id(&self, phone: &str, excluded_id: i32) -> Result<bool>;
}