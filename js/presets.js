/**
 * ChordMaker - Presets
 * Common chord progressions
 */
'use strict';

/**
 * Get scale degree chord for current key
 * @param {number} degree - Scale degree (0-11)
 * @param {string} type - Chord type
 * @returns {object} Chord info
 */
function getDegreeChord(degree, type) {
    const root = getNoteAtInterval(currentKey, degree);
    return { chord: root, type: type, inversion: 0, duration: beatsPerBar };
}

/**
 * Common progression presets
 */
const PROGRESSION_PRESETS = {
    'I-V-vi-IV': {
        name: 'I-V-vi-IV (Pop)',
        description: 'The most popular chord progression in modern music',
        getChords: (key, mode) => {
            if (mode === 'Major') {
                return [
                    getDegreeChord(0, 'maj'),  // I
                    getDegreeChord(7, 'maj'),  // V
                    getDegreeChord(9, 'min'),  // vi
                    getDegreeChord(5, 'maj')   // IV
                ];
            } else {
                return [
                    getDegreeChord(0, 'min'),  // i
                    getDegreeChord(7, 'min'),  // v
                    getDegreeChord(8, 'maj'),  // VI
                    getDegreeChord(5, 'min')   // iv
                ];
            }
        }
    },
    'I-IV-V-I': {
        name: 'I-IV-V-I (Classic)',
        description: 'The foundational progression in Western music',
        getChords: (key, mode) => {
            if (mode === 'Major') {
                return [
                    getDegreeChord(0, 'maj'),  // I
                    getDegreeChord(5, 'maj'),  // IV
                    getDegreeChord(7, 'maj'),  // V
                    getDegreeChord(0, 'maj')   // I
                ];
            } else {
                return [
                    getDegreeChord(0, 'min'),
                    getDegreeChord(5, 'min'),
                    getDegreeChord(7, 'min'),
                    getDegreeChord(0, 'min')
                ];
            }
        }
    },
    'ii-V-I': {
        name: 'ii-V-I (Jazz)',
        description: 'The essential jazz progression',
        getChords: (key, mode) => {
            if (mode === 'Major') {
                return [
                    getDegreeChord(2, 'min7'), // ii7
                    getDegreeChord(7, '7'),    // V7
                    getDegreeChord(0, 'maj7'), // Imaj7
                    getDegreeChord(0, 'maj7')  // Imaj7
                ];
            } else {
                return [
                    getDegreeChord(2, 'dim'),
                    getDegreeChord(7, '7'),
                    getDegreeChord(0, 'min7'),
                    getDegreeChord(0, 'min7')
                ];
            }
        }
    },
    'I-vi-IV-V': {
        name: 'I-vi-IV-V (50s)',
        description: 'The classic 1950s doo-wop progression',
        getChords: (key, mode) => {
            if (mode === 'Major') {
                return [
                    getDegreeChord(0, 'maj'),  // I
                    getDegreeChord(9, 'min'),  // vi
                    getDegreeChord(5, 'maj'),  // IV
                    getDegreeChord(7, 'maj')   // V
                ];
            } else {
                return [
                    getDegreeChord(0, 'min'),
                    getDegreeChord(8, 'maj'),
                    getDegreeChord(5, 'min'),
                    getDegreeChord(7, 'min')
                ];
            }
        }
    },
    'vi-IV-I-V': {
        name: 'vi-IV-I-V (Axis)',
        description: 'Starting on the relative minor for a different feel',
        getChords: (key, mode) => {
            if (mode === 'Major') {
                return [
                    getDegreeChord(9, 'min'),  // vi
                    getDegreeChord(5, 'maj'),  // IV
                    getDegreeChord(0, 'maj'),  // I
                    getDegreeChord(7, 'maj')   // V
                ];
            } else {
                return [
                    getDegreeChord(8, 'maj'),
                    getDegreeChord(5, 'min'),
                    getDegreeChord(0, 'min'),
                    getDegreeChord(7, 'min')
                ];
            }
        }
    },
    'I-IV-vi-V': {
        name: 'I-IV-vi-V (Anthemic)',
        description: 'Great for big choruses and anthemic songs',
        getChords: (key, mode) => {
            if (mode === 'Major') {
                return [
                    getDegreeChord(0, 'maj'),  // I
                    getDegreeChord(5, 'maj'),  // IV
                    getDegreeChord(9, 'min'),  // vi
                    getDegreeChord(7, 'maj')   // V
                ];
            } else {
                return [
                    getDegreeChord(0, 'min'),
                    getDegreeChord(5, 'min'),
                    getDegreeChord(8, 'maj'),
                    getDegreeChord(7, 'min')
                ];
            }
        }
    },
    'i-VI-III-VII': {
        name: 'i-VI-III-VII (Epic)',
        description: 'Dramatic progression for cinematic moments',
        getChords: (key, mode) => {
            // This works best in minor
            return [
                getDegreeChord(0, 'min'),  // i
                getDegreeChord(8, 'maj'),  // VI
                getDegreeChord(3, 'maj'),  // III
                getDegreeChord(10, 'maj')  // VII
            ];
        }
    },
    '12-bar-blues': {
        name: '12-Bar Blues',
        description: 'The classic blues progression (needs 12 bars)',
        getChords: (key, mode) => {
            return [
                getDegreeChord(0, '7'),   // I7
                getDegreeChord(0, '7'),   // I7
                getDegreeChord(0, '7'),   // I7
                getDegreeChord(0, '7'),   // I7
                getDegreeChord(5, '7'),   // IV7
                getDegreeChord(5, '7'),   // IV7
                getDegreeChord(0, '7'),   // I7
                getDegreeChord(0, '7'),   // I7
                getDegreeChord(7, '7'),   // V7
                getDegreeChord(5, '7'),   // IV7
                getDegreeChord(0, '7'),   // I7
                getDegreeChord(7, '7')    // V7 (turnaround)
            ];
        }
    }
};

/**
 * Load a preset progression
 */
function loadPreset(presetName) {
    const preset = PROGRESSION_PRESETS[presetName];
    if (!preset) {
        showToast('Preset not found', 'error');
        return;
    }

    saveUndoState('Load Preset');

    const chords = preset.getChords(currentKey, currentMode);

    // Adjust bar count if needed (for 12-bar blues)
    if (presetName === '12-bar-blues' && bars < 12) {
        bars = 12;
        document.getElementById('barCount').value = 12;
    }

    // Fill progression
    for (let i = 0; i < bars; i++) {
        if (i < chords.length) {
            progression[i] = { ...chords[i] };
        } else if (chords.length > 0) {
            // Repeat the pattern
            progression[i] = { ...chords[i % chords.length] };
        } else {
            progression[i] = { chord: null, type: null, inversion: 0, duration: beatsPerBar };
        }
    }

    markDirty();
    buildProgressionTimeline();
    showToast(`Loaded: ${preset.name}`);
}
