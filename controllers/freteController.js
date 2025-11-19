// Importa a função específica da biblioteca
const { calcularPrecoPrazo } = require('correios-brasil');

// Controller para calcular o frete
exports.calcularFrete = async (req, res) => {
    // 1. Recebemos o CEP de destino do front-end
    const { cepDestino, produtos } = req.body;

    // --- VALIDAÇÃO DE SEGURANÇA ---
    // Se não vier CEP, paramos aqui para não travar o servidor
    if (!cepDestino) {
        return res.status(400).json({ message: "CEP de destino é obrigatório." });
    }

    // 2. CEP de Origem Real (Campinas)
    const cepOrigem = '13049117'; 

    // 3. Definições do pacote (Valores Mínimos/Padrão)
    const pesoKg = req.body.pesoKg || 0.3; // 300g
    const formato = 1; // 1 = Caixa/Pacote
    const compCm = req.body.compCm || 16; 
    const altCm = req.body.altCm || 2;  
    const largCm = req.body.largCm || 11; 
    const maoPropria = 'N';
    const valorDeclarado = req.body.valorDeclarado || 0; 
    const avisoRecebimento = 'N';

    // 4. Códigos dos serviços (SEDEX e PAC varejo)
    const servicos = ['04014', '04510'];

    // 5. Monta os argumentos para a API
    // .replace(/\D/g, '') remove tudo que NÃO for número
    let args = {
        sCepOrigem: cepOrigem.replace(/\D/g, ''), 
        sCepDestino: cepDestino.replace(/\D/g, ''), 
        nVlPeso: String(pesoKg),
        nCdFormato: formato,
        nVlComprimento: String(compCm),
        nVlAltura: String(altCm),
        nVlLargura: String(largCm),
        nCdServico: servicos,
        nVlValorDeclarado: String(valorDeclarado),
        bMaoPropria: maoPropria,
        bAvisoRecebimento: avisoRecebimento,
    };

    // 6. Executa a chamada com Proteção de Falhas (Fallback)
    try {
        console.log("Consultando Correios com:", args);
        const resultado = await calcularPrecoPrazo(args);

        // Filtra apenas resultados válidos (sem erro na resposta XML)
        const fretesValidos = resultado.filter(servico => servico.MsgErro === "");

        if (fretesValidos.length === 0) {
            // Força um erro para cair no catch e usar o fallback
            throw new Error("Nenhuma opção retornada pelos Correios.");
        }

        console.log("Resultado Correios (Sucesso):", fretesValidos);
        res.status(200).json(fretesValidos);

    } catch (error) {
        console.error("Erro API Correios (Ativando Contingência):", error.message);

        // --- FALLBACK (PLANO B) ---
        // Retorna valores fixos para não travar a venda quando os Correios caem
        console.warn("⚠️ Usando Frete de Contingência (Fixo).");
        
        const freteContingencia = [
            {
                Codigo: '00001',
                Valor: '35,00', 
                PrazoEntrega: '7',
                MsgErro: '',
                Tipo: 'Frete Fixo (PAC)' 
            },
            {
                Codigo: '00002',
                Valor: '50,00', 
                PrazoEntrega: '3',
                MsgErro: '',
                Tipo: 'Frete Expresso (SEDEX)' 
            }
        ];

        return res.status(200).json(freteContingencia);
    }
};