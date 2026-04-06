import { useState, useMemo } from "react";
import { useLocation } from "wouter";

interface WeatherConfig {
  fogDensity: number;
  fogDensityMin: number;
  rainIntensity: number;
  rainThreshold: number;
  windSpeed: number;
  overcast: number;
  overcastMin: number;
  stormFrequency: number;
  stormDuration: number;
  snowflakeIntensity: number;
}

const PRESETS: Record<string, WeatherConfig> = {
  Vanilla:  { fogDensity:0.05, fogDensityMin:0.0, rainIntensity:0.05, rainThreshold:0.5, windSpeed:0.5, overcast:0.5, overcastMin:0.0, stormFrequency:0.1, stormDuration:0.1, snowflakeIntensity:0.0 },
  Clear:    { fogDensity:0.0,  fogDensityMin:0.0, rainIntensity:0.0,  rainThreshold:1.0, windSpeed:0.2, overcast:0.1, overcastMin:0.0, stormFrequency:0.0, stormDuration:0.0, snowflakeIntensity:0.0 },
  Overcast: { fogDensity:0.1,  fogDensityMin:0.0, rainIntensity:0.02, rainThreshold:0.4, windSpeed:0.4, overcast:0.9, overcastMin:0.5, stormFrequency:0.1, stormDuration:0.1, snowflakeIntensity:0.0 },
  Stormy:   { fogDensity:0.15, fogDensityMin:0.0, rainIntensity:0.5,  rainThreshold:0.3, windSpeed:0.9, overcast:1.0, overcastMin:0.7, stormFrequency:0.5, stormDuration:0.5, snowflakeIntensity:0.0 },
  Foggy:    { fogDensity:0.9,  fogDensityMin:0.4, rainIntensity:0.0,  rainThreshold:1.0, windSpeed:0.1, overcast:0.6, overcastMin:0.3, stormFrequency:0.0, stormDuration:0.0, snowflakeIntensity:0.0 },
  Blizzard: { fogDensity:0.4,  fogDensityMin:0.2, rainIntensity:0.0,  rainThreshold:1.0, windSpeed:0.8, overcast:1.0, overcastMin:0.8, stormFrequency:0.3, stormDuration:0.3, snowflakeIntensity:0.9 },
};

function Slider({ label, value, onChange, min=0, max=1, step=0.01 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-[#5a8a5a]">{label}</span>
        <span className="text-[#b8d4b8] font-bold">{value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-[#3498db]" />
    </div>
  );
}

export default function DankWeatherGenerator() {
  const [, navigate] = useLocation();
  const [cfg, setCfg] = useState<WeatherConfig>(PRESETS.Vanilla);
  const [showHow, setShowHow] = useState(false);

  const set = (k: keyof WeatherConfig) => (v: number) => setCfg(prev => ({ ...prev, [k]: v }));

  const xml = useMemo(() => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<weather>
  <fog>
    <density>${cfg.fogDensity.toFixed(3)}</density>
    <density_min>${cfg.fogDensityMin.toFixed(3)}</density_min>
  </fog>
  <rain>
    <intensity>${cfg.rainIntensity.toFixed(3)}</intensity>
    <threshold>${cfg.rainThreshold.toFixed(3)}</threshold>
  </rain>
  <wind>
    <speed>${cfg.windSpeed.toFixed(3)}</speed>
  </wind>
  <overcast>
    <value>${cfg.overcast.toFixed(3)}</value>
    <min>${cfg.overcastMin.toFixed(3)}</min>
  </overcast>
  <storm>
    <frequency>${cfg.stormFrequency.toFixed(3)}</frequency>
    <duration>${cfg.stormDuration.toFixed(3)}</duration>
  </storm>
  <snowflakes>
    <intensity>${cfg.snowflakeIntensity.toFixed(3)}</intensity>
  </snowflakes>
</weather>`, [cfg]);

  function download() {
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([xml], { type: "text/xml" })), download: "cfgweather.xml" });
    a.click();
  }

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#3498db] font-black text-[13px] tracking-widest">🌦 DANKWEATHER GENERATOR</span>
        <div className="ml-auto flex gap-2">
          <button onClick={download} className="px-3 py-1 bg-[#3498db] text-white text-[10px] font-bold rounded hover:bg-[#5dade2]">⬇ EXPORT cfgweather.xml</button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-72 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-4 overflow-y-auto">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden mb-4">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0c1510] text-[10px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-3 py-2 text-[9px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Pick a preset or adjust sliders manually.</p>
                <p>2. The XML preview updates live on the right.</p>
                <p>3. Click Export to download cfgweather.xml.</p>
                <p>4. Upload to your mission root folder on Nitrado.</p>
                <p>5. Values are 0.0–1.0 (0 = none, 1 = maximum).</p>
              </div>
            )}
          </div>
          <div className="text-[10px] text-[#5a8a5a] font-bold mb-3 tracking-widest">PRESETS</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {Object.keys(PRESETS).map(p => (
              <button key={p} onClick={() => setCfg(PRESETS[p])} className="px-2 py-1 text-[10px] font-bold rounded border border-[#1a2e1a] text-[#5a8a5a] hover:border-[#3498db] hover:text-[#3498db]">{p}</button>
            ))}
          </div>
          <div className="text-[10px] text-[#5a8a5a] font-bold mb-3 tracking-widest">SETTINGS</div>
          <Slider label="Fog Density" value={cfg.fogDensity} onChange={set("fogDensity")} />
          <Slider label="Fog Density Min" value={cfg.fogDensityMin} onChange={set("fogDensityMin")} />
          <Slider label="Rain Intensity" value={cfg.rainIntensity} onChange={set("rainIntensity")} />
          <Slider label="Rain Threshold" value={cfg.rainThreshold} onChange={set("rainThreshold")} />
          <Slider label="Wind Speed" value={cfg.windSpeed} onChange={set("windSpeed")} />
          <Slider label="Overcast" value={cfg.overcast} onChange={set("overcast")} />
          <Slider label="Overcast Min" value={cfg.overcastMin} onChange={set("overcastMin")} />
          <Slider label="Storm Frequency" value={cfg.stormFrequency} onChange={set("stormFrequency")} />
          <Slider label="Storm Duration" value={cfg.stormDuration} onChange={set("stormDuration")} />
          <Slider label="Snowflake Intensity" value={cfg.snowflakeIntensity} onChange={set("snowflakeIntensity")} />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">PREVIEW — cfgweather.xml</div>
          <textarea readOnly value={xml} className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[11px] font-mono p-4 resize-none border-0 outline-none leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
