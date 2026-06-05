import os
import time
import json
import logging
import jwt
import numpy as np
from PIL import Image
import io

from fastapi import FastAPI, File, UploadFile, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import tensorflow as tf

from app.config import Config
from app.database import (
    check_db_health,
    verify_user_exists,
    save_prediction,
    get_predictions_history
)

# Configurar logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml-service")

app = FastAPI(title="PlagaControl ML API", version="1.0.0")

# Configurar CORS para permitir peticiones directas en desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir carpeta de archivos estáticos (métricas, curvas, matrices de confusión)
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Cargar el modelo seleccionado en el inicio de la app
MODEL_PATH = "static/best_model.keras"
METRICS_PATH = "static/metrics.json"

best_model = None
metrics_data = None
classes = ['Diatraea_saccharalis', 'Mahanarva_fimbriolata', 'Saccharicoccus_sacchari', 'Healthy']

@app.on_event("startup")
def load_assets():
    global best_model, metrics_data
    logger.info("Iniciando servicio de Machine Learning...")
    
    # Intentar cargar métricas
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                metrics_data = json.load(f)
            logger.info("Métricas de entrenamiento cargadas exitosamente.")
        except Exception as e:
            logger.error(f"Error al cargar metrics.json: {e}")
            
    # Intentar cargar modelo
    if os.path.exists(MODEL_PATH):
        try:
            best_model = tf.keras.models.load_model(MODEL_PATH)
            logger.info(f"Modelo {metrics_data.get('best_model', 'cargado')} inicializado correctamente.")
        except Exception as e:
            logger.error(f"Error al cargar el modelo de Keras: {e}")
    else:
        logger.warning(f"No se encontró el archivo del modelo en {MODEL_PATH}. Por favor ejecute train.py.")

# Mapeo de recomendaciones y nombres estéticos
RECOMENDACIONES = {
    'Diatraea_saccharalis': "Aplicar monitoreo continuo y control biológico mediante la liberación de avispas Trichogramma. Evitar el exceso de fertilización nitrogenada.",
    'Mahanarva_fimbriolata': "Mantener el suelo limpio y remover rastrojos. Aplicar control biológico rociando esporas del hongo Metarhizium anisopliae.",
    'Saccharicoccus_sacchari': "Controlar malezas e insectos vectores como las hormigas. En infestaciones altas, aplicar jabón potásico o aceites minerales.",
    'Healthy': "El cultivo se encuentra sano y libre de plagas visibles. Continuar con el programa preventivo de monitoreo periódico."
}

NOMBRES_ESTETICOS = {
    'Diatraea_saccharalis': "Diatraea saccharalis (Barrenador de tallo)",
    'Mahanarva_fimbriolata': "Mahanarva fimbriolata (Salivazo de la caña)",
    'Saccharicoccus_sacchari': "Saccharicoccus sacchari (Cochinilla harinosa)",
    'Healthy': "Sana (Sin plaga)"
}

def verify_token(authorization: str = Header(None)):
    """
    Middleware para descodificar JWT y verificar el usuario
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "message": "Token de autenticación no proporcionado",
                "error": {}
            }
        )
    token = authorization.split(" ")[1]
    try:
        # Decodificar el token sin verificar expiración estricta para desarrollo
        # si hay fallas en fechas, pero intentando descodificación segura
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        userId = payload.get("userId")
        if not userId:
            raise HTTPException(
                status_code=401,
                detail={"success": False, "message": "Token inválido: falta userId", "error": {}}
            )
        
        # Verificar en DB que el usuario exista
        user = verify_user_exists(userId)
        if not user or not user.get("activo", True):
            raise HTTPException(
                status_code=401,
                detail={"success": False, "message": "Usuario inexistente o inactivo", "error": {}}
            )
        return userId
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "message": "El token ha expirado", "error": {}}
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "message": "Token de seguridad inválido", "error": str(e)}
        )

@app.get("/health")
def health():
    db_ok = check_db_health()
    model_loaded = best_model is not None
    
    status_code = 200 if (db_ok and model_loaded) else 500
    
    return JSONResponse(
        status_code=status_code,
        content={
            "success": status_code == 200,
            "message": "Servicios verificados" if status_code == 200 else "Servicio con fallas parciales",
            "data": {
                "status": "ok" if status_code == 200 else "error",
                "database_connected": db_ok,
                "model_loaded": model_loaded,
                "active_model": metrics_data.get("best_model", "Unknown") if metrics_data else "None"
            }
        }
    )

@app.get("/metrics")
def get_metrics():
    if not metrics_data:
        raise HTTPException(
            status_code=404,
            detail={"success": False, "message": "Métricas no disponibles aún", "error": {}}
        )
    return {
        "success": True,
        "message": "Métricas recuperadas con éxito",
        "data": metrics_data
    }

@app.get("/predictions")
def get_predictions(userId: int = Depends(verify_token)):
    history = get_predictions_history(userId)
    return {
        "success": True,
        "message": "Historial de predicciones recuperado",
        "data": history
    }

@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    userId: int = Depends(verify_token)
):
    global best_model
    if not best_model:
        raise HTTPException(
            status_code=503,
            detail={"success": False, "message": "El modelo de predicción no está cargado", "error": {}}
        )
        
    start_time = time.time()
    
    # 1. Leer imagen y guardar localmente
    contents = await image.read()
    try:
        pil_img = Image.open(io.BytesIO(contents)).convert('RGB')
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "message": "Archivo no válido como imagen", "error": str(e)}
        )
        
    # Guardar en disco
    ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"pred-{userId}-{int(time.time()*1000)}{ext}"
    dest_path = os.path.join(Config.get_predictions_dir(), filename)
    pil_img.save(dest_path)
    
    # URL de acceso relativo para mostrar en el frontend
    imagen_url = f"/uploads/predictions/{filename}"
    
    # 2. Preprocesar imagen
    resized_img = pil_img.resize((128, 128))
    img_array = np.array(resized_img) / 255.0
    img_array = np.expand_dims(img_array, axis=0) # Añadir dimensión lote (batch)
    
    # 3. Correr Inferencia
    try:
        preds = best_model.predict(img_array)
        class_idx = np.argmax(preds[0])
        prob = float(preds[0][class_idx])
        confianza_pct = round(prob * 100, 2)
    except Exception as e:
        logger.error(f"Inferencia fallida: {e}")
        raise HTTPException(
            status_code=500,
            detail={"success": False, "message": "Fallo en la inferencia del modelo", "error": str(e)}
        )
        
    raw_class = classes[class_idx]
    plaga_nombre = NOMBRES_ESTETICOS.get(raw_class, raw_class)
    recomendacion = RECOMENDACIONES.get(raw_class, "Proceder a evaluación de campo.")
    
    # Calcular tiempos
    inference_time = round(time.time() - start_time, 2)
    tiempo_ejecucion_str = f"{inference_time} segundos"
    
    model_used_name = metrics_data.get("best_model", "ResNet50") if metrics_data else "Modelo Cargado"
    
    # 4. Guardar en Base de Datos
    db_res = save_prediction(
        usuario_id=userId,
        imagen_url=imagen_url,
        plaga=plaga_nombre,
        confianza=confianza_pct,
        modelo=model_used_name,
        tiempo_ejecucion=tiempo_ejecucion_str
    )
    
    if not db_res:
        logger.error("No se pudo registrar la predicción en la base de datos.")
        # Opcionalmente no fallamos la petición del cliente si la predicción sí se hizo,
        # pero es mejor fallar de manera controlada o advertir.
        
    return {
        "success": True,
        "message": "Detección realizada correctamente",
        "data": {
            "plaga": plaga_nombre,
            "confianza": confianza_pct,
            "modelo": model_used_name,
            "tiempo_inferencia": tiempo_ejecucion_str,
            "recomendacion": recomendacion
        }
    }
