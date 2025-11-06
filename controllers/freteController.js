// controllers/freteController.js (Versão Simulada Refatorada)

exports.calcularFrete = async (req, res) => {
  console.log("--- MODO DE SIMULAÇÃO DE FRETE ATIVADO ---");

  // Resposta simulada com a estrutura esperada pela API dos Correios
  const resultadoSimulado = [
    {
      Codigo: '04510',       // Código para PAC
      Valor: '25,50',         // Valor simulado para PAC
      PrazoEntrega: '10',      // Prazo simulado para PAC (em dias úteis)
      MsgErro: ''             // Mensagem de erro vazia (simulando sucesso)
    },
    {
      Codigo: '04014',       // Código para SEDEX
      Valor: '48,80',         // Valor simulado para SEDEX
      PrazoEntrega: '5',       // Prazo simulado para SEDEX (em dias úteis)
      MsgErro: ''             // Mensagem de erro vazia (simulando sucesso)
    }
  ];

  // Simula a latência de uma chamada de API real
  setTimeout(() => {
    res.status(200).json(resultadoSimulado); // Envia status 200 OK junto com os dados
  }, 500); // Atraso de 500 milissegundos
};