# DINOTECH – Catálogo web

Web con los juegos de DINOTECH y pedido directo por WhatsApp (+54 9 351 819-3051).
Se publica en **https://dinotech.ar** (GitHub Pages + DNS en Cloudflare).

Arrancó como copia de la web de [Zona Gamer](https://github.com/Nicomoyanodev/zona-gamer) y ahora es un proyecto aparte, para tener su propio diseño.

## Cómo funciona

1. `scripts/build.js` toma los juegos digitales y tarjetas de Zona Gamer (`https://zonagamer.app/data/catalogo.json`): son los mismos, con los mismos precios.
2. `scripts/fisicos.js` lee los PDFs de stock de la carpeta de Drive de DINOTECH (`FOLDER_ID`). Formato: una línea por juego, "PS4 / USADO / NOMBRE", con stock y precio final. Se usa el precio del PDF.
3. `scripts/images.js` busca la portada de cada juego físico y la guarda en `data/image-cache.json`.
4. Se genera `public/data/catalogo.json`, que es lo que muestra la web (`public/`).

`.github/workflows/actualizar.yml` hace todo esto y publica la web cada 4 horas (media hora después de Zona Gamer) y cada vez que se suben cambios.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run actualizar` | Regenera el catálogo |
| `npm run ver` | Abre la web en http://localhost:8080 |
| `npm run reintentar-portadas` | Vuelve a buscar las portadas que no se encontraron |
| `npm run verificar-portadas` | Revisa que todas las portadas guardadas sigan cargando |

## Cambiar cosas

- **Nombre, WhatsApp, dirección:** `public/sucursal.js` y los textos de `public/index.html` (encabezado, pie y pantalla de inicio).
- **Logo:** todavía es provisorio (el nombre escrito). El logo definitivo va en `public/img/`.
- **Colores y diseño:** `public/styles.css` (por ahora igual al de Zona Gamer) y el bloque `<style>` del final del `<head>` en `public/index.html`.
- **Portada equivocada o faltante:** agregarla en `data/image-overrides.json`, por ejemplo `{ "Crash Bandicoot Trilogy": "https://link-a-la-imagen.jpg" }`.
