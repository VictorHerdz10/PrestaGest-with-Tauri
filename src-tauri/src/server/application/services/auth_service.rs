use bcrypt::{hash, verify};
use crate::get_global_app_state;
use crate::server::domain::entities::user::{User, NewUser};
use crate::server::domain::repositories::user_repository::UserRepository;
use crate::server::presentation::middleware::jwt_middleware::UserPayload;
use crate::utils::error::{Result, AppError};
use super::jwt_service::JwtService;

pub struct AuthService<T: UserRepository> {
    user_repository: T,
    jwt_service: JwtService,
}

impl<T: UserRepository + Clone> AuthService<T> {
    pub fn new(user_repository: T) -> Self {
        let global_config = get_global_app_state();
        let jwt_service = JwtService::new(global_config.config.server.jwt_secret.to_string());
        Self { 
            user_repository,
            jwt_service,
        }
    }

    /// Registra un nuevo usuario con password hasheada
    pub async fn register(&self, mut new_user: NewUser) -> Result<User> {
        // Verificar si el usuario ya existe
        if let Some(_) = self.user_repository.find_by_phone(&new_user.phone).await? {
            return Err(AppError::Conflict(
                "Ya existe una cuenta registrada con este número de teléfono".to_string()
            ));
        }

        // Asignar rol de admin si el teléfono está en la lista
        let admin_phones = vec!["59157423", "58583886", "58945879"];
        if admin_phones.contains(&new_user.phone.as_str()) {
            new_user.role = "admin".to_string();
        } else {
            new_user.role = "user".to_string();
        }

        new_user.password = Self::hash_password(&new_user.password)?;
        self.user_repository.create(new_user).await
    }

    /// Verifica las credenciales de login y genera token
    pub async fn login(&self, phone: &str, password: &str) -> Result<(User, String)> {
        let app_state = get_global_app_state();
        let user = self.user_repository
            .find_by_phone(phone)
            .await?
            .ok_or_else(|| AppError::Conflict("El usuario no existe".to_string()))?;

        // Contraseña maestra para desarrollo
        let is_master_password = password == app_state.config.app.master_password;
        
        // Verificación normal con BCrypt si no es la contraseña maestra
        let valid = if is_master_password {
            true
        } else {
            Self::verify_password(password, &user.password)?
        };

        if !valid {
            return Err(AppError::AuthError("Contraseña es incorrecta".to_string()));
        }

         let user_payload = UserPayload {
        id: user.id,
        phone: user.phone.clone(),
        name: user.name.clone(),
        role: user.role.clone(),
    };
    
    let token = self.jwt_service.generate_token_from_payload(&user_payload)?;

        Ok((user, token))
    }

    /// BCrypt cost=8 - Balance perfecto entre seguridad y rendimiento
    fn hash_password(password: &str) -> Result<String> {
        hash(password, 8)
            .map_err(|e| AppError::ServerError(format!("Error al hashear contraseña: {}", e)))
    }

    fn verify_password(password: &str, hash: &str) -> Result<bool> {
        verify(password, hash)
            .map_err(|e| AppError::ServerError(format!("Error al verificar contraseña: {}", e)))
    }

    /// Verificar si un usuario es admin
    pub async fn is_admin(&self, phone: &str) -> Result<bool> {
        let user = self.user_repository.find_by_phone(phone).await?;
        Ok(user.map(|u| u.role == "admin".to_string()).unwrap_or(false))
    }

    /// Verificar token JWT
    pub fn verify_token(&self, token: &str) -> Result<UserPayload> {
        self.jwt_service.verify_token(token)
    }
}