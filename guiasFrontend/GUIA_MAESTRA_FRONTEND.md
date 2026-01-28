# 🎾 GUÍA MAESTRA - TENNIS BETTING INTELLIGENCE PLATFORM
# Frontend en React Native

---

## 📋 ÍNDICE

1. [Visión General del Proyecto](#visión-general)
2. [Arquitectura del Sistema](#arquitectura)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura de las Guías](#estructura-guías)
5. [Cronograma de Desarrollo](#cronograma)
6. [Métricas de Éxito](#métricas)

---

## 🎯 VISIÓN GENERAL DEL PROYECTO

### Objetivo Principal
Crear una aplicación móvil (iOS/Android) que permita a los usuarios consultar predicciones de partidos de tenis con análisis de valor esperado (EV), probabilidades calibradas, y recomendaciones de apuesta inteligentes basadas en Machine Learning.

### Propuesta de Valor
**"Tu asesor cuantitativo de apuestas deportivas"**

- ✅ Predicciones calibradas con 71.57% de accuracy
- ✅ Análisis de Expected Value en tiempo real
- ✅ Comparación automática de cuotas de múltiples bookmakers
- ✅ Gestión de bankroll con Kelly Criterion
- ✅ Transparencia total sobre cómo funciona el modelo
- ✅ Tracking personal de apuestas y rendimiento

### Usuarios Objetivo
1. **Apostadores recreacionales** que buscan mejorar sus decisiones
2. **Apostadores semi-profesionales** que valoran el análisis cuantitativo
3. **Entusiastas del tenis** interesados en datos y estadísticas

### Diferenciales Clave
- **No vendemos "tips"**: Proveemos herramientas para tomar decisiones informadas
- **Transparencia**: Mostramos cómo funciona el modelo y sus limitaciones
- **Educación**: Explicamos conceptos de apuestas (EV, Kelly, probabilidades)
- **Responsabilidad**: Recordamos los riesgos del juego

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                    REACT NATIVE APP                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │   Feed     │  │  Detalle   │  │    Dashboard     │  │
│  │  Partidos  │  │  Partido   │  │    Personal      │  │
│  └────────────┘  └────────────┘  │   (Tracking)     │  │
│         │              │          └──────────────────┘  │
└─────────┼──────────────┼─────────────────┼──────────────┘
          │              │                 │
          ▼              ▼                 ▼
┌──────────────────────────────────────────────────────────┐
│              API REST (Backend - Flask)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  GET /api/matches              - Lista partidos  │   │
│  │  GET /api/matches/:id          - Detalle partido │   │
│  │  POST /api/predict             - Generar pred.   │   │
│  │  GET /api/predictions          - Historial       │   │
│  │  GET /api/stats                - Estadísticas    │   │
│  │  POST /api/bets                - Registrar bet   │   │
│  │  GET /api/bets/user            - Bets usuario    │   │
│  │  GET /api/dashboard            - Métricas user   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                                │
│    ┌─────────────────────┼──────────────────────┐       │
│    ▼                     ▼                      ▼        │
│  ┌──────┐          ┌──────────┐          ┌──────────┐   │
│  │  ML  │          │ Database │          │ External │   │
│  │Model │          │(SQLite)  │          │   APIs   │   │
│  └──────┘          └──────────┘          └──────────┘   │
└──────────────────────────────────────────────────────────┘
          │                                        │
          ▼                                        ▼
  ┌───────────────┐                    ┌────────────────────┐
  │ Random Forest │                    │  API-SPORTS        │
  │   Calibrado   │                    │  (Fixture + Fotos) │
  │ + XGBoost     │                    │                    │
  │ + Kelly Calc  │                    │  The Odds API      │
  │               │                    │  (Cuotas)          │
  │               │                    │                    │
  │               │                    │  TML Database      │
  │               │                    │  (Stats Histór.)   │
  └───────────────┘                    └────────────────────┘
```

### Flujo de Datos Principal

**1. Usuario abre la app → Feed de Partidos**
```
App → GET /api/matches?date=today&status=upcoming
    ↓
Backend consulta API-SPORTS (fixture + fotos + info torneo)
    ↓
Backend consulta The Odds API (cuotas de bookmakers)
    ↓
Backend enriquece con TML Database (ELO, H2H, stats)
    ↓
Backend genera predicciones con el modelo ML
    ↓
Backend calcula EV para cada partido
    ↓
Backend devuelve JSON con partidos + predicciones + EV
    ↓
App muestra feed ordenado por EV descendente
```

**2. Usuario hace clic en un partido → Vista Detallada**
```
App → GET /api/matches/:match_id/analysis
    ↓
Backend obtiene:
  - Predicción del modelo (probabilidades calibradas)
  - Features que usó el modelo (ELO, H2H, forma, etc.)
  - Comparación de cuotas de múltiples bookmakers
  - Cálculo de Kelly Criterion
  - Estadísticas detalladas de jugadores
    ↓
Backend devuelve JSON completo con análisis
    ↓
App muestra vista detallada con capas de información
```

**3. Usuario registra una apuesta → Tracking**
```
App → POST /api/bets
    {
      match_id, player, stake, odds, 
      bookmaker, ev, kelly_pct
    }
    ↓
Backend guarda en base de datos SQLite
    ↓
Backend devuelve confirmación
    ↓
App actualiza dashboard personal
```

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
- **Framework**: React Native (Expo)
- **Navegación**: React Navigation 6
- **Estado Global**: Context API + AsyncStorage
- **HTTP Requests**: Axios
- **UI Components**: React Native Paper / NativeBase
- **Gráficos**: Victory Native / react-native-chart-kit
- **Animaciones**: Reanimated 2

### Backend (Ya existente - Mejoras necesarias)
- **Framework**: Flask + Flask-CORS
- **Base de Datos**: SQLite
- **ML Models**: Scikit-learn, XGBoost (ya entrenados)
- **APIs Externas**: 
  - API-Sports (fixture, fotos jugadores, info torneos)
  - The Odds API (cuotas de bookmakers)
  - TML Database (stats históricas, rankings, ELO)

### APIs Externas a Integrar

#### 1. API-Sports / API-Football (Principal - Fixture + Fotos)
- **URL**: https://www.api-football.com/sports
- **Plan Gratuito**: 100 requests/día (3,000/mes)
- **Uso**: 
  - Fixture de partidos (qué se juega hoy/mañana)
  - **Fotos de jugadores** (top 100+)
  - Información completa de torneos (nombre, superficie, ciudad)
  - Rankings actualizados
  - Banderas de países (SVG)
  - Logos ATP/WTA
- **Endpoints principales**:
  - GET /v1/games (partidos del día)
  - GET /v1/players (info + foto de jugador)
  - GET /v1/rankings (rankings ATP/WTA)
  - GET /v1/tournaments (lista de torneos)
- **Ejemplo de respuesta con foto**:
  ```json
  {
    "teams": {
      "home": {
        "name": "Jannik Sinner",
        "photo": "https://media.api-sports.io/tennis/players/123.png",
        "country": {
          "flag": "https://media.api-sports.io/flags/it.svg"
        }
      }
    },
    "tournament": {
      "name": "ATP Finals",
      "surface": "Hard"
    }
  }
  ```

#### 2. The Odds API (Cuotas de Bookmakers)
- **URL**: https://the-odds-api.com/
- **Plan Gratuito**: 500 requests/mes
- **Uso**: Obtener cuotas de múltiples bookmakers para comparación
- **Endpoints necesarios**:
  - GET /v4/sports/tennis_atp/odds
  - GET /v4/sports/tennis_wta/odds
- **Importante**: Solo provee cuotas, NO información del partido

#### 3. TML Database (Stats Históricas - Ya disponible)
- **URL**: https://github.com/Tennismylife/TML-Database
- **Actualización**: Semanal
- **Uso**: 
  - Rankings históricos por fecha
  - Cálculo de ELO para cada jugador
  - Estadísticas de servicio/resto
  - Head-to-Head histórico
  - Forma reciente (últimos 60 días)
- **Ventaja**: 25,000+ partidos (2022-2025), gratis

#### 4. The Sports DB (Opcional - Fotos de Fallback)
- **URL**: https://www.thesportsdb.com/api.php
- **Plan Gratuito**: Ilimitado (1 req/seg)
- **Uso**: Fotos HD adicionales si API-Sports no las tiene
- **Endpoints**:
  - GET /searchplayers.php?p={name}
  - Devuelve múltiples tipos de imágenes (thumb, cutout, banner)

### Flujo de Integración de APIs

**Conceptual**:
```python
# 1. API-Sports: Obtener fixture del día (1 call/día)
matches_today = api_sports.get_games(date='today')

# 2. The Odds API: Obtener cuotas (1 call/día)
odds_data = odds_api.get_matches('tennis_atp')

# 3. Para cada partido:
for match in matches_today:
    # a) Info completa de API-Sports
    player1_photo = match.teams.home.photo
    surface = match.tournament.surface
    
    # b) Cuotas de The Odds API (match por nombres)
    match_odds = find_odds(match.teams, odds_data)
    
    # c) Stats de TML Database
    stats = tml_db.get_stats(player1_name, player2_name)
    
    # d) Predicción ML
    prediction = model.predict({
        'surface': surface,  # De API-Sports
        'player1_elo': stats.elo1,  # De TML DB
        'player1_rank': stats.rank1  # De TML DB
    })
    
    # e) Calcular EV
    ev = calc_ev(prediction.prob, match_odds.best)

# Resultado: 2 API calls/día total
# API-Sports: 60 calls/mes (muy por debajo de 3,000)
# The Odds API: 60 calls/mes (muy por debajo de 500)
```

**Recomendación**: Stack híbrido API-Sports + The Odds API + TML Database cubre todas las necesidades con 0€/mes.

---

## 📚 ESTRUCTURA DE LAS GUÍAS

El desarrollo se divide en **5 fases progresivas**:

### **FASE 1: Arquitectura y Backend API** (Duración: 1 semana)
- Diseño completo de la API REST
- Mejora de endpoints existentes
- Creación de nuevos endpoints necesarios
- Sistema de autenticación básico (opcional para MVP)
- Documentación de API

### **FASE 2: Feed de Partidos (Lista Principal)** (Duración: 2 semanas)
- Setup de React Native con Expo
- Pantalla principal con lista de partidos
- Integración con API backend
- Sistema de filtros y ordenamiento
- Pull-to-refresh y loading states
- Navegación básica

### **FASE 3: Vista Detallada de Partido** (Duración: 2 semanas)
- Pantalla de análisis completo del partido
- Visualización de probabilidades y EV
- Gráficos de estadísticas comparativas
- Explicación de factores del modelo
- Comparador de bookmakers
- Calculadora de Kelly Criterion

### **FASE 4: Dashboard Personal y Tracking** (Duración: 2 semanas)
- Sistema de registro de apuestas
- Dashboard con métricas personales
- Gráficos de rendimiento histórico
- Historial de apuestas
- Estadísticas de seguimiento del modelo

### **FASE 5: Optimización y Lanzamiento** (Duración: 1-2 semanas)
- Optimización de performance
- Testing exhaustivo
- UI/UX polish
- Onboarding educativo
- Build para producción
- Preparación para stores

**Total estimado**: 8-10 semanas

---

## 📅 CRONOGRAMA DE DESARROLLO

### Semana 1: Fase 1 (Backend)
- Días 1-2: Diseño de API y documentación
- Días 3-4: Implementación de nuevos endpoints
- Día 5: Testing y validación
- Días 6-7: Documentación y preparación para frontend

### Semanas 2-3: Fase 2 (Feed de Partidos)
- Semana 2: Setup, navegación, componentes básicos
- Semana 3: Integración con API, filtros, polish

### Semanas 4-5: Fase 3 (Vista Detallada)
- Semana 4: Layout, análisis básico, estadísticas
- Semana 5: Gráficos, comparador bookmakers, calculadora

### Semanas 6-7: Fase 4 (Dashboard y Tracking)
- Semana 6: Registro de apuestas, persistencia
- Semana 7: Dashboard, métricas, gráficos de rendimiento

### Semanas 8-9: Fase 5 (Optimización)
- Semana 8: Performance, testing, bugs
- Semana 9: UI/UX polish, onboarding

### Semana 10: Buffer y Lanzamiento
- Testing final
- Preparación de builds
- Documentación de usuario

---

## 🎯 MÉTRICAS DE ÉXITO

### Métricas Técnicas (MVP)
- ✅ App funciona en iOS y Android
- ✅ Tiempo de carga < 2 segundos
- ✅ Tasa de errores < 1%
- ✅ Cobertura de pruebas > 70%
- ✅ API response time < 500ms

### Métricas de Usuario (Post-MVP)
- 📊 Usuarios activos diarios (DAU)
- 📊 Retención D7 > 30%
- 📊 Tiempo promedio en app > 5 min
- 📊 Conversión a registro > 40%
- 📊 NPS (Net Promoter Score) > 50

### Métricas de Valor
- 💰 % usuarios que siguen recomendaciones del modelo
- 💰 ROI promedio de usuarios que siguen modelo
- 💰 Engagement con sección educativa

---

## 🚨 CONSIDERACIONES CRÍTICAS

### 1. Legalidad y Responsabilidad
- **NO procesamos pagos**: Solo recomendamos, no ejecutamos apuestas
- **Disclaimer visible**: "Esta app es educativa. Apostar implica riesgos"
- **Mayores de edad**: Verificación de edad recomendada
- **Juego responsable**: Alertas cuando se detecta comportamiento riesgoso

### 2. Performance
- **Caché inteligente**: No hacer requests innecesarios a la API
- **Lazy loading**: Cargar datos progresivamente
- **Imágenes optimizadas**: Usar WebP cuando sea posible
- **Minimize renders**: React.memo y useMemo estratégicamente

### 3. Escalabilidad Futura
- **API versionada**: /api/v1/... para permitir cambios
- **Database preparada**: SQLite es suficiente para 10k usuarios
- **Modular architecture**: Fácil agregar features sin refactorizar

### 4. Experiencia de Usuario
- **Mobile-first**: Diseñar para pulgar
- **Offline-first**: Funcionar sin conexión cuando sea posible
- **Feedback inmediato**: Loading states y confirmaciones claras
- **Educación progresiva**: Tooltips y ayudas contextuales

---

## 📖 CÓMO USAR ESTAS GUÍAS

### Orden de Lectura
1. ✅ Leer esta Guía Maestra completa
2. ➡️ Leer FASE_1_BACKEND_API.md (Diseño de API)
3. ➡️ Implementar backend según FASE 1
4. ➡️ Leer FASE_2_FEED_PARTIDOS.md
5. ➡️ Implementar frontend Fase 2
6. ➡️ Continuar secuencialmente con Fases 3, 4, 5

### Principios de Desarrollo
1. **Una fase a la vez**: No adelantarse
2. **Validar antes de avanzar**: Cada fase debe funcionar 100%
3. **Documentar decisiones**: Registrar por qué se hace algo
4. **Testear continuamente**: No dejar testing para el final
5. **Iterar sobre feedback**: Probar con usuarios reales lo antes posible

### Recursos Adicionales
- **React Native Docs**: https://reactnative.dev/
- **Expo Docs**: https://docs.expo.dev/
- **The Odds API Docs**: https://the-odds-api.com/liveapi/guides/v4/
- **Flask CORS**: https://flask-cors.readthedocs.io/

---

## 🎯 CHECKLIST DE INICIO

Antes de comenzar la Fase 1, asegúrate de tener:

- [ ] Node.js 16+ instalado
- [ ] Python 3.8+ con el proyecto ML funcionando
- [ ] Cuenta en The Odds API con API key
- [ ] Expo CLI instalado (`npm install -g expo-cli`)
- [ ] Editor de código (VS Code recomendado)
- [ ] Git configurado
- [ ] Emulador iOS/Android o dispositivo físico para pruebas

---

## 📞 PRÓXIMOS PASOS

1. ✅ Revisar esta guía maestra completa
2. ➡️ Abrir y leer **FASE_1_BACKEND_API.md**
3. ➡️ Diseñar los endpoints de la API
4. ➡️ Implementar endpoints según especificaciones
5. ➡️ Testear API con Postman/Insomnia
6. ➡️ Continuar con Fase 2

---

**¡Estás listo para comenzar! 🚀**

La siguiente guía es **FASE_1_BACKEND_API.md**, donde diseñaremos toda la API REST necesaria para el frontend.
