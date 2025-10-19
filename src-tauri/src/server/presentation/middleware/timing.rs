use axum::{
    http::{Request, Response},
    middleware::Next,
    body::Body,
};
use colored::*;

pub async fn timing_middleware(
    req: Request<Body>,
    next: Next,
) -> Response<Body> {
    let start = std::time::Instant::now();
    let path = req.uri().path().to_string();
    let method = req.method().clone();

    let response = next.run(req).await;

    let duration = start.elapsed();
    
    // Colores para los métodos HTTP
    let method_colored = match method.as_str() {
        "GET" => method.to_string().bright_blue().bold(),
        "POST" => method.to_string().bright_green().bold(),
        "PUT" => method.to_string().bright_yellow().bold(),
        "PATCH" => method.to_string().bright_magenta().bold(),
        "DELETE" => method.to_string().bright_red().bold(),
        "OPTIONS" => method.to_string().bright_cyan().bold(),
        "HEAD" => method.to_string().bright_white().bold(),
        _ => method.to_string().white().bold(),
    };

    // Color para la ruta
    let path_colored = path.bright_green();

    // Color para el tiempo según la duración
    let duration_colored = if duration.as_millis() < 100 {
        // Muy rápido: verde
        format!("{:?}", duration).bright_green()
    } else if duration.as_millis() < 500 {
        // Rápido: amarillo
        format!("{:?}", duration).bright_yellow()
    } else if duration.as_millis() < 1000 {
        // Normal: naranja
        format!("{:?}", duration).bright_red()
    } else {
        // Lento: rojo brillante
        format!("{:?}", duration).red().bold()
    };

    // Icono según la velocidad
    let icon = if duration.as_millis() < 100 {
        "⚡"  // Rayo para muy rápido
    } else if duration.as_millis() < 500 {
        "🚀"  // Cohete para rápido
    } else if duration.as_millis() < 1000 {
        "⏱️ " // Reloj para normal
    } else {
        "🐌"  // Caracol para lento
    };

    // Status code colorizado
    let status_code = response.status().as_u16();
    let status_colored = if status_code >= 200 && status_code < 300 {
        status_code.to_string().bright_green().bold()  // Verde para éxito
    } else if status_code >= 300 && status_code < 400 {
        status_code.to_string().bright_blue().bold()   // Azul para redirección
    } else if status_code >= 400 && status_code < 500 {
        status_code.to_string().bright_yellow().bold() // Amarillo para client error
    } else {
        status_code.to_string().bright_red().bold()    // Rojo para server error
    };

    if duration.as_millis() > 1000 {
        // Peticiones lentas con formato especial
        println!(
            "{} {} {} {} {} {}",
            "🚨".red().bold(),
            "LENTA:".red().bold(),
            method_colored,
            path_colored,
            duration_colored,
            format!("(Status: {})", status_colored).dimmed()
        );
    } else {
        // Peticiones normales
        println!(
            "{} {} {} {} {}",
            icon,
            method_colored,
            path_colored,
            duration_colored,
            format!("(Status: {})", status_colored).dimmed()
        );
    }

    response
}