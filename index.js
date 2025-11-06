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
app.use(cors());
app.use(express.json());
const port = 3000;

// Configura o uso das rotas
app.use('/produtos', produtoRoutes);
app.use('/', authRoutes);
app.use('/posts', postRoutes);
app.use('/clientes', clienteRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/frete', freteRoutes);

// Rota de teste para a página inicial
app.get('/', (req, res) => {
  res.send('Servidor do site Magia Biscuit está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});