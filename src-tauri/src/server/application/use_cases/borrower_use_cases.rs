use crate::server::application::requests::borrower_model_requests::{CreateBorrowerRequest, UpdateBorrowerRequest};
use crate::server::domain::entities::borrower::{NewBorrower, Borrower};
use crate::server::domain::repositories::borrower_repository::BorrowerRepository;
use crate::utils::error::{Result, AppError};

#[derive(Clone)]
pub struct BorrowerUseCases<T: BorrowerRepository> {
    borrower_repository: T,
}

impl<T: BorrowerRepository> BorrowerUseCases<T> {
    pub fn new(borrower_repository: T) -> Self {
        Self { borrower_repository }
    }

    /// Crear nuevo borrower
    pub async fn create_borrower(&self, request: CreateBorrowerRequest) -> Result<Borrower> {
        let CreateBorrowerRequest { phone, name, location } = request;
        
        // Verificar si ya existe un borrower con el mismo teléfono
        if self.borrower_repository.exists_by_phone(&phone).await? {
            return Err(AppError::Conflict(
                "Ya existe un prestatario con este teléfono".to_string()
            ));
        }

        let new_borrower = NewBorrower::new(phone, name, location);
        self.borrower_repository.create(&new_borrower).await
    }

    /// Obtener todos los borrowers
    pub async fn get_all_borrowers(&self) -> Result<Vec<Borrower>> {
        self.borrower_repository.find_all().await
    }

    /// Obtener borrower por ID
    pub async fn get_borrower_by_id(&self, id: i32) -> Result<Borrower> {
        self.borrower_repository
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("Prestatario con ID {} no encontrado", id)))
    }

    /// Actualizar borrower
    pub async fn update_borrower(&self, id: i32, request: UpdateBorrowerRequest) -> Result<Borrower> {
        // Verificar que el borrower existe
        let existing_borrower = self.get_borrower_by_id(id).await?;

        // Si se está actualizando el teléfono, verificar que no exista otro con el mismo teléfono
        if let Some(phone) = &request.phone {
            if self.borrower_repository.exists_by_phone_excluding_id(phone, id).await? {
                return Err(AppError::Conflict(
                    "Ya existe un prestatario con este teléfono".to_string()
                ));
            }
        }

        // Crear borrower actualizado
        let updated_borrower = Borrower {
            id,
            phone: request.phone.unwrap_or(existing_borrower.phone),
            name: request.name.unwrap_or(existing_borrower.name),
            location: request.location.unwrap_or(existing_borrower.location),
            total_loans: existing_borrower.total_loans,
            total_paid: existing_borrower.total_paid,
            balance: existing_borrower.balance,
            status: existing_borrower.status,
            created_at: existing_borrower.created_at,
            updated_at: existing_borrower.updated_at,
        };

        self.borrower_repository.update(id, &updated_borrower).await
    }

    /// Eliminar borrower
    pub async fn delete_borrower(&self, id: i32) -> Result<()> {
        // Verificar que el borrower existe
        self.get_borrower_by_id(id).await?;
        
        self.borrower_repository.delete(id).await
    }

  
}