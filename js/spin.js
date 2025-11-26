// Spin Rotation Puzzle - Square board!

class SpinGame extends GameEngine {
    constructor(image, level, callbacks) {
        super(image, level, callbacks);
        this.gridSize = Math.min(3 + level, 6);
        this.tiles = [];
    }

    setup() {
        this.createBoard();
        this.createTiles();
    }

    createBoard() {
        // SIMPLE: Square board
        const containerRect = this.container.getBoundingClientRect();
        const size = Math.min(containerRect.width, containerRect.height) * 0.9;

        const board = document.createElement('div');
        board.className = 'game-board';
        board.style.width = size + 'px';
        board.style.height = size + 'px';
        board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;

        this.container.appendChild(board);
        this.board = board;
    }

    createTiles() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const canvas = document.createElement('canvas');
                const tileSize = this.image.width / this.gridSize;

                drawImagePortion(
                    canvas, this.image,
                    x * tileSize, y * tileSize,
                    tileSize, tileSize
                );

                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.appendChild(canvas);
                tile.style.gridColumn = x + 1;
                tile.style.gridRow = y + 1;

                const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
                canvas.style.transform = `rotate(${rotation}deg)`;

                tile.onclick = () => this.rotateTile(tile);

                this.board.appendChild(tile);
                this.tiles.push({ element: tile, canvas, rotation });
            }
        }
    }

    rotateTile(tileEl) {
        const tile = this.tiles.find(t => t.element === tileEl);
        if (!tile) return;

        tile.rotation = (tile.rotation + 90) % 360;
        tile.canvas.style.transform = `rotate(${tile.rotation}deg)`;
        this.checkWin();
    }

    checkWin() {
        const allCorrect = this.tiles.every(t => t.rotation === 0);
        if (allCorrect) {
            setTimeout(() => this.onWin(), 300);
        }
    }

    destroy() {
        super.destroy();
    }
}
