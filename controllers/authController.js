const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const connection = require('../database'); // Isso já é o promisePool configurado

const SALT_ROUNDS = 10;

// Função para REGISTRAR um novo usuário
exports.registrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  // Validação de entrada
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    
    // Adicionei o campo 'role' para evitar problemas de acesso futuro
    // Se quiser criar já como admin, mude 'cliente' para 'admin' abaixo
    const sql = 'INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)';

    // --- CORREÇÃO AQUI: Removemos o .promise() ---
    const [results] = await connection.query(sql, [nome, email, senhaHash, 'cliente']);
    
    res.status(201).json({ message: 'Usuário registrado com sucesso!', id: results.insertId });

  } catch (error) {
    // Tratamento de erros centralizado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }
    if (error.sql) { // Erro vindo do MySQL
        console.error('Erro ao registrar usuário no DB:', error);
        return res.status(500).send('Erro ao salvar usuário no banco de dados.');
    }
    // Outros erros
    console.error('Erro interno ao registrar usuário:', error);
    res.status(500).send('Erro interno do servidor ao processar registro.');
  }
};

// Função para LOGAR
exports.loginAdmin = async (req, res) => {
  const { email, senha } = req.body;

  // Validação de entrada
  if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ?';

  try {
    // --- CORREÇÃO AQUI: Removemos o .promise() ---
    const [results] = await connection.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const usuario = results[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Payload e Geração do Token
    const payload = { id: usuario.id, nome: usuario.nome, role: usuario.role };
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
        console.error('FATAL: JWT_SECRET não está definida nas variáveis de ambiente!');
        return res.status(500).send('Erro interno de configuração do servidor.');
    }

    const token = jsonwebtoken.sign(payload, secretKey, { expiresIn: '2h' });

    res.json({ 
        message: 'Login realizado com sucesso!', 
        token: token,
        user: payload // Retorna dados do usuário para o front usar
    });

  } catch (error) {
    console.error('Erro durante o login:', error);
    res.status(500).send('Erro interno do servidor durante o login.');
  }
};