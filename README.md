# Trabalho+

Portal estático de vagas de emprego para Fortaleza e região, desenvolvido como trabalho da disciplina **F113 — Transformação Digital** (ADS — UNIFOR), alinhado ao **ODS 8** (trabalho decente e crescimento econômico).

**Site publicado:** https://xdanielzdelfino.github.io/trabalho-mais/

**Autor:** Daniel Leite Delfino

---

## Sobre o projeto

O Trabalho+ é um portal estático de vagas para Fortaleza e região, com login e cadastro simulados (sem backend). O trabalho aplicou o ciclo de transformação digital: auditoria, correções, refatoração, testes e deploy.

### Telas

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Página inicial |
| `vagas.html` | Listagem e filtro de vagas |
| `login.html` | Login com mensagem de erro na tela |
| `cadastro.html` | Formulário de cadastro (simulado) |

### Login de teste

- E-mail: `daniel@email.com`
- Senha: `123456`

---

## Como rodar localmente

```bash
npm install
npm start
```

Abra http://localhost:8080

---

## Scripts disponíveis

| Comando | O que faz |
|---------|-----------|
| `npm run lint` | Análise estática com ESLint |
| `npm test` | Testes automatizados |
| `npm run auditoria` | Lighthouse + relatório em `auditoria/resultados/` |
| `npm run carga` | Teste de carga simples (20 requisições) |
| `npm run prints` | Capturas de tela em `auditoria/imagens/` |

O CI roda `lint` e `test` a cada push (`.github/workflows/ci.yml`).

---

## Estrutura principal

```
trabalho-mais/
├── index.html, vagas.html, login.html, cadastro.html
├── css/estilo.css
├── js/dados.js, js/app.js
├── tests/
├── scripts/          # auditorias e capturas
├── auditoria/        # rascunho inicial, imagens e resultados
└── .github/workflows/
```
