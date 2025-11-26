// Mosaic Swap Puzzle Game
class MosaicGame extends GameEngine {
    constructor(image, level, callbacks) {
        super(image, level, callbacks);
        this.gridSize = Math.min(3 + level, 8);
        this.tiles = [];
        this.boardEl = null;
        this.selectedTile = null;
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

        const aspectRatio = (this.image.width && this.image.height)
            ? this.image.width / this.image.height
            : 1;
        let boardW = Math.min(containerW, containerH);
        let boardH = boardW / aspectRatio;

        if (boardH > containerH) {
            boardH = containerH;
            boardW = boardH * aspectRatio;
        }

        const board = document.createElement('div');
        board.className = 'mosaic-board';
        board.style.width = `${boardW}px`;
        board.style.height = `${boardH}px`;
        board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;

        this.container.appendChild(board);
        this.boardEl = board;
        this.layout = { boardW, boardH };
    }

    createTiles() {
        const positions = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                positions.push({ gx: x, gy: y });
            }
        }

        const shuffled = shuffleArray(positions);

        for (let i = 0; i < positions.length; i++) {
            const { gx, gy } = positions[i];
            const { gx: currentX, gy: currentY } = shuffled[i];

            const canvas = document.createElement('canvas');
            drawImagePortion(
                canvas, this.image,
                gx * (this.image.width / this.gridSize),
                gy * (this.image.height / this.gridSize),
                this.image.width / this.gridSize,
                this.image.height / this.gridSize
            );

            const tile = document.createElement('div');
            tile.className = 'mosaic-tile';
            tile.dataset.id = i;
            tile.appendChild(canvas);

            const hint = document.createElement('div');
            hint.className = 'tile-hint';
            hint.textContent = i + 1;
            tile.appendChild(hint);

            tile.style.gridColumn = currentX + 1;
            tile.style.gridRow = currentY + 1;

            this.boardEl.appendChild(tile);

            this.tiles.push({
                el: tile,
                gx,
                gy,
                currentX,
                currentY
            });

            tile.addEventListener('click', () => this.handleTileClick(tile));
        }
    }

    handleTileClick(tileEl) {
        const tile = this.tiles.find(t => t.el === tileEl);
        if (!tile) return;

        if (!this.selectedTile) {
            this.selectedTile = tile;
            tile.el.classList.add('selected');
        } else {
            if (this.selectedTile === tile) {
                tile.el.classList.remove('selected');
                this.selectedTile = null;
            } else {
                this.swapTiles(this.selectedTile, tile);
                this.selectedTile.el.classList.remove('selected');
                this.selectedTile = null;
                this.checkWin();
            }
        }
    }

    swapTiles(tile1, tile2) {
        [tile1.currentX, tile2.currentX] = [tile2.currentX, tile1.currentX];
        [tile1.currentY, tile2.currentY] = [tile2.currentY, tile1.currentY];

        tile1.el.style.gridColumn = tile1.currentX + 1;
        tile1.el.style.gridRow = tile1.currentY + 1;
        tile2.el.style.gridColumn = tile2.currentX + 1;
        tile2.el.style.gridRow = tile2.currentY + 1;
    }

    checkWin() {
        const allCorrect = this.tiles.every(t => t.currentX === t.gx && t.currentY === t.gy);
        if (allCorrect) {
            this.tiles.forEach(t => t.el.classList.add('correct'));
            this.onWin();
        }
    }

    handleResize() {
        this.container.innerHTML = '';
        this.tiles = [];
        this.selectedTile = null;
        this.setup();
    }
}
