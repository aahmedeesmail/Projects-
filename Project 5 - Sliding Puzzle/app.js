const gameBoard = document.querySelector(".game-board");

const imageSources = {
    nature: [
        'img/zebra.jpg',
        'img/lion.jpg',
        'img/lotus.jpg',
        'img/sunset.jpg',
    ],
    painting: [
        'img/tsunami.jpg',
        'img/starrynight.jpg',
        'img/monalisa.jpg',
        'img/memory.jpg',
    ],
    places: [
        'img/eiffel.jpg',
        'img/london.jpg',
        'img/castle.jpg',
        'img/liberty.jpg',
    ]
};

const movesDisplay = document.querySelector("#moves");
const timeDisplay = document.querySelector("#time");

let moves = 0;
let time = 0;
let timerId = null;

let settings = {
    rows: 3,
    cols: 3,
    theme: 'nature'
};

let boardState = [];
let emptyTile = {};
let currentImageUrl = '';

function createBoardState() {
    boardState = [];

    let counter = 1;

    for (let r = 0; r < settings.rows; r++) {
        const row = [];

        for (let c = 0; c < settings.cols; c++) {
            row.push(counter++);
        }

        boardState.push(row);
    }

    // آخر خانة تكون فارغة
    boardState[settings.rows - 1][settings.cols - 1] = 0;

    emptyTile = {
        row: settings.rows - 1,
        col: settings.cols - 1
    };
}

function renderBoard() {
    gameBoard.innerHTML = '';

    gameBoard.style.gridTemplateColumns = `repeat(${settings.cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${settings.rows}, 1fr)`;

    const tileWidth = 100 / (settings.cols - 1);
    const tileHeight = 100 / (settings.rows - 1);

    for (let r = 0; r < settings.rows; r++) {
        for (let c = 0; c < settings.cols; c++) {

            const tileValue = boardState[r][c];

            if (tileValue === 0) continue;

            const tile = document.createElement('div');
            tile.classList.add('tile');

            tile.style.width = `${100 / settings.cols}%`;
            tile.style.height = `${100 / settings.rows}%`;
            tile.style.top = `${r * (100 / settings.rows)}%`;
            tile.style.left = `${c * (100 / settings.cols)}%`;

            tile.dataset.value = tileValue;
            tile.style.backgroundImage = `url(${currentImageUrl})`;
            tile.style.backgroundSize = `${settings.cols * 100}% ${settings.rows * 100}%`;

            const originalRow = Math.floor((tileValue - 1) / settings.cols);
            const originalCol = (tileValue - 1) % settings.cols;

            tile.style.backgroundPosition =
                `${originalCol * tileWidth}% ${originalRow * tileHeight}%`;
                const number = document.createElement('span');
                
    number.classList.add('tile-number');
    number.textContent = tileValue;

    tile.appendChild(number);
    tile.addEventListener('click', handleTileClick);

            gameBoard.appendChild(tile);
        }
    }
}

function handleTileClick(event) {
    const clickedValue = parseInt(event.currentTarget.dataset.value);

    let clickedTilePos;

    for (let r = 0; r < settings.rows; r++) {
        const c = boardState[r].indexOf(clickedValue);

        if (c > -1) {
            clickedTilePos = { row: r, col: c };
            break;
        }
    }

    const { row: r1, col: c1 } = clickedTilePos;
    const { row: r2, col: c2 } = emptyTile;

        if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
        moves++;
        updateStats();
        startTimer();
        swapTiles(r1, c1, true);
    }
}

function swapTiles(row, col, animate) {
    const tileValue = boardState[row][col];

    boardState[emptyTile.row][emptyTile.col] = tileValue;
    boardState[row][col] = 0;

    if (animate) {
        const tileElement = document.querySelector(`[data-value='${tileValue}']`);

        tileElement.style.top = `${emptyTile.row * (100 / settings.rows)}%`;
        tileElement.style.left = `${emptyTile.col * (100 / settings.cols)}%`;
    }

    emptyTile = { row, col };

    if (animate) {
    // Debounce win check until after animation
    setTimeout(checkWin, 400);
}
}

function checkWin() {
    let counter = 1;

    for (let r = 0; r < settings.rows; r++) {
        for (let c = 0; c < settings.cols; c++) {

            if (r === settings.rows - 1 && c === settings.cols - 1) {

                if (boardState[r][c] !== 0) return;

            } else {

                if (boardState[r][c] !== counter++) return;

            }
        }
    }

    showWinModal();
}

const winModal = document.querySelector("#win-modal");
const solvedPreview = document.querySelector("#solved-preview");
const finalMoves = document.querySelector("#final-moves");
const finalTime = document.querySelector("#final-time");
const playAgainBtn = document.querySelector("#play-again-btn");

function showWinModal() {
    clearInterval(timerId);
    timerId = null;

    solvedPreview.src = currentImageUrl;
    finalMoves.textContent = moves;
    finalTime.textContent = time;

    winModal.classList.remove("hidden");
    showConfetti();
}

playAgainBtn.addEventListener("click", function () {
    winModal.classList.add("hidden");
    initGame();
});

function showConfetti() {
    const confettiContainer = document.body;
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confettiContainer.appendChild(confetti);

        // Remove confetti after animation
        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}

function shuffleBoard() {
    for (let i = 0; i < 1000; i++) {
        const neighbors = [];
        const { row, col } = emptyTile;

        if (row > 0) neighbors.push({ row: row - 1, col });
        if (row < settings.rows - 1) neighbors.push({ row: row + 1, col });
        if (col > 0) neighbors.push({ row, col: col - 1 });
        if (col < settings.cols - 1) neighbors.push({ row, col: col + 1 });

        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

        swapTiles(randomNeighbor.row, randomNeighbor.col, false);
    }
}

function updateStats() {
    movesDisplay.textContent = moves;
    timeDisplay.textContent = time;
}

function startTimer() {
    if (timerId) return;

    timerId = setInterval(function () {
        time++;
        timeDisplay.textContent = time;
    }, 1000);
}

function initGame() {
    moves = 0;
    time = 0;
    clearInterval(timerId);
    timerId = null;
    updateStats();

    const themeImages = imageSources[settings.theme];
    currentImageUrl = themeImages[Math.floor(Math.random() * themeImages.length)];

    createBoardState();
    shuffleBoard();
    renderBoard();
}

initGame();
console.log("JS Loaded");