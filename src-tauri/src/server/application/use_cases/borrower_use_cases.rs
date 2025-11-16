use crate::server::application::requests::borrower_model_requests::{BorrowerModelResponse, CreateBorrowerRequest, UpdateBorrowerRequest};
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
   /// Crear nuevo borrower - ahora retorna BorrowerModelResponse
    pub async fn create_borrower(&self, request: CreateBorrowerRequest) -> Result<BorrowerModelResponse> {
        let CreateBorrowerRequest { phone, name, location } = request;
        
        // Verificar si ya existe un borrower con el mismo teléfono
        if self.borrower_repository.exists_by_phone(&phone).await? {
            return Err(AppError::Conflict(
                "Ya existe un prestatario con este teléfono".to_string()
            ));
        }

        let new_borrower = NewBorrower::new(phone, name, location);
        let borrower = self.borrower_repository.create(&new_borrower).await?;
        
        // Convertir la entidad del dominio a BorrowerModelResponse
        Ok(BorrowerModelResponse::from(borrower))
    }

    /// Obtener todos los borrowers - ahora retorna Vec<BorrowerModelResponse>
    pub async fn get_all_borrowers(&self) -> Result<Vec<BorrowerModelResponse>> {
        let borrowers = self.borrower_repository.find_all().await?;
        
        // Convertir cada entidad a BorrowerModelResponse
        let responses: Vec<BorrowerModelResponse> = borrowers
            .into_iter()
            .map(BorrowerModelResponse::from)
            .collect();
            
        Ok(responses)
    }

    /// Obtener borrower por ID - ahora retorna BorrowerModelResponse
    pub async fn get_borrower_by_id(&self, id: i32) -> Result<BorrowerModelResponse> {
        let borrower = self.borrower_repository
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("Prestatario con ID {} no encontrado", id)))?;
            
        Ok(BorrowerModelResponse::from(borrower))
    }

    /// Actualizar borrower - ahora retorna BorrowerModelResponse
    pub async fn update_borrower(&self, id: i32, request: UpdateBorrowerRequest) -> Result<BorrowerModelResponse> {
        // Verificar que el borrower existe
        let existing_borrower = self.borrower_repository
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("Prestatario con ID {} no encontrado", id)))?;

        // Si se está actualizando el teléfono, verificar que no exista otro con el mismo teléfono
        if let Some(phone) = &request.phone {
            if self.borrower_repository.exists_by_phone_excluding_id(phone, id).await? {
                return Err(AppError::Conflict(
                    "Ya existe un prestatario con este teléfono".to_string()
                ));
            }
        }

        // Crear borrower actualizado (entidad del dominio)
        let updated_borrower_entity = Borrower {
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

        let updated_borrower = self.borrower_repository.update(id, &updated_borrower_entity).await?;
        
        // Convertir a BorrowerModelResponse
        Ok(BorrowerModelResponse::from(updated_borrower))
    }

    /// Eliminar borrower
    pub async fn delete_borrower(&self, id: i32) -> Result<()> {
        // Verificar que el borrower existe
        self.borrower_repository
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("Prestatario con ID {} no encontrado", id)))?;
        
        self.borrower_repository.delete(id).await
    }
}