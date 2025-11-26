// Main Application

const app = {
    image: null,
    mode: 'sliding',
    level: 1,
    score: 0,
    game: null
};

// UI Elements
const ui = {
    uploadScreen: document.getElementById('upload-screen'),
    gameScreen: document.getElementById('game-screen'),
    uploadBox: document.getElementById('upload-box'),
    fileInput: document.getElementById('file-input'),
    errorMsg: document.getElementById('error-msg'),
    level: document.getElementById('level'),
    score: document.getElementById('score'),
    time: document.getElementById('time'),
    gameMode: document.getElementById('game-mode'),
    gameContainer: document.getElementById('game-container'),
    homeBtn: document.getElementById('home-btn'),
    helpBtn: document.getElementById('help-btn'),
    winModal: document.getElementById('win-modal'),
    helpModal: document.getElementById('help-modal'),
    modalScore: document.getElementById('modal-score'),
    nextBtn: document.getElementById('next-btn'),
    closeHelpBtn: document.getElementById('close-help-btn')
};

// Initialize
function init() {
    // Upload handlers
    ui.uploadBox.addEventListener('click', () => ui.fileInput.click());
    ui.uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        ui.uploadBox.style.borderColor = 'var(--accent)';
    });
    ui.uploadBox.addEventListener('dragleave', () => {
        ui.uploadBox.style.borderColor = '';
    });
    ui.uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        ui.uploadBox.style.borderColor = '';
        if (e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    ui.fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    // Game controls
    ui.gameMode.addEventListener('change', (e) => {
        app.mode = e.target.value;
        startGame();
    });
    ui.homeBtn.addEventListener('click', () => {
        if (confirm('Return home? Progress will be lost.')) {
            goHome();
        }
    });
    ui.helpBtn.addEventListener('click', () => {
        ui.helpModal.classList.add('active');
    });
    ui.closeHelpBtn.addEventListener('click', () => {
        ui.helpModal.classList.remove('active');
    });
    ui.nextBtn.addEventListener('click', () => {
        ui.winModal.classList.remove('active');
        app.level++;
        startGame();
    });

    // Prevent default drag on window
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());
}

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        ui.errorMsg.classList.remove('hidden');
        return;
    }

    ui.errorMsg.classList.add('hidden');
    loadImage(file, (img) => {
        if (!img) {
            ui.errorMsg.classList.remove('hidden');
            return;
        }
        app.image = img;
        app.level = 1;
        app.score = 0;
        ui.score.textContent = '0';
        showGameScreen();
        startGame();
    });
}

function showGameScreen() {
    ui.uploadScreen.classList.remove('active');
    ui.gameScreen.classList.add('active');
}

function goHome() {
    if (app.game) {
        app.game.destroy();
        app.game = null;
    }
    app.score = 0;
    app.level = 1;
    ui.score.textContent = '0';
    ui.gameScreen.classList.remove('active');
    ui.uploadScreen.classList.add('active');
}

function startGame() {
    if (!app.image) return;

    // Cleanup previous game
    if (app.game) {
        app.game.destroy();
        app.game = null;
    }

    // Game callbacks
    const callbacks = {
        onTimeUpdate: (time) => ui.time.textContent = time,
        onComplete: (roundScore) => {
            app.score += roundScore;
            ui.score.textContent = app.score;
            ui.modalScore.textContent = app.score;
            ui.winModal.classList.add('active');
        }
    };

    // Create game
    if (app.mode === 'sliding') {
        app.game = new SlidingGame(app.image, app.level, callbacks);
    } else if (app.mode === 'mosaic') {
        app.game = new MosaicGame(app.image, app.level, callbacks);
    } else if (app.mode === 'spin') {
        app.game = new SpinGame(app.image, app.level, callbacks);
    }

    // Initialize
    ui.level.textContent = app.level;
    requestAnimationFrame(() => {
        if (app.game) {
            app.game.init(ui.gameContainer);
        }
    });
}

// Start app
init();
