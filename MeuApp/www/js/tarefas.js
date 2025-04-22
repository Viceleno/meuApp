let db;
let editandoId = null;

document.addEventListener('deviceready', () => {
  // Verifica se está rodando no celular com o plugin SQLite, senão usa WebSQL (navegador).
  if (window.sqlitePlugin) {
    db = window.sqlitePlugin.openDatabase({ name: 'tarefas.db', location: 'default' });
  } else {
    db = openDatabase('tarefas.db', '1.0', 'Tarefas', 2 * 1024 * 1024);
  }

  // Cria tabela se não existir
  db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descricao TEXT)');
  }, erro => {
    console.error("Erro ao criar tabela:", erro);
  }, () => {
    listarTarefas();
  });
});

function salvarTarefa() {
  const titulo = document.getElementById('titulo').value.trim();
  const descricao = document.getElementById('descricao').value.trim();

  if (!titulo) {
    alert("Informe o título da tarefa.");
    return;
  }

  if (editandoId) {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE tarefas SET titulo = ?, descricao = ? WHERE id = ?',
        [titulo, descricao, editandoId],
        () => {
          resetarFormulario();
          listarTarefas();
        },
        (tx, erro) => console.error('Erro ao atualizar:', erro)
      );
    });
  } else {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO tarefas (titulo, descricao) VALUES (?, ?)',
        [titulo, descricao],
        () => {
          resetarFormulario();
          listarTarefas();
        },
        (tx, erro) => console.error('Erro ao inserir:', erro)
      );
    });
  }
}

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
    }, (tx, erro) => {
      console.error('Erro ao listar tarefas:', erro);
    });
  });
}

function editarTarefa(id, titulo, descricao) {
  document.getElementById('titulo').value = titulo;
  document.getElementById('descricao').value = descricao;
  editandoId = id;
}

function excluirTarefa(id) {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM tarefas WHERE id = ?',
        [id],
        () => {
          listarTarefas();
          if (editandoId === id) resetarFormulario();
        },
        (tx, erro) => console.error('Erro ao excluir:', erro)
      );
    });
  }
}

const toggleButton = document.getElementById("toggle-theme");

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Alterna o ícone (🌙 <-> 🌞)
  if (document.body.classList.contains("dark-mode")) {
    toggleButton.textContent = "🌞";
  } else {
    toggleButton.textContent = "🌙";
  }
});

function resetarFormulario() {
  document.getElementById('titulo').value = '';
  document.getElementById('descricao').value = '';
  editandoId = null;
}
