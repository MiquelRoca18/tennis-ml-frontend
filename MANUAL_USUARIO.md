# Manual de usuario — Tenly (Frontend)

Manual básico para usar **Tenly**, la aplicación móvil y web de tenis: partidos, predicciones, apuestas y configuración.

---

## 1. Inicio de la aplicación

- **Abrir Tenly**: Al abrir la app verás la pestaña **Partidos** con el listado del día.
- **Sin iniciar sesión**: Puedes usar la app en modo anónimo (partidos, predicciones, torneos). El bankroll y algunas opciones se guardan solo en el dispositivo.
- **Iniciar sesión**: En la pestaña **Cuenta** (icono de persona) puedes **Iniciar sesión** o **Registrarte** con email y contraseña (Supabase). Con sesión se sincronizan favoritos, apuestas y bankroll entre dispositivos.

---

## 2. Partidos (pestaña principal)

- **Qué ves**: Lista de partidos de tenis agrupados por torneo, con fecha seleccionada.
- **Cambiar fecha**: Usa el selector de fecha en la parte superior para ver partidos de otro día.
- **Filtros**: Puedes filtrar por estado:
  - **Todos**
  - **Pendientes** (por jugar)
  - **En directo**
  - **Completados**
- **Refrescar**: Arrastra hacia abajo para actualizar la lista.
- **Entrar a un partido**: Pulsa una tarjeta de partido para abrir el **detalle** (marcador, predicción, cuotas, estadísticas, etc.).
- **Ver perfil de jugador**: En la mayoría de pantallas puedes pulsar el nombre de un jugador para abrir su perfil (estadísticas y partidos asociados).

---

## 3. Detalle de un partido

En la pantalla de detalle encontrarás, dependiendo del estado del partido:

- **Información básica**: Jugadores, torneo, superficie (pista dura, tierra batida, hierba) y ronda.
- **Partido pendiente**:
  - Predicción principal (probabilidad estimada de victoria, **EV** y recomendación **APOSTAR / NO APOSTAR**).
  - Cuotas y, si aplica, stake recomendado según tu bankroll.
- **Partido en directo o finalizado**:
  - Marcador en tiempo real o resultado final (sets, juegos, tie-breaks).
  - Pestañas con más detalle: timeline de puntos/juegos, punto a punto, estadísticas avanzadas del partido, H2H (enfrentamientos directos), odds, etc.
- **Acciones rápidas**: desde aquí puedes marcar el partido como favorito y acceder al perfil de cada jugador.

---

## 4. Mis apuestas

- **Qué es**: Lista de apuestas que has registrado.
- **Ver estado**: Cada apuesta muestra partido, jugador elegido, cuota, y stake.
- **Eliminar apuesta**: Puedes eliminar una apuesta si la registraste por error o si la quieres cancelar.

---

## 5. Torneos (Explorar)

- **Qué hay**: Listado de torneos y acceso a **Rankings**.
- **Torneos**: Pulsa un torneo para ver sus partidos o información disponible.
- **Rankings**: Consulta el ranking actual de los jugadores.

---

## 6. Perfiles de jugador y búsqueda

- **Perfiles de jugador**: Puedes acceder al perfil de un jugador desde la lista de partidos, el detalle de un partido o resultados anteriores. En el perfil verás:
  - Información básica del jugador.
  - **Próximos partidos** si tiene encuentros programados.
  - **Partidos recientes** con resultados y marcador.
  - Pestañas por temporada (**TEMPORADA**, **TORNEOS**, **PARTIDOS**) con estadísticas y torneos en los que ha jugado.
- **Búsqueda por texto**: Desde la pantalla de búsqueda puedes escribir el nombre de un jugador o torneo para encontrarlo rápidamente y abrir su perfil o la lista de partidos asociados.

---

## 7. Favoritos

- **Añadir favoritos**: Desde el detalle de un partido o desde la lista, usa el icono de estrella para marcar jugadores o partidos como favoritos.
- **Ver favoritos**: En la pestaña **Favoritos** verás los partidos o jugadores guardados. El número en la pestaña indica cuántos tienes.
- **Quitar**: Vuelve a pulsar la estrella para quitar de favoritos.

---

## 8. Cuenta

- **Sin sesión**: Opciones para **Iniciar sesión** o **Registrarse**. Enlace a **Configuración** (Ajustes).
- **Con sesión**: Se muestra tu email y opciones como:
  - **Cerrar sesión**
  - **Borrar cuenta** (elimina todos tus datos de forma permanente; se pide confirmación).

---

## 9. Ajustes (Configuración)

Desde **Cuenta** → **Configuración** (o el acceso que tengas a Ajustes):

- **Bankroll**: Indica tu banca en euros. La app usa este valor para calcular el **stake** recomendado (cuánto apostar) según el criterio configurado (por ejemplo Kelly).
- **Guardar**: Tras cambiar el bankroll, guarda los cambios. Las cantidades sugeridas en predicciones se recalcularán con el nuevo valor.

Si no has iniciado sesión, el bankroll se guarda solo en el dispositivo; con sesión puede sincronizarse en tu cuenta.

---

## 10. Ejecutar Tenly en local

Si quieres descargar el código y tener la app en tu ordenador:

1. **Clonar el repositorio** del frontend (carpeta `tennis-ml-frontend` del proyecto Tenly).
2. **Requisitos:** Node.js y npm instalados.
3. **Instalar dependencias:** En la carpeta del frontend, ejecuta `npm install`.
4. **Opcional — Supabase:** Si quieres login y cuenta, crea un proyecto en Supabase y añade en la raíz del frontend un archivo `.env` con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` (puedes copiar `.env.example`).
5. **Arrancar la app:** `npx expo start`. Se abrirá en el navegador o podrás escanear el código QR con Expo Go en el móvil.

**Nota:** Por defecto la app usa la API de Tenly desplegada en la nube (Railway), así que verás partidos y predicciones reales sin tener que levantar el backend en tu máquina.

**Si quieres que la app use el backend en local** (por ejemplo porque has arrancado la API en tu ordenador): cambia la URL de la API en el frontend. En el archivo `src/utils/constants.ts` sustituye `API_BASE_URL` por la dirección de tu backend local, por ejemplo `http://localhost:8000` (o `http://TU_IP:8000` si pruebas desde el móvil en la misma red). Sin este cambio, la app seguirá llamando al servidor en Railway. Para más detalle (estructura del proyecto, variables de entorno), consulta la documentación técnica del proyecto o el README del repositorio.

---

## Resumen rápido

| Dónde        | Para qué |
|-------------|----------|
| **Partidos** | Ver partidos del día, filtrar por estado, abrir detalle |
| **Detalle partido** | Marcador, predicción, EV, cuotas, stake, estadísticas |
| **Mis apuestas** | Ver y actualizar el estado de tus apuestas |
| **Torneos** | Torneos y rankings |
| **Favoritos** | Partidos/jugadores guardados |
| **Cuenta** | Login, registro, cerrar sesión, borrar cuenta |
| **Ajustes** | Bankroll y opciones de predicción/apuestas |

Si algo no carga (partidos, resultados, cuotas), comprueba que tengas conexión a internet; Tenly usa un servidor en la nube (Railway) para obtener los datos.
