/**
 * ChordMaker - Audio Engine
 * Web Audio API synthesis for chord playback
 */
'use strict';

/**
 * Initialize audio context
 */
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Resume audio context (required for user interaction)
 */
async function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

/**
 * Play a single note
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} startTime - Start time (audioContext.currentTime)
 * @param {number} volume - Volume (0-1)
 * @param {string} instrument - Instrument type
 */
function playNote(frequency, duration, startTime, volume = 0.3, instrument = 'Piano') {
    const ctx = initAudio();
    const now = startTime || ctx.currentTime;

    switch (instrument) {
        case 'Piano':
            playPianoNote(ctx, frequency, duration, now, volume);
            break;
        case 'Guitar':
            playGuitarNote(ctx, frequency, duration, now, volume);
            break;
        case 'Synth':
            playSynthPadNote(ctx, frequency, duration, now, volume);
            break;
        case 'Organ':
            playOrganNote(ctx, frequency, duration, now, volume);
            break;
        case 'Strings':
            playStringsNote(ctx, frequency, duration, now, volume);
            break;
        default:
            playPianoNote(ctx, frequency, duration, now, volume);
    }
}

/**
 * Piano sound - bell-like with quick decay
 */
function playPianoNote(ctx, frequency, duration, startTime, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Add harmonics for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2, startTime);
    gain2.gain.setValueAtTime(volume * 0.3, startTime);

    // ADSR envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(volume * 0.6, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    gain2.gain.setValueAtTime(volume * 0.3, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.8);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);
}

/**
 * Guitar sound - plucked string character
 */
function playGuitarNote(ctx, frequency, duration, startTime, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, startTime);
    filter.frequency.exponentialRampToValueAtTime(500, startTime + duration * 0.3);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(volume * 0.4, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

/**
 * Synth Pad - warm, sustained sound
 */
function playSynthPadNote(ctx, frequency, duration, startTime, volume) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(frequency, startTime);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(frequency * 1.005, startTime); // Slight detune

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, startTime);
    filter.Q.setValueAtTime(2, startTime);

    // Slow attack for pad sound
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * 0.5, startTime + 0.2);
    gain.gain.setValueAtTime(volume * 0.5, startTime + duration - 0.3);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    const mixer = ctx.createGain();
    mixer.gain.setValueAtTime(0.5, startTime);

    osc1.connect(mixer);
    osc2.connect(mixer);
    mixer.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
}

/**
 * Organ sound - sustained with harmonics
 */
function playOrganNote(ctx, frequency, duration, startTime, volume) {
    const harmonics = [1, 2, 3, 4];
    const gains = [1, 0.5, 0.25, 0.125];

    harmonics.forEach((harmonic, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency * harmonic, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume * gains[i] * 0.3, startTime + 0.05);
        gain.gain.setValueAtTime(volume * gains[i] * 0.3, startTime + duration - 0.1);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    });
}

/**
 * Strings sound - slow attack, lush sustain
 */
function playStringsNote(ctx, frequency, duration, startTime, volume) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(frequency, startTime);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(frequency * 1.002, startTime);

    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(frequency * 0.998, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, startTime);
    filter.Q.setValueAtTime(1, startTime);

    // Very slow attack for strings
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.4);
    gain.gain.setValueAtTime(volume * 0.4, startTime + duration - 0.4);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    const mixer = ctx.createGain();
    mixer.gain.setValueAtTime(0.33, startTime);

    osc1.connect(mixer);
    osc2.connect(mixer);
    osc3.connect(mixer);
    mixer.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    osc3.stop(startTime + duration);
}

/**
 * Play a chord
 * @param {string} root - Root note
 * @param {string} type - Chord type
 * @param {number} inversion - Inversion
 * @param {number} duration - Duration in seconds
 * @param {number} startTime - Start time
 * @param {string} instrument - Instrument type
 */
function playChord(root, type, inversion = 0, duration = 1, startTime = null, instrument = null) {
    const ctx = initAudio();
    const now = startTime || ctx.currentTime;
    const inst = instrument || currentInstrument;

    const frequencies = getChordFrequencies(root, type, inversion, 3);
    const volume = 0.25 / frequencies.length; // Normalize volume based on chord size

    frequencies.forEach(freq => {
        playNote(freq, duration, now, volume, inst);
    });
}

/**
 * Preview a chord (short duration)
 */
function previewChord(root, type) {
    resumeAudio();
    playChord(root, type, 0, 0.5);
}

/**
 * Get duration of one bar in seconds
 */
function getBarDuration() {
    return (60 / bpm) * beatsPerBar;
}

/**
 * Get total progression duration in seconds
 */
function getProgressionDuration() {
    return getBarDuration() * bars;
}
