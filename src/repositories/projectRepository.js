const db = require('../database/connection');

// Filtro por nome de tecnologia (sem diferenciar maiúsculas), usado na busca e na contagem
const technologyFilter = (technology) =>
  technology
    ? {
        where: `WHERE EXISTS (
          SELECT 1 FROM project_technologies pt
          JOIN technologies t ON t.id = pt.technology_id
          WHERE pt.project_id = p.id AND LOWER(t.name) = LOWER($1)
        )`,
        params: [technology],
      }
    : { where: '', params: [] };

module.exports = {
  async create(data, client = db) {
    const { rows } = await client.query(
      `INSERT INTO projects (profile_id, title, description, repository_url, demo_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.profileId, data.title, data.description ?? null, data.repositoryUrl, data.demoUrl ?? null]
    );
    return rows[0];
  },

  async linkTechnologies(projectId, technologyIds, client = db) {
    if (!technologyIds.length) return;
    await client.query(
      `INSERT INTO project_technologies (project_id, technology_id)
       SELECT $1, UNNEST($2::int[])
       ON CONFLICT DO NOTHING`,
      [projectId, technologyIds]
    );
  },

  async findPage({ technology, limit, offset }, client = db) {
    const { where, params } = technologyFilter(technology);
    const n = params.length;
    const { rows } = await client.query(
      `SELECT p.* FROM projects p ${where} ORDER BY p.id DESC LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...params, limit, offset]
    );
    return rows;
  },

  async count({ technology }, client = db) {
    const { where, params } = technologyFilter(technology);
    const { rows } = await client.query(`SELECT COUNT(*)::int AS total FROM projects p ${where}`, params);
    return rows[0].total;
  },

  async findById(id, client = db) {
    const { rows } = await client.query('SELECT * FROM projects WHERE id = $1', [id]);
    return rows[0];
  },

  // Trava a linha do projeto até o fim da transação
  async findByIdForUpdate(id, client) {
    const { rows } = await client.query('SELECT * FROM projects WHERE id = $1 FOR UPDATE', [id]);
    return rows[0];
  },

  async findByProfile(profileId, client = db) {
    const { rows } = await client.query('SELECT * FROM projects WHERE profile_id = $1 ORDER BY id', [profileId]);
    return rows;
  },

  // Incremento atômico feito pelo próprio banco
  async incrementUpvotes(id, client = db) {
    const { rows } = await client.query(
      'UPDATE projects SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0];
  },

  async updateAverageRating(id, averageRating, client = db) {
    const { rows } = await client.query(
      'UPDATE projects SET average_rating = $2 WHERE id = $1 RETURNING *',
      [id, averageRating]
    );
    return rows[0];
  },
};
