const express = require('express');
const crushRegistered = require('./data');

const app = express();
const SUCCESS = 200;

app.get('/crush', (_req, res) => {
  res.json(crushRegistered);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});
