/**
 * ChordMaker - Chord Library
 * Functions for building and manipulating chords
 */
'use strict';

/**
 * Get the note name at a given semitone offset from a root
 * @param {string} root - Root note (e.g., 'C', 'F#')
 * @param {number} semitones - Number of semitones from root
 * @returns {string} Note name
 */
function getNoteAtInterval(root, semitones) {
    const rootIndex = ALL_NOTES.indexOf(root);
    if (rootIndex === -1) return root;
    const noteIndex = (rootIndex + semitones) % 12;
    return ALL_NOTES[noteIndex];
}

/**
 * Get the notes in a chord
 * @param {string} root - Root note
 * @param {string} type - Chord type (e.g., 'maj', 'min', '7')
 * @param {number} inversion - Inversion (0 = root, 1 = 1st, 2 = 2nd)
 * @returns {Array} Array of note names
 */
function getChordNotes(root, type, inversion = 0) {
    const intervals = CHORD_INTERVALS[type] || CHORD_INTERVALS['maj'];
    let notes = intervals.map(interval => getNoteAtInterval(root, interval));

    // Apply inversion by rotating the array
    for (let i = 0; i < inversion && i < notes.length - 1; i++) {
        notes.push(notes.shift());
    }

    return notes;
}

/**
 * Get the frequencies for a chord
 * @param {string} root - Root note
 * @param {string} type - Chord type
 * @param {number} inversion - Inversion
 * @param {number} octave - Base octave (default 3)
 * @returns {Array} Array of frequencies
 */
function getChordFrequencies(root, type, inversion = 0, octave = 3) {
    const notes = getChordNotes(root, type, inversion);
    const frequencies = [];

    let currentOctave = octave;
    let lastNoteIndex = -1;

    for (let i = 0; i < notes.length; i++) {
        const noteIndex = ALL_NOTES.indexOf(notes[i]);

        // Move up an octave if this note is lower than the previous
        if (i > 0 && noteIndex <= lastNoteIndex) {
            currentOctave++;
        }

        const freq = NOTE_FREQUENCIES[notes[i]][currentOctave];
        if (freq) {
            frequencies.push(freq);
        }

        lastNoteIndex = noteIndex;
    }

    return frequencies;
}

/**
 * Get the display name for a chord
 * @param {string} root - Root note
 * @param {string} type - Chord type
 * @returns {string} Display name (e.g., "Cmaj", "Am", "G7")
 */
function getChordDisplayName(root, type) {
    if (!root || !type) return '';

    let suffix = '';
    switch (type) {
        case 'maj': suffix = ''; break;
        case 'min': suffix = 'm'; break;
        case 'dim': suffix = '°'; break;
        case 'aug': suffix = '+'; break;
        case '7': suffix = '7'; break;
        case 'maj7': suffix = 'maj7'; break;
        case 'min7': suffix = 'm7'; break;
        case 'dim7': suffix = '°7'; break;
        case 'sus2': suffix = 'sus2'; break;
        case 'sus4': suffix = 'sus4'; break;
        case 'add9': suffix = 'add9'; break;
        case '6': suffix = '6'; break;
        case 'min6': suffix = 'm6'; break;
        default: suffix = type;
    }

    return root + suffix;
}

/**
 * Get chords in a key
 * @param {string} key - Key (e.g., 'C', 'G')
 * @param {string} mode - Mode ('Major' or 'Minor')
 * @returns {Array} Array of chord objects with root and type
 */
function getChordsInKey(key, mode) {
    const scaleChords = mode === 'Major' ? MAJOR_SCALE_CHORDS : MINOR_SCALE_CHORDS;
    const chords = [];

    for (const [numeral, info] of Object.entries(scaleChords)) {
        const root = getNoteAtInterval(key, info.degree);
        chords.push({
            numeral: numeral,
            root: root,
            type: info.type
        });
    }

    return chords;
}

/**
 * Check if a chord is diatonic to a key
 * @param {string} chordRoot - Chord root note
 * @param {string} chordType - Chord type
 * @param {string} key - Key
 * @param {string} mode - Mode
 * @returns {boolean}
 */
function isChordInKey(chordRoot, chordType, key, mode) {
    const chordsInKey = getChordsInKey(key, mode);
    return chordsInKey.some(c => c.root === chordRoot && c.type === chordType);
}

/**
 * Get the Roman numeral for a chord in a key
 * @param {string} chordRoot - Chord root
 * @param {string} chordType - Chord type
 * @param {string} key - Key
 * @param {string} mode - Mode
 * @returns {string} Roman numeral or empty string
 */
function getChordNumeral(chordRoot, chordType, key, mode) {
    const chordsInKey = getChordsInKey(key, mode);
    const found = chordsInKey.find(c => c.root === chordRoot && c.type === chordType);
    return found ? found.numeral : '';
}
