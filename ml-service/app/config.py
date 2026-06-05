import os
from dotenv import load_dotenv

# Cargar variables del .env si existe
load_dotenv()

class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 5432))
    DB_NAME = os.getenv("DB_NAME", "plagacontrol")
    DB_USER = os.getenv("DB_USER", "plaga_user")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "plaga_pass_secure")
    
    JWT_SECRET = os.getenv("JWT_SECRET", "plagacontrol-jwt-secret-change-in-production")
    
    # Por defecto, en desarrollo local apunta al directorio de uploads del backend.
    # En Docker, se sobreescribe mediante variables de entorno a /app/uploads
    UPLOAD_PATH = os.getenv("UPLOAD_PATH", "../backend/uploads")
    
    @classmethod
    def get_predictions_dir(cls):
        path = os.path.join(cls.UPLOAD_PATH, "predictions")
        try:
            os.makedirs(path, exist_ok=True)
        except Exception:
            # Fallback en caso de que la ruta relativa no se pueda resolver
            path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads", "predictions"))
            os.makedirs(path, exist_ok=True)
        return path
