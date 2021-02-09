const routes = require('express').Router();
const { readFile } = require('../utils/fileFunctions');

routes.get('/crush/:id', async (req, res) => {
  const crushId = parseInt(req.params.id, 10);
  const fullFile = await readFile('crush');
  const idFile = JSON.parse(fullFile).find((crush) => crush.id === crushId);
  if (idFile !== undefined) res.status(200).json(idFile);
  res.status(404).json({ message: 'Crush não encontrado' });
});

routes.get('/crush', async (req, res) => {
  const file = await readFile('crush');
  res.status(200).json(JSON.parse(file));
});

routes.post('/login', async (req, res) => {
  const { email, password } = req.body;
  res.status(200).send({ email, password });
});

module.exports = routes;
