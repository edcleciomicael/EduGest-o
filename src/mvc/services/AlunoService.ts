import { AlunoModel } from '../models/AlunoModel';
import { MatriculaModel } from '../models/MatriculaModel';
import { MensalidadeModel } from '../models/MensalidadeModel';
import {
  AlunoProps,
  CreateAlunoDTO,
  FichaAlunoDTO,
  MensalidadeComStatus,
  UpdateAlunoDTO,
} from '../models/types';
import { IAlunoRepository } from '../repositories/AlunoRepository';
import { IMatriculaRepository } from '../repositories/MatriculaRepository';
import { IMensalidadeRepository } from '../repositories/MensalidadeRepository';

export interface IAlunoService {
  listar(busca?: string): AlunoProps[];
  buscarPorId(id: number): AlunoProps | null;
  obterFichaCompleta(id: number): FichaAlunoDTO | null;
  cadastrar(dto: CreateAlunoDTO): { sucesso: boolean; aluno?: AlunoProps; erro?: string };
  atualizar(id: number, dto: UpdateAlunoDTO): { sucesso: boolean; aluno?: AlunoProps; erro?: string };
  excluirCascata(id: number): boolean;
}

/**
 * AlunoService: Camada de Regras de Negócio de Alunos.
 * Recebe dependências injetadas via construtor (Inversão de Controle / DIP).
 */
export class AlunoService implements IAlunoService {
  private readonly alunoRepo: IAlunoRepository;
  private readonly matriculaRepo: IMatriculaRepository;
  private readonly mensalidadeRepo: IMensalidadeRepository;

  constructor(
    alunoRepo: IAlunoRepository,
    matriculaRepo: IMatriculaRepository,
    mensalidadeRepo: IMensalidadeRepository
  ) {
    this.alunoRepo = alunoRepo;
    this.matriculaRepo = matriculaRepo;
    this.mensalidadeRepo = mensalidadeRepo;
  }

  public listar(busca: string = ''): AlunoProps[] {
    const todos = this.alunoRepo.listarTodos();
    const termo = busca.trim().toLowerCase();

    const filtrados = termo
      ? todos.filter((a) => {
          return (
            a.nome.toLowerCase().includes(termo) ||
            (a.cpf || '').toLowerCase().includes(termo) ||
            (a.turma || '').toLowerCase().includes(termo) ||
            (a.serie || '').toLowerCase().includes(termo) ||
            (a.email || '').toLowerCase().includes(termo)
          );
        })
      : todos;

    // Ordem reversa (mais recentes primeiro), preservando comportamento de array_reverse($lista) em alunos.php
    return [...filtrados].reverse();
  }

  public buscarPorId(id: number): AlunoProps | null {
    return this.alunoRepo.buscarPorId(id);
  }

  public obterFichaCompleta(id: number): FichaAlunoDTO | null {
    const aluno = this.alunoRepo.buscarPorId(id);
    if (!aluno) return null;

    const matricula = this.matriculaRepo.buscarPorAlunoId(id);
    const mensalidadesBrutas = this.mensalidadeRepo.listarPorAlunoId(id);

    let totalPago = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;

    const mensalidades: MensalidadeComStatus[] = mensalidadesBrutas
      .map((m) => {
        const statusReal = MensalidadeModel.calcularStatusReal(m.vencimento, m.status);
        const valor = Number(m.valor || 0);
        if (statusReal === 'pago') {
          totalPago += valor;
        } else if (statusReal === 'atrasado') {
          totalAtrasado += valor;
        } else {
          totalPendente += valor;
        }
        return {
          ...m,
          status_real: statusReal,
          aluno_nome: aluno.nome,
          aluno_turma: aluno.turma,
        };
      })
      .sort((a, b) => b.vencimento.localeCompare(a.vencimento));

    return {
      aluno: {
        ...aluno,
        idade: AlunoModel.calcularIdade(aluno.data_nasc),
      },
      matricula,
      mensalidades,
      totalPago,
      totalPendente,
      totalAtrasado,
    };
  }

  public cadastrar(dto: CreateAlunoDTO): { sucesso: boolean; aluno?: AlunoProps; erro?: string } {
    const validacao = AlunoModel.validar(dto);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro };
    }

    const novoId = this.alunoRepo.gerarProximoId();
    const novoAluno = AlunoModel.construirNovo(novoId, dto);
    this.alunoRepo.salvarNovo(novoAluno);

    // Regra de negócio de `aluno_form.php`: Ao cadastrar novo aluno, gera matrícula automática
    const matriculasExistentes = this.matriculaRepo.listarTodas();
    const novaMatriculaId = this.matriculaRepo.gerarProximoId();
    const novaMatricula = MatriculaModel.criarAutomatica({
      id: novaMatriculaId,
      aluno_id: novoAluno.id,
      matriculasExistentes,
      turma: novoAluno.turma,
      serie: novoAluno.serie,
      turno: novoAluno.turno,
      data: novoAluno.data_matricula,
    });
    this.matriculaRepo.salvarNova(novaMatricula);

    // Opcionalmente gera a primeira mensalidade se solicitado no formulário
    if (dto.gerar_mensalidade && dto.valor_mensalidade_inicial && dto.valor_mensalidade_inicial > 0) {
      const mensId = this.mensalidadeRepo.gerarProximoId();
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + 15);
      const vencISO = vencimento.toISOString().slice(0, 10);
      const novaMensalidade = MensalidadeModel.construirNova(mensId, {
        aluno_id: novoAluno.id,
        descricao: 'Mensalidade Escolar',
        valor: Number(dto.valor_mensalidade_inicial),
        vencimento: vencISO,
        status: 'pendente',
      });
      this.mensalidadeRepo.salvarNova(novaMensalidade);
    }

    return { sucesso: true, aluno: novoAluno };
  }

  public atualizar(id: number, dto: UpdateAlunoDTO): { sucesso: boolean; aluno?: AlunoProps; erro?: string } {
    const existente = this.alunoRepo.buscarPorId(id);
    if (!existente) {
      return { sucesso: false, erro: 'Aluno não encontrado no banco de dados.' };
    }

    const validacao = AlunoModel.validar(dto);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro };
    }

    const atualizado = AlunoModel.atualizarExistente(existente, dto);
    this.alunoRepo.atualizar(id, atualizado);

    // Sincroniza turma, série e turno na matrícula ativa do aluno
    const matricula = this.matriculaRepo.buscarPorAlunoId(id);
    if (matricula) {
      this.matriculaRepo.atualizar(matricula.id, {
        ...matricula,
        turma: atualizado.turma,
        serie: atualizado.serie,
        turno: atualizado.turno,
      });
    }

    return { sucesso: true, aluno: atualizado };
  }

  public excluirCascata(id: number): boolean {
    const excluido = this.alunoRepo.excluir(id);
    if (excluido) {
      this.matriculaRepo.excluirPorAlunoId(id);
      this.mensalidadeRepo.excluirPorAlunoId(id);
    }
    return excluido;
  }
}
