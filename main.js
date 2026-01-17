/**
 * 오목 (Omok/Gomoku) - Five in a Row Game
 * 
 * Features:
 * - Traditional 15x15 Omok board
 * - Game recording and replay
 * - Highlight video generation
 * - Save to local file / Share via URL
 */

// ===========================================
// GAME CONFIGURATION
// ===========================================
const CONFIG = {
    BOARD_SIZE: 15,          // 15x15 grid
    CELL_SIZE: 36,           // Size of each cell in pixels
    STONE_RADIUS: 15,        // Radius of stones
    BOARD_PADDING: 20,       // Padding around the board
    WIN_COUNT: 5,            // Number in a row to win
    BOARD_COLOR: '#DEB887',  // Wood color
    LINE_COLOR: '#8B4513',   // Dark brown for lines
    STAR_POINTS: [           // Traditional star points (천원)
        [3, 3], [3, 7], [3, 11],
        [7, 3], [7, 7], [7, 11],
        [11, 3], [11, 7], [11, 11]
    ]
};

// ===========================================
// GAME STATE
// ===========================================
class OmokGame {
    constructor() {
        this.canvas = document.getElementById('omok-board');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        const boardPixelSize = (CONFIG.BOARD_SIZE - 1) * CONFIG.CELL_SIZE + CONFIG.BOARD_PADDING * 2;
        this.canvas.width = boardPixelSize;
        this.canvas.height = boardPixelSize;
        
        // Game state
        this.board = [];
        this.currentPlayer = 1; // 1 = Black, 2 = White
        this.gameOver = false;
        this.winner = null;
        this.winningStones = [];
        
        // Move history for recording
        this.moveHistory = [];
        
        // Replay state
        this.isReplaying = false;
        this.replayTimeout = null;
        
        // Recording state
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        // Initialize
        this.init();
        this.bindEvents();
        this.checkURLForSharedGame();
    }
    
    init() {
        // Initialize empty board
        this.board = Array(CONFIG.BOARD_SIZE).fill(null).map(() => 
            Array(CONFIG.BOARD_SIZE).fill(0)
        );
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winner = null;
        this.winningStones = [];
        this.moveHistory = [];
        
        this.drawBoard();
        this.updateUI();
    }
    
    // ===========================================
    // DRAWING FUNCTIONS
    // ===========================================
    drawBoard() {
        const ctx = this.ctx;
        const padding = CONFIG.BOARD_PADDING;
        const cellSize = CONFIG.CELL_SIZE;
        
        // Clear canvas
        ctx.fillStyle = CONFIG.BOARD_COLOR;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add wood grain texture
        this.drawWoodGrain();
        
        // Draw grid lines
        ctx.strokeStyle = CONFIG.LINE_COLOR;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < CONFIG.BOARD_SIZE; i++) {
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(padding, padding + i * cellSize);
            ctx.lineTo(padding + (CONFIG.BOARD_SIZE - 1) * cellSize, padding + i * cellSize);
            ctx.stroke();
            
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(padding + i * cellSize, padding);
            ctx.lineTo(padding + i * cellSize, padding + (CONFIG.BOARD_SIZE - 1) * cellSize);
            ctx.stroke();
        }
        
        // Draw star points (천원)
        ctx.fillStyle = CONFIG.LINE_COLOR;
        for (const [row, col] of CONFIG.STAR_POINTS) {
            const x = padding + col * cellSize;
            const y = padding + row * cellSize;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw all stones
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                if (this.board[row][col] !== 0) {
                    this.drawStone(row, col, this.board[row][col]);
                }
            }
        }
        
        // Highlight winning stones
        if (this.winningStones.length > 0) {
            this.highlightWinningStones();
        }
        
        // Draw last move indicator
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            this.drawLastMoveIndicator(lastMove.row, lastMove.col);
        }
    }
    
    drawWoodGrain() {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.1;
        
        for (let i = 0; i < 50; i++) {
            const y = Math.random() * this.canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(
                this.canvas.width * 0.3, y + Math.random() * 10 - 5,
                this.canvas.width * 0.7, y + Math.random() * 10 - 5,
                this.canvas.width, y + Math.random() * 20 - 10
            );
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = Math.random() * 2 + 0.5;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawStone(row, col, player, animated = false) {
        const ctx = this.ctx;
        const padding = CONFIG.BOARD_PADDING;
        const cellSize = CONFIG.CELL_SIZE;
        const x = padding + col * cellSize;
        const y = padding + row * cellSize;
        const radius = CONFIG.STONE_RADIUS;
        
        // Stone shadow
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        
        // Stone base
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, radius * 0.1,
            x, y, radius
        );
        
        if (player === 1) { // Black stone
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(0.3, '#333');
            gradient.addColorStop(1, '#000');
        } else { // White stone
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.3, '#f5f5f5');
            gradient.addColorStop(1, '#ddd');
        }
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add subtle highlight
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = player === 1 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
    
    drawLastMoveIndicator(row, col) {
        const ctx = this.ctx;
        const padding = CONFIG.BOARD_PADDING;
        const cellSize = CONFIG.CELL_SIZE;
        const x = padding + col * cellSize;
        const y = padding + row * cellSize;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = this.board[row][col] === 1 ? '#ff6b6b' : '#e74c3c';
        ctx.fill();
    }
    
    highlightWinningStones() {
        const ctx = this.ctx;
        const padding = CONFIG.BOARD_PADDING;
        const cellSize = CONFIG.CELL_SIZE;
        
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        
        for (const [row, col] of this.winningStones) {
            const x = padding + col * cellSize;
            const y = padding + row * cellSize;
            
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.STONE_RADIUS + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // ===========================================
    // GAME LOGIC
    // ===========================================
    getIntersection(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const col = Math.round((x - CONFIG.BOARD_PADDING) / CONFIG.CELL_SIZE);
        const row = Math.round((y - CONFIG.BOARD_PADDING) / CONFIG.CELL_SIZE);
        
        if (row >= 0 && row < CONFIG.BOARD_SIZE && col >= 0 && col < CONFIG.BOARD_SIZE) {
            return { row, col };
        }
        return null;
    }
    
    placeStone(row, col) {
        if (this.gameOver || this.isReplaying) return false;
        if (this.board[row][col] !== 0) return false;
        
        // Place the stone
        this.board[row][col] = this.currentPlayer;
        
        // Record the move
        this.moveHistory.push({
            player: this.currentPlayer,
            row,
            col,
            moveNumber: this.moveHistory.length + 1
        });
        
        // Check for win
        const winResult = this.checkWin(row, col);
        if (winResult) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.winningStones = winResult;
            this.drawBoard();
            this.showWinModal();
            this.updateUI();
            return true;
        }
        
        // Check for draw (board full)
        if (this.moveHistory.length === CONFIG.BOARD_SIZE * CONFIG.BOARD_SIZE) {
            this.gameOver = true;
            this.showDrawModal();
            this.updateUI();
            return true;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        this.drawBoard();
        this.updateUI();
        return true;
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]], // Diagonal \
            [[1, -1], [-1, 1]]  // Diagonal /
        ];
        
        for (const [dir1, dir2] of directions) {
            const stones = [[row, col]];
            
            // Check in first direction
            let r = row + dir1[0];
            let c = col + dir1[1];
            while (r >= 0 && r < CONFIG.BOARD_SIZE && c >= 0 && c < CONFIG.BOARD_SIZE && this.board[r][c] === player) {
                stones.push([r, c]);
                r += dir1[0];
                c += dir1[1];
            }
            
            // Check in opposite direction
            r = row + dir2[0];
            c = col + dir2[1];
            while (r >= 0 && r < CONFIG.BOARD_SIZE && c >= 0 && c < CONFIG.BOARD_SIZE && this.board[r][c] === player) {
                stones.push([r, c]);
                r += dir2[0];
                c += dir2[1];
            }
            
            if (stones.length >= CONFIG.WIN_COUNT) {
                return stones;
            }
        }
        
        return null;
    }
    
    undoMove() {
        if (this.moveHistory.length === 0 || this.isReplaying) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = 0;
        this.currentPlayer = lastMove.player;
        this.gameOver = false;
        this.winner = null;
        this.winningStones = [];
        
        this.drawBoard();
        this.updateUI();
    }
    
    // ===========================================
    // UI UPDATES
    // ===========================================
    updateUI() {
        // Update turn indicator
        const turnText = document.getElementById('current-turn');
        turnText.textContent = this.currentPlayer === 1 ? '흑돌 (Black)' : '백돌 (White)';
        
        // Update move count
        document.getElementById('move-count').textContent = this.moveHistory.length;
        
        // Update move history display
        this.updateMoveHistory();
    }
    
    updateMoveHistory() {
        const container = document.getElementById('move-history');
        container.innerHTML = '';
        
        for (const move of this.moveHistory) {
            const moveEl = document.createElement('span');
            moveEl.className = `move-item ${move.player === 1 ? 'black' : 'white'}`;
            
            const colLetter = String.fromCharCode(65 + move.col);
            const rowNumber = CONFIG.BOARD_SIZE - move.row;
            
            moveEl.innerHTML = `
                <span class="move-number">${move.moveNumber}.</span>
                ${colLetter}${rowNumber}
            `;
            container.appendChild(moveEl);
        }
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    showWinModal() {
        const modal = document.getElementById('win-modal');
        const winnerStone = document.getElementById('winner-stone');
        const winnerText = document.getElementById('winner-text');
        
        winnerStone.className = `winner-stone ${this.winner === 1 ? 'black' : 'white'}`;
        winnerText.textContent = this.winner === 1 ? '흑돌 승리!' : '백돌 승리!';
        
        modal.classList.add('active');
    }
    
    showDrawModal() {
        const modal = document.getElementById('win-modal');
        const winnerStone = document.getElementById('winner-stone');
        const winnerText = document.getElementById('winner-text');
        
        winnerStone.style.display = 'none';
        winnerText.textContent = '무승부!';
        
        modal.classList.add('active');
    }
    
    hideWinModal() {
        const modal = document.getElementById('win-modal');
        modal.classList.remove('active');
        
        const winnerStone = document.getElementById('winner-stone');
        winnerStone.style.display = 'block';
    }
    
    // ===========================================
    // REPLAY FUNCTIONALITY
    // ===========================================
    async startReplay(speed = 1000, forRecording = false) {
        if (this.moveHistory.length === 0) {
            alert('기록된 게임이 없습니다.');
            return;
        }
        
        // Store current state
        const savedHistory = [...this.moveHistory];
        const savedWinner = this.winner;
        const savedWinningStones = [...this.winningStones];
        
        this.hideWinModal();
        
        // Reset board for replay
        this.board = Array(CONFIG.BOARD_SIZE).fill(null).map(() => 
            Array(CONFIG.BOARD_SIZE).fill(0)
        );
        this.moveHistory = [];
        this.winningStones = [];
        this.isReplaying = true;
        
        if (!forRecording) {
            const overlay = document.getElementById('replay-overlay');
            overlay.classList.add('active');
        }
        
        this.drawBoard();
        
        // Replay each move
        for (let i = 0; i < savedHistory.length; i++) {
            if (!this.isReplaying) break;
            
            const move = savedHistory[i];
            
            await new Promise(resolve => {
                this.replayTimeout = setTimeout(() => {
                    this.board[move.row][move.col] = move.player;
                    this.moveHistory.push(move);
                    
                    // Check if this is the last move and there was a winner
                    if (i === savedHistory.length - 1 && savedWinner) {
                        this.winningStones = savedWinningStones;
                    }
                    
                    this.drawBoard();
                    this.updateUI();
                    
                    if (!forRecording) {
                        document.getElementById('replay-move-info').textContent = 
                            `${i + 1} / ${savedHistory.length}`;
                    }
                    
                    resolve();
                }, i === 0 ? 500 : speed);
            });
        }
        
        // Restore full state
        this.moveHistory = savedHistory;
        this.winner = savedWinner;
        this.winningStones = savedWinningStones;
        this.gameOver = savedWinner !== null;
        this.currentPlayer = savedHistory.length % 2 === 0 ? 1 : 2;
        this.isReplaying = false;
        
        if (!forRecording) {
            const overlay = document.getElementById('replay-overlay');
            overlay.classList.remove('active');
        }
        
        this.drawBoard();
        this.updateUI();
        
        return true;
    }
    
    stopReplay() {
        this.isReplaying = false;
        if (this.replayTimeout) {
            clearTimeout(this.replayTimeout);
            this.replayTimeout = null;
        }
        
        const overlay = document.getElementById('replay-overlay');
        overlay.classList.remove('active');
    }
    
    // ===========================================
    // VIDEO RECORDING
    // ===========================================
    async recordHighlightVideo() {
        if (this.moveHistory.length === 0) {
            alert('기록된 게임이 없습니다.');
            return;
        }
        
        const speed = parseInt(document.getElementById('replay-speed').value) || 500;
        
        // Show recording modal
        const recordingModal = document.getElementById('recording-modal');
        const progressBar = document.getElementById('recording-progress');
        const statusText = document.getElementById('recording-status');
        recordingModal.classList.add('active');
        
        try {
            // Create a temporary canvas for recording
            const recordingCanvas = document.createElement('canvas');
            recordingCanvas.width = this.canvas.width;
            recordingCanvas.height = this.canvas.height;
            const recordingCtx = recordingCanvas.getContext('2d');
            
            // Setup MediaRecorder
            const stream = recordingCanvas.captureStream(30);
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
                ? 'video/webm;codecs=vp9' 
                : 'video/webm';
            
            this.mediaRecorder = new MediaRecorder(stream, { 
                mimeType,
                videoBitsPerSecond: 2500000
            });
            
            this.recordedChunks = [];
            this.isRecording = true;
            
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };
            
            this.mediaRecorder.start(100);
            
            // Store current state
            const savedHistory = [...this.moveHistory];
            const savedWinner = this.winner;
            const savedWinningStones = [...this.winningStones];
            const savedBoard = this.board.map(row => [...row]);
            
            // Reset for recording
            this.board = Array(CONFIG.BOARD_SIZE).fill(null).map(() => 
                Array(CONFIG.BOARD_SIZE).fill(0)
            );
            this.moveHistory = [];
            this.winningStones = [];
            
            statusText.textContent = '게임을 녹화하는 중...';
            
            // Draw initial empty board
            this.drawBoard();
            recordingCtx.drawImage(this.canvas, 0, 0);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Record each move
            for (let i = 0; i < savedHistory.length; i++) {
                if (!this.isRecording) break;
                
                const move = savedHistory[i];
                const progress = ((i + 1) / savedHistory.length) * 100;
                progressBar.style.width = `${progress}%`;
                statusText.textContent = `수 ${i + 1} / ${savedHistory.length} 녹화 중...`;
                
                this.board[move.row][move.col] = move.player;
                this.moveHistory.push(move);
                
                // Highlight winning stones on last move
                if (i === savedHistory.length - 1 && savedWinner) {
                    this.winningStones = savedWinningStones;
                }
                
                this.drawBoard();
                recordingCtx.drawImage(this.canvas, 0, 0);
                
                await new Promise(resolve => setTimeout(resolve, speed));
            }
            
            // Hold final frame
            statusText.textContent = '마무리 중...';
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Stop recording
            this.mediaRecorder.stop();
            
            await new Promise(resolve => {
                this.mediaRecorder.onstop = resolve;
            });
            
            // Create and download video
            const blob = new Blob(this.recordedChunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `omok-highlight-${new Date().toISOString().slice(0, 10)}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Restore state
            this.board = savedBoard;
            this.moveHistory = savedHistory;
            this.winner = savedWinner;
            this.winningStones = savedWinningStones;
            this.gameOver = savedWinner !== null;
            
            this.drawBoard();
            this.updateUI();
            
            statusText.textContent = '완료!';
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error('Recording failed:', error);
            alert('영상 녹화에 실패했습니다. 브라우저가 MediaRecorder를 지원하지 않을 수 있습니다.');
        } finally {
            this.isRecording = false;
            recordingModal.classList.remove('active');
            progressBar.style.width = '0%';
        }
    }
    
    cancelRecording() {
        this.isRecording = false;
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }
    
    // ===========================================
    // SAVE & SHARE
    // ===========================================
    saveToLocal() {
        if (this.moveHistory.length === 0) {
            alert('저장할 게임이 없습니다.');
            return;
        }
        
        const gameData = {
            version: '1.0',
            date: new Date().toISOString(),
            boardSize: CONFIG.BOARD_SIZE,
            moves: this.moveHistory,
            winner: this.winner,
            winningStones: this.winningStones
        };
        
        const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `omok-game-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    loadFromLocal(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const gameData = JSON.parse(e.target.result);
                this.loadGameData(gameData);
            } catch (error) {
                alert('파일을 불러올 수 없습니다. 올바른 게임 파일인지 확인해주세요.');
            }
        };
        reader.readAsText(file);
    }
    
    loadGameData(gameData) {
        // Reset board
        this.board = Array(CONFIG.BOARD_SIZE).fill(null).map(() => 
            Array(CONFIG.BOARD_SIZE).fill(0)
        );
        
        // Replay all moves
        this.moveHistory = [];
        for (const move of gameData.moves) {
            this.board[move.row][move.col] = move.player;
            this.moveHistory.push(move);
        }
        
        this.winner = gameData.winner;
        this.winningStones = gameData.winningStones || [];
        this.gameOver = this.winner !== null;
        this.currentPlayer = this.moveHistory.length % 2 === 0 ? 1 : 2;
        
        this.drawBoard();
        this.updateUI();
    }
    
    generateShareURL() {
        if (this.moveHistory.length === 0) {
            alert('공유할 게임이 없습니다.');
            return;
        }
        
        // Encode moves as compact string
        // Format: each move as 2 hex digits (row) + 2 hex digits (col)
        let moveString = '';
        for (const move of this.moveHistory) {
            moveString += move.row.toString(16).padStart(2, '0');
            moveString += move.col.toString(16).padStart(2, '0');
        }
        
        // Create URL
        const url = new URL(window.location.href.split('?')[0]);
        url.searchParams.set('game', moveString);
        
        // Copy to clipboard
        navigator.clipboard.writeText(url.toString()).then(() => {
            alert('URL이 클립보드에 복사되었습니다!\n\n' + url.toString());
        }).catch(() => {
            // Fallback for browsers that don't support clipboard API
            prompt('아래 URL을 복사하세요:', url.toString());
        });
    }
    
    checkURLForSharedGame() {
        const urlParams = new URLSearchParams(window.location.search);
        const gameString = urlParams.get('game');
        
        if (gameString) {
            try {
                const moves = [];
                for (let i = 0; i < gameString.length; i += 4) {
                    const row = parseInt(gameString.substr(i, 2), 16);
                    const col = parseInt(gameString.substr(i + 2, 2), 16);
                    const player = (i / 4) % 2 === 0 ? 1 : 2;
                    moves.push({
                        player,
                        row,
                        col,
                        moveNumber: (i / 4) + 1
                    });
                }
                
                const gameData = {
                    moves,
                    winner: null,
                    winningStones: []
                };
                
                // Check if the last move is a winning move
                this.board = Array(CONFIG.BOARD_SIZE).fill(null).map(() => 
                    Array(CONFIG.BOARD_SIZE).fill(0)
                );
                
                for (const move of moves) {
                    this.board[move.row][move.col] = move.player;
                }
                
                if (moves.length > 0) {
                    const lastMove = moves[moves.length - 1];
                    const winResult = this.checkWin(lastMove.row, lastMove.col);
                    if (winResult) {
                        gameData.winner = lastMove.player;
                        gameData.winningStones = winResult;
                    }
                }
                
                this.loadGameData(gameData);
                
                // Clear URL parameter
                window.history.replaceState({}, document.title, window.location.pathname);
                
            } catch (error) {
                console.error('Failed to load shared game:', error);
            }
        }
    }
    
    // ===========================================
    // EVENT BINDINGS
    // ===========================================
    bindEvents() {
        // Canvas click
        this.canvas.addEventListener('click', (e) => {
            const intersection = this.getIntersection(e.clientX, e.clientY);
            if (intersection) {
                this.placeStone(intersection.row, intersection.col);
            }
        });
        
        // Hover effect
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameOver || this.isReplaying) return;
            
            const intersection = this.getIntersection(e.clientX, e.clientY);
            if (intersection && this.board[intersection.row][intersection.col] === 0) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        });
        
        // Control buttons
        document.getElementById('new-game-btn').addEventListener('click', () => {
            if (this.moveHistory.length > 0 && !confirm('새 게임을 시작하시겠습니까? 현재 게임은 저장되지 않습니다.')) {
                return;
            }
            this.init();
            this.hideWinModal();
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });
        
        // Replay button
        document.getElementById('replay-btn').addEventListener('click', () => {
            const speed = parseInt(document.getElementById('replay-speed').value) || 1000;
            this.startReplay(speed);
        });
        
        document.getElementById('stop-replay-btn').addEventListener('click', () => {
            this.stopReplay();
        });
        
        // Record video button
        document.getElementById('record-video-btn').addEventListener('click', () => {
            this.recordHighlightVideo();
        });
        
        document.getElementById('cancel-recording-btn').addEventListener('click', () => {
            this.cancelRecording();
        });
        
        // Save/Load/Share buttons
        document.getElementById('save-local-btn').addEventListener('click', () => {
            this.saveToLocal();
        });
        
        document.getElementById('load-local-btn').addEventListener('click', () => {
            document.getElementById('load-file-input').click();
        });
        
        document.getElementById('load-file-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadFromLocal(e.target.files[0]);
            }
        });
        
        document.getElementById('share-url-btn').addEventListener('click', () => {
            this.generateShareURL();
        });
        
        // Modal buttons
        document.getElementById('modal-new-game-btn').addEventListener('click', () => {
            this.init();
            this.hideWinModal();
        });
        
        document.getElementById('modal-replay-btn').addEventListener('click', () => {
            this.hideWinModal();
            const speed = parseInt(document.getElementById('replay-speed').value) || 1000;
            this.startReplay(speed);
        });
        
        document.getElementById('modal-record-btn').addEventListener('click', () => {
            this.hideWinModal();
            this.recordHighlightVideo();
        });
        
        document.getElementById('modal-share-btn').addEventListener('click', () => {
            this.generateShareURL();
        });
        
        // Close modal on background click
        document.getElementById('win-modal').addEventListener('click', (e) => {
            if (e.target.id === 'win-modal') {
                this.hideWinModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undoMove();
            }
            if (e.key === 'Escape') {
                this.hideWinModal();
                if (this.isReplaying) {
                    this.stopReplay();
                }
            }
        });
    }
}

// ===========================================
// INITIALIZE GAME
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    window.omokGame = new OmokGame();
});
