import { MatriculaModel } from '../models/MatriculaModel';
import { MatriculaComAluno, StatusMatricula, UpdateMatriculaDTO } from '../models/types';
import { IAlunoRepository } from '../repositories/AlunoRepository';
import { IMatriculaRepository } from '../repositories/MatriculaRepository';

export interface IMatriculaService {
  listar(busca?: string, statusFiltro?: StatusMatricula | ''): MatriculaComAluno[];
  buscarPorId(id: number): MatriculaComAluno | null;
  atualizar(id: number, dto: UpdateMatriculaDTO): { sucesso: boolean; erro?: string };
  excluir(id: number): boolean;
}

/**
 * MatriculaService: Orquestra operações de matrículas injetando
 * `IMatriculaRepository` e `IAlunoRepository`.
 */
export class MatriculaService implements IMatriculaService {
  private readonly matriculaRepo: IMatriculaRepository;
  private readonly alunoRepo: IAlunoRepository;

  constructor(matriculaRepo: IMatriculaRepository, alunoRepo: IAlunoRepository) {
    this.matriculaRepo = matriculaRepo;
    this.alunoRepo = alunoRepo;
  }

  public listar(busca: string = '', statusFiltro: StatusMatricula | '' = ''): MatriculaComAluno[] {
    const matriculas = this.matriculaRepo.listarTodas();
    const alunos = this.alunoRepo.listarTodos();
    const mapaAlunos = new Map(alunos.map((a) => [a.id, a]));

    const termo = busca.trim().toLowerCase();

    const enriquecidas: MatriculaComAluno[] = matriculas.map((m) => {
      const aluno = mapaAlunos.get(m.aluno_id);
      return {
        ...m,
        aluno_nome: aluno ? aluno.nome : 'Aluno Removido',
        aluno_cpf: aluno ? aluno.cpf : '',
      };
    });

    const filtradas = enriquecidas.filter((m) => {
      if (statusFiltro && m.status !== statusFiltro) {
        return false;
      }
      if (!termo) return true;
      return (
        m.aluno_nome.toLowerCase().includes(termo) ||
        m.numero.toLowerCase().includes(termo) ||
        (m.turma || '').toLowerCase().includes(termo) ||
        (m.serie || '').toLowerCase().includes(termo)
      );
    });

    return filtradas.reverse();
  }

  public buscarPorId(id: number): MatriculaComAluno | null {
    const m = this.matriculaRepo.buscarPorId(id);
    if (!m) return null;
    const aluno = this.alunoRepo.buscarPorId(m.aluno_id);
    return {
      ...m,
      aluno_nome: aluno ? aluno.nome : 'Aluno Removido',
      aluno_cpf: aluno ? aluno.cpf : '',
    };
  }

  public atualizar(id: number, dto: UpdateMatriculaDTO): { sucesso: boolean; erro?: string } {
    const atual = this.matriculaRepo.buscarPorId(id);
    if (!atual) {
      return { sucesso: false, erro: 'Matrícula não encontrada.' };
    }

    const atualizada = MatriculaModel.atualizar(atual, dto);
    this.matriculaRepo.atualizar(id, atualizada);

    // Mantém dados acadêmicos do aluno sincronizados
    const aluno = this.alunoRepo.buscarPorId(atual.aluno_id);
    if (aluno) {
      this.alunoRepo.atualizar(aluno.id, {
        ...aluno,
        turma: atualizada.turma,
        serie: atualizada.serie,
        turno: atualizada.turno,
        data_matricula: atualizada.data,
      });
    }

    return { sucesso: true };
  }

  public excluir(id: number): boolean {
    return this.matriculaRepo.excluir(id);
  }
}
