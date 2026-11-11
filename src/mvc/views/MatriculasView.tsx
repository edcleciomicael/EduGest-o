import React, { useMemo, useState } from 'react';
import { Edit3, Eye, Search, Trash2, X } from 'lucide-react';
import { useControllers } from '../container/DIContainer';
import { MatriculaModel } from '../models/MatriculaModel';
import { MensalidadeModel } from '../models/MensalidadeModel';
import {
  MatriculaComAluno,
  SERIES_ESCOLARES,
  SerieEscolar,
  StatusMatricula,
  TURNOS_ESCOLARES,
  TurnoEscolar,
} from '../models/types';

interface MatriculasViewProps {
  refreshVersion: number;
  onTriggerRefresh: () => void;
  onNotify: (mensagem: string, tipo?: 'sucesso' | 'erro') => void;
  onVerFichaAluno: (alunoId: number) => void;
}

export const MatriculasView: React.FC<MatriculasViewProps> = ({
  refreshVersion,
  onTriggerRefresh,
  onNotify,
  onVerFichaAluno,
}) => {
  const { matriculaController } = useControllers();

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusMatricula | ''>('');

  // Modal de edição (`matricula_edit.php`)
  const [editando, setEditando] = useState<MatriculaComAluno | null>(null);
  const [turma, setTurma] = useState('');
  const [serie, setSerie] = useState<SerieEscolar>('');
  const [turno, setTurno] = useState<TurnoEscolar>('');
  const [dataMat, setDataMat] = useState('');
  const [status, setStatus] = useState<StatusMatricula>('ativo');

  // Modal de exclusão
  const [paraExcluir, setParaExcluir] = useState<MatriculaComAluno | null>(null);

  const listaMatriculas = useMemo(() => {
    return matriculaController.listarMatriculas(busca, statusFiltro);
  }, [matriculaController, busca, statusFiltro, refreshVersion]);

  const abrirEdicao = (m: MatriculaComAluno) => {
    setEditando(m);
    setTurma(m.turma || '');
    setSerie(m.serie || '');
    setTurno(m.turno || '');
    setDataMat(m.data || '');
    setStatus(m.status || 'ativo');
  };

  const salvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;

    const res = matriculaController.atualizarMatricula(editando.id, {
      turma,
      serie,
      turno,
      data: dataMat,
      status,
    });

    if (res.sucesso) {
      setEditando(null);
      onTriggerRefresh();
      onNotify(`Matrícula ${editando.numero} atualizada com sucesso.`);
    } else {
      onNotify(res.erro || 'Erro ao atualizar matrícula.', 'erro');
    }
  };

  const confirmarExclusao = () => {
    if (!paraExcluir) return;
    const ok = matriculaController.excluirMatricula(paraExcluir.id);
    if (ok) {
      onTriggerRefresh();
      onNotify(`Matrícula ${paraExcluir.numero} excluída.`);
    }
    setParaExcluir(null);
  };

  return (
    <div className="space-y-5">
      {/* Controles de Busca e Filtro Segmentado */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por aluno, nº de matrícula ou turma..."
            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { valor: '', label: 'Todas' },
                { valor: 'ativo', label: 'Ativas' },
                { valor: 'inativo', label: 'Inativas' },
                { valor: 'cancelado', label: 'Canceladas' },
              ] as const
            ).map((op) => (
              <button
                key={op.label}
                type="button"
                onClick={() => setStatusFiltro(op.valor)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  statusFiltro === op.valor
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {listaMatriculas.length} matrícula(s)
          </span>
        </div>
      </div>

      {/* Tabela de Matrículas */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Nº Matrícula</th>
                <th className="py-3 px-4">Aluno</th>
                <th className="py-3 px-4">Turma</th>
                <th className="py-3 px-4">Série</th>
                <th className="py-3 px-4">Turno</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {listaMatriculas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Nenhuma matrícula encontrada.
                  </td>
                </tr>
              ) : (
                listaMatriculas.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900">
                      {m.numero}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => onVerFichaAluno(m.aluno_id)}
                        className="hover:underline text-left cursor-pointer"
                      >
                        {m.aluno_nome}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{m.turma || '—'}</td>
                    <td className="py-3 px-4 text-slate-700">{m.serie || '—'}</td>
                    <td className="py-3 px-4 text-slate-700">{m.turno || '—'}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      {MensalidadeModel.formatarData(m.data)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          m.status === 'ativo'
                            ? 'text-emerald-700'
                            : m.status === 'cancelado'
                            ? 'text-red-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {MatriculaModel.labelStatus(m.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onVerFichaAluno(m.aluno_id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Aluno</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEdicao(m)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setParaExcluir(m)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Editar Matrícula (`matricula_edit.php`) */}
      {editando && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Editar Matrícula · {editando.numero}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Aluno: {editando.aluno_nome}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={salvarEdicao} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Turma</label>
                  <input
                    type="text"
                    value={turma}
                    onChange={(e) => setTurma(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Série</label>
                  <select
                    value={serie}
                    onChange={(e) => setSerie(e.target.value as SerieEscolar)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">Selecione</option>
                    {SERIES_ESCOLARES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Turno</label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value as TurnoEscolar)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">Selecione</option>
                    {TURNOS_ESCOLARES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Matrícula
                  </label>
                  <input
                    type="date"
                    value={dataMat}
                    onChange={(e) => setDataMat(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Situação da Matrícula
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusMatricula)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Salvar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {paraExcluir && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Excluir Matrícula {paraExcluir.numero}
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Confirma a exclusão do registro de matrícula de{' '}
              <strong>{paraExcluir.aluno_nome}</strong>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setParaExcluir(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Excluir Matrícula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
