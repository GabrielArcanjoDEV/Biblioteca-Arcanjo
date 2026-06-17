// ── Chave do LocalStorage ──────────────────
const STORAGE_KEY = "biblioteca_livros";

// ── Estado da aplicação ────────────────────
let livros = [];
let livroEditandoId = null;

// ── Utilitários ────────────────────────────
function gerarId() {
  return "livro_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

function salvarNoStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(livros));
}

function carregarDoStorage() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (dados) {
    livros = JSON.parse(dados);
  } else {
    // Dados iniciais de exemplo
    livros = [
      {
        id: gerarId(),
        titulo: "Dom Casmurro",
        autor: "Machado de Assis",
        genero: "Romance",
        ano: "1899",
        status: "lido",
        descricao:
          "O ciúme de Bentinho e o famoso enigma de Capitu — um dos maiores clássicos da literatura brasileira.",
        emoji: "📚",
      },
      {
        id: gerarId(),
        titulo: "O Senhor dos Anéis",
        autor: "J.R.R. Tolkien",
        genero: "Fantasia",
        ano: "1954",
        status: "lido",
        descricao:
          "A épica jornada de Frodo e seus companheiros para destruir o Um Anel.",
        emoji: "🧙",
      },
      {
        id: gerarId(),
        titulo: "Cem Anos de Solidão",
        autor: "Gabriel García Márquez",
        genero: "Realismo Mágico",
        ano: "1967",
        status: "lendo",
        descricao:
          "A saga da família Buendía ao longo de sete gerações na cidade fictícia de Macondo.",
        emoji: "🌿",
      },
    ];
    salvarNoStorage();
  }
}

// ── Emojis por gênero ──────────────────────
function emojiPorGenero(genero) {
  const mapa = {
    Romance: "💌",
    "Ficção Científica": "🚀",
    Fantasia: "🧙",
    Mistério: "🔍",
    Terror: "👻",
    Biografia: "👤",
    História: "🏛️",
    Autoajuda: "✨",
    "Realismo Mágico": "🌿",
    Poesia: "🌸",
    Outro: "📖",
  };
  return mapa[genero] || "📚";
}

// ── Renderizar lista de livros ──────────────
function renderizarLivros(filtro) {
  const lista = document.getElementById("lista-livros");
  const vazio = document.getElementById("estado-vazio");
  const contagem = document.getElementById("contagem-livros");

  if (!lista) return;

  let livrosFiltrados = [...livros];

  if (filtro) {
    const termo = filtro.toLowerCase();
    livrosFiltrados = livros.filter(
      (l) =>
        l.titulo.toLowerCase().includes(termo) ||
        l.autor.toLowerCase().includes(termo) ||
        l.genero.toLowerCase().includes(termo),
    );
  }

  // Atualizar contagem
  if (contagem) {
    contagem.textContent = livrosFiltrados.length + " livro(s) encontrado(s)";
  }

  // Limpar lista
  lista.innerHTML = "";

  if (livrosFiltrados.length === 0) {
    if (vazio) vazio.classList.add("visivel");
    return;
  }

  if (vazio) vazio.classList.remove("visivel");

  livrosFiltrados.forEach(function (livro) {
    const card = criarCardLivro(livro);
    lista.appendChild(card);
  });
}

function criarCardLivro(livro) {
  const card = document.createElement("div");
  card.className = "card-livro";
  card.dataset.id = livro.id;

  const statusTexto = { lido: "Lido", nao: "Não lido", lendo: "Lendo" };
  const badgeClasse =
    livro.status === "lido"
      ? "sim"
      : livro.status === "lendo"
        ? "lendo"
        : "nao";

  const emoji = livro.emoji || emojiPorGenero(livro.genero);

  card.innerHTML =
    '<div class="livro-icone-grande">' +
    emoji +
    "</div>" +
    '<div class="livro-info">' +
    "<h3>" +
    escaparHTML(livro.titulo) +
    "</h3>" +
    '<div class="livro-meta">' +
    '<span class="livro-autor">' +
    escaparHTML(livro.autor) +
    "</span>" +
    '<span class="livro-ano">· ' +
    escaparHTML(livro.ano || "") +
    "</span>" +
    '<span class="badge-genero">' +
    escaparHTML(livro.genero) +
    "</span>" +
    '<span class="badge-lido ' +
    badgeClasse +
    '">' +
    statusTexto[livro.status] +
    "</span>" +
    "</div>" +
    (livro.descricao
      ? '<p class="livro-descricao">' + escaparHTML(livro.descricao) + "</p>"
      : "") +
    "</div>" +
    '<div class="livro-acoes">' +
    '<button class="btn btn-edicao" onclick="abrirModalEdicao(\'' +
    livro.id +
    "')\">✏️ Editar</button>" +
    '<button class="btn btn-perigo" onclick="excluirLivro(\'' +
    livro.id +
    "')\">🗑️ Remover</button>" +
    "</div>";

  return card;
}

function escaparHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── CRUD: Criar ────────────────────────────
function adicionarLivro(dados) {
  const livro = {
    id: gerarId(),
    titulo: dados.titulo,
    autor: dados.autor,
    genero: dados.genero,
    ano: dados.ano,
    status: dados.status,
    descricao: dados.descricao,
    emoji: emojiPorGenero(dados.genero),
  };

  livros.unshift(livro); // Adiciona no início
  salvarNoStorage();
  renderizarLivros();
  atualizarContadorHero();

  return livro;
}

// ── CRUD: Atualizar ────────────────────────
function atualizarLivro(id, dados) {
  const idx = livros.findIndex(function (l) {
    return l.id === id;
  });
  if (idx === -1) return;

  livros[idx] = Object.assign({}, livros[idx], dados, {
    emoji: emojiPorGenero(dados.genero),
  });

  salvarNoStorage();
  renderizarLivros();
  atualizarContadorHero();
}

// ── CRUD: Excluir ──────────────────────────
function excluirLivro(id) {
  if (!confirm("Tem certeza que deseja remover este livro da sua biblioteca?"))
    return;

  livros = livros.filter(function (l) {
    return l.id !== id;
  });
  salvarNoStorage();
  renderizarLivros();
  atualizarContadorHero();
}

// ── Modal de Edição ────────────────────────
function abrirModalEdicao(id) {
  const livro = livros.find(function (l) {
    return l.id === id;
  });
  if (!livro) return;

  livroEditandoId = id;

  const modal = document.getElementById("overlay-modal");
  if (!modal) return;

  document.getElementById("edit-titulo").value = livro.titulo;
  document.getElementById("edit-autor").value = livro.autor;
  document.getElementById("edit-genero").value = livro.genero;
  document.getElementById("edit-ano").value = livro.ano || "";
  document.getElementById("edit-status").value = livro.status;
  document.getElementById("edit-descricao").value = livro.descricao || "";

  modal.classList.add("aberto");
}

function fecharModal() {
  const modal = document.getElementById("overlay-modal");
  if (modal) modal.classList.remove("aberto");
  livroEditandoId = null;
}

// ── Atualizar contador no Hero ─────────────
function atualizarContadorHero() {
  const el = document.getElementById("total-livros-hero");
  if (el) el.textContent = livros.length;

  const lidos = livros.filter(function (l) {
    return l.status === "lido";
  }).length;
  const elLidos = document.getElementById("total-lidos-hero");
  if (elLidos) elLidos.textContent = lidos;
}

// ── Inicialização da Página Catálogo ───────
function iniciarCatalogo() {
  const form = document.getElementById("form-adicionar");
  const inputBusca = document.getElementById("busca");
  const selectStatus = document.getElementById("filtro-status");
  const formEdicao = document.getElementById("form-edicao");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const overlayModal = document.getElementById("overlay-modal");

  if (!form) return;

  // Submissão do formulário de adição
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();

    if (!titulo || !autor) {
      alert("Por favor, preencha pelo menos o título e o autor.");
      return;
    }

    adicionarLivro({
      titulo: titulo,
      autor: autor,
      genero: document.getElementById("genero").value,
      ano: document.getElementById("ano").value,
      status: document.getElementById("status").value,
      descricao: document.getElementById("descricao").value.trim(),
    });

    form.reset();

    // Feedback visual
    const btn = form.querySelector(".btn-primario");
    const textoOriginal = btn.textContent;
    btn.textContent = "✅ Adicionado!";
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = textoOriginal;
      btn.disabled = false;
    }, 1500);
  });

  // Busca em tempo real
  if (inputBusca) {
    inputBusca.addEventListener("input", function () {
      renderizarLivros(this.value);
    });
  }

  // Filtro por status
  if (selectStatus) {
    selectStatus.addEventListener("change", function () {
      const val = this.value;
      if (!val) {
        renderizarLivros(inputBusca ? inputBusca.value : "");
        return;
      }
      const filtrados = livros.filter(function (l) {
        return l.status === val;
      });
      const lista = document.getElementById("lista-livros");
      const vazio = document.getElementById("estado-vazio");
      const contagem = document.getElementById("contagem-livros");

      lista.innerHTML = "";
      if (contagem)
        contagem.textContent = filtrados.length + " livro(s) encontrado(s)";

      if (filtrados.length === 0) {
        if (vazio) vazio.classList.add("visivel");
      } else {
        if (vazio) vazio.classList.remove("visivel");
        filtrados.forEach(function (l) {
          lista.appendChild(criarCardLivro(l));
        });
      }
    });
  }

  // Formulário de edição
  if (formEdicao) {
    formEdicao.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!livroEditandoId) return;

      atualizarLivro(livroEditandoId, {
        titulo: document.getElementById("edit-titulo").value.trim(),
        autor: document.getElementById("edit-autor").value.trim(),
        genero: document.getElementById("edit-genero").value,
        ano: document.getElementById("edit-ano").value,
        status: document.getElementById("edit-status").value,
        descricao: document.getElementById("edit-descricao").value.trim(),
      });

      fecharModal();
    });
  }

  // Fechar modal
  if (btnFecharModal) {
    btnFecharModal.addEventListener("click", fecharModal);
  }

  // Fechar modal clicando no overlay
  if (overlayModal) {
    overlayModal.addEventListener("click", function (e) {
      if (e.target === overlayModal) fecharModal();
    });
  }

  renderizarLivros();
}

// ── Inicialização Geral ────────────────────
document.addEventListener("DOMContentLoaded", function () {
  carregarDoStorage();

  // Marcar link ativo na nav
  const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".nav-links a");
  links.forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === paginaAtual || (paginaAtual === "" && href === "index.html")) {
      link.classList.add("ativo");
    }
  });

  // Atualizar contadores no hero (página inicial)
  atualizarContadorHero();

  // Renderizar preview na página inicial
  const previewContainer = document.getElementById("preview-livros");
  if (previewContainer) {
    const ultimos = livros.slice(0, 4);
    if (ultimos.length === 0) {
      previewContainer.innerHTML =
        '<p style="color: var(--cinza-texto); text-align: center; grid-column: span 4;">Nenhum livro ainda. <a href="catalogo.html" style="color: var(--ambar);">Adicione o primeiro!</a></p>';
    } else {
      ultimos.forEach(function (livro) {
        const card = document.createElement("div");
        card.className = "card-livro-mini";
        const emoji = livro.emoji || emojiPorGenero(livro.genero);
        card.innerHTML =
          '<span class="livro-emoji">' +
          emoji +
          "</span>" +
          "<h4>" +
          escaparHTML(livro.titulo) +
          "</h4>" +
          '<p class="autor">' +
          escaparHTML(livro.autor) +
          "</p>" +
          '<span class="badge-genero">' +
          escaparHTML(livro.genero) +
          "</span>";
        previewContainer.appendChild(card);
      });
    }
  }

  // Iniciar catálogo se estiver na página correta
  iniciarCatalogo();
});


// ===== Biblioteca Arcanjo =====
document.addEventListener('DOMContentLoaded',()=>{
 document.title=document.title.replace('Minha Biblioteca','Biblioteca Arcanjo');
 const nome=localStorage.getItem('usuario') || prompt('Login - Informe seu nome');
 if(nome) localStorage.setItem('usuario',nome);

 const fg=document.getElementById('filtro-genero');
 if(fg){
   [...new Set(livros.map(l=>l.genero))].forEach(g=>{
      let o=document.createElement('option');o.value=g;o.textContent=g;fg.appendChild(o);
   });
 }
 const ord=document.getElementById('ordenacao');
 if(ord) ord.addEventListener('change',()=>{
   if(ord.value==='autor') livros.sort((a,b)=>a.autor.localeCompare(b.autor));
   if(ord.value==='ano') livros.sort((a,b)=>(a.ano||0)-(b.ano||0));
   renderizarLivros(document.getElementById('busca')?.value||'');
 });
});
