import { MensalidadeModel } from '../models/MensalidadeModel';
import {
  DashboardResumoDTO,
  FiltroRelatorioFinanceiro,
  MensalidadeComStatus,
  RelatorioFinanceiroDTO,
  ResumoFinanceiroPorAluno,
  SerieMensalGrafico,
} from '../models/types';
import { IAlunoRepository } from '../repositories/AlunoRepository';
import { IMatriculaRepository } from '../repositories/MatriculaRepository';
import { IMensalidadeRepository } from '../repositories/MensalidadeRepository';

export interface IRelatorioFinanceiroService {
  obterResumoDashboard(): DashboardResumoDTO;
  gerarRelatorioFinanceiro(filtro: FiltroRelatorioFinanceiro): RelatorioFinanceiroDTO;
}

const NOMES_MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * RelatorioFinanceiroService: Consolida indicadores do Dashboard (`index.php`)
 * e do Relatório Financeiro (`relatorio_financeiro.php`) com Injeção de Dependência.
 */
export class RelatorioFinanceiroService implements IRelatorioFinanceiroService {
  private readonly mensalidadeRepo: IMensalidadeRepository;
  private readonly alunoRepo: IAlunoRepository;
  private readonly matriculaRepo: IMatriculaRepository;

  constructor(
    mensalidadeRepo: IMensalidadeRepository,
    alunoRepo: IAlunoRepository,
    matriculaRepo: IMatriculaRepository
  ) {
    this.mensalidadeRepo = mensalidadeRepo;
    this.alunoRepo = alunoRepo;
    this.matriculaRepo = matriculaRepo;
  }

  public obterResumoDashboard(): DashboardResumoDTO {
    const alunos = this.alunoRepo.listarTodos();
    const matriculas = this.matriculaRepo.listarTodas();
    const mensalidades = this.mensalidadeRepo.listarTodas();
    const mapaAlunos = new Map(alunos.map((a) => [a.id, a]));

    let totalValor = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;

    const atrasadas: MensalidadeComStatus[] = [];

    for (const m of mensalidades) {
      const statusReal = MensalidadeModel.calcularStatusReal(m.vencimento, m.status);
      const valor = Number(m.valor || 0);
      totalValor += valor;

      if (statusReal === 'pago') {
        totalPago += valor;
      } else if (statusReal === 'atrasado') {
        totalAtrasado += valor;
        const aluno = mapaAlunos.get(m.aluno_id);
        atrasadas.push({
          ...m,
          status_real: statusReal,
          aluno_nome: aluno ? aluno.nome : 'Aluno não encontrado',
          aluno_turma: aluno ? aluno.turma : '',
        });
      } else {
        totalPendente += valor;
      }
    }

    // Últimos 6 meses para o gráfico financeiro (baseado na data atual ou meses com movimentação em 2026)
    const hoje = new Date();
    const seriesMap = new Map<string, SerieMensalGrafico>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const ano = d.getFullYear();
      const mesNum = d.getMonth();
      const mesKey = `${ano}-${String(mesNum + 1).padStart(2, '0')}`;
      const label = `${NOMES_MESES_CURTOS[mesNum]}/${String(ano).slice(2)}`;
      seriesMap.set(mesKey, {
        mesKey,
        label,
        pago: 0,
        pendente: 0,
        atrasado: 0,
      });
    }

    for (const m of mensalidades) {
      const mesKey = (m.vencimento || '').slice(0, 7);
      const bucket = seriesMap.get(mesKey);
      if (bucket) {
        const statusReal = MensalidadeModel.calcularStatusReal(m.vencimento, m.status);
        bucket[statusReal] += Number(m.valor || 0);
      }
    }

    const taxaAdimplencia = totalValor > 0 ? Math.round((totalPago / totalValor) * 100) : 100;
    const matriculasAtivas = matriculas.filter((m) => m.status === 'ativo').length;

    return {
      totalAlunos: alunos.length,
      totalMatriculas: matriculas.length,
      matriculasAtivas,
      totalMensalidades: mensalidades.length,
      totalValor,
      totalPago,
      totalPendente,
      totalAtrasado,
      taxaAdimplencia,
      ultimosAlunos: [...alunos].reverse().slice(0, 5),
      mensalidadesAtrasadas: atrasadas.slice(0, 5),
      historicoMensal: Array.from(seriesMap.values()),
    };
  }

  public gerarRelatorioFinanceiro(filtro: FiltroRelatorioFinanceiro): RelatorioFinanceiroDTO {
    const todasMensalidades = this.mensalidadeRepo.listarTodas();
    const alunos = this.alunoRepo.listarTodos();
    const mapaAlunos = new Map(alunos.map((a) => [a.id, a]));

    const anosSet = new Set<string>();
    for (const m of todasMensalidades) {
      const ano = (m.vencimento || '').slice(0, 4);
      if (ano && ano.length === 4) anosSet.add(ano);
    }
    if (anosSet.size === 0) {
      anosSet.add(new Date().getFullYear().toString());
    }
    const anosDisponiveis = Array.from(anosSet).sort((a, b) => b.localeCompare(a));

    const detalhamento: MensalidadeComStatus[] = [];
    let totalRecebido = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;

    const agrupadoPorAluno = new Map<number, ResumoFinanceiroPorAluno>();

    for (const m of todasMensalidades) {
      const mesVenc = (m.vencimento || '').slice(0, 7);
      const anoVenc = (m.vencimento || '').slice(0, 4);

      if (filtro.modo === 'mes' && mesVenc !== filtro.mes) continue;
      if (filtro.modo === 'ano' && anoVenc !== filtro.ano) continue;

      const statusReal = MensalidadeModel.calcularStatusReal(m.vencimento, m.status);
      const aluno = mapaAlunos.get(m.aluno_id);
      const nomeAluno = aluno ? aluno.nome : `Aluno #${m.aluno_id}`;
      const turmaAluno = aluno ? aluno.turma : '—';
      const valor = Number(m.valor || 0);

      if (statusReal === 'pago') totalRecebido += valor;
      else if (statusReal === 'atrasado') totalAtrasado += valor;
      else totalPendente += valor;

      detalhamento.push({
        ...m,
        status_real: statusReal,
        aluno_nome: nomeAluno,
        aluno_turma: turmaAluno,
      });

      const atualAluno = agrupadoPorAluno.get(m.aluno_id) || {
        aluno_id: m.aluno_id,
        aluno_nome: nomeAluno,
        turma: turmaAluno,
        pago: 0,
        pendente: 0,
        atrasado: 0,
        total: 0,
        percentualPago: 0,
      };

      atualAluno[statusReal] += valor;
      atualAluno.total += valor;
      atualAluno.percentualPago =
        atualAluno.total > 0 ? Math.round((atualAluno.pago / atualAluno.total) * 100) : 0;

      agrupadoPorAluno.set(m.aluno_id, atualAluno);
    }

    const totalPeriodo = totalRecebido + totalPendente + totalAtrasado;

    return {
      filtro,
      anosDisponiveis,
      totalPeriodo,
      totalRecebido,
      totalPendente,
      totalAtrasado,
      porAluno: Array.from(agrupadoPorAluno.values()).sort((a, b) =>
        a.aluno_nome.localeCompare(b.aluno_nome)
      ),
      detalhamento: detalhamento.sort((a, b) => b.vencimento.localeCompare(a.vencimento)),
    };
  }
}
