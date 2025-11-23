const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  
  // --- LIMITES (Vital para o plano Free) ---
  connectionLimit: 2, 
  queueLimit: 0,

  // --- ESTABILIDADE (Para evitar ECONNRESET) ---
  connectTimeout: 60000, // Espera até 60s antes de desistir (Ajuda em redes lentas)
  enableKeepAlive: true, // Mantém a conexão "acordada" para não cair por inatividade
  keepAliveInitialDelay: 0,

  // --- SEGURANÇA (Vital para Render -> Clever Cloud) ---
  ssl: {
    rejectUnauthorized: false
  }
});

// Converte para Promise para permitir o uso de 'await' nos controllers
const promisePool = pool.promise();

// Teste rápido de conexão
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro fatal ao conectar no banco:', err.code, err.message);
  } else {
    console.log('✅ Conectado ao banco de dados com sucesso! ID da conexão:', connection.threadId);
    connection.release(); 
  }
});

module.exports = promisePool;