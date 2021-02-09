const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const SUCCESS = 200;

app.use(bodyParser.json());

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

// _______________________________________________________

// Requisito 1
const { readFile } = require('./src/utils/manageFile');

app.get('/crush', async (_req, res) => {
  const crushes = await readFile('crush');
  try {
    res.status(200).json(JSON.parse(crushes));
  } catch (e) {
    console.error(e);
    res.status(200).json([]);
  }
});

// _______________________________________________________

// Requisito 2

app.get('/crush/:id', async (req, res) => {
  const crushes = await readFile('crush');
  const id = parseInt(req.params.id, 10);
  const element = JSON.parse(crushes).find((e) => e.id === id);

  if (element) {
    res.status(200).json(element);
  } else {
    res.status(404).json({ message: 'Crush não encontrado' });
  }
});

// _______________________________________________________

// Requisito 3

const { emailValidation, passwordValidation } = require('./src/utils/validator');

const validateLogin = (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  const { email, password } = req.body;
  if (!email || email === '') {
    return res.status(400).json({
      message: 'O campo "email" é obrigatório',
    });
  }
  if (!password || password === '') {
    return res.status(400).json({
      message: 'O campo "password" é obrigatório',
    });
  }
  if (emailValidation(email)) {
    return res.status(400).json({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }
  if (passwordValidation(password)) {
    return res.status(400).json({
      message: 'A "senha" deve ter pelo menos 6 caracteres',
    });
  }
  return res.status(200).json({ token });
};

app.post('/login', validateLogin);

// _______________________________________________________

// Requisito 4

const { dataValidation } = require('./src/utils/validator');
const { writeFile } = require('./src/utils/manageFile');

app.post('/crush', async (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  if (!token) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  if (token.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  const { name, age, date } = req.body;
  if (!name) {
    return res.status(400).json({
      message: 'O campo "name" é obrigatório',
    });
  }
  if (name.length < 3) {
    return res.status(400).json({
      message: 'O "name" deve ter pelo menos 3 caracteres',
    });
  }
  if (!age) {
    return res.status(400).json({
      message: 'O campo "age" é obrigatório',
    });
  }
  if (age <= 18) {
    return res.status(400).json({
      message: 'O crush deve ser maior de idade',
    });
  }
  if (!date) {
    return res.status(400).json({
      message: 'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios',
    });
  }
  if (dataValidation(date.datedAt)) {
    return res.status(400).json({
      message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  if (!Number.isInteger(date.rate) && date.rate > 5 && date.rate < 1) {
    return res.status(400).json({
      message: 'O crush deve ser maior de idade',
    });
  }
  const crushes = await readFile('crush');
  const newCrush = await JSON.parse(crushes);
  const id = newCrush.length + 1;
  const element = { name, age, id, date };
  await newCrush.push(element);
  await writeFile('crush', JSON.stringify(newCrush));
  await res.status(201).send(element);
});

// _______________________________________________________

app.listen(3000, () => console.log('running'));
