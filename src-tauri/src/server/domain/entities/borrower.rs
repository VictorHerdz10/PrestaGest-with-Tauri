#[derive(Debug, Clone)]
pub struct Borrower {
    pub id: i32,
    pub phone: String,
    pub name: String,
    pub location: String,
    pub total_loans: f64,
    pub total_paid: f64,
    pub balance: f64,
    pub status: String,
    pub created_at: String,  // Cambiar a String
    pub updated_at: String,  // Cambiar a String
}

#[derive(Debug, Clone)]
pub struct NewBorrower {
    pub phone: String,
    pub name: String,
    pub location: String,
}

/*impl Borrower {
    pub fn new(
        id: i32,
        phone: String,
        name: String,
        location: String,
        total_loans: f64,
        total_paid: f64,
        balance: f64,
        status: String,
        created_at: DateTime<Utc>,
        updated_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id,
            phone,
            name,
            location,
            total_loans,
            total_paid,
            balance,
            status,
            created_at,
            updated_at,
        }
    }
}*/

impl NewBorrower {
    pub fn new(phone: String, name: String, location: String) -> Self {
        Self {
            phone,
            name,
            location,
        }
    }
}