-- Ejecutar solo si la BD ya existía y no tienes usuario.
-- Desde el host: docker exec -i plagacontrol-postgres psql -U plaga_user -d plagacontrol < database/seed-usuario.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO usuarios (email, password_hash, nombre, apellido, experiencia, tipo_cultivo, rol) VALUES
('admin@plagacontrol.com', crypt('Admin123!', gen_salt('bf', 10)), 'Admin', 'PlagaControl', 'Avanzado', 'Varios', 'admin')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
