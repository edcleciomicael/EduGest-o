import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { useControllers } from '../container/DIContainer';
import { AlunoModel } from '../models/AlunoModel';
import { MatriculaModel } from '../models/MatriculaModel';
import { MensalidadeModel } from '../models/MensalidadeModel';
import {
  AlunoProps,
  CreateAlunoDTO,
  SERIES_ESCOLARES,
  SEXOS_ALUNO,
  SerieEscolar,
  SexoAluno,
  TURNOS_ESCOLARES,
  TurnoEscolar,
} from '../models/types';

interface AlunosViewProps {
  refreshVersion: number;
  selectedAlunoId: number | null;
  onSelectAlunoId: (id: number | null) => void;
  onTriggerRefresh: () => void;
  onNotify: (mensagem: string, tipo?: 'sucesso' | 'erro') => void;
  onOpenNovaMensalidadeParaAluno: (alunoId: number) => void;
}

const ITENS_POR_PAGINA = 10;

export const AlunosView: React.FC<AlunosViewProps> = ({
  refreshVersion,
  selectedAlunoId,
  onSelectAlunoId,
  onTriggerRefresh,
  onNotify,
  onOpenNovaMensalidadeParaAluno,
}) => {
  const { alunoController, mensalidadeController } = useControllers();

  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);

  // Modal de Cadastro/Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoAluno, setEditandoAluno] = useState<AlunoProps | null>(null);
  const [erroForm, setErroForm] = useState('');

  // Campos do formulário (fiel a aluno_form.php)
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [sexo, setSexo] = useState<SexoAluno>('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telResp, setTelResp] = useState('');
  const [turma, setTurma] = useState('');
  const [serie, setSerie] = useState<SerieEscolar>('');
  const [turno, setTurno] = useState<TurnoEscolar>('');
  const [dataMatricula, setDataMatricula] = useState(() => new Date().toISOString().slice(0, 10));
  const [gerarMensalidadeInicial, setGerarMensalidadeInicial] = useState(true);
  const [valorMensalidadeInicial, setValorMensalidadeInicial] = useState('350.00');

  // Modal de Confirmação de Exclusão
  const [alunoParaExcluir, setAlunoParaExcluir] = useState<AlunoProps | null>(null);

  const listaAlunos = useMemo(() => {
    return alunoController.listarAlunos(busca);
  }, [alunoController, busca, refreshVersion]);

  const totalPaginas = Math.max(1, Math.ceil(listaAlunos.length / ITENS_POR_PAGINA));

  useEffect(() => {
    setPagina(1);
  }, [busca]);

  const alunosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * ITENS_POR_PAGINA;
    return listaAlunos.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [listaAlunos, pagina]);

  const fichaSelecionada = useMemo(() => {
    if (!selectedAlunoId) return null;
    return alunoController.carregarFichaCompleta(selectedAlunoId);
  }, [alunoController, selectedAlunoId, refreshVersion]);

  const abrirModalNovo = () => {
    setEditandoAluno(null);
    setErroForm('');
    setNome('');
    setCpf('');
    setDataNasc('');
    setSexo('');
    setTelefone('');
    setEmail('');
    setEndereco('');
    setResponsavel('');
    setTelResp('');
    setTurma('');
    setSerie('');
    setTurno('');
    setDataMatricula(new Date().toISOString().slice(0, 10));
    setGerarMensalidadeInicial(true);
    setValorMensalidadeInicial('350.00');
    setModalAberto(true);
  };

  const abrirModalEditar = (aluno: AlunoProps) => {
    setEditandoAluno(aluno);
    setErroForm('');
    setNome(aluno.nome);
    setCpf(AlunoModel.formatarCPF(aluno.cpf) === '—' ? '' : aluno.cpf);
    setDataNasc(aluno.data_nasc || '');
    setSexo(aluno.sexo || '');
    setTelefone(aluno.telefone || '');
    setEmail(aluno.email || '');
    setEndereco(aluno.endereco || '');
    setResponsavel(aluno.responsavel || '');
    setTelResp(aluno.tel_resp || '');
    setTurma(aluno.turma || '');
    setSerie(aluno.serie || '');
    setTurno(aluno.turno || '');
    setDataMatricula(aluno.data_matricula || new Date().toISOString().slice(0, 10));
    setModalAberto(true);
  };

  const salvarFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm('');

    const payload: CreateAlunoDTO = {
      nome,
      cpf,
      data_nasc: dataNasc,
      sexo,
      endereco,
      telefone,
      email,
      responsavel,
      tel_resp: telResp,
      turma,
      serie,
      data_matricula: dataMatricula,
      turno,
      gerar_mensalidade: !editandoAluno && gerarMensalidadeInicial,
      valor_mensalidade_inicial: parseFloat(valorMensalidadeInicial) || 0,
    };

    if (editandoAluno) {
      const res = alunoController.editarAluno(editandoAluno.id, payload);
      if (!res.sucesso) {
        setErroForm(res.erro || 'Erro ao atualizar dados do aluno.');
        return;
      }
      setModalAberto(false);
      onTriggerRefresh();
      onNotify('Dados do aluno e matrícula sincronizados com sucesso.');
    } else {
      const res = alunoController.salvarNovoAluno(payload);
      if (!res.sucesso) {
        setErroForm(res.erro || 'Erro ao cadastrar aluno.');
        return;
      }
      setModalAberto(false);
      onTriggerRefresh();
      onNotify('Aluno cadastrado e matrícula gerada automaticamente.');
    }
  };

  const confirmarExclusao = () => {
    if (!alunoParaExcluir) return;
    const removido = alunoController.removerAluno(alunoParaExcluir.id);
    if (removido) {
      if (selectedAlunoId === alunoParaExcluir.id) {
        onSelectAlunoId(null);
      }
      onTriggerRefresh();
      onNotify(`Aluno "${alunoParaExcluir.nome}" e registros vinculados foram excluídos.`);
    }
    setAlunoParaExcluir(null);
  };

  const handlePagarMensalidadeNaFicha = (mensalidadeId: number) => {
    const res = mensalidadeController.baixarPagamento(mensalidadeId);
    if (res.sucesso) {
      onTriggerRefresh();
      onNotify('Pagamento registrado na ficha do aluno.');
    }
  };

  // Se um aluno estiver selecionado, exibe a View Ficha do Aluno (`aluno_ver.php`)
  if (selectedAlunoId && fichaSelecionada) {
    const { aluno, matricula, mensalidades, totalPago, totalPendente, totalAtrasado } =
      fichaSelecionada;

    return (
      <div className="space-y-6">
        {/* Barra de topo da Ficha do Aluno */}
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectAlunoId(null)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Lista</span>
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">{aluno.nome}</h2>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>ID #{aluno.id}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">
                  Matrícula {matricula ? matricula.numero : 'Não vinculada'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{aluno.serie || 'Sem série'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => abrirModalEditar(aluno)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Cadastro</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNovaMensalidadeParaAluno(aluno.id)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Mensalidade</span>
            </button>
          </div>
        </div>

        {/* Grade 2 Colunas: Dados Pessoais + Dados Escolares e Resumo Financeiro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 font-display pb-3 mb-4 border-b border-slate-200">
              Dados Pessoais e Familiares
            </h3>
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Nome Completo</dt>
                <dd className="text-slate-900 font-semibold text-right">{aluno.nome}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">CPF</dt>
                <dd className="text-slate-900 font-mono tabular-nums text-right">
                  {AlunoModel.formatarCPF(aluno.cpf)}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Data de Nascimento · Idade</dt>
                <dd className="text-slate-900 font-mono tabular-nums text-right">
                  {MensalidadeModel.formatarData(aluno.data_nasc)}
                  {aluno.idade !== '' ? ` · ${aluno.idade} anos` : ''}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Sexo</dt>
                <dd className="text-slate-900 text-right">{aluno.sexo || '—'}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Telefone do Aluno</dt>
                <dd className="text-slate-900 font-mono tabular-nums text-right">
                  {AlunoModel.formatarTelefone(aluno.telefone)}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Email</dt>
                <dd className="text-slate-900 text-right">{aluno.email || '—'}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Endereço Residencial</dt>
                <dd className="text-slate-900 text-right">{aluno.endereco || '—'}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Responsável Financeiro/Legal</dt>
                <dd className="text-slate-900 font-medium text-right">
                  {aluno.responsavel || '—'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">Telefone do Responsável</dt>
                <dd className="text-slate-900 font-mono tabular-nums text-right">
                  {AlunoModel.formatarTelefone(aluno.tel_resp)}
                </dd>
              </div>
            </dl>
          </section>

          <div className="flex flex-col gap-6 justify-between">
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 font-display pb-3 mb-4 border-b border-slate-200">
                Vínculo Escolar e Matrícula
              </h3>
              <dl className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">Número da Matrícula</dt>
                  <dd className="text-slate-900 font-mono font-semibold tabular-nums">
                    {matricula ? matricula.numero : 'N/A'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">Série · Ano Letivo</dt>
                  <dd className="text-slate-900 font-medium">{aluno.serie || '—'}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">Turma · Turno</dt>
                  <dd className="text-slate-900">
                    <span className="font-mono">{aluno.turma || '—'}</span>
                    <span aria-hidden="true" className="mx-1.5 text-slate-400">·</span>
                    <span>{aluno.turno || '—'}</span>
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">Data de Matrícula</dt>
                  <dd className="text-slate-900 font-mono tabular-nums">
                    {MensalidadeModel.formatarData(aluno.data_matricula)}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">Situação Acadêmica</dt>
                  <dd className="font-semibold text-emerald-700">
                    {matricula ? MatriculaModel.labelStatus(matricula.status) : 'Ativo'}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Resumo Financeiro Individual */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-slate-200">
                <div className="p-4">
                  <div className="text-xs text-slate-500 mb-1">Total Pago</div>
                  <div className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                    {MensalidadeModel.formatarMoeda(totalPago)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-500 mb-1">Pendente a Vencer</div>
                  <div className="text-base font-bold text-amber-700 font-mono tabular-nums">
                    {MensalidadeModel.formatarMoeda(totalPendente)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-500 mb-1">Vencido / Atrasado</div>
                  <div className="text-base font-bold text-red-700 font-mono tabular-nums">
                    {MensalidadeModel.formatarMoeda(totalAtrasado)}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Histórico de Mensalidades do Aluno */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">
                Mensalidades Vinculadas ao Aluno
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Histórico financeiro individual e controle de baixas
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {mensalidades.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Descrição</th>
                  <th className="py-2.5 px-4 text-right">Valor</th>
                  <th className="py-2.5 px-4">Vencimento</th>
                  <th className="py-2.5 px-4">Situação</th>
                  <th className="py-2.5 px-4">Data Pagamento</th>
                  <th className="py-2.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {mensalidades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Nenhuma mensalidade lançada para este aluno.
                    </td>
                  </tr>
                ) : (
                  mensalidades.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{m.descricao}</td>
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
                      <td className="py-3 px-4 text-right">
                        {m.status_real !== 'pago' ? (
                          <button
                            type="button"
                            onClick={() => handlePagarMensalidadeNaFicha(m.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pagar</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">Quitado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal de edição caso acionado dentro da ficha */}
        {modalAberto && renderModalFormulario()}
      </div>
    );
  }

  function renderModalFormulario() {
    const idadeCalculada = AlunoModel.calcularIdade(dataNasc);

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-lg my-8">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editandoAluno ? `Editar Aluno · #${editandoAluno.id}` : 'Cadastrar Novo Aluno'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editandoAluno
                  ? 'Atualize os dados cadastrais e vínculo acadêmico do aluno'
                  : 'O sistema gerará o número de matrícula automaticamente ao salvar'}
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

          <form onSubmit={salvarFormulario} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {erroForm && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                {erroForm}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo do aluno"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF (11 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nascimento {idadeCalculada !== '' ? `(${idadeCalculada} anos)` : ''}
                </label>
                <input
                  type="date"
                  value={dataNasc}
                  onChange={(e) => setDataNasc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value as SexoAluno)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
                >
                  <option value="">Selecione</option>
                  {SEXOS_ALUNO.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(84) 99999-0000"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aluno@escola.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Nome completo do responsável"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone do Responsável
                </label>
                <input
                  type="text"
                  value={telResp}
                  onChange={(e) => setTelResp(e.target.value)}
                  placeholder="(84) 99999-0000"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Turma</label>
                <input
                  type="text"
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  placeholder="Ex: 9A, 1B"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Série</label>
                <select
                  value={serie}
                  onChange={(e) => setSerie(e.target.value as SerieEscolar)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
                >
                  <option value="">Selecione</option>
                  {SERIES_ESCOLARES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Turno</label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value as TurnoEscolar)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
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
                  Data Matrícula
                </label>
                <input
                  type="date"
                  value={dataMatricula}
                  onChange={(e) => setDataMatricula(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            {!editandoAluno && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gerarMensalidadeInicial}
                    onChange={(e) => setGerarMensalidadeInicial(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Gerar 1ª mensalidade automaticamente junto à matrícula</span>
                </label>
                {gerarMensalidadeInicial && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Valor (R$):</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={valorMensalidadeInicial}
                      onChange={(e) => setValorMensalidadeInicial(e.target.value)}
                      className="w-28 px-2.5 py-1 text-xs border border-slate-300 rounded-md font-mono bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                {editandoAluno ? 'Salvar Alterações' : 'Cadastrar Aluno'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Barra de Filtro e Ação Primária */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar aluno por nome, CPF, turma ou série..."
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

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Total: {listaAlunos.length} aluno(s)
          </span>
          <button
            type="button"
            onClick={abrirModalNovo}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Novo Aluno</span>
          </button>
        </div>
      </div>

      {/* Tabela de Alunos */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nome do Aluno</th>
                <th className="py-3 px-4">CPF</th>
                <th className="py-3 px-4">Série · Turma</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Data Matrícula</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {alunosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Nenhum aluno encontrado para os critérios informados.
                  </td>
                </tr>
              ) : (
                alunosPaginados.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                      #{aluno.id}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onSelectAlunoId(aluno.id)}
                        className="font-semibold text-slate-900 hover:underline text-left cursor-pointer"
                      >
                        {aluno.nome}
                      </button>
                      {aluno.responsavel && (
                        <div className="text-[11px] text-slate-500">
                          Resp.: {aluno.responsavel}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {AlunoModel.formatarCPF(aluno.cpf)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <span>{aluno.serie || '—'}</span>
                      {aluno.turma && (
                        <>
                          <span aria-hidden="true" className="mx-1.5 text-slate-400">·</span>
                          <span className="font-mono font-medium">{aluno.turma}</span>
                        </>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {AlunoModel.formatarTelefone(aluno.telefone)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-44 truncate">
                      {aluno.email || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {MensalidadeModel.formatarData(aluno.data_matricula)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectAlunoId(aluno.id)}
                          title="Ver Ficha Completa"
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ficha</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(aluno)}
                          title="Editar Aluno"
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlunoParaExcluir(aluno)}
                          title="Excluir Aluno"
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
              {Array.from({ length: totalPaginas }, (_, idx) => idx + 1).map((num) => (
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

      {modalAberto && renderModalFormulario()}

      {/* Modal de Confirmação de Exclusão em Cascata */}
      {alunoParaExcluir && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Confirmar Exclusão de Aluno
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Deseja realmente excluir o aluno <strong>{alunoParaExcluir.nome}</strong>? Esta
              operação removerá em cascata sua matrícula e todas as mensalidades vinculadas.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAlunoParaExcluir(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
