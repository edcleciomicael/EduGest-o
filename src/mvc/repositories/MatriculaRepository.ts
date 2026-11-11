import { MatriculaProps } from '../models/types';
import { IDatabaseDriver } from './IDatabaseDriver';

export interface IMatriculaRepository {
  listarTodas(): MatriculaProps[];
  buscarPorId(id: number): MatriculaProps | null;
  buscarPorAlunoId(alunoId: number): MatriculaProps | null;
  gerarProximoId(): number;
  salvarNova(matricula: MatriculaProps): MatriculaProps;
  atualizar(id: number, matricula: MatriculaProps): MatriculaProps | null;
  excluir(id: number): boolean;
  excluirPorAlunoId(alunoId: number): void;
}

/**
 * Repositório de Matrículas com Injeção de Dependência via construtor (`IDatabaseDriver`).
 */
export class MatriculaRepository implements IMatriculaRepository {
  private readonly dbDriver: IDatabaseDriver;

  constructor(dbDriver: IDatabaseDriver) {
    this.dbDriver = dbDriver;
  }

  public listarTodas(): MatriculaProps[] {
    const db = this.dbDriver.lerDB();
    return [...db.matriculas];
  }

  public buscarPorId(id: number): MatriculaProps | null {
    const db = this.dbDriver.lerDB();
    return db.matriculas.find((m) => m.id === Number(id)) || null;
  }

  public buscarPorAlunoId(alunoId: number): MatriculaProps | null {
    const db = this.dbDriver.lerDB();
    return db.matriculas.find((m) => m.aluno_id === Number(alunoId)) || null;
  }

  public gerarProximoId(): number {
    const db = this.dbDriver.lerDB();
    if (db.matriculas.length === 0) return 1;
    return Math.max(...db.matriculas.map((m) => m.id)) + 1;
  }

  public salvarNova(matricula: MatriculaProps): MatriculaProps {
    const db = this.dbDriver.lerDB();
    db.matriculas.push(matricula);
    this.dbDriver.salvarDB(db);
    return matricula;
  }

  public atualizar(id: number, matricula: MatriculaProps): MatriculaProps | null {
    const db = this.dbDriver.lerDB();
    const idx = db.matriculas.findIndex((m) => m.id === Number(id));
    if (idx === -1) return null;
    db.matriculas[idx] = matricula;
    this.dbDriver.salvarDB(db);
    return matricula;
  }

  public excluir(id: number): boolean {
    const db = this.dbDriver.lerDB();
    const antes = db.matriculas.length;
    db.matriculas = db.matriculas.filter((m) => m.id !== Number(id));
    if (db.matriculas.length === antes) return false;
    this.dbDriver.salvarDB(db);
    return true;
  }

  public excluirPorAlunoId(alunoId: number): void {
    const db = this.dbDriver.lerDB();
    db.matriculas = db.matriculas.filter((m) => m.aluno_id !== Number(alunoId));
    this.dbDriver.salvarDB(db);
  }
}
