const express = require('express');
const bodyParser = require('body-parser');
const { standardResponse, getCrushes, getCrush, getToken, addCrush, updateCrush } = require('./middlewares');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', standardResponse);

app.get('/crush', getCrushes);
app.post('/crush', addCrush);
app.get('/crush/:id', getCrush);
app.put('/crush/:id', updateCrush);
app.post('/login', getToken);

app.listen(port);
