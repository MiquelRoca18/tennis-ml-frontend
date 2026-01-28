# Guía de Desarrollo Frontend - Tennis ML Predictions App
## Estructura Similar a FlashScore

---

## 📱 1. VISTA PRINCIPAL - LISTA DE PARTIDOS

### 1.1 Estructura de la Pantalla Principal

La pantalla principal debe mostrar una lista scrolleable de partidos divididos en secciones:

```typescript
interface MainScreenStructure {
  sections: {
    live: Match[];      // Partidos en vivo
    upcoming: Match[];  // Próximos partidos
    finished: Match[];  // Partidos finalizados
  }
}
```

### 1.2 Componentes de la Lista

#### **Encabezado del Torneo**
```typescript
interface TournamentHeader {
  icon: string;           // Ícono del torneo (pelota de tenis)
  name: string;           // "ATP - INDIVIDUALES: Open de Australia"
  location: string;       // "Australia"
  surface: string;        // "Dura"
  phase?: string;         // "Fase previa", "Final", etc.
  link?: string;          // Link a cuadro del torneo
}
```

#### **Card de Partido**
```typescript
interface MatchCard {
  // Estado del partido
  status: 'scheduled' | 'live' | 'finished';
  time?: string;          // "09:00" o tiempo actual "2º Set"
  
  // Jugadores
  player1: {
    name: string;
    country: string;      // Código ISO (ESP, USA, etc.)
    flag: string;         // Bandera del país
    seed?: number;        // Cabeza de serie
  };
  player2: Player;        // Misma estructura
  
  // Resultado
  score?: {
    sets: [number, number][];  // [[6,3], [7,6]]
    currentSet?: number;
    tiebreak?: boolean;
  };
  
  // Indicadores visuales
  isFavorite?: boolean;   // Estrella para favoritos
  hasVideo?: boolean;     // Ícono de cámara para streaming
}
```

### 1.3 Estados Visuales

```javascript
// Colores según estado
const matchStateColors = {
  live: {
    indicator: '#00FF41',     // Verde neón para "LIVE"
    background: '#1a2f1a',    // Fondo verde oscuro sutil
  },
  finished: {
    score: '#FFFFFF',         // Blanco para scores finales
    background: '#0D1117',    // Fondo normal
  },
  scheduled: {
    time: '#8B949E',          // Gris para horarios
    background: '#0D1117',
  }
};
```

---

## 🎾 2. VISTA DETALLADA DEL PARTIDO

### 2.1 Estructura de Navegación (Tabs)

La vista detallada tiene 4 pestañas principales:

```typescript
interface MatchDetailTabs {
  PARTIDO: {
    resumen: MatchSummary;
    estadisticas: Statistics;
    puntoAPunto: PointByPoint;
  };
  CUOTAS: {
    providers: BettingProvider[];
    markets: BettingMarket[];
  };
  H2H: {
    history: PreviousMatch[];
    statistics: HeadToHeadStats;
  };
  CUADRO: {
    draw: TournamentDraw;
  };
}
```

### 2.2 Header del Partido

```typescript
interface MatchHeader {
  tournament: string;
  date: string;           // "15.01.2026 01:10"
  status: 'FINALIZADO' | 'EN VIVO' | 'PROGRAMADO';
  
  players: {
    player1: {
      name: string;
      photo: string;      // URL de la foto
      ranking: number;     // ATP ranking
      isFavorite: boolean;
    };
    player2: Player;
  };
  
  score: {
    final: [number, number];  // [2, 0]
    sets: SetScore[];
  };
  
  duration?: string;      // "1:38"
}
```

---

## 📊 3. PESTAÑA "PARTIDO"

### 3.1 Sub-pestañas

```typescript
enum MatchSubTabs {
  RESUMEN = 'RESUMEN',
  ESTADISTICAS = 'ESTADÍSTICAS', 
  PUNTO_A_PUNTO = 'PUNTO A PUNTO'
}
```

### 3.2 Sección RESUMEN

**Marcador Principal**
```typescript
interface ScoreSummary {
  sets: {
    player1: number;
    player2: number;
    tiebreak?: [number, number];  // [7, 4] si hubo tiebreak
  }[];
  matchTime: string;
}
```

### 3.3 Sección ESTADÍSTICAS

**Estructura de Estadísticas Comparativas**

```typescript
interface MatchStatistics {
  // Por sets
  perSet: {
    first: SetStatistics;
    second: SetStatistics;
  };
  
  // Estadísticas generales
  overall: {
    // SERVICIO
    aces: [number, number];
    doubleFaults: [number, number];
    firstServePercentage: [number, number];  // %
    firstServePointsWon: [string, string];   // "26/39"
    secondServePointsWon: [string, string];
    breakPointsSaved: [string, string];
    serviceSpeed: {
      average: [number, number];  // km/h
      fastest: [number, number];
    };
    
    // RESTO
    firstReturnPointsWon: [string, string];
    secondReturnPointsWon: [string, string];
    breakPointsConverted: [string, string];
    
    // PUNTOS
    winnersCount: [number, number];
    unforcedErrors: [number, number];
    netPointsWon: [string, string];
    totalPointsWon: [string, string];
    longestRally: number;
    matchSaves: [number, number];
    
    // JUEGOS
    serviceGamesWon: [string, string];
    returnGamesWon: [string, string];
    totalGamesWon: [string, string];
  };
}
```

**Componente de Barra Comparativa**
```typescript
interface StatBar {
  label: string;
  player1Value: number | string;
  player2Value: number | string;
  percentage1: number;  // Para el ancho de la barra
  percentage2: number;
  highlight?: 'player1' | 'player2';  // Quien tiene mejor stat
}
```

### 3.4 Sección PUNTO A PUNTO

```typescript
interface PointByPoint {
  sets: {
    setNumber: number;
    games: {
      gameNumber: number;
      server: 'player1' | 'player2';
      score: string;  // "15-0", "30-15", etc.
      points: Point[];
      isBreak?: boolean;
      isTiebreak?: boolean;
    }[];
  }[];
}

interface Point {
  score: string;        // "15-0", "30-0", etc.
  winner: 'player1' | 'player2';
  type?: 'ace' | 'doubleFault' | 'winner' | 'error';
  rally?: number;       // Número de golpes
}
```

**Visualización del Punto a Punto**
- Muestra cada game con el marcador
- Indica quién sirvió (ícono de pelota)
- Resalta los breaks de servicio en rojo
- Muestra la progresión: "15-0, 30-0, 40-0" etc.

---

## 💰 4. PESTAÑA "CUOTAS"

### 4.1 Estructura de Cuotas

```typescript
interface BettingSection {
  tabs: {
    'CUOTAS 1 2': WinnerOdds;
    'MÁS DE/MENOS DE': OverUnderOdds;
    'HÁNDICAP ASIÁTICO': AsianHandicap;
  };
  
  providers: {
    name: string;        // "bet365", "Sportium", "Winamax"
    logo: string;
    odds: {
      player1: number;   // 1.53
      player2: number;   // 2.38
    };
    trending?: 'up' | 'down' | 'stable';
  }[];
}
```

---

## 📈 5. PESTAÑA "H2H" (HEAD TO HEAD)

### 5.1 Filtros de Superficie

```typescript
interface H2HFilters {
  surfaces: ['TODAS LAS SUPERFICIES', 'ARCILLA', 'DURA', 'HIERBA'];
  selected: string;
}
```

### 5.2 Historial de Partidos

```typescript
interface H2HMatch {
  date: string;          // "15.01.26"
  tournament: {
    name: string;        // "AO"
    round: string;       // "QF", "SF", "F"
  };
  players: {
    winner: string;
    loser: string;
  };
  score: string;         // "2-0", "2-1"
  surface: 'hard' | 'clay' | 'grass';
  result: 'G' | 'P';     // Ganó/Perdió desde perspectiva del jugador
}
```

### 5.3 Estadísticas H2H

```typescript
interface H2HStatistics {
  totalMatches: number;
  player1Wins: number;
  player2Wins: number;
  lastMeetings: H2HMatch[];
  surfaceBreakdown: {
    hard: [number, number];
    clay: [number, number];
    grass: [number, number];
  };
}
```

---

## 🏆 6. PESTAÑA "CUADRO" (DRAW)

### 6.1 Estructura del Torneo

```typescript
interface TournamentDraw {
  rounds: {
    name: string;  // "CUARTOS DE FINAL", "SEMIFINALES", "FINAL"
    matches: DrawMatch[];
  }[];
}

interface DrawMatch {
  player1: {
    name: string;
    country: string;
    seed?: number;
    score?: number;
  };
  player2: Player;
  winner?: 'player1' | 'player2';
  status: 'completed' | 'upcoming' | 'live';
}
```

### 6.2 Visualización del Cuadro

- **Layout horizontal**: Cuartos → Semifinales → Final
- **Conexiones visuales**: Líneas que conectan ganadores
- **Colores**:
  - Ganador: Nombre en blanco brillante
  - Perdedor: Nombre en gris oscuro
  - Por jugar: Nombre en gris medio

---

## 🎨 7. SISTEMA DE DISEÑO

### 7.1 Paleta de Colores

```typescript
const colors = {
  // Fondos
  background: {
    primary: '#0D1117',      // Negro azulado principal
    secondary: '#161B22',    // Negro más claro para cards
    tertiary: '#1C2128',     // Para elementos elevados
  },
  
  // Textos
  text: {
    primary: '#FFFFFF',      // Blanco principal
    secondary: '#8B949E',    // Gris para info secundaria
    muted: '#484F58',        // Gris oscuro
  },
  
  // Acentos
  accent: {
    neon: '#00FF41',         // Verde neón principal
    live: '#FF0000',         // Rojo para LIVE
    warning: '#FFA500',      // Naranja para alertas
  },
  
  // Estados
  status: {
    win: '#00FF41',
    loss: '#FF4444',
    neutral: '#8B949E',
  },
  
  // Superficies
  surface: {
    hard: '#4A90E2',         // Azul
    clay: '#D2691E',         // Naranja/Marrón
    grass: '#228B22',        // Verde
  }
};
```

### 7.2 Tipografía

```typescript
const typography = {
  // Encabezados
  h1: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    lineHeight: 32,
  },
  h2: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  h3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  
  // Cuerpo
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Pequeño
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Números/Estadísticas
  stat: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    lineHeight: 24,
  }
};
```

### 7.3 Espaciado

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### 7.4 Componentes Reutilizables

#### **MatchStatusBadge**
```tsx
interface StatusBadgeProps {
  status: 'live' | 'finished' | 'scheduled';
  time?: string;
}

const StatusBadge = ({ status, time }: StatusBadgeProps) => {
  const getStatusStyle = () => {
    switch(status) {
      case 'live':
        return {
          backgroundColor: '#FF0000',
          text: 'LIVE',
          pulse: true
        };
      case 'finished':
        return {
          backgroundColor: 'transparent',
          text: 'FINALIZADO',
          pulse: false
        };
      case 'scheduled':
        return {
          backgroundColor: 'transparent',
          text: time,
          pulse: false
        };
    }
  };
};
```

#### **StatisticBar**
```tsx
interface StatBarProps {
  label: string;
  value1: number;
  value2: number;
  format?: 'percentage' | 'number' | 'fraction';
  showPercentage?: boolean;
}

const StatisticBar = ({ label, value1, value2, format, showPercentage }: StatBarProps) => {
  const total = value1 + value2;
  const percentage1 = (value1 / total) * 100;
  const percentage2 = (value2 / total) * 100;
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.bar1, { width: `${percentage1}%` }]} />
        <View style={[styles.bar2, { width: `${percentage2}%` }]} />
      </View>
      <View style={styles.values}>
        <Text>{formatValue(value1, format)}</Text>
        <Text>{formatValue(value2, format)}</Text>
      </View>
    </View>
  );
};
```

#### **PlayerCard**
```tsx
interface PlayerCardProps {
  name: string;
  country: string;
  ranking?: number;
  photo?: string;
  score?: number[];
  isWinner?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}
```

#### **TournamentBracket**
```tsx
interface BracketProps {
  rounds: Round[];
  currentRound?: number;
  onMatchPress?: (match: Match) => void;
}
```

---

## 🔄 8. FLUJO DE NAVEGACIÓN

### 8.1 Estructura de Navegación

```typescript
// Usando Expo Router
const navigationStructure = {
  '(tabs)': {
    'index': 'Lista de Partidos',
    'predictions': 'Predicciones ML',
    'statistics': 'Estadísticas',
    'profile': 'Perfil',
  },
  'match/[id]': {
    tabs: ['partido', 'cuotas', 'h2h', 'cuadro'],
  },
  'tournament/[id]': 'Vista del Torneo',
};
```

### 8.2 Transiciones y Animaciones

```typescript
// Usando react-native-reanimated
const animations = {
  // Transición entre tabs
  tabTransition: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  
  // Pull to refresh
  pullToRefresh: {
    threshold: 80,
    hapticFeedback: true,
  },
  
  // Live match pulse
  livePulse: {
    duration: 1500,
    loop: true,
  },
  
  // Score update
  scoreUpdate: {
    type: 'spring',
    damping: 15,
    stiffness: 100,
  }
};
```

---

## 📱 9. COMPONENTES ESPECÍFICOS

### 9.1 Live Score Indicator

```tsx
const LiveScoreIndicator = () => {
  const pulseAnim = useSharedValue(1);
  
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: interpolate(pulseAnim.value, [1, 1.2], [1, 0.7]),
  }));
  
  return (
    <Animated.View style={[styles.liveDot, animatedStyle]}>
      <View style={styles.innerDot} />
    </Animated.View>
  );
};
```

### 9.2 Score Display Component

```tsx
const ScoreDisplay = ({ sets, currentSet, isLive }) => {
  return (
    <View style={styles.scoreContainer}>
      {sets.map((set, index) => (
        <View key={index} style={[
          styles.setScore,
          index === currentSet && isLive && styles.currentSet
        ]}>
          <Text style={styles.score}>{set[0]}</Text>
          <Text style={styles.separator}>-</Text>
          <Text style={styles.score}>{set[1]}</Text>
          {set.tiebreak && (
            <Text style={styles.tiebreak}>({set.tiebreak})</Text>
          )}
        </View>
      ))}
    </View>
  );
};
```

### 9.3 Betting Odds Component

```tsx
const BettingOdds = ({ providers, market }) => {
  return (
    <View style={styles.container}>
      {providers.map((provider) => (
        <View key={provider.id} style={styles.providerRow}>
          <Image source={{ uri: provider.logo }} style={styles.logo} />
          <View style={styles.oddsContainer}>
            <TouchableOpacity style={styles.oddButton}>
              <Text style={styles.oddValue}>{provider.odds.player1}</Text>
              {provider.trend1 && <TrendIndicator trend={provider.trend1} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.oddButton}>
              <Text style={styles.oddValue}>{provider.odds.player2}</Text>
              {provider.trend2 && <TrendIndicator trend={provider.trend2} />}
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};
```

---

## 🔌 10. INTEGRACIÓN CON API

### 10.1 Estructura de Endpoints

```typescript
const API_ENDPOINTS = {
  // Partidos
  matches: {
    list: '/matches',                    // GET - Lista de partidos
    detail: '/matches/:id',              // GET - Detalle del partido
    live: '/matches/live',               // GET - Partidos en vivo
    upcoming: '/matches/upcoming',       // GET - Próximos partidos
  },
  
  // Estadísticas
  statistics: {
    match: '/matches/:id/statistics',    // GET - Stats del partido
    player: '/players/:id/statistics',   // GET - Stats del jugador
    h2h: '/matches/h2h/:player1/:player2', // GET - Head to head
  },
  
  // Cuotas
  odds: {
    match: '/matches/:id/odds',          // GET - Cuotas del partido
    trends: '/matches/:id/odds/trends',  // GET - Tendencias
  },
  
  // Torneos
  tournaments: {
    draw: '/tournaments/:id/draw',       // GET - Cuadro del torneo
    matches: '/tournaments/:id/matches', // GET - Partidos del torneo
  },
  
  // Predicciones ML
  predictions: {
    match: '/predictions/match/:id',     // GET - Predicción ML
    accuracy: '/predictions/accuracy',   // GET - Precisión del modelo
  }
};
```

### 10.2 Modelos de Datos

```typescript
// Modelo principal de Partido
interface Match {
  id: string;
  tournament: Tournament;
  status: MatchStatus;
  scheduledTime?: Date;
  actualTime?: Date;
  court?: string;
  surface: Surface;
  players: {
    player1: Player;
    player2: Player;
  };
  score?: Score;
  statistics?: Statistics;
  odds?: Odds[];
  mlPrediction?: MLPrediction;
  weather?: Weather;
}

// Modelo de Jugador
interface Player {
  id: string;
  name: string;
  country: string;
  ranking: {
    current: number;
    highest: number;
    points: number;
  };
  age: number;
  height: number;
  weight: number;
  plays: 'right' | 'left';
  backhand: 'one' | 'two';
  coach?: string;
  photoUrl?: string;
  stats: {
    yearToDate: PlayerStats;
    career: PlayerStats;
    surface: {
      hard: PlayerStats;
      clay: PlayerStats;
      grass: PlayerStats;
    };
  };
}

// Modelo de Predicción ML
interface MLPrediction {
  winner: {
    playerId: string;
    probability: number;
    confidence: 'high' | 'medium' | 'low';
  };
  expectedSets: number;
  expectedGames: {
    total: number;
    player1: number;
    player2: number;
  };
  factors: {
    form: number;
    h2h: number;
    surface: number;
    fatigue: number;
    conditions: number;
  };
  modelVersion: string;
  generatedAt: Date;
}
```

---

## 🚀 11. OPTIMIZACIONES Y PERFORMANCE

### 11.1 Optimización de Listas

```tsx
// Usar FlashList para mejor performance
import { FlashList } from '@shopify/flash-list';

const MatchList = ({ matches }) => {
  return (
    <FlashList
      data={matches}
      renderItem={({ item }) => <MatchCard match={item} />}
      estimatedItemSize={120}
      keyExtractor={(item) => item.id}
      // Optimizaciones
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
    />
  );
};
```

### 11.2 Caché de Datos

```typescript
// Usando React Query para caché
import { useQuery, useQueryClient } from '@tanstack/react-query';

const useMatchData = (matchId: string) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => fetchMatchData(matchId),
    staleTime: 1000 * 60 * 5,     // 5 minutos
    cacheTime: 1000 * 60 * 30,    // 30 minutos
    refetchInterval: (data) => {
      // Refrescar más frecuente si está en vivo
      return data?.status === 'live' ? 30000 : false;
    },
  });
};
```

### 11.3 Optimización de Imágenes

```tsx
// Componente optimizado para fotos de jugadores
import { Image } from 'expo-image';

const PlayerPhoto = ({ url, size = 60 }) => {
  return (
    <Image
      source={{ uri: url }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
      transition={200}
      placeholder={require('./assets/player-placeholder.png')}
      cachePolicy="memory-disk"
    />
  );
};
```

---

## 📋 12. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Estructura Base (Semana 1)
- [ ] Configurar navegación con Expo Router
- [ ] Crear layouts base para tabs y stack
- [ ] Implementar tema oscuro y sistema de colores
- [ ] Configurar tipografía (Inter + Poppins)

### Fase 2: Lista de Partidos (Semana 2)
- [ ] Componente MatchCard
- [ ] Componente TournamentHeader
- [ ] Lista con secciones (Live/Upcoming/Finished)
- [ ] Pull to refresh
- [ ] Indicadores de estado (Live pulse animation)

### Fase 3: Vista Detallada - Header (Semana 3)
- [ ] Header con información del partido
- [ ] Sistema de tabs (Partido/Cuotas/H2H/Cuadro)
- [ ] Componente de score principal
- [ ] Fotos y banderas de jugadores
- [ ] Botón de favoritos

### Fase 4: Estadísticas (Semana 4)
- [ ] Componente StatisticBar
- [ ] Gráficos comparativos
- [ ] Tabs por sets
- [ ] Animaciones de barras
- [ ] Datos de servicio y resto

### Fase 5: Punto a Punto (Semana 5)
- [ ] Vista de games por set
- [ ] Indicadores de servicio
- [ ] Resaltado de breaks
- [ ] Timeline de puntos
- [ ] Detalles de cada punto

### Fase 6: H2H y Cuadro (Semana 6)
- [ ] Historial de enfrentamientos
- [ ] Filtros por superficie
- [ ] Componente de bracket del torneo
- [ ] Navegación entre rondas
- [ ] Indicadores de ganadores

### Fase 7: Integración y Polish (Semana 7)
- [ ] Integración con API real
- [ ] Sistema de caché
- [ ] Optimización de performance
- [ ] Animaciones y transiciones
- [ ] Testing y ajustes finales

---

## 🎯 13. CARACTERÍSTICAS ESPECIALES ML

### 13.1 Indicadores de Predicción

```tsx
interface MLPredictionIndicator {
  probability: number;        // 0-100%
  confidence: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
  
  // Factores visualizados
  factors: {
    name: string;
    impact: number;       // -100 to +100
    description: string;
  }[];
}

const PredictionBadge = ({ prediction }) => {
  const getConfidenceColor = () => {
    switch(prediction.confidence) {
      case 'high': return '#00FF41';
      case 'medium': return '#FFA500';
      case 'low': return '#FF6B6B';
    }
  };
  
  return (
    <View style={styles.predictionContainer}>
      <CircularProgress
        value={prediction.probability}
        radius={40}
        activeStrokeColor={getConfidenceColor()}
        inActiveStrokeColor="#2C2C2C"
      />
      <Text style={styles.predictionText}>
        {prediction.probability}%
      </Text>
      <Text style={styles.confidenceText}>
        {prediction.confidence} confidence
      </Text>
    </View>
  );
};
```

### 13.2 Visualización de Factores

```tsx
const MLFactorsRadar = ({ factors }) => {
  // Gráfico de radar para mostrar impacto de cada factor
  const data = factors.map(f => ({
    label: f.name,
    value: (f.impact + 100) / 2, // Normalizar a 0-100
  }));
  
  return (
    <RadarChart
      data={data}
      fillColor="rgba(0, 255, 65, 0.2)"
      strokeColor="#00FF41"
      strokeWidth={2}
    />
  );
};
```

---

## 🔧 14. CONFIGURACIÓN TÉCNICA

### 14.1 Dependencias Necesarias

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react-native": "0.74.5",
    "react-native-reanimated": "~3.10.0",
    "@shopify/flash-list": "1.7.1",
    "@tanstack/react-query": "^5.0.0",
    "expo-image": "~1.12.0",
    "expo-haptics": "~13.0.0",
    "react-native-svg": "15.2.0",
    "react-native-svg-charts": "^5.4.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "react-native-gesture-handler": "~2.16.0",
    "expo-linear-gradient": "~13.0.0"
  }
}
```

### 14.2 Estructura de Carpetas

```
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # Lista de partidos
│   │   ├── predictions.tsx   # Predicciones ML
│   │   ├── statistics.tsx    # Estadísticas generales
│   │   └── profile.tsx       # Perfil usuario
│   ├── match/
│   │   └── [id].tsx          # Vista detallada del partido
│   └── tournament/
│       └── [id].tsx          # Vista del torneo
├── components/
│   ├── matches/
│   │   ├── MatchCard.tsx
│   │   ├── MatchList.tsx
│   │   ├── LiveIndicator.tsx
│   │   └── ScoreDisplay.tsx
│   ├── statistics/
│   │   ├── StatBar.tsx
│   │   ├── StatComparison.tsx
│   │   └── RadarChart.tsx
│   ├── tournament/
│   │   ├── Bracket.tsx
│   │   └── DrawMatch.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── TabBar.tsx
│       └── Loading.tsx
├── hooks/
│   ├── useMatchData.ts
│   ├── useLiveScore.ts
│   └── usePrediction.ts
├── services/
│   ├── api.ts
│   ├── websocket.ts
│   └── cache.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── animations.ts
└── constants/
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts
```

---

## 💡 15. TIPS Y MEJORES PRÁCTICAS

### 15.1 Performance
1. **Lazy Loading**: Cargar tabs bajo demanda
2. **Virtualización**: Usar FlashList para listas largas
3. **Memoización**: React.memo para componentes pesados
4. **Optimistic Updates**: Actualizar UI antes de confirmar con servidor

### 15.2 UX
1. **Skeleton Screens**: Mostrar placeholders mientras carga
2. **Haptic Feedback**: Vibración sutil en interacciones
3. **Gestos**: Swipe entre tabs, pull to refresh
4. **Offline Mode**: Caché local para datos vistos

### 15.3 Accesibilidad
1. **Labels**: Agregar accessibilityLabel a todos los elementos
2. **Contraste**: Mantener ratio mínimo 4.5:1
3. **Tamaños Touch**: Mínimo 44x44 puntos
4. **Screen Readers**: Soporte completo

### 15.4 Testing
1. **Unit Tests**: Para lógica de negocio
2. **Component Tests**: Para componentes aislados
3. **Integration Tests**: Para flujos completos
4. **E2E Tests**: Con Detox o Maestro

---

## 🚨 16. CONSIDERACIONES FINALES

### Estados Edge Cases
- Partidos suspendidos por lluvia
- Retiros durante el partido
- Walkover
- Partidos sin estadísticas disponibles
- Conexión perdida durante live match

### Internacionalización
- Soporte para múltiples idiomas
- Formatos de fecha/hora locales
- Conversión de zonas horarias
- Monedas para cuotas

### Monetización
- Integración con casas de apuestas (affiliate)
- Suscripción premium para predicciones ML
- Ads no intrusivos
- In-app purchases para features avanzados

---

Esta guía proporciona una base sólida para desarrollar tu aplicación de predicciones de tenis con ML siguiendo el estilo de FlashScore. Recuerda iterar basándote en feedback de usuarios y métricas de uso.
