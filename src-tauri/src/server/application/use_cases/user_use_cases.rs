use crate::server::application::requests::auth_model_requests::{LoginUserRequest, RegisterUserRequest};
use crate::server::domain::entities::user::{NewUser, User, UserPayload};
use crate::server::domain::repositories::user_repository::UserRepository;
use crate::server::application::services::{auth_service::AuthService,jwt_service::JwtService};
use crate::utils::error::Result;
use crate::utils::AppError;

#[derive(Clone)]
pub struct UserUseCases<T: UserRepository> {
    auth_service: AuthService,
    jwt_service: JwtService,
    user_repository: T,
}

impl<T: UserRepository> UserUseCases<T> {
    pub fn new(user_repository: T, jwt_secret: String, master_password: String) -> Self {
        let auth_service = AuthService::new(master_password);
        let jwt_service = JwtService::new(jwt_secret);
        Self {
            jwt_service,
            auth_service,
            user_repository,
        }
    }

    /// Registrar nuevo usuario
    pub async fn register_user(&self, request:RegisterUserRequest) -> Result<User> {
        let RegisterUserRequest { phone, name, password } = request;
        // Verificar si usuario ya existe
        if self.user_repository.find_by_phone(&phone).await?.is_some() {
            return Err(AppError::Conflict(
                "Ya existe una cuenta con este teléfono".to_string()
            ));
        }

        let role = self.auth_service.assign_role(&phone);
        let hashed_password = self.auth_service.hash_password(&password)?;

        let new_user = NewUser {
            phone,
            name,
            password: hashed_password,
            role,
        };
        
        self.user_repository.create(new_user).await
    }

    /// Login de usuario
    pub async fn login_user(&self, request:LoginUserRequest) -> Result<(User, String)> {
         let LoginUserRequest { phone, password } = request;
        let user = self.user_repository
            .find_by_phone(&phone)
            .await?
            .ok_or_else(|| AppError::NotFound("Usuario no encontrado".to_string()))?;

        // Verificar credenciales
        let is_valid = self.auth_service.verify_credentials(&user, &password)?;

        if !is_valid {
            return Err(AppError::AuthError("Contraseña incorrecta".to_string()));
        }

        // Generar token JWT
        let user_payload = UserPayload::new(
            user.id,
            user.name.clone(),
            user.phone.clone(),
            user.role.clone(),
        );
        
        let token = self.jwt_service.generate_token_from_payload(&user_payload)?;

        Ok((user, token))
    }

    /// Obtener usuario por ID
    pub async fn get_user_by_id(&self, user_id: i32) -> Result<Option<User>> {
        self.user_repository.find_by_id(user_id).await
    }

    /// Obtener usuario por teléfono
    pub async fn get_user_by_phone(&self, user_phone: &str) -> Result<Option<User>> {
        self.user_repository.find_by_phone(user_phone).await
    }

    /// Verificar si un usuario es admin
    pub async fn is_admin(&self, phone: &str) -> Result<bool> {
        let user = self.user_repository.find_by_phone(phone).await?;
        Ok(user.map(|u| u.role == "admin").unwrap_or(false))
    }

    /// Verificar token JWT
    pub fn verify_token(&self, token: &str) -> Result<UserPayload> {
        self.jwt_service.verify_token(token)
    }
}