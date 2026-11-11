import React, { createContext, useContext, useMemo } from 'react';
import {
  AlunoController,
  AuthController,
  DashboardController,
  DatabaseAdminController,
  MatriculaController,
  MensalidadeController,
  RelatorioController,
} from '../controllers/AppControllers';
import { AlunoRepository, IAlunoRepository } from '../repositories/AlunoRepository';
import { IDatabaseDriver } from '../repositories/IDatabaseDriver';
import { IMatriculaRepository, MatriculaRepository } from '../repositories/MatriculaRepository';
import { IMensalidadeRepository, MensalidadeRepository } from '../repositories/MensalidadeRepository';
import { StorageDatabaseDriver } from '../repositories/StorageDatabaseDriver';
import { AlunoService, IAlunoService } from '../services/AlunoService';
import { AuthService, IAuthService } from '../services/AuthService';
import { IMatriculaService, MatriculaService } from '../services/MatriculaService';
import { IMensalidadeService, MensalidadeService } from '../services/MensalidadeService';
import {
  IRelatorioFinanceiroService,
  RelatorioFinanceiroService,
} from '../services/RelatorioFinanceiroService';

export interface AppControllersBundle {
  authController: AuthController;
  dashboardController: DashboardController;
  alunoController: AlunoController;
  matriculaController: MatriculaController;
  mensalidadeController: MensalidadeController;
  relatorioController: RelatorioController;
  dbAdminController: DatabaseAdminController;
}

/**
 * Container de Injeção de Dependência (IoC Container)
 * Responsável por instanciar e resolver o grafo de dependências seguindo o
 * Princípio da Inversão de Dependência (SOLID - D):
 *
 *   [IDatabaseDriver]
 *          ↓
 *   [Repositories: IAlunoRepository, IMatriculaRepository, IMensalidadeRepository]
 *          ↓
 *   [Services: IAlunoService, IMatriculaService, IMensalidadeService, IRelatorioFinanceiroService]
 *          ↓
 *   [Controllers: AlunoController, MatriculaController, MensalidadeController, RelatorioController]
 *          ↓
 *   [Views (React UI)]
 */
export class DIContainer {
  private readonly dbDriver: IDatabaseDriver;
  private readonly alunoRepository: IAlunoRepository;
  private readonly matriculaRepository: IMatriculaRepository;
  private readonly mensalidadeRepository: IMensalidadeRepository;

  private readonly authService: IAuthService;
  private readonly alunoService: IAlunoService;
  private readonly matriculaService: IMatriculaService;
  private readonly mensalidadeService: IMensalidadeService;
  private readonly relatorioService: IRelatorioFinanceiroService;

  public readonly controllers: AppControllersBundle;

  constructor(customDriver?: IDatabaseDriver) {
    // 1. Camada de Infraestrutura / Persistência
    this.dbDriver = customDriver ?? new StorageDatabaseDriver();

    // 2. Camada de Repositórios (Injetando IDatabaseDriver)
    this.alunoRepository = new AlunoRepository(this.dbDriver);
    this.matriculaRepository = new MatriculaRepository(this.dbDriver);
    this.mensalidadeRepository = new MensalidadeRepository(this.dbDriver);

    // 3. Camada de Serviços / Regras de Negócio (Injetando Repositórios)
    this.authService = new AuthService();
    this.alunoService = new AlunoService(
      this.alunoRepository,
      this.matriculaRepository,
      this.mensalidadeRepository
    );
    this.matriculaService = new MatriculaService(this.matriculaRepository, this.alunoRepository);
    this.mensalidadeService = new MensalidadeService(this.mensalidadeRepository, this.alunoRepository);
    this.relatorioService = new RelatorioFinanceiroService(
      this.mensalidadeRepository,
      this.alunoRepository,
      this.matriculaRepository
    );

    // 4. Camada de Controllers (Injetando Serviços)
    this.controllers = {
      authController: new AuthController(this.authService),
      dashboardController: new DashboardController(this.relatorioService),
      alunoController: new AlunoController(this.alunoService),
      matriculaController: new MatriculaController(this.matriculaService),
      mensalidadeController: new MensalidadeController(this.mensalidadeService),
      relatorioController: new RelatorioController(this.relatorioService),
      dbAdminController: new DatabaseAdminController(this.dbDriver),
    };
  }
}

const DIContext = createContext<AppControllersBundle | null>(null);

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useMemo(() => new DIContainer(), []);
  return <DIContext.Provider value={container.controllers}>{children}</DIContext.Provider>;
};

export function useControllers(): AppControllersBundle {
  const ctx = useContext(DIContext);
  if (!ctx) {
    throw new Error('useControllers deve ser utilizado dentro de um <DIProvider>.');
  }
  return ctx;
}
