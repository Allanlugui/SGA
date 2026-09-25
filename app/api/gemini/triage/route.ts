import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientCompany, location, problemDescription, equipmentName, imageContext } = body;

    const prompt = `
Você é o Bot IA de Triagem e Qualificação de Chamados da plataforma corporativa "CorpServices".
Analise o relato do cliente e determine com precisão técnica se trata-se de um Chamado de SERVIÇO (manutenção preventiva, corretiva, elétrica, climatização, reparo em campo) OU de uma Solicitação de COMPRA (aquisição de materiais, peças de reposição, ferramentas, insumos, suprimentos de estoque).

Dados fornecidos:
- Cliente: ${clientName || 'Não informado'}
- Empresa: ${clientCompany || 'Não informado'}
- Local/Setor: ${location || 'Não informado'}
- Equipamento/Instalação: ${equipmentName || 'Geral'}
- Relato do Cliente: "${problemDescription || ''}"
${imageContext ? `- Contexto de Imagens enviadas: ${imageContext}` : ''}

Retorne um objeto JSON estritamente com os seguintes campos:
- type: "servico" ou "compra"
- title: título técnico objetivo e padronizado (máximo 80 caracteres)
- urgency: "baixa", "media", "alta" ou "critica"
- suggestedCategory: categoria técnica (ex: "Climatização Industrial", "Elétrica Predial", "Mecânica Pesada", "Peças e Insumos", "TI & Infraestrutura")
- summary: resumo executivo técnico com diagnóstico preliminar para o Gestor tomar a decisão (2 a 3 frases)
- estimatedCost: valor estimado em Reais (número aproximado realista)
- suggestedChecklist: lista de 3 a 5 itens práticos para a equipe de campo ou compras
- replyToClient: mensagem calorosa e profissional da CorpServices informando o cliente que o ticket foi gerado com sucesso, indicando o número de protocolo e próximos passos.
`;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if environment key is pending
      const isPurchase = (problemDescription || '').toLowerCase().includes('compr') || 
                         (problemDescription || '').toLowerCase().includes('adquir') ||
                         (problemDescription || '').toLowerCase().includes('peça') ||
                         (problemDescription || '').toLowerCase().includes('material');

      return NextResponse.json({
        type: isPurchase ? 'compra' : 'servico',
        title: isPurchase ? `Aquisição de Suprimentos: ${equipmentName || 'Manutenção'}` : `Atendimento Técnico: ${equipmentName || 'Instalação Predial'}`,
        urgency: 'alta',
        suggestedCategory: isPurchase ? 'Suprimentos & Peças' : 'Manutenção Geral',
        summary: `Triagem automática CorpServices: ${isPurchase ? 'Requisição de compra de materiais' : 'Chamado para intervenção técnica em campo'}. Dados coletados pelo Bot IA.`,
        estimatedCost: isPurchase ? 1200 : 650,
        suggestedChecklist: isPurchase 
          ? ['Cotar com 3 fornecedores homologados', 'Verificar estoque mínimo', 'Aprovação orçamentária do Gestor']
          : ['Inspecionar local e verificar segurança', 'Testar componentes e identificar causa raiz', 'Registrar fotos antes e depois do serviço'],
        replyToClient: `Olá ${clientName || 'Cliente'}, seu chamado foi qualificado com sucesso! Nossa equipe operacional já recebeu os detalhes e estamos processando o atendimento.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: "Deve ser exatamente 'servico' ou 'compra'",
            },
            title: {
              type: Type.STRING,
              description: "Título técnico resumido do ticket",
            },
            urgency: {
              type: Type.STRING,
              description: "'baixa', 'media', 'alta' ou 'critica'",
            },
            suggestedCategory: {
              type: Type.STRING,
              description: "Categoria da OS ou da Compra",
            },
            summary: {
              type: Type.STRING,
              description: "Resumo executivo para o Gestor Operacional",
            },
            estimatedCost: {
              type: Type.NUMBER,
              description: "Custo estimado em R$",
            },
            suggestedChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 a 5 tarefas de checklist",
            },
            replyToClient: {
              type: Type.STRING,
              description: "Resposta amigável e profissional ao cliente",
            },
          },
          required: ['type', 'title', 'urgency', 'suggestedCategory', 'summary', 'replyToClient'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Erro na rota de triagem Gemini:', error);
    return NextResponse.json({
      type: 'servico',
      title: 'Solicitação de Atendimento Técnico em Campo',
      urgency: 'media',
      suggestedCategory: 'Manutenção Geral',
      summary: 'Triagem executada via motor de contingência CorpServices. Requer análise manual do Gestor.',
      estimatedCost: 500,
      suggestedChecklist: [
        'Análise in-loco da falha',
        'Registro fotográfico das condições',
        'Conclusão e coleta de assinatura'
      ],
      replyToClient: 'Recebemos suas informações! O chamado foi registrado e já está na fila de triagem da nossa equipe.'
    });
  }
}
