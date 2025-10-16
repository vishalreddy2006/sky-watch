import React from 'react';

type Weather = any;

interface Props {
  data: Weather;
  units: string;
}

const formatTemp = (t: number, units: string) =>
  units === 'imperial' ? `${Math.round(t)}°F` : `${Math.round(t)}°C`;

const AnalyzePanel: React.FC<Props> = ({ data, units }) => {
  if (!data) return null;

  // Quick trend analysis
  const current = data.current?.temp ?? null;
  const next24 = data.hourly?.slice(0, 24) ?? [];
  const maxTemp = next24.reduce((m: number, h: any) => (h.temp > m ? h.temp : m), -Infinity);
  const minTemp = next24.reduce((m: number, h: any) => (h.temp < m ? h.temp : m), Infinity);
  const avgTemp = next24.length ? Math.round(next24.reduce((s: number, h: any) => s + h.temp, 0) / next24.length) : null;
  const maxPop = next24.reduce((m: number, h: any) => (h.pop > m ? h.pop : m), 0);

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
      <h3 className="font-semibold mb-2">Quick Analysis</h3>
      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div>
          <div className="text-xs">Current</div>
          <div className="font-medium">{current !== null ? formatTemp(current, units) : '—'}</div>
        </div>
        <div>
          <div className="text-xs">24h High</div>
          <div className="font-medium">{isFinite(maxTemp) ? formatTemp(maxTemp, units) : '—'}</div>
        </div>
        <div>
          <div className="text-xs">24h Low</div>
          <div className="font-medium">{isFinite(minTemp) ? formatTemp(minTemp, units) : '—'}</div>
        </div>
        <div>
          <div className="text-xs">Avg (24h)</div>
          <div className="font-medium">{avgTemp !== null ? formatTemp(avgTemp, units) : '—'}</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <div>Max precipitation chance (24h): <span className="font-medium">{Math.round(maxPop * 100)}%</span></div>
        {maxPop >= 0.5 && <div className="text-yellow-600 mt-2">Heavy chance of rain in next 24 hours.</div>}
      </div>
    </div>
  );
};

export default AnalyzePanel;
