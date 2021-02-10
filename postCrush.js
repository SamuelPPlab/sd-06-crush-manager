const fs = require('fs').promises;
const crushs = require('./crush.json');

const validateDate = (date) => {
  const reg = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/;
  return reg.test(date);
};

const newCrush = (req, res) => {
  const crushInfo = req.body;
  const { name, age, date } = req.body;

  if (!name) return res.status(400).send({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) return res.status(400).send({ message: 'O "name" deve ter pelo menos 3 caracteres' });

  if (!age || age === '') return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (age < 18) return res.status(400).json({ message: 'O crush deve ser maior de idade' });

  if (!date || !date.datedAt || (!date.rate && date.rate !== 0)) {
    return res.status(400).json({ message: 'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios' });
  }
  if (date.rate < 1 || date.rate > 5) return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  if (!validateDate(date.datedAt)) return res.status(400).json({ message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"' });

  const allInfo = [...crushs];
  const id = crushs.length + 1;
  console.log(id);
  const newCrushInfo = {
    id,
    ...crushInfo,
  };
  allInfo.push(newCrushInfo);

  fs.writeFile('./crush.json', JSON.stringify(allInfo));
  res.status(201).send(newCrushInfo);
};

module.exports = { newCrush };
