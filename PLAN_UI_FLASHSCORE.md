# Plan de cambios UI/UX – Referencia Flashscore

Referencia: [Flashscore Tenis](https://www.flashscore.es/tenis/) y capturas de la app móvil. Objetivo: interfaz intuitiva y sencilla de navegar, manteniendo la vista de **apuestas** propia de Tennis ML.

---

## 1. Análisis de Flashscore (por vista)

### 1.1 Barra superior (header) – Todas las vistas

| Elemento | Flashscore | Nuestra app actual |
|----------|------------|--------------------|
| Hora actual | Capsula verde "10:10" (opcional) | No |
| Deporte | "Tenis" + icono raqueta + chevron (selector) | Solo título "🎾 Tennis ML" en Partidos |
| **Búsqueda (lupa)** | **Icono lupa arriba derecha** | **No existe** |
| Perfil / Ajustes | Icono persona arriba derecha | Solo en pestaña Cuenta |

**Funcionalidad lupa en Flashscore:** búsqueda de jugadores y torneos. Es el acceso rápido para encontrar un partido, jugador o torneo concreto.

---

### 1.2 Vista principal "Todos los partidos"

| Elemento | Flashscore | Nuestra app actual |
|----------|------------|--------------------|
| Navegación por fechas | Barra horizontal: SA 14.02, DO 15.02, **HOY 17.02** (rojo), MI 18.02… | DateSelector con día abreviado + número; "HOY" destacado |
| Resumen global | "Todos los partidos" + icono filtro + **16** (en vivo, pill rojo) + **357** (total) | "X partidos" + "🔴 Y en vivo" en barra |
| Agrupación | **Por país** → luego por torneo (ej. BRASIL → Río ATP, Río Dobles; CATAR → Doha ATP) | Por torneo + superficie (ej. Australian Open_Hard) |
| Encabezado torneo | País + bandera, nombre torneo, tipo (ATP/WTA), superficie (dura), **número de partidos** y **en vivo** (pill rojo) | Nombre torneo, superficie, "Ver torneo", badge con nº partidos y 🔴 si hay en vivo |
| Fila de partido | Estrella favorito, bandera + nombre jugador, **S1/S2** (set actual en rojo), **icono sacador** (pelota), puntación juego (40, A, 15), juegos del set | Card con estado, hora, favorito, jugadores con logo, marcador/predicción/cuota |

**Conclusión:** Nos interesa especialmente: barra de fechas tipo Flashscore (HOY en rojo), agrupación clara por torneo con contadores, y **filas de partido más compactas** en lista (bandera + nombre, set actual, sacador, puntación).

---

### 1.3 Vista "EN DIRECTO"

- Misma estructura que "Todos" pero filtrada a partidos en vivo.
- En la barra inferior, pestaña "EN DIRECTO" activa (fondo rojo).
- Nosotros ya tenemos filtro "En directo" en Partidos; se puede alinear nombre y estilo con Flashscore.

---

### 1.4 Vista "Favoritos"

| Elemento | Flashscore | Nuestra app actual |
|----------|------------|--------------------|
| Título | "Favoritos" + icono "+" (añadir) | "⭐ Favoritos" |
| Subpestañas | **PARTIDOS** (activa), EQUIPOS, JUGADORES, NOTICIAS | No (solo lista de favoritos) |
| Filtros dentro de Partidos | **TODOS LOS PARTIDOS** (activo) / **EN DIRECTO** + icono ordenar/filtrar | No |
| Contenido | Agrupado por fecha ("Hoy 17.02. 1") → torneo (bandera + "CATAR: DOHA ATP") → partido (estrella, jugadores, "PREVIEW", hora) | Agrupado por torneo (FavoriteTournamentSection) |

**Propuesta:** Añadir en Favoritos pestañas **Partidos** (actual) y opcional **Jugadores**; y filtros "Todos" / "En directo" para partidos.

---

### 1.5 Vista "Torneos" (barra inferior)

- Lista de torneos (y/o competiciones favoritas).
- Agrupación por país, con bandera y nombre torneo; al tocar → partidos del torneo.
- Nosotros: Explorar → Torneos hace algo similar; se puede reforzar como pestaña principal y unificar estilo con "lista por país/torneo".

---

### 1.6 Vista "Rankings"

- Sección "RANKINGS" con opciones: ATP Individuales, WTA Individuales, ATP Carrera (I), etc.
- Barra alfabética lateral (A–Y + estrella) para saltar a letra.
- Nosotros: Explorar → Ranking ATP (solo ATP individual masculino). Mantener contenido y añadir claridad visual tipo Flashscore (sección "RANKINGS", ítem "ATP Individuales").

---

### 1.7 Barra inferior (navegación)

| Flashscore | Nuestra app actual |
|------------|--------------------|
| Todos | Partidos |
| EN DIRECTO | — (está dentro de Partidos como filtro) |
| Favoritos (con badge "1") | Favoritos |
| Noticias | — |
| Torneos | Explorar (Ranking + Torneos) |

**Propuesta:**  
- **Partidos** (igual).  
- **En directo**: puede ser **filtro por defecto** en Partidos o una pestaña que abra Partidos con filtro "En directo" activo.  
- **Favoritos** con **badge** con el número de favoritos (como Flashscore).  
- **Torneos**: renombrar "Explorar" a **"Torneos"** y que la pantalla sea lista de torneos + acceso a Ranking ATP (ej. sección "Rankings" arriba con "ATP Individuales").  
- **Mis apuestas**: mantener como pestaña propia (diferenciador).  
- **Cuenta**: mantener; equivalente al icono "persona" de Flashscore.  
- Noticias: no implementar por ahora.

---

## 2. Funcionalidades a añadir o cambiar

### 2.1 Búsqueda (lupa) – **Nueva**

- **Ubicación:** Icono lupa en la barra superior (derecha), visible en Partidos (y opcionalmente en otras pestañas).
- **Comportamiento:** Al tocar se abre una pantalla (o modal) de búsqueda con:
  - Campo de texto.
  - Pestañas o filtros: **Jugadores** / **Torneos** (y opcional Partidos).
  - Resultados: lista de jugadores (nombre, ranking, país) y/o torneos (nombre, tipo); al tocar → perfil jugador o detalle torneo.
- **Backend:** Buscar jugadores por nombre (GET rankings o endpoint de búsqueda si existe; si no, filtrar client-side sobre rankings/torneos ya cargados o un endpoint nuevo).

### 2.2 Header unificado

- **Partidos:** Barra con "Tenis" (o "Tennis ML") a la izquierda, **lupa** y **icono cuenta** a la derecha (la cuenta puede seguir siendo pestaña aparte; el icono puede llevar a Cuenta o a un menú rápido).
- Misma barra (o variante sin título de sección) en Explorar/Torneos y Favoritos para coherencia.

### 2.3 Barra de fechas (Partidos)

- Mantener DateSelector horizontal.
- Ajustar estilo para acercarse a Flashscore: **día de la semana abreviado (SA, DO, LU, HOY, MI…)** y **fecha (14.02, 17.02)**.
- **"HOY"** con estilo destacado (ej. texto o fondo rojo/primary) cuando la fecha seleccionada sea hoy.
- Ya tenemos lógica de "today"; solo refinar etiqueta y estilos.

### 2.4 Agrupación de partidos (Partidos)

- **Opción A:** Mantener agrupación por torneo (actual) y mejorar solo el **encabezado** de cada bloque: estilo barra gris/azul, nombre torneo + superficie + (si hay datos) país; a la derecha **número total** y **pill rojo con nº en vivo**.
- **Opción B (más Flashscore):** Si en el futuro tenemos país del torneo en los datos, agrupar por **país** y dentro por torneo.
- Por ahora: **Opción A** con encabezados más claros y contadores visibles.

### 2.5 Fila de partido (card) – Modo compacto opcional

- Flashscore usa **filas compactas** (bandera + nombre, set actual, sacador, puntación).
- Nosotros tenemos **cards** con predicción, cuotas, marcador.
- **Propuesta:** Mantener la card actual como vista principal (es nuestro valor con apuestas). Opcionalmente añadir un **modo "lista compacta"** (toggle o configuración) que muestre solo: estrella, jugador1 | jugador2, S1/S2, marcador/hora, para parecerse más a Flashscore en pantallas con muchos partidos.

### 2.6 Indicador de sacador (en vivo)

- En partidos en vivo, mostrar **quién saca** (icono pelota junto al jugador que saca).
- Ya tenemos `event_serve` / `current_server` en tipos; falta mostrarlo en MatchCard o en detalle (y en lista compacta si se implementa).

### 2.7 Favoritos

- **Badge en la pestaña:** Número de favoritos en el icono de la barra inferior (como Flashscore "1").
- **Subpestañas:** Añadir **"Partidos"** (actual) y, si hay tiempo, **"Jugadores"** (lista de jugadores favoritos; requiere modelo de favoritos por jugador).
- **Filtros:** "Todos los partidos" / "En directo" para filtrar la lista de partidos favoritos.
- Agrupación por fecha ("Hoy 17.02") y luego por torneo mejora la legibilidad (ya tenemos por torneo; añadir cabecera de fecha si no existe).

### 2.8 Vista Torneos / Explorar

- **Barra inferior:** Cambiar "Explorar" por **"Torneos"** (icono trofeo). La pantalla puede ser: arriba sección **"Rankings"** con ítem "ATP Individuales" → Ranking ATP; debajo **"Torneos"** con lista de torneos (como ahora).
- Así se acerca a Flashscore (Torneos + Rankings en la misma zona) sin perder Ranking ATP ni lista de torneos.

### 2.9 Vista Apuestas (Mis apuestas)

- **Mantener sin cambios** de flujo y contenido (es el diferenciador).
- Solo unificar estilo visual (header, colores, tipografía) con el resto de la app.

### 2.10 Detalle de partido

- En partidos en vivo: mostrar **set actual (S1/S2)**, **sacador** y **puntación del juego actual** de forma visible (ya tenemos datos en resultado/live).
- Opcional: estilo tipo Flashscore (números grandes para sets, pequeño para 40-30, etc.).

---

## 3. Resumen de tareas por prioridad

### Alta prioridad (navegación y búsqueda)

1. **Búsqueda (lupa):** Pantalla/modal de búsqueda por jugadores y torneos; icono lupa en header de Partidos (y si se desea en header global).
2. **Header unificado:** "Tenis" / "Tennis ML" + lupa + icono cuenta en Partidos (y replicar en otras pantallas donde tenga sentido).
3. **Badge en Favoritos:** Mostrar número de favoritos en el icono de la pestaña Favoritos.

### Media prioridad (claridad y estilo Flashscore)

4. **Barra de fechas:** Etiquetas "HOY", "SA 14.02", "DO 15.02", etc., con HOY destacado en rojo/primary.
5. **Encabezados de torneo:** Estilo barra (fondo distinto), contador total + pill rojo "X en vivo".
6. **Indicador de sacador:** En MatchCard (y detalle) para partidos en vivo (icono pelota junto al jugador que saca).
7. **Favoritos – filtros:** "Todos los partidos" / "En directo" en la pantalla Favoritos.
8. **Barra inferior:** Renombrar "Explorar" → "Torneos", y en esa pantalla organizar Rankings (ATP Individuales) + lista Torneos.

### Baja prioridad (refinamiento)

9. **Favoritos – subpestañas:** "Partidos" (actual) y en el futuro "Jugadores" si se añade favoritos por jugador.
10. **Modo lista compacta:** Toggle o ajuste para ver partidos en filas compactas (solo bandera, nombre, set, marcador/hora).
11. **Agrupación por país:** Cuando los datos incluyan país del torneo, agrupar por país y luego torneo.
12. **Pestaña "En directo":** Valorar si conviene una pestaña que abra Partidos con filtro "En directo" por defecto (en lugar de solo filtro dentro de Partidos).

---

## 4. Orden sugerido de implementación

| Fase | Tarea | Dependencias |
|------|--------|--------------|
| 1 | Header unificado (Partidos): título + lupa + icono cuenta | Ninguna |
| 2 | Pantalla/modal de búsqueda (jugadores + torneos) y enlace desde lupa | Header |
| 3 | Badge de favoritos en la pestaña Favoritos | Ninguna |
| 4 | Barra de fechas: etiquetas HOY / SA 14.02 y estilo "HOY" destacado | Ninguna |
| 5 | Encabezados de torneo con estilo barra y pills (total + en vivo) | Ninguna |
| 6 | Indicador de sacador en partidos en vivo (MatchCard/detalle) | Ninguna |
| 7 | Filtros "Todos" / "En directo" en Favoritos | Ninguna |
| 8 | Barra inferior: "Torneos" en lugar de "Explorar"; pantalla con Rankings + Torneos | Ninguna |
| 9 | (Opcional) Lista compacta y subpestañas Favoritos | Fase 2 |

---

## 5. Lo que se mantiene igual

- **Vista de apuestas (Mis apuestas):** Contenido y flujo actuales; solo unificar estilo con el resto.
- **Detalle de partido:** Predicción, cuotas, análisis y apuestas; se pueden añadir solo indicadores en vivo (set, sacador, puntación).
- **Solo ATP individual masculino** en rankings y datos; no añadir WTA ni dobles por ahora.
- **Cuenta y auth:** Sin cambios de flujo; el icono en header puede ser solo un acceso rápido a la pestaña Cuenta.

---

## 6. Referencia visual rápida (Flashscore)

- **Colores:** Fondo oscuro, texto blanco, **rojo** para activo/en vivo/importante, **verde** para hora o éxito.
- **Jerarquía:** Título de sección → agrupación (país/torneo) → filas de partido.
- **Iconografía:** Lupa (búsqueda), estrella (favoritos), trofeo (torneos), persona (cuenta), raqueta (tenis).
- **Pills/badges:** Rojo para "en vivo" o número de partidos en directo; badge numérico en Favoritos.

Con este plan se alinea la app con una experiencia tipo Flashscore (intuitiva y fácil de navegar) y se mantiene la vista de apuestas como elemento diferenciador. La búsqueda (lupa) y el header unificado son los primeros pasos que más impacto tendrán en la usabilidad.

---

## 7. Datos que no tenemos y control de errores

Flashscore muestra datos que en nuestra app **no existen o son opcionales**. Hay que evitar asumir que están presentes y usar fallbacks en toda la UI.

### 7.1 Banderas de país

| Dato | Nosotros | Fallback |
|------|----------|----------|
| Código de país (ISO) | A veces viene `country` como nombre ("Spain") o código ("ES"); a veces no viene | **Nunca** asumir que existe. Si `getCountryFlag(country)` devuelve vacío, no mostrar nada (o icono neutro 🌐). No dejar espacio en blanco que rompa el layout. |
| API | Jugadores: `country` en perfil/rankings. Partidos: `jugador1.pais` / `jugador2.pais` si el backend los envía | Usar `getCountryFlagSafe`: aceptar nombre o código; si no hay match, devolver `''` y en UI no renderizar celda de bandera. |

**Implementación:** Función `getCountryFlagSafe(value: string \| null \| undefined)` que intente código 2/3 letras o mapeo nombre→código; si no, `''`. En componentes: `{flag ? <Text>{flag}</Text> : null}` (o similar) para no mostrar hueco.

### 7.2 Logos de torneos

| Dato | Nosotros | Fallback |
|------|----------|----------|
| Logo/icono del torneo | No tenemos URL de logo por torneo | **No** usar `<Image>` para torneos. Mostrar solo nombre del torneo y, si se quiere icono, un icono genérico (trofeo 🏆 o icono de torneo) que no dependa de red. |

### 7.3 Fotos de jugadores

| Dato | Nosotros | Fallback |
|------|----------|----------|
| `player_logo` / `jugador.logo` | URL opcional desde API-Tennis | **Ya cubierto:** `PlayerLogo` usa `onError` y fallback a iniciales en círculo de color. No mostrar imagen si URL es `null`/`undefined`; usar el mismo componente en búsqueda y rankings. |

### 7.4 País del torneo / agrupación por país

| Dato | Nosotros | Fallback |
|------|----------|----------|
| País del torneo | No lo tenemos en los datos actuales | No agrupar por país. Agrupar solo por torneo (nombre + superficie). Si en el futuro llega país, se puede añadir sin romper la UI actual. |

### 7.5 Resumen de buenas prácticas

- **Banderas:** Siempre comprobar que el resultado de `getCountryFlag`/`getCountryFlagSafe` no sea `''` antes de renderizar; si es `''`, no pintar nada o un placeholder neutro.
- **Imágenes remotas (jugador/torneo):** Solo donde exista URL; `onError` para fallback; nunca `<Image source={{ uri: undefined }}>`.
- **Textos opcionales (país, superficie):** Usar `nombre ?? 'Sin nombre'`, `superficie ?? ''`, etc., y no mostrar la fila/etiqueta si el valor es vacío (o mostrar "—").
- **Listas vacías (búsqueda, rankings, torneos):** Mostrar mensaje "No hay resultados" / "No hay datos" en lugar de lista vacía sin explicación.
- **Errores de red/API:** En pantallas que dependan de API (búsqueda, rankings, torneos), mostrar estado de error con mensaje y opción "Reintentar"; no crashear ni pantalla en blanco.
