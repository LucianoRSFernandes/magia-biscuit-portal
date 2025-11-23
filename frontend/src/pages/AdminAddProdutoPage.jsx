import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css'; // Importa os estilos de formulário
import API_URL from '../config';

function AdminAddProdutoPage() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagem, setImagem] = useState(null); // Estado para o arquivo
  const [mensagem, setMensagem] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
        setImagem(event.target.files[0]);
    } else {
        setImagem(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('Enviando dados...');
    setIsError(false);
    setIsLoading(true); // Desabilita form

    // Validação do Preço
    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) {
        setMensagem('Por favor, insira um preço válido.');
        setIsError(true);
        setIsLoading(false);
        return;
    }
    // Validação da Imagem (já era required no input, mas reforça)
    if (!imagem) {
      setMensagem('Por favor, selecione uma imagem para o produto.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Você não está autenticado. Faça o login de administrador.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('descricao', descricao);
    formData.append('preco', precoNum); // Envia o número validado
    formData.append('categoria', categoria || ''); // Envia string vazia se não preenchido
    formData.append('imagem', imagem);


    try {
      const response = await fetch(`${API_URL}/api/produtos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Não definir 'Content-Type'
        },
        body: formData,
      });

      if (!response.ok) {
          let errorData;
          try {
              errorData = await response.json();
          } catch(jsonError) {
              errorData = { message: response.statusText };
          }
          throw new Error(errorData.message || 'Falha ao cadastrar produto.');
      }

      setMensagem('Produto cadastrado com sucesso! Redirecionando...');
      setIsError(false);
      setTimeout(() => navigate('/admin/produtos'), 1500);

    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setMensagem(`Erro: ${error.message}`);
      setIsError(true);
    } finally {
        setIsLoading(false); // Reabilita form
    }
  };

  return (
    <div className="form-container">
      <h2>Adicionar Novo Produto</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prod-nome">Nome:</label>
          <input
            id="prod-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={isLoading}
           />
        </div>
        <div className="form-group">
          <label htmlFor="prod-descricao">Descrição:</label>
          <textarea
            id="prod-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows="5" // Reduz um pouco a altura inicial
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="prod-preco">Preço:</label>
          <input
            id="prod-preco"
            type="number"
            step="0.01" // Permite centavos
            min="0" // Não permite preço negativo
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="prod-imagem">Imagem do Produto:</label>
          <input
            id="prod-imagem"
            type="file"
            accept="image/png, image/jpeg, image/webp" // Aceita formatos comuns
            onChange={handleImageChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="prod-categoria">Categoria:</label>
          <input
            id="prod-categoria"
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar Produto'}
        </button>
      </form>
      {mensagem && <p className={`form-message ${isError ? 'error' : 'success'}`}>{mensagem}</p>}
    </div>
  );
}

export default AdminAddProdutoPage;