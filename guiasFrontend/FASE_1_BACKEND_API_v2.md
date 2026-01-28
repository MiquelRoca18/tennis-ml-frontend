# 🎾 FASE 1: BACKEND API CON ML PREDICTIONS & BETTING INTELLIGENCE

**Duración**: 1 semana | **Objetivo**: API que combina datos externos + predicciones ML + análisis de valor

---

## 🎯 PROPÓSITO REAL DE ESTA FASE

### El Core del Proyecto

**Tu ML ya está entrenado (71.57% accuracy, 57.41% ROI).** Esta fase consiste en:

1. ✅ Obtener datos de partidos de APIs externas
2. ✅ Obtener cuotas de casas de apuestas
3. ✅ **GENERAR PREDICCIONES con tu modelo ML**
4. ✅ **CALCULAR Expected Value (EV)**
5. ✅ **CALCULAR Kelly Criterion (cuánto apostar)**
6. ✅ **DAR RECOMENDACIÓN: BET o SKIP**
7. ✅ Devolver TODO en JSON al frontend

**Sin esto, el frontend solo mostraría datos crudos sin inteligencia.**

---

## 🔄 FLUJO COMPLETO DE DATOS

```
1. APIS EXTERNAS (Datos crudos)
   ↓
   ├─ SofaScore API / SportRadar (FREE)
   │  → Partidos del día
   │  → Nombres jugadores, torneo, superficie
   │  → Fotos, banderas, info completa
   │
   └─ The Odds API (FREE)
      → Cuotas de múltiples bookmakers
      → Mejor cuota disponible

2. TU BASE DE DATOS ML (TML Database)
   ↓
   ├─ Rankings actualizados
   ├─ ELO ratings
   ├─ H2H (head-to-head)
   ├─ Form (últimos 60 días)
   └─ 149 features más

3. TU MODELO ML (Random Forest Calibrado)
   ↓
   Features (superficie + rankings + ELO + H2H + ...)
      ↓
   Predicción:
   ├─ Winner: "player2" (Sinner)
   ├─ Probability: 0.673 (67.3%)
   └─ Confidence: 0.87 (87%)

4. CÁLCULO DE VALOR (Expected Value)
   ↓
   EV = (Probabilidad_ML × Cuota) - 1
   EV = (0.673 × 1.52) - 1 = +0.023 (+2.3%)
   
   Si EV > 0 → HAY VALOR ✅
   Si EV < 0 → NO HAY VALOR ❌

5. KELLY CRITERION (Bankroll Management)
   ↓
   Kelly % = (Probabilidad × Cuota - 1) / (Cuota - 1)
   Kelly % = (0.673 × 1.52 - 1) / (1.52 - 1) = 0.034 (3.4%)
   
   Kelly Conservador = 25% del Kelly óptimo = 0.85%
   Stake = Bankroll × 0.0085 = 1000€ × 0.0085 = 8.5€

6. RECOMENDACIÓN FINAL
   ↓
   IF EV > umbral (ej: +3%) AND Confidence > 70%:
      → RECOMMENDATION: "BET"
      → STAKE: 8.5€
   ELSE:
      → RECOMMENDATION: "SKIP"

7. RESPUESTA JSON AL FRONTEND
   ↓
   {
     "match": {...},
     "prediction": {
       "winner": "player2",
       "probability": 0.673,
       "confidence": 0.87
     },
     "betting": {
       "ev": 0.023,
       "kelly_pct": 0.034,
       "kelly_stake": 8.50,
       "recommendation": "BET"
     }
   }
```

---

## 🌐 APIS EXTERNAS (Datos de Partidos)

### Problema: API-Sports para Tenis

API-Sports existe pero tiene limitaciones. Alternativas **gratuitas** mejores:

### **Opción 1: SofaScore API (Recomendada)**

**Por qué es mejor**:
- ✅ API pública gratuita (sin registro)
- ✅ Cubre ATP + WTA + ITF
- ✅ Datos en tiempo real
- ✅ Fotos de jugadores disponibles
- ✅ Estadísticas completas
- ✅ 100% gratis sin límites

**Endpoints clave**:
```
GET /api/v1/sport/tennis/scheduled-events/{date}
→ Partidos programados para una fecha

GET /api/v1/event/{match_id}
→ Detalles completos del partido

GET /api/v1/player/{player_id}
→ Info del jugador + foto
```

**Datos que obtienes**:
- Match ID, fecha, hora
- Jugador 1 y 2 (nombres, IDs)
- Torneo (nombre, ciudad, superficie)
- Round (Final, Semifinal, R16, etc.)
- URLs de fotos de jugadores
- Banderas de países

### **Opción 2: SportRadar (Free Tier)**

**Características**:
- ✅ 1,000 requests/mes gratis
- ✅ Datos muy completos
- ✅ API profesional
- ⚠️ Requiere registro

### **Opción 3: TheSportsDB (Fallback)**

**Uso**:
- Fotos HD de jugadores
- Info general de torneos
- Solo si SofaScore falla

---

## 💰 CUOTAS DE APUESTAS

### The Odds API (Ya lo tienes)

**Configuración**:
- ✅ 500 requests/mes gratis
- ✅ Múltiples bookmakers
- ✅ Actualización frecuente

**Datos que obtienes**:
```json
{
  "bookmakers": [
    {
      "key": "bet365",
      "title": "Bet365",
      "markets": [{
        "outcomes": [
          {"name": "Carlos Alcaraz", "price": 2.75},
          {"name": "Jannik Sinner", "price": 1.52}
        ]
      }]
    },
    {
      "key": "betfair",
      "outcomes": [
        {"name": "Carlos Alcaraz", "price": 2.80},
        {"name": "Jannik Sinner", "price": 1.48}
      ]
    }
  ]
}
```

**Line Shopping** (comparación):
- Mejor cuota Alcaraz: 2.80 (Betfair)
- Mejor cuota Sinner: 1.52 (Bet365)

---

## 🤖 PREDICCIONES DEL MODELO ML

### Proceso de Predicción

**Input (Features)**:
```
Combinar datos de:
1. SofaScore: Superficie del torneo
2. TML Database: Rankings, ELO, H2H, Form
3. Calcular 149 features
```

**Output del Modelo**:
```json
{
  "prediction_winner": "player2",
  "probability_player1": 0.327,
  "probability_player2": 0.673,
  "confidence": 0.87,
  "model_version": "random_forest_v2.3_calibrated"
}
```

**Interpretación**:
- **Winner**: Jugador con mayor probabilidad
- **Probability**: % de ganar (suma = 1.0)
- **Confidence**: Certeza del modelo (0-1)
  - >0.80 = Alta confianza
  - 0.60-0.80 = Media confianza
  - <0.60 = Baja confianza

---

## 📊 CÁLCULO DE EXPECTED VALUE (EV)

### Fórmula

```
EV = (Probabilidad_modelo × Cuota_bookmaker) - 1

Si EV > 0 → Apuesta con valor positivo ✅
Si EV < 0 → Apuesta sin valor ❌
```

### Ejemplo Real

**Partido**: Alcaraz vs Sinner

**Datos**:
- Modelo predice: Sinner 67.3% de ganar
- Bet365 cuota: Sinner @ 1.52

**Cálculo**:
```
EV_Sinner = (0.673 × 1.52) - 1
EV_Sinner = 1.023 - 1
EV_Sinner = +0.023 (+2.3%)
```

**Interpretación**:
- +2.3% EV = Por cada 100€ apostados, esperas ganar 2.3€ a largo plazo
- EV positivo = Apuesta rentable ✅

**Umbrales recomendados**:
- EV > 3% = Muy buena apuesta
- EV > 1% = Buena apuesta
- EV < 0% = No apostar

---

## 💵 KELLY CRITERION (Gestión de Bankroll)

### Fórmula

```
Kelly % = (Probabilidad × Cuota - 1) / (Cuota - 1)

Kelly Conservador = 25% del Kelly óptimo (recomendado)
Stake sugerido = Bankroll × Kelly_conservador
```

### Ejemplo Real

**Datos**:
- Bankroll: 1000€
- Probabilidad modelo: 67.3%
- Cuota: 1.52

**Cálculo**:
```
Kelly_óptimo = (0.673 × 1.52 - 1) / (1.52 - 1)
Kelly_óptimo = (1.023 - 1) / 0.52
Kelly_óptimo = 0.023 / 0.52
Kelly_óptimo = 0.044 (4.4%)

Kelly_conservador = 0.044 × 0.25 = 0.011 (1.1%)

Stake = 1000€ × 0.011 = 11€
```

**Interpretación**:
- Kelly dice apostar 11€ (1.1% del bankroll)
- Nunca apuestes más del 5% del bankroll (riesgo alto)

---

## 🎯 LÓGICA DE RECOMENDACIÓN

### Criterios para Recomendar BET

```
IF:
  1. EV > umbral_mínimo (ej: 3%)
  AND
  2. Confidence > umbral_confianza (ej: 70%)
  AND
  3. Kelly_stake < 5% bankroll
THEN:
  → Recommendation: "BET"
  → Mostrar stake sugerido
ELSE:
  → Recommendation: "SKIP"
  → Explicar por qué
```

### Casos de Uso

**Caso 1: Buena apuesta**
```
EV: +5.2%
Confidence: 87%
Kelly: 3.4% bankroll
→ RECOMENDACIÓN: BET 34€
```

**Caso 2: EV bajo**
```
EV: +1.2%
Confidence: 90%
Kelly: 1.8% bankroll
→ RECOMENDACIÓN: SKIP (EV < 3%)
```

**Caso 3: Confianza baja**
```
EV: +6.0%
Confidence: 55%
Kelly: 4.2% bankroll
→ RECOMENDACIÓN: SKIP (Confianza < 70%)
```

---

## 📋 ENDPOINTS DE LA API

### **1. GET /api/v1/matches**

**Propósito**: Lista de partidos con predicciones y recomendaciones

**Query Parameters**:
- `date` (opcional): YYYY-MM-DD (default: hoy)
- `min_ev` (opcional): Filtrar por EV mínimo (default: 0)
- `tournament` (opcional): Filtrar por torneo

**Proceso interno**:
```
1. Consultar SofaScore → Partidos del día
2. Para cada partido:
   a) Consultar The Odds API → Cuotas
   b) Consultar TML Database → Stats jugadores
   c) Generar features (149)
   d) Modelo ML → Predicción (probability, confidence)
   e) Calcular EV (probability × odds - 1)
   f) Calcular Kelly (stake sugerido)
   g) Determinar recomendación (BET/SKIP)
3. Combinar todo en JSON
4. Cachear resultado (30 min)
5. Retornar al frontend
```

**Respuesta JSON** (estructura completa):
```json
{
  "status": "success",
  "data": {
    "matches": [
      {
        "id": "match_20241217_001",
        "date": "2024-12-17",
        "time": "14:00:00",
        "tournament": {
          "name": "ATP Finals",
          "city": "Turin",
          "country": "Italy",
          "surface": "Hard"
        },
        "player1": {
          "id": "player_5678",
          "name": "Carlos Alcaraz",
          "rank": 3,
          "country": "ESP",
          "country_name": "Spain",
          "photo_url": "https://sofascore.com/players/alcaraz.png",
          "flag_url": "https://sofascore.com/flags/esp.svg",
          "elo": 2189,
          "form_60d": 0.900
        },
        "player2": {
          "id": "player_1234",
          "name": "Jannik Sinner",
          "rank": 1,
          "country": "ITA",
          "country_name": "Italy",
          "photo_url": "https://sofascore.com/players/sinner.png",
          "flag_url": "https://sofascore.com/flags/ita.svg",
          "elo": 2247,
          "form_60d": 0.700
        },
        "h2h": {
          "total_matches": 6,
          "player1_wins": 2,
          "player2_wins": 4,
          "last_result": "player2_won"
        },
        "prediction": {
          "winner": "player2",
          "probability_player1": 0.327,
          "probability_player2": 0.673,
          "confidence": 0.87,
          "model_version": "random_forest_v2.3"
        },
        "betting": {
          "bookmakers": [
            {
              "name": "Bet365",
              "player1_odds": 2.75,
              "player2_odds": 1.52
            },
            {
              "name": "Betfair",
              "player1_odds": 2.80,
              "player2_odds": 1.48
            }
          ],
          "best_odds": {
            "player1": {
              "odds": 2.80,
              "bookmaker": "Betfair"
            },
            "player2": {
              "odds": 1.52,
              "bookmaker": "Bet365"
            }
          },
          "ev": {
            "player1": -0.084,
            "player2": 0.023
          },
          "kelly": {
            "player1": null,
            "player2": {
              "optimal": 0.044,
              "conservative": 0.011,
              "stake": 11.00
            }
          },
          "recommendation": {
            "action": "BET",
            "player": "player2",
            "reason": "EV: +2.3%, High confidence (87%)",
            "stake_suggested": 11.00
          }
        }
      }
    ],
    "summary": {
      "total_matches": 12,
      "matches_with_value": 3,
      "recommended_bets": 2
    }
  },
  "timestamp": "2024-12-17T10:30:00Z"
}
```

**Campos clave de predicción**:
- `prediction.winner` → Quién ganará según tu ML
- `prediction.probability_player2` → % de ganar (67.3%)
- `prediction.confidence` → Certeza del modelo (87%)
- `betting.ev.player2` → Expected Value (+2.3%)
- `betting.kelly.player2.stake` → Cuánto apostar (11€)
- `betting.recommendation.action` → BET o SKIP

---

### **2. GET /api/v1/matches/{match_id}**

**Propósito**: Análisis detallado de un partido específico

**Proceso interno**:
```
1. Obtener partido de BD o SofaScore
2. Generar análisis profundo:
   - Factores clave (superficie, rankings, form)
   - Comparativa detallada jugadores
   - Historial H2H con resultados
   - Explicación de la predicción del ML
   - Breakdown del cálculo de EV
   - Gráficos de probabilidad
3. Retornar JSON enriquecido
```

**Respuesta JSON**:
```json
{
  "status": "success",
  "data": {
    "match": {
      // ... mismo que endpoint anterior
    },
    "analysis": {
      "key_factors": [
        {
          "factor": "Surface Advantage",
          "description": "Sinner has 85% win rate on Hard in 2024",
          "impact": "high",
          "favors": "player2"
        },
        {
          "factor": "Recent Form",
          "description": "Sinner 14-2 in last 16 matches",
          "impact": "high",
          "favors": "player2"
        },
        {
          "factor": "Head to Head",
          "description": "Sinner leads 4-2 overall",
          "impact": "medium",
          "favors": "player2"
        }
      ],
      "comparison": {
        "serve": {
          "player1": {"ace_pct": 12.5, "first_serve_won": 72},
          "player2": {"ace_pct": 10.2, "first_serve_won": 75}
        },
        "return": {
          "player1": {"break_points_won": 42},
          "player2": {"break_points_won": 48}
        }
      },
      "prediction_explanation": {
        "main_reason": "Superior recent form and surface advantage",
        "contributing_factors": [
          "Higher ELO rating (2247 vs 2189)",
          "Better H2H record (4-2)",
          "Home court advantage (Italy)"
        ],
        "model_features_used": 149,
        "calibration_applied": true
      }
    }
  }
}
```

---

### **3. POST /api/v1/bets**

**Propósito**: Registrar una apuesta del usuario

**Request Body**:
```json
{
  "match_id": "match_20241217_001",
  "player_bet": "player2",
  "stake": 11.00,
  "odds": 1.52,
  "bookmaker": "Bet365"
}
```

**Proceso interno**:
```
1. Validar datos
2. Obtener predicción del partido
3. Guardar en SQLite:
   - match_id, player_bet, stake, odds
   - prediction_probability (del ML)
   - ev (calculado)
   - kelly_pct
   - status: "pending"
4. Retornar confirmación
```

**Respuesta JSON**:
```json
{
  "status": "success",
  "data": {
    "bet_id": "bet_12345",
    "match_id": "match_20241217_001",
    "player_bet": "player2",
    "stake": 11.00,
    "potential_return": 16.72,
    "potential_profit": 5.72,
    "prediction_probability": 0.673,
    "ev": 0.023,
    "created_at": "2024-12-17T10:45:00Z"
  },
  "message": "Bet registered successfully"
}
```

---

### **4. GET /api/v1/dashboard**

**Propósito**: Métricas personales del usuario

**Proceso interno**:
```
1. Consultar SQLite todas las apuestas del usuario
2. Calcular métricas:
   - Total apostado
   - Total ganado
   - ROI real
   - Win rate
   - Mejor apuesta
   - Peor apuesta
   - Accuracy del seguimiento (vs predicción)
3. Generar gráficos de evolución
4. Retornar JSON
```

**Respuesta JSON**:
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total_bets": 42,
      "total_staked": 462.00,
      "total_return": 728.45,
      "total_profit": 266.45,
      "roi": 0.5768,
      "win_rate": 0.7143,
      "average_stake": 11.00,
      "average_odds": 1.68
    },
    "performance": {
      "by_month": [
        {"month": "2024-11", "roi": 0.45, "bets": 15},
        {"month": "2024-12", "roi": 0.68, "bets": 27}
      ],
      "by_tournament": [
        {"tournament": "ATP Finals", "roi": 0.82, "bets": 8},
        {"tournament": "Paris Masters", "roi": 0.34, "bets": 12}
      ]
    },
    "model_accuracy": {
      "predictions_correct": 30,
      "predictions_wrong": 12,
      "accuracy_rate": 0.7143
    },
    "best_bet": {
      "match": "Alcaraz vs Djokovic",
      "profit": 45.50,
      "roi": 2.275
    },
    "worst_bet": {
      "match": "Sinner vs Medvedev",
      "loss": -25.00
    }
  }
}
```

---

## 🗄️ BASE DE DATOS (SQLite)

### Tabla: bets

**Campos clave**:
- `id` → Identificador
- `match_id` → FK a partido
- `player_bet` → "player1" o "player2"
- `stake` → Cantidad apostada (€)
- `odds` → Cuota usada
- `bookmaker` → Casa de apuestas
- **`prediction_probability`** → % del modelo ML
- **`ev`** → Expected Value calculado
- **`kelly_pct`** → % Kelly óptimo
- `status` → "pending", "won", "lost"
- `profit` → Ganancia/pérdida real
- `created_at` → Timestamp

**Ejemplo de registro**:
```sql
INSERT INTO bets VALUES (
  1,
  'match_20241217_001',
  'player2',
  11.00,
  1.52,
  'Bet365',
  0.673,     -- prediction_probability
  0.023,     -- ev
  0.011,     -- kelly_pct
  'pending',
  NULL,
  '2024-12-17 10:45:00'
);
```

---

## 🔄 SISTEMA DE CACHÉ

### Estrategia

**1. Partidos del día** (SofaScore):
- Cache: 6 horas
- Motivo: Fixture no cambia frecuentemente

**2. Cuotas** (The Odds API):
- Cache: 30 minutos
- Motivo: Cuotas cambian rápido

**3. Predicciones ML**:
- Cache: Hasta que cambien cuotas o rankings
- Motivo: Predicción depende de features estables

**4. Stats jugadores** (TML Database):
- Cache: 7 días
- Motivo: Rankings actualizan semanalmente

### Implementación

**Estructura de caché**:
```
datos/cache/
├── matches_20241217.json         # Partidos del día
├── odds_match_001.json           # Cuotas por partido
└── prediction_match_001.json     # Predicción ML
```

**Headers de caché**:
```json
{
  "cache_key": "matches_20241217",
  "cached_at": "2024-12-17T09:00:00Z",
  "expires_at": "2024-12-17T15:00:00Z",
  "is_valid": true
}
```

---

## ⚠️ MANEJO DE ERRORES

### Errores Comunes

**1. API externa falla**:
```json
{
  "status": "error",
  "code": "API_UNAVAILABLE",
  "message": "SofaScore API temporarily unavailable",
  "fallback": "Using cached data from 2 hours ago",
  "data": { /* cached data */ }
}
```

**2. Partido sin cuotas**:
```json
{
  "status": "partial",
  "message": "Match found but odds unavailable",
  "data": {
    "match": { /* info */ },
    "prediction": { /* ML prediction */ },
    "betting": null
  }
}
```

**3. Modelo ML falla**:
```json
{
  "status": "error",
  "code": "PREDICTION_FAILED",
  "message": "Unable to generate prediction",
  "reason": "Missing player stats",
  "data": {
    "match": { /* info */ },
    "prediction": null,
    "betting": null
  }
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Antes de Pasar a Fase 2

**Integración de APIs**:
- [ ] SofaScore devuelve partidos del día
- [ ] The Odds API devuelve cuotas
- [ ] TML Database carga correctamente
- [ ] Fotos de jugadores se obtienen

**Predicciones ML**:
- [ ] Modelo carga correctamente
- [ ] Features se calculan (149)
- [ ] Probabilidades suman 1.0
- [ ] Confidence score es razonable (>0.6)

**Cálculos**:
- [ ] Expected Value se calcula correctamente
- [ ] Kelly Criterion da valores lógicos (<10%)
- [ ] Recomendación sigue criterios definidos

**Endpoints**:
- [ ] GET /api/v1/matches retorna lista completa
- [ ] Cada partido tiene predicción ML
- [ ] Cada partido tiene EV y Kelly
- [ ] Recomendación (BET/SKIP) presente
- [ ] POST /api/v1/bets guarda correctamente
- [ ] GET /api/v1/dashboard calcula métricas

**Caché**:
- [ ] Caché de partidos funciona (6h)
- [ ] Caché de cuotas funciona (30min)
- [ ] Refresco automático al expirar

**Pruebas manuales**:
```bash
# Test 1: Obtener partidos con predicciones
curl http://localhost:5000/api/v1/matches

# Verificar:
✓ Lista de partidos
✓ Cada partido tiene "prediction"
✓ Cada partido tiene "betting.ev"
✓ Cada partido tiene "betting.recommendation"

# Test 2: Filtrar por EV mínimo
curl http://localhost:5000/api/v1/matches?min_ev=0.03

# Verificar:
✓ Solo partidos con EV > 3%

# Test 3: Registrar apuesta
curl -X POST http://localhost:5000/api/v1/bets \
  -d '{"match_id":"match_001","stake":11.00}'

# Verificar:
✓ bet_id retornado
✓ Guardado en SQLite con prediction_probability y ev
```

---

## 📊 EJEMPLO DE FLUJO COMPLETO

### Usuario abre la app

**1. Frontend hace request**:
```
GET /api/v1/matches?date=today&min_ev=0.03
```

**2. Backend procesa** (automático):
```
a) Consulta SofaScore → 12 partidos hoy
b) Para cada partido:
   - Consulta The Odds API → Cuotas
   - Consulta TML Database → Stats (ELO, rankings)
   - Calcula 149 features
   - Modelo ML → Predicción (67.3% Sinner)
   - Calcula EV → +2.3%
   - Calcula Kelly → 11€ stake
   - Determina → BET (EV > 3% NO, pero ejemplo)
c) Filtra por min_ev=0.03
d) Retorna 3 partidos con valor
```

**3. Frontend recibe JSON**:
```json
{
  "matches": [
    {
      "player1": "Alcaraz",
      "player2": "Sinner",
      "prediction": {
        "winner": "player2",
        "probability": 0.673,
        "confidence": 0.87
      },
      "betting": {
        "ev": {"player2": 0.052},
        "kelly": {"player2": {"stake": 34.00}},
        "recommendation": {
          "action": "BET",
          "player": "player2",
          "stake": 34.00
        }
      }
    }
  ]
}
```

**4. Frontend muestra**:
```
┌─────────────────────────────────┐
│ 🎾 ATP Finals - Hard            │
│ Alcaraz 🇪🇸 vs Sinner 🇮🇹       │
│                                 │
│ 🤖 ML Prediction:               │
│ Sinner 67.3% ████████░░         │
│ Confidence: 87% 🟢              │
│                                 │
│ 💰 Betting Analysis:            │
│ EV: +5.2% 🟢                    │
│ Kelly: 3.4%                     │
│                                 │
│ ✅ RECOMENDACIÓN: BET           │
│ Stake sugerido: 34€             │
│ Cuota: 1.52 @ Bet365            │
│                                 │
│ [TRACK THIS BET]                │
└─────────────────────────────────┘
```

---

## 🎯 RESUMEN EJECUTIVO

### Qué hace la API

**Input**:
- Fecha (ej: hoy)

**Proceso**:
1. APIs externas → Datos partidos + cuotas
2. TML Database → Stats jugadores
3. Modelo ML → Predicción (probability, confidence)
4. Calcular EV → Hay valor?
5. Calcular Kelly → Cuánto apostar?
6. Recomendar → BET o SKIP?

**Output**:
- JSON completo con:
  - Info del partido
  - **Predicción del ML**
  - **Expected Value**
  - **Kelly stake**
  - **Recomendación**

### Sin esta fase, el frontend solo mostraría:
- ❌ Nombres de jugadores
- ❌ Cuotas crudas
- ❌ Sin análisis
- ❌ Sin recomendaciones

### Con esta fase, el frontend muestra:
- ✅ Predicciones inteligentes
- ✅ Análisis de valor (EV)
- ✅ Gestión de bankroll (Kelly)
- ✅ Recomendaciones claras
- ✅ **Tu ML en acción** ← ESTO ES EL CORE

---

**El valor del proyecto está en las predicciones del ML + análisis de valor, no solo en mostrar partidos.**
