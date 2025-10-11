// Sicherstellen, dass VexFlow vorhanden ist (CJS-Build stellt global Vex und Vex.Flow bereit)
const VF = (window.Vex && Vex.Flow) ? Vex.Flow : (window.VF || null);

if (!VF) {
  console.error('VexFlow wurde nicht gefunden. Prüfe die Script-Reihenfolge in index.html.');
}

/** Eingebettete "JSON-Tabelle" */
const daten = [
  { "Akkordname": "C-Dur", "Lage": "Grundstellung", "Midi": "60, 64, 67" },
  { "Akkordname": "C-Dur", "Lage": "1. Umkehrung",  "Midi": "64, 67, 72" },
  { "Akkordname": "C-Dur", "Lage": "2. Umkehrung",  "Midi": "67, 72, 76" },
  { "Akkordname": "D-Dur", "Lage": "Grundstellung", "Midi": "62, 66, 69" } // F# wird mit ♯ markiert
];

/** MIDI -> "c#/4" */
function midiToVexKey(midi) {
  const names = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'];
  const pc = midi % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${names[pc]}/${oct}`;
}

/** Accidentals für VexFlow v4 via addModifier(...) */
function addAccidentalsToChord(staveNote) {
  const keys = staveNote.getKeys(); // ["c#/4", ...]
  keys.forEach((key, i) => {
    if (key.includes('#')) staveNote.addModifier(new VF.Accidental('#'), i);
    if (key.includes('b')) staveNote.addModifier(new VF.Accidental('b'), i);
  });
  return staveNote;
}

/**
 * Rendert eine Viertelnote als Akkord aus MIDI-Werten.
 * @param {string|number[]} midiList - z.B. "67, 72, 75" oder [67,72,75]
 * @param {object} opts
 *   - container: HTMLElement (Pflicht)
 *   - heightPx: Zielhöhe der Notenzeile (Standard 120)
 *   - clef: "treble" | "bass" (Standard "treble")
 *   - width: Breite vor Skalierung (Standard 340)
 */
function showChord(midiList, { container, heightPx = 120, clef = 'treble', width = 340 } = {}) {
  if (!container) throw new Error('showChord: options.container fehlt.');
  if (!VF) {
    container.textContent = 'VexFlow nicht geladen.';
    return;
  }

  // String -> Array
  const midiArray = Array.isArray(midiList)
    ? midiList
    : String(midiList).split(/[,;\s]+/).filter(Boolean).map(n => parseInt(n, 10)).filter(Number.isFinite);

  if (!midiArray.length) {
    container.textContent = 'Keine gültigen MIDI-Werte.';
    return;
  }

  const keys = midiArray.map(midiToVexKey);

  // Basisgrößen & Skalierung
  const baseH = 120;
  const scale = Math.max(0.5, heightPx / baseH);
  const baseW = width;
  const scaledW = Math.round(baseW * scale);
  const scaledH = Math.round(baseH * scale);

  // Renderer
  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(scaledW, scaledH);
  const ctx = renderer.getContext();
  ctx.scale(scale, scale);

  // Einzelstave ohne Taktangabe/-striche
  const leftX = 12, topY = 20;
  const stave = new VF.Stave(leftX, topY, baseW - 24);
  stave.addClef(clef);
  stave.setBegBarType(VF.Barline.type.NONE);
  stave.setEndBarType(VF.Barline.type.NONE);
  stave.setContext(ctx).draw();

  // Akkord-Viertel
  const note = new VF.StaveNote({ clef, keys, duration: 'q' });
  addAccidentalsToChord(note);

  // Voice & Format
  const voice = new VF.Voice({ num_beats: 1, beat_value: 4, resolution: VF.RESOLUTION });
  voice.addTickables([note]);
  new VF.Formatter().joinVoices([voice]).format([voice], baseW - 60);

  // Zeichnen
  voice.draw(ctx, stave);
}

/** Tabelle aufbauen & Beispiele rendern */
function renderTable() {
  const host = document.getElementById('table');
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr><th>Akkordname</th><th>Lage</th><th>Midi</th><th>Notenbild</th></tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  daten.forEach(row => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td'); tdName.textContent = row.Akkordname;
    const tdLage = document.createElement('td'); tdLage.textContent = row.Lage;
    const tdMidi = document.createElement('td'); tdMidi.textContent = row.Midi;

    const tdScore = document.createElement('td'); tdScore.className = 'scorecell';
    const scoreDiv = document.createElement('div');
    tdScore.appendChild(scoreDiv);

    tr.append(tdName, tdLage, tdMidi, tdScore);
    tbody.appendChild(tr);

    // Clef-Heuristik: tiefe Noten → Bass
    const midiVals = String(row.Midi).split(/[,;\s]+/).filter(Boolean).map(n => parseInt(n,10)).filter(Number.isFinite);
    const clef = Math.min(...midiVals) < 60 ? 'bass' : 'treble';

    showChord(row.Midi, { container: scoreDiv, heightPx: 120, clef, width: 360 });
  });

  host.appendChild(table);
}

// Nach DOM-Laden starten
document.addEventListener('DOMContentLoaded', renderTable);
