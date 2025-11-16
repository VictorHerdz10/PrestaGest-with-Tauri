use chrono::{DateTime, Utc};
use serde::Serialize;
use crate::server::application::requests::borrower_model_requests::BorrowerModelResponse;

#[derive(Debug, Serialize)]
pub struct BorrowerResponseDto {
    pub id: i32,
    pub phone: String,
    pub name: String,
    pub location: String,
    pub total_loans: f64,
    pub total_paid: f64,
    pub balance: f64,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<BorrowerModelResponse> for BorrowerResponseDto {
    fn from(dto: BorrowerModelResponse) -> Self {
        Self {
            id: dto.id,
            phone: dto.phone,
            name: dto.name,
            location: dto.location,
            total_loans: dto.total_loans,
            total_paid: dto.total_paid,
            balance: dto.balance,
            status: dto.status,
            created_at: dto.created_at,
            updated_at: dto.updated_at,
        }
    }
}