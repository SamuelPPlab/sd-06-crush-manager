const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const SUCCESS = 200;
const emailRegex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/;
const token = { token: '7mqaVRXJSp886CGr' };
const dateRegex = /(\d{2})[/](\d{2})[/](\d{4})/;

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

app.get('/crush', (_req, res) => {
  const file = fs.readFileSync('./crush.json', 'utf8');
  res.json(JSON.parse(file));
});

app.get('/crush/:id', (req, res) => {
  const file = fs.readFileSync('./crush.json', 'utf8');
  const dataFiles = JSON.parse(file);
  const { id } = req.params;
  const crush = dataFiles.filter((elemt) => elemt.id === parseInt(id, 10));
  if (crush.length !== 1) {
    return res.status(404).send({ message: 'Crush não encontrado' });
  }
  return res.status(SUCCESS).send(crush[0]);
});

app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || email === '') {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password || password === '') {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'A "senha" deve ter pelo menos 6 caracteres' });
  }
  res.status(SUCCESS).json(token);
});

const tokenAutorization = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  if (authorization.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  next();
};
app.use(tokenAutorization);

const crushValidation = (name, age, date) => {
  let message = '';
  if (!name) {
    message = 'O campo "name" é obrigatório';
  } else if (name.length < 3) {
    message = 'O "name" deve ter pelo menos 3 caracteres';
  }
  if (!age || !Number.isInteger(age)) {
    message = 'O campo "age" é obrigatório';
  }
  if (age < 18) {
    message = 'O crush deve ser maior de idade';
  }
  if (!date || !date.datedAt || !date.rate) {
    message = 'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios';
  } else if (!dateRegex.test(date.datedAt)) {
    message = 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"';
  } else if (date.rate !== 1 && date.rate !== 2 && date.rate !== 3 && date.rate !== 4 && date.rate !== 5) {
    message = 'O campo "rate" deve ser um inteiro de 1 à 5';
  }
  return message;
};

app.post('/crush', (req, res) => {
  const { name, age, date } = req.body;
  const invalidCrush = crushValidation(name, age, date);
  if (invalidCrush) {
    return res.status(400).json({ message: invalidCrush });
  }
  const cruchesFile = fs.readFileSync('./crush.json', 'utf8');
  const crushes = JSON.parse(cruchesFile);
  const newCrush = { name, age, id: crushes.length + 1, date };
  crushes.push(newCrush);
  res.status(201).json(newCrush);
});

app.listen(3000, () => { console.log('porta: 3000 ativa'); });
