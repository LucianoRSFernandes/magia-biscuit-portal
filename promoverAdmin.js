require('dotenv').config();

// Ajuste o caminho se seu database.js estiver em outra pasta (ex: ./src/database)
let db;
try {
    db = require('./database'); 
} catch (e) {
    db = require('./src/database');
}

async function promoverUsuario() {
  const emailGeovana = 'geovana.barbosa.fernandes@gmail.com'; // O e-mail exato dela

  console.log(`👑 Tentando promover ${emailGeovana} para ADMIN...`);

  try {
    const sql = `UPDATE usuarios SET role = 'admin' WHERE email = ?`;
    const [result] = await db.query(sql, [emailGeovana]);

    if (result.affectedRows > 0) {
        console.log('✅ SUCESSO! O usuário agora é ADMIN.');
        console.log('👉 Peça para ela fazer Logout e Login novamente no site.');
    } else {
        console.log('⚠️ Usuário não encontrado. Verifique se o e-mail está certo.');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao atualizar:', error);
    process.exit(1);
  }
}

promoverUsuario();