import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css'; // Importa o arquivo de estilo
// Importa estilos de formulário para mensagens
import '../styles/FormStyles.css';
import API_URL from '../config';

function CheckoutPage() {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  // Estados para os campos do formulário
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Estados para o frete
  const [freteOpcoes, setFreteOpcoes] = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);
  const [isLoadingFrete, setIsLoadingFrete] = useState(false);
  const [freteErro, setFreteErro] = useState(''); // Mensagem de erro específica do frete

  // Estados para feedback e submissão
  const [mensagem, setMensagem] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de submissão

  // Calcula o subtotal dos produtos
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.preco) * item.quantidade, 0);

  // Função para buscar as opções de frete
  const handleCepBlur = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    setFreteErro(''); // Limpa erro anterior
    if (cepLimpo.length !== 8) {
      setFreteOpcoes([]);
      setFreteSelecionado(null);
      if (cep.length > 0) setFreteErro('CEP inválido.'); // Mostra erro se algo foi digitado
      return;
    }

    setIsLoadingFrete(true);
    setFreteOpcoes([]);
    setFreteSelecionado(null);
    try {
      const response = await fetch(`${API_URL}/api/frete/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cepLimpo }),
      });
      const data = await response.json();
      if (response.ok) {
        const opcoesValidas = data.filter(opcao => opcao.Valor && opcao.Valor !== '0,00' && !opcao.MsgErro);
        setFreteOpcoes(opcoesValidas);
        if (opcoesValidas.length === 0) {
            setFreteErro('Nenhuma opção de frete encontrada para este CEP.');
        }
      } else {
         // Tenta ler a mensagem de erro da API de frete
         let apiErrorMsg = 'Não foi possível calcular o frete.';
         try { apiErrorMsg = data.error || apiErrorMsg; } catch (e) {}
         setFreteErro(apiErrorMsg);
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      setFreteErro('Ocorreu um erro ao buscar as opções de frete.');
    } finally {
      setIsLoadingFrete(false);
    }
  };

  // Lógica final do botão "Ir para Pagamento"
  const handleCheckout = async () => {
    setMensagem(''); // Limpa mensagens
    setIsError(false);

    // Validações
    const token = localStorage.getItem('token');
    if (!token) {
      setMensagem('Por favor, faça o login para finalizar a compra.');
      setIsError(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    if (!freteSelecionado) {
      setMensagem('Por favor, selecione uma opção de frete.');
      setIsError(true);
      return;
    }
    if (!cpf || !cep || !logradouro || !numero || !bairro || !cidade || !estado) {
        setMensagem('Por favor, preencha todos os dados de endereço e CPF.');
        setIsError(true);
        return;
    }
    // Adicionar validação de formato de CPF/CEP aqui se desejado

    setMensagem('Processando seu pedido...');
    setIsSubmitting(true); // Desabilita botão

    const checkoutData = {
      cartItems,
      frete: freteSelecionado,
      dadosCliente: { cpf, cep, logradouro, numero, bairro, cidade, estado }
    };

    try {
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(checkoutData)
      });

      if (!response.ok) {
          let errorData;
          try { errorData = await response.json();}
          catch(e){ errorData = { error: response.statusText }; }
          throw new Error(errorData.error || 'Falha ao criar preferência de pagamento.');
      }

      const data = await response.json();
      // Se a URL for recebida, redireciona
      if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
      } else {
          throw new Error('URL de pagamento não recebida.');
      }
      // Não limpa mensagem aqui, pois será redirecionado

    } catch (error) {
      console.error('Erro no checkout:', error);
      setMensagem(`Erro: ${error.message}`);
      setIsError(true);
      setIsSubmitting(false); // Reabilita botão em caso de erro
    }
    // Não precisa de finally aqui, pois o sucesso redireciona
  };

  const valorFrete = freteSelecionado ? parseFloat(freteSelecionado.Valor.replace(',', '.')) : 0;
  const totalGeral = subtotal + valorFrete;

  return (
    <div className="checkout-page-container">
      <h2>Finalizar Compra</h2>
      <div className="checkout-container">
        <div className="form-section">
          <h3>Dados Pessoais e de Entrega</h3>
          {/* Usamos fieldset para agrupar campos relacionados */}
          <fieldset disabled={isSubmitting}>
            <form> {/* Form sem submit próprio */}
              <div className="form-group">
                <label htmlFor="checkout-cpf">CPF:</label>
                <input id="checkout-cpf" type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-cep">CEP:</label>
                <input id="checkout-cep" type="text" value={cep} onChange={(e) => setCep(e.target.value)} onBlur={handleCepBlur} placeholder="Apenas números" required />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-logradouro">Logradouro:</label>
                <input id="checkout-logradouro" type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-numero">Número:</label>
                <input id="checkout-numero" type="text" value={numero} onChange={(e) => setNumero(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-bairro">Bairro:</label>
                <input id="checkout-bairro" type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-cidade">Cidade:</label>
                <input id="checkout-cidade" type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-estado">Estado (UF):</label>
                <input id="checkout-estado" type="text" value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength="2" required />
              </div>
            </form>
          </fieldset> {/* Fim do fieldset */}

          {/* Seção de Frete */}
          {isLoadingFrete && <p style={{marginTop: '1rem'}}>Calculando frete...</p>}
          {/* Exibe erro específico do frete */}
          {freteErro && <p style={{marginTop: '1rem', color: '#ff6b6b'}}>{freteErro}</p>}
          {freteOpcoes.length > 0 && (
            <fieldset disabled={isSubmitting} className="frete-options">
              <h3>Opções de Frete</h3>
              {freteOpcoes.map(opcao => (
                <div key={opcao.Codigo}>
                  <input type="radio" name="frete" id={`frete-${opcao.Codigo}`} onChange={() => setFreteSelecionado(opcao)} checked={freteSelecionado?.Codigo === opcao.Codigo} />
                  <label htmlFor={`frete-${opcao.Codigo}`}>
                    {opcao.Codigo === '04510' ? 'PAC' : 'SEDEX'} -
                    R$ {opcao.Valor} (Prazo: {opcao.PrazoEntrega} dias)
                  </label>
                </div>
              ))}
            </fieldset>
          )}
           {!isLoadingFrete && cep.replace(/\D/g, '').length === 8 && freteOpcoes.length === 0 && !freteErro && (
             <p style={{marginTop: '1rem'}}>Nenhuma opção de frete encontrada para este CEP.</p>
           )}
        </div>

        {/* Seção Resumo do Pedido */}
        <div className="summary-section">
          <h3>Resumo do Pedido</h3>
          {cartItems.map(item => (
            <div key={item.id} className="item-summary">
              <span>{item.nome} x {item.quantidade}</span>
              <span> R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <p>Subtotal: <span>R$ {subtotal.toFixed(2)}</span></p>
          {freteSelecionado && <p>Frete ({freteSelecionado.Codigo === '04510' ? 'PAC' : 'SEDEX'}): <span>R$ {freteSelecionado.Valor}</span></p>}
          <hr />
          <h4>Total: <span>R$ {totalGeral.toFixed(2)}</span></h4>
          {/* Mensagem de Feedback */}
          {mensagem && <p className={`form-message ${isError ? 'error' : 'success'}`} style={{textAlign: 'center', marginBottom: '1rem'}}>{mensagem}</p>}
          {/* Botão de Checkout */}
          <button onClick={handleCheckout} disabled={isSubmitting || cartItems.length === 0}>
            {isSubmitting ? 'Processando...' : 'Ir para Pagamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;