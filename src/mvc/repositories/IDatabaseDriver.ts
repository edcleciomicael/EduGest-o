import { DatabaseSchema } from '../models/types';

/**
 * Contrato de Inversão de Dependência (DIP) para o motor de persistência.
 * Permite injetar tanto driver em JSON/LocalStorage quanto SQL/API REST sem alterar os Repositórios.
 */
export interface IDatabaseDriver {
  lerDB(): DatabaseSchema;
  salvarDB(db: DatabaseSchema): void;
  restaurarPadrao(): DatabaseSchema;
  exportarJSON(): string;
  importarJSON(conteudo: string): DatabaseSchema;
}
