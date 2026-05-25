'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Dumbbell, Mail, Ruler, Shield, Target, User, Weight, Dices } from 'lucide-react';

import { Toast, type ToastState } from '@/components/Toast';
import {
  FITNESS_LEVEL_OPTIONS,
  FREQUENCY_OPTIONS,
  GOAL_OPTIONS,
  type BullrepFitnessLevel,
  type BullrepFrequency,
  type BullrepGoal,
} from '@/features/profile/options';
import { useAuth } from '@/hooks/useAuth';

const STYLES = [
  { id: 'adventurer', label: 'Cartoon', img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Cartoon&skinColor=f2d3b1' },
  { id: 'notionists', label: 'Realista', img: 'https://api.dicebear.com/9.x/notionists/svg?seed=Real' },
  { id: 'pixel-art', label: 'Pixel', img: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Pixel' },
  { id: 'bottts', label: 'Robô', img: 'https://api.dicebear.com/9.x/bottts/svg?seed=BULL' },
];

type GenderOption = 'Feminino' | 'Masculino' | 'Outros';
const SKIN_COLORS = ['f2d3b1', 'd4a373', 'a67c52', '6b4c3a', '3d261e'];
type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function CadastroPage() {
  const router = useRouter();
  const { session, loading, signUpWithProfile } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Step 1: conta
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Step 2: corpo
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(165);
  const [gender, setGender] = useState<GenderOption>('Feminino');

  // Step 3: objetivo
  const [goal, setGoal] = useState<BullrepGoal>('Ganhar massa');

  // Step 4: nível/frequência
  const [fitnessLevel, setFitnessLevel] = useState<BullrepFitnessLevel>('Iniciante');
  const [frequency, setFrequency] = useState<BullrepFrequency>('3x');

  // Step 6: avatar
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarStyle, setAvatarStyle] = useState('adventurer');
  const [avatarSeed, setAvatarSeed] = useState('BULLREP');
  const [skinColor, setSkinColor] = useState('f2d3b1');

  // Update Avatar URL in Real Time
  useEffect(() => {
    let url = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${avatarSeed}`;
    
    if (avatarStyle === 'adventurer') {
      url += `&skinColor=${skinColor}`;
    } else if (avatarStyle === 'pixel-art') {
      url += `&skinColor=${skinColor}`;
    }
    
    setAvatarUrl(url);
  }, [avatarStyle, avatarSeed, skinColor]);

  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(randomSeed);
    setSkinColor(SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)]);
  };

  useEffect(() => {
    if (loading) return;
    if (session) router.replace('/');
  }, [loading, session, router]);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const passwordStrong = useMemo(() => password.length >= 8, [password]);
  const passwordsMatch = useMemo(() => password === confirm, [password, confirm]);

  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length >= 2 && emailValid && passwordStrong && passwordsMatch;
    if (step === 2) return weight >= 30 && weight <= 300 && height >= 100 && height <= 230;
    if (step === 3) return !!goal;
    if (step === 4) return !!fitnessLevel && !!frequency;
    if (step === 5) return true;
    if (step === 6) return !!avatarUrl;
    return true;
  }, [step, name, emailValid, passwordStrong, passwordsMatch, weight, height, goal, fitnessLevel, frequency, avatarUrl]);

  const bmiData = useMemo(() => {
    if (height <= 0) return null;
    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);
    const bmiRounded = Number.isFinite(bmi) ? Number(bmi.toFixed(1)) : null;

    const minIdeal = Number((18.5 * heightMeters * heightMeters).toFixed(1));
    const maxIdeal = Number((24.9 * heightMeters * heightMeters).toFixed(1));

    let category = 'Peso normal';
    let meaning = 'Seu IMC está na faixa considerada saudável.';

    if (bmiRounded == null) {
      category = 'Indisponível';
      meaning = 'Não foi possível calcular seu IMC com os dados atuais.';
    } else if (bmiRounded < 18.5) {
      category = 'Abaixo do peso';
      meaning = 'Seu IMC está abaixo da faixa ideal. Foque em ganho de massa com orientação profissional.';
    } else if (bmiRounded < 25) {
      category = 'Peso normal';
      meaning = 'Seu IMC está na faixa considerada saudável.';
    } else if (bmiRounded < 30) {
      category = 'Sobrepeso';
      meaning = 'Seu IMC está acima da faixa ideal. Ajustes de treino e nutrição podem ajudar.';
    } else {
      category = 'Obesidade';
      meaning = 'Seu IMC está bem acima da faixa ideal. É importante acompanhamento profissional.';
    }

    return {
      bmi: bmiRounded,
      category,
      meaning,
      idealRange: `${minIdeal}kg - ${maxIdeal}kg`,
    };
  }, [weight, height]);

  const next = () => setStep((s) => (Math.min(6, (s + 1)) as Step));
  const prev = () => setStep((s) => (Math.max(1, (s - 1)) as Step));

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await signUpWithProfile({
        name: name.trim(),
        email: email.trim(),
        password,
        weight,
        height,
        goal,
        fitness_level: fitnessLevel,
        frequency,
        avatar_url: avatarUrl,
      });

      if (res.error) {
        setToast({ type: 'error', message: res.error });
        return;
      }
      if (res.needsEmailConfirmation) {
        setToast({ type: 'success', message: 'Conta criada! Verifique seu e-mail para confirmar o acesso.' });
        router.replace('/login');
        return;
      }
      setToast({ type: 'success', message: 'Cadastro concluído. Bem-vinda ao BULLREP.' });
      router.replace('/');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro inesperado ao criar conta.';
      setToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg" />

      <div className="auth-card card-premium">
        <div className="auth-brand">
          <div className="auth-logo">BULL<span>REP</span></div>
          <div className="auth-badge">
            <Shield size={14} />
            Cadastro seguro
          </div>
        </div>

        <div className="auth-steps">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className={`auth-step ${step === n ? 'active' : step > n ? 'done' : ''}`}>
              {step > n ? <CheckCircle2 size={14} /> : n}
            </div>
          ))}
        </div>

        <div className="auth-step-head">
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">
            {step === 1 && 'Etapa 1 • Conta'}
            {step === 2 && 'Etapa 2 • Dados corporais'}
            {step === 3 && 'Etapa 3 • Objetivo'}
            {step === 4 && 'Etapa 4 • Nível e frequência'}
            {step === 5 && 'Etapa 5 • Resumo final'}
            {step === 6 && 'Etapa 6 • Personalização do Avatar'}
          </p>
        </div>

        {step === 1 && (
          <div className="auth-pane">
            <label className="auth-field">
              <span>Nome de atleta</span>
              <div className="auth-input">
                <User size={16} />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" autoComplete="name" />
              </div>
            </label>
            <label className="auth-field">
              <span>E-mail</span>
              <div className="auth-input">
                <Mail size={16} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" type="email" autoComplete="email" />
              </div>
              {!emailValid && email.length > 0 && <p className="auth-error">Digite um e-mail válido.</p>}
            </label>
            <div className="auth-grid2">
              <label className="auth-field">
                <span>Senha</span>
                <div className="auth-input">
                  <Shield size={16} />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 8 caracteres" type="password" autoComplete="new-password" />
                </div>
                {!passwordStrong && password.length > 0 && <p className="auth-error">Use pelo menos 8 caracteres.</p>}
              </label>
              <label className="auth-field">
                <span>Confirmar senha</span>
                <div className="auth-input">
                  <Shield size={16} />
                  <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="repita a senha" type="password" autoComplete="new-password" />
                </div>
                {confirm.length > 0 && !passwordsMatch && <p className="auth-error">As senhas não coincidem.</p>}
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="auth-pane">
            <label className="auth-field">
              <span>Gênero</span>
              <div className="auth-chip-row">
                {(['Feminino', 'Masculino', 'Outros'] as GenderOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`auth-chip ${gender === option ? 'active' : ''}`}
                    onClick={() => setGender(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </label>

            <div className="auth-grid2">
              <label className="auth-field">
                <span>Peso (kg)</span>
                <div className="auth-input">
                  <Weight size={16} />
                  <input value={weight} onChange={(e) => setWeight(Number(e.target.value || 0))} type="number" min={30} max={300} />
                </div>
              </label>
              <label className="auth-field">
                <span>Altura (cm)</span>
                <div className="auth-input">
                  <Ruler size={16} />
                  <input value={height} onChange={(e) => setHeight(Number(e.target.value || 0))} type="number" min={100} max={230} />
                </div>
              </label>
            </div>

            {bmiData && (
              <div className="auth-summary card" style={{ marginTop: '6px' }}>
                <p className="auth-summary-kicker">Composição corporal</p>
                <div className="auth-summary-row"><span>Seu IMC</span><strong>{bmiData.bmi}</strong></div>
                <div className="auth-summary-row"><span>Classificação</span><strong>{bmiData.category}</strong></div>
                <div className="auth-summary-row"><span>Peso ideal (faixa)</span><strong>{bmiData.idealRange}</strong></div>
                <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.72)', fontSize: '0.82rem', lineHeight: 1.35 }}>
                  {bmiData.meaning}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="auth-pane">
            <div className="auth-choice-grid">
              {GOAL_OPTIONS.map((g) => (
                <button key={g} type="button" className={`auth-choice ${goal === g ? 'active' : ''}`} onClick={() => setGoal(g)}>
                  <Target size={18} />
                  <div>
                    <p className="auth-choice-title">{g}</p>
                    <p className="auth-choice-sub">Plano personalizado no dashboard</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="auth-pane">
            <div className="auth-grid2">
              <div className="auth-field">
                <span>Nível</span>
                <div className="auth-chip-row">
                  {FITNESS_LEVEL_OPTIONS.map((l) => (
                    <button key={l} type="button" className={`auth-chip ${fitnessLevel === l ? 'active' : ''}`} onClick={() => setFitnessLevel(l)}>
                      <Dumbbell size={16} />
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="auth-field">
                <span>Dias por semana</span>
                <div className="auth-chip-row">
                  {FREQUENCY_OPTIONS.map((f) => (
                    <button key={f} type="button" className={`auth-chip ${frequency === f ? 'active' : ''}`} onClick={() => setFrequency(f)}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="auth-pane">
            <div className="auth-summary card">
              <p className="auth-summary-kicker">Resumo do cadastro</p>
              <div className="auth-summary-row"><span>Nome</span><strong>{name || '—'}</strong></div>
              <div className="auth-summary-row"><span>E-mail</span><strong>{email || '—'}</strong></div>
              <div className="auth-summary-row"><span>Peso</span><strong>{weight}kg</strong></div>
              <div className="auth-summary-row"><span>Altura</span><strong>{height}cm</strong></div>
              <div className="auth-summary-row"><span>Gênero</span><strong>{gender}</strong></div>
              {bmiData && (
                <>
                  <div className="auth-summary-row"><span>IMC</span><strong>{bmiData.bmi}</strong></div>
                  <div className="auth-summary-row"><span>Peso ideal</span><strong>{bmiData.idealRange}</strong></div>
                  <div className="auth-summary-row"><span>Significado</span><strong>{bmiData.category}</strong></div>
                </>
              )}
              <div className="auth-summary-row"><span>Objetivo</span><strong>{goal}</strong></div>
              <div className="auth-summary-row"><span>Nível</span><strong>{fitnessLevel}</strong></div>
              <div className="auth-summary-row"><span>Frequência</span><strong>{frequency}</strong></div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="auth-pane">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)', gap: '28px', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, marginBottom: '12px', color: 'rgba(255,255,255,0.55)' }}>ESTILO</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                  {STYLES.map(st => (
                    <button key={st.id} onClick={() => setAvatarStyle(st.id)} style={{ minHeight: '98px', padding: '14px 10px', borderRadius: '18px', border: `1px solid ${avatarStyle === st.id ? '#e8001d' : 'rgba(255,255,255,0.08)'}`, background: avatarStyle === st.id ? 'rgba(232,0,29,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <img src={st.img} alt={st.label} style={{ width: '36px', height: '36px' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: avatarStyle === st.id ? '#fff' : 'rgba(255,255,255,0.65)' }}>{st.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>PELE</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {SKIN_COLORS.map(color => (
                      <button key={color} onClick={() => setSkinColor(color)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: `#${color}`, border: `2px solid ${skinColor === color ? '#e8001d' : 'transparent'}`, cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', minHeight: '100%' }}>
                <div style={{ width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,0,29,0.15) 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid rgba(232,0,29,0.2)', overflow: 'hidden', boxShadow: '0 18px 50px rgba(0,0,0,0.45)' }}>
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <button onClick={handleRandomize} style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Dices size={16} /> ALEATÓRIO
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="auth-actions">
          <button type="button" className="btn-ghost" onClick={step === 1 ? () => router.push('/login') : prev} style={{ padding: '14px 16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <ArrowLeft size={18} /> Voltar
            </span>
          </button>

          {step < 6 ? (
            <button type="button" className="btn-primary" disabled={!canNext} onClick={next} style={{ flex: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                Continuar <ArrowRight size={18} />
              </span>
            </button>
          ) : (
            <button type="button" className="btn-primary" disabled={!canNext || submitting} onClick={handleFinish} style={{ flex: 1 }}>
              {submitting ? 'CRIANDO...' : 'Concluir cadastro'}
            </button>
          )}
        </div>

        <div className="auth-links" style={{ marginTop: '14px' }}>
          <span className="auth-hint">Já tem conta?</span>
          <button type="button" className="auth-link" onClick={() => router.push('/login')}>Entrar</button>
        </div>
      </div>

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
