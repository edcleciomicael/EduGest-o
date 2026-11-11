/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import {
  BarChart3,
  BookOpenCheck,
  Code2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { DIProvider, useControllers } from './mvc/container/DIContainer';
import { UsuarioSessao } from './mvc/models/types';
import { AlunosView } from './mvc/views/AlunosView';
import { ArquiteturaMvcView } from './mvc/views/ArquiteturaMvcView';
import { DashboardView } from './mvc/views/DashboardView';
import { LoginView } from './mvc/views/LoginView';
import { MatriculasView } from './mvc/views/MatriculasView';
import { MensalidadesView } from './mvc/views/MensalidadesView';
import { RelatorioFinanceiroView } from './mvc/views/RelatorioFinanceiroView';

type RotaAtiva = 'dashboard' | 'alunos' | 'matriculas' | 'mensalidades' | 'relatorio' | 'arquitetura';

interface NotificacaoToast {
  id: number;
  mensagem: string;
  tipo: 'sucesso' | 'erro';
}

const TITULOS_ROTAS: Record<RotaAtiva, { breadcrumb: string; titulo: string }> = {
  dashboard: { breadcrumb: 'EduGestão / Visão Geral', titulo: 'Dashboard Acadêmico e Financeiro' },
  alunos: { breadcrumb: 'EduGestão / Secretaria', titulo: 'Gestão de Alunos' },
  matriculas: { breadcrumb: 'EduGestão / Secretaria', titulo: 'Controle de Matrículas' },
  mensalidades: { breadcrumb: 'EduGestão / Tesouraria', titulo: 'Gestão de Mensalidades' },
  relatorio: { breadcrumb: 'EduGestão / Tesouraria', titulo: 'Relatório Financeiro' },
  arquitetura: {
    breadcrumb: 'EduGestão / Engenharia de Software',
    titulo: 'Arquitetura MVC & Injeção de Dependência',
  },
};

function SistemaEscolarShell() {
  const { authController, mensalidadeController } = useControllers();

  const [sessao, setSessao] = useState<UsuarioSessao>(() => authController.obterSessao());
  const [rota, setRota] = useState<RotaAtiva>('dashboard');
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null);
  const [preselectedAlunoParaMensalidade, setPreselectedAlunoParaMensalidade] = useState<
    number | null
  >(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [toast, setToast] = useState<NotificacaoToast | null>(null);

  const triggerRefresh = useCallback(() => {
    setRefreshVersion((v) => v + 1);
  }, []);

  const mostrarNotificacao = useCallback(
    (mensagem: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
      const id = Date.now();
      setToast({ id, mensagem, tipo });
      setTimeout(() => {
        setToast((atual) => (atual?.id === id ? null : atual));
      }, 3500);
    },
    []
  );

  const navegarPara = useCallback((novaRota: RotaAtiva, alunoId: number | null = null) => {
    setRota(novaRota);
    setSelectedAlunoId(alunoId);
    setMenuMobileAberto(false);
  }, []);

  const handleQuickPayDashboard = useCallback(
    (mensalidadeId: number) => {
      const res = mensalidadeController.baixarPagamento(mensalidadeId);
      if (res.sucesso) {
        triggerRefresh();
        mostrarNotificacao('Pagamento de mensalidade registrado com sucesso.');
      }
    },
    [mensalidadeController, triggerRefresh, mostrarNotificacao]
  );

  const handleAbrirNovaMensalidadeDoAluno = useCallback((alunoId: number) => {
    setPreselectedAlunoParaMensalidade(alunoId);
    setRota('mensalidades');
  }, []);

  const handleLogout = () => {
    const deslogado = authController.logout();
    setSessao(deslogado);
  };

  if (!sessao.logado) {
    return <LoginView onLoginSuccess={(novaSessao) => setSessao(novaSessao)} />;
  }

  const itensMenu: Array<{ id: RotaAtiva; label: string; icon: React.ReactNode }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'alunos',
      label: 'Alunos',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'matriculas',
      label: 'Matrículas',
      icon: <BookOpenCheck className="w-4 h-4" />,
    },
    {
      id: 'mensalidades',
      label: 'Mensalidades',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'relatorio',
      label: 'Relatório Financeiro',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'arquitetura',
      label: 'Arquitetura MVC & DI',
      icon: <Code2 className="w-4 h-4" />,
    },
  ];

  const metaRota = TITULOS_ROTAS[rota];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Desktop (264px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-100 shrink-0 border-r border-slate-800">
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-white text-slate-900 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white font-display whitespace-nowrap">
            EduGestão
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {itensMenu.map((item) => {
            const ativo = rota === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navegarPara(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  ativo
                    ? 'bg-white text-slate-900 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-2 py-1.5 mb-2">
            <div className="text-xs font-semibold text-white truncate">{sessao.usuario}</div>
            <div className="text-[11px] text-slate-400 truncate font-mono">{sessao.email}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Menu Mobile Gaveta */}
      {menuMobileAberto && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setMenuMobileAberto(false)}
          />
          <aside className="relative w-64 bg-slate-900 text-white flex flex-col z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
              <span className="text-base font-bold font-display">EduGestão</span>
              <button
                type="button"
                onClick={() => setMenuMobileAberto(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {itensMenu.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navegarPara(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium ${
                    rota === item.id ? 'bg-white text-slate-900 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb/Título à esquerda — 1 Ação Contextual à direita */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuMobileAberto(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="truncate">
              <div className="text-[11px] font-medium text-slate-500">{metaRota.breadcrumb}</div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 font-display truncate">
                {metaRota.titulo}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                navegarPara(rota === 'arquitetura' ? 'dashboard' : 'arquitetura')
              }
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {rota === 'arquitetura' ? 'Voltar ao Painel' : 'Inspecionar MVC & DI'}
            </button>
          </div>
        </header>

        {/* Notificação Toast Discreta */}
        {toast && (
          <div className="px-6 pt-4">
            <div
              role="status"
              className={`px-4 py-3 rounded-lg border text-xs font-medium flex items-center justify-between ${
                toast.tipo === 'sucesso'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <span>{toast.mensagem}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="ml-4 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Viewport Principal das Views */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {rota === 'dashboard' && (
            <DashboardView
              refreshVersion={refreshVersion}
              onNavigate={(destino, alunoId) => navegarPara(destino, alunoId ?? null)}
              onQuickPayMensalidade={handleQuickPayDashboard}
            />
          )}

          {rota === 'alunos' && (
            <AlunosView
              refreshVersion={refreshVersion}
              selectedAlunoId={selectedAlunoId}
              onSelectAlunoId={setSelectedAlunoId}
              onTriggerRefresh={triggerRefresh}
              onNotify={mostrarNotificacao}
              onOpenNovaMensalidadeParaAluno={handleAbrirNovaMensalidadeDoAluno}
            />
          )}

          {rota === 'matriculas' && (
            <MatriculasView
              refreshVersion={refreshVersion}
              onTriggerRefresh={triggerRefresh}
              onNotify={mostrarNotificacao}
              onVerFichaAluno={(alunoId) => navegarPara('alunos', alunoId)}
            />
          )}

          {rota === 'mensalidades' && (
            <MensalidadesView
              refreshVersion={refreshVersion}
              preselectedAlunoId={preselectedAlunoParaMensalidade}
              onClearPreselectedAluno={() => setPreselectedAlunoParaMensalidade(null)}
              onTriggerRefresh={triggerRefresh}
              onNotify={mostrarNotificacao}
            />
          )}

          {rota === 'relatorio' && (
            <RelatorioFinanceiroView
              refreshVersion={refreshVersion}
              onVerFichaAluno={(alunoId) => navegarPara('alunos', alunoId)}
            />
          )}

          {rota === 'arquitetura' && (
            <ArquiteturaMvcView
              onTriggerRefresh={triggerRefresh}
              onNotify={mostrarNotificacao}
            />
          )}
        </main>

        <footer className="px-6 py-4 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduGestão — Sistema de Gestão Escolar · Arquitetura MVC &amp; Injeção de Dependência</span>
          <span>Desenvolvido por: EDCLECIO</span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DIProvider>
      <SistemaEscolarShell />
    </DIProvider>
  );
}
