// Arma public/data/catalogo.json de DINOTECH:
// - juegos digitales y tarjetas: los mismos de Zona Gamer (se toman de https://zonagamer.app/data/catalogo.json)
// - juegos físicos: los PDFs de stock de la carpeta de Drive de DINOTECH (con el precio del PDF)
//
// Uso: node scripts/build.js [--sin-imagenes]
const fs = require('fs');
const path = require('path');
const { loadFisicos } = require('./fisicos');
const { applyCovers } = require('./images');
const { stampAssets } = require('./sello');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'data', 'catalogo.json');
const ZONA_GAMER = 'https://zonagamer.app/data/catalogo.json';
const PUBLICADO = 'https://dinotech.ar/data/catalogo.json';

async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
  return r.json();
}

async function main() {
  const noImages = process.argv.includes('--sin-imagenes');

  // Digitales de Zona Gamer. Si vienen vacíos o rotos, no se publica (queda la versión anterior)
  const base = await getJSON(ZONA_GAMER);
  const digitales = (base.products || []).filter(p => p.category !== 'fisicos');
  if (digitales.length < 1000) throw new Error(`Zona Gamer trajo solo ${digitales.length} productos digitales. No se publica.`);
  console.log(`${digitales.length} productos digitales de Zona Gamer`);

  // Físicos de DINOTECH. Si Drive falla, se reusa la lista publicada (no se publica una web sin stock)
  let fisicos;
  try {
    console.log('Juegos físicos:');
    fisicos = await loadFisicos({ dolar: base.dolar });
    if (!fisicos.length) throw new Error('los PDFs no tienen juegos con stock');
  } catch (e) {
    console.warn(`No se pudieron leer los físicos (${e.message}). Se reusa la lista publicada.`);
    const live = await getJSON(PUBLICADO);
    fisicos = (live.products || []).filter(p => p.category === 'fisicos');
    if (!fisicos.length) throw new Error('Tampoco hay una lista publicada de físicos. No se publica.');
  }
  console.log(`${fisicos.length} juegos físicos en stock`);

  await applyCovers(fisicos, [], { noImages });
  console.log(`Portadas: ${fisicos.filter(p => p.image).length}/${fisicos.length} físicos con imagen`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    updated: new Date().toISOString(), dolar: base.dolar || null,
    products: [...digitales, ...fisicos], promos: base.promos || [], infos: base.infos || {},
  }));
  console.log(`Listo: ${path.relative(ROOT, OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
  stampAssets(path.join(ROOT, 'public'));
}

main().catch(e => { console.error(e.message); process.exit(1); });
