import React from 'react';
import { Link } from 'react-router-dom';
import './ProdutoCard.css';

function ProdutoCard({ produto }) {
  // Retorna null (ou um skeleton/placeholder) se não houver dados do produto
  if (!produto) {
    return null;
  }

  // Garante que o preço seja um número antes de formatar
  const precoFormatado = produto.preco ? Number(produto.preco).toFixed(2) : '0.00';

  return (
    // Link envolvendo todo o card
    <Link to={`/produtos/${produto.id}`} className="produto-card-link">
      <div className="produto-card">

        {/* Imagem do Produto ou Placeholder */}
        {produto.imagem_url ? (
          <img src={produto.imagem_url} alt={produto.nome || 'Imagem do produto'} className="produto-imagem" />
        ) : (
          <div className="imagem-placeholder">Imagem Indisponível</div>
        )}

        {/* Nome do Produto */}
        <h3>{produto.nome || "Produto sem nome"}</h3>

        {/* Preço Formatado */}
        <p className="produto-preco">
          R$ {precoFormatado}
        </p>

        {/* Descrição */}
        <p className="produto-descricao">{produto.descricao || "Descrição não disponível."}</p>
      </div>
    </Link>
  );
}

export default ProdutoCard;