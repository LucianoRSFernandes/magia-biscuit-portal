import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminStyles.css'; // Importa os estilos de admin
import API_URL from '../config';

function AdminProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState(''); // Estado para mensagens de erro
  const [isLoading, setIsLoading] = useState(true); // 1. Adiciona estado de carregamento

  // Função para buscar produtos
  const fetchProdutos = async () => {
    setIsLoading(true); // Inicia carregamento
    setErro(''); // Limpa erros antigos
    try {
      // A listagem de produtos é pública
      const response = await fetch(`${API_URL}/api/produtos`);
      if (!response.ok) {
        throw new Error('Falha ao buscar produtos.');
      }
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setErro(error.message); // Define a mensagem de erro
    } finally {
        setIsLoading(false); // Finaliza carregamento (sucesso ou erro)
    }
  };

  // Busca os produtos quando o componente monta
  useEffect(() => {
    fetchProdutos();
  }, []); // Executa apenas uma vez

  // Função para deletar um produto
  const handleDelete = async (produtoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    setErro(''); // Limpa erro antes de tentar deletar
    const token = localStorage.getItem('token');
    if (!token) {
      setErro('Acesso negado. Faça o login de administrador.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/produtos/${produtoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Produto excluído com sucesso!');
        // Atualiza a lista removendo o item excluído
        setProdutos(produtos.filter(p => p.id !== produtoId));
      } else {
          let errorData;
          try {
              errorData = await response.json();
          } catch(jsonError) {
              errorData = { message: response.statusText };
          }
        throw new Error(errorData.message || 'Falha ao excluir produto.');
      }
    } catch (error) {
       console.error('Erro ao excluir produto:', error);
       setErro(`Erro ao excluir produto: ${error.message}`); // Mostra erro na tela
       // Alert foi removido para usar o <p> de erro
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Gerenciar Produtos</h2>
      <Link to="/admin/produtos/novo" className="admin-button-link">
        Adicionar Novo Produto
      </Link>

      {/* Exibe mensagem de erro */}
      {erro && <p style={{ color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold' }}>{erro}</p>}

      {/* Exibe mensagem de carregamento */}
      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando produtos...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* Mensagem se não houver produtos após carregar */}
            {!isLoading && !erro && produtos.length === 0 ? (
               <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</td>
              </tr>
            ) : (
              produtos.map(produto => (
                <tr key={produto.id}>
                  <td>{produto.id}</td>
                  <td>{produto.nome}</td>
                  {/* Garante formatação correta do preço */}
                  <td>R$ {produto.preco ? Number(produto.preco).toFixed(2) : '0.00'}</td>
                  <td className="action-buttons">
                    <Link to={`/admin/produtos/editar/${produto.id}`}>
                      <button>Editar</button>
                    </Link>
                    <button onClick={() => handleDelete(produto.id)}>Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminProdutosPage;