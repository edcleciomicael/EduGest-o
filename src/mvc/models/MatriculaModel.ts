import { MatriculaProps, SerieEscolar, StatusMatricula, TurnoEscolar, UpdateMatriculaDTO } from './types';

/**
 * Model de Domínio: MatriculaModel
 * Encapsula a geração de número sequencial anual de matrícula (ex: 20260001)
 * e regras de transição de status acadêmico.
 */
export class MatriculaModel {
  public static gerarNumeroMatricula(matriculasExistentes: MatriculaProps[], dataReferencia?: string): string {
    const ano = dataReferencia ? dataReferencia.slice(0, 4) : new Date().getFullYear().toString();
    const maiorSequencia = matriculasExistentes.reduce((max, m) => {
      if (m.numero && m.numero.startsWith(ano)) {
        const sufixo = parseInt(m.numero.slice(4), 10);
        if (!isNaN(sufixo) && sufixo > max) return sufixo;
      }
      return max;
    }, matriculasExistentes.length);

    const proximo = maiorSequencia + 1;
    return `${ano}${String(proximo).padStart(4, '0')}`;
  }

  public static criarAutomatica(params: {
    id: number;
    aluno_id: number;
    matriculasExistentes: MatriculaProps[];
    turma: string;
    serie: SerieEscolar;
    turno: TurnoEscolar;
    data: string;
  }): MatriculaProps {
    const dataMat = params.data || new Date().toISOString().slice(0, 10);
    return {
      id: params.id,
      aluno_id: params.aluno_id,
      numero: this.gerarNumeroMatricula(params.matriculasExistentes, dataMat),
      turma: (params.turma || '').trim().toUpperCase(),
      serie: params.serie || '',
      turno: params.turno || '',
      data: dataMat,
      status: 'ativo',
    };
  }

  public static atualizar(atual: MatriculaProps, dto: UpdateMatriculaDTO): MatriculaProps {
    return {
      ...atual,
      turma: (dto.turma || '').trim().toUpperCase(),
      serie: dto.serie,
      turno: dto.turno,
      data: dto.data || atual.data,
      status: dto.status,
    };
  }

  public static labelStatus(status: StatusMatricula): string {
    const mapa: Record<StatusMatricula, string> = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      cancelado: 'Cancelado',
    };
    return mapa[status] || status;
  }
}
