/**
 * ChordMaker - Export Module
 * Export chord progressions to audio files
 */
'use strict';

// Modal state
let exportLoopCount = 2;
let isExporting = false;

/**
 * Open export modal
 */
function openExportModal() {
    const modal = document.getElementById('exportModal');
    const filenameInput = document.getElementById('exportFilename');

    filenameInput.value = `Chords_${currentKey}_${currentMode}_${Date.now()}`;
    updateDurationDisplay();

    modal.classList.add('show');
}

/**
 * Close export modal
 */
function closeExportModal() {
    const modal = document.getElementById('exportModal');
    modal.classList.remove('show');
}

/**
 * Set loop count
 */
function setLoopCount(count) {
    exportLoopCount = count;

    document.querySelectorAll('.loop-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === `${count}x`);
    });

    updateDurationDisplay();
}

/**
 * Update duration display
 */
function updateDurationDisplay() {
    const duration = calculateProgressionDuration();
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const durationText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    const display = document.getElementById('durationDisplay');
    if (display) {
        display.textContent = `Duration: ${durationText}`;
    }
}

/**
 * Calculate total duration
 */
function calculateProgressionDuration() {
    const barDuration = (60 / bpm) * beatsPerBar;
    return barDuration * bars * exportLoopCount;
}

/**
 * Entry point for export
 */
function exportProgression() {
    openExportModal();
}

/**
 * Confirm and execute export
 */
async function confirmExport() {
    if (isExporting) {
        showToast('Export already in progress...', 'info');
        return;
    }

    isExporting = true;

    const filename = document.getElementById('exportFilename').value.trim();
    const format = document.getElementById('exportFormat').value;

    if (!filename) {
        showToast('Please enter a filename', 'error');
        isExporting = false;
        return;
    }

    closeExportModal();
    showToast('Rendering audio...', 'info');

    try {
        const duration = calculateProgressionDuration();
        const audioBlob = await renderProgressionToAudio(duration, format);
        await downloadAudioFile(audioBlob, format, filename);
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed: ' + error.message, 'error');
    } finally {
        isExporting = false;
    }
}

/**
 * Render progression to audio
 */
async function renderProgressionToAudio(duration, format = 'wav') {
    const sampleRate = 44100;
    const offlineContext = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

    const barDuration = (60 / bpm) * beatsPerBar;
    let currentTime = 0;

    for (let loop = 0; loop < exportLoopCount; loop++) {
        for (let barIndex = 0; barIndex < bars; barIndex++) {
            const chord = progression[barIndex];

            if (chord && chord.chord && chord.type) {
                playChordOffline(
                    offlineContext,
                    chord.chord,
                    chord.type,
                    chord.inversion || 0,
                    barDuration * 0.95, // Slight gap between chords
                    currentTime
                );
            }

            currentTime += barDuration;
        }
    }

    const renderedBuffer = await offlineContext.startRendering();
    return audioBufferToWav(renderedBuffer);
}

/**
 * Play chord in offline context
 */
function playChordOffline(context, root, type, inversion, duration, startTime) {
    const frequencies = getChordFrequencies(root, type, inversion, 3);
    const volume = 0.2 / frequencies.length;

    frequencies.forEach(freq => {
        playNoteOffline(context, freq, duration, startTime, volume);
    });
}

/**
 * Play note in offline context
 */
function playNoteOffline(context, frequency, duration, startTime, volume) {
    // Piano-like sound for export
    const osc = context.createOscillator();
    const osc2 = context.createOscillator();
    const gain = context.createGain();
    const gain2 = context.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2, startTime);

    // ADSR envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(volume * 0.6, startTime + 0.1);
    gain.gain.setValueAtTime(volume * 0.6, startTime + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    gain2.gain.setValueAtTime(volume * 0.3, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(context.destination);
    gain2.connect(context.destination);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);
}

/**
 * Convert AudioBuffer to WAV blob
 */
function audioBufferToWav(buffer) {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    const setUint16 = (data) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };
    const setUint32 = (data) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };

    // RIFF header
    setUint32(0x46464952); // "RIFF"
    setUint32(36 + length);
    setUint32(0x45564157); // "WAVE"

    // fmt chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);

    // data chunk
    setUint32(0x61746164); // "data"
    setUint32(length);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < arrayBuffer.byteLength) {
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Convert WAV to MP3
 */
function wavToMp3(wavBlob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function() {
            try {
                const wav = lamejs.WavHeader.readHeader(new DataView(reader.result));
                const samples = new Int16Array(reader.result, wav.dataOffset, wav.dataLen / 2);

                const mp3encoder = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 128);
                const mp3Data = [];
                const sampleBlockSize = 1152;

                if (wav.channels === 1) {
                    for (let i = 0; i < samples.length; i += sampleBlockSize) {
                        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
                        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
                        if (mp3buf.length > 0) mp3Data.push(mp3buf);
                    }
                } else {
                    const left = [];
                    const right = [];
                    for (let i = 0; i < samples.length; i += 2) {
                        left.push(samples[i]);
                        right.push(samples[i + 1]);
                    }

                    const leftSamples = new Int16Array(left);
                    const rightSamples = new Int16Array(right);

                    for (let i = 0; i < leftSamples.length; i += sampleBlockSize) {
                        const leftChunk = leftSamples.subarray(i, i + sampleBlockSize);
                        const rightChunk = rightSamples.subarray(i, i + sampleBlockSize);
                        const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                        if (mp3buf.length > 0) mp3Data.push(mp3buf);
                    }
                }

                const mp3buf = mp3encoder.flush();
                if (mp3buf.length > 0) mp3Data.push(mp3buf);

                resolve(new Blob(mp3Data, { type: 'audio/mp3' }));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read WAV file'));
        reader.readAsArrayBuffer(wavBlob);
    });
}

/**
 * Download audio file locally
 */
async function downloadAudioFile(audioBlob, format, filename) {
    var baseName = filename.replace(/\.(wav|mp3)$/i, '');
    var finalBlob = audioBlob;

    try {
        if (format === 'mp3') {
            showToast('Converting to MP3...', 'info');
            finalBlob = await wavToMp3(audioBlob);
        }

        var url = URL.createObjectURL(finalBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = baseName + '.' + format;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Progression exported as ' + format.toUpperCase() + '!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed: ' + error.message, 'error');
    }
}
