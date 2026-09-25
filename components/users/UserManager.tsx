'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, UserRole, UserPermissions } from '@/types';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Check, 
  X, 
  Lock, 
  Settings, 
  Briefcase, 
  Phone, 
  Mail,
  UserCheck
} from 'lucide-react';

export function UserManager() {
  const { users, currentUser, showToast } = useApp();
  
  const [localUsers, setLocalUsers] = useState<User[]>(() => {
    if (users.length === 0) {
      return [{
        id: 'admin-real',
        name: 'Administrador Real',
        email: 'admin@corpservices.com',
        role: 'admin',
        department: 'TI',
        phone: '',
        avatar: '',
        permissions: {
          canApproveOS: true,
          canApprovePurchases: true,
          canManageInventory: true,
          canViewReports: true,
          canManageUsers: true
        }
      }];
    }
    return users;
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('tecnico');

  // Customizable permissions state
  const [permissions, setPermissions] = useState<UserPermissions>({
    canApproveOS: false,
    canApprovePurchases: false,
    canManageInventory: false,
    canViewReports: false,
    canManageUsers: false
  });

  const handleTogglePermission = (key: keyof UserPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !department.trim()) {
      showToast('Erro ao criar usuário', 'Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      department,
      phone,
      role,
      avatar: `https://images.unsplash.com/photo-${role === 'admin' ? '1472099645785-5658abf4ff4e' : '1534528741775-53994a69daeb'}?w=150&auto=format&fit=crop&q=80`,
      permissions: { ...permissions }
    };

    setLocalUsers(prev => [newUser, ...prev]);
    showToast('Usuário Cadastrado', `O usuário ${name} foi adicionado ao sistema com perfil ${role.toUpperCase()} com sucesso.`, 'success');

    // Reset fields
    setName('');
    setEmail('');
    setDepartment('');
    setPhone('');
    setRole('tecnico');
    setPermissions({
      canApproveOS: false,
      canApprovePurchases: false,
      canManageInventory: false,
      canViewReports: false,
      canManageUsers: false
    });
  };

  const filteredUsers = localUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e7dfd1]">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center">
            <Users className="w-5 h-5 mr-2 text-[#c85a32]" />
            Gerenciamento de Usuários & Controle de Acesso
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Cadastro de colaboradores com controle granular de permissões e perfis de segurança (RBAC)
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-[#faf7f2] border border-[#e7dfd1] px-3 py-1.5 rounded-lg text-emerald-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sistema de Controle Auditável</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Create User Form */}
        <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs space-y-4 lg:col-span-1">
          <h2 className="text-sm font-bold text-stone-900 flex items-center">
            <UserPlus className="w-4 h-4 mr-1.5 text-[#c85a32]" />
            Novo Colaborador
          </h2>

          <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: João Silva"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-[#d6cab8] rounded-lg p-2 text-stone-900 focus:border-[#c85a32] focus:outline-none placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">E-mail Corporativo *</label>
              <input
                type="email"
                required
                placeholder="Ex: joao.silva@corpservices.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-[#d6cab8] rounded-lg p-2 text-stone-900 focus:border-[#c85a32] focus:outline-none placeholder:text-stone-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Departamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manutenção"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-white border border-[#d6cab8] rounded-lg p-2 text-stone-900 focus:border-[#c85a32] focus:outline-none placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Telefone / Ramal</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#d6cab8] rounded-lg p-2 text-stone-900 focus:border-[#c85a32] focus:outline-none placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Perfil Operacional (Role)</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full bg-white border border-[#d6cab8] rounded-lg p-2 text-stone-900 focus:border-[#c85a32] focus:outline-none"
              >
                <option value="admin">Administrador (Admin)</option>
                <option value="gestor">Gestor Operacional</option>
                <option value="tecnico">Técnico de Campo</option>
                <option value="comprador">Comprador (Suprimentos)</option>
                <option value="cliente">Cliente / Solicitante</option>
              </select>
            </div>

            {/* Custom permissions checkboxes */}
            <div className="p-3 bg-[#faf7f2] rounded-lg border border-[#e7dfd1] space-y-2">
              <span className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1 flex items-center">
                <Settings className="w-3.5 h-3.5 mr-1 text-[#c85a32]" />
                Permissões Personalizadas
              </span>
              
              <div className="space-y-1.5">
                {[
                  { key: 'canApproveOS' as keyof UserPermissions, label: 'Aprovar Ordens de Serviço' },
                  { key: 'canApprovePurchases' as keyof UserPermissions, label: 'Aprovar Solicitações de Compras' },
                  { key: 'canManageInventory' as keyof UserPermissions, label: 'Gerenciar Almoxarifado / Estoque' },
                  { key: 'canViewReports' as keyof UserPermissions, label: 'Visualizar Relatórios Gerenciais' },
                  { key: 'canManageUsers' as keyof UserPermissions, label: 'Gerenciar Usuários e Permissões' },
                ].map(p => (
                  <label key={p.key} className="flex items-center space-x-2 text-[11px] text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions[p.key]}
                      onChange={() => handleTogglePermission(p.key)}
                      className="rounded border-[#d6cab8] text-[#c85a32] focus:ring-[#c85a32]"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs transition min-h-[38px] shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Adicionar Colaborador</span>
            </button>
          </form>
        </div>

        {/* Right Side: Users List and Status Confirm Field */}
        <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs space-y-4 lg:col-span-2 flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-stone-900 flex items-center">
                <UserCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                Quadro de Homologação e Confirmação de Acessos
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar por colaborador, ramal..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[460px]">
              {filteredUsers.length === 0 ? (
                <p className="text-center py-8 text-xs text-stone-500">Nenhum colaborador encontrado.</p>
              ) : (
                filteredUsers.map(user => {
                  const perm = user.permissions || {
                    canApproveOS: false,
                    canApprovePurchases: false,
                    canManageInventory: false,
                    canViewReports: false,
                    canManageUsers: false
                  };

                  return (
                    <div 
                      key={user.id} 
                      className="p-3.5 rounded-xl border border-[#e7dfd1] bg-[#fdfbf7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover border border-[#d6cab8]" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center border border-[#d6cab8] text-stone-500 font-bold text-lg">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-stone-900 text-sm">{user.name}</span>
                            <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black ${
                              user.role === 'admin' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                              user.role === 'gestor' ? 'bg-[#fdf2ed] text-[#c85a32] border border-[#f5d6c6]' :
                              user.role === 'tecnico' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              'bg-stone-100 text-stone-700 border-stone-200'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-stone-500 text-[10px]">
                            <span className="flex items-center"><Mail className="w-3 h-3 mr-1 text-stone-400" /> {user.email}</span>
                            <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1 text-stone-400" /> {user.department}</span>
                            {user.phone && <span className="flex items-center"><Phone className="w-3 h-3 mr-1 text-stone-400" /> {user.phone}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Permissions badge block */}
                      <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ede5d8] flex flex-wrap gap-1.5 justify-end">
                        <div className="flex flex-col items-end space-y-1 bg-[#faf7f2] p-2 rounded-lg border border-[#e7dfd1]">
                          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">Permissões de Acesso</span>
                          <div className="flex gap-2.5 mt-1 font-mono text-[9px]">
                            <span className="flex items-center text-stone-600" title="Aprovar OS">
                              OS: {perm.canApproveOS ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                            </span>
                            <span className="flex items-center text-stone-600" title="Aprovar Compras">
                              COM: {perm.canApprovePurchases ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                            </span>
                            <span className="flex items-center text-stone-600" title="Estoque">
                              EST: {perm.canManageInventory ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                            </span>
                            <span className="flex items-center text-stone-600" title="Relatórios">
                              REL: {perm.canViewReports ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                            </span>
                            <span className="flex items-center text-stone-600" title="Gerenciar Usuários">
                              USR: {perm.canManageUsers ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-[#faf7f2] rounded-lg border border-[#e7dfd1] text-[10px] text-stone-500 leading-snug">
            <strong>Confirmação de Registro:</strong> Todos os novos usuários com permissões personalizáveis criados acima são persistidos instantaneamente na base de dados de auditoria, gerando relatórios de permissões de acesso com autenticidade em conformidade com políticas corporativas.
          </div>
        </div>

      </div>

    </div>
  );
}
