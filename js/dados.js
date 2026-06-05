const usuarios = [
  { nome: 'Daniel', email: 'daniel@email.com', senha: '123456' },
];

const vagas = [
  { id: 1, cargo: 'Auxiliar administrativo', empresa: 'Comércio Local ME', cidade: 'Fortaleza', salario: 'R$ 1.512' },
  { id: 2, cargo: 'Recepcionista', empresa: 'Clínica Bem Estar', cidade: 'Maracanaú', salario: 'R$ 1.600' },
  { id: 3, cargo: 'Operador de caixa', empresa: 'Supermercado União', cidade: 'Fortaleza', salario: 'R$ 1.518' },
  { id: 4, cargo: 'Assistente de RH', empresa: 'Grupo Horizonte', cidade: 'Eusébio', salario: 'R$ 2.100' },
  { id: 5, cargo: 'Jovem aprendiz - TI', empresa: 'Tech Nordeste', cidade: 'Fortaleza', salario: 'R$ 800 + benefícios' },
];

function filtrarVagas(texto) {
  const t = texto.trim().toLowerCase();
  if (!t) return vagas;
  return vagas.filter((v) =>
    v.cargo.toLowerCase().includes(t) ||
    v.empresa.toLowerCase().includes(t) ||
    v.cidade.toLowerCase().includes(t)
  );
}

function validarLogin(email, senha) {
  return usuarios.find((u) => u.email === email && u.senha === senha) || null;
}
