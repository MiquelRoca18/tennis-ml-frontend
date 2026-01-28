# 🎾 FASE 3: VISTA DETALLADA DE PARTIDO (Análisis Completo)
# Duración Estimada: 2 semanas

---

## 📋 ÍNDICE

1. [Objetivos de esta Fase](#objetivos)
2. [Arquitectura de Información](#arquitectura-info)
3. [Componentes de la Vista](#componentes)
4. [Visualización de Datos](#visualizacion)
5. [Calculadora Interactiva](#calculadora)
6. [Elementos Educativos](#educacion)
7. [Optimizaciones](#optimizaciones)
8. [Checklist de Validación](#checklist)

---

## 🎯 OBJETIVOS DE ESTA FASE

### Qué vamos a lograr
1. ✅ Pantalla de análisis detallado del partido
2. ✅ Visualización clara de probabilidades y factores
3. ✅ Gráficos comparativos de jugadores
4. ✅ Comparador de cuotas de bookmakers
5. ✅ Calculadora de Kelly Criterion interactiva
6. ✅ Explicaciones educativas de conceptos clave
7. ✅ Sistema de capas de información (progressive disclosure)

### Entregables
- MatchDetailScreen completa
- Componentes de análisis reutilizables
- Sistema de tabs para organizar información
- Gráficos interactivos de estadísticas
- Elementos educativos integrados

---

## 🏗️ ARQUITECTURA DE INFORMACIÓN

### Principio: Progressive Disclosure

La información se organiza en **capas de profundidad**:

**Capa 1: Resumen Ejecutivo (Above the fold)**
- Predicción principal
- Probabilidades
- Expected Value
- Recomendación clara

**Capa 2: Fundamentos (Requiere scroll)**
- Factores decisivos del modelo
- Comparación básica de jugadores
- Cuotas de bookmakers

**Capa 3: Análisis Profundo (Tabs o acordeones)**
- Estadísticas detalladas
- Gráficos comparativos
- Head-to-Head histórico
- Análisis de contexto

**Capa 4: Herramientas (Interactivas)**
- Calculadora de Kelly
- Simulador de escenarios
- Sección educativa

### Estructura de Navegación

```
MatchDetailScreen
├── ScrollView
│   ├── ExecutiveSummarySection
│   ├── KeyFactorsSection
│   ├── BookmakerComparisonSection
│   ├── DetailedStatsSection (Tabs)
│   │   ├── Tab: Statistics
│   │   ├── Tab: Head to Head
│   │   └── Tab: Context
│   ├── KellyCalculatorSection
│   └── EducationalSection
└── Footer
    └── ActionButtons
        ├── Track Bet
        └── Share Analysis
```

---

## 🧩 COMPONENTES DE LA VISTA

### 1. ExecutiveSummarySection

**Layout conceptual**:
```
┌────────────────────────────────────────┐
│ 🎾 ATP Finals • Turin 🇮🇹 | Hard       │
│ Final • Saturday, Dec 16, 2024 - 14:00│
├────────────────────────────────────────┤
│                                        │
│        MODEL PREDICTION                │
│                                        │
│    Jannik Sinner has 67.3%            │
│    probability to win                  │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  ┌────┐          ┌────┐        │   │
│  │  │📷  │ SINNER   │📷  │ ALCARAZ│   │
│  │  │    │ 🇮🇹       │    │ 🇪🇸     │   │
│  │  └────┘          └────┘        │   │
│  │                                │   │
│  │  67.3%            32.7%        │   │
│  │  Odds: 1.52       Odds: 2.75  │   │
│  │  EV: +5.2% ✅     EV: -8.4% ⛔ │   │
│  └────────────────────────────────┘   │
│                                        │
│  🎯 RECOMMENDATION: BET                │
│  Bet on Sinner @ 1.52 (Bet365)       │
│                                        │
│  📊 Confidence: ████████░░ 87%        │
│                                        │
└────────────────────────────────────────┘
```

**Assets visuales incluidos (de API-Sports)**:
- ✅ **Fotos de jugadores**: Circular thumbnails
- ✅ **Banderas de países**: SVG icons
- ✅ **Info del torneo**: Nombre completo con ciudad
- ✅ **Ronda del torneo**: "Final", "Semifinal", etc.

**Elementos clave**:
- **Hero section** con predicción principal
- **Comparación lado a lado** de los dos jugadores
- **Indicadores visuales** claros (✅ / ⛔)
- **Badge de confianza** prominente
- **Colores**: Verde para EV positivo, Rojo para negativo

**Interactividad**:
- Tap en "📊 Confianza 87%" → Tooltip explicando qué significa
- Tap en "EV: +5.2%" → Modal con explicación de Expected Value

---

### 2. KeyFactorsSection

**Layout conceptual**:
```
┌────────────────────────────────────────┐
│ 🎯 FACTORES DECISIVOS                  │
├────────────────────────────────────────┤
│                                        │
│ ¿Por qué favorecemos a Sinner?        │
│                                        │
│ ✅ Ventaja ELO en Hard: +156 puntos   │
│    Impacto: ⭐⭐⭐⭐⭐              │
│    [Ver más]                           │
│                                        │
│ ✅ Mejor forma reciente: 15-3 vs 12-5 │
│    Impacto: ⭐⭐⭐⭐                 │
│    [Ver más]                           │
│                                        │
│ ✅ Servicio más efectivo: 82% vs 78% │
│    Impacto: ⭐⭐⭐                    │
│    [Ver más]                           │
│                                        │
│ ⚠️  H2H favorable a Alcaraz: 4-2      │
│    Impacto: ⭐⭐ (datos antiguos)      │
│    [Ver más]                           │
│                                        │
└────────────────────────────────────────┘
```

**Datos a mostrar**:
- Top 5 factores del modelo (por feature importance)
- Impacto visual con estrellas (1-5)
- Color: Verde si favorece al favorito, Amarillo si es neutral
- Expandible para ver detalles de cada factor

**Cómo determinar factores**:
```javascript
Conceptual:

Del backend (key_factors array):
  - Cada factor tiene: name, value, impact, favors
  - Ordenar por impact descendente
  - Mostrar top 5
  - Asignar estrellas según impact:
    - very_high: 5 estrellas
    - high: 4 estrellas
    - medium: 3 estrellas
    - low: 2 estrellas
```

---

### 3. PlayerComparisonSection

**Layout conceptual** (Card expandible):
```
┌────────────────────────────────────────┐
│ 📊 COMPARACIÓN DE JUGADORES            │
│ [Expandir ▼]                           │
├────────────────────────────────────────┤
│                                        │
│         Sinner         Alcaraz         │
│                                        │
│ ELO     2247      vs   2189           │
│ ████████████████░░ 100%  92%          │
│                                        │
│ Rank    #1        vs   #3             │
│ ████████████████░░ 100%  75%          │
│                                        │
│ Forma   15-3      vs   12-5           │
│ (60d)   ████████░░░░ 83%  71%         │
│                                        │
│ [Ver Estadísticas Detalladas →]       │
│                                        │
└────────────────────────────────────────┘
```

**Métricas a comparar**:
1. ELO Rating (general y por superficie)
2. Ranking ATP
3. Forma reciente (últimos 60 días)
4. Win rate en superficie
5. Servicio (1st serve %, aces)
6. Resto (break points convertidos)

**Visualización**:
- Barras horizontales comparativas
- Porcentajes normalizados
- Color del mejor en verde, el otro en gris
- Opción de expandir para ver más stats

---

### 4. BookmakerComparisonSection

**Layout conceptual**:
```
┌────────────────────────────────────────┐
│ 💰 COMPARACIÓN DE CASAS DE APUESTAS    │
├────────────────────────────────────────┤
│                                        │
│ Apostando en: Sinner                   │
│                                        │
│ Bet365      1.52   EV: +5.2%  ✅ MEJOR│
│ ████████████████░░░                    │
│                                        │
│ Betfair     1.50   EV: +4.1%          │
│ █████████████████░                     │
│                                        │
│ William H.  1.48   EV: +2.9%          │
│ ████████████████░░                     │
│                                        │
│ 💡 Line Shopping:                      │
│ Ganancia adicional: +2.3%              │
│ (vs peor cuota disponible)             │
│                                        │
└────────────────────────────────────────┘
```

**Elementos**:
- Lista ordenada por EV descendente
- Highlight en la mejor cuota (borde verde)
- Barra visual de EV para comparar
- Explicación de "line shopping" con ahorro calculado

**Interactividad**:
- Tap en bookmaker → Link a sitio web (opcional)
- Switch para cambiar entre Sinner / Alcaraz

---

### 5. DetailedStatsSection (Tabs)

**Estructura de tabs**:
```
┌────────────────────────────────────────┐
│ [Statistics] [Head to Head] [Context]  │  ← Tabs
├────────────────────────────────────────┤
│                                        │
│  [Contenido del tab activo]            │
│                                        │
└────────────────────────────────────────┘
```

#### Tab 1: Statistics

**Visualización tipo "Battle Stats"**:
```
┌────────────────────────────────────────┐
│ SERVICIO                               │
│                                        │
│ First Serve %                          │
│ Sinner    71% ██████████████          │
│ Alcaraz   68% ████████████░░          │
│                                        │
│ Aces per Match                         │
│ Sinner    11.2 ███████████████        │
│ Alcaraz   8.5  ████████████░░         │
│                                        │
│ Break Points Saved                     │
│ Sinner    73% ██████████████░         │
│ Alcaraz   67% ████████████░░          │
│                                        │
├────────────────────────────────────────┤
│ RESTO                                  │
│                                        │
│ Return Points Won                      │
│ Sinner    41% ███████████             │
│ Alcaraz   38% ██████████░             │
│                                        │
│ Break Points Converted                 │
│ Sinner    47% ████████████            │
│ Alcaraz   42% ███████████░            │
│                                        │
└────────────────────────────────────────┘
```

**Gráficos recomendados**:
- Barras horizontales comparativas
- Radar chart para vista general
- Librería: Victory Native o react-native-chart-kit

#### Tab 2: Head to Head

```
┌────────────────────────────────────────┐
│ HISTORIAL DE ENFRENTAMIENTOS           │
│                                        │
│ Total:    Alcaraz lidera 4-2           │
│ En Hard:  Empatados 2-2                │
│ Reciente: Sinner ganó último           │
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│ 📅 US Open 2024 - Hard                │
│ Sinner ✅ 6-3, 7-6                     │
│ [Ver detalles]                         │
│                                        │
│ 📅 Roland Garros 2024 - Clay          │
│ Alcaraz ✅ 6-4, 6-7, 7-5              │
│ [Ver detalles]                         │
│                                        │
│ 📅 Wimbledon 2023 - Grass             │
│ Alcaraz ✅ 7-6, 6-4                   │
│ [Ver detalles]                         │
│                                        │
│ [Ver todos los enfrentamientos →]     │
│                                        │
└────────────────────────────────────────┘
```

**Elementos**:
- Resumen de estadísticas H2H
- Últimos 3-5 enfrentamientos
- Icono del ganador
- Superficie y torneo
- Expandible para ver todos

#### Tab 3: Context

```
┌────────────────────────────────────────┐
│ CONTEXTO DEL PARTIDO                   │
│                                        │
│ 🏆 Torneo                              │
│ ATP Finals - Final                     │
│ Prize Money: $2,000,000                │
│                                        │
│ ⏱️  Fatiga y Descanso                  │
│ Sinner:  Jugó hace 2 días (vs Novak)  │
│          Partido de 3h 15min           │
│ Alcaraz: Jugó hace 3 días (vs Medvev) │
│          Partido de 2h 05min           │
│                                        │
│ 📈 Tendencias                          │
│ Sinner:  Racha de 5 victorias         │
│ Alcaraz: Racha de 3 victorias         │
│                                        │
│ 🌍 Performance en este Torneo          │
│ Sinner:  4-0 (100%)                    │
│ Alcaraz: 3-1 (75%)                     │
│                                        │
└────────────────────────────────────────┘
```

**Datos contextuales**:
- Importancia del torneo
- Días de descanso
- Duración de últimos partidos (fatiga)
- Rachas actuales
- Performance en el torneo específico

---

### 6. KellyCalculatorSection

**Layout conceptual**:
```
┌────────────────────────────────────────┐
│ 🎲 CALCULADORA DE KELLY CRITERION      │
├────────────────────────────────────────┤
│                                        │
│ Tu bankroll actual:                    │
│ [Slider: €1000] €1000                  │
│                                        │
│ Fracción de Kelly a usar:              │
│ [●] Full Kelly (100%)                  │
│ [ ] Conservative (25%) ✅ RECOMENDADO  │
│ [ ] Custom: [50]%                      │
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│ 📊 RECOMENDACIÓN:                      │
│                                        │
│ Apostar: €34.00 (3.4% del bankroll)   │
│                                        │
│ Si ganas: +€17.68                      │
│ Si pierdes: -€34.00                    │
│                                        │
│ Retorno esperado: +€1.77               │
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│ [?] ¿Qué es Kelly Criterion?          │
│                                        │
└────────────────────────────────────────┘
```

**Funcionalidad**:
- Slider para ajustar bankroll
- Radio buttons para fracción de Kelly
- Cálculo en tiempo real
- Visualización clara de riesgo/recompensa
- Link a explicación educativa

**Cálculos**:
```javascript
Conceptual:

Kelly % = (probabilidad * cuota - 1) / (cuota - 1)

Ejemplo:
  Probabilidad: 67.3%
  Cuota: 1.52
  Kelly = (0.673 * 1.52 - 1) / (1.52 - 1)
        = 0.034 = 3.4%

Con bankroll de €1000:
  Full Kelly: €34
  Conservative (25%): €8.50

Expected Value:
  EV = stake * EV%
  EV = €34 * 5.2% = €1.77
```

---

### 7. EducationalSection

**Layout conceptual** (Acordeón):
```
┌────────────────────────────────────────┐
│ 📚 APRENDE MÁS                         │
├────────────────────────────────────────┤
│                                        │
│ ▼ ¿Qué es Expected Value?             │
│                                        │
│   El Expected Value (EV) es el retorno│
│   promedio que esperarías si hicieras │
│   esta apuesta 100 veces...            │
│                                        │
│   [Ver ejemplo interactivo →]         │
│                                        │
│ ─────────────────────────────────────  │
│                                        │
│ ▶ ¿Cómo funciona la calibración?      │
│                                        │
│ ▶ ¿Por qué Kelly Criterion?           │
│                                        │
│ ▶ Limitaciones del modelo             │
│                                        │
└────────────────────────────────────────┘
```

**Temas educativos**:
1. **Expected Value**: Explicación con ejemplo
2. **Calibración de probabilidades**: Por qué son confiables
3. **Kelly Criterion**: Matemática de gestión de bankroll
4. **Limitaciones**: Qué NO predice el modelo

**Formato**:
- Acordeones expandibles
- Lenguaje simple, sin tecnicismos
- Ejemplos visuales
- Links a recursos externos (opcional)

---

## 📊 VISUALIZACIÓN DE DATOS

### Librerías Recomendadas

**Opción 1: Victory Native** (Recomendada)
- **Pros**: Muy customizable, basada en D3, responsive
- **Contras**: Bundle size mayor
- **Uso**: Gráficos complejos (radar, line, area)

**Opción 2: react-native-chart-kit**
- **Pros**: Lightweight, fácil de usar
- **Contras**: Menos opciones de customización
- **Uso**: Gráficos simples (bar, line, pie)

**Opción 3: react-native-svg-charts**
- **Pros**: Basada en SVG, buen performance
- **Contras**: Documentación limitada
- **Uso**: Gráficos personalizados

### Gráficos Necesarios

**1. Barra de Confianza**:
```javascript
Conceptual:

Progress Bar:
  - Valor: 0.87 (87%)
  - Color: Gradiente verde
  - Animación al aparecer
  - Labels: 0% ---- 50% ---- 100%
```

**2. Barras Comparativas**:
```javascript
Conceptual:

Horizontal Bar Chart:
  - Dos barras por métrica
  - Normalizar valores (0-100%)
  - Color ganador: Verde
  - Color perdedor: Gris
  - Animación smooth al cargar
```

**3. Radar Chart (opcional)**:
```javascript
Conceptual:

Radar/Spider Chart:
  - Ejes: Servicio, Resto, Forma, ELO, etc.
  - Dos polígonos superpuestos
  - Jugador 1: Azul
  - Jugador 2: Rojo
  - Intersecciones visibles
```

---

## 🎨 DISEÑO Y UX

### Principios de Diseño

**1. Hierarchy Visual Clara**:
- Lo más importante arriba (predicción)
- Tamaños de fuente decrecientes
- Uso de whitespace generoso

**2. Colores Significativos**:
- Verde: Positivo, ganar, apostar
- Rojo: Negativo, perder, evitar
- Amarillo/Ámbar: Advertencia, marginal
- Gris: Neutral, sin ventaja

**3. Progressive Disclosure**:
- No abrumar con información
- Expandibles para detalles
- Tabs para organizar
- Tooltips para conceptos

**4. Feedback Inmediato**:
- Animaciones suaves
- Loading states claros
- Confirmaciones visuales

### Animaciones

**Al entrar a la pantalla**:
```javascript
Conceptual:

1. Hero section: Fade in + Slide from top
2. Cards: Stagger animation (una tras otra)
3. Gráficos: Animación de valores (0 → valor real)
4. Smooth scrolling
```

**Interacciones**:
- Tap en card: Scale down + Scale up
- Expand accordion: Smooth height animation
- Change tab: Fade out/in with slide

**Librería**: Reanimated 2 para performance nativo

---

## ⚡ OPTIMIZACIONES

### 1. Lazy Loading de Tabs

**Concepto**:
```javascript
Renderizar tab solo cuando usuario lo visita:
  - Tab Statistics: Renderizar on mount
  - Tab H2H: Renderizar cuando usuario lo abre
  - Tab Context: Renderizar cuando usuario lo abre

Beneficio:
  - Faster initial render
  - Menor memoria usada
  - Mejor perceived performance
```

### 2. Memoización de Gráficos

```javascript
Conceptual:

Gráficos son costosos de renderizar:
  - Usar React.memo en chart components
  - Solo re-renderizar si datos cambian
  - Cachear cálculos de datos procesados
```

### 3. Skeleton Screens

**En lugar de spinner**:
```
Mientras carga análisis detallado:
  - Mostrar placeholders con shimmer effect
  - Usuario ve estructura de la página
  - Mejor perceived performance que spinner
```

### 4. Caché de Análisis

```javascript
Conceptual:

Si usuario ya visitó este partido:
  - Guardar análisis en AsyncStorage
  - Mostrar caché inmediatamente
  - Actualizar en background si es viejo (>10 min)
```

---

## 🧪 TESTING

### Tests de Funcionalidad

**Test 1: Carga completa**
```
1. Tap en partido desde feed
2. Verificar: Skeleton screen aparece
3. Verificar: Datos cargan
4. Verificar: Todas las secciones presentes
5. Verificar: Gráficos renderizan correctamente
```

**Test 2: Navegación entre tabs**
```
1. Tap en tab "Head to Head"
2. Verificar: Tab cambia
3. Verificar: Contenido correcto se muestra
4. Repetir para todos los tabs
```

**Test 3: Calculadora de Kelly**
```
1. Ajustar slider de bankroll
2. Verificar: Cálculos actualizan
3. Cambiar fracción de Kelly
4. Verificar: Stake recomendado cambia
5. Verificar: Números son correctos
```

**Test 4: Elementos educativos**
```
1. Tap en "¿Qué es EV?"
2. Verificar: Acordeón expande
3. Verificar: Contenido es comprensible
4. Verificar: Ejemplos visuales presentes
```

**Test 5: Manejo de datos faltantes**
```
1. Forzar partido sin H2H data
2. Verificar: Tab H2H muestra mensaje apropiado
3. Verificar: No hay crashes
4. Verificar: Mensaje educativo ("Primera vez que se enfrentan")
```

### Tests de Performance

**Test 1: Tiempo de carga**
```
Métrica: Tiempo desde tap hasta pantalla completa
Target: < 2 segundos
```

**Test 2: Scroll performance**
```
Métrica: FPS durante scroll
Target: 60 FPS consistentes
```

**Test 3: Animaciones smooth**
```
Verificar: Todas las animaciones a 60 FPS
Verificar: No hay jank o stuttering
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Contenido y Datos

- [ ] Predicción principal se muestra correctamente
- [ ] Probabilidades suman 100%
- [ ] Expected Value se calcula correctamente
- [ ] Factores clave son relevantes y claros
- [ ] Comparación de jugadores es precisa
- [ ] Bookmakers están ordenados por mejor EV
- [ ] Estadísticas son correctas
- [ ] Head to Head data es precisa
- [ ] Contexto del partido es relevante

### Visualización

- [ ] Gráficos renderizan correctamente
- [ ] Barras de progreso son proporcionales
- [ ] Colores son consistentes con la guía
- [ ] Tipografía es legible
- [ ] Espaciado es uniforme
- [ ] Responsive en diferentes tamaños

### Funcionalidad

- [ ] Tabs funcionan correctamente
- [ ] Acordeones expanden/contraen suavemente
- [ ] Calculadora de Kelly calcula bien
- [ ] Tooltips aparecen al tap
- [ ] Scroll es smooth
- [ ] Botones responden al tap
- [ ] Navegación hacia atrás funciona

### UX y Polish

- [ ] Animaciones son smooth
- [ ] Loading states son claros
- [ ] Error states manejan bien
- [ ] Skeleton screens funcionan
- [ ] Feedback táctil presente
- [ ] Información organizada lógicamente
- [ ] Sección educativa es comprensible

### Performance

- [ ] Pantalla carga en < 2 segundos
- [ ] Scroll a 60 FPS
- [ ] Animaciones no lagguean
- [ ] Memoria se mantiene estable
- [ ] No hay memory leaks

---

## 🚀 PRÓXIMOS PASOS

Una vez completada la Fase 3:

1. ✅ Validar todos los checkpoints
2. ✅ User testing con 5-10 usuarios
3. ✅ Ajustar UI/UX según feedback
4. ✅ Optimizar gráficos si necesario
5. ✅ Pulir animaciones
6. ➡️ Pasar a **FASE_4_DASHBOARD_TRACKING.md**

---

**🎯 Meta de esta fase**: Vista detallada completa, informativa, educativa y visualmente atractiva.

**⏱️ Tiempo estimado**: 10-14 días de desarrollo + testing

**🎨 Prioridad**: Esta es la pantalla más compleja y valiosa de la app.
