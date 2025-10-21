use async_trait::async_trait;
use diesel::prelude::*;
use crate::server::domain::entities::user::{User, NewUser};
use crate::server::domain::repositories::user_repository::UserRepository;
use crate::server::infrastructure::database::models::user::{UserModel, NewUserModel};
use crate::server::infrastructure::database::schema::users;
use crate::server::infrastructure::database::connection::DbPool;
use crate::utils::error::Result;

#[derive(Clone)]
pub struct DieselUserRepository {
    pool: DbPool,
}

impl DieselUserRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepository for DieselUserRepository {
    async fn find_by_id(&self, id: i32) -> Result<Option<User>> {
        let mut conn = self.pool.get()?;
        
        let user_model = users::table
            .find(id)
            .first::<UserModel>(&mut conn)
            .optional()?;
            
        Ok(user_model.map(|model| model.into()))
    }
    
    async fn create(&self, new_user: NewUser) -> Result<User> {
        let mut conn = self.pool.get()?;
        
        let new_user_model: NewUserModel = new_user.into();
        
        // ✅ Para SQLite, usar approach diferente sin RETURNING
        diesel::insert_into(users::table)
            .values(&new_user_model)
            .execute(&mut conn)?;
            
        // ✅ Obtener el usuario recién insertado por su phone (único)
        let user_model = users::table
            .filter(users::phone.eq(&new_user_model.phone))
            .first::<UserModel>(&mut conn)?;
            
        Ok(user_model.into())
    }
    
    async fn find_by_phone(&self, phone: &str) -> Result<Option<User>> {
        let mut conn = self.pool.get()?;
        
        let user_model = users::table
            .filter(users::phone.eq(phone))
            .first::<UserModel>(&mut conn)
            .optional()?;
            
        Ok(user_model.map(|model| model.into()))
    }
    
}