import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { useControllers } from '../container/DIContainer';
import { UsuarioSessao } from '../models/types';

interface LoginViewProps {
  onLoginSuccess: (sessao: UsuarioSessao) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { authController } = useControllers();
  const [email, setEmail] = useState('admin@escola.com');
  const [senha, setSenha] = useState('123456');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const resultado = authController.login(email, senha);
    if (resultado.sucesso && resultado.sessao) {
      onLoginSuccess(resultado.sessao);
    } else {
      setErro(resultado.erro || 'Credenciais inválidas.');
    }
  };

  const preencherCredenciaisDemo = () => {
    setEmail('admin@escola.com');
    setSenha('123456');
    setErro('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            EduGestão
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistema de Gestão Escolar · Arquitetura MVC &amp; DI
          </p>
        </div>

        {erro && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700"
          >
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Institucional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@escola.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-900 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Credencial padrão: admin@escola.com / 123456</span>
          <button
            type="button"
            onClick={preencherCredenciaisDemo}
            className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900 underline cursor-pointer whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Preencher
          </button>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-400">
          Desenvolvido por: EDCLECIO · Refatoração MVC &amp; Clean Code
        </footer>
      </div>
    </div>
  );
};
