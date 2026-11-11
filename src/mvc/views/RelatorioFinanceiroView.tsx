import React, { useMemo, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { useControllers } from '../container/DIContainer';
import { MensalidadeModel } from '../models/MensalidadeModel';
import { ModoFiltroRelatorio } from '../models/types';

interface RelatorioFinanceiroViewProps {
  refreshVersion: number;
  onVerFichaAluno: (alunoId: number) => void;
}

export const RelatorioFinanceiroView: React.FC<RelatorioFinanceiroViewProps> = ({
  refreshVersion,
  onVerFichaAluno,
}) => {
  const { relatorioController } = useControllers();

  // Padrão 'todos' ou seleção por mês/ano (fiel a `relatorio_financeiro.php`)
  const [modo, setModo] = useState<ModoFiltroRelatorio>('ano');
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [ano, setAno] = useState(() => new Date().getFullYear().toString());

  const relatorio = useMemo(() => {
    return relatorioController.consultarRelatorio({ modo, mes, ano });
  }, [relatorioController, modo, mes, ano, refreshVersion]);

  const exportarCSV = () => {
    const cabecalho = ['ID', 'Aluno', 'Turma', 'Descricao', 'Valor', 'Vencimento', 'Status', 'Pago Em'];
    const linhas = relatorio.detalhamento.map((m) => [
      m.id,
      `"${m.aluno_nome.replace(/"/g, '""')}"`,
      `"${(m.aluno_turma || '').replace(/"/g, '""')}"`,
      `"${(m.descricao || '').replace(/"/g, '""')}"`,
      m.valor.toFixed(2),
      m.vencimento,
      m.status_real,
      m.data_pag || '',
    ]);

    const csv = [cabecalho.join(','), ...linhas.map((l) => l.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${modo}-${modo === 'mes' ? mes : ano}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtro do Período */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { valor: 'mes', label: 'Por Mês' },
                { valor: 'ano', label: 'Por Ano' },
                { valor: 'todos', label: 'Todo o Histórico' },
              ] as const
            ).map((item) => (
              <button
                key={item.valor}
                type="button"
                onClick={() => setModo(item.valor)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  modo === item.valor
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {modo === 'mes' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Competência:</label>
              <input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono bg-white"
              />
            </div>
          )}

          {modo === 'ano' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Ano Letivo:</label>
              <select
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono bg-white"
              >
                {relatorio.anosDisponiveis.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={exportarCSV}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* 4 Indicadores do Período (`relatorio_financeiro.php`) */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-1">Total do Período</div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(relatorio.totalPeriodo)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-1">Recebido (Pago)</div>
            <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(relatorio.totalRecebido)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-1">Pendente a Vencer</div>
            <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(relatorio.totalPendente)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-1">Vencido em Atraso</div>
            <div className="text-xl font-bold text-red-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(relatorio.totalAtrasado)}
            </div>
          </div>
        </div>
      </section>

      {/* Tabela Resumo por Aluno com barra de progresso % Pago */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-display">
              Resumo Consolidado por Aluno
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adimplência individual e distribuição de valores no período filtrado
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {relatorio.porAluno.length} aluno(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Aluno</th>
                <th className="py-3 px-4 text-right">Pago</th>
                <th className="py-3 px-4 text-right">Pendente</th>
                <th className="py-3 px-4 text-right">Atrasado</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 w-56">% Quitado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {relatorio.porAluno.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhuma movimentação financeira para este período.
                  </td>
                </tr>
              ) : (
                relatorio.porAluno.map((item) => (
                  <tr key={item.aluno_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onVerFichaAluno(item.aluno_id)}
                        className="font-semibold text-slate-900 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{item.aluno_nome}</span>
                        <Eye className="w-3 h-3 text-slate-400" />
                      </button>
                      <span aria-hidden="true" className="mx-1.5 text-slate-300">·</span>
                      <span className="font-mono text-slate-500">{item.turma}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      {MensalidadeModel.formatarMoeda(item.pago)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700">
                      {MensalidadeModel.formatarMoeda(item.pendente)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-red-700">
                      {MensalidadeModel.formatarMoeda(item.atrasado)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {MensalidadeModel.formatarMoeda(item.total)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${item.percentualPago}%` }}
                            className="h-full bg-emerald-600 rounded-full"
                          />
                        </div>
                        <span className="w-10 text-right font-mono tabular-nums text-slate-700 font-medium">
                          {item.percentualPago}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tabela de Detalhamento */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-display">
              Detalhamento de Lançamentos do Período
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Listagem analítica de todas as mensalidades filtradas
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {relatorio.detalhamento.length} lançamento(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Aluno</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4">Pago em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {relatorio.detalhamento.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                relatorio.detalhamento.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{m.aluno_nome}</td>
                    <td className="py-3 px-4 text-slate-600">{m.descricao}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {MensalidadeModel.formatarMoeda(m.valor)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {MensalidadeModel.formatarData(m.vencimento)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          m.status_real === 'pago'
                            ? 'text-emerald-700'
                            : m.status_real === 'atrasado'
                            ? 'text-red-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {MensalidadeModel.labelStatus(m.status_real)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      {m.data_pag ? MensalidadeModel.formatarData(m.data_pag) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
