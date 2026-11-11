import React, { useState } from 'react';
import { Check, Copy, Database, Download, Layers, RefreshCw } from 'lucide-react';
import { useControllers } from '../container/DIContainer';
import { ARQUIVOS_PHP_MVC_REFATORADOS } from '../php-export/phpMvcTemplates';

interface ArquiteturaMvcViewProps {
  onTriggerRefresh: () => void;
  onNotify: (mensagem: string, tipo?: 'sucesso' | 'erro') => void;
}

export const ArquiteturaMvcView: React.FC<ArquiteturaMvcViewProps> = ({
  onTriggerRefresh,
  onNotify,
}) => {
  const { dbAdminController } = useControllers();
  const [arquivoSelecionadoIdx, setArquivoSelecionadoIdx] = useState(0);
  const [copiado, setCopiado] = useState(false);

  const arquivoAtual = ARQUIVOS_PHP_MVC_REFATORADOS[arquivoSelecionadoIdx];

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(arquivoAtual.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      onNotify('Não foi possível copiar automaticamente.', 'erro');
    }
  };

  const baixarDbJson = () => {
    const conteudo = dbAdminController.exportarDBJson();
    const blob = new Blob([conteudo], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'db.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('Arquivo db.json exportado com sucesso.');
  };

  const restaurarSeed = () => {
    dbAdminController.restaurarSeedOriginal();
    onTriggerRefresh();
    onNotify('Base de dados restaurada para o estado inicial do repositório.');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Explicativo da Arquitetura MVC & Injeção de Dependência */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Arquitetura MVC, Clean Code e Injeção de Dependência (SOLID)
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Refatoração estrutural do repositório{' '}
              <span className="font-mono text-slate-700">edcleciomicael/gest-o-de-escola</span>:
              separação estrita entre Models de Domínio, Repositories desacoplados por interfaces,
              Services com regras de negócio injetadas via construtor e Controllers enxutos.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={baixarDbJson}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar db.json</span>
            </button>
            <button
              type="button"
              onClick={restaurarSeed}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Dados Padrão</span>
            </button>
          </div>
        </div>

        {/* Diagrama de Camadas do Grafo de Injeção de Dependência */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900 font-display mb-1">
              01. IoC Container
            </div>
            <div className="text-[11px] font-mono text-slate-600 mb-2">DIContainer</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instancia e injeta dependências do driver de dados até os Controllers sem variáveis
              globais.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900 font-display mb-1">
              02. Models (Domínio)
            </div>
            <div className="text-[11px] font-mono text-slate-600 mb-2">
              Aluno · Matricula · Mensalidade
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Entidades ricas com validações, cálculo de idade, número de matrícula e inadimplência
              automática.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900 font-display mb-1">
              03. Repositories (DIP)
            </div>
            <div className="text-[11px] font-mono text-slate-600 mb-2">
              IAlunoRepository · IDatabaseDriver
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contratos de acesso a dados que isolam o JSON/Storage da lógica de negócio da escola.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900 font-display mb-1">
              04. Services (Use Cases)
            </div>
            <div className="text-[11px] font-mono text-slate-600 mb-2">
              AlunoService · RelatorioService
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Orquestram casos de uso transacionais (ex: criar matrícula junto ao aluno e exclusão
              em cascata).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900 font-display mb-1">
              05. Controllers &amp; Views
            </div>
            <div className="text-[11px] font-mono text-slate-600 mb-2">
              AlunoController · Views
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Views desacopladas de persistência que acionam exclusivamente métodos dos Controllers.
            </p>
          </div>
        </div>
      </section>

      {/* Comparativo Antes vs Depois da Refatoração */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 font-display">
            Melhorias Aplicadas sobre o Código Original do Repositório
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Arquivo Original (Procedural)</th>
                <th className="py-3 px-4">Problema Identificado</th>
                <th className="py-3 px-4">Solução MVC + Clean Code + DI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-4 font-mono text-slate-800">functions.php</td>
                <td className="py-3 px-4 text-slate-600">
                  Funções globais misturando leitura de arquivo JSON (`lerDB`), regra de negócio
                  (`statusMensalidade`) e HTML inline (`badgeStatus`).
                </td>
                <td className="py-3 px-4 text-slate-800">
                  Separado em <code className="font-mono">IDatabaseDriver</code> (persistência),{' '}
                  <code className="font-mono">MensalidadeModel</code> (regra de domínio) e Views
                  (apresentação).
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-slate-800">
                  aluno_form.php / alunos.php
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Manipulação direta do array `$db` dentro da página HTML e geração de matrícula
                  acoplada ao POST.
                </td>
                <td className="py-3 px-4 text-slate-800">
                  Encapsulado em <code className="font-mono">AlunoService::cadastrar()</code> com{' '}
                  <code className="font-mono">IAlunoRepository</code> e{' '}
                  <code className="font-mono">IMatriculaRepository</code> injetados via construtor.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-slate-800">
                  relatorio_financeiro.php / index.php
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Loops repetidos de agregação financeira e busca linear de alunos (`foreach`
                  aninhado $O(N \times M)$) misturados ao template.
                </td>
                <td className="py-3 px-4 text-slate-800">
                  Indexação em <code className="font-mono">Map</code> $O(1)$ dentro de{' '}
                  <code className="font-mono">RelatorioFinanceiroService</code> injetado no{' '}
                  <code className="font-mono">RelatorioController</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Explorador de Código PHP 8+ MVC Refatorado para o Repositório GitHub */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">
                Código-Fonte PHP 8+ MVC com Injeção de Dependência (Para seu GitHub)
              </h3>
              <p className="text-xs text-slate-500">
                Arquivos prontos em PHP 8.2+ tipado caso queira também atualizar o backend PHP no
                repositório
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copiarCodigo}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            {copiado ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Código Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Arquivo</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="p-3 space-y-1 bg-slate-50/60">
            {ARQUIVOS_PHP_MVC_REFATORADOS.map((arq, idx) => (
              <button
                key={arq.caminho}
                type="button"
                onClick={() => setArquivoSelecionadoIdx(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  idx === arquivoSelecionadoIdx
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="text-xs font-mono font-semibold truncate">{arq.caminho}</div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    idx === arquivoSelecionadoIdx ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Camada: {arq.camada}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 flex flex-col">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{arquivoAtual.descricao}</span>
              <span className="font-mono text-slate-500 shrink-0 ml-4">
                <Database className="w-3.5 h-3.5 inline mr-1" />
                {arquivoAtual.camada}
              </span>
            </div>
            <pre className="p-5 bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{arquivoAtual.codigo}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
