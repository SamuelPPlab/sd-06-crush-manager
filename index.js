const express = require('express');
const fs = require('fs');
const { tokenValidator } = require('./authenticator');

const app = express();
const zero = 0;
const um = 1;
const dois = 2;
const tres = 3;
const quatro = 4;
const cinco = 5;
const seis = 6;
const doze = 12;
const dezoito = 18;
const SUCCESS = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const PORT = 3000;

app.use(express.json());
app.listen(PORT);
// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

const dateValidator = (date) => {
  const dateSplit = date.split('/');

  const errorMessage = [
    { status: BAD_REQUEST },
    { message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"' },
  ];

  if (dateSplit[0].length > dois || dateSplit[1].length > dois) {
    return errorMessage;
  }

  if (dateSplit[2].length < quatro) {
    return errorMessage;
  }

  if (parseInt(dateSplit[1], 10) > doze) {
    return errorMessage;
  }
};

const crushValidator = (crushToAdd, status) => {
  if (crushToAdd.name === undefined) {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O campo "name" é obrigatório',
      },
    ];
  }

  if (crushToAdd.name && crushToAdd.name.length < tres) {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O "name" deve ter pelo menos 3 caracteres',
      },
    ];
  }

  if (crushToAdd.age === undefined) {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O campo "age" é obrigatório',
      },
    ];
  }

  if (crushToAdd.age && crushToAdd.age < dezoito) {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O crush deve ser maior de idade',
      },
    ];
  }

  if (crushToAdd.date === undefined || crushToAdd.date.datedAt === undefined || crushToAdd.date.datedAt === '') {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios',
      },
    ];
  }

  if (crushToAdd.date === undefined || crushToAdd.date.rate === undefined || crushToAdd.date.rate === '') {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios',
      },
    ];
  }

  if (dateValidator(crushToAdd.date.datedAt) !== undefined) {
    return dateValidator(crushToAdd.date.datedAt);
  }

  if (typeof crushToAdd.date.rate !== 'number' || crushToAdd.date.rate > cinco || crushToAdd.date.rate <= zero) {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O campo "rate" deve ser um inteiro de 1 à 5',
      },
    ];
  }
  const newId = JSON.parse(fs.readFileSync('crush.json')).length + um;
  const newCrush = { ...crushToAdd, id: crushToAdd.id ? crushToAdd.id : newId };
  return [{ status }, { message: newCrush }];
};

const tokenGenerator = () => {
  let token = Math.random().toFixed(14).toString();
  token = token.split('.');
  return `${token[1]}aB`;
};

const loginValidator = (requisition) => {
  const login = requisition;
  if (!login.email || login.email === '') {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O campo "email" é obrigatório',
      },
    ];
  }
  const isEmailValid = login.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{3})$/i);
  if (!isEmailValid) {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O "email" deve ter o formato "email@email.com"',
      },
    ];
  }

  if (!login.password || login.password === '') {
    return [
      { status: BAD_REQUEST },
      {
        message: 'O campo "password" é obrigatório',
      },
    ];
  }
  if (login.password.length < seis) {
    return [
      { status: BAD_REQUEST },
      {
        message: 'A "senha" deve ter pelo menos 6 caracteres',
      },
    ];
  }

  return [
    { status: SUCCESS },
    {
      token: tokenGenerator(),
    },
  ];
};

app.post('/login', (req, res) => {
  const login = req.body;
  const response = loginValidator(login);
  res.status(response[0].status).json(response[1] || response[1]);
});

app.get('/crush', (req, res) => {
  const crushes = JSON.parse(fs.readFileSync('crush.json')) || [];
  res.status(SUCCESS).json(crushes);
});

app.get('/crush/search', tokenValidator, (req, res) => {
  const name = req.query.q;
  const allCrushes = JSON.parse(fs.readFileSync('crush.json'));
  const searchResult = allCrushes.filter((item) => item.name.includes(name));
  res.status(SUCCESS).json(searchResult);
});

app.get('/crush/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const search = JSON.parse(fs.readFileSync('crush.json')).find((crush) => crush.id === id);
  if (search === undefined) {
    return res.status(NOT_FOUND).json({
      message: 'Crush não encontrado',
    });
  }
  res.status(SUCCESS).json(search);
});

app.put('/crush/:id', tokenValidator, (req, res) => {
  const { id } = req.params;
  const editedCrush = {
    id: parseInt(id, 10),
    ...req.body,
  };
  const allCrushes = JSON.parse(fs.readFileSync('crush.json'));
  const allNonSelectedCrushes = allCrushes.filter((item) => (
    parseInt(item.id, 10) !== parseInt(id, 10)
  ));

  const validatedCrush = crushValidator(editedCrush, SUCCESS);
  const newCrushList = [...allNonSelectedCrushes, editedCrush];

  const messageType = typeof validatedCrush[1].message;

  const response = messageType === 'string' ? validatedCrush[1] : validatedCrush[1].message;

  if (validatedCrush[0].status === SUCCESS) {
    fs.writeFileSync('crush.json', JSON.stringify(newCrushList));
  }

  res.status(validatedCrush[0].status).json(response);
});

app.post('/crush', tokenValidator, (req, res) => {
  const allCrushes = JSON.parse(fs.readFileSync('crush.json'));

  const newCrushList = [...allCrushes, req.body];

  const filteredCrushResponse = crushValidator(req.body, CREATED);

  if (filteredCrushResponse[0].status === CREATED) {
    fs.writeFileSync('crush.json', JSON.stringify(newCrushList));
  }

  const messageType = typeof filteredCrushResponse[1].message;

  const response = messageType === 'string' ? filteredCrushResponse[1] : filteredCrushResponse[1].message;

  res.status(filteredCrushResponse[0].status).json(response);
});

app.delete('/crush/:id', tokenValidator, (req, res) => {
  const { id } = req.params;
  const allCrushes = JSON.parse(fs.readFileSync('crush.json'));
  const allNonSelectedCrushes = allCrushes.filter((item) => (
    parseInt(item.id, 10) !== parseInt(id, 10)
  ));
  fs.writeFileSync('crush.json', JSON.stringify(allNonSelectedCrushes));
  res.status(SUCCESS).json({ message: 'Crush deletado com sucesso' });
});
