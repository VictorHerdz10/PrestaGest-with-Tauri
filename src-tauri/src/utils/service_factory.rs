use crate::get_global_app_state;
use crate::server::infrastructure::database::repositories::diesel_user_repository::DieselUserRepository;
use crate::server::application::use_cases::user_use_cases::UserUseCases;

pub struct ServiceFactory;

impl ServiceFactory {
    pub fn create_user_use_cases() -> UserUseCases<DieselUserRepository> {
        let app_state = get_global_app_state();
        
        let user_repository = DieselUserRepository::new(app_state.db.clone());
        
        UserUseCases::new(
            user_repository,
            app_state.config.server.jwt_secret.clone(),
            app_state.config.app.master_password.clone()
        )
    }
    
}