import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // Layout
import Footer from './components/Footer'; // Layout
import './App.css'; // Estilos do Layout

// Importação das Páginas Públicas
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import BlogPage from './pages/BlogPage';
import PostDetailPage from './pages/PostDetailPage';

// Importação das Páginas de Autenticação
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// Importação do Fluxo de Compra
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import FailurePage from './pages/FailurePage';

// Importação das Páginas de Admin
import AdminProdutosPage from './pages/AdminProdutosPage';
import AdminAddProdutoPage from './pages/AdminAddProdutoPage';
import AdminEditProdutoPage from './pages/AdminEditProdutoPage';
import AdminClientesPage from './pages/AdminClientesPage';
import AdminPostsPage from './pages/AdminPostsPage';
import AdminAddPostPage from './pages/AdminAddPostPage';
import AdminEditPostPage from './pages/AdminEditPostPage';

// Esta é a ÚNICA declaração da função App
function App() {
  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos/:id" element={<ProductDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />

          {/* Rotas de Autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rotas do Fluxo de Compra */}
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/compra-sucesso" element={<SuccessPage />} />
          <Route path="/compra-falha" element={<FailurePage />} />

          {/* Rotas de Administração */}
          <Route path="/admin/produtos" element={<AdminProdutosPage />} />
          <Route path="/admin/produtos/novo" element={<AdminAddProdutoPage />} />
          <Route path="/admin/produtos/editar/:id" element={<AdminEditProdutoPage />} />
          
          <Route path="/admin/clientes" element={<AdminClientesPage />} />
          
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/posts/novo" element={<AdminAddPostPage />} />
          <Route path="/admin/posts/editar/:id" element={<AdminEditPostPage />} />
          
          {/* Opcional: Rota "Não Encontrado" */}
          {/* <Route path="*" element={<div>Página não encontrada</div>} /> */}
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;