import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from app.config import Config

logger = logging.getLogger(__name__)

def get_connection():
    return psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )

def check_db_health():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1;")
        cursor.fetchone()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error en healthcheck de base de datos: {e}")
        return False

def verify_user_exists(user_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT id, email, rol, activo FROM usuarios WHERE id = %s;",
            (user_id,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
    except Exception as e:
        logger.error(f"Error al verificar usuario {user_id}: {e}")
        return None

def save_prediction(usuario_id: int, imagen_url: str, plaga: str, confianza: float, modelo: str, tiempo_ejecucion: str):
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO predicciones (usuario_id, imagen_url, plaga_detectada, confianza, modelo_usado, tiempo_ejecucion, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id, created_at;
            """,
            (usuario_id, imagen_url, plaga, confianza, modelo, tiempo_ejecucion)
        )
        res = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return res
    except Exception as e:
        logger.error(f"Error al guardar predicción: {e}")
        return None

def get_predictions_history(usuario_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT id, imagen_url, plaga_detectada, confianza, modelo_usado, tiempo_ejecucion, created_at
            FROM predicciones
            WHERE usuario_id = %s
            ORDER BY created_at DESC;
            """,
            (usuario_id,)
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception as e:
        logger.error(f"Error al obtener historial de predicciones para usuario {usuario_id}: {e}")
        return []
