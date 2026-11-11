import { MensalidadeModel } from '../models/MensalidadeModel';
import {
  CreateMensalidadeDTO,
  MensalidadeComStatus,
  MensalidadeProps,
  StatusMensalidadeReal,
  UpdateMensalidadeDTO,
} from '../models/types';
import { IAlunoRepository } from '../repositories/AlunoRepository';
import { IMensalidadeRepository } from '../repositories/MensalidadeRepository';

export interface ResumoListaMensalidades {
  itens: MensalidadeComStatus[];
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
}

export interface IMensalidadeService {
  listarComResumo(busca?: string, statusFiltro?: StatusMensalidadeReal | ''): ResumoListaMensalidades;
  buscarPorId(id: number): MensalidadeComStatus | null;
  criar(dto: CreateMensalidadeDTO): { sucesso: boolean; criadas?: MensalidadeProps[]; erro?: string };
  atualizar(id: number, dto: UpdateMensalidadeDTO): { sucesso: boolean; erro?: string };
  pagar(id: number): { sucesso: boolean; erro?: string };
  excluir(id: number): boolean;
}

/**
 * MensalidadeService: Camada de serviço financeiro de mensalidades.
 * Injeção de dependência de `IMensalidadeRepository` e `IAlunoRepository`.
 */
export class MensalidadeService implements IMensalidadeService {
  private readonly mensalidadeRepo: IMensalidadeRepository;
  private readonly alunoRepo: IAlunoRepository;

  constructor(mensalidadeRepo: IMensalidadeRepository, alunoRepo: IAlunoRepository) {
    this.mensalidadeRepo = mensalidadeRepo;
    this.alunoRepo = alunoRepo;
  }

  public listarComResumo(
    busca: string = '',
    statusFiltro: StatusMensalidadeReal | '' = ''
  ): ResumoListaMensalidades {
    const todas = this.mensalidadeRepo.listarTodas();
    const alunos = this.alunoRepo.listarTodos();
    const mapaAlunos = new Map(alunos.map((a) => [a.id, a]));

    let totalPago = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;

    const enriquecidas: MensalidadeComStatus[] = todas.map((m) => {
      const aluno = mapaAlunos.get(m.aluno_id);
      const statusReal = MensalidadeModel.calcularStatusReal(m.vencimento, m.status);
      const valor = Number(m.valor || 0);

      // Totais globais antes do filtro (fiel ao comportamento de `mensalidades.php`)
      if (statusReal === 'pago') totalPago += valor;
      else if (statusReal === 'atrasado') totalAtrasado += valor;
      else totalPendente += valor;

      return {
        ...m,
        status_real: statusReal,
        aluno_nome: aluno ? aluno.nome : 'Aluno não encontrado',
        aluno_turma: aluno ? aluno.turma : '',
      };
    });

    const termo = busca.trim().toLowerCase();

    const filtradas = enriquecidas.filter((m) => {
      if (statusFiltro && m.status_real !== statusFiltro) {
        return false;
      }
      if (!termo) return true;
      return (
        m.aluno_nome.toLowerCase().includes(termo) ||
        (m.descricao || '').toLowerCase().includes(termo)
      );
    });

    return {
      itens: filtradas.reverse(),
      totalPago,
      totalPendente,
      totalAtrasado,
    };
  }

  public buscarPorId(id: number): MensalidadeComStatus | null {
    const m = this.mensalidadeRepo.buscarPorId(id);
    if (!m) return null;
    const aluno = this.alunoRepo.buscarPorId(m.aluno_id);
    return {
      ...m,
      status_real: MensalidadeModel.calcularStatusReal(m.vencimento, m.status),
      aluno_nome: aluno ? aluno.nome : 'Aluno não encontrado',
      aluno_turma: aluno ? aluno.turma : '',
    };
  }

  public criar(dto: CreateMensalidadeDTO): { sucesso: boolean; criadas?: MensalidadeProps[]; erro?: string } {
    const validacao = MensalidadeModel.validar(dto);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro };
    }

    const qtdParcelas = Math.max(1, Math.min(12, Number(dto.parcelas || 1)));
    let proximoId = this.mensalidadeRepo.gerarProximoId();
    const novas: MensalidadeProps[] = [];

    const [anoBase, mesBase, diaBase] = dto.vencimento.split('-').map(Number);

    for (let i = 0; i < qtdParcelas; i++) {
      const dataVenc = new Date(anoBase, mesBase - 1 + i, diaBase);
      const vencISO = `${dataVenc.getFullYear()}-${String(dataVenc.getMonth() + 1).padStart(2, '0')}-${String(
        dataVenc.getDate()
      ).padStart(2, '0')}`;

      const descricaoParcela =
        qtdParcelas > 1
          ? `${(dto.descricao || 'Mensalidade').trim()} (${i + 1}/${qtdParcelas})`
          : (dto.descricao || 'Mensalidade').trim();

      const item = MensalidadeModel.construirNova(proximoId++, {
        ...dto,
        descricao: descricaoParcela,
        vencimento: vencISO,
        status: i === 0 ? dto.status : 'pendente',
      });
      novas.push(item);
    }

    this.mensalidadeRepo.salvarLote(novas);
    return { sucesso: true, criadas: novas };
  }

  public atualizar(id: number, dto: UpdateMensalidadeDTO): { sucesso: boolean; erro?: string } {
    const existente = this.mensalidadeRepo.buscarPorId(id);
    if (!existente) {
      return { sucesso: false, erro: 'Mensalidade não encontrada.' };
    }
    const validacao = MensalidadeModel.validar(dto);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro };
    }
    const atualizada = MensalidadeModel.atualizarExistente(existente, dto);
    this.mensalidadeRepo.atualizar(id, atualizada);
    return { sucesso: true };
  }

  public pagar(id: number): { sucesso: boolean; erro?: string } {
    const existente = this.mensalidadeRepo.buscarPorId(id);
    if (!existente) {
      return { sucesso: false, erro: 'Mensalidade não encontrada.' };
    }
    const paga = MensalidadeModel.registrarPagamento(existente);
    this.mensalidadeRepo.atualizar(id, paga);
    return { sucesso: true };
  }

  public excluir(id: number): boolean {
    return this.mensalidadeRepo.excluir(id);
  }
}
