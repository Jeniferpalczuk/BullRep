type DashTooltipPayload = { payload: { idx: number; volume: number; durationMin: number } };

export function DashTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: DashTooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;

  const formatKg = (n: number) => `${Math.round(n).toLocaleString('pt-BR')}kg`;
  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h <= 0) return `${m}min`;
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-title">Treino #{p.idx}</div>
      <div className="dash-tooltip-sub">Carga: {formatKg(p.volume)} - Tempo: {formatDuration(p.durationMin)}</div>
    </div>
  );
}
