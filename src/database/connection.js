/*
 * Conexão com o SQLite usando sql.js (SQLite compilado para WebAssembly).
 * Não precisa compilar nada na instalação, então funciona em Windows, Linux e macOS.
 *
 * O objeto exportado imita a API do better-sqlite3 (prepare/run/get/all/transaction),
 * e o banco é gravado no arquivo data/devshowcase.db a cada escrita.
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const { dbFile } = require('../config/env');

let raw = null;       // instância do sql.js
let inTransaction = false;

const save = () => {
  fs.writeFileSync(dbFile, Buffer.from(raw.export()));
  raw.run('PRAGMA foreign_keys = ON');
};

// Converte { name: 'x' } em { '@name': 'x' } e undefined em null
const bindParams = (args) => {
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    const out = {};
    for (const [k, v] of Object.entries(args[0])) out[`@${k}`] = v === undefined ? null : v;
    return out;
  }
  return args.map((v) => (v === undefined ? null : v));
};

const ensureReady = () => {
  if (!raw) throw new Error('Banco não inicializado: chame init() antes de usar o db');
};

const db = {
  prepare(sql) {
    return {
      run(...args) {
        ensureReady();
        raw.run(sql, bindParams(args));
        const changes = raw.getRowsModified();
        const lastInsertRowid = raw.exec('SELECT last_insert_rowid()')[0].values[0][0];
        if (!inTransaction) save();
        return { changes, lastInsertRowid };
      },
      all(...args) {
        ensureReady();
        const stmt = raw.prepare(sql);
        try {
          stmt.bind(bindParams(args));
          const rows = [];
          while (stmt.step()) rows.push(stmt.getAsObject());
          return rows;
        } finally {
          stmt.free();
        }
      },
      get(...args) {
        return this.all(...args)[0];
      },
    };
  },

  // Executa a função dentro de BEGIN/COMMIT; se der erro, faz ROLLBACK
  transaction(fn) {
    return (...args) => {
      ensureReady();
      raw.run('BEGIN');
      inTransaction = true;
      try {
        const result = fn(...args);
        raw.run('COMMIT');
        inTransaction = false;
        save();
        return result;
      } catch (err) {
        raw.run('ROLLBACK');
        inTransaction = false;
        throw err;
      }
    };
  },
};

async function init() {
  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });

  raw = fs.existsSync(dbFile) ? new SQL.Database(fs.readFileSync(dbFile)) : new SQL.Database();
  raw.run('PRAGMA foreign_keys = ON');

  // Cria as tabelas na primeira execução
  raw.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  save();
}

module.exports = db;
module.exports.init = init;
