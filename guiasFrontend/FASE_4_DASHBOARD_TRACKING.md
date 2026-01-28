# 🎾 FASE 4: DASHBOARD PERSONAL Y TRACKING DE APUESTAS
# Duración Estimada: 2 semanas

---

## 📋 ÍNDICE

1. [Objetivos de esta Fase](#objetivos)
2. [Arquitectura de Datos](#arquitectura)
3. [Pantallas Principales](#pantallas)
4. [Sistema de Registro de Apuestas](#registro)
5. [Dashboard de Métricas](#dashboard)
6. [Gráficos de Rendimiento](#graficos)
7. [Gamificación Responsable](#gamificacion)
8. [Checklist de Validación](#checklist)

---

## 🎯 OBJETIVOS DE ESTA FASE

### Qué vamos a lograr
1. ✅ Sistema de registro de apuestas
2. ✅ Dashboard con métricas personales (ROI, Win Rate, etc.)
3. ✅ Historial completo de apuestas
4. ✅ Gráficos de evolución temporal
5. ✅ Comparación: "Siguiendo modelo" vs "Decisiones propias"
6. ✅ Alertas de juego responsable
7. ✅ Exportación de datos (opcional)

### Entregables
- DashboardScreen completa con métricas
- BetHistoryScreen con lista de apuestas
- AddBetModal para registrar apuestas
- Gráficos de rendimiento temporal
- Sistema de persistencia local + sincronización con backend

---

## 🏗️ ARQUITECTURA DE DATOS

### Modelo de Datos: Bet (Apuesta)

```javascript
Bet Object:
{
  id: "bet_00123",
  match_id: "match_20241216_001",
  
  // Info del partido
  player1_name: "Carlos Alcaraz",
  player2_name: "Jannik Sinner",
  tournament: "ATP Finals",
  match_date: "2024-12-16",
  surface: "Hard",
  
  // Info de la apuesta
  player_bet: "player2",  // En quién apostó
  player_bet_name: "Jannik Sinner",
  stake: 34.00,
  odds: 1.52,
  bookmaker: "Bet365",
  
  // Métricas del modelo
  model_probability: 0.673,
  model_confidence: 0.87,
  expected_value: 0.052,  // 5.2%
  kelly_percentage: 0.034,  // 3.4%
  
  // Decisión del usuario
  followed_model: true,  // ¿Siguió la recomendación?
  
  // Resultado
  status: "pending" | "won" | "lost",
  result_updated_at: null,
  profit: null,  // Se calcula al actualizar resultado
  
  // Metadata
  created_at: "2024-12-16T10:35:00Z",
  notes: "Confianza alta del modelo, EV positivo"
}
```

### Sistema de Persistencia

**Estrategia Dual: Local + Backend**

**AsyncStorage (Local)**:
- Almacenar bets del usuario localmente
- Inmediata disponibilidad offline
- Backup en caso de fallo del backend

**Backend API (Remoto)**:
- Sincronizar con servidor
- Acceso desde múltiples dispositivos
- Backup seguro en la nube

**Flujo de sincronización**:
```
1. Usuario registra bet:
   → Guardar en AsyncStorage (inmediato)
   → Enviar a backend (background)
   → Si falla backend, marcar como "pendiente de sync"

2. Al abrir app:
   → Cargar bets de AsyncStorage (instant)
   → Sincronizar con backend (background)
   → Merge resultados (backend es source of truth)

3. Actualizar resultado:
   → Actualizar en AsyncStorage
   → Enviar update a backend
   → Recalcular métricas
```

---

## 📱 PANTALLAS PRINCIPALES

### Estructura de Navegación

```
Bottom Tab Navigator
├── MatchFeedScreen (Tab 1: Home)
├── DashboardScreen (Tab 2: Stats) ← NUEVO
└── ProfileScreen (Tab 3: Profile) ← Fase 5
```

O alternativamente:

```
Stack Navigator
├── MatchFeedScreen
├── MatchDetailScreen
│   └── AddBetModal (Modal)
└── DashboardScreen
    └── BetDetailModal (Modal)
```

---

## 📊 DASHBOARDSCREEN (Vista Principal de Stats)

### Layout Conceptual

```
┌────────────────────────────────────────┐
│ 📊 Tu Rendimiento                      │  ← Header
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  RESUMEN GENERAL                 │ │
│  │                                  │ │
│  │  Total Apostado:   €1,500.00    │ │
│  │  Ganancia Neta:    +€261.50     │ │
│  │  ROI:              +17.4% ✅     │ │
│  │  Win Rate:         68.2% (29/42) │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  GRÁFICO DE EVOLUCIÓN            │ │
│  │  ┌────────────────────────────┐  │ │
│  │  │  [Line Chart]              │  │ │
│  │  │  Ganancia acumulada        │  │ │
│  │  │  en el tiempo              │  │ │
│  │  └────────────────────────────┘  │ │
│  │  [7D] [30D] [90D] [Todo] ←Filtro│ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  PERFORMANCE DEL MODELO          │ │
│  │                                  │ │
│  │  Siguiendo modelo: 35 bets      │ │
│  │    Win Rate: 71.4%              │ │
│  │    ROI: +19.1% 🎯               │ │
│  │                                  │ │
│  │  Decisiones propias: 10 bets    │ │
│  │    Win Rate: 60.0%              │ │
│  │    ROI: +8.5%                   │ │
│  │                                  │ │
│  │  💡 Has ganado €42 adicionales  │ │
│  │     siguiendo el modelo          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [Ver Historial Completo →]           │
│                                        │
└────────────────────────────────────────┘
```

### Componentes del Dashboard

#### 1. SummaryCards (Resumen General)

**Métricas principales**:
- **Total Apostado**: Suma de todos los stakes
- **Ganancia Neta**: Total returned - Total staked
- **ROI**: (Ganancia / Total Apostado) * 100
- **Win Rate**: (Bets ganadas / Total bets) * 100

**Visualización**:
```javascript
Conceptual:

Card component:
  - Icono representativo
  - Label (ej: "ROI")
  - Valor grande (ej: "+17.4%")
  - Color según valor:
    - Verde si positivo
    - Rojo si negativo
    - Gris si neutro
  - Trend indicator (arrow up/down)
```

#### 2. EvolutionChart (Gráfico de Evolución)

**Tipo de gráfico**: Line Chart (Gráfico de línea)

**Datos a mostrar**:
- Eje X: Fechas
- Eje Y: Ganancia acumulada (€)
- Línea: Evolución del profit en el tiempo

**Filtros de período**:
- Últimos 7 días
- Últimos 30 días
- Últimos 90 días
- Todo el historial

**Features**:
- Tap en punto → Ver detalle de ese día
- Zoom con pinch gesture
- Pan horizontal para navegar en el tiempo

**Implementación conceptual**:
```javascript
Datos procesados:
  - Obtener todas las bets completadas
  - Agrupar por fecha
  - Calcular profit acumulado por día
  - Formatear para Victory Line Chart

Ejemplo de data:
  [
    { date: "2024-11-01", cumulative_profit: 0 },
    { date: "2024-11-02", cumulative_profit: 12.50 },
    { date: "2024-11-03", cumulative_profit: 7.50 },
    ...
  ]
```

#### 3. ModelPerformanceCard

**Propósito**: Mostrar el valor de seguir las recomendaciones

**Comparación**:
```
Siguiendo Modelo        vs      Decisiones Propias
─────────────────              ─────────────────
35 bets                        10 bets
Win Rate: 71.4%                Win Rate: 60.0%
ROI: +19.1%                    ROI: +8.5%
```

**Cálculo de "Ganancia por seguir modelo"**:
```javascript
Conceptual:

bet_siguiendo_modelo = bets donde followed_model = true
bet_no_siguiendo = bets donde followed_model = false

profit_siguiendo = suma(profit de bet_siguiendo_modelo)
profit_no_siguiendo = suma(profit de bet_no_siguiendo)

ganancia_adicional = profit_siguiendo - profit_no_siguiendo

Si ganancia_adicional > 0:
  Mensaje: "Has ganado €X adicionales siguiendo el modelo"
```

**Visualización**:
- Lado a lado
- Highlight en el que tiene mejor performance
- Badge "Recomendado" en seguir modelo si ROI > propio

---

## 📋 BET HISTORY SCREEN (Historial de Apuestas)

### Layout Conceptual

```
┌────────────────────────────────────────┐
│ ← Historial de Apuestas                │  ← Header
├────────────────────────────────────────┤
│ [Todas] [Ganadas] [Perdidas] [Pending] │  ← Filter Tabs
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 16 Dic 2024 • ATP Finals         │ │
│  │ Sinner vs Alcaraz                │ │
│  │ Apuesta: Sinner @ 1.52           │ │
│  │ Stake: €34.00                    │ │
│  │ Estado: ✅ Ganada                │ │
│  │ Profit: +€17.68                  │ │
│  │ [Ver detalles]                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 15 Dic 2024 • Roland Garros      │ │
│  │ Nadal vs Djokovic                │ │
│  │ Apuesta: Nadal @ 2.10            │ │
│  │ Stake: €20.00                    │ │
│  │ Estado: ❌ Perdida               │ │
│  │ Profit: -€20.00                  │ │
│  │ [Ver detalles]                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 14 Dic 2024 • US Open            │ │
│  │ Medvedev vs Zverev               │ │
│  │ Apuesta: Medvedev @ 1.75         │ │
│  │ Stake: €15.00                    │ │
│  │ Estado: ⏳ Pendiente             │ │
│  │ [Actualizar resultado]           │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

### BetCard Component

**Props**:
```javascript
{
  bet: Bet object,
  onTap: function,
  onUpdateResult: function
}
```

**Estados visuales**:
- **Ganada**: Borde verde, ✅ icono, +€X en verde
- **Perdida**: Borde rojo, ❌ icono, -€X en rojo
- **Pendiente**: Borde amarillo, ⏳ icono, botón "Actualizar"

**Información mostrada**:
- Fecha y torneo
- Nombres de jugadores
- En quién apostó + cuotas
- Stake
- Estado (ganada/perdida/pendiente)
- Profit (si completada)

---

## ➕ ADD BET MODAL (Registrar Apuesta)

### Cuándo se muestra

**Opción 1**: Botón en MatchDetailScreen
```
Usuario está viendo análisis de partido
  → Tap en "Registrar Apuesta"
  → Modal aparece con datos pre-llenados
```

**Opción 2**: Botón flotante en Feed
```
Usuario ve partido interesante en feed
  → Tap en FAB "+"
  → Selecciona partido
  → Modal aparece
```

### Layout del Modal

```
┌────────────────────────────────────────┐
│ ✕                      Registrar Bet   │  ← Header
├────────────────────────────────────────┤
│                                        │
│  Partido seleccionado:                 │
│  Sinner vs Alcaraz                     │
│  ATP Finals • 16 Dic                   │
│                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│  Apuestas en:                          │
│  ○ Sinner @ 1.52                       │
│  ● Alcaraz @ 2.75                      │
│                                        │
│  Stake (€):                            │
│  [Input: 34.00]                        │
│                                        │
│  Bookmaker:                            │
│  [Dropdown: Bet365 ▼]                  │
│                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│  📊 Datos del modelo:                  │
│  Probabilidad: 32.7%                   │
│  EV: -8.4% ⚠️                          │
│  Kelly: No recomendado                 │
│                                        │
│  ⚠️  Esta apuesta NO sigue la          │
│      recomendación del modelo          │
│                                        │
│  Notas (opcional):                     │
│  [TextArea]                            │
│                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│  [Cancelar]    [Registrar Apuesta]    │
│                                        │
└────────────────────────────────────────┘
```

### Validaciones

**Campo Stake**:
- Debe ser número > 0
- Warning si > 10% del bankroll
- Error si > bankroll total

**Advertencias contextuales**:
- Si EV < 0: "Esta apuesta tiene EV negativo"
- Si no sigue modelo: "El modelo recomienda otra opción"
- Si stake > Kelly * 2: "Stake es muy alto según Kelly"

### Flujo de registro

```
1. Usuario llena formulario
2. Tap en "Registrar Apuesta"
3. Validar campos
4. Si válido:
   a. Crear objeto Bet
   b. Guardar en AsyncStorage
   c. Enviar a backend (background)
   d. Cerrar modal
   e. Mostrar confirmación (Toast)
   f. Actualizar dashboard
5. Si inválido:
   a. Mostrar errores en campos
```

---

## 📈 GRÁFICOS DE RENDIMIENTO

### Gráficos Necesarios

#### 1. Cumulative Profit Chart (Línea)

**Propósito**: Mostrar evolución de ganancia en el tiempo

**Datos**:
- X: Fechas
- Y: Profit acumulado

**Features**:
- Línea verde si profit positivo, roja si negativo
- Área bajo la curva coloreada
- Markers en puntos importantes

#### 2. Win Rate by Month (Barras)

**Propósito**: Ver consistencia mes a mes

**Datos**:
- X: Meses
- Y: Win Rate %

**Features**:
- Color verde si > 50%, rojo si < 50%
- Label con valor exacto en cada barra

#### 3. Profit by Surface (Pie Chart)

**Propósito**: Ver en qué superficie se gana más

**Datos**:
- Segmentos: Hard, Clay, Grass
- Valores: Profit en cada superficie

**Features**:
- Colores distintivos
- Porcentajes en cada slice
- Tap para ver detalles

#### 4. ROI Comparison (Bar Chart Horizontal)

**Propósito**: Comparar ROI siguiendo modelo vs no

**Datos**:
- Barra 1: ROI siguiendo modelo
- Barra 2: ROI decisiones propias

**Features**:
- Verde para mejor, gris para peor
- Labels claros

---

## 🎮 GAMIFICACIÓN RESPONSABLE

### Conceptos de Gamificación

**Propósito**: Motivar sin fomentar adicción

**1. Achievements (Logros)**
```
Ejemplos:
- "Primera Apuesta" - Registraste tu primera bet
- "Racha de 5" - 5 apuestas ganadoras seguidas
- "Seguidor del Modelo" - 90% de apuestas siguiendo modelo
- "Gestor Disciplinado" - 0 apuestas > Kelly * 2 en 30 días
```

**Visualización**:
```
┌────────────────────────────────────────┐
│ 🏆 LOGROS                              │
├────────────────────────────────────────┤
│                                        │
│  ✅ Primera Apuesta                    │
│  ✅ Seguidor del Modelo (90%)          │
│  🔒 Racha de 10 (Progreso: 6/10)       │
│  🔒 ROI Maestro (+50%)                 │
│                                        │
└────────────────────────────────────────┘
```

**2. Streaks (Rachas)**
```
Racha actual: 3 apuestas ganadoras
Mejor racha: 7 apuestas ganadoras
```

**3. Level System (Opcional)**
```
Niveles basados en apuestas totales:
- Novato: 0-10 bets
- Intermedio: 11-50 bets
- Avanzado: 51-100 bets
- Experto: 100+ bets
```

### Alertas de Juego Responsable

**Triggers de alerta**:

**1. Alto volumen**:
```
Si stake total últimos 7 días > 20% bankroll:
  → "Has apostado 15% de tu bankroll esta semana. 
     Recuerda apostar responsablemente."
```

**2. Racha de pérdidas**:
```
Si 5+ apuestas perdidas seguidas:
  → "Estás en una racha de 5 pérdidas. 
     Considera tomar un descanso."
```

**3. Stakes muy altos**:
```
Si stake > Kelly * 3:
  → "Este stake es 3x el Kelly recomendado. 
     ¿Estás seguro?"
```

**4. Recordatorio periódico**:
```
Cada 30 días:
  → "Recordatorio: Solo apuesta lo que puedas perder. 
     El modelo no es infalible."
```

**Visualización de alertas**:
```
┌────────────────────────────────────────┐
│ ⚠️  ALERTA DE JUEGO RESPONSABLE        │
├────────────────────────────────────────┤
│                                        │
│ Has apostado el 18% de tu bankroll     │
│ en los últimos 7 días.                 │
│                                        │
│ Te recomendamos:                       │
│ • Revisar tu estrategia                │
│ • Considerar reducir stakes            │
│ • Tomar un descanso si es necesario    │
│                                        │
│ [Entendido]  [Ver Recursos de Ayuda]  │
│                                        │
└────────────────────────────────────────┘
```

---

## 💾 SISTEMA DE EXPORTACIÓN (Opcional)

### Funcionalidad de Exportar Datos

**Formatos disponibles**:
- CSV (para Excel)
- JSON (para desarrolladores)

**Datos a exportar**:
- Todas las bets con todos los campos
- Métricas calculadas
- Timestamp de exportación

**UI**:
```
En Dashboard o Settings:
  → Botón "Exportar Datos"
  → Modal con opciones de formato
  → Generar archivo
  → Share sheet nativo (email, Drive, etc.)
```

---

## 🧪 TESTING

### Tests Funcionales

**Test 1: Registrar apuesta**
```
1. Navegar a MatchDetail
2. Tap "Registrar Apuesta"
3. Llenar formulario
4. Submit
5. Verificar: Apuesta aparece en historial
6. Verificar: Dashboard actualizado
7. Verificar: Guardado en AsyncStorage
```

**Test 2: Actualizar resultado**
```
1. En historial, seleccionar bet pendiente
2. Tap "Actualizar resultado"
3. Marcar como ganada/perdida
4. Verificar: Profit calculado correctamente
5. Verificar: Métricas actualizadas
6. Verificar: Gráficos reflejan cambio
```

**Test 3: Filtros de historial**
```
1. Tap tab "Ganadas"
2. Verificar: Solo bets ganadas se muestran
3. Tap tab "Perdidas"
4. Verificar: Solo bets perdidas se muestran
5. Tap tab "Pendientes"
6. Verificar: Solo bets pendientes se muestran
```

**Test 4: Gráficos**
```
1. Verificar: Line chart renderiza correctamente
2. Cambiar filtro de período
3. Verificar: Datos del gráfico actualizan
4. Tap en punto del gráfico
5. Verificar: Tooltip con datos del día
```

**Test 5: Alertas responsables**
```
1. Crear escenario de 5 pérdidas seguidas
2. Verificar: Alerta aparece
3. Crear escenario de stake muy alto
4. Verificar: Warning antes de registrar
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Funcionalidad Core

- [ ] Registrar bet funciona correctamente
- [ ] Bet se guarda en AsyncStorage
- [ ] Bet se sincroniza con backend
- [ ] Actualizar resultado funciona
- [ ] Historial muestra todas las bets
- [ ] Filtros de historial funcionan
- [ ] Dashboard calcula métricas correctamente
- [ ] Gráficos renderizan con datos correctos

### Cálculos

- [ ] ROI se calcula correctamente
- [ ] Win Rate es preciso
- [ ] Profit acumulado es correcto
- [ ] Comparación modelo vs propio es precisa
- [ ] Gráficos reflejan datos reales

### UX

- [ ] Formulario de registro es intuitivo
- [ ] Validaciones son claras
- [ ] Loading states presentes
- [ ] Feedback inmediato al registrar
- [ ] Navegación fluida
- [ ] Gráficos son legibles

### Gamificación

- [ ] Logros se desbloquean correctamente
- [ ] Alertas responsables se muestran
- [ ] Mensajes motivacionales apropiados
- [ ] No fomenta comportamiento riesgoso

### Performance

- [ ] Dashboard carga rápido (< 1s)
- [ ] Gráficos renderizan smooth
- [ ] Historial scrollea fluido
- [ ] No hay memory leaks
- [ ] Sincronización background no afecta UI

---

## 🚀 PRÓXIMOS PASOS

Una vez completada la Fase 4:

1. ✅ Validar todos los checkpoints
2. ✅ Testing exhaustivo con datos reales
3. ✅ Ajustar cálculos si necesario
4. ✅ Pulir gráficos y animaciones
5. ✅ Validar alertas responsables
6. ➡️ Pasar a **FASE_5_OPTIMIZACION_LANZAMIENTO.md**

---

**🎯 Meta de esta fase**: Sistema completo de tracking que ayuda al usuario a mejorar sus decisiones.

**⏱️ Tiempo estimado**: 10-14 días de desarrollo + testing

**💡 Valor clave**: Mostrar transparentemente el valor del modelo al usuario.
