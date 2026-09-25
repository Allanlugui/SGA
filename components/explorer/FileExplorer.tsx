'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AttachedFile } from '@/types';
import { 
  FolderArchive, 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Camera, 
  Tag, 
  X,
  ExternalLink
} from 'lucide-react';

export function FileExplorer() {
  const { allAttachedFiles, workOrders, tickets } = useApp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [selectedFolder, setSelectedFolder] = useState<string>('todos');
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);

  // Group files by OS / Ticket / General
  const folders = [
    { id: 'todos', label: 'Todos os Arquivos', count: allAttachedFiles.length },
    ...workOrders.map(os => ({
      id: os.id,
      label: `${os.osNumber} (${os.equipmentName})`,
      count: os.files.length
    })),
    ...tickets.map(t => ({
      id: t.id,
      label: `${t.ticketNumber} (${t.title.slice(0, 25)}...)`,
      count: t.files.length
    }))
  ];

  const filteredFiles = allAttachedFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase()) ||
                          (file.description && file.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = filterCategory === 'todos' || file.category === filterCategory;

    const matchesFolder = selectedFolder === 'todos' || 
                          file.osId === selectedFolder || 
                          file.ticketId === selectedFolder;

    return matchesSearch && matchesCategory && matchesFolder;
  });

  const handleDownloadFile = (file: AttachedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <FolderArchive className="w-5 h-5 mr-2 text-blue-400" />
            Explorador de Arquivos & Central de Evidências Fotográficas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Repositório centralizado de imagens de campo (Antes/Depois), relatórios técnicos, manuais e notas fiscais
          </p>
        </div>

        <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          Total: <strong>{allAttachedFiles.length} arquivos catalogados</strong>
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do arquivo ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Classificação:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="todos">Todas as Tags</option>
            <option value="antes">Fotos Antes da Manutenção</option>
            <option value="durante">Fotos Durante a Execução</option>
            <option value="depois">Fotos Depois / Concluído</option>
            <option value="manual">Manuais e Documentos</option>
            <option value="geral">Geral</option>
          </select>
        </div>
      </div>

      {/* Two columns layout: Folders Sidebar vs File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Folders List */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
            <Folder className="w-4 h-4 mr-1.5 text-amber-400" />
            Pastas de OS & Tickets
          </h2>

          <div className="space-y-1">
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFolder(f.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition ${
                  selectedFolder === f.id
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="truncate mr-2 flex items-center space-x-2">
                  <Folder className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span className="truncate">{f.label}</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-300">
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Files Grid */}
        <div className="md:col-span-3">
          {filteredFiles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center text-slate-500 text-xs">
              Nenhum arquivo encontrado para a pasta ou filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  className="bg-slate-900 hover:bg-slate-850 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-2 shadow-md group"
                >
                  <div className="relative bg-slate-950 rounded-lg overflow-hidden h-36 flex items-center justify-center border border-slate-800">
                    {file.type === 'image' ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-blue-400 mb-1" />
                        <span className="text-[10px] uppercase font-mono">{file.type}</span>
                      </div>
                    )}

                    {/* Tag badge */}
                    <span className={`absolute top-2 left-2 text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow ${
                      file.category === 'antes' ? 'bg-amber-950/90 text-amber-300 border border-amber-800' :
                      file.category === 'depois' ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800' :
                      'bg-blue-950/90 text-blue-300 border border-blue-800'
                    }`}>
                      {file.category || 'Geral'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {file.description || `Enviado por ${file.uploadedBy}`}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
                      <span>{file.size}</span>
                      <span>{file.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition"
                      title="Baixar Arquivo"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* FILE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white truncate">{previewFile.name}</span>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black rounded-xl overflow-hidden max-h-[60vh] flex items-center justify-center border border-slate-800">
              {previewFile.type === 'image' ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-[60vh] w-auto object-contain" />
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-blue-400" />
                  <p className="text-xs">Documento técnico formatado para leitura direta.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Categoria de Evidência:</span>
                <strong className="text-white uppercase">{previewFile.category || 'Geral'}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Enviado por:</span>
                <span className="text-slate-200">{previewFile.uploadedBy}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Data / Hora do Upload:</span>
                <span className="text-slate-200 font-mono">{previewFile.uploadedAt}</span>
              </div>
              {previewFile.description && (
                <div className="text-slate-300 pt-1 border-t border-slate-800">
                  Nota Técnica: {previewFile.description}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => handleDownloadFile(previewFile)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Evidência</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
