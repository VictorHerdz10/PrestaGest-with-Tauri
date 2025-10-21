use crate::server::domain::entities::user::{NewUser, User};
use crate::server::infrastructure::database::schema::users;
use chrono::NaiveDateTime;
use diesel::prelude::*;

#[derive(Queryable, Identifiable, Selectable, Debug, Clone)]
#[diesel(table_name = users)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct UserModel {
    pub id: i32,
    pub phone: String,
    pub name: String,
    pub password: String,
    pub role: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Debug)]
#[diesel(table_name = users)]
pub struct NewUserModel {
    pub phone: String,
    pub name: String,
    pub password: String,
    pub role: String,
}

impl From<UserModel> for User {
    fn from(model: UserModel) -> Self {
        Self {
            id: model.id,
            phone: model.phone,
            name: model.name,
            password: model.password,
            role: model.role
           // created_at: model.created_at.to_string(),
           // updated_at: model.updated_at.to_string(),
        }
    }
}

impl From<NewUser> for NewUserModel {
    fn from(entity: NewUser) -> Self {
        Self {
            phone: entity.phone,
            name: entity.name,
            password: entity.password,
            role: entity.role,
        }
    }
}
