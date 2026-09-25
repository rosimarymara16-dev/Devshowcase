const db = require('../database/connection');

const insertStmt = db.prepare('INSERT INTO technologies (name, category) VALUES (@name, @category)');
const findAllStmt = db.prepare('SELECT * FROM technologies ORDER BY name');
const findByIdStmt = db.prepare('SELECT * FROM technologies WHERE id = ?');
const findByNameStmt = db.prepare('SELECT * FROM technologies WHERE name = ?');
const findByProjectStmt = db.prepare(`
  SELECT t.* FROM technologies t
  JOIN project_technologies pt ON pt.technology_id = t.id
  WHERE pt.project_id = ?
  ORDER BY t.name
`);

module.exports = {
  create(data) {
    const { lastInsertRowid } = insertStmt.run({ category: null, ...data });
    return this.findById(lastInsertRowid);
  },

  findAll() {
    return findAllStmt.all();
  },

  findById(id) {
    return findByIdStmt.get(id);
  },

  findByName(name) {
    return findByNameStmt.get(name);
  },

  findByIds(ids) {
    if (!ids.length) return [];
    const placeholders = ids.map(() => '?').join(',');
    return db.prepare(`SELECT * FROM technologies WHERE id IN (${placeholders})`).all(...ids);
  },

  findByProject(projectId) {
    return findByProjectStmt.all(projectId);
  },
};
