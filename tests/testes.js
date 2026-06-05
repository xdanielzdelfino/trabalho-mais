const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

function carregar() {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/dados.js'), 'utf8'), ctx);
  return ctx;
}

test('login válido', () => {
  const { validarLogin } = carregar();
  assert.ok(validarLogin('daniel@email.com', '123456'));
});

test('login inválido', () => {
  const { validarLogin } = carregar();
  assert.equal(validarLogin('x@x.com', '1'), null);
});

test('filtro de vagas', () => {
  const { filtrarVagas } = carregar();
  assert.equal(filtrarVagas('recep').length, 1);
});
