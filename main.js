const canvas = document.getElementById('omokBoard');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const saveBtn = document.getElementById('saveBtn');
const shareBtn = document.getElementById('shareBtn');
const recordBtn = document.getElementById('recordBtn');
const generateHighlightBtn = document.getElementById('generateHighlightBtn');
const downloadVideoBtn = document.getElementById('downloadVideoBtn');

// Game Constants
const BOARD_SIZE = 15;
const PADDING = 20; // Padding around the grid
const GRID_SIZE = (canvas.width - 2 * PADDING) / (BOARD_SIZE - 1);
const STONE_RADIUS = GRID_SIZE * 0.4;

// Game State
let board = []; // 0: empty, 1: black, 2: white
let currentPlayer = 1; // 1: Black, 2: White
let isGameActive = true;
let moveHistory = [];

// Recording State
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

// Initialize Game
function initGame() {
    // Initialize empty board
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    currentPlayer = 1;
    isGameActive = true;
    moveHistory = [];
    statusEl.textContent = "Player Black's Turn";
    generateHighlightBtn.style.display = 'none';
    downloadVideoBtn.disabled = true;
    
    // Check URL for shared game
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('game');
    if (sharedData) {
        try {
            loadGameFromCode(sharedData);
        } catch (e) {
            console.error("Failed to load shared game", e);
            drawBoard();
        }
    } else {
        drawBoard();
    }
}

// Draw the board
function drawBoard() {
    // Clear canvas
    ctx.fillStyle = '#e3c07e'; // Wood color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
        // Horizontal lines
        ctx.moveTo(PADDING, PADDING + i * GRID_SIZE);
        ctx.lineTo(canvas.width - PADDING, PADDING + i * GRID_SIZE);

        // Vertical lines
        ctx.moveTo(PADDING + i * GRID_SIZE, PADDING);
        ctx.lineTo(PADDING + i * GRID_SIZE, canvas.height - PADDING);
    }
    ctx.stroke();

    // Draw star points (flower points)
    const starPoints = [3, 7, 11]; // For 15x15 board
    ctx.fillStyle = '#000';
    for (let i of starPoints) {
        for (let j of starPoints) {
            ctx.beginPath();
            ctx.arc(PADDING + i * GRID_SIZE, PADDING + j * GRID_SIZE, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw stones
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== 0) {
                drawStone(x, y, board[y][x]);
            }
        }
    }
    
    // Highlight last move
    if (moveHistory.length > 0) {
        const lastMove = moveHistory[moveHistory.length - 1];
        drawLastMoveMarker(lastMove.x, lastMove.y);
    }
}

function drawStone(x, y, player) {
    const cx = PADDING + x * GRID_SIZE;
    const cy = PADDING + y * GRID_SIZE;

    ctx.beginPath();
    ctx.arc(cx, cy, STONE_RADIUS, 0, Math.PI * 2);
    
    // Gradient for 3D effect
    const gradient = ctx.createRadialGradient(cx - STONE_RADIUS/3, cy - STONE_RADIUS/3, STONE_RADIUS/10, cx, cy, STONE_RADIUS);
    
    if (player === 1) { // Black
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(1, '#000');
    } else { // White
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.stroke(); // Thin outline
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawLastMoveMarker(x, y) {
    const cx = PADDING + x * GRID_SIZE;
    const cy = PADDING + y * GRID_SIZE;
    
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    // Small cross or dot
    ctx.moveTo(cx - 5, cy);
    ctx.lineTo(cx + 5, cy);
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx, cy + 5);
    ctx.stroke();
}

// Handle Mouse Click
canvas.addEventListener('click', (e) => {
    if (!isGameActive) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel coordinates to grid coordinates
    const gridX = Math.round((x - PADDING) / GRID_SIZE);
    const gridY = Math.round((y - PADDING) / GRID_SIZE);

    // Check bounds
    if (gridX < 0 || gridX >= BOARD_SIZE || gridY < 0 || gridY >= BOARD_SIZE) return;

    // Check if empty
    if (board[gridY][gridX] === 0) {
        placeStone(gridX, gridY);
    }
});

function placeStone(x, y) {
    board[y][x] = currentPlayer;
    moveHistory.push({x, y, player: currentPlayer});
    
    drawBoard();
    
    if (checkWin(x, y, currentPlayer)) {
        statusEl.textContent = `Player ${currentPlayer === 1 ? 'Black' : 'White'} Wins!`;
        isGameActive = false;
        generateHighlightBtn.style.display = 'inline-block'; // Show generate button
        if (isRecording) {
            stopRecording();
        }
        return;
    }

    // Switch turn
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    statusEl.textContent = `Player ${currentPlayer === 1 ? 'Black' : 'White'}'s Turn`;
}

// Win Condition Logic
function checkWin(x, y, player) {
    const directions = [
        [1, 0],   // Horizontal
        [0, 1],   // Vertical
        [1, 1],   // Diagonal \
        [1, -1]   // Diagonal /
    ];

    for (let [dx, dy] of directions) {
        let count = 1;
        
        // Check forward
        let nx = x + dx;
        let ny = y + dy;
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
            count++;
            nx += dx;
            ny += dy;
        }
        
        // Check backward
        nx = x - dx;
        ny = y - dy;
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
            count++;
            nx -= dx;
            ny -= dy;
        }

        if (count >= 5) return true;
    }
    return false;
}

// Recording Features
function setupRecorder() {
    const stream = canvas.captureStream(30); // 30 FPS
    try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    } catch (e) {
         console.warn("video/webm not supported, trying video/mp4");
         try {
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
         } catch (e2) {
             console.error("No supported mime type found");
             alert("Screen recording not supported in this browser.");
             return null;
         }
    }

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    
    return mediaRecorder;
}

function startRecording() {
    recordedChunks = [];
    const recorder = setupRecorder();
    if (!recorder) return;
    
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        downloadVideoBtn.disabled = false;
        downloadVideoBtn.textContent = 'Download Live Recording';
        downloadVideoBtn.onclick = () => {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'omok-gameplay.webm';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        };
        recordBtn.textContent = 'Start Recording (Live)';
        recordBtn.classList.remove('recording');
        isRecording = false;
    };
    
    mediaRecorder.start();
    isRecording = true;
    recordBtn.textContent = 'Stop Recording';
    recordBtn.classList.add('recording');
    downloadVideoBtn.disabled = true;
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}

recordBtn.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

// Highlight Generation (Replay)
generateHighlightBtn.addEventListener('click', async () => {
    if (moveHistory.length === 0) return;
    
    const originalBoard = JSON.parse(JSON.stringify(board)); // Deep copy
    const originalHistory = JSON.parse(JSON.stringify(moveHistory));
    
    // Reset board for replay
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    // Temporary clear moveHistory for drawing
    moveHistory = [];
    
    // Start Recording
    recordedChunks = [];
    const recorder = setupRecorder();
    if (!recorder) return;

    generateHighlightBtn.disabled = true;
    generateHighlightBtn.textContent = "Generating...";
    
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Trigger download immediately or enable button
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'omok-highlight.webm';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // Restore State
        board = originalBoard;
        moveHistory = originalHistory;
        drawBoard();
        
        generateHighlightBtn.disabled = false;
        generateHighlightBtn.textContent = "Generate Highlight";
        statusEl.textContent = "Highlight video generated!";
    };
    
    mediaRecorder.start();
    
    // Replay moves
    drawBoard(); // Draw empty board first
    
    const REPLAY_DELAY = 500; // ms per move
    
    for (let i = 0; i < originalHistory.length; i++) {
        await new Promise(resolve => setTimeout(resolve, REPLAY_DELAY));
        
        const move = originalHistory[i];
        board[move.y][move.x] = move.player;
        moveHistory.push(move);
        drawBoard();
    }
    
    // Wait a bit after last move
    await new Promise(resolve => setTimeout(resolve, 1000));
    mediaRecorder.stop();
});


// Save & Share Logic
function getGameState() {
    return JSON.stringify(moveHistory);
}

saveBtn.addEventListener('click', () => {
    const gameState = getGameState();
    const blob = new Blob([gameState], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omok_save.json';
    a.click();
    URL.revokeObjectURL(url);
});

shareBtn.addEventListener('click', () => {
    const gameState = getGameState();
    const encoded = btoa(gameState);
    const url = new URL(window.location.href);
    url.searchParams.set('game', encoded);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
        alert('Game URL copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
        prompt("Copy this URL to share:", url.toString());
    });
});

function loadGameFromCode(encoded) {
    try {
        const json = atob(encoded);
        const history = JSON.parse(json);
        
        moveHistory = [];
        board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
        currentPlayer = 1;
        isGameActive = true;
        
        for (let move of history) {
            board[move.y][move.x] = move.player;
            moveHistory.push(move);
            currentPlayer = move.player === 1 ? 2 : 1; 
        }
        
        if (moveHistory.length > 0) {
            const lastMove = moveHistory[moveHistory.length - 1];
            const lastPlayer = lastMove.player;
             if (checkWin(lastMove.x, lastMove.y, lastPlayer)) {
                statusEl.textContent = `Player ${lastPlayer === 1 ? 'Black' : 'White'} Won!`;
                isGameActive = false;
                generateHighlightBtn.style.display = 'inline-block';
            } else {
                statusEl.textContent = `Player ${currentPlayer === 1 ? 'Black' : 'White'}'s Turn`;
            }
        }
        
        drawBoard();
    } catch (e) {
        console.error("Invalid game data", e);
        alert("Invalid game URL");
    }
}

restartBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to restart?")) {
        window.history.pushState({}, document.title, window.location.pathname);
        initGame();
        drawBoard(); 
    }
});

// Start
initGame();
