import React, { useMemo } from 'react';
import { ArrowUpRight, CheckCircle2, Eye, Plus, Users, FileCheck2, Wallet } from 'lucide-react';
import { useControllers } from '../container/DIContainer';
import { MensalidadeModel } from '../models/MensalidadeModel';

interface DashboardViewProps {
  refreshVersion: number;
  onNavigate: (rota: 'alunos' | 'matriculas' | 'mensalidades' | 'relatorio', alunoId?: number) => void;
  onQuickPayMensalidade: (id: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  refreshVersion,
  onNavigate,
  onQuickPayMensalidade,
}) => {
  const { dashboardController } = useControllers();

  const dados = useMemo(() => {
    return dashboardController.carregarDashboard();
  }, [dashboardController, refreshVersion]);

  const maiorValorGrafico = useMemo(() => {
    const valores = dados.historicoMensal.flatMap((m) => [m.pago, m.pendente, m.atrasado]);
    return Math.max(...valores, 500);
  }, [dados.historicoMensal]);

  return (
    <div className="space-y-6">
      {/* Grade Principal de Indicadores (KPIs) — Superfície única com divisórias sutis */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Total de Alunos</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {dados.totalAlunos}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Cadastros ativos na base
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Matrículas</span>
              <FileCheck2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {dados.totalMatriculas}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {dados.matriculasAtivas} ativa(s)
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Total Recebido</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(dados.totalPago)}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              Adimplência: {dados.taxaAdimplencia}%
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-2">
              Pendente a Vencer
            </div>
            <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(dados.totalPendente)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Dentro do prazo
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-2">
              Em Atraso
            </div>
            <div className="text-xl font-bold text-red-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(dados.totalAtrasado)}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {dados.mensalidadesAtrasadas.length} parcela(s) vencida(s)
            </div>
          </div>

          <div className="p-5 bg-slate-50/60">
            <div className="text-xs font-medium text-slate-500 mb-2">
              Volume Total Gerado
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(dados.totalValor)}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {dados.totalMensalidades} lançamento(s)
            </div>
          </div>
        </div>
      </section>

      {/* Gráfico Financeiro dos Últimos 6 Meses */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 font-display">
              Evolução Financeira dos Últimos 6 Meses
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativo mensal entre valores recebidos, pendentes e vencidos em atraso
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
              Pago
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
              Pendente
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-red-600 inline-block" />
              Atrasado
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-3 sm:gap-6 pt-4 pb-2 border-b border-slate-200 h-56 items-end">
          {dados.historicoMensal.map((item) => {
            const altPago = Math.round((item.pago / maiorValorGrafico) * 100);
            const altPend = Math.round((item.pendente / maiorValorGrafico) * 100);
            const altAtr = Math.round((item.atrasado / maiorValorGrafico) * 100);

            return (
              <div key={item.mesKey} className="flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-40 px-1">
                  <div
                    style={{ height: `${Math.max(altPago, item.pago > 0 ? 6 : 2)}%` }}
                    title={`Pago (${item.label}): ${MensalidadeModel.formatarMoeda(item.pago)}`}
                    className={`w-full max-w-5 rounded-t transition-opacity ${
                      item.pago > 0 ? 'bg-emerald-600 group-hover:opacity-90' : 'bg-slate-100'
                    }`}
                  />
                  <div
                    style={{ height: `${Math.max(altPend, item.pendente > 0 ? 6 : 2)}%` }}
                    title={`Pendente (${item.label}): ${MensalidadeModel.formatarMoeda(item.pendente)}`}
                    className={`w-full max-w-5 rounded-t transition-opacity ${
                      item.pendente > 0 ? 'bg-amber-500 group-hover:opacity-90' : 'bg-slate-100'
                    }`}
                  />
                  <div
                    style={{ height: `${Math.max(altAtr, item.atrasado > 0 ? 6 : 2)}%` }}
                    title={`Atrasado (${item.label}): ${MensalidadeModel.formatarMoeda(item.atrasado)}`}
                    className={`w-full max-w-5 rounded-t transition-opacity ${
                      item.atrasado > 0 ? 'bg-red-600 group-hover:opacity-90' : 'bg-slate-100'
                    }`}
                  />
                </div>
                <div className="mt-3 text-center">
                  <div className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5 hidden sm:block">
                    {MensalidadeModel.formatarMoeda(item.pago + item.pendente + item.atrasado)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabelas Inferiores em 2 Colunas: Últimos Alunos e Mensalidades Atrasadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Últimos Alunos Cadastrados */}
        <section className="bg-white border border-slate-200 rounded-xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 font-display">
                  Últimos Alunos Cadastrados
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registros acadêmicos mais recentes
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('alunos')}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>Ver todos</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-4">Aluno</th>
                    <th className="py-2.5 px-4">Série · Turma</th>
                    <th className="py-2.5 px-4">Data Matrícula</th>
                    <th className="py-2.5 px-4 text-right">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {dados.ultimosAlunos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Nenhum aluno cadastrado até o momento.
                      </td>
                    </tr>
                  ) : (
                    dados.ultimosAlunos.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {aluno.nome}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span>{aluno.serie || '—'}</span>
                          {aluno.turma && (
                            <>
                              <span aria-hidden="true" className="mx-1.5 text-slate-400">·</span>
                              <span className="font-mono">{aluno.turma}</span>
                            </>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono tabular-nums">
                          {MensalidadeModel.formatarData(aluno.data_matricula)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onNavigate('alunos', aluno.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Abrir</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Exibindo os {dados.ultimosAlunos.length} cadastros mais recentes</span>
            <button
              type="button"
              onClick={() => onNavigate('alunos')}
              className="font-medium text-slate-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Aluno
            </button>
          </div>
        </section>

        {/* Mensalidades Atrasadas */}
        <section className="bg-white border border-slate-200 rounded-xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 font-display">
                  Mensalidades em Atraso
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parcelas com vencimento ultrapassado aguardando baixa
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('mensalidades')}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>Ver todas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-4">Aluno</th>
                    <th className="py-2.5 px-4">Vencimento</th>
                    <th className="py-2.5 px-4 text-right">Valor</th>
                    <th className="py-2.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {dados.mensalidadesAtrasadas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Nenhuma mensalidade em atraso. Todas as obrigações estão em dia.
                      </td>
                    </tr>
                  ) : (
                    dados.mensalidadesAtrasadas.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{m.aluno_nome}</div>
                          <div className="text-[11px] text-slate-500">{m.descricao}</div>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-red-700 font-medium">
                          {MensalidadeModel.formatarData(m.vencimento)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {MensalidadeModel.formatarMoeda(m.valor)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onQuickPayMensalidade(m.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Dar Baixa</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total vencido: <strong className="font-mono text-red-700">{MensalidadeModel.formatarMoeda(dados.totalAtrasado)}</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('relatorio')}
              className="font-medium text-slate-800 hover:underline cursor-pointer"
            >
              Abrir Relatório Financeiro
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
