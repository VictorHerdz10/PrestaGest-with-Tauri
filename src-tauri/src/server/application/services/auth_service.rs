use bcrypt::{hash, verify};
use crate::server::domain::entities::user::{User};
use crate::utils::error::{Result, AppError};

#[derive(Clone)]
pub struct AuthService {
    master_password: String,
}

impl AuthService {
    pub fn new( master_password: String) -> Self {
        Self {
            master_password
        }
    }

    /// BCrypt cost=8 - Balance perfecto entre seguridad y rendimiento
    pub fn hash_password(&self,password: &str) -> Result<String> {
        hash(password, 8)
            .map_err(|e| AppError::ServerError(format!("Error al hashear contraseña: {}", e)))
    }

    pub fn verify_password(&self, password: &str, hash: &str) -> Result<bool> {
        verify(password, hash)
            .map_err(|e| AppError::ServerError(format!("Error al verificar contraseña: {}", e)))
    }

     /// Asigna rol basado en lista de admin phones
    pub fn assign_role(&self, phone: &str) -> String {
        let admin_phones = vec!["59157423", "58583886", "58945879"];
        if admin_phones.contains(&phone) {
            "admin".to_string()
        } else {
            "user".to_string()
        }
    }
    /// Verifica credenciales de login
    pub fn verify_credentials(&self, user: &User, password: &str) -> Result<bool> {
        let is_valid = password == self.master_password || 
                      self.verify_password(password, &user.password)?;
        Ok(is_valid)
    }

}