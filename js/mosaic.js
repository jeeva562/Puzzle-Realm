// Mosaic Swap Puzzle - Square board!

class MosaicGame extends GameEngine {
    constructor(image, level, callbacks) {
        super(image, level, callbacks);
        this.gridSize = Math.min(3 + level, 8);
        this.tiles = [];
        this.selected = null;
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
        const positions = [];
        let id = 0;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                positions.push({ x, y, id: id++ });
            }
        }

        const shuffled = shuffleArray(positions);

        for (let i = 0; i < positions.length; i++) {
            const correct = positions[i];
            const current = shuffled[i];

            const canvas = document.createElement('canvas');
            const tileSize = this.image.width / this.gridSize;

            drawImagePortion(
                canvas, this.image,
                correct.x * tileSize, correct.y * tileSize,
                tileSize, tileSize
            );

            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.appendChild(canvas);

            const number = document.createElement('div');
            number.className = 'tile-number';
            number.textContent = correct.id + 1;
            tile.appendChild(number);

            tile.style.gridColumn = current.x + 1;
            tile.style.gridRow = current.y + 1;
            tile.onclick = () => this.handleClick(i);

            this.board.appendChild(tile);

            this.tiles.push({
                element: tile,
                correctX: correct.x,
                correctY: correct.y,
                currentX: current.x,
                currentY: current.y,
                id: i
            });
        }
    }

    handleClick(id) {
        const tile = this.tiles[id];

        if (!this.selected) {
            this.selected = tile;
            tile.element.classList.add('selected');
        } else {
            if (this.selected === tile) {
                tile.element.classList.remove('selected');
                this.selected = null;
            } else {
                this.swap(this.selected, tile);
                this.selected.element.classList.remove('selected');
                this.selected = null;
                this.checkWin();
            }
        }
    }

    swap(tile1, tile2) {
        [tile1.currentX, tile2.currentX] = [tile2.currentX, tile1.currentX];
        [tile1.currentY, tile2.currentY] = [tile2.currentY, tile1.currentY];

        tile1.element.style.gridColumn = tile1.currentX + 1;
        tile1.element.style.gridRow = tile1.currentY + 1;
        tile2.element.style.gridColumn = tile2.currentX + 1;
        tile2.element.style.gridRow = tile2.currentY + 1;
    }

    checkWin() {
        const allCorrect = this.tiles.every(t =>
            t.currentX === t.correctX && t.currentY === t.correctY
        );

        if (allCorrect) {
            setTimeout(() => this.onWin(), 300);
        }
    }

    destroy() {
        super.destroy();
    }
}
