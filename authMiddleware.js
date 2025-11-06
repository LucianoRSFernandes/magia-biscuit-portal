const jsonwebtoken = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Pega o token do "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // Unauthorized - Se não houver token
  }

  jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.sendStatus(403); // Forbidden - Se o token for inválido
    }
    req.usuario = usuario;
    next(); // Sucesso! Passa para a próxima função (a rota final)
  });
}

module.exports = { verificarToken };