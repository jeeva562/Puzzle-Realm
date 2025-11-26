// Sliding Puzzle Game (15-Puzzle Style)
class SlidingGame extends GameEngine {
    constructor(image, level, callbacks) {
        super(image, level, callbacks);
        this.gridSize = Math.min(2 + level, 6); // 3x3 to 6x6
        this.tiles = [];
        this.boardEl = null;
        this.emptyPos = { x: 0, y: 0 };
        this.layout = {};
    }

    setup() {
        this.createBoard();
        this.createTiles();
        this.shuffleTiles();
    }

    createBoard() {
        const containerRect = this.container.getBoundingClientRect();

        // Use most of container, leaving small padding
        const padding = 20;
        const maxBoardW = Math.max(0, containerRect.width - padding);
        const maxBoardH = Math.max(0, containerRect.height - padding);

        const aspectRatio = (this.image.width && this.image.height)
            ? this.image.width / this.image.height
            : 1;

        // Fit board to container while maintaining aspect ratio
        let boardW = maxBoardW;
        let boardH = boardW / aspectRatio;

        // If too tall, fit by height instead
        if (boardH > maxBoardH) {
            boardH = maxBoardH;
            boardW = boardH * aspectRatio;
        }

        // Ensure minimum and maximum tile sizes for usability
        const minTileSize = 50;
        const maxTileSize = 150;

        let tileW = boardW / this.gridSize;
        let tileH = boardH / this.gridSize;

        // Scale up if tiles are too small
        if (tileW < minTileSize || tileH < minTileSize) {
            const scale = minTileSize / Math.min(tileW, tileH);
            boardW *= scale;
            boardH *= scale;
            tileW = boardW / this.gridSize;
            tileH = boardH / this.gridSize;
        }

        // Scale down if tiles are too large
        if (tileW > maxTileSize) {
            const scale = maxTileSize / tileW;
            boardW *= scale;
            boardH *= scale;
            tileW = boardW / this.gridSize;
            tileH = boardH / this.gridSize;
        }

        const board = document.createElement('div');
        board.className = 'sliding-board';
        board.style.width = `${boardW}px`;
        board.style.height = `${boardH}px`;
        board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;

        this.container.appendChild(board);
        this.boardEl = board;
        this.layout = { boardW, boardH, tileW, tileH };
    }

    createTiles() {
        let id = 0;
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                // Last tile is empty
                if (y === this.gridSize - 1 && x === this.gridSize - 1) {
                    this.emptyPos = { x, y };
                    this.tiles.push({
                        id,
                        x,
                        y,
                        isEmpty: true,
                        el: null
                    });
                } else {
                    const canvas = document.createElement('canvas');
                    drawImagePortion(
                        canvas, this.image,
                        x * (this.image.width / this.gridSize),
                        y * (this.image.height / this.gridSize),
                        this.image.width / this.gridSize,
                        this.image.height / this.gridSize
                    );

                    const tile = document.createElement('div');
                    tile.className = 'sliding-tile';
                    tile.dataset.id = id;
                    tile.appendChild(canvas);

                    tile.style.gridColumn = x + 1;
                    tile.style.gridRow = y + 1;

                    this.boardEl.appendChild(tile);

                    this.tiles.push({
                        id,
                        x,
                        y,
                        correctX: x,
                        correctY: y,
                        isEmpty: false,
                        el: tile
                    });

                    tile.addEventListener('click', () => this.handleTileClick(tile));
                }
                id++;
            }
        }
    }

    shuffleTiles() {
        // Perform random valid moves to shuffle (ensures solvability)
        const moves = this.gridSize * this.gridSize * 50; // Plenty of moves to randomize

        for (let i = 0; i < moves; i++) {
            const neighbors = this.getNeighbors(this.emptyPos);
            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.swapTiles(randomNeighbor, this.emptyPos, false); // false = no animation
            }
        }
    }

    getNeighbors(pos) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }, // left
            { x: 1, y: 0 }   // right
        ];

        directions.forEach(dir => {
            const newX = pos.x + dir.x;
            const newY = pos.y + dir.y;
            if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
                neighbors.push({ x: newX, y: newY });
            }
        });

        return neighbors;
    }

    handleTileClick(tileEl) {
        const tile = this.tiles.find(t => t.el === tileEl);
        if (!tile) return;

        // Check if tile is adjacent to empty space
        const isAdjacent =
            (Math.abs(tile.x - this.emptyPos.x) === 1 && tile.y === this.emptyPos.y) ||
            (Math.abs(tile.y - this.emptyPos.y) === 1 && tile.x === this.emptyPos.x);

        if (isAdjacent) {
            this.swapTiles({ x: tile.x, y: tile.y }, this.emptyPos, true); // true = with animation
            this.checkWin();
        }
    }

    swapTiles(pos1, pos2, animate = true) {
        const tile1 = this.tiles.find(t => t.x === pos1.x && t.y === pos1.y);
        const tile2 = this.tiles.find(t => t.x === pos2.x && t.y === pos2.y);

        if (!tile1 || !tile2) return;

        // Swap positions
        [tile1.x, tile2.x] = [tile2.x, tile1.x];
        [tile1.y, tile2.y] = [tile2.y, tile1.y];

        // Update DOM positions
        if (tile1.el) {
            if (animate) tile1.el.style.transition = 'all 0.2s ease-out';
            tile1.el.style.gridColumn = tile1.x + 1;
            tile1.el.style.gridRow = tile1.y + 1;
            if (animate) {
                setTimeout(() => {
                    tile1.el.style.transition = '';
                }, 200);
            }
        }
        if (tile2.el) {
            if (animate) tile2.el.style.transition = 'all 0.2s ease-out';
            tile2.el.style.gridColumn = tile2.x + 1;
            tile2.el.style.gridRow = tile2.y + 1;
            if (animate) {
                setTimeout(() => {
                    tile2.el.style.transition = '';
                }, 200);
            }
        }

        // Update empty position
        if (tile1.isEmpty) {
            this.emptyPos = { x: tile1.x, y: tile1.y };
        } else if (tile2.isEmpty) {
            this.emptyPos = { x: tile2.x, y: tile2.y };
        }
    }

    checkWin() {
        const allCorrect = this.tiles.every(t =>
            t.isEmpty || (t.x === t.correctX && t.y === t.correctY)
        );

        if (allCorrect) {
            // Show complete image by filling empty space
            const emptyTile = this.tiles.find(t => t.isEmpty);
            if (emptyTile) {
                const canvas = document.createElement('canvas');
                drawImagePortion(
                    canvas, this.image,
                    emptyTile.correctX * (this.image.width / this.gridSize),
                    emptyTile.correctY * (this.image.height / this.gridSize),
                    this.image.width / this.gridSize,
                    this.image.height / this.gridSize
                );

                const tile = document.createElement('div');
                tile.className = 'sliding-tile';
                tile.appendChild(canvas);
                tile.style.gridColumn = emptyTile.x + 1;
                tile.style.gridRow = emptyTile.y + 1;
                this.boardEl.appendChild(tile);
            }

            setTimeout(() => this.onWin(), 300);
        }
    }

    handleResize() {
        this.container.innerHTML = '';
        this.tiles = [];
        this.setup();
    }
}
