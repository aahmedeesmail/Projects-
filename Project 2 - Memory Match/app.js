// 1. Get the game board container from the HTML
const gameBoard = document.querySelector('.game-board');

// 2. Define the emoji sets
const emojiSets = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    fruits: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝'],
    food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧇', '🍩', '🍪'],
    plants: ['🌵', '🎄', '🍁', '🌴', '🌱', '🌷', '🌼', '🍀'],
    smileys: ['😀', '😂', '😍', '😎', '😢', '😡', '😱', '🥳'],
    sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '⛳', '🥊']
};

// Modal Elements
const startModal = document.getElementById('start-modal');
const endModal = document.getElementById('end-modal');
const startGameBtn = document.getElementById('start-game-btn');
const playAgainBtn = document.getElementById('play-again-btn');

// Modal Score Spans
const highScoreStartSpan = document.getElementById('high-score-start');
const finalScoreSpan = document.getElementById('final-score');
const highScoreEndSpan = document.getElementById('high-score-end');

// --- Game State Variables ---
let lockBoard = false;
let hasFlippedCard = false;
let firstCard, secondCard;

// --- Scoring and Timing Variables ---
let score = 0;
let timeLeft = 60; 
let timerId = null;

// --- Progress Tracking ---
let totalPairs = 0;
let foundPairs = 0;
let highScore = localStorage.getItem('memoryMatchHighScore') || 0;

// --- UI Elements ---
const scoreCountSpan = document.getElementById('score-count');
const timeLeftSpan = document.getElementById('time-left');

// 3. Fisher-Yates Shuffle Algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 4. Function to build the cards in the HTML
function generateCards(cardValues) {
    shuffle(cardValues);
    gameBoard.innerHTML = ''; 

    cardValues.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card', 'is-hidden');
        card.dataset.emoji = emoji; 

        card.innerHTML = `
            <div class="card-face front">${emoji}</div>
            <div class="card-face back"></div>
        `;

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; 

    this.classList.remove('is-hidden');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
    } else {
        secondCard = this;
        checkForMatch();
    }
}

function unflipCards() {
    lockBoard = true; 
    firstCard.classList.add('shake');
    secondCard.classList.add('shake');

    setTimeout(() => {
        firstCard.classList.add('is-hidden');
        secondCard.classList.add('is-hidden');
        firstCard.classList.remove('shake');
        secondCard.classList.remove('shake');
        turnEnd(); 
    }, 500); 
}

function checkForMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    isMatch ? keepCards() : unflipCards();
}

function keepCards() {
    score++;
    scoreCountSpan.textContent = score;
    foundPairs++;

    firstCard.classList.add('leap', 'match');
    secondCard.classList.add('leap', 'match');

    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    if (foundPairs === totalPairs) {
        // Stop current timer to allow for the board clear "peek"
        clearInterval(timerId);
        timerId = null;
        setTimeout(() => {
            newBoard(); 
        }, 500);
    }

    turnEnd();
}

function turnEnd() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// 5. Board logic
function newBoard() {
    lockBoard = true; 
    
    const setKeys = Object.keys(emojiSets);
    const randomSetKey = setKeys[Math.floor(Math.random() * setKeys.length)];
    const emojis = emojiSets[randomSetKey];
    
    totalPairs = emojis.length;
    foundPairs = 0;
    
    const cardValues = [...emojis, ...emojis];
    generateCards(cardValues);

    const cards = document.querySelectorAll('.card');

    // Reveal for the 2-second preview
    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove('is-hidden');
            card.classList.remove('leap', 'match');
        });
    }, 50);

    // Hide cards and start/resume the countdown
    setTimeout(() => {
        cards.forEach(card => card.classList.add('is-hidden'));
        lockBoard = false;

        // Start the timer after cards are hidden
        if (!timerId && timeLeft > 0) {
            timerId = setInterval(updateTimer, 1000);
        }
    }, 2000);
}

function updateTimer() {
    timeLeft--;
    timeLeftSpan.textContent = timeLeft;

    if (timeLeft <= 0) {
        endGame();
    }
}

function startGame() {
    // Force reset timer if one is already running
    clearInterval(timerId);
    timerId = null;

    score = 0;
    timeLeft = 60;
    scoreCountSpan.textContent = score;
    timeLeftSpan.textContent = timeLeft;

    newBoard();
}

function endGame() {
    clearInterval(timerId);
    timerId = null;
    lockBoard = true;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('memoryMatchHighScore', highScore);
    }

    finalScoreSpan.textContent = score;
    highScoreEndSpan.textContent = highScore;
    
    endModal.classList.add('show');
}

// 6. Event Listeners (Check IDs carefully!)
startGameBtn.addEventListener('click', () => {
    startModal.classList.remove('show');
    startGame();
});

playAgainBtn.addEventListener('click', () => {
    endModal.classList.remove('show');
    startGame();
});

// 7. Initial Setup
function init() {
    generateCards(Array(16).fill(''));
    lockBoard = true;
    highScoreStartSpan.textContent = highScore;
    highScoreEndSpan.textContent = highScore;
}

init();