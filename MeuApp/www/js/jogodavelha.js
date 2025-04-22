// Variáveis globais do jogo
let currentPlayer = "X";               // Jogador que inicia
let cells = ["", "", "", "", "", "", "", "", ""]; // Estado do tabuleiro
let gameActive = false;               // Indica se o jogo está em andamento
let mode = "player";                  // Modo: player vs player ou player vs bot
let difficulty = 1;                   // Nível de dificuldade do bot

// Elementos do DOM
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");
const gameModeSelect = document.getElementById("gameMode");
const backButton = document.getElementById("backButton"); // Botão de "Voltar"

// Quando a página é carregada
window.onload = function() {
    mode = gameModeSelect.value;         // Obtém o modo selecionado
    updateDifficultyState();             // Atualiza a interface de dificuldade
    createBoard();                       // Inicializa o tabuleiro
};

// Quando o botão "Voltar" é clicado, redireciona para a tela inicial
backButton.addEventListener("click", function() {
    window.location.href = "index.html";
});

// Ativa ou desativa o menu de dificuldade com base no modo
function updateDifficultyState() {
    difficultySelect.disabled = mode !== "bot";
}

// Cria o tabuleiro do jogo
function createBoard() {
    board.innerHTML = "";               // Limpa o tabuleiro
    cells.fill("");                     // Reinicia as células
    currentPlayer = "X";                // X sempre começa
    gameActive = true;                  // Habilita o jogo
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    restartButton.style.display = "none";

    // Cria cada célula como um elemento HTML
    cells.forEach((_, index) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.dataset.index = index;
        cellElement.addEventListener("click", handleCellClick); // Clique na célula
        board.appendChild(cellElement);
    });

    // Se o modo for BOT e o bot for o primeiro, ele faz a jogada automática
    if (mode === "bot" && currentPlayer === "O") {
        setTimeout(botMove, 500);
    }
}

// Lógica de clique em uma célula
function handleCellClick(event) {
    const index = event.target.dataset.index;

    // Impede jogadas inválidas (célula ocupada, jogo encerrado ou bot no turno dele)
    if (cells[index] !== "" || !gameActive || (mode === "bot" && currentPlayer === "O")) return;

    playMove(index, currentPlayer); // Realiza a jogada

    // Se for modo contra bot, o bot faz a jogada automática depois
    if (mode === "bot" && gameActive) {
        setTimeout(botMove, 500);
    }
}

// Aplica uma jogada e verifica vitória ou troca de turno
function playMove(index, player) {
    cells[index] = player; // Atualiza o estado
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player; // Mostra o símbolo
    cell.classList.add("animated"); // Animação de preenchimento

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

// Verifica se há um vencedor ou empate
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]             // Diagonais
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
            return cells[a]; // Retorna "X" ou "O" se encontrou um vencedor
        }
    }
    return cells.includes("") ? null : "empate"; // Se não há espaços, é empate
}

// Jogada automática do BOT
function botMove() {
    if (!gameActive) return;

    // Filtra posições vazias
    let availableMoves = cells.map((cell, index) => (cell === "" ? index : null)).filter(index => index !== null);
    let botChoice;

    if (difficulty === 1) {
        // Nível fácil: escolha aleatória
        botChoice = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (difficulty === 2) {
        // Nível médio: tenta vencer em uma jogada, senão escolhe o primeiro disponível
        botChoice = mediumBot(availableMoves);
    } else {
        // Nível difícil: usa Minimax (estratégia perfeita) ou fallback para nível médio
        botChoice = hardBot() || mediumBot(availableMoves);
    }

    playMove(botChoice, "O");
}

// Bot de dificuldade média: prioriza jogadas que ganham o jogo
function mediumBot(availableMoves) {
    return availableMoves.find(index => checkMove(index, "O")) || availableMoves[0];
}

// Bot de dificuldade difícil: IA Minimax para jogada ideal
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

// Algoritmo Minimax: define a jogada ótima para o bot
function minimax(board, depth, isMaximizing) {
    let result = checkWinner();
    if (result === "O") return 10 - depth;  // Vitória do bot
    if (result === "X") return depth - 10;  // Vitória do jogador
    if (result === "empate") return 0;      // Empate

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

// Checa se a jogada de um player levaria à vitória
function checkMove(index, player) {
    cells[index] = player;
    let result = checkWinner();
    cells[index] = "";
    return result;
}

// Reinicia o jogo
function restartGame() {
    createBoard();
}

// Alternância de tema claro/escuro ao clicar no botão
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});

// Ajuste automático do tema, com base nas preferências do sistema, ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
    }
});

// Reinicia o jogo ao clicar no botão de "Reiniciar"
restartButton.addEventListener("click", restartGame);

// Atualiza o modo de jogo ao trocar a seleção
gameModeSelect.addEventListener("change", () => {
    mode = gameModeSelect.value;
    updateDifficultyState();
    createBoard();
});

// Atualiza o nível de dificuldade ao mudar o valor do select
difficultySelect.addEventListener("change", () => {
    difficulty = parseInt(difficultySelect.value);
});
