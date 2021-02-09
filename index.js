const express = require('express');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const bodyParser = require('body-parser');
const { generateToken, validateEmail, checkIfExists, checkLength, getNextId, validateDate, validateToken, validateName, validateAge } = require('./functions');

const app = express();
const SUCCESS = 200;
const port = 3000;

app.use(bodyParser.json());

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

const getData = async () => {
  const data = await readFile('./crush.json');
  return JSON.parse(data);
};

app.get('/crush', async (req, res) => {
  const data = await getData();
  res.status(200).send(data);
});

app.get('/crush/:id', async (req, res) => {
  const data = await getData();
  const { id } = req.params;
  const crushID = parseInt(id, 10);
  const index = data.findIndex((person) => person.id === crushID);

  if (index === -1) return res.status(404).send({ message: 'Crush não encontrado' });

  res.status(200).send(data[index]);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!checkIfExists(email)) return res.status(400).send({ message: 'O campo "email" é obrigatório' });
  if (validateEmail(email)) return res.status(400).send({ message: 'O "email" deve ter o formato "email@email.com"' });
  if (!checkIfExists(password)) return res.status(400).send({ message: 'O campo "password" é obrigatório' });
  if (!checkLength(password, 6)) return res.status(400).send({ message: 'A "senha" deve ter pelo menos 6 caracteres' });

  const token = generateToken();
  res.send({ token });
});

app.post('/crush', async (req, res) => {
  const { token } = req.headers;
  const { name, age, date } = req.body;
  const { datedAt, rate } = date;

  if (validateToken(token) !== true) return res.status(401).send({ message: `${validateToken(token)}` });
  if (validateName(name) !== true) return res.status(400).send({ message: `${validateName(name)}` });
  if (validateAge(age) !== true) return res.status(400).send({ message: `${validateAge(age)}` });
  if (validateDate(date, datedAt, rate) !== true) res.status(400).send({ message: `${validateDate(date, datedAt, rate)}` });

  const data = await getData();
  const nextId = getNextId(data);
  const newCrush = { id: nextId, ...req.body };
  const text = [...data, newCrush];
  const textJSON = JSON.stringify(text, null, '\t');

  await writeFile('./crush.json', textJSON);

  const newCrushJSON = JSON.stringify(newCrush, null, '\t');

  res.status(201).send(newCrushJSON);
});

app.listen(port);
