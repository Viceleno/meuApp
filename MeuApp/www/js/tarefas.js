// Declaração de variáveis globais
let db;                // Variável que vai armazenar a instância do banco de dados
let editandoId = null; // Guarda o ID da tarefa que está sendo editada, se houver

// Evento que espera o dispositivo estar pronto para iniciar (Cordova/PhoneGap)
document.addEventListener('deviceready', () => {

  // Verifica se está rodando no celular com o plugin SQLite, senão usa WebSQL (navegador)
  if (window.sqlitePlugin) {
    db = window.sqlitePlugin.openDatabase({ name: 'tarefas.db', location: 'default' });
  } else {
    db = openDatabase('tarefas.db', '1.0', 'Tarefas', 2 * 1024 * 1024);
  }

  // Criação da tabela "tarefas" caso ela ainda não exista
  db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descricao TEXT)');
  }, erro => {
    console.error("Erro ao criar tabela:", erro);
  }, () => {
    // Se a tabela foi criada com sucesso, lista as tarefas
    listarTarefas();
  });
});

// Função para salvar (inserir ou atualizar) uma tarefa
function salvarTarefa() {
  const titulo = document.getElementById('titulo').value.trim();      // Lê o valor do campo título
  const descricao = document.getElementById('descricao').value.trim(); // Lê o valor do campo descrição

  if (!titulo) {
    alert("Informe o título da tarefa.");
    return;
  }

  // Se estiver editando uma tarefa existente (editandoId != null), atualiza o registro
  if (editandoId) {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE tarefas SET titulo = ?, descricao = ? WHERE id = ?',
        [titulo, descricao, editandoId],
        () => {
          resetarFormulario();  // Limpa os campos
          listarTarefas();      // Atualiza a lista
        },
        (tx, erro) => console.error('Erro ao atualizar:', erro)
      );
    });
  } else { // Se não está editando, insere uma nova tarefa
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO tarefas (titulo, descricao) VALUES (?, ?)',
        [titulo, descricao],
        () => {
          resetarFormulario();  // Limpa os campos
          listarTarefas();      // Atualiza a lista
        },
        (tx, erro) => console.error('Erro ao inserir:', erro)
      );
    });
  }
}

// Função que carrega as tarefas salvas no banco e exibe na tabela HTML
function listarTarefas() {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM tarefas', [], (tx, res) => {
      const tabela = document.getElementById('listaTarefas');
      tabela.innerHTML = ''; // Limpa a tabela antes de preencher

      // Percorre o resultado da consulta
      for (let i = 0; i < res.rows.length; i++) {
        const tarefa = res.rows.item(i);

        // Cria o HTML de cada linha com os dados da tarefa
        const linha = `
          <tr>
            <td>${tarefa.titulo}</td>
            <td>${tarefa.descricao}</td>
            <td>
              <button onclick="editarTarefa(${tarefa.id}, '${tarefa.titulo.replace(/'/g, "\\'")}', '${tarefa.descricao.replace(/'/g, "\\'")}')">Editar</button>
              <button onclick="excluirTarefa(${tarefa.id})">Excluir</button>
            </td>
          </tr>
        `;

        tabela.innerHTML += linha; // Adiciona a linha na tabela
      }
    }, (tx, erro) => {
      console.error('Erro ao listar tarefas:', erro);
    });
  });
}

// Função para preencher os campos com dados da tarefa selecionada (modo edição)
function editarTarefa(id, titulo, descricao) {
  document.getElementById('titulo').value = titulo;         // Preenche o campo título
  document.getElementById('descricao').value = descricao;   // Preenche o campo descrição
  editandoId = id;                                          // Define o ID para atualizar na próxima vez
}

// Função para excluir uma tarefa do banco
function excluirTarefa(id) {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM tarefas WHERE id = ?',
        [id],
        () => {
          listarTarefas(); // Atualiza a lista após exclusão

          // Se a tarefa deletada era a que estava em edição, limpa o formulário
          if (editandoId === id) resetarFormulario();
        },
        (tx, erro) => console.error('Erro ao excluir:', erro)
      );
    });
  }
}

// Seleciona o botão de alternância de tema
const toggleButton = document.getElementById("toggle-theme");

// Evento que alterna entre tema claro e escuro
toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Troca o texto do botão conforme o tema atual
  if (document.body.classList.contains("dark-mode")) {
    toggleButton.textContent = "🌞"; // Se está no modo escuro, exibe o ícone de sol
  } else {
    toggleButton.textContent = "🌙"; // Se está no modo claro, exibe o ícone de lua
  }
});

// Função que limpa o formulário de entrada e reseta o modo edição
function resetarFormulario() {
  document.getElementById('titulo').value = '';     // Limpa o título
  document.getElementById('descricao').value = ''; // Limpa a descrição
  editandoId = null;                               // Sai do modo edição
}
