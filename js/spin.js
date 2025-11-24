// Spin Rotation Puzzle Game
class SpinGame extends GameEngine {
    constructor(image, level, callbacks) {
        super(image, level, callbacks);
        this.gridSize = Math.min(3 + level, 6);
        this.tiles = [];
        this.boardEl = null;
        this.layout = {};
    }

    setup() {
        this.createBoard();
        this.createTiles();
    }

    createBoard() {
        const containerRect = this.container.getBoundingClientRect();
        const containerW = containerRect.width - 20;
        const containerH = containerRect.height - 20;

        const aspectRatio = this.image.width / this.image.height;
        let boardW = Math.min(containerW, containerH);
        let boardH = boardW / aspectRatio;

        if (boardH > containerH) {
            boardH = containerH;
            boardW = boardH * aspectRatio;
        }

        const board = document.createElement('div');
        board.className = 'spin-board';
        board.style.width = `${boardW}px`;
        board.style.height = `${boardH}px`;
        board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;

        this.container.appendChild(board);
        this.boardEl = board;
        this.layout = { boardW, boardH };
    }

    createTiles() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const canvas = document.createElement('canvas');
                drawImagePortion(
                    canvas, this.image,
                    x * (this.image.width / this.gridSize),
                    y * (this.image.height / this.gridSize),
                    this.image.width / this.gridSize,
                    this.image.height / this.gridSize
                );

                const tile = document.createElement('div');
                tile.className = 'spin-tile';
                tile.appendChild(canvas);

                tile.style.gridColumn = x + 1;
                tile.style.gridRow = y + 1;

                this.boardEl.appendChild(tile);

                const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
                canvas.style.transform = `rotate(${rotation}deg)`;

                this.tiles.push({
                    el: tile,
                    canvas,
                    rotation,
                    x,
                    y
                });

                tile.addEventListener('click', () => this.rotateTile(tile));
            }
        }
    }

    rotateTile(tileEl) {
        const tile = this.tiles.find(t => t.el === tileEl);
        if (!tile) return;

        tile.rotation = (tile.rotation + 90) % 360;
        tile.canvas.style.transform = `rotate(${tile.rotation}deg)`;

        this.checkWin();
    }

    checkWin() {
        const allCorrect = this.tiles.every(t => t.rotation === 0);
        if (allCorrect) {
            this.onWin();
        }
    }

    handleResize() {
        this.container.innerHTML = '';
        this.tiles = [];
        this.setup();
    }
}
