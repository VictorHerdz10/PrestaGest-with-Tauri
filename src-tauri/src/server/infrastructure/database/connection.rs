use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use diesel::SqliteConnection;
use diesel::RunQueryDsl;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use colored::Colorize;
use std::path::Path;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

pub type DbPool = Pool<ConnectionManager<SqliteConnection>>;
pub type DbConnection = PooledConnection<ConnectionManager<SqliteConnection>>;  

pub fn init_database(database_url: &str) -> Result<DbPool, Box<dyn std::error::Error>> {
    let db_path = if database_url.starts_with("file:") {
        database_url.trim_start_matches("file:")
    } else {
        database_url
    };

    // Verificar y crear directorio si no existe
    if let Some(parent) = Path::new(db_path).parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent)?;
            println!("{} {}", "Directorio creado:".blue(), parent.display());
        } else {
            println!("{} {}", "Directorio ya existe:".green(), parent.display());
        }
    }

    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
     
    let pool = Pool::builder()
        .max_size(20) // Aumenta el tamaño del pool
        .min_idle(Some(5)) // Mantiene conexiones listas
        .test_on_check_out(true) // Verifica que las conexiones funcionen
        .build(manager)
        .expect("Failed to create pool");
    // Ejecutar migraciones
    let mut conn = pool.get()?;
    run_migrations(&mut conn)?;
    
    println!("{} {}", "Base de datos inicializada:".green(), db_path);
    
    Ok(pool)
}

fn run_migrations(conn: &mut DbConnection) -> Result<(), Box<dyn std::error::Error>> {
    println!("{}", "Ejecutando migraciones...".yellow());
    // Activar WAL para mejor rendimiento
    diesel::sql_query("PRAGMA journal_mode=WAL;").execute(conn)?;
    diesel::sql_query("PRAGMA synchronous=NORMAL;").execute(conn)?;
    diesel::sql_query("PRAGMA cache_size=-64000;").execute(conn)?; // 64MB cache
    
    println!("{}", "🔧 SQLite optimizado con WAL".green());
    
    let migration_output = conn.run_pending_migrations(MIGRATIONS)
        .expect("Failed to run migrations");
    
    if migration_output.is_empty() {
        println!("{}", "No hay migraciones pendientes".green());
    } else {
        println!("{} migración(es) aplicada(s)", migration_output.len());
        for migration in migration_output {
            println!("   - {}", migration);
        }
    }
    
    Ok(())
}