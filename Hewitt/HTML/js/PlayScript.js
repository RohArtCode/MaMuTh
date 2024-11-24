var selectedPreset = _tone_0000_JCLive_sf2_file;
        var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
        var audioContext = new AudioContextFunc();
        var player = new WebAudioFontPlayer();
        player.loader.decodeAfterLoading(audioContext, '_tone_0000_JCLive_sf2_file');

        // Funktion zum Konvertieren einer 12-stelligen Binärzahl in Noten
        function binaryToNotes(binary, baseNote = 60) {
			const notes = [];
			for (let i = 0; i < 12; i++) {  // 12 Halbtöne in einer Oktave
				if (binary & (1 << (11 - i))) {    // Prüft, ob das Bit an Position 11 - i gesetzt ist
					notes.push(baseNote + i);
				}
			}
			return notes;
		}

        // Funktion zum Konvertieren eines Piano-Roll-Strings in Noten
        function pianoRollToNotes(pianoRoll, baseNote = 60) {
            const notes = [];
            for (let i = 0; i < pianoRoll.length; i++) {
                if (pianoRoll[i] === '1') {
                    notes.push(baseNote + i);
                }
            }
            return notes;
        }

        // Hauptfunktion zur Verarbeitung der Eingaben
        function processInput(input) {
            if (Array.isArray(input)) {
                // Wenn das Input ein Array ist, gehen wir davon aus, dass es direkt Noten enthält
                return input;
            } else if (typeof input === 'string') {
                // Wenn das Input ein String ist, behandeln wir es als Piano-Roll
                return pianoRollToNotes(input);
            } else if (typeof input === 'number' && input >= 10000 && input <= 14095) {
                // Wenn das Input eine Zahl zwischen 0 und 4095 ist, behandeln wir es als binären Integer mit fuehrender 1 da fuehrende 0 Oktalzahl
                return binaryToNotes(input-10000);
            } else {
                throw new Error("Ungültiges Eingabeformat. Erlaubt sind Arrays, Strings oder Zahlen zwischen 0 und 4095.");
            }
        }

        // Funktion zum Spielen eines Akkords
        function playChord(input) {
            const notes = processInput(input);
            player.queueChord(audioContext, audioContext.destination, selectedPreset, 0, notes, 4.5);
        }

        // Funktion zum Spielen einer Skala mit Verzögerung zwischen den Tönen
        function playScale(input) {
            const notes = processInput(input);
            notes.forEach((note, index) => {
                player.queueWaveTable(audioContext, audioContext.destination, selectedPreset, audioContext.currentTime + index * 0.5, note, 0.5);
            });
        }
// Funktion zum Spielen einer Skala und danach des Akkords
function playScaleChord(input) {
    const notes = processInput(input);

    // Skala abspielen
    playScale(notes);

    // Berechne die Verzögerung für den Akkord basierend auf der Dauer der Skala
    const scaleDuration = (notes.length+1) * 0.5; // 0.5 Sekunden pro Ton

    // Akkord mit Verzögerung abspielen
    setTimeout(() => playChord(notes), scaleDuration * 1000); // Konvertierung zu Millisekunden
}