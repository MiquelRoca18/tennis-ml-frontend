# Plan: App Tenly accesible para profesores sin Expo

## Objetivo
Que los profesores puedan usar la app (navegar, probar funcionalidades) **sin instalar Expo Go** ni depender de tu móvil en la presentación.

---

## Comparativa de opciones

| Criterio | Opción 1: Web (URL) | Opción 2: APK Android | Opción 3: Web + demo móvil |
|----------|---------------------|------------------------|----------------------------|
| **Acceso** | Cualquiera con enlace en el navegador | Solo Android; instalar APK manual | Demo en vivo en móvil + enlace web para después |
| **Instalación** | Ninguna | Descargar APK, permitir “fuentes desconocidas” | Ninguna para web; opcional APK |
| **Dispositivos** | PC, Mac, tablet, móvil (cualquier OS) | Solo Android | Cubre todos |
| **Experiencia** | Misma app, en navegador (responsive) | App nativa real | Lo mejor de ambos |
| **Esfuerzo** | Bajo: export + hosting | Medio: EAS, perfiles, esperar build | Bajo si priorizas web; APK opcional |
| **Para defensa** | Ideal para “prueben ustedes” | Útil si quieren tocarlo en su Android | **Recomendado**: tú demuestras en móvil, ellos prueban por web |

---

## Recomendación

**Prioridad: Opción 1 (Web) + uso tipo Opción 3 en la defensa.**

1. **Desplegar la versión web** en una URL pública (Vercel o Netlify).
2. **En la defensa:** tú demuestras en el móvil (Expo Go o APK) y al final dices: “Pueden probarla en el navegador en [URL]”.
3. **En la memoria (Anexo / enlaces):** indicar: “App Tenly (web): https://tenly.vercel.app”.
4. **APK (Opción 2):** solo si los profesores piden explícitamente “app instalable”; no es necesario para el objetivo de “que puedan conectarse y usar la app sin Expo”.

**Por qué web es suficiente**
- No instalan nada.
- Funciona en el portátil que ya usan en la defensa.
- La app ya tiene `web` en `app.json` y `react-native-web`; con un ajuste de almacenamiento (sesión en web) el build estático funciona bien.

---

## Qué hace falta para que la web funcione

### 1. Almacenamiento de sesión en web
- **Problema:** `expo-secure-store` no funciona en web; la sesión de Supabase no se persistiría.
- **Solución:** En `src/lib/secureStorage.ts`, usar **SecureStore en móvil** y **AsyncStorage (localStorage en web)** en web. Así el login y la sesión funcionan también en el navegador.

### 2. Export y comprobación local
- Añadir script en `package.json`: `"export:web": "expo export -p web"`.
- **Modo web:** en `app.json` está `"web": { "output": "single" }` (SPA de una sola página) para que los clics y la navegación funcionen correctamente en el navegador; evita problemas de hidratación del modo `static`.
- Ejecutar `npm run export:web` (o `npx expo export -p web`) y abrir la carpeta `dist/` con un servidor local:
  - `npx serve dist -l 3333` (si al refrescar en una ruta como `/match/123` da 404, usar un servidor con fallback SPA o abrir siempre desde la raíz).

### 3. Despliegue
- **Vercel:** instalar Vercel CLI, en la carpeta del frontend hacer `vercel --prod` apuntando al proyecto y configurando “Output Directory” = `dist` (o la carpeta que genere `expo export -p web`).
- **Netlify:** arrastrar la carpeta `dist/` a app.netlify.com/drop o conectar el repo y build command `npx expo export -p web`, publish directory `dist`.

### 4. Comprobar en producción
- Abrir la URL pública.
- Probar: listado de partidos, detalle, pestañas (Favoritos, Mis apuestas, Cuenta), login/registro, que las llamadas a la API (Railway) y a Supabase respondan bien.

---

## Si además quieres APK (opcional)

- Instalar EAS CLI: `npm i -g eas-cli` y `eas login`.
- Añadir o completar en la raíz del frontend un `eas.json` con perfil `preview` y `buildType: "apk"`.
- Ejecutar: `eas build -p android --profile preview`.
- Compartir el enlace de descarga del APK a quien quieras que lo instale en Android.

No es necesario para cumplir el objetivo de “que los profesores puedan conectarse y usar la app sin Expo”; la web lo cumple.

---

## Resumen de pasos (orden sugerido)

1. Implementar fallback web en `secureStorage.ts` (SecureStore en móvil, AsyncStorage en web).
2. Añadir script `export:web` y generar `dist/` con `expo export -p web`.
3. Probar en local que la web carga, navega, hace login y usa la API.
4. Desplegar `dist/` en Vercel (o Netlify) y anotar la URL.
5. Incluir esa URL en la memoria y usarla en la defensa como “pueden probarla aquí sin instalar nada”.
