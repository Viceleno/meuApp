let currentPlayer = "X";
let cells = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;
let mode = "player";
let difficulty = 1;

const board = document.getElementById("board");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");
const gameModeSelect = document.getElementById("gameMode");
const toggleButton = document.getElementById("themeToggle");

window.onload = function() {
    mode = gameModeSelect.value;
    updateDifficultyState();
    createBoard();
    updateThemeIcon();
};

function updateDifficultyState() {
    difficultySelect.disabled = mode !== "bot";
}

function createBoard() {
    board.innerHTML = "";
    cells.fill("");
    currentPlayer = "X";
    gameActive = true;
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    restartButton.style.display = "none";

    cells.forEach((_, index) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.dataset.index = index;
        cellElement.addEventListener("click", handleCellClick);
        board.appendChild(cellElement);
    });

    if (mode === "bot" && currentPlayer === "O") {
        setTimeout(botMove, 500);
    }
}

function handleCellClick(event) {
    const index = event.target.dataset.index;

    if (cells[index] !== "" || !gameActive || (mode === "bot" && currentPlayer === "O")) return;

    playMove(index, currentPlayer);

    if (mode === "bot" && gameActive) {
        setTimeout(botMove, 500);
    }
}

function playMove(index, player) {
    cells[index] = player;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add("animated");

    const winner = checkWinner();
    if (winner) {
        statusText.textContent = winner === "empate" ? "Empate!" : `Jogador ${winner} venceu!`;
        gameActive = false;
        restartButton.style.display = "inline-block";
    } else {
        currentPlayer = player === "X" ? "O" : "X";
        statusText.textContent = `Vez do jogador ${currentPlayer}`;
    }
}

function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
            return cells[a];
        }
    }

    return cells.includes("") ? null : "empate";
}

function botMove() {
    if (!gameActive) return;

    let availableMoves = cells.map((cell, index) => (cell === "" ? index : null)).filter(index => index !== null);
    let botChoice;

    if (difficulty === 1) {
        botChoice = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (difficulty === 2) {
        botChoice = mediumBot(availableMoves);
    } else {
        botChoice = hardBot() || mediumBot(availableMoves);
    }

    playMove(botChoice, "O");
}

function mediumBot(availableMoves) {
    return availableMoves.find(index => checkMove(index, "O")) || availableMoves[0];
}

function hardBot() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let index = 0; index < cells.length; index++) {
        if (cells[index] === "") {
            cells[index] = "O";
            let score = minimax(cells, 0, false);
            cells[index] = "";

            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }
    }
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    let result = checkWinner();
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (result === "empate") return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(bestScore, score);
            }
        }
        return bestScore;
    }
}

function checkMove(index, player) {
    cells[index] = player;
    let result = checkWinner();
    cells[index] = "";
    return result;
}

function restartGame() {
    createBoard();
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    updateThemeIcon();
}

function updateThemeIcon() {
    if (document.body.classList.contains("dark-mode")) {
        toggleButton.textContent = "🌞";
    } else {
        toggleButton.textContent = "🌙";
    }
}

restartButton.addEventListener("click", restartGame);
gameModeSelect.addEventListener("change", () => {
    mode = gameModeSelect.value;
    updateDifficultyState();
    createBoard();
});
difficultySelect.addEventListener("change", () => {
    difficulty = parseInt(difficultySelect.value);
});
toggleButton.addEventListener("click", toggleTheme);
