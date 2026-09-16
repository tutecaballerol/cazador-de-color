# CLAUDE.md — Caza el Color

Contexto de proyecto para Claude Code. Leé esto antes de tocar nada.

## Qué es
Juego semanal de caza fotográfica de color. El usuario tira, le toca un color
+ 4 consignas al azar, saca 8 fotos (4 con consigna, 4 libres) de cosas de ese
color durante la semana y arma un collage con una guía descargable 1080×1920.

## Stack
- HTML + CSS + JS plano. **Sin build, sin dependencias, sin framework.**
- Única carga externa: tipografía **Archivo** (Google Fonts).
- `index.html` estructura · `styles.css` estilos · `app.js` lógica.

## Correr y deployar
- Local: cualquier server estático (Live Server, `npx serve`).
- Deploy: **Vercel** o **Cloudflare Pages**. Sin build command. Output = raíz.
- Ojo: Web Share con archivo necesita HTTPS → el "compartir" del celu recién
  anda deployado; en local cae a descarga.

## Convenciones
- Vanilla JS, sin frameworks ni librerías. No agregar dependencias sin pedir.
- Comentarios en español.
- La data editable (paleta y consignas) va arriba de todo en `app.js`.
- Mobile-first. El desktop es la misma columna centrada (máx 460px).

## Decisiones cerradas — NO cambiar sin preguntar
Esto se definió con criterio, no por default:

1. **Estética editorial (tipo HAUS).** Papel `#F4F1EA`, tinta `#0E0E0E`,
   wordmark Archivo 900 a sangre, reglas finas, botones entre corchetes.
   El **color de la semana es la única mancha de color** de toda la página.
2. **Guía 1080×1920 fija.** Fondo papel (NO el color cazado: las fotos traen
   ese color y se perderían). Las fotos resaltan contra el claro.
3. **Grilla mixta, no uniforme.** 2 cuadradas grandes + 3 cuadradas chicas +
   3 verticales 4:5. Motivo: 8 fotos verticales/cuadradas NO entran en un grid
   uniforme de 1080×1920 → se resuelve con jerarquía de tamaños. La grilla
   DEBE admitir fotos **verticales Y cuadradas**.
4. **Sin recuadro rígido.** Placeholders gris claro + consigna en label chico;
   la foto se pega encima y tapa el label. El usuario ubica libre.
5. **Mecánica.** 15 colores, pool de 16 consignas, 4 al azar + 4 libres = 8.
   El color queda fijo por semana (`localStorage`, clave por semana ISO).
6. **Export.** Guía generada en `<canvas>` → PNG. En celu **Web Share**
   (Fotos / IG); fallback a descarga.

## Ideas para más adelante (no hacer sin pedir)
- Color compartido semanal derivado de la fecha (misma semana = mismo color
  para todos) → vuelve el juego una movida colectiva con hashtag.
- Llenar el collage en el navegador (drag & drop) y bajar la pieza terminada.
- Rachas / semanas encadenadas.
