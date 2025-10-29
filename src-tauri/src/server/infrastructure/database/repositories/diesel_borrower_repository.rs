use async_trait::async_trait;
use diesel::prelude::*;
use crate::server::domain::entities::borrower::{Borrower, NewBorrower};
use crate::server::domain::repositories::borrower_repository::BorrowerRepository;
use crate::server::infrastructure::database::models::borrower::{BorrowerModel, NewBorrowerModel};
use crate::server::infrastructure::database::schema::borrowers;
use crate::server::infrastructure::database::connection::DbPool;
use crate::utils::error::Result;

/// Implementación concreta del repositorio de borrowers usando Diesel con SQLite
/// Solo se encarga de operaciones CRUD básicas con la base de datos
#[derive(Clone)]
pub struct DieselBorrowerRepository {
    pool: DbPool,
}

impl DieselBorrowerRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl BorrowerRepository for DieselBorrowerRepository {
    /// Crear un nuevo borrower en la base de datos
    async fn create(&self, new_borrower: &NewBorrower) -> Result<Borrower> {
        let mut conn = self.pool.get()?;
        
        // Convertir el NewBorrower del dominio al modelo de inserción
        let new_borrower_model: NewBorrowerModel = new_borrower.clone().into();
        
        // Insertar en la base de datos - Diesel manejará los valores por defecto automáticamente
        diesel::insert_into(borrowers::table)
            .values(&new_borrower_model)
            .execute(&mut conn)?;
            
        // Obtener el borrower recién insertado por su teléfono (campo único)
        let borrower_model = borrowers::table
            .filter(borrowers::phone.eq(&new_borrower_model.phone))
            .first::<BorrowerModel>(&mut conn)?;
            
        // Convertir el modelo de base de datos a entidad del dominio
        Ok(borrower_model.into())
    }

    /// Obtener todos los borrowers de la base de datos
    async fn find_all(&self) -> Result<Vec<Borrower>> {
        let mut conn = self.pool.get()?;
        
        // Consultar todos los borrowers
        let borrower_models = borrowers::table
            .load::<BorrowerModel>(&mut conn)?;
            
        // Convertir cada modelo a entidad del dominio
        Ok(borrower_models.into_iter().map(|model| model.into()).collect())
    }

    /// Buscar un borrower por su ID
    async fn find_by_id(&self, id: i32) -> Result<Option<Borrower>> {
        let mut conn = self.pool.get()?;
        
        let borrower_model = borrowers::table
            .find(id)
            .first::<BorrowerModel>(&mut conn)
            .optional()?;
            
        Ok(borrower_model.map(|model| model.into()))
    }

    /// Actualizar un borrower existente
    async fn update(&self, id: i32, borrower: &Borrower) -> Result<Borrower> {
        let mut conn = self.pool.get()?;

        // Actualizar todos los campos del borrower
        diesel::update(borrowers::table.find(id))
            .set((
                borrowers::phone.eq(&borrower.phone),
                borrowers::name.eq(&borrower.name),
                borrowers::location.eq(&borrower.location),
                borrowers::total_loans.eq(borrower.total_loans),
                borrowers::total_paid.eq(borrower.total_paid),
                borrowers::balance.eq(borrower.balance),
                borrowers::status.eq(&borrower.status),
                borrowers::updated_at.eq(chrono::Utc::now().naive_utc()),
            ))
            .execute(&mut conn)?;
            
        // Obtener el borrower actualizado
        let updated_borrower = borrowers::table
            .find(id)
            .first::<BorrowerModel>(&mut conn)?;
            
        Ok(updated_borrower.into())
    }

    /// Eliminar un borrower por su ID
    async fn delete(&self, id: i32) -> Result<()> {
        let mut conn = self.pool.get()?;
        
        diesel::delete(borrowers::table.find(id))
            .execute(&mut conn)?;
            
        Ok(())
    }

    /// Verificar si existe un borrower con el teléfono dado
    async fn exists_by_phone(&self, phone: &str) -> Result<bool> {
        let mut conn = self.pool.get()?;
        
        let exists = diesel::select(diesel::dsl::exists(
            borrowers::table.filter(borrowers::phone.eq(phone))
        ))
        .get_result(&mut conn)?;
        
        Ok(exists)
    }

    /// Verificar si existe un borrower con el teléfono dado, excluyendo un ID específico
    async fn exists_by_phone_excluding_id(&self, phone: &str, excluded_id: i32) -> Result<bool> {
        let mut conn = self.pool.get()?;
        
        let exists = diesel::select(diesel::dsl::exists(
            borrowers::table
                .filter(borrowers::phone.eq(phone))
                .filter(borrowers::id.ne(excluded_id))
        ))
        .get_result(&mut conn)?;
        
        Ok(exists)
    }
}