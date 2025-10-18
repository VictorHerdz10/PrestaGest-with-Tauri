use dotenvy::dotenv;
use serde::Deserialize;
use std::env;

#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub cors_origins: Vec<String>,
    pub jwt_secret: String,
}

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub env: String,
    pub name: String,
    pub master_password: String,
}

#[derive(Debug, Clone)]
pub struct Config {
    pub server: ServerConfig,
    pub app: AppConfig,
    pub database: DatabaseConfig,
}

#[derive(Clone, Deserialize, Debug)]
pub struct DatabaseConfig {
    pub url: String,
}

impl Config {
    pub fn new() -> Self {
        dotenv().ok();

        let app_env = env::var("APP_ENV").unwrap_or_else(|_| {
            println!("⚠️  APP_ENV no encontrada, usando 'development'");
            "development".to_string()
        });

        let app_name = env::var("APP_NAME").unwrap_or_else(|_| {
            println!("⚠️  APP_NAME no encontrada, usando 'PrestaGest'");
            "prestagest".to_string()
        });

        let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| {
            println!("⚠️  SERVER_HOST no encontrada, usando '127.0.0.1'");
            "127.0.0.1".to_string()
        });
        let url_db = env::var("DATABASE_URL").unwrap_or_else(|_| {
            println!("⚠️  DATABASE_URL no encontrada, usando file:data/prestagest.db");
            "file:data/prestagest.db".to_string()
        });

        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| {
                println!("⚠️  SERVER_PORT no encontrada, usando '3000'");
                "3000".to_string()
            })
            .parse()
            .unwrap_or_else(|_| {
                println!("⚠️  SERVER_PORT inválida, usando 3000");
                3000
            });
        let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| {
            println!("⚠️  JWT_SECRET no encontrada, usando '12345678'");
            "12345678".to_string()
        });
        let master_password = env::var("MASTER_PASS").unwrap_or_else(|_| {
            println!("⚠️  MASTER_PASS no encontrada, usando 'KeyMaster123'");
            "KeyMaster123".to_string()
        });

        let cors_origins = env::var("SERVER_CORS_ORIGINS")
            .unwrap_or_else(|_| {
                println!("⚠️  SERVER_CORS_ORIGINS no encontrada, usando valores por defecto");
                "http://localhost:1420,http://localhost:8000".to_string()
            })
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| s != "undefined" && !s.is_empty())
            .collect();

        let config = Self {
            server: ServerConfig {
                host: server_host,
                port: server_port,
                cors_origins,
                jwt_secret,
            },
            app: AppConfig {
                env: app_env,
                name: app_name,
                master_password
            },
            database: DatabaseConfig { url: url_db },
        };
        config
    }

    pub fn server_address(&self) -> String {
        format!("{}:{}", self.server.host, self.server.port)
    }
}

impl Default for Config {
    fn default() -> Self {
        Self::new()
    }
}
