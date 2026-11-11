import {
  AlunoProps,
  CreateAlunoDTO,
  CreateMensalidadeDTO,
  DashboardResumoDTO,
  FichaAlunoDTO,
  FiltroRelatorioFinanceiro,
  MatriculaComAluno,
  MensalidadeComStatus,
  RelatorioFinanceiroDTO,
  StatusMatricula,
  StatusMensalidadeReal,
  UpdateAlunoDTO,
  UpdateMatriculaDTO,
  UpdateMensalidadeDTO,
  UsuarioSessao,
} from '../models/types';
import { IDatabaseDriver } from '../repositories/IDatabaseDriver';
import { IAlunoService } from '../services/AlunoService';
import { IAuthService } from '../services/AuthService';
import { IMatriculaService } from '../services/MatriculaService';
import { IMensalidadeService, ResumoListaMensalidades } from '../services/MensalidadeService';
import { IRelatorioFinanceiroService } from '../services/RelatorioFinanceiroService';

/**
 * AuthController: Media interações da View de Login/Cabeçalho com `IAuthService`.
 */
export class AuthController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  public obterSessao(): UsuarioSessao {
    return this.authService.obterSessaoAtual();
  }

  public login(email: string, senha: string): { sucesso: boolean; sessao?: UsuarioSessao; erro?: string } {
    return this.authService.autenticar(email, senha);
  }

  public logout(): UsuarioSessao {
    return this.authService.encerrarSessao();
  }
}

/**
 * DashboardController: Media a View principal do Dashboard com `IRelatorioFinanceiroService`.
 */
export class DashboardController {
  private readonly relatorioService: IRelatorioFinanceiroService;

  constructor(relatorioService: IRelatorioFinanceiroService) {
    this.relatorioService = relatorioService;
  }

  public carregarDashboard(): DashboardResumoDTO {
    return this.relatorioService.obterResumoDashboard();
  }
}

/**
 * AlunoController: Media as Views de Alunos e Ficha do Aluno com `IAlunoService`.
 */
export class AlunoController {
  private readonly alunoService: IAlunoService;

  constructor(alunoService: IAlunoService) {
    this.alunoService = alunoService;
  }

  public listarAlunos(busca?: string): AlunoProps[] {
    return this.alunoService.listar(busca);
  }

  public buscarAluno(id: number): AlunoProps | null {
    return this.alunoService.buscarPorId(id);
  }

  public carregarFichaCompleta(id: number): FichaAlunoDTO | null {
    return this.alunoService.obterFichaCompleta(id);
  }

  public salvarNovoAluno(dto: CreateAlunoDTO): { sucesso: boolean; aluno?: AlunoProps; erro?: string } {
    return this.alunoService.cadastrar(dto);
  }

  public editarAluno(id: number, dto: UpdateAlunoDTO): { sucesso: boolean; aluno?: AlunoProps; erro?: string } {
    return this.alunoService.atualizar(id, dto);
  }

  public removerAluno(id: number): boolean {
    return this.alunoService.excluirCascata(id);
  }
}

/**
 * MatriculaController: Media a View de Matrículas com `IMatriculaService`.
 */
export class MatriculaController {
  private readonly matriculaService: IMatriculaService;

  constructor(matriculaService: IMatriculaService) {
    this.matriculaService = matriculaService;
  }

  public listarMatriculas(busca?: string, statusFiltro?: StatusMatricula | ''): MatriculaComAluno[] {
    return this.matriculaService.listar(busca, statusFiltro);
  }

  public buscarMatricula(id: number): MatriculaComAluno | null {
    return this.matriculaService.buscarPorId(id);
  }

  public atualizarMatricula(id: number, dto: UpdateMatriculaDTO): { sucesso: boolean; erro?: string } {
    return this.matriculaService.atualizar(id, dto);
  }

  public excluirMatricula(id: number): boolean {
    return this.matriculaService.excluir(id);
  }
}

/**
 * MensalidadeController: Media as Views de Mensalidades com `IMensalidadeService`.
 */
export class MensalidadeController {
  private readonly mensalidadeService: IMensalidadeService;

  constructor(mensalidadeService: IMensalidadeService) {
    this.mensalidadeService = mensalidadeService;
  }

  public listarMensalidades(
    busca?: string,
    statusFiltro?: StatusMensalidadeReal | ''
  ): ResumoListaMensalidades {
    return this.mensalidadeService.listarComResumo(busca, statusFiltro);
  }

  public buscarMensalidade(id: number): MensalidadeComStatus | null {
    return this.mensalidadeService.buscarPorId(id);
  }

  public lancarMensalidade(dto: CreateMensalidadeDTO): { sucesso: boolean; erro?: string; quantidade?: number } {
    const res = this.mensalidadeService.criar(dto);
    return {
      sucesso: res.sucesso,
      erro: res.erro,
      quantidade: res.criadas?.length || 0,
    };
  }

  public editarMensalidade(id: number, dto: UpdateMensalidadeDTO): { sucesso: boolean; erro?: string } {
    return this.mensalidadeService.atualizar(id, dto);
  }

  public baixarPagamento(id: number): { sucesso: boolean; erro?: string } {
    return this.mensalidadeService.pagar(id);
  }

  public excluirMensalidade(id: number): boolean {
    return this.mensalidadeService.excluir(id);
  }
}

/**
 * RelatorioController: Media a View de Relatório Financeiro com `IRelatorioFinanceiroService`.
 */
export class RelatorioController {
  private readonly relatorioService: IRelatorioFinanceiroService;

  constructor(relatorioService: IRelatorioFinanceiroService) {
    this.relatorioService = relatorioService;
  }

  public consultarRelatorio(filtro: FiltroRelatorioFinanceiro): RelatorioFinanceiroDTO {
    return this.relatorioService.gerarRelatorioFinanceiro(filtro);
  }
}

/**
 * DatabaseAdminController: Permite exportar/importar o `db.json` ou restaurar o seed original.
 */
export class DatabaseAdminController {
  private readonly dbDriver: IDatabaseDriver;

  constructor(dbDriver: IDatabaseDriver) {
    this.dbDriver = dbDriver;
  }

  public exportarDBJson(): string {
    return this.dbDriver.exportarJSON();
  }

  public importarDBJson(jsonContent: string): void {
    this.dbDriver.importarJSON(jsonContent);
  }

  public restaurarSeedOriginal(): void {
    this.dbDriver.restaurarPadrao();
  }
}
