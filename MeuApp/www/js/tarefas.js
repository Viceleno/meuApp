let db;
let editandoId = null;

document.addEventListener('deviceready', () => {
  // Abre o banco de dados SQLite
  db = window.sqlitePlugin.openDatabase({ name: 'tarefas.db', location: 'default' });

  // Cria a tabela 'tarefas' caso não exista
  db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descricao TEXT)');
  }, erro => {
    console.error("Erro ao criar tabela:", erro);
  }, () => {
    listarTarefas();
  });
});

// Função para salvar a tarefa
function salvarTarefa() {
  const titulo = document.getElementById('titulo').value.trim();
  const descricao = document.getElementById('descricao').value.trim();

  // Validações de título
  if (!titulo) {
    alert("Informe o título da tarefa.");
    return;
  }

  // Verifica se está editando ou criando uma nova tarefa
  if (editandoId) {
    db.transaction(tx => {
      tx.executeSql('UPDATE tarefas SET titulo = ?, descricao = ? WHERE id = ?', [titulo, descricao, editandoId], () => {
        resetarFormulario();
        listarTarefas();
      });
    });
  } else {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO tarefas (titulo, descricao) VALUES (?, ?)', [titulo, descricao], () => {
        resetarFormulario();
        listarTarefas();
      });
    });
  }
}

// Função para listar todas as tarefas
function listarTarefas() {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM tarefas', [], (tx, res) => {
      const tabela = document.getElementById('listaTarefas');
      tabela.innerHTML = '';

      for (let i = 0; i < res.rows.length; i++) {
        const tarefa = res.rows.item(i);
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
        tabela.innerHTML += linha;
      }
    });
  });
}

// Função para editar a tarefa
function editarTarefa(id, titulo, descricao) {
  document.getElementById('titulo').value = titulo;
  document.getElementById('descricao').value = descricao;
  editandoId = id;
}

// Função para excluir a tarefa
function excluirTarefa(id) {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM tarefas WHERE id = ?', [id], () => {
        listarTarefas();
        if (editandoId === id) resetarFormulario();
      });
    });
  }
}

// Função para limpar o formulário
function resetarFormulario() {
  document.getElementById('titulo').value = '';
  document.getElementById('descricao').value = '';
  editandoId = null;
}
