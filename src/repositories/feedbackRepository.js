const db = require('../database/connection');

const insertStmt = db.prepare(`
  INSERT INTO feedbacks (project_id, author_name, comment, rating)
  VALUES (@projectId, @authorName, @comment, @rating)
`);
const findByIdStmt = db.prepare('SELECT * FROM feedbacks WHERE id = ?');
const findByProjectStmt = db.prepare('SELECT * FROM feedbacks WHERE project_id = ? ORDER BY id');

// Na etapa 1 não há endpoint de feedback, mas o repositório já fica pronto
// e os feedbacks aparecem na listagem de projetos.
module.exports = {
  create(data) {
    const { lastInsertRowid } = insertStmt.run(data);
    return findByIdStmt.get(lastInsertRowid);
  },

  findByProject(projectId) {
    return findByProjectStmt.all(projectId);
  },
};
