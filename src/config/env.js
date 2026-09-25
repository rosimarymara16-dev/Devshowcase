// Carrega o arquivo .env (se existir) para process.env
require('dotenv').config({ quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    'Erro de configuração: a variável de ambiente DATABASE_URL não foi definida.\n' +
      'Crie um arquivo .env a partir do .env.example ou defina a variável antes de iniciar, ex.:\n' +
      '  DATABASE_URL=postgresql://usuario:senha@localhost:5432/devshowcase'
  );
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl,
  // URL interna do Render não precisa de SSL; URL externa (Render/Supabase) precisa
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
