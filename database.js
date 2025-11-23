const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS, // Aceita os dois nomes
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  
  // --- A SOLUÇÃO DO ERRO 500 (Limite de Conexões) ---
  connectionLimit: 2, // Mantemos baixo para o plano Free do Clever Cloud
  
  queueLimit: 0,

  // --- A SOLUÇÃO PARA CONECTAR NA NUVEM (SSL) ---
  // Essencial para comunicação Render -> Clever Cloud
  ssl: {
    rejectUnauthorized: false
  }
});

// Converte para Promise para permitir o uso de 'await' nos controllers
const promisePool = pool.promise();

// Teste rápido de conexão
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro fatal ao conectar no banco:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados com sucesso! ID da conexão:', connection.threadId);
    connection.release(); // Devolve a conexão imediatamente para não ocupar vaga
  }
});

module.exports = promisePool;
