use crate::server::domain::entities::user::{NewUser, User};
use crate::utils::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait UserRepository:Clone + Send + Sync {
    async fn find_by_id(&self, id: i32) -> Result<Option<User>>;
    async fn find_by_phone(&self, phone: &str) -> Result<Option<User>>;
    async fn create(&self, new_user: NewUser) -> Result<User>;
}
