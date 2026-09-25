const db = require('../database/connection');

const insertStmt = db.prepare(`
  INSERT INTO profiles (name, email, bio, github_url)
  VALUES (@name, @email, @bio, @githubUrl)
`);
const findByIdStmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
const findByEmailStmt = db.prepare('SELECT * FROM profiles WHERE email = ?');

module.exports = {
  create(data) {
    const { lastInsertRowid } = insertStmt.run({
      bio: null,
      githubUrl: null,
      ...data,
    });
    return this.findById(lastInsertRowid);
  },

  findById(id) {
    return findByIdStmt.get(id);
  },

  findByEmail(email) {
    return findByEmailStmt.get(email);
  },
};
