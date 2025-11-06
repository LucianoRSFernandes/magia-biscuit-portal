import React, { useState, useEffect } from 'react';
import '../styles/AdminStyles.css'; // Importa os estilos de admin

function AdminClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 1. Adiciona estado de carregamento

  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true); // Inicia o carregamento
      setErro(''); // Limpa erros antigos
      const token = localStorage.getItem('token');

      if (!token) {
        setErro('Acesso negado. Faça o login de administrador.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/clientes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          let errorMessage = `Erro ${response.status}: Falha ao buscar dados ou você não tem permissão.`;
          try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
             // Mantém a mensagem padrão
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setErro(error.message); // Define a mensagem de erro
      } finally {
          setIsLoading(false); // Finaliza o carregamento (sucesso ou erro)
      }
    };

    fetchClientes();
  }, []); // Executa apenas uma vez ao montar o componente

  return (
    <div className="admin-page-container">
      <h2>Consultar Clientes Cadastrados</h2>

      {/* Exibe mensagem de erro */}
      {erro && <p style={{ color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold' }}>{erro}</p>}

      {/* Exibe mensagem de carregamento */}
      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando clientes...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Data de Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {/* Verifica se não está carregando E não há erros E a lista está vazia */}
            {!isLoading && !erro && clientes.length === 0 ? (
               <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum cliente cadastrado.</td>
              </tr>
            ) : (
              clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.email}</td>
                  {/* Formata a data de forma mais segura */}
                  <td>{cliente.data_cadastro ? new Date(cliente.data_cadastro).toLocaleDateString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminClientesPage;