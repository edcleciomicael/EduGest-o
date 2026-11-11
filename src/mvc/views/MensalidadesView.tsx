import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { useControllers } from '../container/DIContainer';
import { MensalidadeModel } from '../models/MensalidadeModel';
import {
  MensalidadeComStatus,
  StatusMensalidadeArmazenado,
  StatusMensalidadeReal,
} from '../models/types';

interface MensalidadesViewProps {
  refreshVersion: number;
  preselectedAlunoId: number | null;
  onClearPreselectedAluno: () => void;
  onTriggerRefresh: () => void;
  onNotify: (mensagem: string, tipo?: 'sucesso' | 'erro') => void;
}

const ITENS_POR_PAGINA = 10;

export const MensalidadesView: React.FC<MensalidadesViewProps> = ({
  refreshVersion,
  preselectedAlunoId,
  onClearPreselectedAluno,
  onTriggerRefresh,
  onNotify,
}) => {
  const { mensalidadeController, alunoController } = useControllers();

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusMensalidadeReal | ''>('');
  const [pagina, setPagina] = useState(1);

  // Modal de criação/edição (`mensalidade_form.php`)
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<MensalidadeComStatus | null>(null);
  const [erroForm, setErroForm] = useState('');

  const [alunoId, setAlunoId] = useState<number>(0);
  const [descricao, setDescricao] = useState('Mensalidade');
  const [valor, setValor] = useState('250.00');
  const [vencimento, setVencimento] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusForm, setStatusForm] = useState<StatusMensalidadeArmazenado>('pendente');
  const [parcelas, setParcelas] = useState(1);

  // Modal de confirmação de exclusão
  const [paraExcluir, setParaExcluir] = useState<MensalidadeComStatus | null>(null);

  const todosAlunos = useMemo(() => {
    return alunoController.listarAlunos();
  }, [alunoController, refreshVersion]);

  const dadosMensalidades = useMemo(() => {
    return mensalidadeController.listarMensalidades(busca, statusFiltro);
  }, [mensalidadeController, busca, statusFiltro, refreshVersion]);

  const totalPaginas = Math.max(1, Math.ceil(dadosMensalidades.itens.length / ITENS_POR_PAGINA));

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro]);

  // Se veio da Ficha do Aluno clicando em "+ Nova Mensalidade", abre o modal automaticamente
  useEffect(() => {
    if (preselectedAlunoId && preselectedAlunoId > 0) {
      setEditando(null);
      setErroForm('');
      setAlunoId(preselectedAlunoId);
      setDescricao('Mensalidade');
      setValor('250.00');
      setVencimento(new Date().toISOString().slice(0, 10));
      setStatusForm('pendente');
      setParcelas(1);
      setModalAberto(true);
      onClearPreselectedAluno();
    }
  }, [preselectedAlunoId, onClearPreselectedAluno]);

  const itensPaginados = useMemo(() => {
    const inicio = (pagina - 1) * ITENS_POR_PAGINA;
    return dadosMensalidades.itens.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [dadosMensalidades.itens, pagina]);

  const abrirModalNova = () => {
    setEditando(null);
    setErroForm('');
    setAlunoId(todosAlunos[0]?.id || 0);
    setDescricao('Mensalidade');
    setValor('250.00');
    setVencimento(new Date().toISOString().slice(0, 10));
    setStatusForm('pendente');
    setParcelas(1);
    setModalAberto(true);
  };

  const abrirModalEditar = (m: MensalidadeComStatus) => {
    setEditando(m);
    setErroForm('');
    setAlunoId(m.aluno_id);
    setDescricao(m.descricao || 'Mensalidade');
    setValor(String(m.valor));
    setVencimento(m.vencimento);
    setStatusForm(m.status);
    setParcelas(1);
    setModalAberto(true);
  };

  const salvarMensalidade = (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm('');

    const valorNum = parseFloat(String(valor).replace(',', '.'));

    if (editando) {
      const res = mensalidadeController.editarMensalidade(editando.id, {
        aluno_id: Number(alunoId),
        descricao,
        valor: valorNum,
        vencimento,
        status: statusForm,
      });
      if (!res.sucesso) {
        setErroForm(res.erro || 'Erro ao editar mensalidade.');
        return;
      }
      setModalAberto(false);
      onTriggerRefresh();
      onNotify('Mensalidade atualizada com sucesso.');
    } else {
      const res = mensalidadeController.lancarMensalidade({
        aluno_id: Number(alunoId),
        descricao,
        valor: valorNum,
        vencimento,
        status: statusForm,
        parcelas: Number(parcelas),
      });
      if (!res.sucesso) {
        setErroForm(res.erro || 'Erro ao gerar mensalidade.');
        return;
      }
      setModalAberto(false);
      onTriggerRefresh();
      onNotify(
        res.quantidade && res.quantidade > 1
          ? `${res.quantidade} parcelas mensais geradas com sucesso.`
          : 'Mensalidade lançada com sucesso.'
      );
    }
  };

  const handlePagar = (id: number) => {
    const res = mensalidadeController.baixarPagamento(id);
    if (res.sucesso) {
      onTriggerRefresh();
      onNotify('Pagamento confirmado e baixado na data de hoje.');
    }
  };

  const confirmarExclusao = () => {
    if (!paraExcluir) return;
    const ok = mensalidadeController.excluirMensalidade(paraExcluir.id);
    if (ok) {
      onTriggerRefresh();
      onNotify('Mensalidade excluída do sistema.');
    }
    setParaExcluir(null);
  };

  return (
    <div className="space-y-5">
      {/* Resumo Financeiro Global de Mensalidades */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-1">Total Recebido (Pago)</div>
            <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(dadosMensalidades.totalPago)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-1">Total Pendente</div>
            <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(dadosMensalidades.totalPendente)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 mb-1">Total Atrasado</div>
            <div className="text-xl font-bold text-red-700 font-mono tabular-nums">
              {MensalidadeModel.formatarMoeda(dadosMensalidades.totalAtrasado)}
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Filtro e Botão Nova Mensalidade */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por aluno ou descrição..."
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

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            {(
              [
                { valor: '', label: 'Todas' },
                { valor: 'pago', label: 'Pagas' },
                { valor: 'pendente', label: 'Pendentes' },
                { valor: 'atrasado', label: 'Atrasadas' },
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
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Exibindo {itensPaginados.length} de {dadosMensalidades.itens.length}
          </span>
          <button
            type="button"
            onClick={abrirModalNova}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Mensalidade</span>
          </button>
        </div>
      </div>

      {/* Tabela de Mensalidades */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
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
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {itensPaginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Nenhuma mensalidade encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                itensPaginados.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{m.aluno_nome}</td>
                    <td className="py-3 px-4 text-slate-600">{m.descricao || 'Mensalidade'}</td>
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
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {m.status_real !== 'pago' && (
                          <button
                            type="button"
                            onClick={() => handlePagar(m.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pagar</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(m)}
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

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono tabular-nums">
              Página {pagina} de {totalPaginas}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPagina(num)}
                  className={`px-2.5 py-1 rounded-md font-mono text-xs cursor-pointer ${
                    num === pagina
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Modal de Criação / Edição de Mensalidade (`mensalidade_form.php`) */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editando ? `Editar Mensalidade · #${editando.id}` : 'Lançar Nova Mensalidade'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editando
                    ? 'Altere valor, vencimento ou status do lançamento'
                    : 'Gere uma cobrança avulsa ou carnê de múltiplas parcelas'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={salvarMensalidade} className="p-6 space-y-4">
              {erroForm && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                  {erroForm}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aluno Vinculado *
                </label>
                <select
                  required
                  value={alunoId}
                  onChange={(e) => setAlunoId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value={0}>Selecione o aluno</option>
                  {todosAlunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} {a.turma ? `(${a.turma})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Mensalidade"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="250.00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={statusForm}
                    onChange={(e) => setStatusForm(e.target.value as StatusMensalidadeArmazenado)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              {!editando && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade de Parcelas Mensais Sucessivas
                  </label>
                  <select
                    value={parcelas}
                    onChange={(e) => setParcelas(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                  >
                    {[1, 2, 3, 4, 6, 12].map((qtd) => (
                      <option key={qtd} value={qtd}>
                        {qtd === 1
                          ? '1 parcela (Cobrança única)'
                          : `${qtd} parcelas mensais consecutivas`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  {editando ? 'Salvar Alterações' : 'Gerar Mensalidade'}
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
              Excluir Lançamento Financeiro
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Deseja excluir a mensalidade <strong>{paraExcluir.descricao}</strong> do aluno{' '}
              <strong>{paraExcluir.aluno_nome}</strong> no valor de{' '}
              <strong className="font-mono">
                {MensalidadeModel.formatarMoeda(paraExcluir.valor)}
              </strong>
              ?
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
                Excluir Mensalidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
