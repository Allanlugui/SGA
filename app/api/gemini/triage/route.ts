import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, clientContext } = body;

    const systemInstruction = `
Você é o Assistente Virtual Inteligente da plataforma CorpServices.
Sua missão é conversar com o cliente para qualificar de forma amigável e direta a sua solicitação, sem termos técnicos excessivos ou explicações longas.
Mantenha suas respostas curtas, profissionais, limpas e focadas em resolver o problema do cliente.

Regras da Conversa:
1. Identifique se o cliente quer um SERVIÇO (manutenção, conserto, elétrica, climatização, limpeza) ou uma COMPRA (peças, ferramentas, lâmpadas, insumos).
2. Obtenha 3 informações fundamentais de forma conversacional:
   - Descrição clara do problema ou material necessário.
   - Localização física (onde fica o problema).
   - Equipamento ou sistema (ex: ar condicionado, gerador, lâmpadas, etc. - opcional ou geral se não houver).
3. Seja conciso. Não dê explicações técnicas sobre o que você está fazendo ou como a IA funciona.
4. Quando você julgar que tem informações suficientes sobre o problema e a localização, preencha o objeto "ticketData" para que o sistema possa gerar o chamado. Caso contrário, mantenha "ticketData" como nulo e faça uma pergunta simples para obter o que falta.

Contexto do Cliente Logado:
- Nome: ${clientContext?.name || 'Cliente'}
- Empresa: ${clientContext?.company || 'CorpServices'}
- Departamento: ${clientContext?.department || 'Geral'}
- Telefone: ${clientContext?.phone || 'Não informado'}
- Email: ${clientContext?.email || 'Não informado'}

Se o primeiro input for vazio ou genérico, cumprimente o cliente e pergunte brevemente como pode ajudar.
`;

    // Format messages for Gemini API
    const formattedContents = messages.map((m: any) => ({
      role: m.senderRole === 'cliente' ? 'user' : 'model',
      parts: [{ text: m.message }]
    }));

    if (!process.env.GEMINI_API_KEY) {
      // Fallback local conversation logic if no API key is set
      const lastUserMessage = [...messages].reverse().find(m => m.senderRole === 'cliente')?.message || '';
      const text = lastUserMessage.toLowerCase();

      let reply = 'Olá! Como posso ajudar você hoje com seus chamados ou pedidos de compras?';
      let ticketData: any = null;

      const hasProblem = text.length > 5;
      const hasLocation = text.includes('sala') || text.includes('andar') || text.includes('bloco') || text.includes('cobertura') || text.includes('depósito') || text.includes('escritório') || text.includes('almoxarifado') || text.includes('geral');

      if (hasProblem) {
        if (!hasLocation) {
          reply = 'Entendido. Poderia me informar em qual setor, sala ou localização física ocorreu esse problema?';
        } else {
          const isPurchase = text.includes('compr') || text.includes('peça') || text.includes('adquir') || text.includes('lote') || text.includes('insumo');
          reply = `Perfeito! Entendi a sua necessidade. Classifiquei seu pedido como ${isPurchase ? 'Solicitação de Compra' : 'Ordem de Serviço'}. Gostaria de confirmar a abertura do ticket agora?`;
          
          ticketData = {
            type: isPurchase ? 'compra' : 'servico',
            title: isPurchase ? 'Aquisição de Materiais de Reposição' : 'Atendimento Técnico Corretivo',
            description: lastUserMessage,
            urgency: 'alta',
            suggestedCategory: isPurchase ? 'Peças e Insumos' : 'Manutenção Geral',
            location: 'Local indicado pelo cliente',
            equipmentName: 'Equipamento Geral',
            estimatedCost: isPurchase ? 950 : 650,
            suggestedChecklist: isPurchase 
              ? ['Verificar saldo físico', 'Cotar com fornecedores', 'Enviar para aprovação']
              : ['Isolar área', 'Diagnosticar falha', 'Executar reparo', 'Registrar fotos']
          };
        }
      }

      return NextResponse.json({ reply, ticketData });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { 
              type: Type.STRING, 
              description: "Sua resposta conversacional curta ao cliente. Se todas as informações estiverem prontas, explique amigavelmente que o resumo do ticket foi gerado e pergunte se ele deseja confirmar a criação." 
            },
            ticketData: {
              type: Type.OBJECT,
              description: "Preencha APENAS se as informações coletadas (descrição e localização) forem suficientes. Caso contrário, retorne NULL.",
              properties: {
                type: { type: Type.STRING, description: "Exatamente 'servico' ou 'compra'" },
                title: { type: Type.STRING, description: "Título técnico resumido objetivo" },
                description: { type: Type.STRING, description: "Descrição compilada do problema" },
                urgency: { type: Type.STRING, description: "'baixa', 'media', 'alta' ou 'critica'" },
                suggestedCategory: { type: Type.STRING, description: "Categoria curta (ex: Elétrica, Hidráulica, Climatização, Peças)" },
                location: { type: Type.STRING, description: "Localização física exata coletada na conversa" },
                equipmentName: { type: Type.STRING, description: "Nome do equipamento ou sistema afetado" },
                estimatedCost: { type: Type.NUMBER, description: "Custo estimado aproximado realista" },
                suggestedChecklist: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 a 4 tarefas simples de checklist"
                }
              },
              required: ['type', 'title', 'description', 'urgency', 'suggestedCategory', 'location', 'equipmentName', 'suggestedChecklist']
            }
          },
          required: ['reply']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Erro na rota de triagem conversacional:', error);
    return NextResponse.json({
      reply: 'Desculpe, tive um pequeno problema ao processar sua mensagem. Poderia repetir ou me dizer qual é o chamado?',
      ticketData: null
    });
  }
}
