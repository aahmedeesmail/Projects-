// --- 1. Setup & Variables ---
const buttons = {
    green: document.getElementById('green'),
    red: document.getElementById('red'),
    yellow: document.getElementById('yellow'),
    blue: document.getElementById('blue')
};

const sounds = {
    color_green: 'sound/piano.mp3',
    color_red: 'sound/guitar.mp3',
    color_yellow: 'sound/trumpet.mp3',
    color_blue: 'sound/drum.mp3',
    fail: 'sound/fail.mp3'
};

const menuModal = document.getElementById('menu-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

const normalBtn = document.getElementById('play-normal-btn');
const hardBtn = document.getElementById('play-hard-btn');
const normalScoreDisplay = document.getElementById('high-score-normal');
const hardScoreDisplay = document.getElementById('high-score-hard');

// Game State Variables
let gameMode = ""; 
let sequence = [];
let playerSequence = [];
let level = 0;
let isPlayerTurn = false;

// Load & Initialize High Scores from LocalStorage
let normalHighScore = parseInt(localStorage.getItem('simonNormalScore')) || 0;
let hardHighScore = parseInt(localStorage.getItem('simonHardScore')) || 0;

// Update the spans in the HTML immediately
if (normalScoreDisplay) normalScoreDisplay.textContent = normalHighScore;
if (hardScoreDisplay) hardScoreDisplay.textContent = hardHighScore;

// --- 2. Core Functions ---

function playSound(key) {
    const audio = new Audio(sounds[key]);
    audio.play().catch(() => { /* Handle browser audio block */ });
}

function lightUpButton(color) {
    const button = buttons[color];
    if (!button) return;

    button.classList.add('lit');
    playSound(`color_${color}`);
    
    const duration = gameMode === 'hard' ? 250 : 400;
    setTimeout(() => {
        button.classList.remove('lit');
    }, duration);
}

function playSequence() {
    isPlayerTurn = false;

    // HARD MODE LOGIC: Only play the latest color added to the sequence
    const sequenceToPlay = gameMode === 'normal' ? sequence : [sequence[sequence.length - 1]];
    const interval = gameMode === 'hard' ? 450 : 650;

    sequenceToPlay.forEach((color, index) => {
        setTimeout(() => {
            lightUpButton(color);
        }, (index + 1) * interval);
    });

    const totalSequenceTime = (sequenceToPlay.length + 1) * interval;
    setTimeout(() => {
        isPlayerTurn = true;
    }, totalSequenceTime);
}

// --- 3. Input Handling ---

function handlePlayerInput(color) {
    if (!isPlayerTurn) return;

    // Visual feedback for the click
    const button = buttons[color];
    button.classList.add('lit-click');
    setTimeout(() => button.classList.remove('lit-click'), 100);
    playSound(`color_${color}`);

    playerSequence.push(color);
    const i = playerSequence.length - 1;

    // Check if the player clicked the wrong button
    if (playerSequence[i] !== sequence[i]) {
        isPlayerTurn = false;
        setTimeout(endGame, 500);
        return;
    }

    // Check if player completed the sequence for this level
    if (playerSequence.length === sequence.length) {
        isPlayerTurn = false;
        showSuccessMessage();
        setTimeout(nextRound, 1000);
    }
}

// --- 4. Game Flow ---

function startGame(mode) {
    gameMode = mode;
    if (menuModal) menuModal.classList.remove('show');

    // Toggle Hard Mode Background on the Body
    if (gameMode === 'hard') {
        document.body.classList.add('hard-bg');
    } else {
        document.body.classList.remove('hard-bg');
    }

    level = 0;
    sequence = [];
    nextRound();
}

function nextRound() {
    isPlayerTurn = false;
    playerSequence = [];
    level++;
    
    const display = document.getElementById('level-display');
    if (display) display.innerText = level;

    // Add a new random color to the sequence
    const colors = Object.keys(buttons);
    const randomColor = colors[Math.floor(Math.random() * 4)];
    sequence.push(randomColor);

    playSequence();
}

function endGame() {
    playSound('fail');
    if (modalTitle) modalTitle.textContent = "Game Over!";
    if (modalMessage) modalMessage.textContent = `You reached level ${level} on ${gameMode} mode.`;

    // Save High Score based on current mode
    if (gameMode === 'hard') {
        if (level > hardHighScore) {
            hardHighScore = level;
            localStorage.setItem('simonHardScore', hardHighScore);
            if (hardScoreDisplay) hardScoreDisplay.textContent = hardHighScore;
        }
    } else {
        if (level > normalHighScore) {
            normalHighScore = level;
            localStorage.setItem('simonNormalScore', normalHighScore);
            if (normalScoreDisplay) normalScoreDisplay.textContent = normalHighScore;
        }
    }

    if (menuModal) menuModal.classList.add('show');
}

function showSuccessMessage() {
    const msg = document.getElementById('success-message');
    if (msg) {
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 600);
    }
}

// --- 5. Event Listeners ---

// Listeners for Simon Buttons
Object.keys(buttons).forEach(color => {
    buttons[color].addEventListener('click', () => handlePlayerInput(color));
});

// Listeners for Modal Buttons
if (normalBtn) normalBtn.addEventListener('click', () => startGame('normal'));
if (hardBtn) hardBtn.addEventListener('click', () => startGame('hard'));

console.log("Simon Says: Musical Edition Loaded!");