const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const connection = require('../database'); // Assume que exporta a conexão já configurada

const SALT_ROUNDS = 10; // Definir como constante

// Função para REGISTRAR um novo cliente
exports.registrarCliente = async (req, res) => {
  const { nome, email, senha } = req.body;

  // Validação de entrada
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }
  // Validação simples de email (pode ser aprimorada com regex ou biblioteca)
  if (!email.includes('@')) {
      return res.status(400).json({ message: 'Formato de e-mail inválido.'});
  }
  // Validação simples de senha (ex: mínimo 6 caracteres)
  if (senha.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.'});
  }


  try {
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const sql = 'INSERT INTO clientes (nome, email, senha_hash) VALUES (?, ?, ?)';

    // Usando a versão promise da conexão
    const [results] = await connection.promise().query(sql, [nome, email, senhaHash]);
    res.status(201).json({ message: 'Cliente registrado com sucesso!', id: results.insertId });

  } catch (error) {
    // Tratamento de erros centralizado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }
    if (error.sql) { // Erro vindo do MySQL
        console.error('Erro ao registrar cliente no DB:', error);
        return res.status(500).send('Erro ao salvar cliente no banco de dados.');
    }
    // Outros erros (ex: falha no bcrypt)
    console.error('Erro interno ao registrar cliente:', error);
    res.status(500).send('Erro interno do servidor ao processar registro.');
  }
};

// Função para LOGAR um cliente
exports.loginCliente = async (req, res) => {
  const { email, senha } = req.body;

  // Validação de entrada
  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const sql = 'SELECT * FROM clientes WHERE email = ?';

  try {
    // Usando a versão promise
    const [results] = await connection.promise().query(sql, [email]);

    if (results.length === 0) {
      // Usar status 401 para falha de autenticação
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const cliente = results[0];

    const senhaCorreta = await bcrypt.compare(senha, cliente.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Payload e Geração do Token
    const payload = { id: cliente.id, nome: cliente.nome, role: 'cliente' }; // Garante role 'cliente'
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
        console.error('FATAL: JWT_SECRET não está definida nas variáveis de ambiente!');
        return res.status(500).send('Erro interno de configuração do servidor.');
    }

    const token = jsonwebtoken.sign(payload, secretKey, { expiresIn: '24h' }); // Token mais longo para cliente

    res.json({ message: 'Login de cliente bem-sucedido!', token: token });

  } catch (error) {
    console.error('Erro durante o login do cliente:', error);
    res.status(500).send('Erro interno do servidor durante o login.');
  }
};

// Função para LISTAR Clientes (protegida para admin)
exports.listarClientes = async (req, res) => {
  // Seleciona campos seguros e ordena por data de cadastro mais recente
  const sql = 'SELECT id, nome, email, data_cadastro FROM clientes ORDER BY data_cadastro DESC';

  try {
    // Usando a versão promise
    const [results] = await connection.promise().query(sql);
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).send('Erro ao buscar dados do banco de dados');
  }
};