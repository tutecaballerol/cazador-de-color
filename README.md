# Caza el Color

Juego semanal de caza fotográfica de color. Tirás, te toca un color y cuatro
consignas; cazás 8 fotos de cosas de ese color durante la semana y armás un
collage con la guía descargable.

## Archivos
    caza-el-color/
    ├── index.html   ← estructura
    ├── styles.css   ← estilos (mobile-first, editorial)
    ├── app.js       ← lógica: shuffle, consignas, guía 1080×1920, compartir
    └── README.md

No hay build ni dependencias: es HTML/CSS/JS plano. La única carga externa es
la tipografía Archivo desde Google Fonts.

## Correr local (VS Code)
1. Abrí la carpeta en VS Code.
2. Instalá la extensión **Live Server** y hacé click en *Go Live*
   (o abrí `index.html` directo en el navegador).

> Para probar el "Compartir" del celu hace falta HTTPS. En local desde el
> teléfono usá el share solo cuando esté deployado; en desktop cae a descarga.

## Deploy

**Vercel**
    npm i -g vercel
    vercel        # desde la carpeta del proyecto
O arrastrá la carpeta en vercel.com (New Project → deploy de archivos estáticos).

**Cloudflare Pages**
Subí la carpeta o conectá el repo. Sin build command, output dir = la raíz.

## Notas
- El color de la semana queda guardado en el celu (`localStorage`), así no
  cambia si volvés a entrar en la misma semana.
- La guía se genera en un `<canvas>` 1080×1920 y se baja como PNG. En el celu
  usa **Web Share** (guardás en Fotos o lo mandás directo a Instagram).
- Todo el texto del juego (paleta, consignas) está arriba de `app.js` para
  que lo edites fácil.
