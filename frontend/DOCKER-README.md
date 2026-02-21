# Frontend Docker - PlagaControl

## Qué estaba mal

1. **Ruta del build incorrecta**  
   Con Angular 17 y el builder `@angular-devkit/build-angular:application`, la salida no va a `www/` sino a **`www/browser/`**. El Dockerfile copiaba ` /app/www` a Nginx, así que en el contenedor quedaba `…/html/browser/index.html` y Nginx no encontraba `index.html` en la raíz.

2. **Página por defecto de Nginx**  
   Al no existir `index.html` en la raíz de `/usr/share/nginx/html`, Nginx seguía sirviendo su `index.html` por defecto (“Welcome to nginx”) o devolvía 404. No se eliminaban los archivos por defecto de la imagen.

3. **Configuración correcta pero contenido en subcarpeta**  
   El `nginx.conf` ya tenía `try_files` para SPA y proxy a `/api`; el problema era solo la ubicación del build y la página por defecto.

## Cambios realizados

- **Dockerfile**
  - Eliminación explícita de `index.html`, `50x.html` y `default.conf` por defecto en la etapa Nginx.
  - Copia del contenido de **`/app/www/browser`** (no de `www`) a `/usr/share/nginx/html`, para que `index.html` y los assets queden en la raíz.
  - Comprobación en el build de que exista `/app/www/browser/index.html` antes de seguir.

- **nginx.conf**
  - Sin cambios de lógica; se mantiene SPA (fallback a `index.html`) y proxy a backend.
  - Añadidas cabeceras de cache para assets con hash.

- **docker-compose.yml**
  - No fue necesario modificarlo; el servicio `frontend` ya usaba el contexto y Dockerfile correctos.

## Cómo ejecutar

```bash
docker-compose up --build
```

La app queda en **http://localhost** (login de PlagaControl). El contenedor frontend se construye por completo dentro de Docker (Ionic + Angular en la etapa de build, Nginx en la etapa final) y no depende de un build manual en el host.
