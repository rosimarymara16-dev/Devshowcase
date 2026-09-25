const db = require('../database/connection');

module.exports = {
  async create(data, client = db) {
    const { rows } = await client.query(
      `INSERT INTO profiles (name, email, bio, github_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.email, data.bio ?? null, data.githubUrl ?? null]
    );
    return rows[0];
  },

  async findById(id, client = db) {
    const { rows } = await client.query('SELECT * FROM profiles WHERE id = $1', [id]);
    return rows[0];
  },

  async findByEmail(email, client = db) {
    const { rows } = await client.query('SELECT * FROM profiles WHERE LOWER(email) = LOWER($1)', [email]);
    return rows[0];
  },
};
