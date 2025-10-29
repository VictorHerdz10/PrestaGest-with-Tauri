use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use validator::Validate;

use crate::{
    server::{
        application::{
            requests::borrower_model_requests::{CreateBorrowerRequest, UpdateBorrowerRequest},
            use_cases::borrower_use_cases::BorrowerUseCases,
        },
        domain::repositories::borrower_repository::BorrowerRepository,
    },
    utils::error::{AppError, Result},
};

use super::super::dtos::{
    requests::borrower_request_dto::{CreateBorrowerRequestDto, UpdateBorrowerRequestDto},
    responses::{api_response::ApiResponse, borrower_responses::BorrowerResponseDto},
};

/// Crear un nuevo prestatario
pub async fn create_borrower<T>(
    State(borrower_use_cases): State<BorrowerUseCases<T>>,
    Json(payload): Json<CreateBorrowerRequestDto>,
) -> Result<impl IntoResponse>
where
    T: BorrowerRepository,
{
    // Validar el payload del cliente
    payload.validate().map_err(AppError::from)?;

    // Mapear DTO a Model Request para uso interno
    let create_request = CreateBorrowerRequest {
        phone: payload.phone,
        name: payload.name,
        location: payload.location,
    };

    let borrower = borrower_use_cases.create_borrower(create_request).await?;

    let response = ApiResponse::created(format!(
        "Prestatario {} registrado exitosamente",
        borrower.name
    ));
    Ok((StatusCode::CREATED, Json(json!(response))))
}

/// Obtener todos los prestatarios
pub async fn get_all_borrowers<T>(
    State(borrower_use_cases): State<BorrowerUseCases<T>>,
) -> Result<Json<Vec<BorrowerResponseDto>>>
where
    T: BorrowerRepository,
{
    let borrowers = borrower_use_cases.get_all_borrowers().await?;

    let response_dtos: Vec<BorrowerResponseDto> = borrowers
        .into_iter()
        .map(BorrowerResponseDto::from)
        .collect();

    Ok(Json(response_dtos))
}

/// Obtener un prestatario por ID
pub async fn get_borrower_by_id<T>(
    State(borrower_use_cases): State<BorrowerUseCases<T>>,
    Path(id): Path<i32>,
) -> Result<Json<BorrowerResponseDto>>
where
    T: BorrowerRepository,
{
    let borrower = borrower_use_cases.get_borrower_by_id(id).await?;

    Ok(Json(BorrowerResponseDto::from(borrower)))
}

/// Actualizar un prestatario
pub async fn update_borrower<T>(
    State(borrower_use_cases): State<BorrowerUseCases<T>>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateBorrowerRequestDto>,
) -> Result<Json<BorrowerResponseDto>>
where
    T: BorrowerRepository,
{
    // Validar el payload del cliente si tiene campos
    if payload.phone.is_some() || payload.name.is_some() || payload.location.is_some() {
        payload.validate().map_err(AppError::from)?;
    }

    // Mapear DTO a Model Request para uso interno
    let update_request = UpdateBorrowerRequest {
        phone: payload.phone,
        name: payload.name,
        location: payload.location,
    };

    let updated_borrower = borrower_use_cases
        .update_borrower(id, update_request)
        .await?;

    Ok(Json(BorrowerResponseDto::from(updated_borrower)))
}

/// Eliminar un prestatario
pub async fn delete_borrower<T>(
    State(borrower_use_cases): State<BorrowerUseCases<T>>,
    Path(id): Path<i32>,
) -> Result<impl IntoResponse>
where
    T: BorrowerRepository,
{
    borrower_use_cases.delete_borrower(id).await?;

    let response = ApiResponse::ok("Prestatario eliminado exitosamente".to_string());

    Ok((StatusCode::OK, Json(json!(response))))
}
