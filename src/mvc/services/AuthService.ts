import { UsuarioSessao } from '../models/types';

const SESSION_KEY = 'edugestao_mvc_sessao_v1';

export interface IAuthService {
  obterSessaoAtual(): UsuarioSessao;
  autenticar(email: string, senha: string): { sucesso: boolean; sessao?: UsuarioSessao; erro?: string };
  encerrarSessao(): UsuarioSessao;
}

/**
 * AuthService: Gerencia autenticação e sessão do usuário seguindo a regra
 * original de `login.php` (admin@escola.com / 123456).
 */
export class AuthService implements IAuthService {
  public obterSessaoAtual(): UsuarioSessao {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UsuarioSessao;
        if (parsed && typeof parsed.logado === 'boolean') {
          return parsed;
        }
      }
    } catch {
      // fallback default logged-in session so preview opens smoothly while allowing logout/login flow
    }
    const sessaoInicial: UsuarioSessao = {
      logado: true,
      usuario: 'Administrador',
      email: 'admin@escola.com',
      cargo: 'Diretoria Acadêmica',
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessaoInicial));
    return sessaoInicial;
  }

  public autenticar(email: string, senha: string): { sucesso: boolean; sessao?: UsuarioSessao; erro?: string } {
    const emailLimpo = (email || '').trim().toLowerCase();
    const senhaLimpa = (senha || '').trim();

    if (emailLimpo === 'admin@escola.com' && senhaLimpa === '123456') {
      const sessao: UsuarioSessao = {
        logado: true,
        usuario: 'Administrador',
        email: emailLimpo,
        cargo: 'Diretoria Acadêmica',
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
      return { sucesso: true, sessao };
    }

    return {
      sucesso: false,
      erro: 'Email ou senha incorretos. Use admin@escola.com e senha 123456.',
    };
  }

  public encerrarSessao(): UsuarioSessao {
    const deslogado: UsuarioSessao = {
      logado: false,
      usuario: '',
      email: '',
      cargo: '',
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(deslogado));
    return deslogado;
  }
}
