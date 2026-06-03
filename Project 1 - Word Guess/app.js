// --- 1. DOM Elements ---
const modal = document.getElementById("result-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const playAgainBtn = document.getElementById("play-again-btn");

const keyboardContainer = document.querySelector(".keyboard");
const hintBtn = document.getElementById("hint-btn");
const wordDisplay = document.querySelector(".word-display");
const heartsContainer = document.querySelector(".hearts-container");
const themeText = document.querySelector("#word-theme");

// --- 2. Game State Variables ---
let currentWord = "";
let correctLetters = [];
let wrongGuessCount = 0;
const maxGuesses = 6;
let fanfareSound = null; 

const wordPacks = {
    Animal: ["elephant", "giraffe", "dolphin", "penguin", "cheetah"],
    Space: ["galaxy", "planet", "comet", "nebula", "asteroid"],
    Food: ["pizza", "sushi", "taco", "waffle", "burger"]
};

// --- 3. Functions ---

function updateHintButtonState() {
    const uniqueCorrect = [...new Set(correctLetters)].length;
    const unrevealedCount = currentWord.length - uniqueCorrect;

    // Disable if 1 life left or 1 letter left
    if (wrongGuessCount >= maxGuesses - 1 || unrevealedCount <= 1) {
        if (hintBtn) hintBtn.disabled = true;
    } else {
        if (hintBtn) hintBtn.disabled = false;
    }
}

function handleGuess(letter) {
    const buttons = keyboardContainer.querySelectorAll('button');
    for (const button of buttons) {
        if (button.innerText.toLowerCase() === letter.toLowerCase()) {
            button.disabled = true;
        }
    }

    const word = currentWord.toLowerCase();
    const lowerCaseLetter = letter.toLowerCase();

    if (word.includes(lowerCaseLetter)) {
        playSound('correct');
        const chars = word.split('');
        chars.forEach((char, index) => {
            if (char === lowerCaseLetter) {
                if (!correctLetters.includes(lowerCaseLetter)) {
                    correctLetters.push(lowerCaseLetter);
                }
                const letterContainers = wordDisplay.querySelectorAll('.letter-container');
                const container = letterContainers[index];
                container.querySelector('.letter').innerText = letter.toUpperCase(); 
                container.classList.add('revealed');
            }
        });
    } else {
        handleIncorrectGuess();
    }
    
    updateHintButtonState();
    setTimeout(checkGameState, 300);
}

function handleIncorrectGuess() {
    playSound('wrong');
    wrongGuessCount++;
    const hearts = heartsContainer.querySelectorAll('.heart');
    if (hearts.length - wrongGuessCount >= 0) {
        hearts[hearts.length - wrongGuessCount].classList.add('grey');
    }
}

function checkGameState() {
    const uniqueCorrect = [...new Set(correctLetters)].length;
    const uniqueWordLetters = [...new Set(currentWord.toLowerCase().split(''))].length;

    if (wrongGuessCount >= maxGuesses) {
        modalTitle.innerText = "🥀 Game Over! 🥀";
        modalMessage.innerHTML = `The correct word was: <br><b>${currentWord.toUpperCase()}</b>`;
        modal.classList.add("show"); 
        fanfareSound = playSound('lose'); 
    } 
    else if (uniqueCorrect === uniqueWordLetters && currentWord.length > 0) {
        modalTitle.innerText = "🎉 Congratulations! 🎉";
        modalMessage.innerHTML = `You guessed the word: <br><b>${currentWord.toUpperCase()}</b>`;
        modal.classList.add("show");
        fanfareSound = playSound('win'); 
    }
}

function giveHint() {
    // 1. Using a hint costs one life
    handleIncorrectGuess(); 

    const unrevealedLetters = [];
    currentWord.split('').forEach((letter, index) => {
        if (!correctLetters.includes(letter)) {
            unrevealedLetters.push({ letter, index });
        }
    });

    // 2. Prioritize vowels
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    let hintLetters = unrevealedLetters.filter(item => vowels.includes(item.letter));

    if (hintLetters.length === 0) {
        // If no vowels are left, use any unrevealed letter
        hintLetters = unrevealedLetters;
    }

    if (hintLetters.length > 0) {
        const randomHint = hintLetters[Math.floor(Math.random() * hintLetters.length)];
        const letter = randomHint.letter;

        // 3. Reveal the letter in the word display
        for (let i = 0; i < currentWord.length; i++){
            if (currentWord[i] === letter){
                if (!correctLetters.includes(letter)) {
                    correctLetters.push(letter);
                }
                const letterContainer = wordDisplay.querySelectorAll('.letter-container')[i];
                const letterSpan = letterContainer.querySelector('.letter');
                letterSpan.innerText = letter.toUpperCase();
                letterSpan.classList.add('hint-revealed');
                letterContainer.classList.add('revealed');
            }
        }

        // 4. Disable the keyboard button for the hinted letter
        const buttons = keyboardContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.innerText.toLowerCase() === letter) {
                button.disabled = true;
            }
        });
    }

    // 5. Update UI and check if hint ended the game
    updateHintButtonState();
    setTimeout(checkGameState, 300);
}

function generateKeyboard() {
    keyboardContainer.innerHTML = '';
    for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
        const button = document.createElement("button");
        button.innerText = String.fromCharCode(i);
        keyboardContainer.appendChild(button);
        button.addEventListener("click", (e) => handleGuess(e.target.innerText));
    }
}

function getRandomWord() {
    const themes = Object.keys(wordPacks);
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const wordsInTheme = wordPacks[randomTheme];
    currentWord = wordsInTheme[Math.floor(Math.random() * wordsInTheme.length)];
    themeText.innerText = randomTheme;
}

function resetGame() {
    correctLetters = [];
    wrongGuessCount = 0;
    wordDisplay.innerHTML = currentWord.split("").map(() => `
        <div class="letter-container">
            <span class="letter"></span>
            <div class="underline"></div>
        </div>
    `).join("");

    heartsContainer.innerHTML = '';
    for (let i = 0; i < maxGuesses; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart';
        heart.innerHTML = '&#x2764;';
        heartsContainer.appendChild(heart);
    }

    const buttons = keyboardContainer.querySelectorAll("button");
    for (let button of buttons) {
        button.disabled = false;
    }
    
    modal.classList.remove('show');
    updateHintButtonState();
}

// --- 4. Event Listeners ---

playAgainBtn.addEventListener("click", () => {
    if (fanfareSound) {
        fanfareSound.pause();
        fanfareSound.currentTime = 0;
        fanfareSound = null; 
    }
    getRandomWord();
    resetGame();
});

if (hintBtn) {
    hintBtn.addEventListener("click", giveHint);
}

const sounds = {
    correct: 'audio/button-3.mp3',
    wrong: 'audio/button-10.mp3',
    win: 'audio/applause-2.mp3',
    lose: 'audio/fail-trombone-01.mp3'
};

function playSound(soundKey){
    const audio = new Audio(sounds[soundKey]);
    audio.play().catch(() => {});
    return audio;
};

// --- 5. Initial Game Start ---
generateKeyboard();
getRandomWord();
resetGame();