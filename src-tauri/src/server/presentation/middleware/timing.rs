use axum::{
    http::{Request, Response},
    middleware::Next,
    body::Body,
};

pub async fn timing_middleware(
    req: Request<Body>,
    next: Next,
) -> Response<Body> {
    let start = std::time::Instant::now();
    let path = req.uri().path().to_string();
    let method = req.method().clone();

    let response = next.run(req).await;

    let duration = start.elapsed();
    
    if duration.as_millis() > 1000 {
        println!("🚨 PETICIÓN LENTA: {} {} - {:?}", method, path, duration);
    } else {
        println!("⏱️  {} {} - {:?}", method, path, duration);
    }

    response
}