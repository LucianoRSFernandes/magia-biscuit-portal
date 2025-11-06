import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Importa Link
import { useCart } from '../context/CartContext';
import './ProductDetailPage.css'; // Importa os estilos da página
// Importa estilos de formulário para as classes de mensagem
import '../styles/FormStyles.css'; 
// Importa estilos de página de status (opcional, se usarmos .status-message)
import '../styles/StatusPage.css'; 

function ProductDetailPage() {
  const [produto, setProduto] = useState(null); // null: carregando, false: erro, objeto: sucesso
  const [erro, setErro] = useState(''); // Estado para mensagem de erro
  const { id } = useParams();
  const { addToCart } = useCart();

  useEffect(() => {
    // Define uma função async dentro do useEffect
    const fetchProduto = async () => {
      setProduto(null); // Define como carregando
      setErro('');   // Limpa erros anteriores
      try {
        const response = await fetch(`http://localhost:3000/produtos/${id}`);
        if (!response.ok) {
          let errorData;
          try { errorData = await response.json(); }
          catch(e) { errorData = { message: 'Produto não encontrado' }; }
          throw new Error(errorData.message || 'Produto não encontrado');
        }
        const data = await response.json();
        setProduto(data); // Armazena os dados do produto
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        setErro(error.message); // Guarda a mensagem de erro
        setProduto(false); // Define como estado de erro
      }
    };

    fetchProduto(); // Chama a função async
  }, [id]); // Dependência no ID

  // Mensagem de carregamento
  if (produto === null) {
    // Reutiliza o container principal para manter o estilo
    return (
        <div className="product-detail-container status-message loading-message">
            <p>Carregando dados do produto...</p>
        </div>
    );
  }
  
  // Mensagem de erro
  if (produto === false) {
     return (
         <div className="product-detail-container status-message error-message">
            {/* Reutiliza classes do FormStyles e StatusPage */}
            <p className="form-message error">Erro: {erro || 'Produto não encontrado.'}</p>
            <Link to="/" className="status-page-link" style={{marginTop: '1rem'}}>Voltar para a Home</Link>
         </div>
     );
  }

  // Renderização normal do produto
  return (
    <div className="product-detail-container">
      
      {/* Coluna da Imagem */}
      <div className="product-image-container">
        {produto.imagem_url ? (
          <img 
            src={produto.imagem_url} 
            // Alt text mais descritivo
            alt={`Imagem do produto ${produto.nome}`} 
            className="product-image" 
          />
        ) : (
          // Placeholder usando classe CSS
          <div className="image-placeholder-detail">
            Imagem indisponível
          </div>
        )}
      </div>

      {/* Coluna das Informações */}
      <div className="product-info-container">
        {/* Título "Detalhes do Produto" removido para dar mais ênfase ao nome */}
        {/* <h2>Detalhes do Produto</h2> */}
        
        <h3>{produto.nome || 'Produto sem nome'}</h3>
        
        <p className="product-detail-price">
          R$ {produto.preco ? Number(produto.preco).toFixed(2) : '0.00'}
        </p>
        
        {produto.categoria && (
            <p className="product-detail-category">
                Categoria: {produto.categoria}
            </p>
        )}
        
        <p className="product-detail-description">
          {produto.descricao || 'Descrição não disponível.'}
        </p>
        
        <button 
          onClick={() => addToCart(produto)} 
          className="add-to-cart-button"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}

export default ProductDetailPage;