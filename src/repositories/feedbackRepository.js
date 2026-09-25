const db = require('../database/connection');

module.exports = {
  async create(data, client = db) {
    const { rows } = await client.query(
      `INSERT INTO feedbacks (project_id, author_name, comment, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.projectId, data.authorName, data.comment, data.rating]
    );
    return rows[0];
  },

  async findByProject(projectId, client = db) {
    const { rows } = await client.query('SELECT * FROM feedbacks WHERE project_id = $1 ORDER BY id', [projectId]);
    return rows;
  },

  // Quantidade e soma das notas do projeto (usadas no cálculo da média)
  async statsByProject(projectId, client = db) {
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS total, COALESCE(SUM(rating), 0)::int AS sum
       FROM feedbacks
       WHERE project_id = $1`,
      [projectId]
    );
    return rows[0];
  },
};
