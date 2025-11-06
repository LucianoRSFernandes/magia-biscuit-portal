import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // Importa o provedor do carrinho
import App from './App.jsx';
import './index.css'; // Importa os estilos globais e tema

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolve o App com o Roteador */}
    <BrowserRouter>
      {/* Envolve o App com o Provedor do Carrinho */}
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
);