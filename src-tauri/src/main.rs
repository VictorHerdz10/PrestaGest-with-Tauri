// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use prestagest_lib::run;
use log::error;

#[tokio::main]
async fn main() {
    if let Err(e) = run().await {
        error!("❌ Error fatal al ejecutar la aplicación: {}", e);
        std::process::exit(1);
    }
}
