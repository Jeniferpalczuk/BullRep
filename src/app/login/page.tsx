'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';

import { Toast, type ToastState } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/apiClient';
import styles from './page.module.css';

const rhythmBars = [36, 58, 44, 78, 66, 92, 72];

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    const response = await signIn(email.trim(), password);
    setSubmitting(false);

    if (response.error) {
      setToast({ type: 'error', message: response.error });
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
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={styles.ambientGlow} />
        <span className={styles.ambientLine} />
        <span className={`${styles.smoke} ${styles.smokeLeft}`} />
        <span className={`${styles.smoke} ${styles.smokeRight}`} />
        <span className={`${styles.smoke} ${styles.smokeBottom}`} />
      </div>

      <section className={styles.shell} aria-labelledby="login-title">
        <aside className={styles.hero}>
          <div className={styles.heroLight} aria-hidden="true" />
          <div className={styles.heroSmoke} aria-hidden="true">
            <span />
            <span />
          </div>
          <div className={styles.heroWordmark} aria-hidden="true">BULLREP</div>

          <header className={styles.brand}>
            <div className={styles.logoCrop}>
              <Image
                className={styles.logoArtwork}
                src="/brand-source.png"
                width={1025}
                height={909}
                sizes="140px"
                alt=""
                priority
              />
            </div>
            <div className={styles.brandText}>
              <strong>BULL<span>REP</span></strong>
              <small>DOMINE A CARGA</small>
            </div>
          </header>

          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span aria-hidden="true" /> Evolua a cada treino</p>
            <h1>Volte<br /><em>mais forte.</em></h1>
            <p className={styles.heroDescription}>
              Seu histórico, seus treinos e sua evolução em um só lugar.
            </p>
          </div>

          <div className={styles.rhythmCard}>
            <div className={styles.rhythmLabel}>
              <span className={styles.rhythmIcon}><Activity size={18} aria-hidden="true" /></span>
              <span>
                <small>SEU RITMO</small>
                <strong>Constância gera resultado</strong>
              </span>
            </div>
            <div className={styles.rhythmBars} aria-hidden="true">
              {rhythmBars.map((height, index) => (
                <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formContent}>
            <div className={styles.secureLabel}>
              <ShieldCheck size={15} aria-hidden="true" />
              Acesso protegido
            </div>

            <div className={styles.formHeading}>
              <p>Bom ter você de volta</p>
              <h2 id="login-title">Entre na sua conta</h2>
              <span>Continue de onde parou e mantenha sua evolução.</span>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} aria-busy={submitting}>
              <div className={styles.field}>
                <label htmlFor="login-email">E-mail</label>
                <div className={styles.inputWrap}>
                  <Mail size={19} aria-hidden="true" />
                  <input
                    id="login-email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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

              <div className={styles.field}>
                <div className={styles.passwordLabelRow}>
                  <label htmlFor="login-password">Senha</label>
                  <button type="button" onClick={handleForgotPassword} disabled={recovering || submitting}>
                    {recovering ? 'Enviando...' : 'Esqueci minha senha'}
                  </button>
                </div>
                <div className={styles.inputWrap}>
                  <LockKeyhole size={19} aria-hidden="true" />
                  <input
                    id="login-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    minLength={6}
                    disabled={submitting}
                    required
                  />
                  <button
                    className={styles.passwordToggle}
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

              <button className={styles.submit} type="submit" disabled={!canSubmit || submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle className={styles.spinner} size={20} aria-hidden="true" />
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

            <div className={styles.divider} aria-hidden="true">
              <span />
              <small>Ainda não treina com a BullRep?</small>
              <span />
            </div>

            <button className={styles.register} type="button" onClick={() => router.push('/cadastro')}>
              Criar minha conta
            </button>

            <p className={styles.privacy}>
              Ao continuar, seus dados permanecem protegidos.
            </p>
          </div>
        </section>
      </section>

      <Toast toast={toast} onClear={() => setToast(null)} />
    </main>
  );
}
