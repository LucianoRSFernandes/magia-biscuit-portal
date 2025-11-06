// frontend/src/components/Header.jsx (Refatorado)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { jwtDecode } from 'jwt-decode';
import './Header.css';

function Header() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect para verificar o token ao montar.
  // Nota V1.0: Como não temos AuthContext, as atualizações após login/logout
  // dependem de recarregamento da página (window.location).
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      console.log("[Header CheckAuth] Iniciando verificação..."); // Mantendo logs por enquanto
      console.log("[Header CheckAuth] Token encontrado:", token ? "SIM" : "NÃO");

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          console.log("[Header CheckAuth] Token decodificado:", decodedToken);

          let detectedRole = null;
          if (decodedToken.role === 'admin') {
            detectedRole = 'admin';
          } else if (decodedToken.id) {
            detectedRole = decodedToken.role === 'cliente' ? 'cliente' : null; // Usa role se existir, senão null
          }
          console.log("[Header CheckAuth] Role Detectado:", detectedRole);

          setUserRole(detectedRole);
          setIsLoggedIn(!!detectedRole);
          console.log("[Header CheckAuth] Estado final: isLoggedIn =", !!detectedRole, ", userRole =", detectedRole);

        } catch (error) {
          console.error("[Header CheckAuth] Erro ao decodificar token:", error);
          localStorage.removeItem('token');
          setUserRole(null);
          setIsLoggedIn(false);
        }
      } else {
        setUserRole(null);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantidade, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    setIsLoggedIn(false);
    navigate('/login');
    // Força reload para Header atualizar sem Context API
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <header className="site-header">
      {/* Logo e Nome */}
      <div className="logo">
        {/* Link agora tem className para estilo */}
        <Link to="/" className="logo-link">
          {/* Imagem agora tem className */}
          <img src="/assets/logo.png" alt="Magia Biscuit Logo" className="logo-image" />
          {/* Span agora tem className */}
          <span className="logo-text">Magia Biscuit</span>
        </Link>
      </div>

      {/* Navegação */}
      <nav className="main-nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/blog">Blog</Link></li>

          {userRole === 'admin' && (
            <>
              <li><Link to="/admin/produtos">Admin Produtos</Link></li>
              <li><Link to="/admin/posts">Admin Blog</Link></li>
              <li><Link to="/admin/clientes">Admin Clientes</Link></li>
            </>
          )}

          {isLoggedIn ? (
            <li>
              {/* Botão Sair agora tem className */}
              <button onClick={handleLogout} className="logout-button">Sair</button>
            </li>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Cadastro</Link></li>
            </>
          )}

          <li>
            <Link to="/carrinho">
              🛒 Carrinho {totalItems > 0 && `(${totalItems})`}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;