import { useState, useMemo, useCallback, Suspense } from "react";
import { getShapePoints } from "@/lib/shapeGenerators";
import ZonePreview3D from "@/ZonePreview3D";
import type { ZoneObject } from "@/ZonePreview3D";
import {
  THEMES, SIZE_DEFAULTS,
  buildObjectsJson, buildPraJson, buildSetupText,
  type PadConfig, type TeleportTheme, type SizeMode,
} from "@/lib/teleportData";

function rng(seed: number) {
  let s = seed;
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xFFFFFFFF; };
}
function randomSeed() { return Math.floor(Math.random() * 0xFFFFFF) + 1; }
function copyText(t: string) { navigator.clipboard.writeText(t).catch(() => {}); }
function downloadFile(content: string, filename: string) {
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([content], { type: "text/plain" })),
    download: filename,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}
function makeAreaName(theme: TeleportTheme, pad: string) {
  return `DankTeleport_${theme}_Pad${pad}`;
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="text-[9px] text-[#3a6a3a] mb-0.5">{label}</div>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-1.5 py-1 rounded font-mono" />
    </div>
  );
}

type OutputTab = "objects" | "pra" | "setup";

function PadOutput({ cfg, padLabel, hasReturnPad }: { cfg: PadConfig; padLabel: string; hasReturnPad: boolean }) {
  const [tab, setTab] = useState<OutputTab>("objects");
  const theme = THEMES.find(t => t.key === cfg.theme)!;
  const areaName = makeAreaName(cfg.theme, padLabel);

  const points = useMemo(() => {
    const r = rng(cfg.seed);
    return getShapePoints(theme.shape, {
      scale: 1, padRadius: cfg.padRadius,
      radius: cfg.padRadius * 0.9,
      columnCount: 4 + Math.round(r() * 4),
      ringDiameter: cfg.padRadius * 1.8,
      stones: 6 + Math.round(r() * 4),
    });
  }, [cfg.seed, cfg.padRadius, theme.shape]);

  const objectsJson = useMemo(() => buildObjectsJson(points, theme.suggestedClass, cfg.posX, cfg.posY, cfg.posZ, padLabel), [points, theme.suggestedClass, cfg.posX, cfg.posY, cfg.posZ, padLabel]);
  const praJson = useMemo(() => buildPraJson(cfg.padRadius, cfg.posX, cfg.posY, cfg.posZ, cfg.destX, cfg.destY, cfg.destZ, areaName), [cfg, areaName]);
  const setupText = useMemo(() => buildSetupText(padLabel, areaName, cfg.padRadius, cfg.posX, cfg.posY, cfg.posZ, cfg.destX, cfg.destY, cfg.destZ, hasReturnPad), [padLabel, areaName, cfg, hasReturnPad]);

  const content = tab === "objects" ? objectsJson : tab === "pra" ? praJson : setupText;
  const filename = tab === "objects" ? `${areaName}_objects.json` : tab === "pra" ? `${areaName}_pra.json` : `${areaName}_setup.txt`;

  const TABS: { key: OutputTab; label: string; col: string }[] = [
    { key: "objects", label: "OBJECTS", col: "#27ae60" },
    { key: "pra",     label: "PRA",     col: "#3498db" },
    { key: "setup",   label: "SETUP",   col: "#f39c12" },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 flex border-b border-[#1a2e1a] bg-[#0c1510]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-3 py-1.5 text-[10px] font-bold border-r border-[#1a2e1a] transition-colors"
            style={tab === t.key ? { backgroundColor: t.col + "33", color: t.col } : { color: "#3a6a3a" }}>
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 px-2">
          <button onClick={() => copyText(content)} className="px-2 py-0.5 text-[9px] font-bold rounded border border-[#1a2e1a] text-[#5a8a5a] hover:border-[#27ae60] hover:text-[#27ae60]">COPY</button>
          <button onClick={() => downloadFile(content, filename)} className="px-2 py-0.5 text-[9px] font-bold rounded bg-[#27ae60] text-[#080f09] hover:bg-[#2ecc71]">⬇ {filename.split(".").pop()?.toUpperCase()}</button>
        </div>
      </div>
      <div className="shrink-0 px-3 py-1 bg-[#0a1209] border-b border-[#1a2e1a] text-[8px] text-[#3a6a3a]">
        {tab === "objects" && `objectSpawnersArr JSON · ${points.length} objects · upload to custom/ folder`}
        {tab === "pra" && `playerRestrictedAreaFiles JSON · ${(cfg.padRadius * 2).toFixed(1)}m × 3m × ${(cfg.padRadius * 2).toFixed(1)}m trigger · PC + console`}
        {tab === "setup" && "Step-by-step setup for Nitrado console and PC servers"}
      </div>
      <textarea readOnly value={content}
        className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[9px] font-mono p-2 resize-none border-0 outline-none leading-relaxed"
        spellCheck={false} />
    </div>
  );
}

function defaultPad(theme: TeleportTheme = "scifi", sizeMode: SizeMode = "medium"): PadConfig {
  return { theme, sizeMode, padRadius: SIZE_DEFAULTS[sizeMode], seed: randomSeed(), posX: 7200, posY: 0, posZ: 2400, destX: 7300, destY: 0, destZ: 2500 };
}

export default function TeleportMaker() {
  const [activePad, setActivePad] = useState<"A" | "B">("A");
  const [padA, setPadA] = useState<PadConfig>(defaultPad());
  const [padB, setPadB] = useState<PadConfig | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  function exportAllJSON() {
    const pads: Array<{ cfg: PadConfig; label: string }> = [{ cfg: padA, label: "A" }];
    if (padB) pads.push({ cfg: padB, label: "B" });
    for (const { cfg, label } of pads) {
      const r = rng(cfg.seed);
      const theme = THEMES.find(t => t.key === cfg.theme)!;
      const pts = getShapePoints(theme.shape, {
        scale: 1, padRadius: cfg.padRadius,
        radius: cfg.padRadius * 0.9,
        columnCount: 4 + Math.round(r() * 4),
        ringDiameter: cfg.padRadius * 1.8,
        stones: 6 + Math.round(r() * 4),
      });
      const areaName = makeAreaName(cfg.theme, label);
      downloadFile(buildObjectsJson(pts, theme.suggestedClass, cfg.posX, cfg.posY, cfg.posZ, label), `${areaName}_objects.json`);
      downloadFile(buildPraJson(cfg.padRadius, cfg.posX, cfg.posY, cfg.posZ, cfg.destX, cfg.destY, cfg.destZ, areaName), `${areaName}_pra.json`);
    }
  }

  const cfg = activePad === "A" ? padA : (padB ?? padA);
  const setCfg = useCallback((patch: Partial<PadConfig>) => {
    if (activePad === "A") setPadA(p => ({ ...p, ...patch }));
    else setPadB(p => p ? { ...p, ...patch } : null);
  }, [activePad]);

  const theme = THEMES.find(t => t.key === cfg.theme)!;
  const samePos = cfg.posX === cfg.destX && cfg.posY === cfg.destY && cfg.posZ === cfg.destZ;
  const destAtZero = cfg.destY === 0 && !samePos;

  const objects3D = useMemo((): ZoneObject[] => {
    const r = rng(cfg.seed);
    const pts = getShapePoints(theme.shape, {
      scale: 1, padRadius: cfg.padRadius,
      radius: cfg.padRadius * 0.9,
      columnCount: 4 + Math.round(r() * 4),
      ringDiameter: cfg.padRadius * 1.8,
      stones: 6 + Math.round(r() * 4),
    });
    return pts.map(p => ({ type: theme.suggestedClass, x: p.x, y: p.y, z: p.z, yaw: 0, w: 0.8, h: 1.2, d: 0.8, color: theme.color }));
  }, [cfg.seed, cfg.padRadius, theme]);

  function toggleReturnPad(on: boolean) {
    if (on) {
      setPadB({ ...padA, seed: randomSeed(), posX: padA.destX, posY: padA.destY, posZ: padA.destZ, destX: padA.posX, destY: padA.posY, destZ: padA.posZ });
      setActivePad("B");
    } else { setPadB(null); setActivePad("A"); }
  }

  function setSizeMode(mode: SizeMode) {
    const newTheme = mode !== "event" && cfg.theme === "event_mega" ? "scifi" : cfg.theme;
    setCfg({ sizeMode: mode, padRadius: SIZE_DEFAULTS[mode], theme: newTheme as TeleportTheme });
  }

  const availableThemes = THEMES.filter(t => !t.eventOnly || cfg.sizeMode === "event");

  return (
    <div className="flex flex-col h-full bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">

      {/* Header */}
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-2 flex-wrap">
        <span className="text-[#27ae60] text-lg font-black">⚡</span>
        <span className="text-[9px] text-[#3a6a3a] font-bold tracking-widest">DANK'S DAYZ STUDIO</span>
        <span className="text-[13px] font-black tracking-widest">⚡ TELEPORT MAKER</span>
        <div className="flex gap-1 ml-1">
          {(["A", "B"] as const).map(pad => (pad === "A" || padB) && (
            <button key={pad} onClick={() => setActivePad(pad)}
              className={`px-3 py-0.5 text-[10px] font-black rounded border transition-colors ${activePad === pad ? "bg-[#27ae60] border-[#27ae60] text-[#080f09]" : "border-[#1a2e1a] text-[#5a8a5a] hover:border-[#27ae60]"}`}>
              PAD {pad}
            </button>
          ))}
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">{objects3D.length} objects</span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0a1a0a] border border-[#1abc9c] text-[#1abc9c]">✓ CONSOLE SAFE</span>
        <button onClick={exportAllJSON}
          className="ml-auto px-3 py-1 text-[10px] font-bold bg-[#27ae60] text-[#080f09] rounded hover:bg-[#2ecc71] transition-all">
          ⬇ Export All JSON
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left panel */}
        <div className="w-60 shrink-0 bg-[#0a1209] border-r border-[#1a2e1a] overflow-y-auto flex flex-col gap-3 p-3">

          {/* Theme */}
          <div>
            <div className="text-[9px] text-[#5a8a5a] font-bold mb-1 tracking-widest">THEME</div>
            <div className="flex flex-col gap-1">
              {availableThemes.map(t => (
                <button key={t.key} onClick={() => setCfg({ theme: t.key })}
                  className={`text-left px-2 py-1.5 rounded border text-[10px] transition-colors ${cfg.theme === t.key ? "border-[#27ae60] bg-[#0e2010] text-[#b8d4b8]" : "border-[#1a2e1a] text-[#5a8a5a] hover:border-[#27ae60] hover:text-[#b8d4b8]"}`}>
                  <span className="font-bold">{t.emoji} {t.label}</span>
                  <div className="text-[8px] text-[#3a6a3a] mt-0.5 leading-tight">{t.desc}</div>
                </button>
              ))}
              {cfg.sizeMode !== "event" && <div className="text-[8px] text-[#3a6a3a] px-1">🎪 Event Mega-Pad requires Event size</div>}
            </div>
          </div>

          {/* Size mode */}
          <div>
            <div className="text-[9px] text-[#5a8a5a] font-bold mb-1 tracking-widest">SIZE MODE</div>
            <div className="flex gap-1">
              {(["small", "medium", "event"] as SizeMode[]).map(m => (
                <button key={m} onClick={() => setSizeMode(m)}
                  className={`flex-1 py-1 text-[9px] font-bold rounded border transition-colors ${cfg.sizeMode === m ? "bg-[#27ae60] border-[#27ae60] text-[#080f09]" : "border-[#1a2e1a] text-[#5a8a5a] hover:border-[#27ae60]"}`}>
                  {m === "small" ? "S" : m === "medium" ? "M" : "EVT"}
                </button>
              ))}
            </div>
            <div className="text-[8px] text-[#3a6a3a] mt-1">
              {cfg.sizeMode === "small" ? "1-2 players · 3m" : cfg.sizeMode === "medium" ? "1-4 players · 4m" : "8-20+ players · 12m"}
            </div>
          </div>

          {/* Radius */}
          <div>
            <div className="text-[9px] text-[#5a8a5a] font-bold mb-1 tracking-widest">TRIGGER RADIUS — {cfg.padRadius.toFixed(1)}m</div>
            <input type="range" min={1} max={20} step={0.5} value={cfg.padRadius}
              onChange={e => setCfg({ padRadius: Number(e.target.value) })}
              className="w-full accent-[#27ae60]" />
            <div className="flex justify-between text-[8px] text-[#3a6a3a]"><span>1m</span><span>20m</span></div>
          </div>

          {/* Seed */}
          <div>
            <div className="text-[9px] text-[#5a8a5a] font-bold mb-1 tracking-widest">SEED</div>
            <div className="flex gap-1">
              <input type="number" value={cfg.seed} onChange={e => setCfg({ seed: Number(e.target.value) })}
                className="flex-1 bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded font-mono" />
              <button onClick={() => setCfg({ seed: randomSeed() })} className="px-2 py-1 bg-[#27ae60] text-[#080f09] text-[11px] font-bold rounded hover:bg-[#2ecc71]">🎲</button>
            </div>
          </div>

          {/* Pad position */}
          <div>
            <div className="text-[9px] text-[#5a8a5a] font-bold mb-1 tracking-widest">PAD {activePad} POSITION</div>
            <div className="grid grid-cols-3 gap-1">
              <NumInput label="X" value={cfg.posX} onChange={v => setCfg({ posX: v })} />
              <NumInput label="Y" value={cfg.posY} onChange={v => setCfg({ posY: v })} />
              <NumInput label="Z" value={cfg.posZ} onChange={v => setCfg({ posZ: v })} />
            </div>
          </div>

          {/* Destination */}
          <div>
            <div className="text-[9px] text-[#5a8a5a] font-bold mb-1 tracking-widest">DESTINATION</div>
            <div className="grid grid-cols-3 gap-1">
              <NumInput label="X" value={cfg.destX} onChange={v => setCfg({ destX: v })} />
              <NumInput label="Y" value={cfg.destY} onChange={v => setCfg({ destY: v })} />
              <NumInput label="Z" value={cfg.destZ} onChange={v => setCfg({ destZ: v })} />
            </div>
          </div>

          {/* Validation */}
          {samePos && (
            <div className="px-2 py-1.5 rounded border border-[#e74c3c] bg-[#1a0a0a] text-[9px] text-[#e74c3c]">
              ⚠ Destination = pad position — player won't move
            </div>
          )}
          {destAtZero && (
            <div className="px-2 py-1.5 rounded border border-[#f39c12] bg-[#1a1200] text-[9px] text-[#f39c12]">
              ⚠ Destination Y = 0 — may be underground
            </div>
          )}

          {/* Return pad */}
          <div className="border-t border-[#1a2e1a] pt-3">
            <label className="flex items-center gap-2 cursor-pointer" onClick={() => toggleReturnPad(!padB)}>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${padB ? "bg-[#27ae60]" : "bg-[#1a2e1a]"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${padB ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-[10px] text-[#b8d4b8] font-bold">Return Pad (B)</span>
            </label>
            {padB && <div className="text-[8px] text-[#3a6a3a] mt-1">Pad B: origin ↔ destination swapped from Pad A</div>}
          </div>

          {/* Guide */}
          <div className="border-t border-[#1a2e1a] pt-3">
            <button onClick={() => setGuideOpen(o => !o)} className="w-full text-left text-[9px] text-[#5a8a5a] font-bold tracking-widest hover:text-[#27ae60]">
              {guideOpen ? "▼" : "▶"} HOW TO USE
            </button>
            {guideOpen && (
              <div className="mt-2 text-[8px] text-[#3a6a3a] leading-relaxed space-y-1">
                <div className="text-[#5a8a5a] font-bold">WHAT THIS GENERATES</div>
                <div>3 files per pad: objects JSON, PRA trigger JSON, setup guide.</div>
                <div className="text-[#5a8a5a] font-bold mt-1">CONSOLE (NITRADO)</div>
                <div>1. Upload JSON files to custom/ folder</div>
                <div>2. Add entries to cfggameplay.json WorldsData</div>
                <div>3. Enable cfggameplay.json in General Settings</div>
                <div>4. Restart server</div>
                <div className="text-[#5a8a5a] font-bold mt-1">PC</div>
                <div>Files go in mpmissions\YourMission\custom\</div>
                <div className="text-[#5a8a5a] font-bold mt-1">HOW IT WORKS</div>
                <div>Players who log off inside the PRA box teleport to destination on next login. Same system as official Sakhal bunker.</div>
              </div>
            )}
          </div>
        </div>

        {/* 3D Preview */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-r border-[#1a2e1a]">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-2 text-[10px]">
            <span className="text-[#5a8a5a]">3D PREVIEW — PAD {activePad}</span>
            <span className="font-bold" style={{ color: theme.color }}>{theme.emoji} {theme.label}</span>
            <span className="ml-auto text-[#3a6a3a]">Drag · Scroll</span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <Suspense fallback={<div className="flex items-center justify-center h-full text-[#5a8a5a] text-[11px]">Loading 3D…</div>}>
              <ZonePreview3D objects={objects3D} zoneRadius={Math.max(cfg.padRadius * 2.5, 15)} />
            </Suspense>
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#0c1510] border border-[#1a2e1a] text-[8px] text-[#27ae60]">
              Trigger: {(cfg.padRadius * 2).toFixed(1)}m × 3m × {(cfg.padRadius * 2).toFixed(1)}m
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="w-80 shrink-0 flex flex-col min-h-0">
          <PadOutput cfg={cfg} padLabel={activePad} hasReturnPad={!!padB} />
        </div>
      </div>
    </div>
  );
}
