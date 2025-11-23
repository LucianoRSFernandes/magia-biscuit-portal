require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importa as rotas
const produtoRoutes = require('./routes/produtoRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const freteRoutes = require('./routes/freteRoutes');

const app = express();

// Configuração do CORS para aceitar requisições do Front-end
app.use(cors());
// Aumentando o limite para aceitar fotos de alta resolução
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const port = process.env.PORT || 3000; // Previne erro no Render se a porta mudar

// --- DEFINIÇÃO DAS ROTAS (Padronizado com /api) ---

// Rotas de Produtos (ex: /api/produtos)
app.use('/api/produtos', produtoRoutes);

// Rotas de Autenticação Admin (ex: /api/auth/login) -> AQUI ESTAVA O ERRO
app.use('/api/auth', authRoutes);

// Rotas do Blog (ex: /api/posts)
app.use('/api/posts', postRoutes);

// Rotas de Clientes (ex: /api/clientes/login)
app.use('/api/clientes', clienteRoutes);

// Rotas de Checkout e Frete
app.use('/api/checkout', checkoutRoutes);
app.use('/api/frete', freteRoutes);


// Rota de teste na raiz (para sabermos se o servidor está vivo)
app.get('/', (req, res) => {
  res.send('API do Magia Biscuit está funcionando! Acesse /api/produtos para ver dados.');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});