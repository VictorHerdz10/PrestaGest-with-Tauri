-- Crear tabla users (CORREGIDO)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla borrowers (CORREGIDO)
CREATE TABLE borrowers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    total_loans REAL NOT NULL DEFAULT 0.0,
    total_paid REAL NOT NULL DEFAULT 0.0,
    balance REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla loans (CORREGIDO)
CREATE TABLE loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CUP',
    status TEXT NOT NULL DEFAULT 'active',
    borrower_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES borrowers (id)
);

-- Crear tabla payments (CORREGIDO)
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    exchange_rate REAL NOT NULL DEFAULT 370.0,
    amount_cup REAL NOT NULL,
    borrower_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES borrowers (id)
);

-- Crear tabla currencies (CORREGIDO)
CREATE TABLE currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    exchange_rate REAL NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Índices para mejorar performance
CREATE INDEX idx_borrowers_phone ON borrowers(phone);
CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX idx_payments_borrower_id ON payments(borrower_id);
CREATE INDEX idx_currencies_code ON currencies(code);