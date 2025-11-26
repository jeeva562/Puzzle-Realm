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

  // ========================================
// RIGHT-CLICK PROTECTION & SECURITY
// ========================================

// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    
    // Optional: Show custom message
    showProtectionMessage('Right-click is disabled');
    
    return false;
});

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener('keydown', function(e) {
    // F12 (Developer Tools)
    if (e.keyCode === 123) {
        e.preventDefault();
        showProtectionMessage('Developer tools are disabled');
        return false;
    }
    
    // Ctrl+Shift+I (Developer Tools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        showProtectionMessage('Developer tools are disabled');
        return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        showProtectionMessage('Console access is disabled');
        return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        showProtectionMessage('View source is disabled');
        return false;
    }
    
    // Ctrl+Shift+C (Element Inspector)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        showProtectionMessage('Element inspector is disabled');
        return false;
    }
    
    // Ctrl+S (Save Page)
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        showProtectionMessage('Saving page is disabled');
        return false;
    }
});

// Disable text selection (optional)
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

// Disable drag and drop
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});

// Custom protection message display
function showProtectionMessage(message) {
    // Remove existing message if any
    const existingMessage = document.getElementById('protection-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create and show new message
    const messageDiv = document.createElement('div');
    messageDiv.id = 'protection-message';
    messageDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        ">
            <i class="fas fa-shield-alt mr-2"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Add CSS for the slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    /* Disable text selection globally */
    * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    
    /* Allow selection for input fields */
    input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
    }
`;
document.head.appendChild(style);

// Advanced protection: Detect developer tools opening
let devtools = {
    open: false,
    orientation: null
};

// Check if developer tools are open
setInterval(function() {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
            devtools.open = true;
            // Optional: Redirect or show warning
            showProtectionMessage('Developer tools detected!');
            // Uncomment to redirect: window.location.href = "about:blank";
        }
    } else {
        devtools.open = false;
    }
}, 500);

// Console warning message
console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
console.log('%cThis is a browser feature intended for developers. Content on this page is protected.', 'color: red; font-size: 16px;');

// Disable print
window.addEventListener('beforeprint', function(e) {
    e.preventDefault();
    showProtectionMessage('Printing is disabled');
    return false;
});

// Disable save shortcut
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
        e.preventDefault();
        showProtectionMessage('Saving is disabled');
        return false;
    }
});

// Protection for mobile devices
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault(); // Disable multi-touch gestures
    }
});

// Disable image dragging
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
    });
});

console.log('🔒 Right-click protection and security measures activated');