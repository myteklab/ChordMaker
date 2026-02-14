/**
 * ChordMaker - UI Controller
 * Handles all UI updates and interactions
 */
'use strict';

/**
 * Initialize the UI
 */
function initUI() {
    buildChordPalette();
    buildProgressionTimeline();
    updateControlsFromState();
}

/**
 * Build the chord palette buttons
 */
function buildChordPalette() {
    const majorGrid = document.getElementById('majorChords');
    const minorGrid = document.getElementById('minorChords');
    const seventhGrid = document.getElementById('seventhChords');
    const otherGrid = document.getElementById('otherChords');

    majorGrid.innerHTML = '';
    minorGrid.innerHTML = '';
    seventhGrid.innerHTML = '';
    otherGrid.innerHTML = '';

    // Major chords
    ALL_NOTES.forEach(note => {
        const btn = createChordButton(note, 'maj', 'major');
        majorGrid.appendChild(btn);
    });

    // Minor chords
    ALL_NOTES.forEach(note => {
        const btn = createChordButton(note, 'min', 'minor');
        minorGrid.appendChild(btn);
    });

    // 7th chords (show common ones)
    ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach(note => {
        const btn = createChordButton(note, '7', 'seven');
        seventhGrid.appendChild(btn);
    });

    // Other chords
    const otherTypes = [
        { note: 'C', type: 'dim' },
        { note: 'D', type: 'dim' },
        { note: 'C', type: 'aug' },
        { note: 'G', type: 'sus4' }
    ];
    otherTypes.forEach(({ note, type }) => {
        const typeClass = type === 'dim' ? 'dim' : type === 'aug' ? 'aug' : '';
        const btn = createChordButton(note, type, typeClass);
        otherGrid.appendChild(btn);
    });
}

/**
 * Create a chord button element
 */
function createChordButton(note, type, cssClass = '') {
    const btn = document.createElement('button');
    btn.className = `chord-btn ${cssClass}`;
    btn.textContent = getChordDisplayName(note, type);
    btn.dataset.note = note;
    btn.dataset.type = type;

    btn.addEventListener('click', () => {
        selectChordFromPalette(note, type);
    });

    btn.addEventListener('mouseenter', () => {
        previewChord(note, type);
    });

    return btn;
}

/**
 * Select a chord from the palette
 */
function selectChordFromPalette(note, type) {
    selectedChord = note;
    selectedChordType = type;

    // Update type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Update palette selection
    document.querySelectorAll('.chord-btn').forEach(btn => {
        const isSelected = btn.dataset.note === note && btn.dataset.type === type;
        btn.classList.toggle('selected', isSelected);
    });

    // If a bar is selected, place the chord there
    if (selectedBarIndex >= 0) {
        placeChordInBar(selectedBarIndex, note, type, selectedInversion);
    }
}

/**
 * Build the progression timeline
 */
function buildProgressionTimeline() {
    const timeline = document.getElementById('progressionTimeline');
    timeline.innerHTML = '';

    for (let i = 0; i < bars; i++) {
        const slot = createBarSlot(i);
        timeline.appendChild(slot);
    }
}

/**
 * Create a bar slot element
 */
function createBarSlot(index) {
    const slot = document.createElement('div');
    slot.className = 'bar-slot';
    slot.dataset.index = index;

    const barNumber = document.createElement('div');
    barNumber.className = 'bar-number';
    barNumber.textContent = index + 1;
    slot.appendChild(barNumber);

    const chordInfo = progression[index];
    if (chordInfo && chordInfo.chord) {
        slot.classList.add('has-chord');

        const chordDiv = document.createElement('div');
        chordDiv.className = 'bar-chord';

        const name = document.createElement('div');
        name.className = 'bar-chord-name';
        name.textContent = chordInfo.chord;

        const type = document.createElement('div');
        type.className = 'bar-chord-type';
        type.textContent = CHORD_TYPE_NAMES[chordInfo.type] || chordInfo.type;

        const inversion = document.createElement('div');
        inversion.className = 'bar-inversion';
        inversion.textContent = chordInfo.inversion > 0 ? INVERSION_NAMES[chordInfo.inversion] : '';

        chordDiv.appendChild(name);
        chordDiv.appendChild(type);
        chordDiv.appendChild(inversion);
        slot.appendChild(chordDiv);

        // Control buttons
        const controls = document.createElement('div');
        controls.className = 'bar-controls';

        const clearBtn = document.createElement('button');
        clearBtn.className = 'bar-control-btn';
        clearBtn.textContent = '✕';
        clearBtn.title = 'Clear chord';
        clearBtn.onclick = (e) => {
            e.stopPropagation();
            clearBar(index);
        };
        controls.appendChild(clearBtn);

        slot.appendChild(controls);
    } else {
        const empty = document.createElement('div');
        empty.className = 'bar-empty';
        empty.textContent = '+';
        slot.appendChild(empty);
    }

    slot.addEventListener('click', () => selectBar(index));

    return slot;
}

/**
 * Select a bar for editing
 */
function selectBar(index) {
    selectedBarIndex = index;

    // Update visual selection
    document.querySelectorAll('.bar-slot').forEach((slot, i) => {
        slot.classList.toggle('selected', i === index);
    });

    // If we have a chord selected, place it
    if (selectedChord) {
        placeChordInBar(index, selectedChord, selectedChordType, selectedInversion);
    }

    // Preview the chord if it exists
    const chordInfo = progression[index];
    if (chordInfo && chordInfo.chord) {
        resumeAudio();
        playChord(chordInfo.chord, chordInfo.type, chordInfo.inversion, 0.5);
    }
}

/**
 * Place a chord in a bar
 */
function placeChordInBar(index, chord, type, inversion) {
    saveUndoState('Place Chord');

    progression[index] = {
        chord: chord,
        type: type,
        inversion: inversion,
        duration: beatsPerBar
    };

    markDirty();
    buildProgressionTimeline();

    // Re-select the bar
    document.querySelectorAll('.bar-slot')[index]?.classList.add('selected');

    // Preview the chord
    resumeAudio();
    playChord(chord, type, inversion, 0.5);
}

/**
 * Clear a bar
 */
function clearBar(index) {
    saveUndoState('Clear Bar');

    progression[index] = {
        chord: null,
        type: null,
        inversion: 0,
        duration: beatsPerBar
    };

    markDirty();
    buildProgressionTimeline();
}

/**
 * Clear all bars
 */
function clearProgression() {
    if (!confirm('Clear all chords from the progression?')) return;

    saveUndoState('Clear Progression');

    for (let i = 0; i < bars; i++) {
        progression[i] = {
            chord: null,
            type: null,
            inversion: 0,
            duration: beatsPerBar
        };
    }

    markDirty();
    buildProgressionTimeline();
    showToast('Progression cleared');
}

/**
 * Set the chord type for new placements
 */
function setChordType(type) {
    selectedChordType = type;

    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // If a bar is selected and has a chord, update it
    if (selectedBarIndex >= 0 && progression[selectedBarIndex]?.chord) {
        saveUndoState('Change Chord Type');
        progression[selectedBarIndex].type = type;
        markDirty();
        buildProgressionTimeline();
        document.querySelectorAll('.bar-slot')[selectedBarIndex]?.classList.add('selected');
    }
}

/**
 * Set the inversion for new placements
 */
function setInversion(inv) {
    selectedInversion = inv;

    document.querySelectorAll('.inversion-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.inv) === inv);
    });

    // If a bar is selected and has a chord, update it
    if (selectedBarIndex >= 0 && progression[selectedBarIndex]?.chord) {
        saveUndoState('Change Inversion');
        progression[selectedBarIndex].inversion = inv;
        markDirty();
        buildProgressionTimeline();
        document.querySelectorAll('.bar-slot')[selectedBarIndex]?.classList.add('selected');

        // Preview the changed chord
        const chord = progression[selectedBarIndex];
        resumeAudio();
        playChord(chord.chord, chord.type, chord.inversion, 0.5);
    }
}

/**
 * Update controls from current state
 */
function updateControlsFromState() {
    document.getElementById('keySelect').value = currentKey;
    document.getElementById('modeSelect').value = currentMode;
    document.getElementById('instrumentSelect').value = currentInstrument;
    document.getElementById('bpmSlider').value = bpm;
    document.getElementById('bpmValue').textContent = bpm;
    document.getElementById('barCount').value = bars;
    updateSliderBackground(document.getElementById('bpmSlider'), bpm, 40, 200);
}

/**
 * Update key
 */
function updateKey() {
    currentKey = document.getElementById('keySelect').value;
    markDirty();
}

/**
 * Update mode
 */
function updateMode() {
    currentMode = document.getElementById('modeSelect').value;
    markDirty();
}

/**
 * Update instrument
 */
function updateInstrument() {
    currentInstrument = document.getElementById('instrumentSelect').value;
    markDirty();
}

/**
 * Update BPM
 */
function updateBpm() {
    bpm = parseInt(document.getElementById('bpmSlider').value);
    document.getElementById('bpmValue').textContent = bpm;
    updateSliderBackground(document.getElementById('bpmSlider'), bpm, 40, 200);
    markDirty();
}

/**
 * Update bar count
 */
function updateBarCount() {
    const newBars = parseInt(document.getElementById('barCount').value);
    if (newBars < 4) {
        document.getElementById('barCount').value = 4;
        return;
    }
    if (newBars > 32) {
        document.getElementById('barCount').value = 32;
        return;
    }

    saveUndoState('Change Bar Count');

    // Adjust progression array
    if (newBars > bars) {
        // Add empty bars
        for (let i = bars; i < newBars; i++) {
            progression.push({
                chord: null,
                type: null,
                inversion: 0,
                duration: beatsPerBar
            });
        }
    } else {
        // Remove bars
        progression = progression.slice(0, newBars);
    }

    bars = newBars;
    markDirty();
    buildProgressionTimeline();
}

/**
 * Update slider background gradient
 */
function updateSliderBackground(slider, value, min, max) {
    const percent = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #6c5ce7 0%, #6c5ce7 ${percent}%, #444 ${percent}%, #444 100%)`;
}

/**
 * Highlight currently playing bar
 */
function highlightPlayingBar(index) {
    document.querySelectorAll('.bar-slot').forEach((slot, i) => {
        slot.classList.toggle('playing', i === index);
    });
}

/**
 * Clear playing highlight
 */
function clearPlayingHighlight() {
    document.querySelectorAll('.bar-slot').forEach(slot => {
        slot.classList.remove('playing');
    });
}
