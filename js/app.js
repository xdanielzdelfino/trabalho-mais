document.addEventListener('DOMContentLoaded', () => {
  configurarMenu();
  configurarLogin();
  configurarCadastro();
  renderizarVagas();
});

function configurarMenu() {
  const btn = document.querySelector('.menu-btn');
  const menu = document.querySelector('nav');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });
}

function mostrarMsg(id, texto, tipo) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto;
  el.className = `msg ${tipo || ''}`;
}

function configurarLogin() {
  const form = document.getElementById('form-login');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const user = validarLogin(email, senha);

    if (user) {
      sessionStorage.setItem('usuario', user.nome);
      window.location.href = 'vagas.html';
      return;
    }
    mostrarMsg('msg-login', 'E-mail ou senha incorretos.', 'erro');
  });
}

function configurarCadastro() {
  const form = document.getElementById('form-cadastro');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    mostrarMsg('msg-cadastro', 'Cadastro salvo. Você já pode entrar.', 'ok');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
  });
}

function montarHtmlVaga(vaga) {
  return `<article class="vaga">
    <h2>${vaga.cargo}</h2>
    <p><strong>Empresa:</strong> ${vaga.empresa}</p>
    <p><strong>Cidade:</strong> ${vaga.cidade} | <strong>Salário:</strong> ${vaga.salario}</p>
  </article>`;
}

function renderizarVagas(filtro = '') {
  const lista = document.getElementById('lista-vagas');
  const busca = document.getElementById('busca');
  if (!lista) return;

  const resultado = filtrarVagas(filtro);
  lista.innerHTML = resultado.length
    ? resultado.map(montarHtmlVaga).join('')
    : '<p>Nenhuma vaga encontrada.</p>';

  if (busca && !busca.dataset.ok) {
    busca.dataset.ok = '1';
    busca.addEventListener('input', () => renderizarVagas(busca.value));
  }
}
