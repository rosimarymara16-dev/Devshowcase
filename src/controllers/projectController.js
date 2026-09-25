const projectService = require('../services/projectService');

module.exports = {
  async create(req, res) {
    res.status(201).json(await projectService.create(req.body));
  },

  // req.query já chega validado pelo validateQuery (page e limit como número)
  async index(req, res) {
    res.json(await projectService.list(req.query));
  },

  async upvote(req, res) {
    res.json(await projectService.upvote(Number(req.params.id)));
  },
};
