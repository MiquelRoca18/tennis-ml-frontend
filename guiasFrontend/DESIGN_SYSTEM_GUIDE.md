# 🎾 Tennis Predictions App - Guía Completa de Diseño

## 📖 Índice

1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Sistema de Colores](#sistema-de-colores)
3. [Tipografía](#tipografía)
4. [Espaciado y Grid](#espaciado-y-grid)
5. [Componentes UI](#componentes-ui)
6. [Pantallas](#pantallas)
7. [Estados de Interacción](#estados-de-interacción)
8. [Iconografía](#iconografía)
9. [Efectos Visuales](#efectos-visuales)
10. [Accesibilidad](#accesibilidad)
11. [Implementación en React Native](#implementación-en-react-native)

---

## 🎨 Filosofía de Diseño

### Concepto Visual

**"Modern Sports Analytics Dark"**

Una aplicación premium, orientada a datos, que combina la energía del deporte con la precisión de la analítica. El diseño debe transmitir:

- **Confianza**: Predicciones respaldadas por IA
- **Energía**: Deportes en vivo, acción continua
- **Precisión**: Datos estadísticos claros
- **Premium**: Experiencia VIP para apostadores serios

### Principios de Diseño

1. **Dark First**: Tema oscuro por defecto (menos fatiga visual, datos destacan)
2. **Data-Driven**: Los números y estadísticas son protagonistas
3. **Instant Recognition**: Estados visuales claros (live, finalizado, programado)
4. **Glanceable**: Información importante visible al instante
5. **Touch-Optimized**: Elementos grandes, fáciles de tocar

---

## 🎨 Sistema de Colores

### Paleta Principal

```typescript
// constants/Colors.ts

export const Colors = {
  // === BACKGROUNDS ===
  background: {
    primary: '#0A1929',      // Fondo principal (azul marino profundo)
    secondary: '#132F4C',    // Cards y secciones
    tertiary: '#1A2332',     // Cards elevados
    black: '#0F0F0F',        // Base absoluto
  },

  // === COLORES DE MARCA ===
  brand: {
    neonGreen: '#00FF88',    // Color primario (éxito, victorias)
    electricBlue: '#00D9FF', // Acento secundario (información)
    coralRed: '#FF6B6B',     // Pérdidas, errores
    liveRed: '#FF3B30',      // Partidos en vivo
    gold: '#FFD700',         // Premium, favoritos
  },

  // === TEXTO ===
  text: {
    primary: '#FFFFFF',      // Texto principal
    secondary: '#B2BAC2',    // Texto menos importante
    tertiary: '#8B95A0',     // Texto deshabilitado
    inverse: '#0A1929',      // Texto sobre fondos claros
  },

  // === ESTADOS ===
  status: {
    success: '#00FF88',      // Éxito, alta confianza
    warning: '#FFB800',      // Advertencia, confianza media
    error: '#FF6B6B',        // Error, baja confianza
    info: '#00D9FF',         // Información
    live: '#FF3B30',         // En vivo
  },

  // === UI ELEMENTS ===
  ui: {
    border: '#2D3843',       // Bordes sutiles
    borderLight: '#3D4855',  // Bordes visibles
    borderActive: '#00FF88', // Bordes activos
    shadow: 'rgba(0, 255, 136, 0.2)', // Sombras con glow
    overlay: 'rgba(10, 25, 41, 0.9)',  // Modals, overlays
  },

  // === GRADIENTES ===
  gradients: {
    primary: ['#0A1929', '#132F4C'],
    accent: ['#00FF88', '#00D9FF'],
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  },
};
```

### Uso de Colores

| Color | Uso Principal | Ejemplo |
|-------|---------------|---------|
| **Neon Green** (#00FF88) | Acciones primarias, victorias, alta confianza | Botones principales, ganadores |
| **Electric Blue** (#00D9FF) | Enlaces, información secundaria | Iconos informativos |
| **Coral Red** (#FF6B6B) | Pérdidas, alertas, baja confianza | Indicadores de error |
| **Live Red** (#FF3B30) | Partidos en directo | Badges "LIVE", puntos pulsantes |
| **Gold** (#FFD700) | Premium, favoritos, destacados | Estrellas, badges VIP |

### Ejemplos Visuales en Código

```tsx
// Botón primario con glow
<TouchableOpacity style={{
  backgroundColor: Colors.brand.neonGreen,
  shadowColor: Colors.brand.neonGreen,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 10,
}}>
  <Text>Confirmar Predicción</Text>
</TouchableOpacity>

// Card con glassmorphism
<View style={{
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)', // En web
  borderRadius: 16,
  borderWidth: 1,
  borderColor: Colors.ui.border,
}}>
  {/* Contenido */}
</View>
```

---

## ✍️ Tipografía

### Fuentes Recomendadas

**Primaria**: **Inter** (versátil, excelente legibilidad)
- Display/Headers: Inter Black (900)
- Títulos: Inter Bold (700)
- Subtítulos: Inter Semibold (600)
- Cuerpo: Inter Regular (400)

**Alternativa**: **Poppins** (más geométrica, moderna)

**Números**: **SF Mono** o **Roboto Mono** (números tabulares)

### Escala Tipográfica

```typescript
export const Typography = {
  // === HEADERS ===
  display: {
    fontSize: 36,
    fontWeight: '900',          // Black
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  
  h1: {
    fontSize: 28,
    fontWeight: '700',          // Bold
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  
  h2: {
    fontSize: 24,
    fontWeight: '600',          // Semibold
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0,
  },

  // === BODY ===
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',          // Regular
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // === ESPECIALES ===
  button: {
    fontSize: 16,
    fontWeight: '600',          // Semibold
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  stats: {
    fontSize: 24,
    fontWeight: '700',          // Bold
    fontVariant: ['tabular-nums'], // Números tabulares
    lineHeight: 28,
  },
  
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};
```

### Uso en React Native

```tsx
import { StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  displayText: {
    fontFamily: 'Inter-Black',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: Colors.text.primary,
  },
  
  statNumber: {
    fontFamily: 'RobotoMono-Bold',
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    color: Colors.brand.neonGreen,
  },
});

// Uso
<Text style={styles.displayText}>2-1</Text>
<Text style={styles.statNumber}>85%</Text>
```

### Instalación de Fuentes

```bash
# Expo
npx expo install expo-font

# En app.json
"expo": {
  "plugins": [
    [
      "expo-font",
      {
        "fonts": [
          "./assets/fonts/Inter-Black.ttf",
          "./assets/fonts/Inter-Bold.ttf",
          "./assets/fonts/Inter-Regular.ttf",
          "./assets/fonts/RobotoMono-Bold.ttf"
        ]
      }
    ]
  ]
}
```

---

## 📏 Espaciado y Grid

### Sistema de Espaciado

**Base: 4px** (todos los espacios son múltiplos de 4)

```typescript
export const Spacing = {
  xs: 4,      // Muy pequeño
  sm: 8,      // Pequeño
  md: 16,     // Medio (más usado)
  lg: 24,     // Grande
  xl: 32,     // Extra grande
  xxl: 48,    // Muy grande
  xxxl: 64,   // Máximo
};
```

### Grid System

```typescript
export const Layout = {
  // Padding de pantalla
  screenPadding: 20,
  
  // Márgenes entre elementos
  cardMargin: 16,
  sectionMargin: 24,
  
  // Alturas específicas
  headerHeight: 60,
  tabBarHeight: 70,
  cardHeight: 120,
  
  // Anchos
  screenWidth: Dimensions.get('window').width,
  cardWidth: Dimensions.get('window').width - 40, // Screen padding * 2
};
```

### Ejemplos de Uso

```tsx
// Card con espaciado correcto
<View style={{
  padding: Spacing.md,           // 16px interior
  marginBottom: Spacing.lg,      // 24px entre cards
  borderRadius: 16,
}}>
  <Text style={{ marginBottom: Spacing.sm }}>Título</Text>
  <Text>Contenido</Text>
</View>

// Sección con separación
<View style={{
  paddingHorizontal: Layout.screenPadding,  // 20px a los lados
  paddingVertical: Spacing.xl,              // 32px arriba/abajo
}}>
  {/* Contenido */}
</View>
```

---

## 🧩 Componentes UI

### 1. Botones

#### Primary Button

```tsx
<TouchableOpacity style={{
  backgroundColor: Colors.brand.neonGreen,
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderRadius: 12,
  alignItems: 'center',
  // Glow effect
  shadowColor: Colors.brand.neonGreen,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 10,
  elevation: 8,
}}>
  <Text style={{
    color: Colors.background.black,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  }}>
    Ver Predicción
  </Text>
</TouchableOpacity>
```

#### Secondary Button

```tsx
<TouchableOpacity style={{
  backgroundColor: 'transparent',
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: Colors.brand.neonGreen,
  alignItems: 'center',
}}>
  <Text style={{
    color: Colors.brand.neonGreen,
    fontSize: 16,
    fontWeight: '600',
  }}>
    Cancelar
  </Text>
</TouchableOpacity>
```

#### Disabled Button

```tsx
<TouchableOpacity 
  disabled
  style={{
    backgroundColor: Colors.text.tertiary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    opacity: 0.4,
  }}
>
  <Text style={{ color: Colors.text.secondary }}>
    No Disponible
  </Text>
</TouchableOpacity>
```

### 2. Match Card

```tsx
const MatchCard = ({ match }) => (
  <View style={{
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  }}>
    {/* Live Indicator */}
    {match.isLive && (
      <View style={{
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: Colors.status.live,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <View style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#FFF',
          marginRight: 4,
        }} />
        <Text style={{
          color: '#FFF',
          fontSize: 10,
          fontWeight: '700',
        }}>LIVE</Text>
      </View>
    )}

    {/* Player Info */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text style={{
          color: Colors.text.primary,
          fontSize: 16,
          fontWeight: '600',
        }}>
          {match.player1}
        </Text>
        <Text style={{
          color: Colors.text.secondary,
          fontSize: 12,
        }}>
          ATP: {match.ranking1}
        </Text>
      </View>

      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
      }}>
        <Text style={{
          color: Colors.text.primary,
          fontSize: 24,
          fontWeight: '700',
        }}>
          {match.score || 'VS'}
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={{
          color: Colors.text.primary,
          fontSize: 16,
          fontWeight: '600',
        }}>
          {match.player2}
        </Text>
        <Text style={{
          color: Colors.text.secondary,
          fontSize: 12,
        }}>
          ATP: {match.ranking2}
        </Text>
      </View>
    </View>

    {/* Prediction Bar */}
    <View style={{ marginTop: 12 }}>
      <View style={{
        height: 6,
        backgroundColor: Colors.ui.border,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <View style={{
          width: `${match.prediction1}%`,
          height: '100%',
          backgroundColor: Colors.brand.neonGreen,
        }} />
      </View>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
      }}>
        <Text style={{
          color: Colors.text.secondary,
          fontSize: 12,
        }}>
          {match.prediction1}%
        </Text>
        <Text style={{
          color: Colors.text.secondary,
          fontSize: 12,
        }}>
          {match.prediction2}%
        </Text>
      </View>
    </View>
  </View>
);
```

### 3. Prediction Gauge

```tsx
const PredictionGauge = ({ percentage, confidence }) => {
  const getColor = () => {
    if (confidence === 'high') return Colors.status.success;
    if (confidence === 'medium') return Colors.status.warning;
    return Colors.status.error;
  };

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Circular Progress */}
      <View style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 10,
        borderColor: Colors.ui.border,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Progress Arc - usar react-native-svg */}
        <Text style={{
          fontSize: 32,
          fontWeight: '700',
          color: getColor(),
        }}>
          {percentage}%
        </Text>
      </View>

      {/* Confidence Badge */}
      <View style={{
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: `${getColor()}20`,
        borderRadius: 12,
      }}>
        <Text style={{
          color: getColor(),
          fontSize: 12,
          fontWeight: '600',
          textTransform: 'uppercase',
        }}>
          {confidence}
        </Text>
      </View>
    </View>
  );
};
```

### 4. Stats Card

```tsx
const StatsCard = ({ icon, label, value, trend }) => (
  <View style={{
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  }}>
    {/* Icon */}
    <View style={{
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${Colors.brand.neonGreen}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    }}>
      <Ionicons name={icon} size={24} color={Colors.brand.neonGreen} />
    </View>

    {/* Content */}
    <View style={{ flex: 1 }}>
      <Text style={{
        color: Colors.text.secondary,
        fontSize: 12,
        marginBottom: 4,
      }}>
        {label}
      </Text>
      <Text style={{
        color: Colors.text.primary,
        fontSize: 20,
        fontWeight: '700',
      }}>
        {value}
      </Text>
    </View>

    {/* Trend */}
    {trend && (
      <Ionicons
        name={trend > 0 ? 'trending-up' : 'trending-down'}
        size={20}
        color={trend > 0 ? Colors.status.success : Colors.status.error}
      />
    )}
  </View>
);
```

### 5. Bottom Navigation

```tsx
const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Inicio' },
    { id: 'matches', icon: 'tennisball', label: 'Partidos' },
    { id: 'predictions', icon: 'analytics', label: 'Predicciones' },
    { id: 'stats', icon: 'stats-chart', label: 'Estadísticas' },
    { id: 'profile', icon: 'person', label: 'Perfil' },
  ];

  return (
    <View style={{
      height: 70,
      backgroundColor: Colors.background.secondary,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: Colors.ui.border,
      paddingBottom: 10, // Safe area
    }}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.icon : `${tab.icon}-outline`}
            size={24}
            color={activeTab === tab.id ? Colors.brand.neonGreen : Colors.text.tertiary}
          />
          <Text style={{
            fontSize: 10,
            marginTop: 4,
            color: activeTab === tab.id ? Colors.brand.neonGreen : Colors.text.tertiary,
            fontWeight: activeTab === tab.id ? '600' : '400',
          }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

---

## 📱 Pantallas

### 1. Dashboard / Home

**Estructura:**

```
┌─────────────────────────────────┐
│  Logo            [Profile Icon] │  ← Header (60px)
├─────────────────────────────────┤
│  Live Matches →→→→→             │  ← Horizontal Scroll
│  [Card] [Card] [Card]           │
├─────────────────────────────────┤
│  Today's Top Predictions        │  ← Section Title
│  [Match Card]                   │
│  [Match Card]                   │
│  [Match Card]                   │
├─────────────────────────────────┤
│  Quick Stats                    │
│  [Accuracy] [Predictions] [Win] │
├─────────────────────────────────┤
│  ☰ Home  🎾 Matches  📊 ...    │  ← Bottom Nav (70px)
└─────────────────────────────────┘
```

**Código:**

```tsx
const DashboardScreen = () => (
  <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
    {/* Header */}
    <View style={styles.header}>
      <Image source={require('./logo.png')} style={styles.logo} />
      <TouchableOpacity>
        <Ionicons name="person-circle" size={32} color={Colors.brand.neonGreen} />
      </TouchableOpacity>
    </View>

    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Live Matches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>En Vivo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {liveMatches.map(match => (
            <LiveMatchCard key={match.id} match={match} />
          ))}
        </ScrollView>
      </View>

      {/* Top Predictions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mejores Predicciones Hoy</Text>
        {topPredictions.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas Rápidas</Text>
        <View style={styles.statsGrid}>
          <StatsCard icon="checkmark-circle" label="Precisión" value="87%" />
          <StatsCard icon="analytics" label="Predicciones" value="142" />
          <StatsCard icon="trophy" label="Victorias" value="94%" />
        </View>
      </View>
    </ScrollView>

    <BottomNav activeTab="home" />
  </View>
);

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  logo: {
    width: 100,
    height: 30,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
});
```

### 2. Match Detail

**Estructura:**

```
┌─────────────────────────────────┐
│  [← Back]      Match Detail     │
├─────────────────────────────────┤
│  ★  [Player 1 Photo]  [Score]   │  ← Hero Card
│      Nadal R.          2-1      │
│      ATP: 5                     │
│                                 │
│      [Player 2 Photo]  ★        │
│      Djokovic N.                │
│      ATP: 1                     │
│                                 │
│      FINALIZADO                 │
├─────────────────────────────────┤
│  AI Prediction                  │
│  [Nadal]  ▓▓▓▓▓▓░░░░  65%     │
│  [Djoko]  ▓▓▓░░░░░░░  35%     │
│                                 │
│  > Análisis Detallado           │
├─────────────────────────────────┤
│  Head to Head                   │
│  [Comparison bars]              │
├─────────────────────────────────┤
│  Recent Form                    │
│  Nadal:  W W L W W             │
│  Djoko:  W W W W L             │
└─────────────────────────────────┘
```

### 3. Predictions List

**Estructura:**

```
┌─────────────────────────────────┐
│  Predictions      [Search 🔍]   │
├─────────────────────────────────┤
│  [All] [Live] [Upcoming] [Done] │  ← Filter Chips
├─────────────────────────────────┤
│  High Confidence                │
│  [Match Card - 85%]             │
│  [Match Card - 82%]             │
│                                 │
│  Medium Confidence              │
│  [Match Card - 65%]             │
│  [Match Card - 58%]             │
└─────────────────────────────────┘
```

### 4. Statistics

**Estructura:**

```
┌─────────────────────────────────┐
│  Statistics                     │
├─────────────────────────────────┤
│       ◉ 87%                     │  ← Circular Progress
│    Overall Accuracy             │
├─────────────────────────────────┤
│  Success by Surface             │
│  Clay    ▓▓▓▓▓▓▓▓░░  82%      │
│  Hard    ▓▓▓▓▓▓▓▓▓░  90%      │
│  Grass   ▓▓▓▓▓▓░░░░  75%      │
├─────────────────────────────────┤
│  Weekly Performance             │
│  [Line Chart]                   │
├─────────────────────────────────┤
│  Most Successful                │
│  ATP Finals        94%          │
│  Grand Slams       88%          │
│  Masters 1000      85%          │
└─────────────────────────────────┘
```

### 5. Profile

**Estructura:**

```
┌─────────────────────────────────┐
│       [Avatar]                  │
│     Juan Pérez                  │
│  juan@example.com               │
├─────────────────────────────────┤
│  Notifications         [Toggle] │
│  Email Alerts          [Toggle] │
│  Push Notifications    [Toggle] │
├─────────────────────────────────┤
│  Favorites                  12  │
│  Saved Predictions          45  │
├─────────────────────────────────┤
│  About                          │
│  Version 1.0.0                  │
│                                 │
│  Dark Mode            [Toggle] │
│                                 │
│  [Logout Button]                │
└─────────────────────────────────┘
```

---

## 🎭 Estados de Interacción

### Pressed/Tap State

```tsx
// Usar TouchableOpacity con activeOpacity
<TouchableOpacity
  activeOpacity={0.7}
  style={styles.button}
>
  <Text>Press Me</Text>
</TouchableOpacity>

// O TouchableHighlight para efecto de oscurecimiento
<TouchableHighlight
  underlayColor={Colors.ui.border}
  onPress={handlePress}
>
  <View style={styles.card}>
    {/* Content */}
  </View>
</TouchableHighlight>
```

### Active/Selected State

```tsx
<View style={[
  styles.filterChip,
  isActive && {
    backgroundColor: `${Colors.brand.neonGreen}20`,
    borderColor: Colors.brand.neonGreen,
    shadowColor: Colors.brand.neonGreen,
    shadowOpacity: 0.3,
  }
]}>
  <Text style={[
    styles.chipText,
    isActive && { color: Colors.brand.neonGreen }
  ]}>
    {label}
  </Text>
</View>
```

### Loading State

```tsx
const SkeletonCard = () => (
  <View style={{
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  }}>
    {/* Shimmer effect - usar react-native-shimmer-placeholder */}
    <ShimmerPlaceholder
      style={{ width: '100%', height: 20, borderRadius: 4 }}
      shimmerColors={[
        Colors.ui.border,
        Colors.background.tertiary,
        Colors.ui.border
      ]}
    />
    <ShimmerPlaceholder
      style={{ width: '60%', height: 16, borderRadius: 4, marginTop: 8 }}
    />
  </View>
);
```

### Error State

```tsx
const ErrorView = ({ message, onRetry }) => (
  <View style={{
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Ionicons name="alert-circle" size={64} color={Colors.status.error} />
    <Text style={{
      color: Colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    }}>
      {message}
    </Text>
    <TouchableOpacity
      onPress={onRetry}
      style={{
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: Colors.brand.neonGreen,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: Colors.background.black, fontWeight: '600' }}>
        Reintentar
      </Text>
    </TouchableOpacity>
  </View>
);
```

### Empty State

```tsx
const EmptyState = ({ icon, title, description }) => (
  <View style={{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  }}>
    {/* Ilustración o ícono grande */}
    <Ionicons name={icon} size={100} color={Colors.text.tertiary} />
    
    <Text style={{
      fontSize: 20,
      fontWeight: '700',
      color: Colors.text.primary,
      marginTop: 24,
      textAlign: 'center',
    }}>
      {title}
    </Text>
    
    <Text style={{
      fontSize: 14,
      color: Colors.text.secondary,
      marginTop: 8,
      textAlign: 'center',
    }}>
      {description}
    </Text>
  </View>
);

// Uso
<EmptyState
  icon="search"
  title="No se encontraron partidos"
  description="Intenta con otros filtros o búsqueda"
/>
```

---

## 🎯 Iconografía

### Tamaños de Iconos

```typescript
export const IconSizes = {
  tiny: 16,      // Inline, badges
  small: 20,     // Botones pequeños
  medium: 24,    // Navegación, acciones
  large: 32,     // Headers importantes
  xlarge: 48,    // Stats cards
  huge: 64,      // Empty states, errors
};
```

### Iconos Principales

**De @expo/vector-icons (Ionicons):**

| Función | Icono | Nombre |
|---------|-------|--------|
| Home | 🏠 | `home` / `home-outline` |
| Partidos | 🎾 | `tennisball` / `tennisball-outline` |
| Predicciones | 📊 | `analytics` / `analytics-outline` |
| Estadísticas | 📈 | `stats-chart` / `stats-chart-outline` |
| Perfil | 👤 | `person` / `person-outline` |
| Favorito | ⭐ | `star` / `star-outline` |
| Live | 🔴 | `radio-button-on` |
| Búsqueda | 🔍 | `search` |
| Filtro | ⚙️ | `filter` |
| Notificación | 🔔 | `notifications` |
| Configuración | ⚙️ | `settings` |
| Victoria | ✅ | `checkmark-circle` |
| Derrota | ❌ | `close-circle` |
| Info | ℹ️ | `information-circle` |
| Compartir | 📤 | `share-social` |
| Más | ⋯ | `ellipsis-horizontal` |

### Iconos Personalizados

Para iconos específicos de tenis (raqueta, cancha, etc.), usar SVG:

```tsx
import Svg, { Path, Circle } from 'react-native-svg';

const TennisRacket = ({ size = 24, color = Colors.brand.neonGreen }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 3.87 3.13 7 7 7s7-3.13 7-7-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
      fill={color}
    />
    <Path
      d="M11 17h2v5h-2z"
      fill={color}
    />
  </Svg>
);
```

---

## ✨ Efectos Visuales

### 1. Glassmorphism

```tsx
const GlassCard = ({ children }) => (
  <View style={{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    // En iOS usa blur:
    backdropFilter: 'blur(10px)',
  }}>
    {/* Para Android, usar BlurView de expo-blur */}
    <BlurView intensity={20} style={StyleSheet.absoluteFill}>
      {children}
    </BlurView>
  </View>
);
```

### 2. Neon Glow

```tsx
const NeonButton = ({ children, color = Colors.brand.neonGreen }) => (
  <TouchableOpacity style={{
    backgroundColor: color,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    // Glow effect
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  }}>
    {children}
  </TouchableOpacity>
);
```

### 3. Gradient Backgrounds

```tsx
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#0A1929', '#132F4C']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{ flex: 1 }}
>
  {/* Content */}
</LinearGradient>
```

### 4. Pulsing Dot (Live Indicator)

```tsx
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

const LiveDot = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: Colors.status.live,
        },
        animatedStyle,
      ]} />
    </View>
  );
};
```

### 5. Shimmer Loading

```bash
npm install react-native-shimmer-placeholder
```

```tsx
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

<ShimmerPlaceholder
  style={{ width: 200, height: 20, borderRadius: 4 }}
  shimmerColors={[
    Colors.ui.border,
    Colors.background.tertiary,
    Colors.ui.border,
  ]}
/>
```

---

## ♿ Accesibilidad

### Contraste de Colores

**Mínimo requerido: 4.5:1 para texto normal**

| Combinación | Ratio | Estado |
|-------------|-------|--------|
| Neon Green (#00FF88) sobre Negro (#0F0F0F) | 14.2:1 | ✅ Excelente |
| Blanco (#FFFFFF) sobre Charcoal (#1A1A1D) | 16.8:1 | ✅ Excelente |
| Texto Secundario (#B2BAC2) sobre Primary (#0A1929) | 8.3:1 | ✅ Muy bueno |
| Live Red (#FF3B30) sobre Negro | 5.9:1 | ✅ Bueno |

### Touch Targets

**Mínimo: 44x44px (Apple HIG) / 48x48dp (Material Design)**

```tsx
// Correcto
<TouchableOpacity style={{
  minWidth: 44,
  minHeight: 44,
  alignItems: 'center',
  justifyContent: 'center',
}}>
  <Ionicons name="star" size={24} />
</TouchableOpacity>

// Incorrecto - muy pequeño
<TouchableOpacity style={{ width: 20, height: 20 }}>
  <Ionicons name="star" size={16} />
</TouchableOpacity>
```

### Screen Readers

```tsx
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Ver detalles del partido"
  accessibilityHint="Abre la pantalla de detalles con estadísticas completas"
  accessibilityRole="button"
>
  <Text>Ver Detalles</Text>
</TouchableOpacity>

<Image
  source={{ uri: player.photo }}
  accessible={true}
  accessibilityLabel={`Foto de ${player.name}`}
/>

<View
  accessible={true}
  accessibilityRole="text"
  accessibilityLabel={`Marcador: ${score1} - ${score2}`}
>
  <Text>{score1} - {score2}</Text>
</View>
```

### Estados Visuales Múltiples

**No usar solo color para indicar estado:**

```tsx
// ❌ Solo color
<View style={{ backgroundColor: isLive ? 'red' : 'gray' }}>
  <Text>Partido</Text>
</View>

// ✅ Color + ícono + texto
<View style={{
  backgroundColor: isLive ? Colors.status.live : Colors.ui.border
}}>
  {isLive && <LiveDot />}
  <Text>{isLive ? 'EN VIVO' : 'Programado'}</Text>
</View>
```

---

## 💻 Implementación en React Native

### Estructura de Proyecto Recomendada

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── index.ts
│   ├── match/
│   │   ├── MatchCard.tsx
│   │   ├── MatchDetailHeader.tsx
│   │   ├── PredictionGauge.tsx
│   │   └── index.ts
│   └── stats/
│       ├── StatsCard.tsx
│       ├── ProgressBar.tsx
│       └── index.ts
├── screens/
│   ├── DashboardScreen.tsx
│   ├── MatchDetailScreen.tsx
│   ├── PredictionsScreen.tsx
│   ├── StatisticsScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/
│   ├── BottomTabNavigator.tsx
│   └── RootNavigator.tsx
├── constants/
│   ├── Colors.ts
│   ├── Typography.ts
│   ├── Spacing.ts
│   └── index.ts
├── hooks/
│   ├── useTheme.ts
│   └── useMatches.ts
├── services/
│   └── api.ts
├── types/
│   └── match.ts
└── utils/
    └── formatters.ts
```

### Instalación de Dependencias

```bash
# Expo base
npx create-expo-app tennis-predictions --template

# Navegación
npx expo install expo-router react-native-safe-area-context react-native-screens

# UI
npx expo install @expo/vector-icons expo-linear-gradient expo-blur

# Animaciones
npx expo install react-native-reanimated react-native-gesture-handler

# Gráficos (opcional)
npm install react-native-svg react-native-chart-kit

# HTTP
npm install axios

# Shimmer loading
npm install react-native-shimmer-placeholder
```

### Theme Provider

```tsx
// contexts/ThemeContext.tsx
import React, { createContext, useContext } from 'react';
import { Colors, Typography, Spacing } from '../constants';

const ThemeContext = createContext({
  colors: Colors.dark,
  typography: Typography,
  spacing: Spacing,
});

export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{
    colors: Colors.dark,
    typography: Typography,
    spacing: Spacing,
  }}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);

// Uso en componentes
const MyComponent = () => {
  const { colors, spacing } = useTheme();
  
  return (
    <View style={{
      backgroundColor: colors.background.primary,
      padding: spacing.md,
    }}>
      <Text style={{ color: colors.text.primary }}>Hello</Text>
    </View>
  );
};
```

### App.tsx Base

```tsx
// App.tsx
import { ThemeProvider } from './contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </ThemeProvider>
  );
}
```

---

## 🎯 Checklist de Implementación

### Fase 1: Setup (Semana 1)
- [ ] Crear proyecto Expo
- [ ] Instalar dependencias
- [ ] Configurar navegación
- [ ] Crear sistema de colores
- [ ] Configurar tipografía
- [ ] Setup Theme Provider

### Fase 2: Componentes Base (Semana 2)
- [ ] Botones (Primary, Secondary, Disabled)
- [ ] Cards básicos
- [ ] Bottom Navigation
- [ ] Header
- [ ] Loading states (Skeleton)
- [ ] Empty states
- [ ] Error states

### Fase 3: Componentes Específicos (Semana 3)
- [ ] Match Card
- [ ] Prediction Gauge
- [ ] Stats Card
- [ ] Live Indicator
- [ ] Filter Chips
- [ ] Badges

### Fase 4: Pantallas (Semana 4-5)
- [ ] Dashboard/Home
- [ ] Match Detail
- [ ] Predictions List
- [ ] Statistics
- [ ] Profile

### Fase 5: Funcionalidad (Semana 6)
- [ ] Integrar API
- [ ] Manejo de estados
- [ ] Animaciones
- [ ] Pull to refresh
- [ ] Búsqueda
- [ ] Filtros

### Fase 6: Pulido (Semana 7)
- [ ] Optimizar rendimiento
- [ ] Accesibilidad
- [ ] Testing
- [ ] Ajustes finales
- [ ] Preparar para producción

---

## 📚 Recursos Adicionales

### Herramientas de Diseño

- **Figma**: Diseño de UI/UX
- **ColorSpace**: Generar paletas de colores
- **Type Scale**: Calcular escalas tipográficas
- **WebAIM Contrast Checker**: Verificar contrastes

### Librerías Útiles

- **react-native-chart-kit**: Gráficos
- **react-native-svg**: SVGs personalizados
- **lottie-react-native**: Animaciones complejas
- **react-native-fast-image**: Caché de imágenes
- **@shopify/flash-list**: Listas optimizadas

### Referencias

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Material Design](https://material.io/)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)

---

## 🎉 ¡Listo para Empezar!

Esta guía cubre todo lo necesario para implementar una aplicación moderna de predicciones de tenis con un diseño profesional, oscuro y orientado a datos.

**Próximos pasos:**
1. Revisa cada sección
2. Adapta los colores/tipografía a tu gusto
3. Implementa componente por componente
4. Prueba en dispositivos reales
5. Itera y mejora

¿Preguntas? ¡Consulta la documentación o pregunta! 🚀
