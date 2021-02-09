const express = require('express');
const bodyParser = require('body-parser');

const {
  read,
  parser,
  getById,
  tokenResponse,
  validateEmail,
  validatePassword,
  updateCrushes,
  validateToken,
  validateName,
  validateAge,
  validateDate,
} = require('./util/midlewares');

const app = express();
const SUCCESS = 200;
const port = 3000;

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

app.use(parser);
app.use(bodyParser.json());

app.get('/:fileName', read);
app.get('/:fileName/:id', getById);
app.post('/login', validateEmail, validatePassword, tokenResponse);
app.post('/:fileName', validateToken, validateName, validateAge, validateDate, updateCrushes);

app.listen(port, () => console.log(`Executando na porta ${port}`));
