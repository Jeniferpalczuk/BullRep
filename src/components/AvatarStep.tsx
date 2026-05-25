'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Dices, Shield, CheckCircle2,
  Minus, Glasses, HardHat, Headphones
} from 'lucide-react';

const STYLES = [
  { id: 'adventurer', label: 'Cartoon', img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Cartoon&skinColor=f2d3b1' },
  { id: 'notionists', label: 'Realista', img: 'https://api.dicebear.com/9.x/notionists/svg?seed=Real' },
  { id: 'pixel-art', label: 'Pixel', img: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Pixel' },
  { id: 'bottts', label: 'Robô', img: 'https://api.dicebear.com/9.x/bottts/svg?seed=BULL' },
];

const SKIN_COLORS = ['f2d3b1', 'd4a373', 'a67c52', '6b4c3a', '3d261e'];
const HAIR_COLORS = ['000000', '4a3123', 'e8c37d', 'a0a0a0'];
export default function AvatarStep() {
  const [style, setStyle] = useState('adventurer');
  const [seed, setSeed] = useState('BULLREP');
  const [skinColor, setSkinColor] = useState(SKIN_COLORS[0]);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
  const [accessory, setAccessory] = useState('none');
  const avatarUrl = React.useMemo(() => {
    let url = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;

    if (style === 'adventurer') {
      url += `&skinColor=${skinColor}&hairColor=${hairColor}`;
      if (accessory === 'glasses') url += '&glassesProbability=100';
    } else if (style === 'pixel-art') {
      url += `&skinColor=${skinColor}`;
    }

    return url;
  }, [style, seed, skinColor, hairColor, accessory]);

  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setSeed(randomSeed);
    setSkinColor(SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)]);
    setHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)]);
  };

  const handleFinish = () => {
    const avatarConfig = {
      style,
      seed,
      skinColor,
      accessory
    };
    console.log('Salvando no backend:', { avatar_url: avatarUrl, avatar_config: avatarConfig });
    alert('Cadastro concluído com sucesso!');
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg" />

      <div className="auth-card card-premium" style={{ maxWidth: '840px', padding: '32px' }}>
        <div className="auth-brand">
          <div className="auth-logo">BULL<span style={{ color: '#e8001d' }}>REP</span></div>
          <div className="auth-badge">
            <Shield size={14} />
            Cadastro seguro
          </div>
        </div>

        <div className="auth-steps">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className={`auth-step ${n === 6 ? 'active' : 'done'}`} style={{ height: '38px', borderRadius: '16px' }}>
              {n < 6 ? <CheckCircle2 size={16} /> : n}
            </div>
          ))}
        </div>

        <div className="auth-step-head" style={{ marginTop: '24px', marginBottom: '24px' }}>
          <h1 className="auth-title">Criar seu avatar</h1>
          <p className="auth-subtitle">Etapa 6 • Personalização</p>
        </div>

        {/* 2-Column Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', marginTop: '32px' }}>

          {/* LADO ESQUERDO */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>
              ESCOLHA UM ESTILO
            </h4>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              {STYLES.map(st => (
                <button
                  key={st.id}
                  onClick={() => setStyle(st.id)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: '16px',
                    border: `1px solid ${style === st.id ? '#e8001d' : 'rgba(255,255,255,0.08)'}`,
                    background: style === st.id ? 'rgba(232,0,29,0.08)' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {style === st.id && (
                    <div style={{ position: 'absolute', top: 6, left: 6, background: '#e8001d', borderRadius: '50%', padding: '2px', color: '#fff' }}>
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                  <img src={st.img} alt={st.label} style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: style === st.id ? 800 : 600, color: style === st.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                    {st.label}
                  </span>
                </button>
              ))}
            </div>

            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>
              PERSONALIZE SEU AVATAR
            </h4>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Cor de pele</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {SKIN_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSkinColor(color)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: `#${color}`,
                      border: `2px solid ${skinColor === color ? '#e8001d' : 'transparent'}`,
                      boxShadow: skinColor === color ? '0 0 0 2px rgba(232,0,29,0.3)' : 'none',
                      cursor: 'pointer',
                      display: 'grid', placeItems: 'center'
                    }}
                  >
                    {skinColor === color && <CheckCircle2 size={16} color={['f2d3b1', 'e1b896'].includes(color) ? '#000' : '#fff'} />}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Cor do cabelo</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {HAIR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setHairColor(color)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: `#${color}`,
                      border: `2px solid ${hairColor === color ? '#e8001d' : 'transparent'}`,
                      boxShadow: hairColor === color ? '0 0 0 2px rgba(232,0,29,0.3)' : 'none',
                      cursor: 'pointer',
                      display: 'grid', placeItems: 'center'
                    }}
                  >
                    {hairColor === color && <CheckCircle2 size={14} color={color === 'e8c37d' || color === 'a0a0a0' ? '#000' : '#fff'} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Acessórios Opcionais</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { id: 'none', label: 'Nenhum', icon: Minus },
                  { id: 'glasses', label: 'Óculos', icon: Glasses },
                  { id: 'cap', label: 'Boné', icon: HardHat },
                  { id: 'headphones', label: 'Fone', icon: Headphones },
                ].map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => setAccessory(acc.id)}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: '14px',
                      background: accessory === acc.id ? 'rgba(232,0,29,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${accessory === acc.id ? '#e8001d' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <acc.icon size={20} color={accessory === acc.id ? '#e8001d' : 'rgba(255,255,255,0.55)'} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: accessory === acc.id ? '#fff' : 'rgba(255,255,255,0.55)' }}>
                      {acc.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LADO DIREITO (Prévias) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>
              PRÉVIA
            </h4>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px'
            }}>

              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(232,0,29,0.15) 0%, rgba(0,0,0,0.5) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(232,0,29,0.2)',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                  <img
                    src={avatarUrl}
                    alt="Avatar Em Tempo Real"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              <button
                onClick={handleRandomize}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <Dices size={18} />
                Gerar aleatório
              </button>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="auth-actions" style={{ marginTop: '32px' }}>
          <button type="button" className="btn-ghost" style={{ padding: '14px 20px', borderRadius: '16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={18} /> Voltar
            </span>
          </button>

          <button onClick={handleFinish} type="button" className="btn-primary" style={{ flex: 1, padding: '14px 24px', borderRadius: '16px', background: '#e8001d' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ffffff' }}>
              CONCLUIR CADASTRO <ArrowRight size={18} />
            </span>
          </button>
        </div>

        <div className="auth-links" style={{ marginTop: '20px' }}>
          <span className="auth-hint">Já tem conta?</span>
          <button type="button" className="auth-link">Entrar</button>
        </div>

      </div>
    </div>
  );
}
