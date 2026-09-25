const feedbackService = require('../services/feedbackService');

module.exports = {
  async create(req, res) {
    res.status(201).json(await feedbackService.create(Number(req.params.id), req.body));
  },
};
