require('dotenv').config();
const db = require('./database'); // Ou './src/database' dependendo da sua pasta

async function criarTabelas() {
  console.log('🚧 Iniciando criação das tabelas no Banco de Dados...');

  try {
    // 1. Tabela de Usuários
    const sqlUsuarios = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'cliente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(sqlUsuarios);
    console.log('✅ Tabela "usuarios" criada (ou já existia).');

    // 2. Tabela de Produtos
    const sqlProdutos = `
      CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco DECIMAL(10, 2) NOT NULL,
        descricao TEXT,
        imagem VARCHAR(500),
        categoria VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(sqlProdutos);
    console.log('✅ Tabela "produtos" criada (ou já existia).');

    // 3. Tabela de Posts (Blog)
    const sqlPosts = `
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        conteudo TEXT NOT NULL,
        imagem VARCHAR(500),
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(sqlPosts);
    console.log('✅ Tabela "posts" criada (ou já existia).');

    // 4. Tabela de Clientes (Opcional, caso você use tabela separada de usuarios)
    // Se você unificou tudo em 'usuarios', não precisa desta.
    // Vou criar apenas para garantir caso seu código antigo use.
    const sqlClientes = `
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255),
        email VARCHAR(255),
        cpf VARCHAR(20),
        telefone VARCHAR(20),
        endereco TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(sqlClientes);
    console.log('✅ Tabela "clientes" criada (ou já existia).');

    console.log('🏁 Tudo pronto! As tabelas foram criadas com sucesso.');
    process.exit(0); // Encerra o script

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    process.exit(1);
  }
}

criarTabelas();