use crate::server::domain::entities::borrower::{Borrower, NewBorrower};
use crate::server::infrastructure::database::schema::borrowers;
use chrono::NaiveDateTime;
use diesel::prelude::*;

/// Modelo de base de datos para la tabla `borrowers`
/// Representa exactamente la estructura de la tabla en la base de datos
#[derive(Queryable, Identifiable, Selectable, Debug, Clone)]
#[diesel(table_name = borrowers)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct BorrowerModel {
    pub id: i32,
    pub phone: String,
    pub name: String,
    pub location: String,
    pub total_loans: f64,      // Double en SQLite se mapea a f64
    pub total_paid: f64,       // Double en SQLite se mapea a f64  
    pub balance: f64,          // Double en SQLite se mapea a f64
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

/// Modelo para insertar nuevos borrowers en la base de datos
/// Solo incluye los campos que se proporcionan al crear
#[derive(Insertable, Debug, Clone)]
#[diesel(table_name = borrowers)]
pub struct NewBorrowerModel {
    pub phone: String,
    pub name: String,
    pub location: String,
    // Los campos con valores por defecto se omiten en la inserción
    // Diesel los manejará automáticamente con los valores por defecto de la base de datos
}

/// Conversión de BorrowerModel (base de datos) a Borrower (dominio)
impl From<BorrowerModel> for Borrower {
    fn from(model: BorrowerModel) -> Self {
        Self {
            id: model.id,
            phone: model.phone,
            name: model.name,
            location: model.location,
            total_loans: model.total_loans,
            total_paid: model.total_paid,
            balance: model.balance,
            status: model.status,
            created_at: model.created_at.and_utc(),
            updated_at: model.updated_at.and_utc(),
        }
    }
}

/// Conversión de NewBorrower (dominio) a NewBorrowerModel (base de datos)
impl From<NewBorrower> for NewBorrowerModel {
    fn from(entity: NewBorrower) -> Self {
        Self {
            phone: entity.phone,
            name: entity.name,
            location: entity.location,
        }
    }
}