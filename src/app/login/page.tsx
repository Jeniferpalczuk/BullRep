'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarCheck,
  Dumbbell,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Toast, type ToastState } from '@/components/Toast';
import { apiRequest } from '@/lib/apiClient';

const loginBenefits = [
  {
    icon: CalendarCheck,
    title: 'Semana organizada',
    description: 'Veja o que já treinou e planeje o próximo passo.',
  },
  {
    icon: TrendingUp,
    title: 'Evolução visível',
    description: 'Acompanhe seu histórico e mantenha a constância.',
  },
  {
    icon: Dumbbell,
    title: 'Foco no treino',
    description: 'Seu progresso reunido em um só lugar.',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { session, loading, signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (loading) return;
    if (session) router.replace('/');
  }, [loading, session, router]);

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 6, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    const res = await signIn(email.trim(), password);
    setSubmitting(false);

    if (res.error) {
      setToast({ type: 'error', message: res.error });
      return;
    }

    setToast({ type: 'success', message: 'Boas-vindas de volta. Vamos treinar.' });
    router.replace('/');
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setToast({ type: 'error', message: 'Digite seu e-mail para recuperar a senha.' });
      return;
    }

    setRecovering(true);
    try {
      await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail }),
      });
      setToast({ type: 'success', message: 'Enviamos uma nova senha para seu e-mail.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível recuperar a senha.',
      });
    } finally {
      setRecovering(false);
    }
  };

  return (
    <main className="auth-shell login-shell">
      <div className="auth-bg login-background" aria-hidden="true">
        <span className="login-background-ring login-background-ring-one" />
        <span className="login-background-ring login-background-ring-two" />
      </div>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-visual">
          <header className="login-brand-row">
            <div className="login-brand" aria-label="BullRep">
              <span className="login-brand-mark" aria-hidden="true">B</span>
              <span className="login-brand-name">BULL<span>REP</span></span>
            </div>

            <div className="login-security-badge">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>Ambiente seguro</span>
            </div>
          </header>

          <div className="login-hero-copy">
            <p className="login-eyebrow">Treino, foco e evolução</p>
            <h2>Seu progresso não para.</h2>
            <p>
              Registre cada treino, acompanhe sua evolução e mantenha sua semana no ritmo.
            </p>
          </div>

          <div className="login-benefit-list" aria-label="Benefícios da BullRep">
            {loginBenefits.map(({ icon: Icon, title, description }) => (
              <div className="login-benefit" key={title}>
                <span className="login-benefit-icon" aria-hidden="true">
                  <Icon size={19} strokeWidth={2.2} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </div>
            ))}
          </div>

          <p className="login-visual-footer">
            <span aria-hidden="true" />
            Constância hoje. Resultado amanhã.
          </p>
        </div>

        <div className="login-form-panel">
          <div className="login-form-heading">
            <p className="login-mobile-eyebrow">Sua evolução continua aqui</p>
            <h1 id="login-title">Entre na sua conta</h1>
            <p>Continue de onde parou e mantenha o foco na sua meta.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} aria-busy={submitting}>
            <div className="login-field">
              <label htmlFor="login-email">E-mail</label>
              <div className="login-input">
                <Mail size={19} aria-hidden="true" />
                <input
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Senha</label>
              <div className="login-input">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  minLength={6}
                  disabled={submitting}
                  required
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="login-form-help">
              <span>Use os mesmos dados do cadastro.</span>
              <button type="button" onClick={handleForgotPassword} disabled={recovering || submitting}>
                {recovering ? 'Enviando...' : 'Esqueci minha senha'}
              </button>
            </div>

            <button className="login-submit" type="submit" disabled={!canSubmit || submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="login-spinner" size={20} aria-hidden="true" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={20} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="login-divider" aria-hidden="true">
            <span />
            <small>Novo por aqui?</small>
            <span />
          </div>

          <button className="login-register" type="button" onClick={() => router.push('/cadastro')}>
            Criar minha conta
          </button>

          <p className="login-privacy">
            <ShieldCheck size={15} aria-hidden="true" />
            Seus dados e sua evolução ficam protegidos.
          </p>
        </div>
      </section>

      <Toast toast={toast} onClear={() => setToast(null)} />
    </main>
  );
}
