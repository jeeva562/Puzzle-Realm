// Simple Sliding Puzzle - Square boards only!

class SlidingGame extends GameEngine {
    constructor(image, level, callbacks) {
        super(image, level, callbacks);
        this.gridSize = Math.min(3 + level, 6); // 3x3 to 6x6
        this.tiles = [];
        this.emptyPos = null;
    }

    setup() {
        this.createBoard();
        this.createTiles();
        this.shuffle();
    }

    createBoard() {
        // SIMPLE: Square board that fits container
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
        let id = 0;
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                // Last position is empty
                if (y === this.gridSize - 1 && x === this.gridSize - 1) {
                    this.emptyPos = { x, y, id };
                    this.tiles.push({ x, y, correctX: x, correctY: y, id, isEmpty: true });
                } else {
                    this.tiles.push(this.createTile(x, y, id));
                }
                id++;
            }
        }
    }

    createTile(x, y, id) {
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
        tile.onclick = () => this.handleClick(id);

        this.board.appendChild(tile);

        return { x, y, correctX: x, correctY: y, id, isEmpty: false, element: tile };
    }

    shuffle() {
        // Shuffle using valid moves (ensures solvable)
        const moves = this.gridSize * this.gridSize * 30;
        for (let i = 0; i < moves; i++) {
            const neighbors = this.getNeighbors(this.emptyPos);
            if (neighbors.length > 0) {
                const random = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.swap(random, this.emptyPos, false);
            }
        }
    }

    getNeighbors(pos) {
        const neighbors = [];
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dx, dy] of dirs) {
            const nx = pos.x + dx;
            const ny = pos.y + dy;
            if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                neighbors.push(this.tiles.find(t => t.x === nx && t.y === ny));
            }
        }
        return neighbors;
    }

    handleClick(id) {
        const tile = this.tiles.find(t => t.id === id);
        if (!tile || tile.isEmpty) return;

        // Check if adjacent to empty
        const dx = Math.abs(tile.x - this.emptyPos.x);
        const dy = Math.abs(tile.y - this.emptyPos.y);

        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            this.swap(tile, this.emptyPos, true);
            this.checkWin();
        }
    }

    swap(tile1, tile2, animate) {
        // Swap positions
        [tile1.x, tile2.x] = [tile2.x, tile1.x];
        [tile1.y, tile2.y] = [tile2.y, tile1.y];

        // Update visuals
        if (tile1.element) {
            if (animate) tile1.element.style.transition = 'all 0.2s';
            tile1.element.style.gridColumn = tile1.x + 1;
            tile1.element.style.gridRow = tile1.y + 1;
            if (animate) setTimeout(() => tile1.element.style.transition = '', 200);
        }

        if (tile1.isEmpty) this.emptyPos = tile1;
        if (tile2.isEmpty) this.emptyPos = tile2;
    }

    checkWin() {
        const allCorrect = this.tiles.every(t =>
            t.isEmpty || (t.x === t.correctX && t.y === t.correctY)
        );

        if (allCorrect) {
            // Fill empty space
            const empty = this.tiles.find(t => t.isEmpty);
            const finalTile = this.createTile(empty.correctX, empty.correctY, empty.id);
            setTimeout(() => this.onWin(), 300);
        }
    }

    destroy() {
        super.destroy();
    }
}
