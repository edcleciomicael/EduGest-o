import { DatabaseSchema } from '../models/types';
import { IDatabaseDriver } from './IDatabaseDriver';

const STORAGE_KEY = 'edugestao_mvc_db_v1';

/**
 * Dados iniciais baseados no arquivo `db.json` do repositório
 * https://github.com/edcleciomicael/gest-o-de-escola
 * preservando integralmente o registro original #1 (Edcleio Micael) e enriquecendo
 * com registros acadêmicos e financeiros dos últimos 6 meses para análise completa.
 */
export function criarSeedDatabase(): DatabaseSchema {
  return {
    alunos: [
      {
        id: 1,
        nome: 'Edcleio Micael',
        cpf: '08546123356',
        data_nasc: '2007-06-11',
        idade: 18,
        sexo: 'Masculino',
        endereco: 'RUA MARIZ, 2915',
        telefone: '84996831769',
        email: 'edcleciomicael@gmail.com',
        responsavel: 'Janaína Batista',
        tel_resp: '84996831769',
        turma: '9A',
        serie: '9º Ano',
        data_matricula: '2026-05-11',
        turno: 'Manhã',
      },
      {
        id: 2,
        nome: 'Beatriz Oliveira Cavalcanti',
        cpf: '12458963210',
        data_nasc: '2010-03-22',
        idade: 16,
        sexo: 'Feminino',
        endereco: 'Av. Prudente de Morais, 1420, Tirol',
        telefone: '84998124410',
        email: 'beatriz.cavalcanti@escola.edu.br',
        responsavel: 'Ricardo Cavalcanti',
        tel_resp: '84998124400',
        turma: '1A',
        serie: '1º Ensino Médio',
        data_matricula: '2026-02-05',
        turno: 'Manhã',
      },
      {
        id: 3,
        nome: 'Gabriel Medeiros Dantas',
        cpf: '35689741205',
        data_nasc: '2012-08-14',
        idade: 14,
        sexo: 'Masculino',
        endereco: 'Rua Mossoró, 512, Petrópolis',
        telefone: '84994021190',
        email: 'gabriel.dantas@escola.edu.br',
        responsavel: 'Cláudia Medeiros',
        tel_resp: '84994021188',
        turma: '8B',
        serie: '8º Ano',
        data_matricula: '2026-02-10',
        turno: 'Tarde',
      },
      {
        id: 4,
        nome: 'Helena Costa Ferreira',
        cpf: '74125896304',
        data_nasc: '2009-11-03',
        idade: 17,
        sexo: 'Feminino',
        endereco: 'Rua Ceará-Mirim, 890, Barro Vermelho',
        telefone: '84991558020',
        email: 'helena.ferreira@escola.edu.br',
        responsavel: 'Marcos Ferreira',
        tel_resp: '84991558000',
        turma: '2A',
        serie: '2º Ensino Médio',
        data_matricula: '2026-01-28',
        turno: 'Integral',
      },
      {
        id: 5,
        nome: 'Lucas Albuquerque Rocha',
        cpf: '85236974112',
        data_nasc: '2011-05-19',
        idade: 15,
        sexo: 'Masculino',
        endereco: 'Rua São José, 2040, Lagoa Nova',
        telefone: '84988741230',
        email: 'lucas.rocha@escola.edu.br',
        responsavel: 'Fernanda Albuquerque',
        tel_resp: '84988741200',
        turma: '9A',
        serie: '9º Ano',
        data_matricula: '2026-03-02',
        turno: 'Manhã',
      },
      {
        id: 6,
        nome: 'Mariana Souza Nascimento',
        cpf: '96325874199',
        data_nasc: '2008-09-27',
        idade: 18,
        sexo: 'Feminino',
        endereco: 'Av. Engenheiro Roberto Freire, 310, Capim Macio',
        telefone: '84996331045',
        email: 'mariana.nascimento@escola.edu.br',
        responsavel: 'Patrícia Souza',
        tel_resp: '84996331000',
        turma: '3A',
        serie: '3º Ensino Médio',
        data_matricula: '2026-02-01',
        turno: 'Manhã',
      },
    ],
    matriculas: [
      {
        id: 1,
        aluno_id: 1,
        numero: '20260001',
        turma: '9A',
        serie: '9º Ano',
        turno: 'Manhã',
        data: '2026-05-11',
        status: 'ativo',
      },
      {
        id: 2,
        aluno_id: 2,
        numero: '20260002',
        turma: '1A',
        serie: '1º Ensino Médio',
        turno: 'Manhã',
        data: '2026-02-05',
        status: 'ativo',
      },
      {
        id: 3,
        aluno_id: 3,
        numero: '20260003',
        turma: '8B',
        serie: '8º Ano',
        turno: 'Tarde',
        data: '2026-02-10',
        status: 'ativo',
      },
      {
        id: 4,
        aluno_id: 4,
        numero: '20260004',
        turma: '2A',
        serie: '2º Ensino Médio',
        turno: 'Integral',
        data: '2026-01-28',
        status: 'ativo',
      },
      {
        id: 5,
        aluno_id: 5,
        numero: '20260005',
        turma: '9A',
        serie: '9º Ano',
        turno: 'Manhã',
        data: '2026-03-02',
        status: 'ativo',
      },
      {
        id: 6,
        aluno_id: 6,
        numero: '20260006',
        turma: '3A',
        serie: '3º Ensino Médio',
        turno: 'Manhã',
        data: '2026-02-01',
        status: 'ativo',
      },
    ],
    mensalidades: [
      {
        id: 1,
        aluno_id: 1,
        descricao: 'Mensalidade Maio/2026',
        valor: 250,
        vencimento: '2026-05-13',
        status: 'pago',
        data_pag: '2026-05-11',
      },
      {
        id: 2,
        aluno_id: 1,
        descricao: 'Mensalidade Setembro/2026',
        valor: 250,
        vencimento: '2026-09-10',
        status: 'pago',
        data_pag: '2026-09-09',
      },
      {
        id: 3,
        aluno_id: 1,
        descricao: 'Mensalidade Outubro/2026',
        valor: 250,
        vencimento: '2026-10-10',
        status: 'pago',
        data_pag: '2026-10-08',
      },
      {
        id: 4,
        aluno_id: 1,
        descricao: 'Mensalidade Novembro/2026',
        valor: 250,
        vencimento: '2026-11-20',
        status: 'pendente',
        data_pag: '',
      },
      {
        id: 5,
        aluno_id: 2,
        descricao: 'Mensalidade Agosto/2026',
        valor: 480,
        vencimento: '2026-08-10',
        status: 'pago',
        data_pag: '2026-08-08',
      },
      {
        id: 6,
        aluno_id: 2,
        descricao: 'Mensalidade Setembro/2026',
        valor: 480,
        vencimento: '2026-09-10',
        status: 'pago',
        data_pag: '2026-09-10',
      },
      {
        id: 7,
        aluno_id: 2,
        descricao: 'Mensalidade Outubro/2026',
        valor: 480,
        vencimento: '2026-10-10',
        status: 'pago',
        data_pag: '2026-10-09',
      },
      {
        id: 8,
        aluno_id: 2,
        descricao: 'Mensalidade Novembro/2026',
        valor: 480,
        vencimento: '2026-11-25',
        status: 'pendente',
        data_pag: '',
      },
      {
        id: 9,
        aluno_id: 3,
        descricao: 'Mensalidade Outubro/2026',
        valor: 380,
        vencimento: '2026-10-10',
        status: 'pendente',
        data_pag: '',
      },
      {
        id: 10,
        aluno_id: 3,
        descricao: 'Mensalidade Novembro/2026',
        valor: 380,
        vencimento: '2026-11-05',
        status: 'pendente',
        data_pag: '',
      },
      {
        id: 11,
        aluno_id: 4,
        descricao: 'Mensalidade Julho/2026 — Integral',
        valor: 750,
        vencimento: '2026-07-10',
        status: 'pago',
        data_pag: '2026-07-07',
      },
      {
        id: 12,
        aluno_id: 4,
        descricao: 'Mensalidade Agosto/2026 — Integral',
        valor: 750,
        vencimento: '2026-08-10',
        status: 'pago',
        data_pag: '2026-08-09',
      },
      {
        id: 13,
        aluno_id: 4,
        descricao: 'Mensalidade Setembro/2026 — Integral',
        valor: 750,
        vencimento: '2026-09-10',
        status: 'pago',
        data_pag: '2026-09-08',
      },
      {
        id: 14,
        aluno_id: 4,
        descricao: 'Mensalidade Outubro/2026 — Integral',
        valor: 750,
        vencimento: '2026-10-10',
        status: 'pago',
        data_pag: '2026-10-10',
      },
      {
        id: 15,
        aluno_id: 4,
        descricao: 'Mensalidade Novembro/2026 — Integral',
        valor: 750,
        vencimento: '2026-11-10',
        status: 'pago',
        data_pag: '2026-11-09',
      },
      {
        id: 16,
        aluno_id: 5,
        descricao: 'Mensalidade Outubro/2026',
        valor: 350,
        vencimento: '2026-10-15',
        status: 'pendente',
        data_pag: '',
      },
      {
        id: 17,
        aluno_id: 6,
        descricao: 'Mensalidade Junho/2026',
        valor: 520,
        vencimento: '2026-06-10',
        status: 'pago',
        data_pag: '2026-06-09',
      },
      {
        id: 18,
        aluno_id: 6,
        descricao: 'Mensalidade Novembro/2026',
        valor: 520,
        vencimento: '2026-11-28',
        status: 'pendente',
        data_pag: '',
      },
    ],
  };
}

export class StorageDatabaseDriver implements IDatabaseDriver {
  public lerDB(): DatabaseSchema {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = criarSeedDatabase();
        this.salvarDB(seed);
        return seed;
      }
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
      return {
        alunos: Array.isArray(parsed.alunos) ? parsed.alunos : [],
        matriculas: Array.isArray(parsed.matriculas) ? parsed.matriculas : [],
        mensalidades: Array.isArray(parsed.mensalidades) ? parsed.mensalidades : [],
      };
    } catch {
      const seed = criarSeedDatabase();
      this.salvarDB(seed);
      return seed;
    }
  }

  public salvarDB(db: DatabaseSchema): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db, null, 2));
  }

  public restaurarPadrao(): DatabaseSchema {
    const seed = criarSeedDatabase();
    this.salvarDB(seed);
    return seed;
  }

  public exportarJSON(): string {
    const db = this.lerDB();
    return JSON.stringify(db, null, 4);
  }

  public importarJSON(conteudo: string): DatabaseSchema {
    const parsed = JSON.parse(conteudo) as Partial<DatabaseSchema>;
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Formato de arquivo db.json inválido.');
    }
    const normalizado: DatabaseSchema = {
      alunos: Array.isArray(parsed.alunos) ? parsed.alunos : [],
      matriculas: Array.isArray(parsed.matriculas) ? parsed.matriculas : [],
      mensalidades: Array.isArray(parsed.mensalidades) ? parsed.mensalidades : [],
    };
    this.salvarDB(normalizado);
    return normalizado;
  }
}
