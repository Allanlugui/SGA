'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { InventoryItem } from '@/types';
import { 
  Boxes, 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  Search, 
  TrendingDown, 
  CheckCircle, 
  ShoppingCart, 
  ArrowUpRight,
  Edit2,
  DollarSign
} from 'lucide-react';

export function InventoryManager() {
  const { 
    inventory, 
    tickets, 
    updateInventoryStock, 
    createPurchaseFromRecommendation,
    currentUserRole 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
  
  // AI Advisor State
  const [isConsultingAI, setIsConsultingAI] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  // Manual Stock Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [newStockCount, setNewStockCount] = useState<number>(0);

  const categories = Array.from(new Set(inventory.map(i => i.category)));

  const filteredItems = inventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                          i.code.toLowerCase().includes(search.toLowerCase()) ||
                          i.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'todas' || i.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const criticalItemsCount = inventory.filter(i => i.status === 'critico').length;
  const warningItemsCount = inventory.filter(i => i.status === 'alerta_baixo').length;

  const handleConsultAIAdvisor = async () => {
    setIsConsultingAI(true);
    try {
      const res = await fetch('/api/gemini/inventory-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItems: inventory,
          pendingTickets: tickets.slice(0, 5)
        })
      });

      const data = await res.json();
      setAiReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConsultingAI(false);
    }
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustItem(item);
    setNewStockCount(item.currentStock);
  };

  const handleSaveAdjust = () => {
    if (!adjustItem) return;
    updateInventoryStock(adjustItem.id, newStockCount);
    setAdjustItem(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e7dfd1]">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center">
            <Boxes className="w-5 h-5 mr-2 text-[#c85a32]" />
            Controle de Estoque & Peças de Reposição
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Gestão de almoxarifado técnico com monitoramento de saldo mínimo e requisições automatizadas por Bot IA
          </p>
        </div>

        {/* AI Inventory Advisor CTA */}
        <button
          onClick={handleConsultAIAdvisor}
          disabled={isConsultingAI}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 min-h-[40px]"
        >
          {isConsultingAI ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Bot IA Analisando Níveis de Estoque...</span>
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" />
              <span>Consultar Bot IA de Suprimentos</span>
              <Sparkles className="w-3.5 h-3.5 text-orange-200" />
            </>
          )}
        </button>
      </div>

      {/* Stock Alerts Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#e7dfd1] shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Itens Cadastrados</span>
          <div className="text-2xl font-black text-stone-900 mt-1">{inventory.length} itens</div>
          <span className="text-[11px] text-stone-500">Almoxarifado Geral & HVAC</span>
        </div>

        <div className="bg-[#fdf2f2] p-4 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Estoque Crítico (Risco de Parada)
          </span>
          <div className="text-2xl font-black text-rose-700 mt-1">{criticalItemsCount} itens</div>
          <span className="text-[11px] text-rose-600/80">Abaixo de 50% do mínimo</span>
        </div>

        <div className="bg-[#fffbeb] p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Ponto de Pedido (Alerta)</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{warningItemsCount} itens</div>
          <span className="text-[11px] text-stone-500">Próximos da margem de reposição</span>
        </div>
      </div>

      {/* AI Bot Recommendation Box */}
      {aiReport && (
        <div className="bg-[#fdf8f5] p-5 rounded-2xl border border-[#df8c6f]/40 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#c85a32] flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center">
                  Diagnóstico Estratégico do Bot IA de Compras
                </h3>
                <span className="text-[11px] text-[#c85a32] font-medium">
                  {aiReport.alertsCount} insumos críticos identificados com risco operacional
                </span>
              </div>
            </div>

            <button
              onClick={() => setAiReport(null)}
              className="text-stone-500 hover:text-stone-900 text-xs py-1 min-h-[32px] px-2 rounded-lg hover:bg-[#ede5d8]"
            >
              Fechar ✕
            </button>
          </div>

          <p className="text-xs text-stone-800 bg-white p-3 rounded-xl border border-[#e7dfd1] leading-relaxed italic">
            &quot;{aiReport.executiveSummary}&quot;
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiReport.recommendations?.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-xl border border-[#e7dfd1] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#c85a32] bg-[#fdf2ed] px-2 py-0.5 rounded border border-[#f5d6c6] font-bold">
                      {rec.itemCode}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                      {rec.priority || 'alta'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mt-1">{rec.itemName}</h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-snug">{rec.reason}</p>
                  
                  <div className="text-[11px] text-stone-700 pt-2 space-y-0.5">
                    <div>Sugerido: <strong className="text-stone-900">{rec.suggestedQuantity} unidades</strong></div>
                    <div>Orçamento Estimado: <strong className="text-stone-900">R$ {rec.estimatedBudget?.toFixed(2)}</strong></div>
                    <div>Fornecedor Homologado: <span className="text-stone-600">{rec.supplier}</span></div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => createPurchaseFromRecommendation(rec)}
                    className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition min-h-[36px]"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Gerar Pedido de Compra com 1 Clique</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-[#e7dfd1]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por código, nome da peça, fornecedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-stone-500">Categoria:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-[#faf7f2] border border-[#d6cab8] rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32]"
          >
            <option value="todas">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-[#e7dfd1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f2] text-stone-600 uppercase font-semibold text-[10px] tracking-wider border-b border-[#e7dfd1]">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Descrição da Peça</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Localização</th>
                <th className="p-3 text-center">Saldo Atual</th>
                <th className="p-3 text-center">Mín / Máx</th>
                <th className="p-3">Preço Unit.</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7dfd1]">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-[#faf7f2] transition text-stone-900">
                  <td className="p-3 font-mono font-bold text-[#c85a32]">
                    {item.code}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-stone-900 block">{item.name}</span>
                    <span className="text-[10px] text-stone-500">{item.supplier}</span>
                  </td>
                  <td className="p-3 text-stone-700">
                    {item.category}
                  </td>
                  <td className="p-3 text-stone-500 font-mono text-[11px]">
                    {item.locationShelf}
                  </td>
                  <td className="p-3 text-center font-bold text-sm">
                    <span className={
                      item.status === 'critico' ? 'text-rose-600 font-extrabold' :
                      item.status === 'alerta_baixo' ? 'text-amber-600 font-bold' :
                      'text-emerald-700'
                    }>
                      {item.currentStock} {item.unit}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono text-stone-500 text-[11px]">
                    {item.minimumStock} / {item.maximumStock}
                  </td>
                  <td className="p-3 font-medium text-stone-700">
                    R$ {item.sellPrice.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      item.status === 'critico' ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse' :
                      item.status === 'alerta_baixo' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {item.status === 'critico' ? 'Crítico' : item.status === 'alerta_baixo' ? 'Abaixo Mínimo' : 'Normal'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenAdjust(item)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-700 hover:text-stone-900 text-[11px] border border-[#d6cab8] transition min-h-[30px]"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Ajustar Saldo</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST STOCK MODAL */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e7dfd1] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-stone-900">
            <h3 className="text-sm font-bold text-stone-900 flex items-center">
              <Boxes className="w-4 h-4 mr-2 text-[#c85a32]" />
              Ajustar Saldo de Estoque
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              {adjustItem.name} ({adjustItem.code})
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Novo Saldo em Estoque ({adjustItem.unit}):
              </label>
              <input
                type="number"
                min={0}
                value={newStockCount}
                onChange={e => setNewStockCount(Number(e.target.value))}
                className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg p-2 text-xs text-stone-900"
              />
              <span className="text-[10px] text-stone-500 mt-1 block font-medium">
                Mínimo recomendado: {adjustItem.minimumStock} {adjustItem.unit}
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setAdjustItem(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAdjust}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#c85a32] hover:bg-[#b84924] text-white shadow-xs"
              >
                Salvar Saldo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
