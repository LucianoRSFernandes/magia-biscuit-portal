import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // 1. Importa o useCart
import '../styles/StatusPage.css'; // 2. Importa os estilos de página de status

function SuccessPage() {
  const { clearCart } = useCart(); // 3. Pega a função de limpar o carrinho

  // Efeito para limpar o carrinho quando esta página carregar
  useEffect(() => {
    // Limpa o carrinho no Contexto e no LocalStorage
    console.log("Compra finalizada. Limpando o carrinho...");
    clearCart();
    
    // O 'eslint-disable-next-line' é opcional, mas remove o warning
    // de dependência, já que SÓ queremos que isso rode uma vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio garante que rode apenas uma vez

  return (
    // 4. Aplica a classe principal ao container
    <div className="status-page-container">
      
      {/* 5. Adiciona classe específica para o título de sucesso */}
      <h2 className="success-title">
        <span role="img" aria-label="Sucesso">✅</span> Compra Realizada com Sucesso!
      </h2>
      
      <p>
        Obrigado pela sua compra! Você receberá um e-mail de confirmação em breve.
        Seu pedido já está sendo preparado pela nossa artesã.
      </p>
      
      {/* 6. Aplica classe ao link */}
      <Link to="/" className="status-page-link">
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}

export default SuccessPage;