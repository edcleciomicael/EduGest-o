import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const OPCOES_ITENS_POR_PAGINA = [10, 15, 20, 25] as const;

interface DataGridPaginationProps {
  totalItens: number;
  paginaAtual: number;
  itensPorPagina: number;
  onPaginaChange: (novaPagina: number) => void;
  onItensPorPaginaChange: (novoTamanho: number) => void;
  opcoesPorPagina?: readonly number[];
}

export const DataGridPagination: React.FC<DataGridPaginationProps> = ({
  totalItens,
  paginaAtual,
  itensPorPagina,
  onPaginaChange,
  onItensPorPaginaChange,
  opcoesPorPagina = OPCOES_ITENS_POR_PAGINA,
}) => {
  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
  const paginaSegura = Math.min(Math.max(1, paginaAtual), totalPaginas);

  const indiceInicial = totalItens === 0 ? 0 : (paginaSegura - 1) * itensPorPagina + 1;
  const indiceFinal = Math.min(paginaSegura * itensPorPagina, totalItens);

  // Calcula janela de páginas visíveis (máx 5 botões numéricos)
  const gerarNumerosPaginas = (): number[] => {
    const maxBotoes = 5;
    let inicio = Math.max(1, paginaSegura - Math.floor(maxBotoes / 2));
    const fim = Math.min(totalPaginas, inicio + maxBotoes - 1);
    if (fim - inicio + 1 < maxBotoes) {
      inicio = Math.max(1, fim - maxBotoes + 1);
    }
    const paginas: number[] = [];
    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    return paginas;
  };

  const paginasVisiveis = gerarNumerosPaginas();

  return (
    <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      {/* Lado Esquerdo: Seletor de quantidade por página (10 a 25) + Contagem */}
      <div className="flex flex-wrap items-center gap-3 text-slate-600">
        <div className="flex items-center gap-2">
          <label className="font-medium text-slate-600 whitespace-nowrap">
            Linhas por página:
          </label>
          <select
            value={itensPorPagina}
            onChange={(e) => {
              onItensPorPaginaChange(Number(e.target.value));
              onPaginaChange(1);
            }}
            aria-label="Linhas por página"
            className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900 cursor-pointer"
          >
            {opcoesPorPagina.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        </div>

        <span aria-hidden="true" className="text-slate-300 hidden sm:inline">
          ·
        </span>

        <span className="font-mono tabular-nums text-slate-500">
          Mostrando <strong className="text-slate-800">{indiceInicial}</strong>–
          <strong className="text-slate-800">{indiceFinal}</strong> de{' '}
          <strong className="text-slate-800">{totalItens}</strong> registro(s)
        </span>
      </div>

      {/* Lado Direito: Setas laterais de navegação e números de página */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPaginaChange(1)}
          disabled={paginaSegura <= 1}
          title="Primeira página"
          aria-label="Primeira página"
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPaginaChange(paginaSegura - 1)}
          disabled={paginaSegura <= 1}
          title="Página anterior"
          aria-label="Página anterior"
          className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1 font-medium cursor-pointer whitespace-nowrap"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Anterior</span>
        </button>

        <div className="flex items-center gap-1 mx-0.5">
          {paginasVisiveis.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onPaginaChange(num)}
              className={`min-w-7 px-2 py-1 rounded-md font-mono text-xs tabular-nums transition-colors cursor-pointer ${
                num === paginaSegura
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPaginaChange(paginaSegura + 1)}
          disabled={paginaSegura >= totalPaginas}
          title="Próxima página"
          aria-label="Próxima página"
          className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1 font-medium cursor-pointer whitespace-nowrap"
        >
          <span className="hidden md:inline">Próxima</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPaginaChange(totalPaginas)}
          disabled={paginaSegura >= totalPaginas}
          title="Última página"
          aria-label="Última página"
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
