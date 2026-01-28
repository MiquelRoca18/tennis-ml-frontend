# 🚀 SETUP Y EJECUCIÓN DEL SERVIDOR BACKEND

## 📋 FLUJO COMPLETO DEL PROYECTO

### Cronología de Desarrollo

```
┌─────────────────────────────────────────────────────────┐
│ FASE 1: BACKEND API (Semana 1)                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 1. Ampliar endpoints existentes                 │   │
│ │ 2. Integrar API-Sports                          │   │
│ │ 3. Integrar The Odds API                        │   │
│ │ 4. Crear sistema de caché                       │   │
│ │ 5. Testing de la API                            │   │
│ │ 6. ✅ BACKEND LISTO Y FUNCIONANDO               │   │
│ └─────────────────────────────────────────────────┘   │
│                       ↓                                 │
│         [Backend queda CORRIENDO]                       │
│                       ↓                                 │
│ FASE 2: FRONTEND - Feed de Partidos (Semanas 2-3)     │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 1. Setup React Native                           │   │
│ │ 2. Crear MatchFeedScreen                        │   │
│ │ 3. Consumir API backend (que está corriendo)    │   │
│ │ 4. Mostrar partidos con fotos                   │   │
│ │ ✅ FRONTEND conectado a BACKEND                  │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 RESPUESTA DIRECTA A TU PREGUNTA

**¿Cuándo cambio de backend a frontend?**
- ✅ **Sí**, después de completar Fase 1
- ✅ Backend debe estar **corriendo** durante todo el desarrollo del frontend
- ✅ Fase 2 empieza el frontend (consume el backend que ya está funcionando)

**¿La Fase 1 explica cómo encender el backend?**
- ⚠️ **NO estaba explicado** (falta añadir)
- ✅ **Ahora lo explico aquí** y actualizaré la guía

---

## 🔧 SETUP DEL SERVIDOR BACKEND

### Estructura de tu Proyecto

```
tennis-ml-predictor/              ← Tu proyecto backend existente
├── src/
│   ├── modelo/
│   │   └── predictor.py          ← Tu modelo ML
│   ├── bookmakers/
│   │   ├── odds_fetcher.py       ← The Odds API
│   │   └── odds_comparator.py
│   ├── tracking/
│   │   └── tracking_system.py
│   └── ...
├── modelos/
│   └── production/
│       └── random_forest_calibrado.pkl
├── datos/
│   └── processed/
│       └── dataset_final.csv
├── api_server.py                 ← Tu servidor Flask actual
├── .env                          ← API keys
└── requirements.txt

tennis-betting-app/               ← Proyecto frontend (nuevo - Fase 2)
├── src/
│   ├── screens/
│   ├── components/
│   └── services/
└── ...
```

---

## 🚀 CÓMO EJECUTAR EL SERVIDOR BACKEND

### Paso 1: Preparar el Entorno (Una vez)

```bash
# 1. Navegar a tu proyecto backend
cd /ruta/a/tennis-ml-predictor

# 2. Activar entorno virtual (si usas uno)
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 3. Instalar dependencias si no están
pip install flask flask-cors python-dotenv requests pandas scikit-learn xgboost
```

### Paso 2: Configurar Variables de Entorno

**Crear/Actualizar `.env`**:
```bash
# API Keys
ODDS_API_KEY=tu_api_key_de_the_odds_api
API_SPORTS_KEY=tu_api_key_de_api_sports

# Server
FLASK_ENV=development
FLASK_DEBUG=True

# Database
DB_PATH=apuestas_tracker.db

# Model
MODEL_PATH=modelos/production/random_forest_calibrado.pkl
DATA_PATH=datos/processed/dataset_final.csv

# Cache
CACHE_DIR=datos/cache_cuotas
CACHE_DURATION_MINUTES=30

# Betting
EV_THRESHOLD=0.03
BANKROLL_INICIAL=1000
```

### Paso 3: Actualizar/Crear `api_server.py`

**Archivo mínimo para empezar** (si no lo tienes):

```python
# api_server.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Importar tus servicios existentes
from src.bookmakers.odds_fetcher import OddsFetcher
from src.modelo.predictor import Predictor
# ... otros imports

# Cargar variables de entorno
load_dotenv()

# Crear app Flask
app = Flask(__name__)

# IMPORTANTE: Habilitar CORS para que frontend pueda hacer requests
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:19006", "http://localhost:19000"],  # Expo
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

# Inicializar servicios
odds_fetcher = OddsFetcher(api_key=os.getenv('ODDS_API_KEY'))
# ... otros servicios

# ==================== ENDPOINTS ====================

@app.route('/api/v1/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'API is running',
        'version': '1.0.0'
    })

@app.route('/api/v1/matches', methods=['GET'])
def get_matches():
    """Obtener lista de partidos"""
    try:
        # Query params
        date = request.args.get('date', 'today')
        min_ev = float(request.args.get('min_ev', 0))
        
        # 1. Consultar API-Sports (fixture + fotos)
        # TODO: Implementar
        
        # 2. Consultar The Odds API (cuotas)
        # TODO: Implementar
        
        # 3. Generar predicciones
        # TODO: Implementar
        
        # 4. Combinar y retornar
        matches = []  # Tu lógica aquí
        
        return jsonify({
            'status': 'success',
            'data': {
                'matches': matches
            }
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/v1/matches/<match_id>', methods=['GET'])
def get_match_detail(match_id):
    """Análisis detallado de un partido"""
    # TODO: Implementar
    pass

@app.route('/api/v1/bets', methods=['POST'])
def create_bet():
    """Registrar una apuesta"""
    # TODO: Implementar
    pass

@app.route('/api/v1/dashboard', methods=['GET'])
def get_dashboard():
    """Métricas del usuario"""
    # TODO: Implementar
    pass

# ==================== MAIN ====================

if __name__ == '__main__':
    # Puerto configurable
    port = int(os.getenv('PORT', 5000))
    
    print("=" * 60)
    print("🎾 TENNIS ML PREDICTOR API")
    print("=" * 60)
    print(f"🚀 Server running on http://localhost:{port}")
    print(f"📊 Health check: http://localhost:{port}/api/v1/health")
    print(f"📋 Matches endpoint: http://localhost:{port}/api/v1/matches")
    print("=" * 60)
    print("⚠️  Press CTRL+C to stop the server")
    print("=" * 60)
    
    # Ejecutar servidor
    app.run(
        host='0.0.0.0',  # Accesible desde cualquier IP
        port=port,
        debug=True       # Hot reload en desarrollo
    )
```

### Paso 4: Ejecutar el Servidor

```bash
# Desde la carpeta del backend
python api_server.py
```

**Salida esperada**:
```
============================================================
🎾 TENNIS ML PREDICTOR API
============================================================
🚀 Server running on http://localhost:5000
📊 Health check: http://localhost:5000/api/v1/health
📋 Matches endpoint: http://localhost:5000/api/v1/matches
============================================================
⚠️  Press CTRL+C to stop the server
============================================================
 * Serving Flask app 'api_server'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://0.0.0.0:5000
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
```

### Paso 5: Verificar que Funciona

**Opción A: Navegador**
```
Abrir: http://localhost:5000/api/v1/health
```

**Opción B: Terminal (otra terminal)**
```bash
curl http://localhost:5000/api/v1/health
```

**Respuesta esperada**:
```json
{
  "status": "success",
  "message": "API is running",
  "version": "1.0.0"
}
```

---

## 🔄 WORKFLOW DE DESARROLLO

### Durante Fase 1 (Backend)

```bash
# Terminal 1: Backend
cd tennis-ml-predictor
python api_server.py

# El servidor queda corriendo aquí
# Puedes ver los logs de requests
```

```bash
# Terminal 2: Testing
# Probar endpoints con curl o Postman
curl http://localhost:5000/api/v1/matches
```

### Durante Fase 2-5 (Frontend)

```bash
# Terminal 1: Backend (sigue corriendo)
cd tennis-ml-predictor
python api_server.py
# ✅ Deja esto corriendo TODO EL TIEMPO
```

```bash
# Terminal 2: Frontend
cd tennis-betting-app
npm start
# o
expo start

# El frontend hará requests a http://localhost:5000/api/v1/...
```

**Resultado**: Frontend y Backend corriendo simultáneamente ✅

---

## 🐛 DEBUGGING Y LOGS

### Ver Requests en Tiempo Real

Cuando el backend está corriendo, verás logs como:

```
127.0.0.1 - - [16/Dec/2024 10:30:15] "GET /api/v1/matches HTTP/1.1" 200 -
127.0.0.1 - - [16/Dec/2024 10:30:20] "GET /api/v1/matches/match_001 HTTP/1.1" 200 -
127.0.0.1 - - [16/Dec/2024 10:30:25] "POST /api/v1/bets HTTP/1.1" 201 -
```

### Añadir Logs Personalizados

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/v1/matches', methods=['GET'])
def get_matches():
    logger.info("📥 Request to /api/v1/matches")
    logger.info(f"   Query params: {request.args}")
    
    # ... tu lógica
    
    logger.info(f"📤 Returning {len(matches)} matches")
    return jsonify(...)
```

---

## ⚙️ CONFIGURACIÓN DE CORS (Importante)

**Para que el frontend pueda hacer requests al backend**:

```python
from flask_cors import CORS

# Configuración durante desarrollo
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:19006",  # Expo web
            "http://localhost:19000",  # Expo Metro
            "http://localhost:8081",   # Alternativo
        ],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Para producción, cambiar a tu dominio:
# "origins": ["https://tuapp.com"]
```

---

## 🔄 HOT RELOAD (Recarga Automática)

Con `debug=True`, Flask recarga automáticamente cuando cambias código:

```python
app.run(debug=True)  # ✅ Recomendado para desarrollo
```

**Beneficio**: No necesitas reiniciar el servidor cada vez que modificas algo.

---

## 📝 CHECKLIST ANTES DE PASAR A FASE 2

### Backend debe estar:

- [ ] ✅ Corriendo sin errores en `http://localhost:5000`
- [ ] ✅ Health check responde: `GET /api/v1/health` → 200 OK
- [ ] ✅ Endpoint de matches funciona: `GET /api/v1/matches` → retorna JSON
- [ ] ✅ CORS habilitado (frontend podrá hacer requests)
- [ ] ✅ API-Sports integrado (devuelve fotos en `photo_url`)
- [ ] ✅ The Odds API integrado (devuelve cuotas)
- [ ] ✅ Sistema de caché funcionando
- [ ] ✅ Logs visibles en la terminal

### Testing rápido:

```bash
# 1. Health check
curl http://localhost:5000/api/v1/health

# 2. Matches (debería retornar partidos reales)
curl http://localhost:5000/api/v1/matches

# 3. Match detail
curl http://localhost:5000/api/v1/matches/match_20241216_001

# 4. Registrar bet
curl -X POST http://localhost:5000/api/v1/bets \
  -H "Content-Type: application/json" \
  -d '{"match_id":"match_001","stake":10,"odds":1.52}'
```

Si todos funcionan → **✅ Listo para Fase 2 (Frontend)**

---

## 🚀 INICIAR FASE 2 (Frontend)

Una vez backend corriendo:

```bash
# Terminal 1: Backend (déjalo corriendo)
cd tennis-ml-predictor
python api_server.py

# Terminal 2: Crear proyecto frontend
npx create-expo-app tennis-betting-app
cd tennis-betting-app

# Instalar dependencias
npm install axios react-navigation

# Iniciar frontend
npm start
```

**Arquitectura**:
```
Terminal 1: Backend Flask    → http://localhost:5000
Terminal 2: Frontend Expo    → http://localhost:19006

Frontend hace requests a Backend ✅
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema 1: "Port already in use"

**Error**:
```
OSError: [Errno 48] Address already in use
```

**Solución**:
```bash
# Encontrar proceso en puerto 5000
lsof -i :5000

# Matar proceso
kill -9 <PID>

# O cambiar puerto
export PORT=5001
python api_server.py
```

### Problema 2: CORS Error en Frontend

**Error en consola del navegador**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solución**:
```python
# Verificar CORS en api_server.py
from flask_cors import CORS
CORS(app)  # Debe estar ANTES de definir rutas
```

### Problema 3: "Module not found"

**Error**:
```
ModuleNotFoundError: No module named 'flask'
```

**Solución**:
```bash
# Verificar que estás en el entorno correcto
pip install flask flask-cors python-dotenv
```

### Problema 4: API Keys no encontradas

**Error**:
```
ValueError: API key no configurada
```

**Solución**:
```bash
# Verificar .env existe y tiene las keys
cat .env

# Debe tener:
ODDS_API_KEY=tu_key_aqui
API_SPORTS_KEY=tu_key_aqui
```

---

## 📊 MONITOREO DEL SERVIDOR

### Ver Uso de API Quotas

```python
# Añadir endpoint de monitoreo
@app.route('/api/v1/stats', methods=['GET'])
def get_api_stats():
    return jsonify({
        'api_sports': {
            'requests_today': 45,
            'remaining_today': 55,
            'limit': 100
        },
        'odds_api': {
            'requests_month': 120,
            'remaining_month': 380,
            'limit': 500
        }
    })
```

### Dashboard Simple en Terminal

```python
# Al arrancar el servidor, mostrar:
print("📊 API Quotas:")
print(f"   API-Sports: {45}/100 requests today")
print(f"   The Odds API: {120}/500 requests this month")
```

---

## ✅ RESUMEN EJECUTIVO

### Flujo correcto:

```
1. FASE 1 (Semana 1):
   ✅ Implementar endpoints en api_server.py
   ✅ Integrar API-Sports y The Odds API
   ✅ Testing con curl/Postman
   ✅ Dejar servidor CORRIENDO

2. FASE 2 (Semanas 2-3):
   ✅ Backend sigue corriendo (Terminal 1)
   ✅ Crear proyecto React Native (Terminal 2)
   ✅ Frontend consume http://localhost:5000/api/v1/...

3. FASE 3-5:
   ✅ Backend sigue corriendo
   ✅ Continuar desarrollando frontend
```

### Comandos esenciales:

```bash
# Arrancar backend
cd tennis-ml-predictor
python api_server.py

# (Nuevo terminal) Arrancar frontend
cd tennis-betting-app
npm start

# (Nuevo terminal) Testing
curl http://localhost:5000/api/v1/matches
```

### Puertos:
- Backend: `http://localhost:5000`
- Frontend (Expo web): `http://localhost:19006`
- Frontend (Metro): `http://localhost:19000`

---

**¿Todo claro?** El backend debe estar corriendo durante todo el desarrollo del frontend, desde que empiezas Fase 2. Es como tener un "servidor local" que el frontend consulta constantemente.
