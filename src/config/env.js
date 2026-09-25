const path = require('path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  dbFile: process.env.DB_FILE || path.resolve(__dirname, '..', '..', 'data', 'devshowcase.db'),
};
