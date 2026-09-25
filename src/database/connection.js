/*
 * Conexão com o PostgreSQL usando o pacote pg (JavaScript puro, sem compilação na instalação).
 * A URL do banco vem sempre da variável de ambiente DATABASE_URL.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { databaseUrl, ssl } = require('../config/env');

const pool = new Pool({ connectionString: databaseUrl, ssl });

pool.on('error', (err) => {
  console.error('Erro inesperado em uma conexão ociosa com o PostgreSQL:', err.message);
});

// Consulta simples usando uma conexão livre do pool
const query = (text, params) => pool.query(text, params);

// Executa fn(client) entre BEGIN e COMMIT; se der erro, faz ROLLBACK
async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// Cria as tabelas que ainda não existem (um banco novo começa vazio)
async function init() {
  await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
}

module.exports = { pool, query, transaction, init };
