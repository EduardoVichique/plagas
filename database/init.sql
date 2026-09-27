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

-- Tabla: predicciones (historial de escaneo de plagas con IA)
CREATE TABLE IF NOT EXISTS predicciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    imagen_url VARCHAR(500) NOT NULL,
    plaga_detectada VARCHAR(100) NOT NULL,
    confianza DECIMAL(5, 2) NOT NULL,
    modelo_usado VARCHAR(100) NOT NULL,
    tiempo_ejecucion VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_created ON reportes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predicciones_usuario ON predicciones(usuario_id);
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
('Mosca blanca', 'Manejo integrado de mosca blanca en invernaderos.', 'Mosca blanca', 'Trampas cromáticas amarillas. Control biológico con Encarsia. Evitar estrés hídrico.');

-- Datos iniciales: reportes epidemiológicos en México para el mapa de calor
INSERT INTO reportes (usuario_id, titulo, descripcion, latitud, longitud, estado, tipo_plaga) VALUES
(1, 'Brote de Pulgón verde', 'Alta infestación observada en cultivo de maíz en Culiacán', 24.80910000, -107.39400000, 'Pendiente', 'Pulgón'),
(1, 'Presencia de Mildiu en parcela', 'Hojas amarillentas y moho en viñedo cerca de Ensenada', 31.86670000, -116.59640000, 'En revisión', 'Mildiu'),
(1, 'Mosca blanca en invernadero', 'Alta densidad de mosca blanca en tomate en Zamora', 19.98330000, -102.28330000, 'Pendiente', 'Mosca blanca'),
(1, 'Gusano cogollero detectado', 'Daño severo en follaje de maíz en Celaya', 20.52390000, -100.81570000, 'Confirmado', 'Gusano cogollero'),
(1, 'Foco de Pulgón en cítricos', 'Infestación moderada en hortalizas en Martínez de la Torre', 20.06330000, -97.05470000, 'Resuelto', 'Pulgón'),
(1, 'Mosca de la fruta en mango', 'Presencia de larva en cultivos de mango en Tapachula', 14.90420000, -92.26250000, 'Pendiente', 'Mosca de la fruta'),
(1, 'Mildiu en cultivo de papa', 'Manchas foliares marrón oscuras en Toluca', 19.28260000, -99.65570000, 'En revisión', 'Mildiu'),
(1, 'Mosca blanca en calabacita', 'Alta presencia de vectores en valle de Ciudad Obregón', 27.48630000, -109.94080000, 'Confirmado', 'Mosca blanca'),
(1, 'Pulgón negro en aguacate', 'Infestación inicial en huerta orgánica en Uruapan', 19.41440000, -102.05250000, 'Pendiente', 'Pulgón'),
(1, 'Gusano soldado en sorgo', 'Afectación parcelaria en Matamoros', 25.86940000, -97.50280000, 'Resuelto', 'Gusano cogollero'),
(1, 'Mildiu velloso en hortalizas', 'Foco infeccioso post-lluvia en Tehuacán', 18.46060000, -97.39270000, 'Pendiente', 'Mildiu'),
(1, 'Pulgón amarillo en caña', 'Foco de alerta fitosanitaria en Córdoba', 18.89420000, -96.93530000, 'Confirmado', 'Pulgón')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE usuarios IS 'Usuarios del sistema PlagaControl';
COMMENT ON TABLE reportes IS 'Reportes de plagas con ubicación GPS y foto';
COMMENT ON TABLE comentarios IS 'Comentarios en reportes';
COMMENT ON TABLE foro IS 'Temas del foro comunitario';
COMMENT ON TABLE respuestas IS 'Respuestas a temas del foro';
COMMENT ON TABLE guias IS 'Guías técnicas de plagas';
