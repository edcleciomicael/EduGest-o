import { MensalidadeProps } from '../models/types';
import { IDatabaseDriver } from './IDatabaseDriver';

export interface IMensalidadeRepository {
  listarTodas(): MensalidadeProps[];
  buscarPorId(id: number): MensalidadeProps | null;
  listarPorAlunoId(alunoId: number): MensalidadeProps[];
  gerarProximoId(): number;
  salvarNova(mensalidade: MensalidadeProps): MensalidadeProps;
  salvarLote(mensalidades: MensalidadeProps[]): MensalidadeProps[];
  atualizar(id: number, mensalidade: MensalidadeProps): MensalidadeProps | null;
  excluir(id: number): boolean;
  excluirPorAlunoId(alunoId: number): void;
}

/**
 * Repositório de Mensalidades com Injeção de Dependência via construtor (`IDatabaseDriver`).
 */
export class MensalidadeRepository implements IMensalidadeRepository {
  private readonly dbDriver: IDatabaseDriver;

  constructor(dbDriver: IDatabaseDriver) {
    this.dbDriver = dbDriver;
  }

  public listarTodas(): MensalidadeProps[] {
    const db = this.dbDriver.lerDB();
    return [...db.mensalidades];
  }

  public buscarPorId(id: number): MensalidadeProps | null {
    const db = this.dbDriver.lerDB();
    return db.mensalidades.find((m) => m.id === Number(id)) || null;
  }

  public listarPorAlunoId(alunoId: number): MensalidadeProps[] {
    const db = this.dbDriver.lerDB();
    return db.mensalidades.filter((m) => m.aluno_id === Number(alunoId));
  }

  public gerarProximoId(): number {
    const db = this.dbDriver.lerDB();
    if (db.mensalidades.length === 0) return 1;
    return Math.max(...db.mensalidades.map((m) => m.id)) + 1;
  }

  public salvarNova(mensalidade: MensalidadeProps): MensalidadeProps {
    const db = this.dbDriver.lerDB();
    db.mensalidades.push(mensalidade);
    this.dbDriver.salvarDB(db);
    return mensalidade;
  }

  public salvarLote(mensalidades: MensalidadeProps[]): MensalidadeProps[] {
    const db = this.dbDriver.lerDB();
    db.mensalidades.push(...mensalidades);
    this.dbDriver.salvarDB(db);
    return mensalidades;
  }

  public atualizar(id: number, mensalidade: MensalidadeProps): MensalidadeProps | null {
    const db = this.dbDriver.lerDB();
    const idx = db.mensalidades.findIndex((m) => m.id === Number(id));
    if (idx === -1) return null;
    db.mensalidades[idx] = mensalidade;
    this.dbDriver.salvarDB(db);
    return mensalidade;
  }

  public excluir(id: number): boolean {
    const db = this.dbDriver.lerDB();
    const antes = db.mensalidades.length;
    db.mensalidades = db.mensalidades.filter((m) => m.id !== Number(id));
    if (db.mensalidades.length === antes) return false;
    this.dbDriver.salvarDB(db);
    return true;
  }

  public excluirPorAlunoId(alunoId: number): void {
    const db = this.dbDriver.lerDB();
    db.mensalidades = db.mensalidades.filter((m) => m.aluno_id !== Number(alunoId));
    this.dbDriver.salvarDB(db);
  }
}
