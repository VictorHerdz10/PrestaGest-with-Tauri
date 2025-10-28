use chrono::{DateTime, Utc};
use serde::Serialize;
use crate::server::domain::entities::borrower::Borrower;

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

impl From<Borrower> for BorrowerResponseDto {
    fn from(borrower: Borrower) -> Self {
        Self {
            id: borrower.id,
            phone: borrower.phone,
            name: borrower.name,
            location: borrower.location,
            total_loans: borrower.total_loans,
            total_paid: borrower.total_paid,
            balance: borrower.balance,
            status: borrower.status,
            created_at: borrower.created_at,
            updated_at: borrower.updated_at,
        }
    }
}
