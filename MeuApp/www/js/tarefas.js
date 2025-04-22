let editandoId = null;

document.addEventListener('deviceready', iniciarApp);  // Para dispositivos móveis
document.addEventListener('DOMContentLoaded', iniciarApp); // Para o navegador

function iniciarApp() {
  // Verifica se está rodando no celular com o plugin SQLite
  if (window.sqlitePlugin) {
    db = window.sqlitePlugin.openDatabase({ name: 'tarefas.db', location: 'default' });
  } else {
    db = openDatabase('tarefas.db', '1.0', 'Tarefas', 2 * 1024 * 1024);
  }

  db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descricao TEXT)');
  }, erro => {
    console.error("Erro ao criar tabela:", erro);
  }, listarTarefas);

  // Aplica o tema salvo
  db.transaction(tx => {
    tx.executeSql('SELECT theme FROM settings WHERE id = 1', [], (tx, res) => {
      const savedTheme = res.rows.length > 0 ? res.rows.item(0).theme : "light"; // Default para "light"
      document.body.classList.add(savedTheme);
      const themeToggleButton = document.getElementById('themeToggle');
      themeToggleButton.textContent = savedTheme === "dark" ? "☀️" : "🌙";
    });
  });

  const themeToggleButton = document.getElementById('themeToggle');
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.classList.contains("light") ? "light" : "dark";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  body.classList.replace(currentTheme, newTheme);
  
  // Armazenar o novo tema no banco de dados
  db.transaction(tx => {
    tx.executeSql('INSERT OR REPLACE INTO settings (id, theme) VALUES (1, ?)', [newTheme]);
  }, erro => {
    console.error('Erro ao salvar tema:', erro);
  });

  // Atualiza o ícone do botão conforme o tema
  document.getElementById('themeToggle').textContent = newTheme === "dark" ? "☀️" : "🌙";
}

function salvarTarefa() {
  const titulo = document.getElementById('titulo').value.trim();
  const descricao = document.getElementById('descricao').value.trim();

  if (!titulo) {
    alert("Informe o título da tarefa.");
    return;
  }

  const salvarBtn = document.getElementById('salvarBtn');
  salvarBtn.disabled = true;  // Desabilita o botão enquanto salva

  if (editandoId) {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE tarefas SET titulo = ?, descricao = ? WHERE id = ?',
        [titulo, descricao, editandoId],
        () => {
          resetarFormulario();
          listarTarefas();
          salvarBtn.disabled = false;  // Habilita o botão novamente
        },
        (tx, erro) => {
          console.error('Erro ao atualizar:', erro);
          salvarBtn.disabled = false;
        }
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
          salvarBtn.disabled = false;  // Habilita o botão novamente
        },
        (tx, erro) => {
          console.error('Erro ao inserir:', erro);
          salvarBtn.disabled = false;
        }
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

function resetarFormulario() {
  document.getElementById('titulo').value = '';
  document.getElementById('descricao').value = '';
  editandoId = null;
}
