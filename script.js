const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const board = [];
const breakSound = document.createElement('audio')
const startSound = document.createElement('audio')
const endSound = document.createElement('audio')
const rotateSound = document.createElement('audio')
const drop = document.createElement('audio')

const startBtn = document.querySelector(".start-button")
let rotatedShape;

const scoreBoard = document.getElementById("score-board");
let score = 0;
let rowsClearedCounter = 0;


var songs = [
    "assets/soundtrack/dance-of-the-sugarplum-fairies.mp3",
    "assets/soundtrack/tetris-main-theme.mp3",
    "assets/soundtrack/Tetris (Tengen) (NES) Music - Karinka.mp3",
    "assets/soundtrack/Tetris (Tengen) (NES) Music - Troika.mp3",
    "assets/soundtrack/Tetris (Tengen) (NES) Music - Bradinsky.mp3",
    "assets/soundtrack/Tetris 99 - Main Theme.mp3",
    "assets/soundtrack/TETRIS (2023) OST - Holding Out For A Hero (Russian cover by Polina)-X64Hswg2QHQ-256k-1656910639826.mp3",
];

var currentIndex = Math.floor(Math.random() * songs.length);;
var bgm = new Audio();

bgm.src = songs[currentIndex];
bgm.volume = 0.7;

function playNextSong(flag=0) {

    if (flag)
        bgm.src = songs[currentIndex];

    if (currentIndex >= songs.length) {
        currentIndex = 0;
        bgm.src = songs[currentIndex];
        playNextSong();
    }

    if (isSoundOn) {
        bgm.play();
    } else {
        bgm.pause();
    }

    bgm.addEventListener("ended", () => {
        currentIndex++;
        playNextSong();
    });
}



startSound.setAttribute('src', './assets/start.wav')
startSound.muted = true;

endSound.setAttribute('src', './assets/game_ko.wav')
endSound.muted = true;

rotateSound.setAttribute('src', './assets/rotate.wav')
rotateSound.muted = true;

breakSound.setAttribute('src', './assets/break.wav')
breakSound.muted = true;

drop.setAttribute('src', './assets/drop.wav')
drop.muted = true;

for (let row = 0; row < BOARD_HEIGHT; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_WIDTH; col++) {
        board[row][col] = 0;
    }
}

const tetrominoes = [
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffd800'
    },
    {
        shape: [
            [0, 2, 0],
            [2, 2, 2]
        ],
        color: '#7925dd'
    },
    {
        shape: [
            [0, 3, 3],
            [3, 3, 0]
        ],
        color: 'orange'
    },
    {
        shape: [
            [4, 4, 0],
            [0, 4, 4]
        ],
        color: 'red'
    },
    {
        shape: [
            [5, 0, 0],
            [5, 5, 5]
        ],
        color: 'green'
    },
    {
        shape: [
            [0, 0, 6],
            [6, 6, 6]
        ],
        color: '#ff6400'
    },
    {
        shape: [[7, 7, 7, 7]],
        color: '#00b5ff'
    }
];

function randomTetromino() {
    const index = Math.floor(Math.random() * tetrominoes.length);
    const tetromino = tetrominoes[index];
    return {
        shape: tetromino.shape,
        color: tetromino.color,
        row: 0,
        col: Math.floor(Math.random() * (BOARD_WIDTH - tetromino.shape[0].length + 1))
    };
}

let currentTetromino = randomTetromino();
let currentGhostTetronimo;

function drawTetromino() {
    const shape = currentTetromino.shape;
    const color = currentTetromino.color;
    const row = currentTetromino.row;
    const col = currentTetromino.col;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const block = document.createElement('div');
                block.classList.add('block');
                block.style.backgroundColor = color;
                block.style.top = (row + r) * 24 + 'px';
                block.style.left = (col + c) * 24 + 'px';
                block.setAttribute('id', `block-${row + r}-${col + c}`);
                document.getElementById('game_board').appendChild(block);
            }
        }
    }
}

function drawDemoTetromino(){
    const shape = nextTetromino.shape;
    const color = nextTetromino.color;
    const row = 1;
    const col = 0;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const block = document.createElement('div');
                block.classList.add('block');
                block.style.backgroundColor = color;
                block.style.top = (row + r) * 24 + 'px';
                block.style.left = (col + c) * 24 + 'px';
                block.setAttribute('id', `block-demo-${row + r}-${col + c}`);
                document.getElementById('demo-board').appendChild(block);
            }
        }
    }
}

function eraseDemoTetromino() {
    while (document.getElementById('demo-board').firstChild)
        document.getElementById('demo-board').removeChild(document.getElementById('demo-board').firstChild);
}

function eraseTetromino() {
    for (let i = 0; i < currentTetromino.shape.length; i++) {
        for (let j = 0; j < currentTetromino.shape[i].length; j++) {
            if (currentTetromino.shape[i][j] !== 0) {
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;
                let block = document.getElementById(`block-${row}-${col}`)

                if (block) {
                    document.getElementById('game_board').removeChild(block);
                }
            }
        }
    }
}

function canTetrominoMove(rowOffset, colOffset) {
    for (let i = 0; i < currentTetromino.shape.length; i++) {
        for (let j = 0; j < currentTetromino.shape[i].length; j++) {
            if (currentTetromino.shape[i][j] !== 0) {
                let row = currentTetromino.row + i + rowOffset;
                let col = currentTetromino.col + j + colOffset;

                if (row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function canTetrominoRotate(){
    for (let i=0; i<rotatedShape.length; i++){
        for (let j =0; j<rotatedShape[i].length; j++){
            if (rotatedShape[i][j] !== 0){
                let row = currentTetromino.row +i;
                let col = currentTetromino.col + j;

                if (row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function lockTetromino() {
    for (let i = 0; i < currentTetromino.shape.length; i++) {
        for (let j = 0; j < currentTetromino.shape[i].length; j++) {
            if (currentTetromino.shape[i][j] !== 0) {
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;

                board[row][col] = currentTetromino.color;
            }
        }
    }

    // clear row
    let  rowsCleared = clearRows();
    if (rowsCleared > 0) {
        // Update Score
        clearRows();
    }
    rowsClearedCounter = rowsCleared;
    updateScore();

    if (currentTetromino.row <= 0) {
        gameOver();
        return;
    }

    eraseDemoTetromino();
    currentTetromino = nextTetromino;
    nextTetromino = randomTetromino();
}

function clearRows() {
    let rowsCleared = 0;

    for(let y = BOARD_HEIGHT-1; y >=0; y--) {
        let rowFilled = true;

        for (let x = 0; x < BOARD_WIDTH; x++){
            if (board[y][x] === 0) {
                rowFilled = false;
                break;
            }
        }

        if (rowFilled) {
            breakSound.muted = false;
            breakSound.play();
            rowsCleared++;

            for (let yy=y; yy > 0; yy--){
                for (let x = 0; x < BOARD_WIDTH; x++){
                    board[yy][x] = board[yy-1][x];
                }
            }

            for (let x = 0; x < BOARD_WIDTH; x++){
                board[0][x] = 0;
            }

            document.getElementById("game_board").innerHTML = "";
            for(let row = 0; row < BOARD_HEIGHT; row++){
                for (let col = 0; col < BOARD_WIDTH; col++){
                    if (board[row][col]){
                        const block = document.createElement('div');
                        block.classList.add('block');
                        block.style.backgroundColor = board[row][col];
                        block.style.top = row * 24 + "px";
                        block.style.left = col * 24 + "px";
                        block.setAttribute('id', `block-${row}-${col}`);
                        document.getElementById('game_board').appendChild(block);
                    }
                }
            }
        }

        // replay
        // y++;
    }
    return rowsCleared;
}

function rotateTetromino() {
    rotatedShape = [];
    for (let i = 0; i < currentTetromino.shape[0].length; i++) {
        let row = [];
        for (let j = currentTetromino.shape.length - 1; j >= 0; j--) {
            row.push(currentTetromino.shape[j][i]);
        }
        rotatedShape.push(row);
    }
    if(canTetrominoRotate()){
        eraseTetromino();
        currentTetromino.shape = rotatedShape;
        drawTetromino();

        moveGhostTetromino();
    }

    rotateSound.muted = false;
    rotateSound.play();
}

function moveTetromino(direction) {
    let row = currentTetromino.row;
    let col = currentTetromino.col;

    drawDemoTetromino();
    if (direction === 'left') {
        if (canTetrominoMove(0, -1)) {
            eraseTetromino();
            col -= 1;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino();
        }
    } else if (direction === 'right') {
        if (canTetrominoMove(0, 1)) {
            eraseTetromino();
            col += 1;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino();
        }
    } else {
        if (canTetrominoMove(1, 0)) {
            //down
            eraseTetromino();
            row++;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino();
        } else {
            lockTetromino();
        }
    }

    moveGhostTetromino();
}

// drawTetromino();
// setInterval(moveTetromino, 500);

// draw Ghost

function drawGhostTetromino() {
    const shape = currentTetromino.shape;
    const color = 'rgba(255,255,255,0.5)';
    const row = currentGhostTetronimo.row;
    const col = currentGhostTetronimo.col;

    for (let r = 0; r < shape.length; r++){
        for (let c =0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const block = document.createElement('div');
                block.classList.add('ghost');
                block.style.backgroundColor = color;
                block.style.top = (row + r) * 24 + 'px';
                block.style.left = (col + c) * 24 + 'px';
                block.setAttribute('id', `ghost-${row + r}-${col + c}`)
                document.getElementById('game_board').appendChild(block);
            }
        }
    }
}

function eraseGhostTetromino() {
    const ghost = document.querySelectorAll('.ghost');
    for (let i = 0; i < ghost.length; i++){
        ghost[i].remove();
    }
}

function canGhostTetromino(rowOffset, colOffset) {
    for (let i = 0; i < currentGhostTetronimo.shape.length; i++) {
        for (let j = 0; j < currentGhostTetronimo.shape[i].length; j++) {
            if (currentGhostTetronimo.shape[i][j] !== 0) {
                let row = currentGhostTetronimo.row + i + rowOffset;
                let col = currentGhostTetronimo.col + j + colOffset;

                if (row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function moveGhostTetromino(){
    eraseGhostTetromino();

    currentGhostTetronimo = {...currentTetromino};

    while (canGhostTetromino(1,0)){
        currentGhostTetronimo.row++;
    }

    if (ghostTetrominoEnabled) {
        drawGhostTetromino();
    }
}

// document.body.addEventListener('click', ()=>{
//     bgm.play();
//     bgm.volume = 0.5;
//     bgm.muted = false;
//     drop.muted = false;
// });

const soundButton = document.getElementById('sound_button');
let isSoundOn = false;

const nextButton = document.getElementById('next_button');
nextButton.addEventListener('click', () => {
   currentIndex++;
   if (isSoundOn) {playNextSong(1)}
});

soundButton.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    playNextSong();
});



function dropTetromino(){
    let row = currentTetromino.row;
    let col = currentTetromino.col;

    drop.muted = false;
    drop.currentTime = 0;
    drop.play();

    while (canTetrominoMove(1,0)){
        eraseTetromino();
        row++;
        currentTetromino.col = col;
        currentTetromino.row = row;
        drawTetromino();
    }

    lockTetromino();
}

document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
    switch (event.keyCode) {
        case 37: //left arrow
            moveTetromino("left");
            break;
        case 39: //right arrow
            moveTetromino("right");
            break;
        case 40: //down arrow
            moveTetromino("down");
            break;
        case 38: //up arrow
            rotateTetromino();
            break;
        case 32: //space bar
            if (gameIsStarted)
                dropTetromino();
            break;
    }
}

let gameInterval;
function gameOver() {
    bgm.pause();
    bgm.currentTime = 0;

    endSound.muted = false;
    endSound.play();

    document.removeEventListener("keydown", handleKeyPress);
    clearInterval(gameInterval); // Остановка генерации новых тетромино

    // Создание элементов overlay, gameOverImage и scoreText
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";

    const gameOverImage = document.createElement("img");
    gameOverImage.id = "gameOverImage";
    gameOverImage.src = "./assets/game-over.png"; // Замените на путь к вашему изображению "Game Over"

    const scoreText = document.createElement("p");
    scoreText.id = "scoreText";
    scoreText.textContent = "Score: " + score; // Вывод счета игрока

    // Применение стилей к scoreText
    scoreText.style.textAlign = "center";
    scoreText.style.fontSize = "30px";
    scoreText.style.fontWeight = "bold";
    scoreText.style.fontFamily = "Arial";
    scoreText.style.color = "white";
    scoreText.style.textShadow = "4px 4px rgb(82,84,130)";

    overlay.appendChild(gameOverImage);
    overlay.appendChild(scoreText);
    document.body.appendChild(overlay);
}


startBtn.addEventListener("click", startGame);
let ghostTetrominoEnabled = true;

let gameIsStarted = false;
let nextTetromino = randomTetromino();
function startGame() {
    startBtn.removeEventListener("click", startGame); // Удаляем обработчик события клика
    startBtn.disabled = true; // Блокируем кнопку после нажатия

    const difficultySelect = document.getElementById("difficulty");
    const selectedDifficulty = difficultySelect.value;
    difficultySelect.disabled = true;

    startSound.muted = false;
    startSound.play();

    if (selectedDifficulty === "easy") {
        // Запуск игры с легкой сложностью
        drawTetromino();
        gameInterval = setInterval(moveTetromino, 500);
    } else if (selectedDifficulty === "medium") {
        // Запуск игры с средней сложностью
        drawTetromino();
        gameInterval = setInterval(moveTetromino, 400);
    } else if (selectedDifficulty === "hard") {
        // Запуск игры с высокой сложностью
        ghostTetrominoEnabled = false; // Отключаем отображение ghostTetromino
        // bgm.playbackRate = 1.2
        drawTetromino();
        gameInterval = setInterval(moveTetromino, 300);
    } else if (selectedDifficulty === "terrible") {
        // Запуск игры с ужасной сложностью
        ghostTetrominoEnabled = false; // Отключаем отображение ghostTetromino
        bgm.playbackRate = 1.5
        drawTetromino();
        gameInterval = setInterval(moveTetromino, 120);
    }

    gameIsStarted = true;
}

// Функция для обновления счета
function updateScore() {
    // Вычисление баллов на основе количества приземлений и удаленных строк
    score += 3 + 10 * Math.pow(rowsClearedCounter, 2);
    scoreBoard.textContent = score.toString();
}