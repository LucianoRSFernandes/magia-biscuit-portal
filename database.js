const mysql = require('mysql2');
require('dotenv').config(); // Garante que as variáveis sejam lidas

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Confirma se no .env está DB_PASSWORD
  database: process.env.DB_NAME,     // <--- AQUI A CORREÇÃO (Era DB_DATABASE)
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Converte para Promise para permitir o uso de 'await' nos controllers
const promisePool = pool.promise();

// Teste rápido de conexão (opcional, mas bom para debug)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erro fatal ao conectar no banco:', err.message);
  } else {
    console.log('Conectado ao banco de dados com sucesso! ID da conexão:', connection.threadId);
    connection.release(); // Devolve a conexão para a piscina
  }
});

module.exports = promisePool;
