use crate::server::domain::entities::user::{User, NewUser};
use crate::server::domain::repositories::user_repository::UserRepository;
use crate::server::application::services::auth_service::AuthService;
use crate::utils::error::Result;

pub struct UserUseCases<T: UserRepository> {
    auth_service: AuthService<T>,
    user_repository: T,
}

impl<T: UserRepository> UserUseCases<T> {
    pub fn new(user_repository: T) -> Self {
        let auth_service = AuthService::new(user_repository.clone());
        Self {
            auth_service,
            user_repository,
        }
    }

    /// Registrar nuevo usuario
    pub async fn register_user(&self, phone: String, name: String, password: String) -> Result<User> {
        let new_user = NewUser {
            phone,
            name,
            password,
            role:"".to_string()
        };
        
        self.auth_service.register(new_user).await
    }

   
   /// Login de usuario - ahora devuelve User y token por separado
    pub async fn login_user(&self, phone: String, password: String) -> Result<(User, String)> {
        self.auth_service.login(&phone, &password).await
    }

    /// Obtener usuario por ID
    pub async fn get_user_by_id(&self, user_id: i32) -> Result<Option<User>> {
        self.user_repository.find_by_id(user_id).await
    }

    /// Obtener usuario por teléfono
    pub async fn get_user_by_phone(&self, user_phone: &str) -> Result<Option<User>> {
        self.user_repository.find_by_phone(user_phone).await
    }
     pub async fn is_admin(&self, phone: &str) -> Result<bool> {
        self.auth_service.is_admin(phone).await
    }
}