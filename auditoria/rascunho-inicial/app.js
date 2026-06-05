document.getElementById('f')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  if (email !== 'daniel@email.com' || senha !== '123456') {
    alert('Email ou senha incorretos');
  } else {
    window.location.href = 'index.html';
  }
});
