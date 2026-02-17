# Pruebas del frontend – Tennis ML

Comprueba que todo funcione bien después del sync de rankings y las nuevas pantallas (Explorar, Ranking ATP, Torneos, enlaces a jugador/torneo).

---

## 1. Partidos (pestaña principal)

- [ ] **Cargar partidos por fecha**  
  Abre la app → pestaña «Partidos». Debe cargar partidos del día (o del día que elijas en el selector).
- [ ] **Cambiar de fecha**  
  Usa las flechas o toca otra fecha. La lista debe actualizarse.
- [ ] **Pull to refresh**  
  Arrastra hacia abajo para recargar. Debe volver a cargar sin errores.
- [ ] **Filtros (Todos / Finalizados / Por jugar / En directo)**  
  Cambia de pestaña. El número de partidos debe cambiar según el filtro.
- [ ] **Abrir detalle de un partido**  
  Toca una card. Debe abrir la pantalla de detalle del partido (marcador, predicción, etc.).

---

## 2. Enlaces desde partidos

- [ ] **Ir al perfil de un jugador**  
  En una card de partido, toca el **nombre del jugador 1** o **jugador 2**. Debe abrir la pantalla «Perfil del Jugador» con ese jugador (nombre, ranking, puntos si hay datos, partidos recientes).
- [ ] **Volver del perfil**  
  «← Volver» debe llevarte de vuelta a la lista de partidos.
- [ ] **Ir al torneo**  
  En el encabezado de una sección (ej. «Australian Open – Hard»), toca **«Ver torneo»**. Debe abrir la pantalla del torneo con la lista de partidos de ese torneo.
- [ ] **Volver del torneo**  
  «← Volver» debe volver a Partidos.

---

## 3. Explorar → Ranking ATP (individual masculino)

- [ ] **Abrir Explorar**  
  Pestaña «Explorar» (icono brújula). Debe verse el menú con «Ranking ATP» y «Torneos».
- [ ] **Abrir Ranking ATP**  
  Toca «Ranking ATP» (subtítulo: «Individual masculino – top jugadores»). Debe cargar la lista de jugadores (ej. Carlos Alcaraz #1, etc.).
- [ ] **Comprobar columnas**  
  Debe verse: posición (#), bandera/país, nombre, puntos. Opcional: flecha ↑/↓ de tendencia.
- [ ] **Pull to refresh en rankings**  
  Arrastra hacia abajo: debe recargar la lista.
- [ ] **Abrir perfil desde el ranking**  
  Toca un jugador de la lista. Debe abrir su perfil (mismo formato que desde la card de partido).
- [ ] **Volver**  
  El botón atrás debe volver a la lista de rankings y luego a Explorar.

---

## 4. Explorar → Torneos

- [ ] **Abrir Torneos**  
  En Explorar, toca «Torneos». Debe cargar la lista de torneos (si ya hiciste `POST /tournaments/sync`; si no, puede estar vacía).
- [ ] **Abrir un torneo**  
  Toca un torneo. Debe abrir la pantalla del torneo con nombre y lista de partidos de ese torneo.
- [ ] **Abrir un partido desde el torneo**  
  Toca un partido de la lista. Debe abrir el detalle del partido.
- [ ] **Volver**  
  Volver debe llevarte al listado de torneos y luego a Explorar.

---

## 5. Perfil del jugador

- [ ] **Datos mostrados**  
  Con rankings ya sincronizados, en el perfil debe verse: **nombre**, **país** (si existe), **ranking ATP** (#), **puntos**, **tendencia** (↑/↓/→) si existe.
- [ ] **Partidos recientes**  
  Debe haber una sección con los últimos partidos del jugador (o mensaje tipo «No hay partidos recientes» si no hay en BD).
- [ ] **Jugador sin datos en BD**  
  Si abres un jugador que no está en la tabla `players` (ej. desde un partido antiguo), la app puede mostrar «Jugador no encontrado» o perfil con solo nombre; no debe crashear.

---

## 6. Otras pestañas

- [ ] **Mis apuestas**  
  Abre la pestaña. Debe cargar (vacía o con historial).
- [ ] **Favoritos**  
  Abre Favoritos. Añade un partido a favoritos desde una card (estrella) y comprueba que aparezca aquí.
- [ ] **Cuenta**  
  Abre Cuenta. Debe verse la pantalla de cuenta (login/email o «Configura Supabase» si no hay auth).

---

## 7. Errores y bordes

- [ ] **Sin conexión**  
  Con WiFi/datos desactivados, al cargar Partidos o Explorar debe aparecer un mensaje de error claro (no crash).
- [ ] **Rankings vacíos**  
  Si en algún momento el backend devolviera 0 jugadores, la pantalla de Rankings debe mostrar el mensaje tipo «No hay datos del ranking ATP…» en lugar de pantalla en blanco.
- [ ] **Torneos vacíos**  
  Si no se ha hecho sync de torneos, la lista de Torneos puede estar vacía con el mensaje correspondiente.

---

## Resumen rápido (smoke test)

1. Partidos cargan y se puede abrir un partido.
2. Desde un partido: tocar nombre de jugador → perfil; «Ver torneo» → torneo.
3. Explorar → Ranking ATP → lista con jugadores; tocar uno → perfil.
4. Explorar → Torneos → lista; tocar torneo → partidos del torneo.
5. Perfil muestra ranking y puntos cuando hay datos en BD.

Si todo lo anterior pasa, el flujo principal del frontend está bien cubierto.
