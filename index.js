const fs = require('fs');
const { promisify } = require('util');

const readCrushes = promisify(fs.readFile);
const express = require('express');

const app = express();
const SUCCESS = 200;

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

/* app.get('/crush', (request, response) => {
  const fileName = './crush.json';
  const data = fs.readFile(fileName, (err, rawData) => {
    if (err) {
      throw new Error(`Could not read file ${ fileName }\n Error: ${ err }`);
    }
    const data = JSON.parse(rawData);
    if (!data) response.status(200).send([]);
    response.status(SUCCESS).send(data);
  });
}); */

app.get('/crush', (request, response) => {
  const fileName = './crush.json';
  readCrushes(fileName)
    .then((rawData) => JSON.parse(rawData))
    .then((data) => response.status(SUCCESS).send(data))
    .catch((error) => console.log(`Could not read file ${fileName}\n Error: ${error}`));
});

app.get('/crush/:id', async (request, response) => {
  const id = parseInt(request.params.id, 10);
  const fileName = './crush.json';
  const crushes = await readCrushes(fileName)
    .then((rawData) => JSON.parse(rawData))
    .then((data) => data)
    .catch((error) => console.log(`Could not read file ${fileName}\n Error: ${error}`));
  const retrievedCrush = crushes.find((crush) => crush.id === id);
  if (!retrievedCrush) response.status(200).json({ message: 'Crush não encontrado' });
  response.status(SUCCESS).send(retrievedCrush);
});

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});
