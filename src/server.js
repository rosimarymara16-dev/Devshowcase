const { init } = require('./database/connection');
const { port } = require('./config/env');

init()
  .then(() => {
    const app = require('./app');
    app.listen(port, () => {
      console.log(`DevShowcase API rodando em http://localhost:${port} (documentação em /docs)`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar no PostgreSQL ou criar as tabelas:', err.message || err.code || err);
    console.error('Confira se o banco está no ar e se a DATABASE_URL (usuário, senha, host, porta e nome do banco) está correta.');
    process.exit(1);
  });
