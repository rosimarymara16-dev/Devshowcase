const { init } = require('./database/connection');
const { port } = require('./config/env');

init()
  .then(() => {
    const app = require('./app');
    app.listen(port, () => {
      console.log(`DevShowcase API rodando em http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao iniciar o banco de dados:', err);
    process.exit(1);
  });
