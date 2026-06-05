import os
import json
import time
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image, ImageDraw
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, GlobalAveragePooling2D
from tensorflow.keras.applications import MobileNetV2, ResNet50
from tensorflow.keras.utils import to_categorical
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score, log_loss, confusion_matrix

# Configuración básica
IMG_SIZE = 128
CLASSES = ['Diatraea_saccharalis', 'Mahanarva_fimbriolata', 'Saccharicoccus_sacchari', 'Healthy']
NUM_CLASSES = len(CLASSES)
DATASET_DIR = './dataset'
STATIC_DIR = './static'

os.makedirs(STATIC_DIR, exist_ok=True)

def generate_synthetic_image(label_idx):
    """
    Genera una imagen sintética en función de la clase de plaga.
    Devuelve un array de numpy de forma (IMG_SIZE, IMG_SIZE, 3) con valores entre 0 y 255.
    """
    img = Image.new('RGB', (IMG_SIZE, IMG_SIZE), color=(46, 117, 89)) # Verde caña base
    draw = ImageDraw.Draw(img)
    
    # Añadir venas de hojas estándar (líneas verticales de verde claro)
    for x in range(10, IMG_SIZE, 20):
        draw.line([(x, 0), (x, IMG_SIZE)], fill=(60, 145, 110), width=1)
        
    if label_idx == 0: # Diatraea saccharalis (Barrenador del tallo)
        # Dibujar agujeros oscuros y manchas cafés (túneles de entrada)
        for _ in range(5):
            cx, cy = np.random.randint(20, IMG_SIZE - 20, size=2)
            r = np.random.randint(4, 10)
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(92, 64, 51)) # Café oscuro
            draw.ellipse([cx-r+2, cy-r+2, cx+r-2, cy+r-2], fill=(30, 20, 15)) # Centro negro hueco
            
    elif label_idx == 1: # Mahanarva fimbriolata (Salivazo)
        # Dibujar líneas amarillas verticales de secado y espuma blanca
        for _ in range(3):
            lx = np.random.randint(10, IMG_SIZE - 10)
            draw.line([(lx, 0), (lx, IMG_SIZE)], fill=(224, 172, 38), width=np.random.randint(3, 8)) # Líneas amarillas
        for _ in range(4):
            cx, cy = np.random.randint(20, IMG_SIZE - 20, size=2)
            r = np.random.randint(8, 16)
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(240, 240, 240)) # Espuma blanca
            
    elif label_idx == 2: # Saccharicoccus sacchari (Cochinilla harinosa)
        # Dibujar cúmulos de puntitos blancos/rosados (cochinillas) en nodos
        draw.line([(0, IMG_SIZE//2), (IMG_SIZE, IMG_SIZE//2)], fill=(120, 90, 70), width=8) # Nodo/tallo de caña
        for _ in range(25):
            cx = np.random.randint(10, IMG_SIZE - 10)
            cy = np.random.randint(IMG_SIZE//2 - 12, IMG_SIZE//2 + 12)
            r = np.random.randint(2, 5)
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(230, 190, 195)) # Cochinilla rosada/blanca
            
    elif label_idx == 3: # Healthy (Sana)
        # Hojas verdes limpias, tal vez con venas más definidas y vibrantes
        for x in range(30, IMG_SIZE, 30):
            draw.line([(x, 0), (x, IMG_SIZE)], fill=(82, 183, 136), width=2)
            
    # Añadir un poco de ruido de textura para que sea realista
    img_arr = np.array(img).astype(np.float32)
    noise = np.random.normal(0, 8.0, img_arr.shape)
    img_arr = np.clip(img_arr + noise, 0, 255)
    
    return img_arr

def create_dataset(samples_per_class=100):
    """
    Genera arrays de entrenamiento y validación sintéticos.
    """
    print(f"Generando dataset sintético ({samples_per_class} muestras por clase)...")
    X_train, y_train = [], []
    X_val, y_val = [], []
    
    for idx, _ in enumerate(CLASSES):
        # Entrenamiento
        for _ in range(int(samples_per_class * 0.8)):
            X_train.append(generate_synthetic_image(idx))
            y_train.append(idx)
        # Validación
        for _ in range(int(samples_per_class * 0.2)):
            X_val.append(generate_synthetic_image(idx))
            y_val.append(idx)
            
    # Normalizar imágenes entre 0 y 1
    X_train = np.array(X_train) / 255.0
    X_val = np.array(X_val) / 255.0
    y_train = np.array(y_train)
    y_val = np.array(y_val)
    
    return X_train, y_train, X_val, y_val

def build_custom_cnn():
    model = Sequential([
        Conv2D(16, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
        MaxPooling2D((2, 2)),
        Conv2D(32, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(32, activation='relu'),
        Dense(NUM_CLASSES, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

def build_mobilenet():
    # Inicializamos sin pesos pre-entrenados para que compile offline al 100% de manera rápida
    base = MobileNetV2(input_shape=(IMG_SIZE, IMG_SIZE, 3), include_top=False, weights=None)
    model = Sequential([
        base,
        GlobalAveragePooling2D(),
        Dense(32, activation='relu'),
        Dense(NUM_CLASSES, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

def build_resnet():
    base = ResNet50(input_shape=(IMG_SIZE, IMG_SIZE, 3), include_top=False, weights=None)
    model = Sequential([
        base,
        GlobalAveragePooling2D(),
        Dense(32, activation='relu'),
        Dense(NUM_CLASSES, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

def evaluate_model(model, X_val, y_val_cat, y_val):
    preds_probs = model.predict(X_val)
    preds = np.argmax(preds_probs, axis=1)
    
    # Calcular métricas básicas
    acc = accuracy_score(y_val, preds)
    precision, recall, f1, _ = precision_recall_fscore_support(y_val, preds, average='macro', zero_division=0)
    
    # Calcular Log Loss
    loss_val = log_loss(y_val, preds_probs, labels=list(range(NUM_CLASSES)))
    
    # Calcular AUC-ROC
    try:
        auc = roc_auc_score(y_val_cat, preds_probs, average='macro', multi_class='ovr')
    except Exception:
        auc = 0.5 # Fallback si falla
        
    return {
        'accuracy': float(acc),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'auc_roc': float(auc),
        'log_loss': float(loss_val)
    }, preds, preds_probs

def main():
    start_time = time.time()
    
    # 1. Generar Dataset
    X_train, y_train, X_val, y_val = create_dataset(150)
    
    y_train_cat = to_categorical(y_train, NUM_CLASSES)
    y_val_cat = to_categorical(y_val, NUM_CLASSES)
    
    models = {
        'CNN_Personalizada': build_custom_cnn(),
        'MobileNetV2': build_mobilenet(),
        'ResNet50': build_resnet()
    }
    
    results = {}
    histories = {}
    validation_predictions = {}
    
    epochs = 4 # Pequeño número para entrenamiento ultra rápido en CPU
    batch_size = 16
    
    # 2. Entrenar y Evaluar cada modelo
    for name, model in models.items():
        print(f"\n--- Entrenando modelo: {name} ---")
        history = model.fit(
            X_train, y_train_cat,
            validation_data=(X_val, y_val_cat),
            epochs=epochs,
            batch_size=batch_size,
            verbose=1
        )
        
        metrics, preds, probs = evaluate_model(model, X_val, y_val_cat, y_val)
        results[name] = metrics
        histories[name] = history.history
        validation_predictions[name] = {
            'preds': preds,
            'probs': probs
        }
        
        print(f"Resultados de {name}: Accuracy={metrics['accuracy']:.4f}, F1-Score={metrics['f1_score']:.4f}")
        
    # 3. Graficar Curvas de Entrenamiento/Validación
    fig, axs = plt.subplots(2, 3, figsize=(18, 10))
    fig.suptitle('Curvas de Aprendizaje - Comparativa de Modelos', fontsize=16, fontweight='bold', color='#1b4332')
    
    for idx, (name, hist) in enumerate(histories.items()):
        # Loss plot
        axs[0, idx].plot(hist['loss'], label='Entrenamiento', color='#40916c', lw=2)
        axs[0, idx].plot(hist['val_loss'], label='Validación', color='#2d6a4f', linestyle='--', lw=2)
        axs[0, idx].set_title(f'Pérdida (Loss) - {name}')
        axs[0, idx].set_xlabel('Época')
        axs[0, idx].set_ylabel('Pérdida')
        axs[0, idx].legend()
        axs[0, idx].grid(True, alpha=0.3)
        
        # Accuracy plot
        axs[1, idx].plot(hist['accuracy'], label='Entrenamiento', color='#95d5b2', lw=2)
        axs[1, idx].plot(hist['val_accuracy'], label='Validación', color='#52b788', linestyle='--', lw=2)
        axs[1, idx].set_title(f'Precisión (Accuracy) - {name}')
        axs[1, idx].set_xlabel('Época')
        axs[1, idx].set_ylabel('Precisión')
        axs[1, idx].legend()
        axs[1, idx].grid(True, alpha=0.3)
        
    plt.tight_layout()
    plt.savefig(os.path.join(STATIC_DIR, 'training_curves.png'), dpi=150)
    plt.close()
    
    # 4. Seleccionar el mejor modelo según F1-Score
    best_model_name = max(results, key=lambda k: results[k]['f1_score'])
    best_model = models[best_model_name]
    best_metrics = results[best_model_name]
    
    print(f"\n>>> MODELO SELECCIONADO: {best_model_name} con F1-Score={best_metrics['f1_score']:.4f} <<<")
    
    # Guardar el mejor modelo
    best_model.save(os.path.join(STATIC_DIR, 'best_model.keras'))
    
    # 5. Generar Matriz de Confusión para el mejor modelo
    best_preds = validation_predictions[best_model_name]['preds']
    cm = confusion_matrix(y_val, best_preds)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Greens',
        xticklabels=CLASSES, yticklabels=CLASSES,
        cbar=True, square=True
    )
    plt.title(f'Matriz de Confusión - Mejor Modelo ({best_model_name})', fontsize=14, fontweight='bold', pad=20)
    plt.xlabel('Predicción del Modelo')
    plt.ylabel('Etiqueta Real')
    plt.tight_layout()
    plt.savefig(os.path.join(STATIC_DIR, 'confusion_matrix.png'), dpi=150)
    plt.close()
    
    # 6. Escribir reporte en metrics.json
    metrics_report = {
        'best_model': best_model_name,
        'selected_metric': 'f1_score',
        'metrics': results,
        'classes': CLASSES,
        'total_training_time_seconds': float(time.time() - start_time),
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    with open(os.path.join(STATIC_DIR, 'metrics.json'), 'w') as f:
        json.dump(metrics_report, f, indent=2)
        
    print("\n¡Entrenamiento y comparación completados exitosamente!")

if __name__ == '__main__':
    main()
