(function(){
  function buildTable(daten) {
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

      const midiVals = String(row.Midi).split(/[,;\s]+/)
        .filter(Boolean).map(n => parseInt(n,10)).filter(Number.isFinite);
      const clef = Math.min(...midiVals) < 60 ? 'bass' : 'treble';

      window.showChord(row.Midi, { container: scoreDiv, heightPx: 120, clef, width: 360 });
    });

    host.appendChild(table);
  }

  document.addEventListener('DOMContentLoaded', function(){
    if (!window.chordsData) {
      document.getElementById('table').textContent = 'Keine Daten gefunden.';
      return;
    }
    buildTable(window.chordsData);
  });
})();
