use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::fmt;

/// Tipo de error personalizado para la aplicación
#[derive(Debug)]
pub enum AppError {
    /// Errores de base de datos
    DatabaseError(String),
    /// Errores de configuración
    ConfigError(String),
    /// Errores del servidor HTTP
    ServerError(String),
    /// Errores de validación - ahora contiene un vector de mensajes
    ValidationError(Vec<String>),
    /// Errores de autenticación
    AuthError(String),
    /// Errores generales de IO
    IoError(std::io::Error),
    /// Recurso no encontrado
    NotFound(String),
    /// Conflicto - recurso ya existe
    Conflict(String),
    /// Errores de permisos
    Forbidden(String),
    /// Demasiadas peticiones
    TooManyRequests(String),
}

fn extract_validation_messages(error: &validator::ValidationErrors) -> Vec<String> {
    error
        .field_errors()
        .iter()
        .flat_map(|(field, errors)| {
            errors.iter().map(move |error| {
                // Solo devolvemos el mensaje sin el nombre del campo
                if let Some(message) = &error.message {
                    message.to_string()
                } else {
                    format!("Validation failed for {}", field)
                }
            })
        })
        .collect()
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            AppError::ConfigError(msg) => write!(f, "Configuration error: {}", msg),
            AppError::ServerError(msg) => write!(f, "Server error: {}", msg),
            AppError::ValidationError(messages) => {
                write!(f, "Validation errors: {}", messages.join(", "))
            }
            AppError::AuthError(msg) => write!(f, "Authentication error: {}", msg),
            AppError::IoError(err) => write!(f, "IO error: {}", err),
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AppError::Conflict(msg) => write!(f, "Conflict: {}", msg),
            AppError::Forbidden(msg) => write!(f, "Forbidden: {}", msg),
            AppError::TooManyRequests(msg) => write!(f, "Too Many Requests: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

// Conversión desde std::io::Error
impl From<std::io::Error> for AppError {
    fn from(error: std::io::Error) -> Self {
        AppError::IoError(error)
    }
}

// Conversión para errores de Diesel
impl From<diesel::result::Error> for AppError {
    fn from(error: diesel::result::Error) -> Self {
        match error {
            diesel::result::Error::NotFound => AppError::NotFound("Resource not found".to_string()),
            _ => AppError::DatabaseError(format!("Database error: {}", error)),
        }
    }
}

// Conversión para errores del pool de conexiones
impl From<r2d2::Error> for AppError {
    fn from(error: r2d2::Error) -> Self {
        AppError::DatabaseError(format!("Connection pool error: {}", error))
    }
}

// Conversión para errores de validación - usa la función auxiliar
impl From<validator::ValidationErrors> for AppError {
    fn from(error: validator::ValidationErrors) -> Self {
        AppError::ValidationError(extract_validation_messages(&error))
    }
}

// Implementación para Axum - Respuestas HTTP más detalladas
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::ValidationError(messages) => {
                let body = Json(json!({
                    "statusCode": StatusCode::BAD_REQUEST.as_u16(),
                    "message": messages,
                    "error": "validation_error",
                }));
                (StatusCode::BAD_REQUEST, body).into_response()
            }
            _ => {
                let (status, error_message, error_type) = match self {
                    // 500 - Internal Server Error
                    AppError::DatabaseError(msg) => {
                        (StatusCode::INTERNAL_SERVER_ERROR, msg, "database_error")
                    }
                    AppError::ConfigError(msg) => {
                        (StatusCode::INTERNAL_SERVER_ERROR, msg, "config_error")
                    }
                    AppError::ServerError(msg) => {
                        (StatusCode::INTERNAL_SERVER_ERROR, msg, "server_error")
                    }
                    AppError::IoError(err) => (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        err.to_string(),
                        "io_error",
                    ),

                    // 400 - Bad Request (otros)
                    AppError::ValidationError(_) => unreachable!(), // Ya manejado arriba

                    // 401 - Unauthorized (solo problemas de autenticación)
                    AppError::AuthError(msg) => (StatusCode::UNAUTHORIZED, msg, "auth_error"),

                    // 404 - Not Found
                    AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg, "not_found"),

                    // 409 - Conflict (recurso ya existe)
                    AppError::Conflict(msg) => (StatusCode::CONFLICT, msg, "conflict"),
                    // 403 - Forbidden (sin permisos)
                    AppError::Forbidden(msg) => (StatusCode::FORBIDDEN, msg, "forbidden"),
                    // 429 - Too Many Requests (límite excedido)
                    AppError::TooManyRequests(msg) => {
                        (StatusCode::TOO_MANY_REQUESTS, msg, "too_many_requests")
                    }
                };

                let body = Json(json!({
                    "statusCode": status.as_u16(),
                    "message": error_message,
                    "error": error_type,
                }));

                (status, body).into_response()
            }
        }
    }
}

// Función pública para usar en los controladores si es necesario
pub fn _validation_errors_from_validator(error: validator::ValidationErrors) -> AppError {
    AppError::ValidationError(extract_validation_messages(&error))
}

// Tipo Result personalizado para toda la aplicación
pub type Result<T> = std::result::Result<T, AppError>;