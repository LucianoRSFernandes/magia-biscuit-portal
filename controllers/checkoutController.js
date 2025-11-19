const { MercadoPagoConfig, Preference } = require('mercadopago');

// Inicializa o cliente do Mercado Pago de forma mais segura
let client;
if (process.env.MERCADOPAGO_TOKEN) {
    client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_TOKEN });
} else {
    console.error("FATAL: MERCADOPAGO_TOKEN não está definido nas variáveis de ambiente!");
}

exports.criarPreferencia = async (req, res) => {
    // 1. Validação de Entrada
    const { cartItems, frete, dadosCliente } = req.body;
    const usuarioLogado = req.usuario; // Informação vinda do middleware verificarToken

    if (!client) {
        return res.status(500).json({ error: 'Configuração de pagamento indisponível no servidor.' });
    }

    // Validações básicas
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: 'Carrinho inválido ou vazio.' });
    }

    // Validação robusta para garantir que o valor do frete existe (seja string ou number)
    if (!frete || (typeof frete.Valor !== 'string' && typeof frete.Valor !== 'number')) {
        return res.status(400).json({ error: 'Opção de frete inválida.' });
    }

    if (!dadosCliente || !dadosCliente.cpf || !dadosCliente.cep || !dadosCliente.logradouro || !dadosCliente.numero) {
        return res.status(400).json({ error: 'Dados do cliente incompletos (CPF, CEP, Logradouro, Número são obrigatórios).' });
    }

    if (!usuarioLogado || !usuarioLogado.id || !usuarioLogado.nome) {
        console.error("Erro: Informações do usuário logado ausentes no token.", usuarioLogado);
        return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
    }

    try {
        // 2. Mapeia e valida itens do carrinho
        const items = cartItems.map(item => {
            const unitPrice = Number(item.preco);
            const quantity = parseInt(item.quantidade, 10);

            if (!item.nome || isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice < 0) {
                throw new Error(`Item inválido no carrinho: ${JSON.stringify(item)}`);
            }

            return {
                id: item.id.toString(),
                title: item.nome,
                quantity: quantity,
                currency_id: 'BRL',
                unit_price: unitPrice
            };
        });

        // 3. Tratamento e adição do Frete
        // Garante que o valor seja string antes de usar replace, evitando crash se vier como number
        const valorFreteString = frete.Valor.toString();
        const fretePrice = parseFloat(valorFreteString.replace(',', '.'));

        if (isNaN(fretePrice) || fretePrice < 0) {
            throw new Error(`Valor de frete inválido: ${frete.Valor}`);
        }

        items.push({
            id: 'frete',
            title: 'Frete',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: fretePrice
        });

        // 4. Configuração de URLs
        // Usa a variável de ambiente se existir (Deploy), senão usa localhost (Dev)
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const preferenceBody = {
            items: items,
            payer: {
                name: usuarioLogado.nome,
                identification: {
                    type: 'CPF',
                    number: dadosCliente.cpf.replace(/\D/g, '') // Remove caracteres não numéricos
                },
                address: {
                    zip_code: dadosCliente.cep.replace(/\D/g, ''), // A vírgula corrigida aqui!
                    street_name: dadosCliente.logradouro,
                    street_number: dadosCliente.numero,
                    // Adiciona campos opcionais apenas se eles existirem
                    ...(dadosCliente.bairro && { neighborhood: dadosCliente.bairro }),
                    ...(dadosCliente.cidade && { city_name: dadosCliente.cidade }),
                    ...(dadosCliente.estado && { federal_unit: dadosCliente.estado.toUpperCase() })
                }
            },
            back_urls: {
                success: `${baseUrl}/compra-sucesso`,
                failure: `${baseUrl}/compra-falha`,
                pending: `${baseUrl}/compra-pendente`
            },
            auto_return: "approved", // (Opcional) Retorna ao site automaticamente se aprovado
            notification_url: process.env.MERCADOPAGO_WEBHOOK_URL, // Essencial para receber status de pagamento
        };

        // 5. Cria a preferência
        const preference = new Preference(client);
        const result = await preference.create({ body: preferenceBody });

        // 6. Obtém a URL de pagamento
        const checkoutUrl = result.sandbox_init_point || result.init_point;
        
        if (!checkoutUrl) {
            console.error("Erro: MP não retornou URL de inicialização.", result);
            throw new Error("Não foi possível obter a URL de pagamento do Mercado Pago.");
        }

        res.json({ checkoutUrl });

    } catch (error) {
        // Log Detalhado para Debug
        console.error('Erro detalhado ao criar preferência de pagamento:', JSON.stringify(error.cause || error.message || error, null, 2));
        
        const errorMessage = error.cause?.message || error.message || 'Falha ao criar preferência de pagamento';
        const statusCode = error.status || 500;
        
        res.status(statusCode).json({ error: errorMessage });
    }
};