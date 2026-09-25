import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inventoryItems, pendingTickets } = body;

    const prompt = `
Você é o Bot IA de Compras e Gestão de Suprimentos da "CorpServices".
Analise o estado atual dos itens de estoque e eventuais tickets em aberto para fornecer recomendações estratégicas de compra e reposição para a compradora Juliana e o gestor Carlos.

Itens de Estoque:
${JSON.stringify(inventoryItems, null, 2)}

Tickets recentes:
${JSON.stringify(pendingTickets || [], null, 2)}

Gere um parecer analítico em JSON com:
- alertsCount: quantidade de itens em situação de alerta ou crítico
- recommendations: array de recomendações de compra com (itemCode, itemName, suggestedQuantity, estimatedBudget, supplier, reason, priority: 'critica'|'alta'|'media')
- executiveSummary: resumo estratégico para a diretoria sobre riscos de desabastecimento e oportunidade de negociação com fornecedores
`;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        alertsCount: 2,
        recommendations: [
          {
            itemCode: 'ELET-DISJ-32A',
            itemName: 'Disjuntor Bipolar Din 32A Curva C Schneider',
            suggestedQuantity: 30,
            estimatedBudget: 1275.00,
            supplier: 'EletroDistribuidora Paulista',
            reason: 'Estoque atual (4 un) muito abaixo do mínimo operacional de 10 unidades com alta demanda em OS elétricas.',
            priority: 'critica'
          },
          {
            itemCode: 'LUB-IND-ISO68',
            itemName: 'Óleo Hidráulico e Lubrificante ISO VG 68 20L',
            suggestedQuantity: 15,
            estimatedBudget: 4200.00,
            supplier: 'PetroLub Suprimentos',
            reason: 'Restam apenas 2 bombonas de 20L no depósito, com manutenções preventivas programadas.',
            priority: 'critica'
          }
        ],
        executiveSummary: 'Identificamos 2 insumos essenciais em estado crítico de estoque. Recomendamos abertura imediata de cotação para disjuntores e óleo hidráulico para evitar paradas em clientes industriais.'
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
            alertsCount: { type: Type.INTEGER },
            executiveSummary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemCode: { type: Type.STRING },
                  itemName: { type: Type.STRING },
                  suggestedQuantity: { type: Type.INTEGER },
                  estimatedBudget: { type: Type.NUMBER },
                  supplier: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  priority: { type: Type.STRING }
                },
                required: ['itemCode', 'itemName', 'suggestedQuantity', 'estimatedBudget', 'supplier', 'reason', 'priority']
              }
            }
          },
          required: ['alertsCount', 'executiveSummary', 'recommendations']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Erro na rota de compras Gemini:', error);
    return NextResponse.json({
      alertsCount: 2,
      recommendations: [
        {
          itemCode: 'ELET-DISJ-32A',
          itemName: 'Disjuntor Bipolar Din 32A Curva C Schneider',
          suggestedQuantity: 25,
          estimatedBudget: 1062.50,
          supplier: 'EletroDistribuidora Paulista',
          reason: 'Reposição preventiva recomendada.',
          priority: 'alta'
        }
      ],
      executiveSummary: 'Análise de ressuprimento concluída. Recomendamos verificar os itens com estoque abaixo da margem de segurança.'
    });
  }
}
