const fs = require('fs');

const util = require('util');

const writeFile = util.promisify(fs.writeFile);

const readFile = require('./readFiles');

const validateDate = (date) => {
  const pattern = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/;
  return pattern.test(date);
};

const updateCrush = async (request, response) => {
  let { id } = request.params;
  const { name, age, date } = request.body;
  if (!name || name === '') return response.status(400).json({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) return response.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  if (!age || age === '') return response.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (age < 18) return response.status(400).json({ message: 'O crush deve ser maior de idade' });
  if (!date || !date.datedAt || (!date.rate && date.rate !== 0)) return response.status(400).json({ message: 'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios' });
  if (!validateDate(date.datedAt)) return response.status(400).json({ message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"' });
  if (date.rate < 1 || date.rate > 5) return response.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });

  const crushListJSON = await readFile('./crush.json');
  const updateList = JSON.parse(crushListJSON).filter((el) => el.id !== id);
  id = parseInt(id, 10);
  const update = { id, ...request.body };
  updateList.push(update);
  await writeFile('./crush.json', (updateList));
  response.status(200).send(update);
};

module.exports = updateCrush;