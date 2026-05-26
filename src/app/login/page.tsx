'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Toast, type ToastState } from '@/components/Toast';
import { apiRequest } from '@/lib/apiClient';

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
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await signIn(email.trim(), password);
    setSubmitting(false);

    if (res.error) {
      setToast({ type: 'error', message: res.error });
      return;
    }
    setToast({ type: 'success', message: 'Bem-vinda de volta. Vamos treinar.' });
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
        message: error instanceof Error ? error.message : 'Nao foi possivel recuperar a senha.',
      });
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg" />

      <div className="auth-card card-premium auth-login-card" style={{ maxWidth: '980px', padding: '0', overflow: 'hidden' }}>
        <div className="auth-login-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' }}>
          <div className="auth-login-hero" style={{ padding: '30px 26px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'radial-gradient(620px 260px at 15% 0%, rgba(232,0,29,0.18), transparent 62%), rgba(12,12,12,0.86)' }}>
            <div className="auth-brand" style={{ marginBottom: '16px' }}>
              <div className="auth-logo">BULL<span>REP</span></div>
              <div className="auth-badge">
                <Shield size={14} />
                Sessão protegida
              </div>
            </div>

            <h2 style={{ fontSize: '1.9rem', fontWeight: 950, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Treine com consistência.</h2>
            <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.72)', fontWeight: 600 }}>
              Acompanhe progresso, histórico e metas de forma prática e profissional.
            </p>

            <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
              {[
                'Histórico completo de treinos',
                'Dashboard com evolução semanal',
                'Planejamento por grupo muscular',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '10px 12px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: 'var(--red-primary)', boxShadow: '0 0 14px rgba(232,0,29,0.35)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-login-form" style={{ padding: '30px 26px' }}>
            <h1 className="auth-title" style={{ marginTop: 0 }}>Entrar</h1>
            <p className="auth-subtitle">Acesse seu dashboard e continue evoluindo.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' }}>
              <label className="auth-field">
                <span>E-mail</span>
                <div className="auth-input">
                  <Mail size={16} />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" type="email" autoComplete="email" />
                </div>
              </label>

              <label className="auth-field">
                <span>Senha</span>
                <div className="auth-input">
                  <Lock size={16} />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type={showPassword ? 'text' : 'password'} autoComplete="current-password" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.72)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <button
                type="button"
                className="auth-link"
                style={{ alignSelf: 'flex-end', marginTop: '-2px' }}
                onClick={handleForgotPassword}
                disabled={recovering}
              >
                {recovering ? 'Enviando...' : 'Esqueci minha senha'}
              </button>

              <button className="btn-primary" type="submit" disabled={!canSubmit || submitting} style={{ width: '100%', marginTop: '6px' }}>
                {submitting ? 'ENTRANDO...' : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    Entrar <ArrowRight size={18} />
                  </span>
                )}
              </button>

              <div className="auth-links">
                <button type="button" className="auth-link" onClick={() => router.push('/cadastro')}>
                  Criar conta
                </button>
                <span className="auth-sep">•</span>
                <span className="auth-hint">Acesso social em breve</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
