const UNAUTHORIZED = 401;
const requiredTokenLength = 16;

const tokenValidator = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === undefined) {
    return res.status(UNAUTHORIZED).json({ message: 'Token não encontrado' });
  }
  const isTokenValid = token.length === requiredTokenLength;
  if (!isTokenValid) {
    return res.status(UNAUTHORIZED).json({ message: 'Token inválido' });
  }
  next();
};

module.exports = {
  tokenValidator,
};
