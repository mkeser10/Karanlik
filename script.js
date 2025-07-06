let gameState = {
    currentLevel: 0,
    lives: 3,
    score: 0,
    timer: null,
    timeLeft: 0,
    highScore: localStorage.getItem('highScore') || 0,
    soundEnabled: true // Ses varsayılan olarak açık
};

// Ses Elementleri
const backgroundMusic = new Audio('sounds/tense_horror_background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;

const heartbeatSound = new Audio('sounds/heartbeat.wav');
heartbeatSound.loop = true;
heartbeatSound.volume = 0.7;

const wrongAnswerSound = new Audio('sounds/wrong_answer.wav');
const gameOverSound = new Audio('sounds/game_over.wav');
const correctAnswerSound = new Audio('sounds/correct_answer.wav');

// DOM Elementleri
const startScreen = document.getElementById('start-screen');
const gamePlayScreen = document.getElementById('game-play-screen');
const endScreen = document.getElementById('end-screen');

const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const exitButton = document.getElementById('exitButton');

const levelDisplay = document.getElementById('levelDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const questionText = document.getElementById('questionText');
const choiceAButton = document.getElementById('choiceA');
const choiceBButton = document.getElementById('choiceB');
const gameImage = document.getElementById('gameImage');

const finalScoreDisplay = document.getElementById('finalScore');
const finalMessageDisplay = document.getElementById('finalMessage');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const currentHighScoreDisplay = document.getElementById('currentHighScore');

const soundToggleButton = document.getElementById('soundToggleButton');

// Oyun Başlatma
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gamePlayScreen.style.display = 'block';
    gameState.currentLevel = 0;
    gameState.lives = 3;
    gameState.score = 0;
    updateLivesDisplay();
    updateScoreDisplay();
    loadQuestion();
    if (gameState.soundEnabled) {
        backgroundMusic.play();
    }
});

// Yeniden Başlatma
restartButton.addEventListener('click', () => {
    endScreen.style.display = 'none';
    gamePlayScreen.style.display = 'block';
    gameState.currentLevel = 0;
    gameState.lives = 3;
    gameState.score = 0;
    updateLivesDisplay();
    updateScoreDisplay();
    loadQuestion();
    if (gameState.soundEnabled) {
        backgroundMusic.play();
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
    }
});

// Çıkış
exitButton.addEventListener('click', () => {
    endScreen.style.display = 'none';
    startScreen.style.display = 'block';
    if (gameState.soundEnabled) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
    }
});

// Ses Açma/Kapama
soundToggleButton.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    if (gameState.soundEnabled) {
        soundToggleButton.textContent = 'Ses: Açık';
        backgroundMusic.play();
        if (gameState.lives <= 1) {
            heartbeatSound.play();
        }
    } else {
        soundToggleButton.textContent = 'Ses: Kapalı';
        backgroundMusic.pause();
        heartbeatSound.pause();
        wrongAnswerSound.pause();
        correctAnswerSound.pause();
        gameOverSound.pause();
    }
});

// Can Güncelleme
function updateLivesDisplay() {
    livesDisplay.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
        livesDisplay.innerHTML += '<span class="heart">❤️</span>';
    }
    for (let i = gameState.lives; i < 3; i++) {
        livesDisplay.innerHTML += '<span class="heart empty">🖤</span>';
    }

    if (gameState.lives <= 1 && gameState.soundEnabled) {
        heartbeatSound.play();
    } else {
        heartbeatSound.pause();
        heartbeatSound.currentTime = 0;
    }
}

// Skor Güncelleme
function updateScoreDisplay() {
    scoreDisplay.textContent = `Skor: ${gameState.score}`;
}

// Soruyu Yükle
function loadQuestion() {
    clearInterval(gameState.timer);

    if (gameState.currentLevel >= extendedGameQuestions.length) {
        endGame(true); // Oyun bitti, kazandı
        return;
    }

    const currentQuestion = extendedGameQuestions[gameState.currentLevel];
    levelDisplay.textContent = `Seviye: ${gameState.currentLevel + 1}`;
    questionText.textContent = currentQuestion.story + ' ' + currentQuestion.question;
    choiceAButton.textContent = currentQuestion.choices[0];
    choiceBButton.textContent = currentQuestion.choices[1];

    // Görseli güncelle
    gameImage.src = currentQuestion.image;

    gameState.timeLeft = currentQuestion.timeLimit;
    timerDisplay.textContent = `Süre: ${gameState.timeLeft}`;

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        timerDisplay.textContent = `Süre: ${gameState.timeLeft}`;

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            handleWrongAnswer();
        }
    }, 1000);
}

// Cevap Kontrolü
choiceAButton.addEventListener('click', () => checkAnswer(0));
choiceBButton.addEventListener('click', () => checkAnswer(1));

function checkAnswer(chosenAnswer) {
    clearInterval(gameState.timer);
    const currentQuestion = extendedGameQuestions[gameState.currentLevel];

    if (chosenAnswer === currentQuestion.correct) {
        gameState.score += 10;
        updateScoreDisplay();
        if (gameState.soundEnabled) {
            correctAnswerSound.play();
        }
        // Doğru cevap animasyonu (ekran parlaması)
        gamePlayScreen.classList.add('correct-answer-effect');
        setTimeout(() => {
            gamePlayScreen.classList.remove('correct-answer-effect');
        }, 300);

        gameState.currentLevel++;
        loadQuestion();
    } else {
        handleWrongAnswer();
    }
}

function handleWrongAnswer() {
    gameState.lives--;
    updateLivesDisplay();
    if (gameState.soundEnabled) {
        wrongAnswerSound.play();
    }
    // Yanlış cevap animasyonu (ekran titremesi ve kırmızılaşma)
    gamePlayScreen.classList.add('wrong-answer-effect');
    setTimeout(() => {
        gamePlayScreen.classList.remove('wrong-answer-effect');
    }, 500);

    if (gameState.lives <= 0) {
        endGame(false); // Oyun bitti, kaybetti
    } else {
        loadQuestion(); // Can varsa yeni soruya geç
    }
}

// Oyun Sonu
function endGame(won) {
    clearInterval(gameState.timer);
    gamePlayScreen.style.display = 'none';
    endScreen.style.display = 'block';

    if (won) {
        finalMessageDisplay.textContent = "TEBRİKLER! Karanlığın tüm sorularını çözdün ve gerçek bir kahraman oldun! Sabah oldu, lanet sona erdi...";
        finalScoreDisplay.textContent = `Son Skorun: ${gameState.score}`;
        // İyi son görseli
        document.getElementById('endScreenImage').src = 'images/sunrise_over_haunted_village.jpg';
    } else {
        finalMessageDisplay.textContent = "OYUN BİTTİ! Hayalet seni sonsuza dek buldu... Karanlık seni yuttu.";
        finalScoreDisplay.textContent = `Son Skorun: ${gameState.score}`;
        // Korkutucu kaybetme görseli ve sesi
        document.getElementById('endScreenImage').src = 'images/scary_game_over.jpg'; // Yeni kaybetme görseli
        if (gameState.soundEnabled) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            gameOverSound.play();
        }
    }

    // Yüksek skoru güncelle
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }
    currentHighScoreDisplay.textContent = `En Yüksek Skor: ${gameState.highScore}`;

    // LocalStorage'a kaydet
    localStorage.setItem('karanliginSorusuGameState', JSON.stringify(gameState));
}

// Oyun durumunu LocalStorage'dan yükle
function loadGameState() {
    const savedState = localStorage.getItem('karanliginSorusuGameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        // Ses objelerini yeniden oluştur
        backgroundMusic.src = 'sounds/tense_horror_background.mp3';
        heartbeatSound.src = 'sounds/heartbeat.wav';
        wrongAnswerSound.src = 'sounds/wrong_answer.wav';
        gameOverSound.src = 'sounds/game_over.wav';
        correctAnswerSound.src = 'sounds/correct_answer.wav';

        // Ses durumunu ayarla
        if (gameState.soundEnabled) {
            soundToggleButton.textContent = 'Ses: Açık';
        } else {
            soundToggleButton.textContent = 'Ses: Kapalı';
        }

        // Eğer oyun devam ediyorsa, ilgili ekrana geç
        if (gameState.currentLevel > 0 && gameState.lives > 0 && gameState.currentLevel < extendedGameQuestions.length) {
            startScreen.style.display = 'none';
            gamePlayScreen.style.display = 'block';
            updateLivesDisplay();
            updateScoreDisplay();
            loadQuestion();
            if (gameState.soundEnabled) {
                backgroundMusic.play();
            }
        } else {
            // Oyun bitmişse veya yeni başlıyorsa başlangıç ekranını göster
            startScreen.style.display = 'block';
            gamePlayScreen.style.display = 'none';
            endScreen.style.display = 'none';
        }
        currentHighScoreDisplay.textContent = `En Yüksek Skor: ${gameState.highScore}`;
    }
}

// Sayfa yüklendiğinde oyun durumunu yükle
window.addEventListener('load', loadGameState);

// Mobil uyumluluk için butonlara dokunma olayları ekle
choiceAButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    checkAnswer(0);
});
choiceBButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    checkAnswer(1);
});
startButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startButton.click();
});
restartButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    restartButton.click();
});
exitButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    exitButton.click();
});
soundToggleButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    soundToggleButton.click();
});


