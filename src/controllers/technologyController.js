const technologyService = require('../services/technologyService');

module.exports = {
  async create(req, res) {
    res.status(201).json(await technologyService.create(req.body));
  },

  async index(_req, res) {
    res.json(await technologyService.list());
  },
};
