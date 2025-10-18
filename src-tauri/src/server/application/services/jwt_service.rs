use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use crate::utils::error::{Result, AppError};
use crate::server::presentation::middleware::jwt_middleware::UserPayload;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32,        // user id
    pub name: String,
    pub phone: String,
    pub role: String,
    pub exp: i64,        // expiry timestamp
}

// Implementar From/Into para convertir entre Claims y UserPayload
impl From<Claims> for UserPayload {
    fn from(claims: Claims) -> Self {
        Self {
            id: claims.sub,
            name: claims.name,
            phone: claims.phone,
            role: claims.role,
        }
    }
}

impl From<&UserPayload> for Claims {
    fn from(payload: &UserPayload) -> Self {
        let expiration = Utc::now()
            .checked_add_signed(Duration::days(7))
            .expect("valid timestamp")
            .timestamp();

        Self {
            sub: payload.id,
            name: payload.name.clone(),
            phone: payload.phone.clone(),
            role: payload.role.clone(),
            exp: expiration,
        }
    }
}

pub struct JwtService {
    secret: String,
}

impl JwtService {
    pub fn new(secret: String) -> Self {
        Self { secret }
    }

    pub fn generate_token_from_payload(&self, user_payload: &UserPayload) -> Result<String> {
        let claims: Claims = user_payload.into();
        
        encode(&Header::default(), &claims, &EncodingKey::from_secret(self.secret.as_ref()))
            .map_err(|e| AppError::ServerError(format!("Error generando token: {}", e)))
    }
    pub fn verify_token(&self, token: &str) -> Result<UserPayload> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.secret.as_ref()),
            &Validation::default(),
        ).map_err(|_e| AppError::AuthError(format!("Usuario no autorizado o token de acceso expirado-inválido", )))?;

        Ok(UserPayload::from(token_data.claims))
    }
}