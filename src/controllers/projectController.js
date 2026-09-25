const projectService = require('../services/projectService');

module.exports = {
  create(req, res) {
    res.status(201).json(projectService.create(req.body));
  },

  index(_req, res) {
    res.json(projectService.list());
  },
};
