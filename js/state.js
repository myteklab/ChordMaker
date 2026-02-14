/**
 * ChordMaker - State Management
 * Global state variables
 */
'use strict';

// Progression state
let progression = [];
let bars = DEFAULT_BARS;
let beatsPerBar = BEATS_PER_BAR;
let bpm = DEFAULT_BPM;

// Key and mode
let currentKey = 'C';
let currentMode = 'Major';

// Selected chord for placement
let selectedChord = null;
let selectedChordType = 'maj';
let selectedInversion = 0;

// Currently selected bar for editing
let selectedBarIndex = -1;

// Playback state
let isPlaying = false;
let currentPlayingBar = -1;
let playbackInterval = null;

// Instrument
let currentInstrument = 'Piano';

// Audio context
let audioContext = null;

// Undo/redo stacks
let undoStack = [];
let redoStack = [];
const MAX_UNDO_STATES = 50;

// Dirty flag for unsaved changes
let isDirty = false;

/**
 * Initialize progression with empty bars
 */
function initProgression() {
    progression = [];
    for (let i = 0; i < bars; i++) {
        progression.push({
            chord: null,
            type: null,
            inversion: 0,
            duration: beatsPerBar
        });
    }
}

/**
 * Get current state as JSON object
 */
function getState() {
    return {
        version: '1.0',
        bpm: bpm,
        key: currentKey,
        mode: currentMode,
        instrument: currentInstrument,
        bars: bars,
        beatsPerBar: beatsPerBar,
        progression: JSON.parse(JSON.stringify(progression))
    };
}

/**
 * Load state from JSON object
 */
function loadState(data) {
    if (!data) return;

    if (data.bpm) bpm = data.bpm;
    if (data.key) currentKey = data.key;
    if (data.mode) currentMode = data.mode;
    if (data.instrument) currentInstrument = data.instrument;
    if (data.bars) bars = data.bars;
    if (data.beatsPerBar) beatsPerBar = data.beatsPerBar;
    if (data.progression) {
        progression = JSON.parse(JSON.stringify(data.progression));
    }
}

/**
 * Mark state as modified
 */
function markDirty() {
    isDirty = true;
}

/**
 * Mark state as saved
 */
function markClean() {
    isDirty = false;
}
