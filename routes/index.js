const routes = require('express').Router();
const { readFile } = require('../utils/fileFunctions');

routes.get('/crush', async (req, res) => {
  const file = await readFile('crush');
  res.status(200).json(JSON.parse(file));
});

module.exports = routes;
