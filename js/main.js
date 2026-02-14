/**
 * ChordMaker - Main Entry Point
 * Application initialization
 */
'use strict';

/**
 * Initialize the application
 */
function init() {
    // Initialize audio context on first user interaction
    document.addEventListener('click', () => {
        initAudio();
        resumeAudio();
    }, { once: true });

    // Initialize progression
    initProgression();

    // Initialize UI
    initUI();

    // Setup undo/redo shortcuts
    setupUndoRedoShortcuts();

    console.log('ChordMaker initialized');
}

/**
 * Toggle playback
 */
function togglePlay() {
    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
}

/**
 * Start playback
 */
function startPlayback() {
    if (isPlaying) return;

    initAudio();
    resumeAudio();

    isPlaying = true;
    currentPlayingBar = 0;

    const playBtn = document.getElementById('playBtn');
    playBtn.classList.add('playing');
    playBtn.textContent = '\u23F9 Stop';

    const barDuration = getBarDuration();

    // Play first chord immediately
    playCurrentBar();
    highlightPlayingBar(0);

    // Schedule subsequent chords
    playbackInterval = setInterval(() => {
        currentPlayingBar++;

        if (currentPlayingBar >= bars) {
            currentPlayingBar = 0; // Loop
        }

        playCurrentBar();
        highlightPlayingBar(currentPlayingBar);
    }, barDuration * 1000);
}

/**
 * Stop playback
 */
function stopPlayback() {
    isPlaying = false;
    currentPlayingBar = -1;

    if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
    }

    const playBtn = document.getElementById('playBtn');
    playBtn.classList.remove('playing');
    playBtn.textContent = '\u25B6 Play';

    clearPlayingHighlight();
}

/**
 * Play the current bar's chord
 */
function playCurrentBar() {
    const chord = progression[currentPlayingBar];

    if (chord && chord.chord && chord.type) {
        const barDuration = getBarDuration();
        playChord(chord.chord, chord.type, chord.inversion || 0, barDuration * 0.9);
    }
}

// Platform exports
window.serializeProjectData = function() {
    return getState();
};

window.loadProjectData = function(data) {
    loadState(data);
    updateControlsFromState();
    buildProgressionTimeline();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
