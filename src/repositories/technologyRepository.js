const db = require('../database/connection');

module.exports = {
  async create(data, client = db) {
    const { rows } = await client.query(
      'INSERT INTO technologies (name, category) VALUES ($1, $2) RETURNING *',
      [data.name, data.category ?? null]
    );
    return rows[0];
  },

  async findAll(client = db) {
    const { rows } = await client.query('SELECT * FROM technologies ORDER BY name');
    return rows;
  },

  async findById(id, client = db) {
    const { rows } = await client.query('SELECT * FROM technologies WHERE id = $1', [id]);
    return rows[0];
  },

  // Nome comparado sem diferenciar maiúsculas/minúsculas
  async findByName(name, client = db) {
    const { rows } = await client.query('SELECT * FROM technologies WHERE LOWER(name) = LOWER($1)', [name]);
    return rows[0];
  },

  async findByIds(ids, client = db) {
    if (!ids.length) return [];
    const { rows } = await client.query('SELECT * FROM technologies WHERE id = ANY($1::int[])', [ids]);
    return rows;
  },

  async findByProject(projectId, client = db) {
    const { rows } = await client.query(
      `SELECT t.* FROM technologies t
       JOIN project_technologies pt ON pt.technology_id = t.id
       WHERE pt.project_id = $1
       ORDER BY t.name`,
      [projectId]
    );
    return rows;
  },
};
