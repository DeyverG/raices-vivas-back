-- Schema SQL para PostgreSQL - Plataforma Raíces Vivas (MVP Sprint 1)

-- 1. Tabla de Usuarios con Cumplimiento de Ley 1581/2012 (RGPD) y Cifrado SHA-256
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash CHAR(64) NOT NULL, -- Almacena Hash SHA-256 en formato hex (64 caracteres)
    role VARCHAR(30) NOT NULL CHECK (role IN ('Visitante', 'Comunidad', 'Coordinador')),
    community_name VARCHAR(150),
    data_consent BOOLEAN NOT NULL DEFAULT FALSE, -- Registro explícito Ley 1581/2012
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Experiencias Turísticas Comunitarias
CREATE TABLE IF NOT EXISTS experiences (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    region VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    language VARCHAR(50) NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 10,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    includes JSONB DEFAULT '[]'::jsonb,
    host_community VARCHAR(150) NOT NULL,
    image_url TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
    created_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Solicitudes de Reserva
CREATE TABLE IF NOT EXISTS reservations (
    id VARCHAR(50) PRIMARY KEY,
    experience_id VARCHAR(50) NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    visitor_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visitor_name VARCHAR(150) NOT NULL,
    visitor_email VARCHAR(150) NOT NULL,
    host_community VARCHAR(150) NOT NULL,
    visit_date DATE NOT NULL,
    travelers_count INTEGER NOT NULL CHECK (travelers_count >= 1),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    special_requests TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'rechazada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bitácora Inmutable de Trazabilidad (RNF-010)
CREATE TABLE IF NOT EXISTS bitacora (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    entity_id VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    user_identifier VARCHAR(200) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL
);

-- 5. Registro de Notificaciones por Correo (HU-05-01)
CREATE TABLE IF NOT EXISTS email_notification_logs (
    id VARCHAR(50) PRIMARY KEY,
    recipient VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento para Búsquedas y Filtros (RNF Rendimiento < 2s)
CREATE INDEX IF NOT EXISTS idx_experiences_filters ON experiences(region, type, language, status);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status, visitor_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_entity ON bitacora(entity_id, timestamp);
