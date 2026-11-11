export interface CodigoArquiteturaArquivo {
  caminho: string;
  camada: 'Container (IoC)' | 'Model' | 'Repository' | 'Service' | 'Controller' | 'Entrypoint / Router';
  linguagem: 'php' | 'typescript';
  descricao: string;
  codigo: string;
}

export const ARQUIVOS_PHP_MVC_REFATORADOS: CodigoArquiteturaArquivo[] = [
  {
    caminho: 'app/Container/DIContainer.php',
    camada: 'Container (IoC)',
    linguagem: 'php',
    descricao:
      'Container de Injeção de Dependência (IoC) que resolve Interfaces de Repositórios, Serviços e Controllers sem acoplamento estático.',
    codigo: `<?php
declare(strict_types=1);

namespace App\\Container;

use App\\Repositories\\Contracts\\DatabaseDriverInterface;
use App\\Repositories\\JsonDatabaseDriver;
use App\\Repositories\\AlunoRepository;
use App\\Repositories\\MatriculaRepository;
use App\\Repositories\\MensalidadeRepository;
use App\\Services\\AlunoService;
use App\\Services\\MatriculaService;
use App\\Services\\MensalidadeService;
use App\\Services\\RelatorioFinanceiroService;
use App\\Controllers\\AlunoController;
use App\\Controllers\\MatriculaController;
use App\\Controllers\\MensalidadeController;
use App\\Controllers\\DashboardController;

final class DIContainer
{
    private DatabaseDriverInterface $dbDriver;
    private AlunoRepository $alunoRepo;
    private MatriculaRepository $matriculaRepo;
    private MensalidadeRepository $mensalidadeRepo;

    private AlunoService $alunoService;
    private MatriculaService $matriculaService;
    private MensalidadeService $mensalidadeService;
    private RelatorioFinanceiroService $relatorioService;

    public function __construct(string $dbFilePath = __DIR__ . '/../../storage/db.json')
    {
        // 1. Driver de Persistência injetável
        $this->dbDriver = new JsonDatabaseDriver($dbFilePath);

        // 2. Repositórios recebem a abstração DatabaseDriverInterface
        $this->alunoRepo       = new AlunoRepository($this->dbDriver);
        $this->matriculaRepo   = new MatriculaRepository($this->dbDriver);
        $this->mensalidadeRepo = new MensalidadeRepository($this->dbDriver);

        // 3. Services recebem Repositórios via Construtor (Dependency Injection)
        $this->alunoService = new AlunoService(
            $this->alunoRepo,
            $this->matriculaRepo,
            $this->mensalidadeRepo
        );
        $this->matriculaService   = new MatriculaService($this->matriculaRepo, $this->alunoRepo);
        $this->mensalidadeService = new MensalidadeService($this->mensalidadeRepo, $this->alunoRepo);
        $this->relatorioService   = new RelatorioFinanceiroService(
            $this->mensalidadeRepo,
            $this->alunoRepo,
            $this->matriculaRepo
        );
    }

    public function makeAlunoController(): AlunoController
    {
        return new AlunoController($this->alunoService);
    }

    public function makeMatriculaController(): MatriculaController
    {
        return new MatriculaController($this->matriculaService);
    }

    public function makeMensalidadeController(): MensalidadeController
    {
        return new MensalidadeController($this->mensalidadeService);
    }

    public function makeDashboardController(): DashboardController
    {
        return new DashboardController($this->relatorioService);
    }
}`,
  },
  {
    caminho: 'app/Models/Aluno.php',
    camada: 'Model',
    linguagem: 'php',
    descricao:
      'Entidade de domínio Aluno com validação encapsulada, higienização de CPF/Telefone e cálculo automático de idade.',
    codigo: `<?php
declare(strict_types=1);

namespace App\\Models;

use DateTimeImmutable;
use InvalidArgumentException;

final class Aluno
{
    public readonly int $id;
    public readonly string $nome;
    public readonly string $cpf;
    public readonly string $dataNasc;
    public readonly int|string $idade;
    public readonly string $sexo;
    public readonly string $endereco;
    public readonly string $telefone;
    public readonly string $email;
    public readonly string $responsavel;
    public readonly string $telResp;
    public readonly string $turma;
    public readonly string $serie;
    public readonly string $dataMatricula;
    public readonly string $turno;

    public function __construct(array $dados)
    {
        $nome = trim((string)($dados['nome'] ?? ''));
        if ($nome === '') {
            throw new InvalidArgumentException('O nome completo do aluno é obrigatório.');
        }

        $this->id            = (int)($dados['id'] ?? 0);
        $this->nome          = $nome;
        $this->cpf           = preg_replace('/\\D/', '', (string)($dados['cpf'] ?? ''));
        $this->dataNasc      = trim((string)($dados['data_nasc'] ?? ''));
        $this->idade         = self::calcularIdade($this->dataNasc);
        $this->sexo          = trim((string)($dados['sexo'] ?? ''));
        $this->endereco      = trim((string)($dados['endereco'] ?? ''));
        $this->telefone      = preg_replace('/\\D/', '', (string)($dados['telefone'] ?? ''));
        $this->email         = trim((string)($dados['email'] ?? ''));
        $this->responsavel   = trim((string)($dados['responsavel'] ?? ''));
        $this->telResp       = preg_replace('/\\D/', '', (string)($dados['tel_resp'] ?? ''));
        $this->turma         = strtoupper(trim((string)($dados['turma'] ?? '')));
        $this->serie         = trim((string)($dados['serie'] ?? ''));
        $this->dataMatricula = trim((string)($dados['data_matricula'] ?? date('Y-m-d')));
        $this->turno         = trim((string)($dados['turno'] ?? ''));
    }

    public static function calcularIdade(string $dataNasc): int|string
    {
        if ($dataNasc === '') return '';
        $nasc = new DateTimeImmutable($dataNasc);
        $hoje = new DateTimeImmutable('today');
        return $hoje->diff($nasc)->y;
    }

    public function toArray(): array
    {
        return [
            'id'             => $this->id,
            'nome'           => $this->nome,
            'cpf'            => $this->cpf,
            'data_nasc'      => $this->dataNasc,
            'idade'          => $this->idade,
            'sexo'           => $this->sexo,
            'endereco'       => $this->endereco,
            'telefone'       => $this->telefone,
            'email'          => $this->email,
            'responsavel'    => $this->responsavel,
            'tel_resp'       => $this->telResp,
            'turma'          => $this->turma,
            'serie'          => $this->serie,
            'data_matricula' => $this->dataMatricula,
            'turno'          => $this->turno,
        ];
    }
}`,
  },
  {
    caminho: 'app/Repositories/JsonDatabaseDriver.php',
    camada: 'Repository',
    linguagem: 'php',
    descricao:
      'Substitui as funções globais lerDB() e salvarDB() de functions.php por uma classe injetável com file locking seguro.',
    codigo: `<?php
declare(strict_types=1);

namespace App\\Repositories;

use App\\Repositories\\Contracts\\DatabaseDriverInterface;

final class JsonDatabaseDriver implements DatabaseDriverInterface
{
    public function __construct(private readonly string $filePath)
    {
        if (!file_exists($this->filePath)) {
            $this->write(['alunos' => [], 'matriculas' => [], 'mensalidades' => []]);
        }
    }

    public function read(): array
    {
        $fp = fopen($this->filePath, 'r');
        flock($fp, LOCK_SH);
        $size = filesize($this->filePath) ?: 1;
        $content = fread($fp, $size);
        flock($fp, LOCK_UN);
        fclose($fp);

        $decoded = json_decode((string)$content, true);
        if (!is_array($decoded)) {
            return ['alunos' => [], 'matriculas' => [], 'mensalidades' => []];
        }

        return [
            'alunos'       => $decoded['alunos'] ?? [],
            'matriculas'   => $decoded['matriculas'] ?? [],
            'mensalidades' => $decoded['mensalidades'] ?? [],
        ];
    }

    public function write(array $data): void
    {
        $fp = fopen($this->filePath, 'w');
        flock($fp, LOCK_EX);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}`,
  },
  {
    caminho: 'app/Services/AlunoService.php',
    camada: 'Service',
    linguagem: 'php',
    descricao:
      'Serviço de domínio com Injeção de Dependência via Construtor. Centraliza o cadastro de aluno + matrícula automática e exclusão em cascata.',
    codigo: `<?php
declare(strict_types=1);

namespace App\\Services;

use App\\Models\\Aluno;
use App\\Repositories\\Contracts\\AlunoRepositoryInterface;
use App\\Repositories\\Contracts\\MatriculaRepositoryInterface;
use App\\Repositories\\Contracts\\MensalidadeRepositoryInterface;

final class AlunoService
{
    public function __construct(
        private readonly AlunoRepositoryInterface $alunoRepository,
        private readonly MatriculaRepositoryInterface $matriculaRepository,
        private readonly MensalidadeRepositoryInterface $mensalidadeRepository
    ) {}

    public function cadastrarAlunoComMatricula(array $payload): Aluno
    {
        $novoId = $this->alunoRepository->nextId();
        $aluno  = new Aluno(array_merge($payload, ['id' => $novoId]));

        $this->alunoRepository->create($aluno->toArray());

        // Regra de negócio: gera matrícula sequencial automática (ex: 20260001)
        $numeroMatricula = $this->matriculaRepository->gerarProximoNumero();
        $this->matriculaRepository->create([
            'id'       => $this->matriculaRepository->nextId(),
            'aluno_id' => $aluno->id,
            'numero'   => $numeroMatricula,
            'turma'    => $aluno->turma,
            'serie'    => $aluno->serie,
            'turno'    => $aluno->turno,
            'data'     => $aluno->dataMatricula,
            'status'   => 'ativo',
        ]);

        return $aluno;
    }

    public function excluirEmCascata(int $alunoId): void
    {
        $this->alunoRepository->delete($alunoId);
        $this->matriculaRepository->deleteByAlunoId($alunoId);
        $this->mensalidadeRepository->deleteByAlunoId($alunoId);
    }
}`,
  },
  {
    caminho: 'app/Controllers/AlunoController.php',
    camada: 'Controller',
    linguagem: 'php',
    descricao:
      'Controller enxuto que recebe AlunoService por Injeção de Dependência, trata requisições HTTP e delega renderização para a View.',
    codigo: `<?php
declare(strict_types=1);

namespace App\\Controllers;

use App\\Services\\AlunoService;
use InvalidArgumentException;

final class AlunoController
{
    public function __construct(
        private readonly AlunoService $alunoService
    ) {}

    public function index(array $query): array
    {
        $busca  = trim((string)($query['busca'] ?? ''));
        $pagina = max(1, (int)($query['p'] ?? 1));

        return $this->alunoService->listarPaginado($busca, $pagina, 10);
    }

    public function store(array $postData): array
    {
        try {
            $aluno = $this->alunoService->cadastrarAlunoComMatricula($postData);
            return ['sucesso' => true, 'aluno' => $aluno->toArray()];
        } catch (InvalidArgumentException $e) {
            return ['sucesso' => false, 'erro' => $e->getMessage()];
        }
    }

    public function destroy(int $id): void
    {
        $this->alunoService->excluirEmCascata($id);
    }
}`,
  },
];
