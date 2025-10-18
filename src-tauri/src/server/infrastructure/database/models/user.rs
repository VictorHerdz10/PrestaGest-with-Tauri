use diesel::prelude::*;
use chrono::NaiveDateTime;

// Modelo de Diesel para la tabla users
#[derive(Queryable, Identifiable,Selectable, Debug, Clone)]
#[diesel(table_name = crate::server::infrastructure::database::schema::users)]
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

// Modelo para insertar nuevos usuarios
#[derive(Insertable, Debug)]
#[diesel(table_name = crate::server::infrastructure::database::schema::users)]
pub struct NewUserModel {
    pub phone: String,
    pub name: String,
    pub password: String,
    pub role: String,
}

// Implementación de conversiones
impl From<UserModel> for crate::server::domain::entities::user::User {
    fn from(model: UserModel) -> Self {
        use chrono::TimeZone;
        
        Self {
            id: model.id,
            phone: model.phone,
            name: model.name,
            password: model.password,
            role: model.role,
            created_at: chrono::Utc.from_utc_datetime(&model.created_at),
            updated_at: chrono::Utc.from_utc_datetime(&model.updated_at),
        }
    }
}

impl From<crate::server::domain::entities::user::NewUser> for NewUserModel {
    fn from(entity: crate::server::domain::entities::user::NewUser) -> Self {
        Self {
            phone: entity.phone,
            name: entity.name,
            password: entity.password,
            role: entity.role,
        }
    }
}