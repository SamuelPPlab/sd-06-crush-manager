const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const SUCCESS = 200;
const door = 3000;
app.use(express.json());

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

async function getData(arq) {
  const data = await fs.readFile(arq);
  return JSON.parse(data);
}

function generateToken() {
  const token = crypto.randomBytes(8).toString('hex');
  return token;
}

app.get('/crush', async (_, res) => {
  const data = await getData('crush.json');
  res.status(200).send(data);
});

app.get('/crush/:id', async (req, res) => {
  const data = await getData('crush.json');
  const { id } = req.params;
  const findCrushForId = data.filter((crush) => crush.id === +id);
  if (findCrushForId.length > 0) return res.status(200).json(findCrushForId[0]);
  return res.status(404).json({ message: 'Crush não encontrado' });
});

app.post('/login', (req, res) => {
  const tokenGenerate = generateToken();
  const bodyData = req.body;
  const regexEmail = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/i;

  if (!bodyData.email || bodyData.email === '') {
    return res.status(400).send({
      message: 'O campo "email" é obrigatório',
    });
  } if (!regexEmail.test(bodyData.email)) {
    return res.status(400).send({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }

  if (!bodyData.password || bodyData.password === '') {
    console.log(bodyData.password);
    return res.status(400).send({
      message: 'O campo "password" é obrigatório',
    });
  } if (String(bodyData.password).length < 6) {
    return res.status(400).send({
      message: 'A "senha" deve ter pelo menos 6 caracteres',
    });
  }
  return res.send({
    token: tokenGenerate,
  });
});

// function writingNewCrush(pathArq, newData) {
//   fs.writeFile(pathArq, newData);
// }

// app.post('/crush', async (req, res) => {
//   const { authorization } = req.headers;
//   const regexToken = /^[a-zA-Z0-9]*$/i;
//   const regexDate = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;

//   // const data = await getData('crush.json');
//   // const newArr = data.concat(bodyData);
//   // console.log(data);
//   // writingNewCrush('./crush.json', JSON.stringify(newArr));

//   if (!authorization) {
//     return res.status(401).json({
//       message: 'Token não encontrado',
//     });
//   }
//   if (!regexToken.test(authorization) || authorization.length !== 16) {
//     return res.status(401).json({
//       message: 'Token inválido',
//     });
//   }
//   if (!req.body.name || req.body.name === '') {
//     res.status(400).json({
//       message: 'O campo "name" é obrigatório',
//     });
//   }
//   if (req.body.name.length < 3) {
//     res.status(400).json({
//       message: 'O "name" deve ter pelo menos 3 caracteres',
//     });
//   }
//   if (!req.body.age || req.body.age === '') {
//     res.status(400).json({
//       message: 'O campo "age" é obrigatório',
//     });
//   }
//   if (req.body.age < 18) {
//     res.status(400).json({
//       message: 'O crush deve ser maior de idade',
//     });
//   }

//   if (!regexDate.test(req.body.date.datedAt)) {
//     res.status(400).json({
//       message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"',
//     });
//   }
//   if (req.body.date.rate < 1 || req.body.date.rate > 5) {
//     res.status(400).json({
//       message: 'O campo "rate" deve ser um inteiro de 1 à 5',
//     });
//   }
//   res.status(201).json(req.body);
// });

app.listen(door, () => console.log('ON --- PORT --- 3000!'));
