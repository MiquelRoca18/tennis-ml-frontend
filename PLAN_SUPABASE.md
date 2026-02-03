# Plan de Integración Supabase - Tennis ML

> **Estado**: Implementado ✅

## Resumen ejecutivo

Este documento describe el plan para integrar **Supabase** en la app Tennis ML, permitiendo a los usuarios registrarse, iniciar sesión y **guardar sus partidos favoritos en la nube** (sincronizados entre dispositivos). Supabase se usa solo en el frontend; el backend Python (tennis-ml-predictor) permanece intacto.

### Setup rápido

1. Copia `.env.example` a `.env` y rellena las credenciales de Supabase
2. Ejecuta el SQL en `supabase/migrations/001_create_favorites.sql` en el SQL Editor de tu proyecto Supabase
3. En Supabase Dashboard → Authentication → Providers: habilita Email
4. **Borrar cuenta** (opcional): Despliega la Edge Function `delete-account` (ver `supabase/functions/README.md`)

### Logs de depuración

En modo desarrollo (`__DEV__`), la app escribe logs con prefijos `[Auth]`, `[Supabase]`, `[Favorites]` para facilitar el debug de conexiones y errores.

---

## Estado actual de la app

### Estructura de partidos (Match)

Los partidos vienen del backend con esta estructura relevante:

```typescript
// src/types/api.ts
interface Match {
  id: number;              // ID en nuestro backend (clave para favoritos)
  event_key: string;       // ID en API-Tennis
  torneo: string | null;
  tournament_key: string;
  tournament_season: string;
  jugador1: { nombre, key, ranking, cuota, logo };
  jugador2: { nombre, key, ranking, cuota, logo };
  // ... más campos
}
```

- **`match.id`**: ID numérico del backend. Es el identificador que usamos para favoritos.
- **`event_key`**: ID externo de API-Tennis (útil para referencias futuras).

### Sistema de favoritos actual

- **Almacenamiento**: `AsyncStorage` (local en el dispositivo).
- **Interface** (`favoritesService.ts`):

  ```typescript
  interface Favorite {
    matchId: number;
    player1Name: string;
    player2Name: string;
    tournament: string;
    addedAt: string;
  }
  ```

- **Hooks**: `useFavorites`, `useIsFavorite` ya existen.
- **UI**: `FavoriteButton` existe pero **no está integrado** en ninguna pantalla.
- **Lista de favoritos**: No hay pantalla dedicada.

---

## Arquitectura Supabase

### 1. Servicios de Supabase

- **Auth**: Login, registro, sesión, recuperación de contraseña.
- **Database**: Tabla `favorites` para partidos favoritos por usuario.
- **Realtime** (opcional): Sincronización en tiempo real entre dispositivos.

### 2. Esquema de base de datos

#### Tabla `favorites`

| Columna       | Tipo        | Descripción                                      |
|---------------|-------------|--------------------------------------------------|
| `id`          | `uuid`      | PK, auto-generado                                |
| `user_id`     | `uuid`      | FK → `auth.users.id` (RLS)                       |
| `match_id`    | `integer`   | ID del partido en nuestro backend                |
| `event_key`   | `text`      | ID en API-Tennis (opcional, para futuras APIs)  |
| `player1_name`| `text`      | Nombre jugador 1 (para mostrar sin fetch)        |
| `player2_name`| `text`      | Nombre jugador 2                                 |
| `tournament`  | `text`      | Nombre del torneo                                |
| `added_at`    | `timestamptz`| Fecha de añadido                                |

**Índices**:
- `(user_id, match_id)` UNIQUE → evita duplicados por usuario.
- `user_id` → consultas por usuario.

**Row Level Security (RLS)**:
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` solo donde `auth.uid() = user_id`.

#### SQL de creación (Supabase SQL Editor)

```sql
-- Tabla de favoritos
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL,
  event_key TEXT,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  tournament TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Índice para listar favoritos por usuario
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Perfil de usuario (opcional)

Si quieres datos extra del usuario:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

## Plan de implementación por fases

### Fase 1: Configuración base (1–2 días)

1. **Crear proyecto en Supabase**
   - Dashboard → New Project.
   - Guardar `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

2. **Instalar dependencias**
   ```bash
   npx expo install @supabase/supabase-js
   ```

3. **Configurar cliente Supabase**
   - `src/lib/supabase.ts`: cliente con `createClient(url, anonKey)`.
   - Variables de entorno: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

4. **Ejecutar SQL**
   - Crear tabla `favorites` y políticas RLS en el SQL Editor de Supabase.

---

### Fase 2: Autenticación (2–3 días)

1. **AuthContext**
   - `contexts/AuthContext.tsx`:
     - Estado: `user`, `session`, `loading`.
     - Métodos: `signIn`, `signUp`, `signOut`, `resetPassword`.
     - Suscripción a cambios de sesión con `onAuthStateChange`.

2. **Pantallas de auth**
   - `app/(auth)/login.tsx`: email + contraseña.
   - `app/(auth)/register.tsx`: email, contraseña, confirmación.
   - `app/(auth)/forgot-password.tsx`: recuperación de contraseña.

3. **Protección de rutas**
   - Si no hay sesión → redirigir a login (o permitir uso anónimo con favoritos locales).
   - Si hay sesión → acceso a perfil, favoritos, configuración.

4. **Integrar AuthContext en `_layout.tsx`**
   - Envolver la app con `AuthProvider`.

---

### Fase 3: Migrar favoritos a Supabase (1–2 días)

1. **Nuevo `favoritesService`**
   - Mantener la misma interface pública (`getFavorites`, `isFavorite`, `toggleFavorite`, etc.).
   - Si hay usuario: usar Supabase.
   - Si no hay usuario: seguir usando AsyncStorage (modo anónimo).

2. **Lógica híbrida**
   ```
   Si usuario logueado:
     - GET: supabase.from('favorites').select().eq('user_id', user.id)
     - INSERT: supabase.from('favorites').insert({ user_id, match_id, ... })
     - DELETE: supabase.from('favorites').delete().eq('user_id', user.id).eq('match_id', matchId)
   Si no logueado:
     - Usar AsyncStorage como hasta ahora
   ```

3. **Migración al hacer login**
   - Al iniciar sesión: leer favoritos de AsyncStorage y subirlos a Supabase (evitando duplicados).
   - Opcional: al cerrar sesión, descargar favoritos a AsyncStorage para uso offline.

4. **Actualizar `useFavorites` y `useIsFavorite`**
   - Que consuman el nuevo servicio (sin cambiar la API del hook).

---

### Fase 4: UI de favoritos y perfil (2–3 días)

1. **Integrar FavoriteButton**
   - En `MatchHeroV2` o `MatchDetailV2`: botón de favorito en la cabecera.
   - Usar `useIsFavorite(matchId)` y `toggle()` con datos del partido.

2. **Pantalla de favoritos**
   - `app/(tabs)/favorites.tsx` o `app/favorites.tsx`:
     - Lista de partidos favoritos (MatchCard o similar).
     - Si no hay usuario: mensaje “Inicia sesión para guardar favoritos”.
     - Si hay usuario y lista vacía: “Aún no tienes partidos favoritos”.

3. **Navegación**
   - Añadir tab o enlace a Favoritos en el layout principal.
   - Icono de estrella o corazón en el tab bar.

4. **Perfil de usuario**
   - `app/profile/index.tsx`:
     - Email, avatar (opcional).
     - Enlaces: Configuración, Cerrar sesión.

5. **Configuración**
   - `app/settings/index.tsx`:
     - Notificaciones (si se implementan).
     - Tema (ya tienes ThemeContext).
     - Borrar cuenta (opcional).

---

### Fase 5: Refinamiento y UX (1 día)

1. **Estados de carga**
   - Loading en login/registro.
   - Skeleton en lista de favoritos.

2. **Mensajes de error**
   - Errores de red, credenciales incorrectas, etc.

3. **Persistencia de sesión**
   - Supabase Auth guarda el token; verificar que el refresh funcione bien en Expo.

4. **Testing**
   - Flujo completo: registro → login → añadir favorito → ver lista → cerrar sesión.

---

## Estructura de archivos sugerida

```
tennis-ml-frontend/
├── app/
│   ├── _layout.tsx              # + AuthProvider
│   ├── (auth)/
│   │   ├── _layout.tsx          # Stack sin tabs
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          # + Tab Favoritos
│   │   ├── index.tsx
│   │   └── favorites.tsx        # Nueva
│   ├── profile/
│   │   └── index.tsx            # Nueva
│   ├── settings/
│   │   └── index.tsx            # Nueva
│   └── ...
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Cliente Supabase
│   ├── contexts/
│   │   └── AuthContext.tsx      # Nueva
│   ├── services/
│   │   └── favoritesService.ts  # Refactor: Supabase + AsyncStorage
│   └── ...
└── ...
```

---

## Variables de entorno

Crear `.env` (y añadir a `.gitignore` si no está):

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

En `app.config.js` o `app.json`:

```javascript
extra: {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
}
```

---

## Consideraciones importantes

### 1. Match ID y partidos antiguos

- `match_id` es el ID de tu backend. Los partidos antiguos pueden dejar de existir en tu API.
- En la lista de favoritos: si un partido ya no existe, puedes mostrar solo `player1 vs player2 - torneo` sin enlace al detalle, o marcarlo como “partido no disponible”.

### 2. Modo anónimo

- Opción A: Requerir login para usar favoritos (más simple).
- Opción B: Favoritos locales para anónimos + migración al hacer login (mejor UX).

### 3. Seguridad

- Usar solo `SUPABASE_ANON_KEY` en el cliente (es público).
- RLS garantiza que cada usuario solo acceda a sus filas.
- No exponer `service_role` en el frontend.

### 4. Expo y Supabase Auth

- Supabase Auth funciona bien con Expo.
- Para persistencia: `@react-native-async-storage/async-storage` como storage de sesión (Supabase lo soporta).

---

## Resumen de tareas

| # | Tarea | Prioridad |
|---|-------|-----------|
| 1 | Crear proyecto Supabase y ejecutar SQL | Alta |
| 2 | Instalar @supabase/supabase-js y configurar cliente | Alta |
| 3 | Crear AuthContext y pantallas login/register | Alta |
| 4 | Refactorizar favoritesService (Supabase + AsyncStorage) | Alta |
| 5 | Integrar FavoriteButton en detalle de partido | Alta |
| 6 | Crear pantalla de lista de favoritos | Alta |
| 7 | Añadir tab Favoritos en navegación | Media |
| 8 | Crear pantalla de perfil | Media |
| 9 | Crear pantalla de configuración | Baja |
| 10 | Migración de favoritos al hacer login | Media |
| 11 | Recuperación de contraseña | Media |

---

## Orden recomendado de implementación

1. **Fase 1** → Configuración y SQL.
2. **Fase 2** → Auth (login, registro, AuthContext).
3. **Fase 3** → Favoritos en Supabase + servicio híbrido.
4. **Fase 4** → FavoriteButton + pantalla Favoritos + tab.
5. **Fase 5** → Perfil, configuración y refinamiento.

Con este plan tendrás Supabase integrado, usuarios autenticados y favoritos sincronizados en la nube, manteniendo la estructura actual de partidos y el backend sin cambios.
