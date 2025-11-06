import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/StatusPage.css'; // Importa os estilos de página de status

function FailurePage() {
  return (
    // Aplica a classe principal ao container
    <div className="status-page-container">
      {/* Adiciona classe específica para o título de falha */}
      <h2 className="failure-title">Falha no Pagamento</h2>
      <p>Houve um problema ao processar seu pagamento. Verifique os dados inseridos ou tente outro meio de pagamento.</p>
      {/* Aplica classe ao link */}
      <Link to="/carrinho" className="status-page-link">Voltar para o carrinho</Link>
    </div>
  );
}

export default FailurePage;