// Application State
const state = {
    image: null,
    mode: 'jigsaw',
    level: 1,
    score: 0,
    currentGame: null
};

// DOM Elements
const els = {
    upload: {
        view: document.getElementById('landing-view'),
        dropZone: document.getElementById('drop-zone'),
        input: document.getElementById('file-input'),
        error: document.getElementById('upload-error')
    },
    game: {
        view: document.getElementById('game-view'),
        container: document.getElementById('game-container'),
        level: document.getElementById('level-num'),
        score: document.getElementById('score-num'),
        time: document.getElementById('time-num'),
        modeSelect: document.getElementById('mode-select'),
        btnHome: document.getElementById('btn-home'),
        btnHelp: document.getElementById('btn-help')
    },
    modal: {
        overlay: document.getElementById('modal-overlay'),
        score: document.getElementById('modal-score'),
        btnNext: document.getElementById('btn-next')
    },
    help: {
        overlay: document.getElementById('help-overlay'),
        content: document.getElementById('help-content'),
        btnClose: document.getElementById('btn-close-help')
    }
};

// View Management
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    if (viewName === 'landing') {
        els.upload.view.classList.add('active');
    } else if (viewName === 'game') {
        els.game.view.classList.add('active');
    }
}

// File Handling
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        els.upload.error.classList.remove('hidden');
        return;
    }

    els.upload.error.classList.add('hidden');
    loadImage(file, (img) => {
        if (!img) return;
        state.image = img;
        state.level = 1;
        state.score = 0;
        els.game.score.textContent = '0';
        startGame();
    });
}

// Game Initialization
function startGame() {
    if (!state.image) return;

    // Clean up previous game
    if (state.currentGame) {
        state.currentGame.destroy();
        state.currentGame = null;
    }

    // Callbacks for game events
    const callbacks = {
        onTimeUpdate: (time) => els.game.time.textContent = time,
        onScoreUpdate: (score) => els.game.score.textContent = state.score + score,
        onComplete: (roundScore) => {
            state.score += roundScore;
            els.game.score.textContent = state.score;
            els.modal.score.textContent = state.score;
            els.modal.overlay.classList.add('active');

            // Confetti effect (if available)
            if (window.confetti) {
                window.confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    // Create game instance
    if (state.mode === 'jigsaw') {
        state.currentGame = new JigsawGame(state.image, state.level, callbacks);
    } else if (state.mode === 'mosaic') {
        state.currentGame = new MosaicGame(state.image, state.level, callbacks);
    } else if (state.mode === 'spin') {
        state.currentGame = new SpinGame(state.image, state.level, callbacks);
    }

    // Switch to game view and initialize
    switchView('game');
    requestAnimationFrame(() => {
        if (state.currentGame) {
            state.currentGame.init(els.game.container);
            els.game.level.textContent = state.level;
        }
    });
}

// Event Listeners
function initEvents() {
    // Prevent default drag behaviors
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());

    // Upload area
    const dropZone = els.upload.dropZone;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    els.upload.input.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    // Game controls
    els.game.btnHome.addEventListener('click', () => {
        if (confirm("Return to home? Progress will be lost.")) {
            if (state.currentGame) {
                state.currentGame.destroy();
                state.currentGame = null;
            }
            switchView('landing');
            state.score = 0;
            state.level = 1;
            els.game.score.textContent = '0';
        }
    });

    els.game.modeSelect.addEventListener('change', (e) => {
        state.mode = e.target.value;
        startGame();
    });

    els.modal.btnNext.addEventListener('click', () => {
        els.modal.overlay.classList.remove('active');
        state.level++;
        startGame();
    });

    // Help
    els.game.btnHelp.addEventListener('click', () => {
        els.help.overlay.classList.add('active');
    });

    els.help.btnClose.addEventListener('click', () => {
        els.help.overlay.classList.remove('active');
    });

    // Resize handler
    window.addEventListener('resize', () => {
        if (state.currentGame && state.currentGame.handleResize) {
            state.currentGame.handleResize();
        }
    });
}

// Initialize app
initEvents();
switchView('landing');
