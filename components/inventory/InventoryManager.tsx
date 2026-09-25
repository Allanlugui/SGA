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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <Boxes className="w-5 h-5 mr-2 text-blue-400" />
            Controle de Estoque & Peças de Reposição
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestão de almoxarifado técnico com monitoramento de saldo mínimo e requisições automatizadas por Bot IA
          </p>
        </div>

        {/* AI Inventory Advisor CTA */}
        <button
          onClick={handleConsultAIAdvisor}
          disabled={isConsultingAI}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
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
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            </>
          )}
        </button>
      </div>

      {/* Stock Alerts Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Itens Cadastrados</span>
          <div className="text-2xl font-black text-white mt-1">{inventory.length} itens</div>
          <span className="text-[11px] text-slate-500">Almoxarifado Geral & HVAC</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Estoque Crítico (Risco de Parada)
          </span>
          <div className="text-2xl font-black text-rose-400 mt-1">{criticalItemsCount} itens</div>
          <span className="text-[11px] text-rose-400/80">Abaixo de 50% do mínimo</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Ponto de Pedido (Alerta)</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{warningItemsCount} itens</div>
          <span className="text-[11px] text-slate-400">Próximos da margem de reposição</span>
        </div>
      </div>

      {/* AI Bot Recommendation Box */}
      {aiReport && (
        <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 p-5 rounded-2xl border border-blue-700/60 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  Diagnóstico Estratégico do Bot IA de Compras
                </h3>
                <span className="text-[11px] text-blue-300">
                  {aiReport.alertsCount} insumos críticos identificados com risco operacional
                </span>
              </div>
            </div>

            <button
              onClick={() => setAiReport(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Fechar ✕
            </button>
          </div>

          <p className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed italic">
            &quot;{aiReport.executiveSummary}&quot;
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiReport.recommendations?.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-900/90 p-3.5 rounded-xl border border-blue-900/50 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                      {rec.itemCode}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {rec.priority || 'alta'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{rec.itemName}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{rec.reason}</p>
                  
                  <div className="text-[11px] text-slate-300 pt-2 space-y-0.5">
                    <div>Sugerido: <strong>{rec.suggestedQuantity} unidades</strong></div>
                    <div>Orçamento Estimado: <strong>R$ {rec.estimatedBudget?.toFixed(2)}</strong></div>
                    <div>Fornecedor Homologado: <span className="text-slate-400">{rec.supplier}</span></div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => createPurchaseFromRecommendation(rec)}
                    className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition"
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
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nome da peça, fornecedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Categoria:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="todas">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-850 transition">
                  <td className="p-3 font-mono font-bold text-blue-400">
                    {item.code}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-white block">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.supplier}</span>
                  </td>
                  <td className="p-3 text-slate-300">
                    {item.category}
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {item.locationShelf}
                  </td>
                  <td className="p-3 text-center font-bold text-sm">
                    <span className={
                      item.status === 'critico' ? 'text-rose-400' :
                      item.status === 'alerta_baixo' ? 'text-amber-400' :
                      'text-emerald-400'
                    }>
                      {item.currentStock} {item.unit}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                    {item.minimumStock} / {item.maximumStock}
                  </td>
                  <td className="p-3 font-medium text-slate-300">
                    R$ {item.sellPrice.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      item.status === 'critico' ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' :
                      item.status === 'alerta_baixo' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {item.status === 'critico' ? 'Crítico' : item.status === 'alerta_baixo' ? 'Abaixo Mínimo' : 'Normal'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenAdjust(item)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700 transition"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Boxes className="w-4 h-4 mr-2 text-blue-400" />
              Ajustar Saldo de Estoque
            </h3>
            <p className="text-xs text-slate-300">
              {adjustItem.name} ({adjustItem.code})
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Novo Saldo em Estoque ({adjustItem.unit}):
              </label>
              <input
                type="number"
                min={0}
                value={newStockCount}
                onChange={e => setNewStockCount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Mínimo recomendado: {adjustItem.minimumStock} {adjustItem.unit}
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setAdjustItem(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAdjust}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
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
