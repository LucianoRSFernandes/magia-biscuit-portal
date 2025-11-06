const { MercadoPagoConfig, Preference } = require('mercadopago');

// Inicializa o cliente do Mercado Pago de forma mais segura
let client;
if (process.env.MERCADOPAGO_TOKEN) {
    client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_TOKEN });
} else {
    console.error("FATAL: MERCADOPAGO_TOKEN não está definido nas variáveis de ambiente!");
    // Considerar lançar um erro ou desabilitar a rota se a chave estiver faltando
}

exports.criarPreferencia = async (req, res) => {
  // Validação de Entrada
  const { cartItems, frete, dadosCliente } = req.body;
  const usuarioLogado = req.usuario; // Informação do token (adicionada pelo verificarToken)

  if (!client) {
      return res.status(500).json({ error: 'Configuração de pagamento indisponível.'});
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'Carrinho inválido ou vazio.' });
  }
  if (!frete || typeof frete.Valor !== 'string') { // Verifica se frete.Valor existe e é string
    return res.status(400).json({ error: 'Opção de frete inválida.' });
  }
  if (!dadosCliente || !dadosCliente.cpf || !dadosCliente.cep || !dadosCliente.logradouro || !dadosCliente.numero ) {
    return res.status(400).json({ error: 'Dados do cliente incompletos (CPF, CEP, Logradouro, Número são obrigatórios).' });
  }
  if (!usuarioLogado || !usuarioLogado.id || !usuarioLogado.nome) {
      console.error("Erro: Informações do usuário logado ausentes no token.", usuarioLogado);
      return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
  }

  try {
    // Mapeia e valida itens do carrinho
    const items = cartItems.map(item => {
      const unitPrice = Number(item.preco);
      const quantity = parseInt(item.quantidade, 10);
      if (!item.nome || isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice < 0) {
          throw new Error(`Item inválido no carrinho: ${JSON.stringify(item)}`);
      }
      return {
        id: item.id.toString(), // Opcional: Enviar ID interno
        title: item.nome,
        quantity: quantity,
        currency_id: 'BRL',
        unit_price: unitPrice
      };
    });

    // Adiciona o frete validado
    const fretePrice = parseFloat(frete.Valor.replace(',', '.'));
    if (isNaN(fretePrice) || fretePrice < 0) {
        throw new Error(`Valor de frete inválido: ${frete.Valor}`);
    }
    items.push({
      id: 'frete', // ID Fixo para frete
      title: 'Frete',
      quantity: 1,
      currency_id: 'BRL',
      unit_price: fretePrice
    });

    // URLs de Retorno Configuráveis
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Use variável de ambiente para deploy

    const preferenceBody = {
      items: items,
      payer: {
        name: usuarioLogado.nome, // Usa o nome do token
        // email: usuarioLogado.email, // Descomente se o email estiver no token e quiser enviar
        identification: {
            type: 'CPF',
            number: dadosCliente.cpf.replace(/\D/g, '') // Apenas números
        },
        address: {
          zip_code: dadosCliente.cep.replace(/\D/g, ''),
          street_name: dadosCliente.logradouro,
          street_number: dadosCliente.numero,
          // Opcional, mas recomendado se tiver:
          ...(dadosCliente.bairro && { neighborhood: dadosCliente.bairro }),
          ...(dadosCliente.cidade && { city_name: dadosCliente.cidade }), // Atenção: nome do campo pode variar
          ...(dadosCliente.estado && { federal_unit: dadosCliente.estado.toUpperCase() })
        }
      },
      back_urls: {
        success: `${baseUrl}/compra-sucesso`,
        failure: `${baseUrl}/compra-falha`,
        pending: `${baseUrl}/compra-pendente` // Opcional, mas bom ter
      },
      // external_reference: `pedido_${algumIdUnicoDoSeuSistema}`, // MUITO recomendado para conciliação
      notification_url: process.env.MERCADOPAGO_WEBHOOK_URL, // ESSENCIAL para receber atualizações de status
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceBody });

    // Verifica se o ponto de inicialização existe
    const checkoutUrl = result.sandbox_init_point || result.init_point;
    if (!checkoutUrl) {
        console.error("Erro: MP não retornou URL de inicialização.", result);
        throw new Error("Não foi possível obter a URL de pagamento do Mercado Pago.");
    }

    res.json({ checkoutUrl });

  } catch (error) {
    // Log de Erro Mais Detalhado
    console.error('Erro detalhado ao criar preferência de pagamento:', JSON.stringify(error.cause || error.message || error, null, 2));
    const errorMessage = error.cause?.message || error.message || 'Falha ao criar preferência de pagamento';
    // Tenta extrair status code do erro do MP, senão usa 500
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};