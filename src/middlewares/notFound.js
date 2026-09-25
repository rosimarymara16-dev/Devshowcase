module.exports = (req, res) => {
  res.status(404).json({ status: 404, error: `Rota ${req.method} ${req.originalUrl} não encontrada` });
};
