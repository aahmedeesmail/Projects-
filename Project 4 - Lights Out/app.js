// 1. Get the Game Board Container
const gameBoard = document.getElementById('game-board');
const moveDisplay = document.getElementById('move-count');
const timeDisplay = document.getElementById('time-elapsed'); 
const winModal = document.getElementById('win-modal');
const finalMoves = document.getElementById('final-moves');
const finalTime = document.getElementById('final-time');
const playAgainBtn = document.getElementById('play-again-btn');
// Audio Assets
const toggleSound = new Audio('audio/switch-1.mp3');
const winSound = new Audio('audio/bell-ring.mp3');

let timeElapsed = 0;   // Stores the actual seconds
let gameInterval = null; // Stores the interval ID so we can stop it
let boardState = []; // Initialized as empty
let moves = 0;



function createBoard() {
    // Clear the board first (removes placeholders)
    gameBoard.innerHTML = '';

    // Loop through each row
    for (let r = 0; r < boardState.length; r++) {
        // Loop through each column in that row
        for (let c = 0; c < boardState[r].length; c++) {
            // Create a new cell element
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Set the initial light state based on boardState
            if (boardState[r][c] === 1) {
                cell.classList.add('light-on');
                cell.innerText = '💡'; // Optional: add an icon
            } else {
                cell.classList.add('light-off');
                cell.innerText = '';
            }

            // Store coordinates in data attributes for later use
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Append the cell to the game board
            gameBoard.appendChild(cell);
        }
    }
}

for (let r = 0; r < boardState.length; r++) {
    // Outer loop: iterates through each row (r)
    
    for (let c = 0; c < boardState[r].length; c++) {
        // Inner loop: iterates through each element/column (c) in that row
        
        let state = boardState[r][c];
        
        // Logging the row index, column index, and the value (0 or 1)
        console.log(`Row: ${r}, Column: ${c}, State: ${state}`);
    }
}

// Game Constants (Add this at the very top of your app.js)
const GRID_SIZE = 5;




function toggleLights(row, col) {
    const deltas = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]];
    
    // Play the sound here!
    toggleSound.currentTime = 0; 
    toggleSound.play();

    deltas.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
            boardState[newRow][newCol] = 1 - boardState[newRow][newCol];
        }
    });
}

function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    // Play toggle sound
    toggleSound.currentTime = 0; // Reset to start in case of rapid clicking
    toggleSound.play();

    toggleLights(row, col);
    moves++;
    moveDisplay.innerText = moves;
    
    renderBoard();
    checkWinCondition();
}

function checkWinCondition() {
    const isWin = boardState.every(row => row.every(cell => cell === 0));

    if (isWin) {
        // 1. Stop the clock
        stopTimer();
        
        // 2. Play the victory sound
        winSound.play();

        // 3. Update the text in the modal
        finalMoves.innerText = moves;
        finalTime.innerText = timeElapsed + "s";

        // 4. Show the modal (set display to flex to center it)
        winModal.style.display = "flex";
    }
}

function renderBoard() {
    gameBoard.innerHTML = "";

    for (let r = 0; r < boardState.length; r++) {
        for (let c = 0; c < boardState[r].length; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if (boardState[r][c] === 1) {
                cell.classList.add("light-on");
                cell.innerText = "💡";
            } else {
                cell.classList.add("light-off");
                cell.innerText = "";
            }

            cell.dataset.row = r;
            cell.dataset.col = c;


            cell.addEventListener('click', handleCellClick);
            // ---------------------

            gameBoard.appendChild(cell);
        }
    }
}

function createBoard() {
    // Create a solved board (all zeros)
    let board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

    // Simulate a number of random presses to create the puzzle
    const presses = Math.floor(Math.random() * 10) + 5; // 5 to 14 presses
    for (let i = 0; i < presses; i++) {
        const randomRow = Math.floor(Math.random() * GRID_SIZE);
        const randomCol = Math.floor(Math.random() * GRID_SIZE);
        // Use a temporary board for toggling to avoid modifying the one we are iterating over
        const tempBoardState = board.map(row => [...row]);
        boardState = tempBoardState; // Temporarily set global state for toggleLights
        toggleLights(randomRow, randomCol);
        board = boardState;
    }
    boardState = board;
}
function startGame() {
    // Hide the modal at the start
    winModal.style.display = "none";

    moves = 0;
    moveDisplay.innerText = moves;
    timeElapsed = 0;
    timeDisplay.innerText = "0s";

    createBoard();
    renderBoard();
    startTimer();
}

function stopTimer() {
    // Clear the interval if one is already running
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

function startTimer() {
    // 1. Prevent duplicates by stopping any existing timer first
    stopTimer();

    // 2. Start a new interval that runs every 1000ms (1 second)
    gameInterval = setInterval(() => {
        timeElapsed++;
        
        // Update the display (Format as "0s" or "00:00" based on your preference)
        timeDisplay.innerText = timeElapsed + "s";
    }, 1000);
}

playAgainBtn.addEventListener('click', () => {
    // Optional: Add a little 'click' sound here if you like!
    startGame();
});

// Select the Hint elements
const hintBtn = document.getElementById('hint-btn');
const hintModal = document.getElementById('hint-modal');
const closeHintBtn = document.getElementById('close-hint-btn');

// Show the hint modal by adding the 'show' class
hintBtn.addEventListener('click', () => {
    hintModal.classList.add('show');
});

// Hide the hint modal by removing the 'show' class
closeHintBtn.addEventListener('click', () => {
    hintModal.classList.remove('show');
});


// Get the Restart button and link it to startGame
const restartBtn = document.getElementById('restart-btn');

// Add the click event listener
restartBtn.addEventListener('click', () => {startGame();
});


restartBtn.addEventListener('click', () => {
    // Play the toggle sound for feedback when clicking restart
    toggleSound.play(); 
    startGame();
});


renderBoard();
createBoard();
startGame();

playAgainBtn.addEventListener('click', startGame);

