import {
  CreateMensalidadeDTO,
  MensalidadeProps,
  StatusMensalidadeArmazenado,
  StatusMensalidadeReal,
  UpdateMensalidadeDTO,
} from './types';

/**
 * Model de Domínio: MensalidadeModel
 * Responsável pelo cálculo dinâmico de inadimplência (vencimento < hoje => atrasado),
 * liquidação de pagamentos e formatação monetária/datas no padrão brasileiro.
 */
export class MensalidadeModel {
  public static obterDataHojeISO(): string {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  /**
   * Regra de negócio original de `statusMensalidade($vencimento, $status)` em `functions.php`:
   * Se já estiver pago, retorna 'pago'. Caso contrário, se a data de vencimento
   * for anterior à data atual, retorna dinamicamente 'atrasado', senão 'pendente'.
   */
  public static calcularStatusReal(
    vencimento: string,
    statusArmazenado: StatusMensalidadeArmazenado,
    hojeISO: string = this.obterDataHojeISO()
  ): StatusMensalidadeReal {
    if (statusArmazenado === 'pago') {
      return 'pago';
    }
    if (vencimento && vencimento < hojeISO) {
      return 'atrasado';
    }
    if (statusArmazenado === 'atrasado') {
      return 'atrasado';
    }
    return 'pendente';
  }

  public static validar(dto: CreateMensalidadeDTO | UpdateMensalidadeDTO): { valido: boolean; erro?: string } {
    if (!dto.aluno_id || dto.aluno_id <= 0) {
      return { valido: false, erro: 'Selecione um aluno válido para vincular a mensalidade.' };
    }
    if (isNaN(dto.valor) || Number(dto.valor) <= 0) {
      return { valido: false, erro: 'Informe um valor financeiro maior que R$ 0,00.' };
    }
    if (!dto.vencimento) {
      return { valido: false, erro: 'Informe a data de vencimento da mensalidade.' };
    }
    return { valido: true };
  }

  public static construirNova(id: number, dto: CreateMensalidadeDTO): MensalidadeProps {
    const hoje = this.obterDataHojeISO();
    const status = dto.status || 'pendente';
    return {
      id,
      aluno_id: Number(dto.aluno_id),
      descricao: (dto.descricao || 'Mensalidade').trim() || 'Mensalidade',
      valor: Number(Number(dto.valor).toFixed(2)),
      vencimento: dto.vencimento,
      status,
      data_pag: status === 'pago' ? hoje : '',
    };
  }

  public static atualizarExistente(atual: MensalidadeProps, dto: UpdateMensalidadeDTO): MensalidadeProps {
    const hoje = this.obterDataHojeISO();
    const status = dto.status || 'pendente';
    let dataPag = atual.data_pag;
    if (status === 'pago' && !dataPag) {
      dataPag = hoje;
    } else if (status !== 'pago') {
      dataPag = '';
    }
    return {
      ...atual,
      aluno_id: Number(dto.aluno_id),
      descricao: (dto.descricao || 'Mensalidade').trim() || 'Mensalidade',
      valor: Number(Number(dto.valor).toFixed(2)),
      vencimento: dto.vencimento,
      status,
      data_pag: dataPag,
    };
  }

  public static registrarPagamento(atual: MensalidadeProps, dataPagamentoISO?: string): MensalidadeProps {
    return {
      ...atual,
      status: 'pago',
      data_pag: dataPagamentoISO || this.obterDataHojeISO(),
    };
  }

  public static formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(valor || 0));
  }

  public static formatarData(dataISO: string): string {
    if (!dataISO) return '—';
    const partes = dataISO.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataISO;
  }

  public static labelStatus(status: StatusMensalidadeReal): string {
    const mapa: Record<StatusMensalidadeReal, string> = {
      pago: 'Pago',
      pendente: 'Pendente',
      atrasado: 'Atrasado',
    };
    return mapa[status] || status;
  }
}
