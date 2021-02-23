const express = require('express');
const bodyParse = require('body-parser');
const findAll = require('./findAll');

const app = express();
const SUCCESS = 200;

app.use(bodyParse.json());
// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

app.get('/crush', findAll);

app.listen(3000, () => console.log('ta workando'));
