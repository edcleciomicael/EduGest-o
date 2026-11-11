import { AlunoProps } from '../models/types';
import { IDatabaseDriver } from './IDatabaseDriver';

export interface IAlunoRepository {
  listarTodos(): AlunoProps[];
  buscarPorId(id: number): AlunoProps | null;
  gerarProximoId(): number;
  salvarNovo(aluno: AlunoProps): AlunoProps;
  atualizar(id: number, dadosAtualizados: AlunoProps): AlunoProps | null;
  excluir(id: number): boolean;
}

/**
 * Repositório de Alunos com Injeção de Dependência via construtor (`IDatabaseDriver`).
 */
export class AlunoRepository implements IAlunoRepository {
  private readonly dbDriver: IDatabaseDriver;

  constructor(dbDriver: IDatabaseDriver) {
    this.dbDriver = dbDriver;
  }

  public listarTodos(): AlunoProps[] {
    const db = this.dbDriver.lerDB();
    return [...db.alunos];
  }

  public buscarPorId(id: number): AlunoProps | null {
    const db = this.dbDriver.lerDB();
    return db.alunos.find((a) => a.id === Number(id)) || null;
  }

  public gerarProximoId(): number {
    const db = this.dbDriver.lerDB();
    if (db.alunos.length === 0) return 1;
    return Math.max(...db.alunos.map((a) => a.id)) + 1;
  }

  public salvarNovo(aluno: AlunoProps): AlunoProps {
    const db = this.dbDriver.lerDB();
    db.alunos.push(aluno);
    this.dbDriver.salvarDB(db);
    return aluno;
  }

  public atualizar(id: number, dadosAtualizados: AlunoProps): AlunoProps | null {
    const db = this.dbDriver.lerDB();
    const index = db.alunos.findIndex((a) => a.id === Number(id));
    if (index === -1) return null;
    db.alunos[index] = dadosAtualizados;
    this.dbDriver.salvarDB(db);
    return dadosAtualizados;
  }

  public excluir(id: number): boolean {
    const db = this.dbDriver.lerDB();
    const tamanhoAntes = db.alunos.length;
    db.alunos = db.alunos.filter((a) => a.id !== Number(id));
    if (db.alunos.length === tamanhoAntes) return false;
    this.dbDriver.salvarDB(db);
    return true;
  }
}
