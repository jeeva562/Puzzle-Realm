// Base Game Engine Class
class GameEngine {
    constructor(image, level, callbacks) {
        this.image = image;
        this.level = level;
        this.callbacks = callbacks;
        this.container = null;
        this.startTime = null;
        this.timerInterval = null;
    }

    init(container) {
        try {
            this.container = container;
            this.container.innerHTML = '';
            this.setup();
            this.startTimer();
        } catch (e) {
            console.error("Game Init Error:", e);
            alert("The magic fizzled out! Please try again.");
        }
    }

    setup() {
        // Override in child classes
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const secs = (elapsed % 60).toString().padStart(2, '0');
            if (this.callbacks.onTimeUpdate) {
                this.callbacks.onTimeUpdate(`${mins}:${secs}`);
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    getElapsedTime() {
        return this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    }

    calculateScore() {
        const baseScore = this.level * 1000;
        const timeBonus = Math.max(0, 500 - this.getElapsedTime());
        return baseScore + timeBonus;
    }

    onWin() {
        this.stopTimer();
        const score = this.calculateScore();
        if (this.callbacks.onComplete) {
            this.callbacks.onComplete(score);
        }
    }

    destroy() {
        this.stopTimer();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    handleResize() {
        // Override in child classes if needed
    }
}
