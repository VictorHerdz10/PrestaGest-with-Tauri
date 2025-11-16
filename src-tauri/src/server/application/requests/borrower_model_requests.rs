use serde::Deserialize;
use chrono::{DateTime, Utc};
use serde::Serialize;
use crate::server::domain::entities::borrower::Borrower;

#[derive(Debug, Serialize)]
pub struct BorrowerModelResponse {
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

impl From<Borrower> for BorrowerModelResponse {
    fn from(borrower: Borrower) -> Self {
        // Parsear las fechas de String (RFC3339) a DateTime<Utc>
        let created_at = DateTime::parse_from_rfc3339(&borrower.created_at)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| Utc::now());
            
        let updated_at = DateTime::parse_from_rfc3339(&borrower.updated_at)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| Utc::now());

        Self {
            id: borrower.id,
            phone: borrower.phone,
            name: borrower.name,
            location: borrower.location,
            total_loans: borrower.total_loans,
            total_paid: borrower.total_paid,
            balance: borrower.balance,
            status: borrower.status,
            created_at,
            updated_at,
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateBorrowerRequest {
    pub phone: String,
    pub name: String,
    pub location: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateBorrowerRequest {
    pub phone: Option<String>,
    pub name: Option<String>,
    pub location: Option<String>,
}