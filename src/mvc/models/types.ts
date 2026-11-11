export type SexoAluno = 'Masculino' | 'Feminino' | 'Outro' | '';

export type TurnoEscolar = 'Manhã' | 'Tarde' | 'Noite' | 'Integral' | '';

export type SerieEscolar =
  | '1º Ano'
  | '2º Ano'
  | '3º Ano'
  | '4º Ano'
  | '5º Ano'
  | '6º Ano'
  | '7º Ano'
  | '8º Ano'
  | '9º Ano'
  | '1º Ensino Médio'
  | '2º Ensino Médio'
  | '3º Ensino Médio'
  | '';

export type StatusMatricula = 'ativo' | 'inativo' | 'cancelado';

export type StatusMensalidadeArmazenado = 'pago' | 'pendente' | 'atrasado';
export type StatusMensalidadeReal = 'pago' | 'pendente' | 'atrasado';

export interface AlunoProps {
  id: number;
  nome: string;
  cpf: string;
  data_nasc: string;
  idade: number | string;
  sexo: SexoAluno;
  endereco: string;
  telefone: string;
  email: string;
  responsavel: string;
  tel_resp: string;
  turma: string;
  serie: SerieEscolar;
  data_matricula: string;
  turno: TurnoEscolar;
}

export interface CreateAlunoDTO {
  nome: string;
  cpf: string;
  data_nasc: string;
  sexo: SexoAluno;
  endereco: string;
  telefone: string;
  email: string;
  responsavel: string;
  tel_resp: string;
  turma: string;
  serie: SerieEscolar;
  data_matricula: string;
  turno: TurnoEscolar;
  valor_mensalidade_inicial?: number;
  gerar_mensalidade?: boolean;
}

export type UpdateAlunoDTO = Omit<CreateAlunoDTO, 'valor_mensalidade_inicial' | 'gerar_mensalidade'>;

export interface MatriculaProps {
  id: number;
  aluno_id: number;
  numero: string;
  turma: string;
  serie: SerieEscolar;
  turno: TurnoEscolar;
  data: string;
  status: StatusMatricula;
}

export interface MatriculaComAluno extends MatriculaProps {
  aluno_nome: string;
  aluno_cpf: string;
}

export interface UpdateMatriculaDTO {
  turma: string;
  serie: SerieEscolar;
  turno: TurnoEscolar;
  data: string;
  status: StatusMatricula;
}

export interface MensalidadeProps {
  id: number;
  aluno_id: number;
  descricao: string;
  valor: number;
  vencimento: string;
  status: StatusMensalidadeArmazenado;
  data_pag: string;
}

export interface MensalidadeComStatus extends MensalidadeProps {
  status_real: StatusMensalidadeReal;
  aluno_nome: string;
  aluno_turma?: string;
}

export interface CreateMensalidadeDTO {
  aluno_id: number;
  descricao: string;
  valor: number;
  vencimento: string;
  status: StatusMensalidadeArmazenado;
  parcelas?: number;
}

export type UpdateMensalidadeDTO = Omit<CreateMensalidadeDTO, 'parcelas'>;

export interface DatabaseSchema {
  alunos: AlunoProps[];
  matriculas: MatriculaProps[];
  mensalidades: MensalidadeProps[];
}

export interface UsuarioSessao {
  logado: boolean;
  usuario: string;
  email: string;
  cargo: string;
}

export interface FichaAlunoDTO {
  aluno: AlunoProps;
  matricula: MatriculaProps | null;
  mensalidades: MensalidadeComStatus[];
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
}

export interface SerieMensalGrafico {
  mesKey: string;
  label: string;
  pago: number;
  pendente: number;
  atrasado: number;
}

export interface DashboardResumoDTO {
  totalAlunos: number;
  totalMatriculas: number;
  matriculasAtivas: number;
  totalMensalidades: number;
  totalValor: number;
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
  taxaAdimplencia: number;
  ultimosAlunos: AlunoProps[];
  mensalidadesAtrasadas: MensalidadeComStatus[];
  historicoMensal: SerieMensalGrafico[];
}

export type ModoFiltroRelatorio = 'mes' | 'ano' | 'todos';

export interface FiltroRelatorioFinanceiro {
  modo: ModoFiltroRelatorio;
  mes: string; // YYYY-MM
  ano: string; // YYYY
}

export interface ResumoFinanceiroPorAluno {
  aluno_id: number;
  aluno_nome: string;
  turma: string;
  pago: number;
  pendente: number;
  atrasado: number;
  total: number;
  percentualPago: number;
}

export interface RelatorioFinanceiroDTO {
  filtro: FiltroRelatorioFinanceiro;
  anosDisponiveis: string[];
  totalPeriodo: number;
  totalRecebido: number;
  totalPendente: number;
  totalAtrasado: number;
  porAluno: ResumoFinanceiroPorAluno[];
  detalhamento: MensalidadeComStatus[];
}

export const SERIES_ESCOLARES: SerieEscolar[] = [
  '1º Ano',
  '2º Ano',
  '3º Ano',
  '4º Ano',
  '5º Ano',
  '6º Ano',
  '7º Ano',
  '8º Ano',
  '9º Ano',
  '1º Ensino Médio',
  '2º Ensino Médio',
  '3º Ensino Médio',
];

export const TURNOS_ESCOLARES: TurnoEscolar[] = ['Manhã', 'Tarde', 'Noite', 'Integral'];

export const SEXOS_ALUNO: SexoAluno[] = ['Masculino', 'Feminino', 'Outro'];
