use colored::Colorize;
use std::sync::Arc;
use once_cell::sync::OnceCell;

pub mod commands;
mod server;
mod utils;
mod config;

// Importaciones necesarias
#[allow(unused_imports)]
use tauri::{Manager, State};
use utils::error::Result;

use crate::server::infrastructure::database::connection::{DbPool, init_database};

/// Estado global de la aplicación que se comparte entre Tauri y el servidor
#[derive(Clone)]
pub struct AppState {
    pub config: config::Config,
    pub db: DbPool,
}

impl Default for AppState {
    fn default() -> Self {
        let config = config::Config::new();
        let db = init_database(&config.database.url)
            .expect("Failed to initialize database");
        
        Self {
            config,
            db,
        }
    }
}

//  ESTADO GLOBAL ACCESIBLE DESDE CUALQUIER LUGAR
static GLOBAL_APP_STATE: OnceCell<Arc<AppState>> = OnceCell::new();

/// Inicializa el estado global (debe llamarse una vez al inicio)
pub fn init_global_app_state() -> Result<()> {
    let app_state = AppState::default();
    GLOBAL_APP_STATE.set(Arc::new(app_state))
        .map_err(|_| utils::error::AppError::ConfigError("Global app state already initialized".to_string()))?;
    Ok(())
}

/// Obtiene el estado global de la aplicación
pub fn get_global_app_state() -> Arc<AppState> {
    GLOBAL_APP_STATE.get().expect("Global app state not initialized").clone()
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() -> Result<()> {
   // 1. Inicializar el estado global UNA sola vez
    init_global_app_state()?;
    let app_state = get_global_app_state();
    
    println!("{} {} en modo {}", 
        "Iniciando aplicación".green().bold(),
        app_state.config.app.name.cyan().bold(), 
        app_state.config.app.env.yellow()
    );
    
    // 2. Construir la aplicación Tauri
    tauri::Builder::default()
        // Plugin para abrir URLs externas
        .plugin(tauri_plugin_opener::init())
        // Configurar hooks cuando la aplicación esté lista
        .setup(|app| {
            println!("{}", "Aplicación Tauri inicializada correctamente".green());

            // 3. Iniciar el servidor Axum en un hilo de fondo asíncrono
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                println!("{}", "Iniciando servidor Axum en segundo plano...".blue());
                
                match server::start_server(app_handle).await {
                    Ok(_) => println!("{}", "Servidor Axum detenido correctamente".green()),
                    Err(e) => println!("{} {}", "❌ Error al iniciar el servidor Axum:".red(), e),
                }
            });

            Ok(())
        })
        // 4. Registrar todos los comandos invocables desde el frontend
        .invoke_handler(commands::get_all_commands())
        // 5. Ejecutar la aplicación
        .run(tauri::generate_context!())
        .expect("❌ Error mientras se ejecutaba la aplicación Tauri".red().to_string().as_str());

    Ok(())
}