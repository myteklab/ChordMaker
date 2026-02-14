/**
 * ChordMaker - Undo/Redo System
 */
'use strict';

/**
 * Save current state to undo stack
 * @param {string} actionName - Description of the action
 */
function saveUndoState(actionName) {
    const state = {
        action: actionName,
        data: getState()
    };

    undoStack.push(state);

    // Limit stack size
    if (undoStack.length > MAX_UNDO_STATES) {
        undoStack.shift();
    }

    // Clear redo stack when new action is performed
    redoStack = [];

    updateUndoRedoButtons();
}

/**
 * Undo last action
 */
function undo() {
    if (undoStack.length === 0) return;

    // Save current state to redo stack
    redoStack.push({
        action: 'Undo',
        data: getState()
    });

    // Restore previous state
    const previousState = undoStack.pop();
    loadState(previousState.data);

    // Update UI
    updateControlsFromState();
    buildProgressionTimeline();
    updateUndoRedoButtons();

    showToast(`Undid: ${previousState.action}`);
}

/**
 * Redo last undone action
 */
function redo() {
    if (redoStack.length === 0) return;

    // Save current state to undo stack
    undoStack.push({
        action: 'Redo',
        data: getState()
    });

    // Restore redo state
    const redoState = redoStack.pop();
    loadState(redoState.data);

    // Update UI
    updateControlsFromState();
    buildProgressionTimeline();
    updateUndoRedoButtons();

    showToast('Redo');
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    if (undoBtn) {
        undoBtn.disabled = undoStack.length === 0;
    }
    if (redoBtn) {
        redoBtn.disabled = redoStack.length === 0;
    }
}

/**
 * Setup keyboard shortcuts for undo/redo
 */
function setupUndoRedoShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z or Cmd+Z for Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        // Ctrl+Y or Cmd+Shift+Z for Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            redo();
        }
    });
}
