const db = require('../database/connection');

const insertStmt = db.prepare(`
  INSERT INTO projects (profile_id, title, description, repository_url, demo_url)
  VALUES (@profileId, @title, @description, @repositoryUrl, @demoUrl)
`);
const linkTechStmt = db.prepare(
  'INSERT OR IGNORE INTO project_technologies (project_id, technology_id) VALUES (?, ?)'
);
const findAllStmt = db.prepare('SELECT * FROM projects ORDER BY id DESC');
const findByIdStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
const findByProfileStmt = db.prepare('SELECT * FROM projects WHERE profile_id = ? ORDER BY id');

// Projeto + vínculos com tecnologias são gravados na mesma transação
const createWithTechnologies = db.transaction((data, technologyIds) => {
  const { lastInsertRowid } = insertStmt.run({
    description: null,
    demoUrl: null,
    ...data,
  });
  for (const techId of technologyIds) linkTechStmt.run(lastInsertRowid, techId);
  return lastInsertRowid;
});

module.exports = {
  create(data, technologyIds = []) {
    const id = createWithTechnologies(data, technologyIds);
    return this.findById(id);
  },

  findAll() {
    return findAllStmt.all();
  },

  findById(id) {
    return findByIdStmt.get(id);
  },

  findByProfile(profileId) {
    return findByProfileStmt.all(profileId);
  },
};
