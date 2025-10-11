(function(){
  const VF = (window.Vex && Vex.Flow) ? Vex.Flow : (window.VF || null);

  function midiToVexKey(midi) {
    const names = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'];
    const pc = midi % 12;
    const oct = Math.floor(midi / 12) - 1;
    return `${names[pc]}/${oct}`;
  }

  function addAccidentals(staveNote) {
    const keys = staveNote.getKeys();
    keys.forEach((key, i) => {
      if (key.includes('#')) staveNote.addModifier(new VF.Accidental('#'), i);
      if (key.includes('b')) staveNote.addModifier(new VF.Accidental('b'), i);
    });
    return staveNote;
  }

  function showChord(midiList, { container, heightPx = 120, clef = 'treble', width = 340 } = {}) {
    if (!container) throw new Error('showChord: options.container fehlt.');
    if (!VF) { container.textContent = 'VexFlow nicht geladen.'; return; }

    const midiArray = Array.isArray(midiList)
      ? midiList
      : String(midiList).split(/[,;\s]+/).filter(Boolean).map(n => parseInt(n,10)).filter(Number.isFinite);

    if (!midiArray.length) { container.textContent = 'Keine gültigen MIDI-Werte.'; return; }

    const keys = midiArray.map(midiToVexKey);

    const baseH = 120;
    const scale = Math.max(0.5, heightPx / baseH);
    const baseW = width;
    const scaledW = Math.round(baseW * scale);

    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(scaledW, Math.round(baseH * scale));
    const ctx = renderer.getContext();
    ctx.scale(scale, scale);

    const stave = new VF.Stave(12, 20, baseW - 24);
    stave.addClef(clef);
    stave.setBegBarType(VF.Barline.type.NONE);
    stave.setEndBarType(VF.Barline.type.NONE);
    stave.setContext(ctx).draw();

    const note = new VF.StaveNote({ clef, keys, duration: 'q' });
    addAccidentals(note);

    const voice = new VF.Voice({ num_beats: 1, beat_value: 4, resolution: VF.RESOLUTION });
    voice.addTickables([note]);
    new VF.Formatter().joinVoices([voice]).format([voice], baseW - 60);

    voice.draw(ctx, stave);
  }

  // global verfügbar machen:
  window.showChord = showChord;
})();
