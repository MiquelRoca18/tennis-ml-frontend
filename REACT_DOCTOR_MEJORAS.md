# Guía de mejoras de rendimiento – React Doctor (tennis-ml-frontend)

Puntuación actual: **76/100** · 51 errores · 222 advertencias

Esta guía indica **dónde** está cada tipo de problema y qué cambiar para mejorar el rendimiento y la compatibilidad con React Compiler.

---

## Errores (arreglar primero)

### 1. Modificar un valor devuelto por un hook (11)

**Problema:** Asignar a `.current` de un `useRef` durante el render.

**Ubicación principal:**
- `app/(tabs)/index.tsx` líneas 41-42:
  ```ts
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;  // ← durante render
  ```
**Solución:** Mover la asignación a un `useEffect`:  
`useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);`

Buscar en el proyecto otros patrones `ref.current = ...` en el cuerpo del componente (fuera de callbacks/effects).

---

### 2. useState llamado condicionalmente

**Problema:** Hooks deben ejecutarse siempre en el mismo orden; no dentro de `if` o después de un `return`.

**Ubicación:**
- `components/match/detail/v2/tabs/PredictionTabV2.tsx`: hay un `return` en las líneas 30-39 y **después** se llama `useState(false)` en la línea 52. Si `!prediction`, ese `useState` no se ejecuta.

**Solución:** Declarar **todos** los hooks al inicio del componente, antes de cualquier `return`:
  ```ts
  export default function PredictionTabV2(...) {
    const [showRegisterBetModal, setShowRegisterBetModal] = useState(false);  // ← arriba
    const { prediction, ... } = data;
    if (!prediction) return (...);
    // ...
  }
  ```

---

### 3. setState síncrono dentro de useEffect (cascadas de render)

**Problema:** Llamar `setState` de forma síncrona en el cuerpo del `useEffect` (no en un callback asíncrono) puede provocar renders en cascada.

**Dónde revisar:** Cualquier `useEffect` que haga algo como:
  ```ts
  useEffect(() => {
    setLoading(true);   // o varios setState seguidos de forma síncrona
    setError(null);
    // ...
  }, [deps]);
  ```
Suelen estar en:
- `app/(tabs)/bets.tsx` (useFocusEffect / loadBets)
- `app/(tabs)/index.tsx` (loadMatches, efecto inicial)
- `src/contexts/FavoritesContext.tsx`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useMatchDetail.ts`
- `src/hooks/useFavorites.ts`
- `components/match/FavoriteMatchCard.tsx`

**Solución:** Preferir:
- Inicializar estado en `useState(initialValue)` y en el efecto solo actualizar cuando lleguen datos (en callbacks de fetch/then/catch).
- O agrupar estado relacionado en `useReducer` y despachar una sola acción en el efecto.

---

### 4. Componente definido dentro de otro (nueva instancia cada render)

**Problema:** Un componente declarado **dentro** del cuerpo de otro se “recrea” en cada render y pierde estado interno.

**Ubicación:**
- `components/match/detail/odds/MarketSummary.tsx` líneas 70-75: `StatRow` está definido **dentro** de `MarketSummary`.

**Solución:** Sacar `StatRow` a scope de módulo (mismo archivo, fuera de `MarketSummary`) o a un archivo aparte, por ejemplo `StatRow.tsx`:
  ```ts
  // Fuera de MarketSummary, en el mismo archivo o en StatRow.tsx
  const StatRow = ({ label, value }: { label: string; value: string }) => (...);
  export default function MarketSummary(...) { ... }
  ```

Buscar otros componentes declarados dentro de otro (function X() { ... function Y() { ... } return <Y /> }).

---

### 5. Componentes creados durante el render (5)

**Problema:** Crear componentes (o elementos que actúan como tal) durante el render hace que se “recreyen” y pierdan estado.

**Dónde buscar:** Cualquier lugar donde se defina una función que retorna JSX **dentro** del cuerpo del componente y se use como componente o como “render prop”, por ejemplo:
- `renderTabContent()` en `MatchDetailV2.tsx` y en `app/player/[key].tsx`
- Funciones inline que retornan JSX dentro de `.map()` o listas

**Solución:** Extraer a un componente con nombre en el mismo archivo o en otro, y usarlo como `<TabContent />` en lugar de `{renderTabContent()}`.

---

### 6. Acceso a refs durante el render

**Problema:** Leer o escribir `ref.current` durante el render (no en event handler ni en effect).

**Dónde buscar:** Cualquier uso de `xxxRef.current` en el cuerpo del componente (fuera de `useEffect`, `useCallback`, handlers).  
Ejemplo ya localizado: asignación en `index.tsx` (ref en punto 1). Revisar también:
- `components/match/RegisterBetModal.tsx` (el ref se usa dentro de `requestAnimationFrame` en callback, suele ser correcto; asegurarse de que no se lea en el render).
- Cualquier componente que use `ref.current` para decidir qué pintar (eso debe ser estado derivado o effect).

---

### 7. Value blocks en try/catch (26) – React Compiler

**Problema:** Uso de bloques de valor (ternarios, optional chaining, etc.) dentro de `try/catch` que el compilador aún no optimiza bien.

**Dónde:** Repartido en 26 sitios. Para listarlos con precisión, ejecuta:
  ```bash
  npx react-doctor@latest . --verbose
  ```
y revisa el informe o el JSON de diagnóstico.

**Solución:** Refactorizar para sacar la lógica condicional fuera del `try/catch` o simplificar las expresiones dentro del `try`.

---

## Advertencias (mejoras recomendadas)

### 8. key={index} en listas (28)

**Problema:** Usar el índice del array como `key` puede dar bugs al reordenar/filtrar.

**Archivos con `key={index}` o similar:**
- `components/match/H2HSection.tsx` (key={index})
- `components/match/detail/v2/tabs/OddsTabV2.tsx` (key={bm.bookmaker + index})
- `components/match/detail/overview/SetBySetScore.tsx` (key={index})
- `components/match/detail/live/MomentumChart.tsx` (key={index})
- `components/match/detail/live/KeyPoints.tsx` (key={index})
- `components/match/detail/prediction/AIInsights.tsx` (key={index})
- `components/player/PlayerStats.tsx` (key={index})
- `components/player/UpcomingMatches.tsx` (key={match.event_key ?? index} – este está bien si event_key es estable)

**Solución:** Usar un id estable: `key={item.id}`, `key={item.slug}`, o un campo único del dominio (event_key, match_id, etc.).

---

### 9. BetsScreen con 5 useState – considerar useReducer (6)

**Ubicación:** `app/(tabs)/bets.tsx`  
Estado actual: `bets`, `loading`, `refreshing`, `deletingId`, `matchSchedule`.

**Solución:** Agrupar en un reducer, por ejemplo:
  ```ts
  type BetsState = { bets: Bet[]; loading: boolean; refreshing: boolean; deletingId: string | null; matchSchedule: ... };
  const [state, dispatch] = useReducer(betsReducer, initialState);
  ```

---

### 10. Estilos de sombra legacy (6)

**Problema:** `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation` – en la nueva arquitectura se recomienda `boxShadow`.

**Archivos:**
- `components/match/RegisterBetModal.tsx` (shadowColor, shadowOffset, etc.)
- `components/match/detail/v2/tabs/H2HTabV2.tsx`
- `components/match/DateSelector.tsx`

**Solución:** Migrar a la propiedad `boxShadow` según la guía de React Native / Expo para la nueva arquitectura.

---

### 11. @expo/vector-icons deprecado (7)

**Problema:** Paquete legacy; se recomienda usar `expo-image` con fuentes SF (URIs) u otra alternativa actual.

**Archivos que importan `@expo/vector-icons`:**
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/explore/tournaments.tsx`
- `components/player/UpcomingMatches.tsx`
- `app/match/[id].tsx`
- `app/search.tsx`
- `app/(tabs)/explore/index.tsx`
- `components/common/AppHeader.tsx`

**Solución:** Seguir la guía de Expo para reemplazar iconos (p. ej. `expo-image` con URIs de símbolos).

---

### 12. Varios setState en un solo useEffect (4)

**Problema:** Muchas llamadas `setX` en un mismo efecto dificultan seguir el flujo y pueden provocar renders extra.

**Dónde:** Los mismos archivos que en el punto 3 (bets, index, contexts, useMatchDetail, useFavorites, etc.).

**Solución:** Un solo `setState` con objeto actualizado o `useReducer` con una acción que actualice todo el bloque de estado de una vez.

---

### 13. renderItem inline en FlatList (3)

**Problema:** `renderItem={({ item }) => (...)}` crea una nueva función en cada render.

**Archivos:**
- `app/tournament/[key].tsx` (renderItem inline)
- `app/(tabs)/explore/tournaments.tsx`
- `app/(tabs)/explore/rankings.tsx`

**Solución:** Extraer a función con nombre y envolver en `useCallback`:  
`const renderItem = useCallback(({ item }) => <Row item={item} />, []);`

---

### 14. useState inicializado desde prop (initiallyExpanded) (2)

**Problema:** Si el valor debe estar sincronizado con la prop, es mejor derivarlo en render que guardarlo en estado.

**Ubicaciones:**
- `components/match/FavoriteTournamentSection.tsx` (initiallyExpanded, useState(isExpanded))
- `components/match/TournamentSection.tsx` (initiallyExpanded, useState(isExpanded))

**Solución:** Si “expandido” debe seguir a la prop: usar solo la prop o un valor derivado. Si debe ser control interno que solo usa la prop como valor inicial y luego es independiente, está bien usar estado pero inicializar con función:  
`useState(() => initiallyExpanded)` para evitar ejecutar el inicializador en cada render.

---

### 15. Dimensions.get() no reactivo

**Problema:** No se actualiza en rotación o cambio de tamaño de ventana.

**Archivos:**
- `components/match/detail/live/MomentumChart.tsx` (Dimensions.get('window').width)
- `constants/Spacing.ts` (Dimensions.get('window')...)

**Solución:** Usar `useWindowDimensions()` de React Native donde necesites dimensiones reactivas.

---

### 16. RegisterBetModal muy grande (305 líneas) (2)

**Ubicación:** `components/match/RegisterBetModal.tsx`

**Solución:** Extraer subcomponentes: por ejemplo cabecera del usuario, selector de casa/cuota, formulario de cantidad, botones de acción, etc.

---

### 17. useEffect que simula un event handler

**Problema:** Lógica que debería ejecutarse en respuesta a una acción de usuario está en un efecto.

**Dónde:** Revisar efectos que reaccionan a un prop/estado y hacen algo que podría hacerse en `onClick`/`onSubmit`/`onChange`. Buscar en los mismos archivos de estado (bets, index, auth, favorites).

**Solución:** Mover la lógica al manejador de evento correspondiente.

---

### 18. renderTabContent() inline (5)

**Ubicación:**
- `components/match/detail/v2/MatchDetailV2.tsx` (renderTabContent)
- `app/player/[key].tsx` (renderTabContent)

**Solución:** Extraer el contenido de cada tab a un componente (`OverviewTabContent`, `StatsTabContent`, etc.) y usarlos directamente en el JSX en lugar de `{renderTabContent()}`.

---

### 19. useState(getTodayDate()) – inicializador en cada render

**Problema:** `useState(getTodayDate())` ejecuta `getTodayDate()` en cada render (aunque React solo usa el valor la primera vez).

**Ubicación:** `app/(tabs)/index.tsx` línea 33:  
`const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());`

**Solución:** Inicialización perezosa:  
`const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDate());`

Comprobar si en `app/tournament/[key].tsx` o `app/(tabs)/favorites.tsx` se usa el mismo patrón y aplicar lo mismo.

---

### 20. Archivos no usados (49) y export no usado

**Problema:** Archivos que no importa nadie, o exports que no se usan.

**Ejemplos conocidos:**
- **useTheme** no usado: exportado en `contexts/ThemeContext.tsx`; solo se usa `ThemeProvider` en `app/_layout.tsx`. Eliminar export o usarlo en los componentes que deban leer tema.
- **Tipo Confidence:** en `src/types/api.ts` está exportado y sí se usa en `ConfidenceBadge.tsx` y en tipos de API; si el linter marca “unused”, puede ser un falso positivo o una variante (p. ej. solo re-export).

**Solución:** Para listar archivos no usados, usar el informe de react-doctor o un análisis de dependencias. Eliminar o usar los archivos/exports que realmente no se necesiten.

---

### 21. Export duplicado useMatchDetail | default

**Ubicación:** `src/hooks/useMatchDetail.ts`  
Tiene tanto `export function useMatchDetail` como `export default useMatchDetail`.

**Solución:** Dejar solo una forma de export: o bien `export function useMatchDetail` y que los consumidores importen `import { useMatchDetail } from '...'`, o bien `export default function useMatchDetail` y `import useMatchDetail from '...'`. En el proyecto se usa `import { useMatchDetail } from ...` en `MatchDetailV2.tsx`, así que puedes quitar el `export default` si no se usa en ningún otro sitio.

---

## Resumen de archivos a tocar primero

| Prioridad | Archivo | Qué hacer |
|-----------|---------|------------|
| Alta | `app/(tabs)/index.tsx` | Ref durante render, useState lazy init |
| Alta | `components/match/detail/v2/tabs/PredictionTabV2.tsx` | useState antes del early return |
| Alta | `components/match/detail/odds/MarketSummary.tsx` | Extraer StatRow fuera del componente |
| Media | `app/(tabs)/bets.tsx` | useReducer, revisar setState en effects |
| Media | `src/hooks/useMatchDetail.ts` | Un solo tipo de export |
| Media | `components/match/RegisterBetModal.tsx` | Dividir en subcomponentes, sombras |
| Baja | Varios | keys estables, useCallback en renderItem, useWindowDimensions, etc. |

---

## Cómo obtener el listado exacto de react-doctor

Para ver el informe completo con rutas y líneas:

```bash
cd tennis-ml-frontend
npx react-doctor@latest . --verbose
```

Para intentar correcciones automáticas:

```bash
npx react-doctor@latest . --fix
```

Revisa siempre los diffs antes de commitear. Conviene ir corrigiendo por bloques (por ejemplo solo “errores de hooks”) y volver a ejecutar react-doctor para comprobar que la puntuación y los errores mejoran.
