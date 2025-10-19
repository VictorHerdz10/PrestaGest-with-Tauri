// middleware/rate_limit.rs
use axum::{
    extract::Request,
    http::{HeaderMap, StatusCode, HeaderValue},
    middleware::Next,
    response::{Response, Json},
};
use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};
use serde_json::json;

// Almacenamiento para rate limiting
#[derive(Clone)]
struct RateLimitStore {
    inner: Arc<Mutex<HashMap<String, RateLimitData>>>,
}

#[derive(Clone)]
struct RateLimitData {
    count: u32,
    window_start: Instant,
    block_start: Option<Instant>,
}

impl RateLimitStore {
    fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn check_rate_limit(&self, key: &str, limit: u32, window_seconds: u64) -> (bool, u64) {
        let mut store = self.inner.lock().unwrap();
        let now = Instant::now();
        let window = Duration::from_secs(window_seconds);

        if let Some(data) = store.get_mut(key) {
            // Verificar si la ventana de tiempo ha expirado
            if now.duration_since(data.window_start) > window {
                // RESET: Ventana expirada, empezar nuevo contador
                data.count = 1;
                data.window_start = now;
                data.block_start = None;
                (true, 0)
            } else if data.count < limit {
                // DENTRO DEL LÍMITE: Incrementar contador
                data.count += 1;
                data.block_start = None;
                (true, 0)
            } else {
                // LÍMITE EXCEDIDO
                if data.block_start.is_none() {
                    // PRIMERA VEZ que excede el límite - empezar bloqueo
                    data.block_start = Some(now);
                }
                
                // Calcular tiempo transcurrido desde que empezó el bloqueo
                let block_elapsed = now.duration_since(data.block_start.unwrap());
                let remaining_time = if block_elapsed.as_secs() < window_seconds {
                    window_seconds - block_elapsed.as_secs()
                } else {
                    // Bloqueo terminado, resetear
                    data.count = 1;
                    data.window_start = now;
                    data.block_start = None;
                    return (true, 0);
                };
                
                (false, remaining_time)
            }
        } else {
            // PRIMER REQUEST: Inicializar contador
            store.insert(key.to_string(), RateLimitData {
                count: 1,
                window_start: now,
                block_start: None,
            });
            (true, 0)
        }
    }
}

// Store global para rate limiting
lazy_static::lazy_static! {
    static ref RATE_LIMIT_STORE: RateLimitStore = RateLimitStore::new();
}

// Middleware para rate limiting normal (100 requests/min)
pub async fn normal_rate_limit(
    request: Request,
    next: Next,
) -> Response {
    rate_limit_middleware(request, next, 100, 60).await
}

// Middleware para rate limiting estricto (10 requests/min)
pub async fn strict_rate_limit(
    request: Request,
    next: Next,
) -> Response {
    rate_limit_middleware(request, next, 10, 60).await
}

// Middleware para autenticación (5 requests/min)
pub async fn auth_rate_limit(
    request: Request,
    next: Next,
) -> Response {
    rate_limit_middleware(request, next, 5, 60).await
}

// Middleware genérico de rate limiting
async fn rate_limit_middleware(
    request: Request,
    next: Next,
    limit: u32,
    window_seconds: u64,
) -> Response {
    // Extraer IP del cliente
    let client_id = extract_client_identifier(&request);
    
    // Verificar rate limit y obtener tiempo restante
    let (allowed, remaining_time) = RATE_LIMIT_STORE.check_rate_limit(&client_id, limit, window_seconds);
    
    if allowed {
        // Dentro del límite, continuar
        next.run(request).await
    } else {
        // Límite excedido - mensaje en español
        let error_response = Json(json!({
            "error": "Too Many Request",
            "mensaje": format!("Límite de tasa excedido. Por favor espere {} segundos", remaining_time),
            "retry_after": remaining_time
        }));

        // Crear headers
        let mut headers = HeaderMap::new();
        headers.insert("retry-after", HeaderValue::from_str(&remaining_time.to_string()).unwrap());
        headers.insert("x-ratelimit-after", HeaderValue::from_str(&remaining_time.to_string()).unwrap());

        // Construir respuesta manualmente
        let body = axum::body::Body::from(serde_json::to_string(&error_response.0).unwrap());
        
        let mut response = Response::new(body);
        *response.status_mut() = StatusCode::TOO_MANY_REQUESTS;
        
        // Agregar headers a la respuesta
        for (key, value) in headers {
            if let Some(key) = key {
                response.headers_mut().insert(key, value);
            }
        }

        // Log para monitoring
       // println!("[RATE LIMIT] Cliente: {}, Bloqueado por: {}s, Límite: {}/{}s", 
       //          client_id, remaining_time, limit, window_seconds);

        response
    }
}

// Extraer identificador del cliente - VERSIÓN MEJORADA
fn extract_client_identifier(request: &Request) -> String {
    // 1. Intentar extraer IP real del cliente
    if let Some(ip) = extract_real_ip(request) {
        return format!("ip_{}", ip);
    }

    // 2. Si no se puede obtener IP, usar identificador de sesión
    if let Some(session_id) = extract_session_id(request) {
        return format!("session_{}", session_id);
    }

    // 3. Si no hay sesión, usar token de autorización
    if let Some(token_id) = extract_token_id(request) {
        return format!("token_{}", token_id);
    }

    // 4. Último recurso: usar combinación de headers para identificar cliente
    let fallback_id = generate_fallback_id(request);
    format!("client_{}", fallback_id)
}

// Extraer IP real del cliente
fn extract_real_ip(request: &Request) -> Option<String> {
    // Headers comunes para IP real (en orden de prioridad)
    let ip_headers = [
        "x-forwarded-for",        // Proxy/reverse proxy
        "x-real-ip",              // Nginx
        "x-client-ip",            // Custom
        "cf-connecting-ip",       // Cloudflare
        "true-client-ip",         // Akamai
    ];

    for header_name in &ip_headers {
        if let Some(header_value) = request.headers().get(*header_name) {
            if let Ok(ip_str) = header_value.to_str() {
                if let Some(client_ip) = ip_str.split(',').next() {
                    let trimmed_ip = client_ip.trim();
                    if is_valid_ip(trimmed_ip) {
                        return Some(trimmed_ip.to_string());
                    }
                }
            }
        }
    }

    // IP del peer (última opción)
    if let Some(peer_addr) = request.extensions().get::<SocketAddr>() {
        let ip = peer_addr.ip().to_string();
        if is_valid_ip(&ip) {
            return Some(ip);
        }
    }

    None
}

// Verificar si es una IP válida
fn is_valid_ip(ip: &str) -> bool {
    !ip.is_empty() && 
    ip != "unknown" && 
    ip != "127.0.0.1" && 
    ip != "localhost" &&
    (ip.contains('.') || ip.contains(':')) // IPv4 o IPv6
}

// Extraer ID de sesión
fn extract_session_id(request: &Request) -> Option<String> {
    let session_headers = [
        "x-session-id",
        "session-id",
        "x-auth-token",
        "authorization",
    ];

    for header_name in &session_headers {
        if let Some(header_value) = request.headers().get(*header_name) {
            if let Ok(value_str) = header_value.to_str() {
                let trimmed = value_str.trim();
                if !trimmed.is_empty() && trimmed != "undefined" && trimmed != "null" {
                    // Para authorization header, tomar solo una parte
                    if *header_name == "authorization" {
                        if let Some(token) = trimmed.strip_prefix("Bearer ") {
                            if token.len() > 10 {
                                return Some(token[..10].to_string()); // Primeros 10 chars
                            }
                        }
                    } else {
                        return Some(trimmed.to_string());
                    }
                }
            }
        }
    }

    None
}

// Extraer ID de token
fn extract_token_id(request: &Request) -> Option<String> {
    if let Some(auth_header) = request.headers().get("authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if let Some(token) = auth_str.strip_prefix("Bearer ") {
                if token.len() >= 8 {
                    // Usar los últimos 8 caracteres del token como identificador
                    return Some(token[token.len()-8..].to_string());
                }
            }
        }
    }
    None
}

// Generar ID de fallback basado en headers
fn generate_fallback_id(request: &Request) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let user_agent = request.headers()
        .get("user-agent")
        .and_then(|ua| ua.to_str().ok())
        .unwrap_or("no_ua");

    let accept_language = request.headers()
        .get("accept-language")
        .and_then(|al| al.to_str().ok())
        .unwrap_or("no_lang");

    let accept_encoding = request.headers()
        .get("accept-encoding")
        .and_then(|ae| ae.to_str().ok())
        .unwrap_or("no_enc");

    // Crear hash único basado en los headers
    let mut hasher = DefaultHasher::new();
    user_agent.hash(&mut hasher);
    accept_language.hash(&mut hasher);
    accept_encoding.hash(&mut hasher);
    
    format!("{:x}", hasher.finish())[..8].to_string() // Primeros 8 chars del hash
}