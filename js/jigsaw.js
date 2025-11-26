// Jigsaw Puzzle Game - Enhanced
class JigsawGame extends GameEngine {
    constructor(image, level, callbacks) {
        super(image, level, callbacks);
        this.gridSize = Math.min(2 + level, 6);
        this.pieces = [];
        this.boardEl = null;
        this.benchEl = null;
        this.previewEl = null;
        this.progressEl = null;
        this.draggedPiece = null;
        this.showPreview = false;
        this.layout = {};
        this.eventListeners = []; // Store document level event listeners for cleanup
    }

    setup() {
        this.createControls();
        this.createBoard();
        this.createPieces();
        this.updateProgress();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.style.cssText = 'display: flex; gap: 8px; margin-bottom: 6px; justify-content: center; flex-wrap: wrap;';

        const previewBtn = document.createElement('button');
        previewBtn.className = 'btn btn-secondary';
        previewBtn.textContent = '👁️ Preview';
        previewBtn.onclick = () => this.togglePreview();

        this.progressEl = document.createElement('div');
        this.progressEl.style.cssText = 'background: rgba(30,41,59,0.8); padding: 8px 16px; border-radius: 20px; color: #a855f7; font-weight: 600;';

        controls.appendChild(previewBtn);
        controls.appendChild(this.progressEl);
        this.container.appendChild(controls);
    }

    togglePreview() {
        this.showPreview = !this.showPreview;
        if (this.previewEl) {
            this.previewEl.style.opacity = this.showPreview ? '0.3' : '0';
        }
    }

    createBoard() {
        const containerRect = this.container.getBoundingClientRect();

        // Use most of the container while leaving room for controls and bench
        const padding = 16;
        const maxBoardW = Math.max(0, containerRect.width - padding);
        const maxBoardH = Math.max(0, containerRect.height * 0.8); // ~80% for board, rest for bench + controls

        const aspectRatio = (this.image.width && this.image.height)
            ? this.image.width / this.image.height
            : 1;

        let boardW = maxBoardW;
        let boardH = boardW / aspectRatio;
        // If too tall, fit by height instead
        if (boardH > maxBoardH) {
            boardH = maxBoardH;
            boardW = boardH * aspectRatio;
        }

        // Ensure minimum and maximum piece sizes (for touch usability)
        const minPieceSize = 40;
        const maxPieceSize = 120;

        let pieceW = boardW / this.gridSize;
        let pieceH = boardH / this.gridSize;

        if (pieceW < minPieceSize || pieceH < minPieceSize) {
            const scale = minPieceSize / Math.min(pieceW, pieceH);
            boardW *= scale;
            boardH *= scale;
        }

        pieceW = boardW / this.gridSize;
        pieceH = boardH / this.gridSize;

        if (pieceW > maxPieceSize) {
            const scale = maxPieceSize / pieceW;
            boardW *= scale;
            boardH *= scale;
            pieceW = boardW / this.gridSize;
            pieceH = boardH / this.gridSize;
        }

        const board = document.createElement('div');
        board.className = 'jigsaw-board';
        board.style.width = `${boardW}px`;
        board.style.height = `${boardH}px`;

        // Preview overlay
        this.previewEl = document.createElement('div');
        this.previewEl.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url(${this.image.src});
            background-size: cover;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            z-index: 5;
        `;
        board.appendChild(this.previewEl);

        const bench = document.createElement('div');
        bench.className = 'jigsaw-bench';

        this.container.appendChild(board);
        this.container.appendChild(bench);

        this.boardEl = board;
        this.benchEl = bench;
        this.layout = {
            boardW,
            boardH,
            pieceW,
            pieceH,
            boardRect: board.getBoundingClientRect()
        };
    }

    createPieces() {
        const pieces = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                pieces.push({ gx: x, gy: y, id: y * this.gridSize + x });
            }
        }

        shuffleArray(pieces).forEach((piece, i) => {
            const { pieceW, pieceH } = this.layout;
            const canvas = document.createElement('canvas');

            drawImagePortion(
                canvas, this.image,
                piece.gx * (this.image.width / this.gridSize),
                piece.gy * (this.image.height / this.gridSize),
                this.image.width / this.gridSize,
                this.image.height / this.gridSize
            );

            const pieceEl = document.createElement('div');
            pieceEl.className = 'puzzle-piece in-bench';
            pieceEl.dataset.id = piece.id;
            pieceEl.style.width = `${pieceW}px`;
            pieceEl.style.height = `${pieceH}px`;
            pieceEl.style.border = '1px solid rgba(255,255,255,0.3)';
            pieceEl.style.borderRadius = '2px';
            pieceEl.appendChild(canvas);

            this.benchEl.appendChild(pieceEl);

            this.pieces.push({
                ...piece,
                el: pieceEl,
                placed: false,
                correctX: piece.gx * pieceW,
                correctY: piece.gy * pieceH
            });

            this.attachDragListeners(pieceEl);
        });
    }

    attachDragListeners(pieceEl) {
        let offset = { x: 0, y: 0 };

        const handleStart = (e) => {
            e.preventDefault();
            const piece = this.pieces.find(p => p.el === pieceEl);
            if (!piece || piece.placed) return;

            this.draggedPiece = piece;
            const pos = getPointerPosition(e);
            const pieceRect = pieceEl.getBoundingClientRect();

            offset.x = pos.x - pieceRect.left;
            offset.y = pos.y - pieceRect.top;

            pieceEl.classList.remove('in-bench');
            pieceEl.style.position = 'absolute';
            pieceEl.style.zIndex = '1000';
            pieceEl.style.transition = 'none';
            pieceEl.style.boxShadow = '0 8px 20px rgba(0,0,0,0.6)';
            pieceEl.style.transform = 'scale(1.05)';

            const boardRect = this.boardEl.getBoundingClientRect();
            pieceEl.style.left = `${pos.x - boardRect.left - offset.x}px`;
            pieceEl.style.top = `${pos.y - boardRect.top - offset.y}px`;

            this.boardEl.appendChild(pieceEl);
        };

        const handleMove = (e) => {
            if (!this.draggedPiece) return;
            e.preventDefault();

            const pos = getPointerPosition(e);
            const boardRect = this.boardEl.getBoundingClientRect();

            this.draggedPiece.el.style.left = `${pos.x - boardRect.left - offset.x}px`;
            this.draggedPiece.el.style.top = `${pos.y - boardRect.top - offset.y}px`;
        };

        const handleEnd = (e) => {
            if (!this.draggedPiece) return;
            e.preventDefault();

            const piece = this.draggedPiece;
            const pos = getPointerPosition(e);
            const boardRect = this.boardEl.getBoundingClientRect();

            const dropX = pos.x - boardRect.left - offset.x + this.layout.pieceW / 2;
            const dropY = pos.y - boardRect.top - offset.y + this.layout.pieceH / 2;

            const snapThreshold = this.layout.pieceW * 0.4;
            const dist = distance(
                dropX, dropY,
                piece.correctX + this.layout.pieceW / 2,
                piece.correctY + this.layout.pieceH / 2
            );

            if (dist < snapThreshold) {
                // Snap to place with animation
                piece.el.style.transition = 'all 0.2s ease-out';
                piece.el.style.left = `${piece.correctX}px`;
                piece.el.style.top = `${piece.correctY}px`;
                piece.el.style.transform = 'scale(1)';
                piece.el.style.boxShadow = 'none';

                setTimeout(() => {
                    piece.el.classList.add('placed');
                    piece.el.style.border = 'none';
                    piece.placed = true;
                    this.updateProgress();
                    this.checkWin();
                }, 200);
            } else {
                // Return to bench
                piece.el.style.transition = 'all 0.2s ease-out';
                piece.el.classList.add('in-bench');
                piece.el.style.position = 'relative';
                piece.el.style.left = 'auto';
                piece.el.style.top = 'auto';
                piece.el.style.transform = 'scale(1)';
                piece.el.style.boxShadow = 'none';
                this.benchEl.appendChild(piece.el);
            }

            this.draggedPiece = null;
        };

        // Hover effect
        pieceEl.addEventListener('mouseenter', () => {
            if (!this.draggedPiece && !this.pieces.find(p => p.el === pieceEl)?.placed) {
                pieceEl.style.transform = 'scale(1.05)';
                pieceEl.style.boxShadow = '0 4px 12px rgba(168,85,247,0.4)';
            }
        });

        pieceEl.addEventListener('mouseleave', () => {
            if (!this.draggedPiece && !this.pieces.find(p => p.el === pieceEl)?.placed) {
                pieceEl.style.transform = 'scale(1)';
                pieceEl.style.boxShadow = 'none';
            }
        });

        // Add piece-specific listeners
        pieceEl.addEventListener('mousedown', handleStart);
        pieceEl.addEventListener('touchstart', handleStart);

        // Add document-level listeners and store references for cleanup
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);

        // Store references for cleanup to prevent memory leaks
        this.eventListeners.push(
            { type: 'mousemove', handler: handleMove },
            { type: 'touchmove', handler: handleMove, options: { passive: false } },
            { type: 'mouseup', handler: handleEnd },
            { type: 'touchend', handler: handleEnd }
        );
    }

    updateProgress() {
        const placed = this.pieces.filter(p => p.placed).length;
        const total = this.pieces.length;
        const percent = Math.round((placed / total) * 100);
        this.progressEl.textContent = `📊 ${placed}/${total} (${percent}%)`;
    }

    checkWin() {
        if (this.pieces.every(p => p.placed)) {
            setTimeout(() => this.onWin(), 300);
        }
    }

    handleResize() {
        // Clean up before rebuild
        this.cleanupEventListeners();

        // Store piece states
        const states = this.pieces.map(p => ({ id: p.id, placed: p.placed }));

        // Rebuild
        this.container.innerHTML = '';
        this.pieces = [];
        this.setup();

        // Restore states
        states.forEach(state => {
            const piece = this.pieces.find(p => p.id === state.id);
            if (piece && state.placed) {
                piece.el.style.position = 'absolute';
                piece.el.style.left = `${piece.correctX}px`;
                piece.el.style.top = `${piece.correctY}px`;
                piece.el.style.border = 'none';
                piece.el.classList.remove('in-bench');
                piece.el.classList.add('placed');
                piece.placed = true;
                this.boardEl.appendChild(piece.el);
            }
        });

        this.updateProgress();
        if (this.showPreview && this.previewEl) {
            this.previewEl.style.opacity = '0.3';
        }
    }

    // Clean up event listeners to prevent memory leaks
    cleanupEventListeners() {
        this.eventListeners.forEach(({ type, handler, options }) => {
            document.removeEventListener(type, handler, options);
        });
        this.eventListeners = [];
    }

    destroy() {
        super.destroy();
        this.cleanupEventListeners();
    }
}
