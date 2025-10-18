use colored::Colorize;
pub mod application;
pub mod domain;
pub mod infrastructure;
pub mod presentation;
pub mod routes;
pub use routes::configure_routes;

use axum::Router;
use std::net::SocketAddr;
#[allow(unused_imports)]
use tauri::{AppHandle, Manager};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

use crate::get_global_app_state;

/// Inicia el servidor Axum usando configuración desde el estado compartido
pub async fn start_server(_app_handle: AppHandle) -> Result<(), std::io::Error> {
    
       let app_state = get_global_app_state();
    let config = &app_state.config;

    // Configurar CORS dinámicamente desde la configuración
    let cors = CorsLayer::new()
        .allow_origin(
            config.server.cors_origins
                .iter()
                .map(|origin| origin.parse().unwrap())
                .collect::<Vec<_>>() 
        )
        .allow_methods(Any)
        .allow_headers(Any);

     // Configurar las rutas de la aplicación
    let app = Router::new().merge(configure_routes()).layer(cors);

    // Usar dirección desde la configuración
    let addr: SocketAddr = config
        .server_address()
        .parse()
        .expect("Invalid server address");

    println!("{} http://{}", "Servidor Axum iniciando en".blue(), addr.to_string().cyan().bold());

    // Crear el TcpListener
    let listener = TcpListener::bind(addr).await?;

    // Iniciar servidor
    axum::serve(listener, app).await.map_err(|e| {
        println!("{} {}", "❌ Error del servidor Axum:".red(), e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })
}