# 🎾 FASE 2: FEED DE PARTIDOS (Lista Principal)
# Duración Estimada: 2 semanas

---

## 📋 ÍNDICE

1. [Objetivos de esta Fase](#objetivos)
2. [Setup de React Native](#setup)
3. [Arquitectura del Frontend](#arquitectura)
4. [Componentes Principales](#componentes)
5. [Gestión de Estado](#estado)
6. [Integración con API](#api-integration)
7. [Diseño Visual (UI/UX)](#diseño)
8. [Optimizaciones de Performance](#performance)
9. [Checklist de Validación](#checklist)

---

## 🎯 OBJETIVOS DE ESTA FASE

### Qué vamos a lograr
1. ✅ Setup completo de React Native con Expo
2. ✅ Navegación entre pantallas configurada
3. ✅ Pantalla principal con feed de partidos
4. ✅ Integración con backend API
5. ✅ Sistema de filtros y ordenamiento
6. ✅ Pull-to-refresh y estados de carga
7. ✅ Navegación a vista detallada del partido

### Entregables
- Aplicación React Native funcional
- Pantalla de Feed de Partidos completa
- Sistema de navegación básico
- Integración con API backend
- Estados de loading, error, y vacío manejados

---

## 🛠️ SETUP DE REACT NATIVE

### Opción Recomendada: Expo

**Por qué Expo**:
- Setup más rápido
- Testing en dispositivo real fácil (Expo Go app)
- Build de producción simplificado
- Updates over-the-air
- Menor fricción para comenzar

### Estructura de Carpetas

```
tennis-betting-app/
├── src/
│   ├── screens/
│   │   ├── MatchFeedScreen.js       # Pantalla principal
│   │   ├── MatchDetailScreen.js     # Vista detallada (Fase 3)
│   │   └── DashboardScreen.js       # Dashboard (Fase 4)
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── ErrorMessage.js
│   │   │   └── EmptyState.js
│   │   │
│   │   ├── match/
│   │   │   ├── MatchCard.js         # Card individual de partido
│   │   │   ├── MatchFilters.js      # Filtros de la lista
│   │   │   └── ConfidenceBadge.js   # Badge de confianza
│   │   │
│   │   └── layout/
│   │       ├── AppHeader.js
│   │       └── TabBar.js
│   │
│   ├── services/
│   │   └── api/
│   │       ├── apiClient.js         # Configuración de Axios
│   │       ├── matchService.js      # Requests de partidos
│   │       ├── betService.js        # Requests de apuestas
│   │       └── errorHandler.js      # Manejo de errores
│   │
│   ├── context/
│   │   ├── MatchContext.js          # Estado global de partidos
│   │   └── UserContext.js           # Datos del usuario (Fase 4)
│   │
│   ├── utils/
│   │   ├── formatters.js            # Formateo de datos
│   │   ├── constants.js             # Constantes de la app
│   │   └── helpers.js               # Funciones auxiliares
│   │
│   ├── styles/
│   │   ├── colors.js                # Paleta de colores
│   │   ├── typography.js            # Estilos de texto
│   │   └── spacing.js               # Sistema de espaciado
│   │
│   └── navigation/
│       └── AppNavigator.js          # Navegación principal
│
├── assets/
│   ├── images/
│   └── fonts/
│
├── App.js                            # Entry point
├── app.json                          # Configuración de Expo
└── package.json
```

### Dependencias Iniciales

**Core**:
- `expo`
- `react-native`
- `react-navigation`
- `@react-navigation/native`
- `@react-navigation/stack`
- `@react-navigation/bottom-tabs`

**UI**:
- `react-native-paper` (Material Design components)
- `react-native-vector-icons`
- `react-native-linear-gradient`

**Data & Networking**:
- `axios` (HTTP requests)
- `@react-native-async-storage/async-storage` (persistencia local)

**Utilities**:
- `date-fns` (manejo de fechas)
- `lodash` (utilidades)

---

## 🏗️ ARQUITECTURA DEL FRONTEND

### Flujo de Datos

```
┌─────────────────────────────────────────┐
│         MATCH FEED SCREEN               │
│  ┌───────────────────────────────────┐  │
│  │  useEffect on mount               │  │
│  │    → fetchMatches()               │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         MATCH SERVICE (API)             │
│  ┌───────────────────────────────────┐  │
│  │  GET /api/v1/matches              │  │
│  │    params: date, min_ev, sort     │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       BACKEND API (Flask)               │
│  - Consulta The Odds API                │
│  - Genera predicciones con ML           │
│  - Calcula EV para cada partido         │
│  - Retorna JSON                         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         MATCH CONTEXT                   │
│  - Almacena matches en estado global    │
│  - Proporciona a componentes hijos      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      MATCH FEED SCREEN (Render)        │
│  - FlatList con MatchCard components    │
│  - Pull-to-refresh                      │
│  - Loading states                       │
│  - Error handling                       │
└─────────────────────────────────────────┘
```

### Patrón de Componentes

**Componentes Contenedores (Smart Components)**:
- Manejan estado
- Hacen requests a API
- Contienen lógica de negocio
- Ejemplo: `MatchFeedScreen`

**Componentes Presentacionales (Dumb Components)**:
- Solo reciben props
- Renderizan UI
- Sin estado propio
- Ejemplo: `MatchCard`, `ConfidenceBadge`

---

## 🧩 COMPONENTES PRINCIPALES

### 1. MatchFeedScreen (Pantalla Principal)

**Responsabilidades**:
- Obtener lista de partidos desde API
- Manejar estados de loading, error, vacío
- Proveer filtros y ordenamiento
- Navegar a detalle al hacer tap en partido
- Pull-to-refresh para actualizar datos

**Estados necesarios**:
- `matches`: Array de partidos
- `loading`: Boolean para spinner
- `error`: String con mensaje de error
- `refreshing`: Boolean para pull-to-refresh
- `filters`: Objeto con filtros activos
  - `minEV`: Number
  - `surface`: String
  - `sortBy`: String

**Flujo de la pantalla**:
```
1. useEffect on mount:
   - setLoading(true)
   - fetchMatches()
   - setMatches(data)
   - setLoading(false)

2. User pulls down:
   - setRefreshing(true)
   - fetchMatches()
   - setMatches(data)
   - setRefreshing(false)

3. User applies filter:
   - updateFilters(newFilters)
   - fetchMatches(newFilters)

4. User taps match:
   - navigation.navigate('MatchDetail', { matchId })
```

**Layout conceptual**:
```
┌────────────────────────────────────────┐
│ 🎾 Tennis Betting Intelligence         │  ← Header
├────────────────────────────────────────┤
│ [Filters Button]  [Sort Dropdown]      │  ← Filter Bar
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Match Card 1                     │ │  ← FlatList
│  │ - Players                        │ │
│  │ - Tournament                     │ │
│  │ - Prediction (87% confidence)    │ │
│  │ - EV: +5.2%  ✅ BET             │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Match Card 2                     │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Match Card 3                     │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

### 2. MatchCard (Componente de Partido Individual)

**Props**:
```javascript
{
  match: {
    id, date, time, tournament,
    player1, player2,
    prediction, betting
  },
  onPress: function
}
```

**Layout conceptual**:
```
┌────────────────────────────────────────┐
│ 🎾 ATP Finals • Turin 🇮🇹 | Hard       │  ← Tournament + flag + surface
│ Final • Dec 16, 14:00                  │  ← Round + date + time
├────────────────────────────────────────┤
│                                        │
│  ┌────┐                                │
│  │📷  │ 🇪🇸 Carlos Alcaraz      [#3]   │  ← Photo + flag + name + rank
│  └────┘                                │
│                                        │
│         ⚔️ VERSUS ⚔️                  │
│                                        │
│  ┌────┐                                │
│  │📷  │ 🇮🇹 Jannik Sinner        [#1]   │  ← Photo + flag + name + rank
│  └────┘                                │
│                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│  📊 Model Confidence: ████████░░ 87%  │  ← Model confidence
│  💰 Expected Value: +5.2%             │  ← EV
│                                        │
│  ✅ RECOMMENDATION: BET on Sinner     │  ← Recommendation
│                                        │
│  [View Full Analysis →]               │  ← CTA Button
└────────────────────────────────────────┘
```

**Assets visuales incluidos (de API-Sports)**:
- ✅ **Fotos de jugadores**: URLs de imagen (ej: `player.photo_url`)
- ✅ **Banderas de países**: SVG (ej: `player.flag_url`)
- ✅ **Logo ATP/WTA**: Para el header
- ✅ **Info del torneo completa**: Nombre, ciudad, país
- ✅ **Ronda del torneo**: "Final", "Semifinal", etc.

**Estilos visuales**:
- **Color de borde**: Verde si EV > 3%, Amarillo si 0-3%, Gris si negativo
- **Badge de confianza**: Barra de progreso con colores
  - Verde: > 80%
  - Amarillo: 60-80%
  - Rojo: < 60%
- **Recomendación**: 
  - ✅ BET (verde) si EV > 3%
  - ⚠️ MARGINAL (amarillo) si EV 0-3%
  - ⛔ NO BET (rojo) si EV < 0%

---

### 3. MatchFilters (Componente de Filtros)

**Props**:
```javascript
{
  currentFilters: object,
  onApplyFilters: function
}
```

**Filtros disponibles**:
1. **Confianza mínima**:
   - Opciones: Any, >60%, >70%, >80%
   - Slider o botones
   
2. **Expected Value mínimo**:
   - Opciones: Any, >0%, >3%, >5%
   - Slider o botones

3. **Superficie**:
   - Opciones: All, Hard, Clay, Grass
   - Chips o dropdown

4. **Torneo**:
   - Dropdown con torneos disponibles
   - Opción "All tournaments"

5. **Ordenar por**:
   - EV descendente (default)
   - Confianza descendente
   - Hora del partido

**Layout conceptual**:
```
┌────────────────────────────────────────┐
│ FILTROS                                │
├────────────────────────────────────────┤
│                                        │
│ Confianza mínima:                      │
│ [Any] [>60%] [>70%] [>80%]            │
│                                        │
│ Expected Value mínimo:                 │
│ [Any] [>0%] [>3%] [>5%]               │
│                                        │
│ Superficie:                            │
│ [All] [Hard] [Clay] [Grass]           │
│                                        │
│ Ordenar por:                           │
│ [▼ EV Descendente]                     │
│                                        │
│ [Limpiar]         [Aplicar Filtros]   │
└────────────────────────────────────────┘
```

---

### 4. Estados Especiales

**LoadingSpinner**:
```
┌────────────────────────────────────────┐
│                                        │
│                                        │
│           [Spinner animado]            │
│                                        │
│     Cargando predicciones...           │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

**ErrorMessage**:
```
┌────────────────────────────────────────┐
│                                        │
│              ⚠️                        │
│                                        │
│   No se pudieron cargar los partidos   │
│                                        │
│   [Reintentar]                         │
│                                        │
└────────────────────────────────────────┘
```

**EmptyState**:
```
┌────────────────────────────────────────┐
│                                        │
│              🎾                        │
│                                        │
│   No hay partidos disponibles hoy      │
│                                        │
│   Vuelve mañana para nuevas            │
│   predicciones                         │
│                                        │
└────────────────────────────────────────┘
```

---

## 🔄 GESTIÓN DE ESTADO

### Context API Pattern

**MatchContext.js**:
```javascript
Propósito:
- Almacenar lista de partidos globalmente
- Proveer funciones para actualizar datos
- Evitar prop drilling

Estado:
- matches: Array
- loading: Boolean
- error: String | null
- lastUpdated: Date

Funciones:
- fetchMatches(filters)
- refreshMatches()
- getMatchById(id)
- clearError()
```

**Uso en componentes**:
```javascript
Conceptual:

En MatchFeedScreen:
  - Consume MatchContext
  - Usa fetchMatches() on mount
  - Renderiza matches del context

En MatchDetailScreen:
  - Consume MatchContext
  - Usa getMatchById(id) para obtener datos
  - Si no está en context, hace request a API
```

### AsyncStorage para Persistencia

**Datos a cachear localmente**:
- Última lista de partidos (5 minutos)
- Filtros preferidos del usuario
- Historial de navegación (opcional)

**Estrategia**:
```
1. Al cargar partidos desde API:
   - Guardar en AsyncStorage con timestamp
   
2. Al abrir app:
   - Verificar si hay datos cacheados
   - Si < 5 minutos → Mostrar caché mientras se actualiza
   - Si > 5 minutos → Mostrar loading y fetchear nuevo

3. Al cerrar app:
   - Guardar filtros activos
   - Guardar scroll position (opcional)
```

---

## 🌐 INTEGRACIÓN CON API

### apiClient.js (Configuración de Axios)

**Configuración base**:
```javascript
Conceptual:

Base URL: http://tu-servidor.com/api/v1
Headers:
  - Content-Type: application/json
  - Accept: application/json

Timeout: 10 segundos

Interceptors:
  - Request: Añadir token si existe (Fase 4)
  - Response: Manejo global de errores
  - Response: Log para debugging
```

### matchService.js

**Funciones necesarias**:
```javascript
Conceptual:

fetchMatches(filters):
  - GET /api/v1/matches
  - Query params: date, min_ev, surface, sort
  - Retorna: { matches: [...], total: N }

fetchMatchDetail(matchId):
  - GET /api/v1/matches/:matchId
  - Retorna: { match: {...} } con análisis completo

Las funciones retornan Promises
Manejo de errores con try/catch
```

### errorHandler.js

**Tipos de errores a manejar**:
```javascript
Conceptual:

1. Network Error (sin conexión):
   - Mensaje: "Sin conexión a internet"
   - Acción: Mostrar caché si existe

2. Timeout (request tardó mucho):
   - Mensaje: "El servidor tardó en responder"
   - Acción: Ofrecer reintentar

3. Server Error 500:
   - Mensaje: "Error del servidor"
   - Acción: Reintentar automáticamente 1 vez

4. Not Found 404:
   - Mensaje: "Partido no encontrado"
   - Acción: Volver a lista

5. Bad Request 400:
   - Mensaje: "Datos inválidos"
   - Acción: Log error para debugging
```

---

## 🎨 DISEÑO VISUAL (UI/UX)

### Paleta de Colores

**Colores principales**:
```javascript
colors.js:

primary: '#1E88E5'        // Azul principal
secondary: '#43A047'      // Verde para apuestas positivas
accent: '#FFB300'         // Amarillo para warnings

// Semáforo de confianza/EV
success: '#00C853'        // Verde fuerte (>80%, >5% EV)
warning: '#FFA726'        // Naranja (60-80%, 0-5% EV)
danger: '#E53935'         // Rojo (<60%, EV negativo)

// Neutrales
background: '#FAFAFA'
surface: '#FFFFFF'
text: {
  primary: '#212121',
  secondary: '#757575'
}
```

### Tipografía

**Sistema de fuentes**:
```javascript
typography.js:

heading1: {
  fontSize: 28,
  fontWeight: 'bold',
  letterSpacing: 0.5
}

heading2: {
  fontSize: 22,
  fontWeight: '600'
}

body: {
  fontSize: 16,
  lineHeight: 24
}

caption: {
  fontSize: 12,
  color: colors.text.secondary
}
```

### Espaciado Consistente

**Sistema de espaciado**:
```javascript
spacing.js:

xs: 4
sm: 8
md: 16
lg: 24
xl: 32
xxl: 48
```

### Componentes de UI

**Usar librería de componentes**:
- React Native Paper (Material Design)
- Componentes pre-hechos: Button, Card, Chip, Badge
- Consistencia visual out-of-the-box
- Theming centralizado

---

## ⚡ OPTIMIZACIONES DE PERFORMANCE

### 1. FlatList Optimizada

**Configuraciones importantes**:
```javascript
Conceptual:

<FlatList
  data={matches}
  renderItem={renderMatchCard}
  
  // Performance props
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  
  // Optimizaciones
  removeClippedSubviews={true}
  getItemLayout={getItemLayout}  // Si todos items mismo height
  
  // Pull to refresh
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
/>
```

### 2. Memoización de Componentes

**Usar React.memo**:
```javascript
Conceptual:

MatchCard component:
  - Envolver en React.memo
  - Solo re-renderiza si props cambian
  - Importante si lista tiene muchos items

ConfidenceBadge:
  - También memoizar
  - Evita cálculos innecesarios
```

### 3. Lazy Loading de Imágenes

**Si se añaden imágenes**:
- Usar placeholders mientras cargan
- Lazy load para imágenes below the fold
- Cachear imágenes descargadas

### 4. Debouncing de Filtros

**Si filtros tienen input de texto**:
```javascript
Conceptual:

Usar debounce para searches:
  - Usuario escribe en buscador
  - Esperar 300ms sin typing
  - Entonces hacer request a API
  - Evita requests en cada keystroke
```

---

## 🧪 TESTING DE LA FASE 2

### Tests Manuales Esenciales

**Test 1: Primera carga**
```
1. Abrir app
2. Verificar: Spinner aparece
3. Verificar: Lista de partidos se carga
4. Verificar: Cada partido muestra datos correctos
5. Verificar: Recomendación de apuesta es clara
```

**Test 2: Pull to refresh**
```
1. En feed, pull down
2. Verificar: Spinner de refresh aparece
3. Verificar: Lista se actualiza
4. Verificar: Nuevos datos si cambiaron
```

**Test 3: Filtros**
```
1. Tap en botón de filtros
2. Seleccionar "EV > 5%"
3. Aplicar filtros
4. Verificar: Solo partidos con EV > 5% aparecen
5. Limpiar filtros
6. Verificar: Todos los partidos vuelven
```

**Test 4: Navegación a detalle**
```
1. Tap en un partido
2. Verificar: Navega a pantalla de detalle
3. Verificar: matchId correcto se pasa
```

**Test 5: Manejo de errores**
```
1. Desconectar internet
2. Pull to refresh
3. Verificar: Mensaje de error aparece
4. Verificar: Opción de reintentar disponible
5. Reconectar y reintentar
6. Verificar: Lista se carga
```

**Test 6: Estado vacío**
```
1. Configurar filtros muy restrictivos
2. Verificar: Mensaje "No matches found" aparece
3. Verificar: Sugerencia de cambiar filtros
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Antes de pasar a Fase 3

**Setup y Configuración**:
- [ ] Expo app inicializada correctamente
- [ ] Dependencias instaladas
- [ ] App corre en emulador iOS
- [ ] App corre en emulador Android
- [ ] Hot reload funcionando

**Pantalla Principal**:
- [ ] Feed de partidos se muestra correctamente
- [ ] Cada MatchCard tiene toda la info necesaria
- [ ] Colores de confianza/EV son correctos
- [ ] Layout es responsive en diferentes tamaños
- [ ] Scroll es fluido (60 FPS)

**Funcionalidad**:
- [ ] Request a API funciona
- [ ] Datos del backend se parsean correctamente
- [ ] Loading state funciona
- [ ] Error state funciona
- [ ] Empty state funciona
- [ ] Pull-to-refresh funciona
- [ ] Filtros se aplican correctamente
- [ ] Navegación a detalle funciona

**Performance**:
- [ ] FlatList renderiza rápido (< 1s para 20 items)
- [ ] No hay re-renders innecesarios
- [ ] Memoria no crece indefinidamente
- [ ] No hay warnings en consola

**UI/UX**:
- [ ] Diseño es atractivo visualmente
- [ ] Textos son legibles
- [ ] Colores son consistentes
- [ ] Espaciado es uniforme
- [ ] Touch targets son suficientemente grandes (>44px)
- [ ] Feedback visual al interactuar (tap highlight)

---

## 📝 NOTAS IMPORTANTES

### Best Practices

**1. Keep Components Small**
- Cada componente debe hacer UNA cosa bien
- Si un componente pasa de 200 líneas, dividir

**2. Extract Business Logic**
- Lógica compleja fuera de componentes
- Crear utils/ o helpers/ para funciones reutilizables

**3. Consistent Naming**
- Componentes: PascalCase (MatchCard.js)
- Funciones: camelCase (fetchMatches)
- Constantes: UPPER_SNAKE_CASE (API_BASE_URL)

**4. PropTypes o TypeScript**
- Documentar props esperadas
- Catch errores en desarrollo

**5. Handle Edge Cases**
- Qué pasa si API retorna 0 partidos?
- Qué pasa si falta un campo en la respuesta?
- Qué pasa si el usuario tiene internet lento?

---

## 🚀 PRÓXIMOS PASOS

Una vez completada la Fase 2:

1. ✅ Validar todos los checkpoints
2. ✅ Probar en dispositivos reales (iOS y Android)
3. ✅ Ajustar UI según feedback
4. ✅ Optimizar performance si es necesario
5. ➡️ Pasar a **FASE_3_VISTA_DETALLADA.md**

---

**🎯 Meta de esta fase**: App con feed de partidos funcional, atractiva, y optimizada.

**⏱️ Tiempo estimado**: 10-14 días de desarrollo + testing
