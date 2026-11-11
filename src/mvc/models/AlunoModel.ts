import { AlunoProps, CreateAlunoDTO, UpdateAlunoDTO } from './types';

/**
 * Model de Domínio: AlunoModel
 * Responsável pelas regras de negócio intrínsecas ao Aluno, validações,
 * cálculo de idade e higienização/formatação de documentos e contatos.
 */
export class AlunoModel {
  public static limparDigitos(valor: string): string {
    return (valor || '').replace(/\D/g, '');
  }

  public static calcularIdade(dataNasc: string): number | string {
    if (!dataNasc) return '';
    const partes = dataNasc.split('-');
    if (partes.length !== 3) return '';
    const nascimento = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    if (isNaN(nascimento.getTime())) return '';

    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade >= 0 ? idade : 0;
  }

  public static formatarCPF(cpf: string): string {
    const limpo = this.limparDigitos(cpf);
    if (limpo.length === 11) {
      return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
    }
    return cpf || '—';
  }

  public static formatarTelefone(telefone: string): string {
    const limpo = this.limparDigitos(telefone);
    if (limpo.length === 11) {
      return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
    }
    if (limpo.length === 10) {
      return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6, 10)}`;
    }
    return telefone || '—';
  }

  public static validar(dto: CreateAlunoDTO | UpdateAlunoDTO): { valido: boolean; erro?: string } {
    const nome = (dto.nome || '').trim();
    if (!nome) {
      return { valido: false, erro: 'O nome completo do aluno é obrigatório.' };
    }
    if (nome.length < 3) {
      return { valido: false, erro: 'O nome do aluno deve conter pelo menos 3 caracteres.' };
    }
    const cpfLimpo = this.limparDigitos(dto.cpf);
    if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      return { valido: false, erro: 'O CPF informado deve conter exatamente 11 dígitos numéricos.' };
    }
    return { valido: true };
  }

  public static construirNovo(id: number, dto: CreateAlunoDTO): AlunoProps {
    const dataNasc = (dto.data_nasc || '').trim();
    return {
      id,
      nome: dto.nome.trim(),
      cpf: this.limparDigitos(dto.cpf),
      data_nasc: dataNasc,
      idade: this.calcularIdade(dataNasc),
      sexo: dto.sexo || '',
      endereco: (dto.endereco || '').trim(),
      telefone: this.limparDigitos(dto.telefone),
      email: (dto.email || '').trim(),
      responsavel: (dto.responsavel || '').trim(),
      tel_resp: this.limparDigitos(dto.tel_resp),
      turma: (dto.turma || '').trim().toUpperCase(),
      serie: dto.serie || '',
      data_matricula: dto.data_matricula || new Date().toISOString().slice(0, 10),
      turno: dto.turno || '',
    };
  }

  public static atualizarExistente(atual: AlunoProps, dto: UpdateAlunoDTO): AlunoProps {
    const dataNasc = (dto.data_nasc || '').trim();
    return {
      ...atual,
      nome: dto.nome.trim(),
      cpf: this.limparDigitos(dto.cpf),
      data_nasc: dataNasc,
      idade: this.calcularIdade(dataNasc),
      sexo: dto.sexo || '',
      endereco: (dto.endereco || '').trim(),
      telefone: this.limparDigitos(dto.telefone),
      email: (dto.email || '').trim(),
      responsavel: (dto.responsavel || '').trim(),
      tel_resp: this.limparDigitos(dto.tel_resp),
      turma: (dto.turma || '').trim().toUpperCase(),
      serie: dto.serie || '',
      data_matricula: dto.data_matricula || atual.data_matricula,
      turno: dto.turno || '',
    };
  }
}
