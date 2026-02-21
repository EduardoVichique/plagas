-- Ejecutar solo si la BD ya existía y no tienes usuario.
-- Desde el host: docker exec -i plagacontrol-postgres psql -U plaga_user -d plagacontrol < database/seed-usuario.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO usuarios (email, password_hash, nombre, apellido, experiencia, tipo_cultivo) VALUES
('admin@plagacontrol.com', crypt('123456', gen_salt('bf', 10)), 'Admin', 'PlagaControl', 'Avanzado', 'Varios')
ON CONFLICT (email) DO NOTHING;
