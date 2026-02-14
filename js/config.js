/**
 * ChordMaker - Configuration
 * Global constants and settings
 */
'use strict';

// Audio configuration
const SAMPLE_RATE = 44100;
const DEFAULT_BPM = 100;
const DEFAULT_BARS = 8;
const BEATS_PER_BAR = 4;

// Note frequencies (A4 = 440Hz)
const NOTE_FREQUENCIES = {
    'C': [32.70, 65.41, 130.81, 261.63, 523.25, 1046.50],
    'C#': [34.65, 69.30, 138.59, 277.18, 554.37, 1108.73],
    'D': [36.71, 73.42, 146.83, 293.66, 587.33, 1174.66],
    'D#': [38.89, 77.78, 155.56, 311.13, 622.25, 1244.51],
    'E': [41.20, 82.41, 164.81, 329.63, 659.25, 1318.51],
    'F': [43.65, 87.31, 174.61, 349.23, 698.46, 1396.91],
    'F#': [46.25, 92.50, 185.00, 369.99, 739.99, 1479.98],
    'G': [49.00, 98.00, 196.00, 392.00, 783.99, 1567.98],
    'G#': [51.91, 103.83, 207.65, 415.30, 830.61, 1661.22],
    'A': [55.00, 110.00, 220.00, 440.00, 880.00, 1760.00],
    'A#': [58.27, 116.54, 233.08, 466.16, 932.33, 1864.66],
    'B': [61.74, 123.47, 246.94, 493.88, 987.77, 1975.53]
};

// All notes in chromatic order
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Chord type intervals (semitones from root)
const CHORD_INTERVALS = {
    'maj': [0, 4, 7],           // Major triad
    'min': [0, 3, 7],           // Minor triad
    'dim': [0, 3, 6],           // Diminished triad
    'aug': [0, 4, 8],           // Augmented triad
    '7': [0, 4, 7, 10],         // Dominant 7th
    'maj7': [0, 4, 7, 11],      // Major 7th
    'min7': [0, 3, 7, 10],      // Minor 7th
    'dim7': [0, 3, 6, 9],       // Diminished 7th
    'sus2': [0, 2, 7],          // Suspended 2nd
    'sus4': [0, 5, 7],          // Suspended 4th
    'add9': [0, 4, 7, 14],      // Add 9
    '6': [0, 4, 7, 9],          // Major 6th
    'min6': [0, 3, 7, 9]        // Minor 6th
};

// Chord type display names
const CHORD_TYPE_NAMES = {
    'maj': 'Major',
    'min': 'Minor',
    'dim': 'Dim',
    'aug': 'Aug',
    '7': '7',
    'maj7': 'Maj7',
    'min7': 'Min7',
    'dim7': 'Dim7',
    'sus2': 'Sus2',
    'sus4': 'Sus4',
    'add9': 'Add9',
    '6': '6',
    'min6': 'Min6'
};

// Inversion names
const INVERSION_NAMES = ['Root', '1st Inv', '2nd Inv', '3rd Inv'];

// Scale degrees for major and minor keys
const MAJOR_SCALE_CHORDS = {
    'I': { degree: 0, type: 'maj' },
    'ii': { degree: 2, type: 'min' },
    'iii': { degree: 4, type: 'min' },
    'IV': { degree: 5, type: 'maj' },
    'V': { degree: 7, type: 'maj' },
    'vi': { degree: 9, type: 'min' },
    'vii°': { degree: 11, type: 'dim' }
};

const MINOR_SCALE_CHORDS = {
    'i': { degree: 0, type: 'min' },
    'ii°': { degree: 2, type: 'dim' },
    'III': { degree: 3, type: 'maj' },
    'iv': { degree: 5, type: 'min' },
    'v': { degree: 7, type: 'min' },
    'VI': { degree: 8, type: 'maj' },
    'VII': { degree: 10, type: 'maj' }
};
