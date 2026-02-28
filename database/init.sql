-- =============================================
-- PlagaControl - Script de inicialización PostgreSQL
-- Sistema de control y reporte de plagas agrícolas
-- =============================================

-- Extensión para UUID (opcional, Sequelize usa id serial)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Extensión para hash bcrypt compatible con Node bcryptjs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    experiencia VARCHAR(50) DEFAULT 'Principiante',
    tipo_cultivo VARCHAR(100),
    avatar_url VARCHAR(500),
    rol VARCHAR(50) DEFAULT 'usuario',
    mfa_secret VARCHAR(500),
    mfa_code VARCHAR(10),
    mfa_expires_at TIMESTAMP WITH TIME ZONE,
    mfa_attempts INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: reportes (reportes de plagas con ubicación y foto)
CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    imagen_url VARCHAR(500),
    estado VARCHAR(50) DEFAULT 'Pendiente',
    tipo_plaga VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: comentarios (comentarios en reportes)
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: foro (temas del foro)
CREATE TABLE IF NOT EXISTS foro (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(300) NOT NULL,
    contenido TEXT NOT NULL,
    categoria VARCHAR(100),
    ayudas_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: respuestas (respuestas en temas del foro)
CREATE TABLE IF NOT EXISTS respuestas (
    id SERIAL PRIMARY KEY,
    foro_id INTEGER NOT NULL REFERENCES foro(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    ayudas_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: guias (guías de plagas - información técnica)
CREATE TABLE IF NOT EXISTS guias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_plaga VARCHAR(100),
    informacion_tecnica TEXT,
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_created ON reportes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_reporte ON comentarios(reporte_id);
CREATE INDEX IF NOT EXISTS idx_foro_usuario ON foro(usuario_id);
CREATE INDEX IF NOT EXISTS idx_foro_categoria ON foro(categoria);
CREATE INDEX IF NOT EXISTS idx_respuestas_foro ON respuestas(foro_id);
CREATE INDEX IF NOT EXISTS idx_guias_tipo ON guias(tipo_plaga);

-- Usuario por defecto para iniciar sesión (contraseña: 123456)
INSERT INTO usuarios (email, password_hash, nombre, apellido, experiencia, tipo_cultivo, rol) VALUES
('admin@plagacontrol.com', crypt('123456', gen_salt('bf', 10)), 'Admin', 'PlagaControl', 'Avanzado', 'Varios', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Datos iniciales: guías de ejemplo
INSERT INTO guias (titulo, descripcion, tipo_plaga, informacion_tecnica) VALUES
('Pulgón en cultivos', 'Control y prevención del pulgón en hortalizas y cereales.', 'Pulgón', 'Aplicar jabón potásico o aceite de neem. Evitar exceso de nitrógeno. Favorecer fauna auxiliar (mariquitas).'),
('Mildiu en vid', 'Identificación y tratamiento del mildiu en viñedos.', 'Mildiu', 'Fungicidas cúpricos preventivos. Buena ventilación. Eliminar restos infectados.'),
('Mosca blanca', 'Manejo integrado de mosca blanca en invernaderos.', 'Mosca blanca', 'Trampas cromáticas amarillas. Control biológico con Encarsia. Evitar estrés hídrico.')
;

COMMENT ON TABLE usuarios IS 'Usuarios del sistema PlagaControl';
COMMENT ON TABLE reportes IS 'Reportes de plagas con ubicación GPS y foto';
COMMENT ON TABLE comentarios IS 'Comentarios en reportes';
COMMENT ON TABLE foro IS 'Temas del foro comunitario';
COMMENT ON TABLE respuestas IS 'Respuestas a temas del foro';
COMMENT ON TABLE guias IS 'Guías técnicas de plagas';
