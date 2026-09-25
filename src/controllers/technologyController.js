const technologyService = require('../services/technologyService');

module.exports = {
  create(req, res) {
    res.status(201).json(technologyService.create(req.body));
  },

  index(_req, res) {
    res.json(technologyService.list());
  },
};
