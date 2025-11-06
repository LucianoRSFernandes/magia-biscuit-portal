const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const connection = require('../database'); // Assume que exporta a conexão já configurada

const SALT_ROUNDS = 10; // Definir como constante

// Função para REGISTRAR um novo usuário (admin)
// ATENÇÃO: Confirme se o registro de admin via API é desejado.
exports.registrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  // Validação de entrada
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const sql = 'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)';

    // Usando a versão promise da conexão
    const [results] = await connection.promise().query(sql, [nome, email, senhaHash]);
    res.status(201).json({ message: 'Usuário admin registrado com sucesso!', id: results.insertId });

  } catch (error) {
    // Tratamento de erros centralizado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }
    if (error.sql) { // Erro vindo do MySQL
        console.error('Erro ao registrar usuário no DB:', error);
        return res.status(500).send('Erro ao salvar usuário no banco de dados.');
    }
    // Outros erros (ex: falha no bcrypt)
    console.error('Erro interno ao registrar usuário:', error);
    res.status(500).send('Erro interno do servidor ao processar registro.');
  }
};

// Função para LOGAR um ADMINISTRADOR
exports.loginAdmin = async (req, res) => {
  const { email, senha } = req.body;

  // Validação de entrada
  if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ?';

  try {
    // Usando a versão promise
    const [results] = await connection.promise().query(sql, [email]);

    if (results.length === 0) {
      // Usar status 401 para falha de autenticação
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const admin = results[0];

    const senhaCorreta = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Payload e Geração do Token
    const payload = { id: admin.id, nome: admin.nome, role: 'admin' };
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
        console.error('FATAL: JWT_SECRET não está definida nas variáveis de ambiente!');
        return res.status(500).send('Erro interno de configuração do servidor.');
    }

    const token = jsonwebtoken.sign(payload, secretKey, { expiresIn: '1h' });

    res.json({ message: 'Login de admin bem-sucedido!', token: token });

  } catch (error) {
    console.error('Erro durante o login do admin:', error);
    res.status(500).send('Erro interno do servidor durante o login.');
  }
};