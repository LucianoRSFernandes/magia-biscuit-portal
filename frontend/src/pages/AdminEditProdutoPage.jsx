import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css'; // Importa os estilos de formulário
import API_URL from '../config';

function AdminEditProdutoPage() {
  // Estados para os campos
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagemUrlAtual, setImagemUrlAtual] = useState(''); // Para exibir a imagem existente
  const [novaImagem, setNovaImagem] = useState(null); // Para o novo arquivo
  const [mensagem, setMensagem] = useState(''); // Para feedback
  const [isError, setIsError] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Carregamento inicial
  const [isSubmitting, setIsSubmitting] = useState(false); // Submissão do formulário

  const { id } = useParams();
  const navigate = useNavigate();

  // Busca os dados do produto atual ao carregar
  useEffect(() => {
    setIsLoadingData(true);
    setMensagem(''); // Limpa mensagens anteriores
    setIsError(false);
    fetch(`${API_URL}/produtos/${id}`)
      .then(res => {
          if (!res.ok) {
              // Tenta ler o erro, senão usa mensagem padrão
              return res.json().then(errData => { throw new Error(errData.message || 'Produto não encontrado'); });
          }
          return res.json();
      })
      .then(data => {
        setNome(data.nome);
        setDescricao(data.descricao);
        // Garante que o preço seja string para o input type="number"
        setPreco(data.preco ? String(Number(data.preco).toFixed(2)) : '');
        setCategoria(data.categoria || '');
        setImagemUrlAtual(data.imagem_url || '');
      })
      .catch(error => {
          console.error('Erro ao buscar produto:', error);
          setMensagem(`Erro ao carregar produto: ${error.message}`);
          setIsError(true);
      })
      .finally(() => {
          setIsLoadingData(false); // Finaliza carregamento inicial
      });
  }, [id]); // Dependência no ID

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
        setNovaImagem(event.target.files[0]);
    } else {
        setNovaImagem(null);
    }
  };

  // Envia os dados atualizados
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('Salvando alterações...');
    setIsError(false);
    setIsSubmitting(true); // Desabilita form

    // Validação do Preço
    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) {
        setMensagem('Por favor, insira um preço válido.');
        setIsError(true);
        setIsSubmitting(false);
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Autenticação necessária.');
      setIsError(true);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('descricao', descricao);
    formData.append('preco', precoNum); // Envia o número validado
    formData.append('categoria', categoria || '');
    formData.append('imagem_url_existente', imagemUrlAtual || ''); // Envia URL atual
    // Adiciona o novo arquivo apenas se selecionado
    if (novaImagem) {
      formData.append('imagem', novaImagem);
    }


    try {
      const response = await fetch(`${API_URL}/produtos/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
            // Não definir 'Content-Type'
        },
        body: formData
      });

      if (!response.ok) {
          let errorData;
          try {
              errorData = await response.json();
          } catch(jsonError) {
              errorData = { message: response.statusText };
          }
          throw new Error(errorData.message || 'Falha ao atualizar produto.');
      }

      setMensagem('Produto atualizado com sucesso! Redirecionando...');
      setIsError(false);
      setTimeout(() => navigate('/admin/produtos'), 1500);

    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setMensagem(`Erro: ${error.message}`);
      setIsError(true);
    } finally {
        setIsSubmitting(false); // Reabilita form
    }
  };

  // Exibe mensagem de carregamento ou erro antes do formulário
  if (isLoadingData) {
      return <div className="form-container"><p style={{ textAlign: 'center' }}>Carregando dados do produto...</p></div>;
  }
  // Se deu erro ao carregar E não temos nome (significa que a busca inicial falhou)
  if (isError && !nome) {
     return <div className="form-container"><p className={`form-message error`}>{mensagem}</p></div>;
  }


  return (
    <div className="form-container">
      <h2>Editar Produto (ID: {id})</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="edit-prod-nome">Nome:</label>
          <input
            id="edit-prod-nome"
            type="text" value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-prod-descricao">Descrição:</label>
          <textarea
            id="edit-prod-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows="5"
            required
            disabled={isSubmitting}
           />
        </div>
        <div className="form-group">
          <label htmlFor="edit-prod-preco">Preço:</label>
          <input
            id="edit-prod-preco"
            type="number"
            step="0.01"
            min="0"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-prod-categoria">Categoria:</label>
          <input
            id="edit-prod-categoria"
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Exibição da Imagem Atual */}
        {imagemUrlAtual && (
          <div className="form-group">
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Imagem Atual:</p>
            <img src={imagemUrlAtual} alt="Imagem atual do produto" style={{ maxWidth: '200px', marginBottom: '10px', display: 'block', borderRadius: '4px' }} />
          </div>
        )}

        {/* Campo para Nova Imagem */}
        <div className="form-group">
          <label htmlFor="edit-prod-imagem">Alterar Imagem (opcional):</label>
          <input
            id="edit-prod-imagem"
            type="file"
            accept="image/png, image/jpeg, image/webp" // Aceita formatos comuns
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Botão de Submit */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
      {/* Mensagem de Feedback */}
       {mensagem && <p className={`form-message ${isError ? 'error' : 'success'}`}>{mensagem}</p>}
    </div>
  );
}

export default AdminEditProdutoPage;