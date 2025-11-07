# 🎨 Portal Magia Biscuit

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Projeto fullstack de um portal de artesanato (biscuit) que integra um blog de conteúdo e um e-commerce completo.

O backend é uma API RESTful construída com Node.js e Express, utilizando MySQL para o banco de dados. Inclui autenticação de usuário (JWT), upload de mídias (Cloudinary) e processamento de pagamentos (Mercado Pago). O frontend é uma aplicação React (Vite) com gerenciamento de estado (Context API).

## Status do Projeto

**Em Desenvolvimento** 🚧

## ✨ Features Principais

* **Blog:**
    * Criação, Leitura, Atualização e Deleção (CRUD) de posts.
    * Exibição de posts públicos.
* **E-commerce:**
    * CRUD de produtos (painel admin).
    * Listagem e visualização de produtos.
    * Carrinho de compras (gerenciado com Context API).
    * Checkout com integração de pagamento (Mercado Pago).
* **Usuários:**
    * Sistema de registro e login de clientes.
    * Autenticação baseada em JSON Web Tokens (JWT).
    * Painel de administração para gerenciamento de conteúdo e produtos.

## 🛠️ Tecnologias Utilizadas

### Backend (API)
* **Node.js**
* **Express**
* **MySQL2** (para conexão com o banco de dados MySQL)
* **Sequelize** (ou `mysql2` puro)
* **JSON Web Token (JWT)** (para autenticação)
* **Bcrypt** (para hash de senhas)
* **Cloudinary** (para upload de imagens)
* **Mercado Pago SDK** (para pagamentos)
* **Dotenv** (para gerenciamento de variáveis de ambiente)
* **Cors**

### Frontend (Cliente)
* **React** (criado com Vite)
* **React Router Dom** (para gerenciamento de rotas)
* **React Context API** (para gerenciamento de estado, ex: Carrinho)
* **Axios** (para requisições à API)
* **CSS** (ou Styled Components, SASS, etc.)

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos
Antes de começar, você vai precisar ter as seguintes ferramentas instaladas:
* [Node.js](https://nodejs.org/en/) (que inclui o NPM)
* Um gerenciador de banco de dados, como [MySQL Workbench](https://www.mysql.com/products/workbench/) ou DBeaver.
* Um servidor MySQL rodando localmente.

### 1. Configuração do Backend
```bash
# 1. Clone o repositório
git clone [https://github.com/seu-usuario/magia-biscuit.git](https://github.com/seu-usuario/magia-biscuit.git)

# 2. Navegue até a pasta raiz do backend
cd magia-biscuit

# 3. Instale as dependências
npm install

# 4. Crie o arquivo .env na raiz (magia-biscuit/.env)
#    Copie o conteúdo abaixo e substitua pelos seus valores

.env (Arquivo de Exemplo)
Crie um arquivo chamado .env na raiz do projeto (magia-biscuit/.env) e preencha com suas chaves:

# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_DATABASE=magia_biscuit
PORT=3000

# Segredos e API Keys
JWT_SECRET=seu_segredo_super_secreto_para_jwt
MERCADOPAGO_TOKEN=SEU_TOKEN_DE_TESTE_DO_MERCADO_PAGO
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key_cloudinary
CLOUDINARY_API_SECRET=seu_api_secret_cloudinary

# 5. Configure seu banco de dados
#    Abra seu gerenciador de banco (MySQL Workbench, etc.) e
#    execute o seguinte comando SQL:
CREATE DATABASE magia_biscuit;

# (Se você tiver um script de migração, rode-o agora)
# ex: npx sequelize-cli db:migrate

# 6. Rode o servidor backend
node index.js
# O servidor estará rodando em http://localhost:3000

2. Configuração do Frontend

# 1. Abra um NOVO terminal

# 2. Navegue até a pasta do frontend
cd magia-biscuit/frontend

# 3. Instale as dependências
npm install

# 4. Rode o cliente React (Vite)
npm run dev
# A aplicação estará rodando em http://localhost:5173 (ou outra porta indicada)

👨‍💻 Autor
[Luciano Rodrigo dos Santos Fernandes]

LinkedIn: https://www.linkedin.com/in/lucianorsfernandes/

GitHub: https://github.com/LucianoRSFernandes