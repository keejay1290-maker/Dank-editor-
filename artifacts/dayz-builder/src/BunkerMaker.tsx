
import { useState, useCallback, useMemo } from "react";
import { generateBunker, exportBunkerInitC, exportBunkerJSON, BunkerLayout } from "@/lib/bunkerGenerator";
import { STYLES, SIZES, BunkerStyle, BunkerSize, PlacedObject, BunkerOptions } from "@/lib/bunkerData";
import { executePipeline, PipelineContext } from "@/lib/pipeline";
import { Point3D } from "@/lib/types";
import { MAX_OBJECTS } from "@/lib/constants";
import BunkerPreview3D from "@/BunkerPreview3D";

// ─── 2D Floor Plan Preview ────────────────────────────────────────────────────

const SECTION_COLORS: Record<PlacedObject['section'], string> = {
  entrance: '#27ae60',
  exit:     '#e74c3c',
  panel:    '#9b59b6',
  exterior: '#7f8c8d',
  stair:    '#f39c12',
  tunnel:   '#3498db',
  branch:   '#2980b9',
  room:     '#27ae60',
  decor:    '#5a4820',
  loot:     '#e8b82a',
  corridor: '#3498db',
  stairs:   '#f39c12',
  wall:     '#7f8c8d',
  floor:    '#2c3e50',
  wreck:    '#c0392b'
};

const LEVEL_COLORS = ['#27ae60', '#3498db', '#e67e22', '#e74c3c'];

// Piece footprint half-sizes (w/2, d/2) keyed by section for debug mode
const SECTION_HALF: Record<PlacedObject['section'], [number, number]> = {
  entrance: [4.5, 4.5], exit: [4.5, 4.5],  panel: [0.5, 0.5],
  exterior: [2, 2],     stair: [2.25, 2.25], tunnel: [2.25, 4.5],
  branch:   [4.5, 2.25], room: [9, 9],       decor: [1, 1],  
  loot:     [0.5, 0.5],  corridor: [2.25, 4.5], stairs: [2.25, 2.25],
  wall:     [0.2, 4],    floor: [5, 5],      wreck: [3, 3]
};

function FloorPlanSVG({ layout, showLevel, debugMode }: { layout: BunkerLayout; showLevel: number; debugMode?: boolean }) {
  const W = 520, H = 360;
  const MARGIN = 30;

  const levelObjs = layout.objects.filter(o =>
    o.level === showLevel || (showLevel === 0 && o.level === 0)
  );

  if (levelObjs.length === 0) return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect width={W} height={H} fill="#060402" />
      <text x={W/2} y={H/2} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#5a4820">
        No objects at this level
      </text>
    </svg>
  );

  // Bounding box — per-level for better zoom
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const o of levelObjs) {
    const [hw, hd] = (SECTION_HALF as any)[o.section] ?? [5, 5];
    minX = Math.min(minX, o.dx - hw - 2);
    maxX = Math.max(maxX, o.dx + hw + 2);
    minZ = Math.min(minZ, o.dz - hd - 2);
    maxZ = Math.max(maxZ, o.dz + hd + 2);
  }

  const rangeX = Math.max(maxX - minX, 20);
  const rangeZ = Math.max(maxZ - minZ, 20);
  const scaleX = (W - MARGIN * 2) / rangeX;
  const scaleZ = (H - MARGIN * 2) / rangeZ;
  const scale = Math.min(scaleX, scaleZ, 4);

  const toSvgX = (dx: number) => MARGIN + (dx - minX) * scale;
  const toSvgY = (dz: number) => MARGIN + (dz - minZ) * scale;

  // Scale bar: find a nice round number of metres that maps to ~60px
  const scaleBarMetres = Math.round(60 / scale / 5) * 5 || 5;
  const scaleBarPx = scaleBarMetres * scale;

  // Overlap detection for debug mode
  const overlapping = new Set<number>();
  if (debugMode) {
    for (let i = 0; i < levelObjs.length; i++) {
      for (let j = i + 1; j < levelObjs.length; j++) {
        const a = levelObjs[i], b = levelObjs[j];
        if (Math.abs(a.dx - b.dx) < 0.5 && Math.abs(a.dz - b.dz) < 0.5) {
          overlapping.add(i);
          overlapping.add(j);
        }
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      style={{ fontFamily: 'monospace', userSelect: 'none' }}>
      <rect width={W} height={H} fill="#060402" />
      {/* Grid */}
      {Array.from({ length: 10 }, (_, i) => i).map(i => (
        <g key={i}>
          <line x1={MARGIN + i * ((W - MARGIN * 2) / 9)} y1={MARGIN} x2={MARGIN + i * ((W - MARGIN * 2) / 9)} y2={H - MARGIN}
            stroke="#0a1209" strokeWidth="1" />
          <line x1={MARGIN} y1={MARGIN + i * ((H - MARGIN * 2) / 9)} x2={W - MARGIN} y2={MARGIN + i * ((H - MARGIN * 2) / 9)}
            stroke="#0a1209" strokeWidth="1" />
        </g>
      ))}

      {/* Objects */}
      {levelObjs.map((obj, i) => {
        const cx = toSvgX(obj.dx);
        const cy = toSvgY(obj.dz);
        const color = overlapping.has(i) ? '#e74c3c' : ((SECTION_COLORS as any)[obj.section] ?? '#5a4820');
        const [hw, hd] = (SECTION_HALF as any)[obj.section] ?? [5, 5];
        const pw = hw * scale * 2;
        const ph = hd * scale * 2;

        if (debugMode) {
          return (
            <g key={i}>
              <rect x={cx - pw / 2} y={cy - ph / 2} width={pw} height={ph}
                fill={`${color}22`} stroke={color} strokeWidth={overlapping.has(i) ? 2 : 1} rx="1" />
              <title>{obj.classname}{overlapping.has(i) ? ' ⚠ OVERLAP' : ''}{'\n'}{obj.note}</title>
              {pw > 20 && ph > 8 && (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                  fontSize="5" fill={color} style={{ pointerEvents: 'none' }}>
                  {obj.classname.replace('Land_Underground_', '').replace('StaticObj_Underground_', '').slice(0, 18)}
                </text>
              )}
            </g>
          );
        }

        const r = obj.section === 'room' ? 8 : obj.section === 'tunnel' || obj.section === 'branch' ? 4 : 5;
        const isLarge = obj.section === 'room';
        return (
          <g key={i}>
            <title>{obj.classname}{'\n'}{obj.note}</title>
            {isLarge ? (
              <rect x={cx - 9} y={cy - 12} width={18} height={24}
                fill={`${color}33`} stroke={color} strokeWidth="1.5" rx="2" />
            ) : (
              <circle cx={cx} cy={cy} r={r}
                fill={`${color}44`} stroke={color} strokeWidth="1" />
            )}
          </g>
        );
      })}

      {/* North arrow */}
      <text x={W - 20} y={22} fontSize="9" fill="#3a6a3a" textAnchor="middle">N↑</text>
      <text x={14} y={H / 2} fontSize="9" fill="#3a6a3a" textAnchor="middle"
        transform={`rotate(-90, 14, ${H / 2})`}>W←</text>

      {/* Scale bar */}
      <g>
        <line x1={MARGIN} y1={H - 8} x2={MARGIN + scaleBarPx} y2={H - 8} stroke="#3a6a3a" strokeWidth="1.5" />
        <line x1={MARGIN} y1={H - 11} x2={MARGIN} y2={H - 5} stroke="#3a6a3a" strokeWidth="1.5" />
        <line x1={MARGIN + scaleBarPx} y1={H - 11} x2={MARGIN + scaleBarPx} y2={H - 5} stroke="#3a6a3a" strokeWidth="1.5" />
        <text x={MARGIN + scaleBarPx / 2} y={H - 1} textAnchor="middle" fontSize="7" fill="#3a6a3a">{scaleBarMetres}m</text>
      </g>

      {/* Debug overlap count */}
      {debugMode && overlapping.size > 0 && (
        <text x={W - MARGIN} y={H - 8} textAnchor="end" fontSize="7.5" fill="#e74c3c">
          ⚠ {overlapping.size / 2 | 0} overlaps
        </text>
      )}

      {/* Legend */}
      {(['entrance','room','tunnel','stair','decor'] as PlacedObject['section'][]).map((sec, i) => (
        <g key={sec}>
          <circle cx={MARGIN + i * 100} cy={H - 20} r={4} fill={SECTION_COLORS[sec]} />
          <text x={MARGIN + i * 100 + 7} y={H - 17} fontSize="7.5" fill="#8a7840" dominantBaseline="middle">
            {sec}
          </text>
        </g>
      ))}

      {/* Level label */}
      <text x={8} y={14} fontSize="9" fill={LEVEL_COLORS[showLevel]} fontWeight="bold">
        {showLevel === 0 ? 'SURFACE' : `LEVEL ${showLevel} (−${showLevel === 1 ? 5 : showLevel === 2 ? 11 : 18}m)`}
      </text>
      <text x={8} y={24} fontSize="7.5" fill="#3a6a3a">
        {levelObjs.length} objects · {debugMode ? 'DEBUG' : 'normal'} view
      </text>
    </svg>
  );
}

// ─── Options Panel ────────────────────────────────────────────────────────────

const LEVEL_LABELS = ['1 Level', '2 Levels', '3 Levels'];
const AXIS_LABELS: Record<string, string> = { NS: '↕ North–South', EW: '↔ East–West' };
const DENSITY_LABELS: Record<string, string> = { sparse: '• Sparse', normal: '•• Normal', heavy: '••• Heavy' };

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BunkerMaker() {
  const [seed,        setSeed]        = useState(42);
  const [levels,      setLevels]      = useState<1|2|3>(2);
  const [size,        setSize]        = useState<BunkerOptions['size']>('standard');
  const [style,       setStyle]       = useState<BunkerOptions['style']>('military');
  const [spineAxis,   setSpineAxis]   = useState<'NS'|'EW'>('NS');
  const [encaseExt,   setEncaseExt]   = useState(false);
  const [convoy,      setConvoy]      = useState(true);
  const [decor,       setDecor]       = useState(true);
  const [decorDensity,setDecorDensity]= useState<'sparse'|'normal'|'heavy'>('normal');
  const [floors,      setFloors]      = useState(true);
  const [sakhalPanels,setSakhalPanels]= useState(true);
  const [posX,        setPosX]        = useState(7419.0);
  const [posY,        setPosY]        = useState(383.5);
  const [posZ,        setPosZ]        = useState(5695.0);
  const [fmt,         setFmt]         = useState<'initc'|'json'>('initc');
  const [previewLevel,setPreviewLevel]= useState(0);
  const [debugMode,   setDebugMode]   = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [mobileView,  setMobileView]  = useState<'config'|'preview'|'output'>('config');
  const [pipelineCtx, setPipelineCtx] = useState<PipelineContext | null>(null);

  const opts: BunkerOptions = useMemo(() => ({
    seed, levels, size, style, spineAxis,
    encaseExterior: encaseExt,
    includeConvoy: convoy,
    includeDecor: decor,
    decorDensity,
    includeFloors: floors,
    useSakhalPanels: sakhalPanels,
  }), [seed, levels, size, style, spineAxis, encaseExt, convoy, decor, decorDensity, floors, sakhalPanels]);

  const layout: BunkerLayout = useMemo(() => generateBunker(opts), [opts]);

  // V2 Pipeline Execution
  useMemo(() => {
    executePipeline(
      "BunkerMaker",
      opts.style, 
      opts.seed,
      { ...opts, posX, posY, posZ },
      () => {
        // Point Generator for Bunker: Map generateBunker's output back to Point3D
        const b = generateBunker(opts);
        return b.objects.map(obj => ({
          x: obj.dx, y: obj.dy, z: obj.dz,
          yaw: obj.yaw, pitch: obj.pitch, roll: obj.roll,
          name: obj.classname
        }));
      }
    ).then(setPipelineCtx).catch(console.error);
  }, [opts, posX, posY, posZ]);

  const output = useMemo(() =>
    fmt === 'initc'
      ? exportBunkerInitC(layout, posX, posY, posZ)
      : exportBunkerJSON(layout, posX, posY, posZ),
    [layout, fmt, posX, posY, posZ]
  );

  const randomize = useCallback(() => setSeed(Math.floor(Math.random() * 999999)), []);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [output]);

  const download = useCallback(() => {
    const name = pipelineCtx?.metadata.filename || `bunker_seed${seed}`;
    const blob = new Blob([output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.${fmt === 'json' ? 'json' : 'c'}`;
    a.click();
  }, [output, seed, fmt, pipelineCtx]);

  const maxLevel = levels;

  return (
    <div className="flex flex-col h-full bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a2e1a] bg-[#0a1209] shrink-0">
        <span className="text-[9px] text-[#3a6a3a] font-bold tracking-widest mr-1">DANK'S DAYZ STUDIO</span>
        <span className="text-[#27ae60] text-[12px] font-black tracking-wider">🏗 BUNKER MAKER</span>
        <span className="text-[#3a6a3a] text-[9px]">Random underground bunker generator</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm transition-all ${layout.stats.totalObjects >= MAX_OBJECTS ? "bg-[#e74c3c] text-white animate-pulse" : "text-[#5a8a5a]"}`}>
            {layout.stats.totalObjects >= MAX_OBJECTS ? `⚠ LIMIT REACHED (${MAX_OBJECTS})` : `${layout.stats.totalObjects} objects`}
          </span>
          <span className="text-[#5a4820] text-[8px]">·</span>
          <span className="text-[#5a8a5a] text-[9px]">{layout.stats.rooms} rooms</span>
          <span className="text-[#5a4820] text-[8px]">·</span>
          <span className="text-[#5a8a5a] text-[9px]">~{layout.stats.footprintRadius * 2}m wide</span>
          
          {pipelineCtx && (
            <>
              <span className="text-[#5a4820] text-[8px]">·</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${pipelineCtx.fidelityScore > 90 ? "bg-[#d4a01722] text-[#d4a017]" : "bg-[#c0392b22] text-[#c0392b]"}`}>
                FIDELITY: {pipelineCtx.fidelityScore}%
              </span>
              <span className="text-[#5a4820] text-[8px]">·</span>
              <span className="text-[9px] text-[#27ae60] animate-pulse">V2_PIPELINE: ACTIVE</span>
            </>
          )}

          <button onClick={copy}
            className={`ml-2 px-2 py-1 text-[9px] font-bold border rounded-sm transition-all ${copied ? 'bg-[#27ae60] text-[#080f09] border-[#27ae60]' : 'border-[#27ae60] text-[#27ae60] hover:bg-[#27ae60] hover:text-[#080f09]'}`}>
            {copied ? '✓' : 'Copy'}
          </button>
          <button onClick={download}
            className="px-2 py-1 text-[9px] font-bold bg-[#27ae60] text-[#080f09] border border-[#27ae60] rounded-sm hover:bg-[#c8980f] transition-all">
            ⬇ DL
          </button>
        </div>
      </div>

      {/* ── Mobile tabs ─────────────────────────────────────────────────────── */}
      <div className="flex md:hidden border-b border-[#1a2e1a] bg-[#0c1510] shrink-0">
        {(['config','preview','output'] as const).map(v => (
          <button key={v} onClick={() => setMobileView(v)}
            className={`flex-1 py-1.5 text-[9px] font-bold capitalize border-b-2 transition-all ${mobileView === v ? 'text-[#27ae60] border-[#27ae60]' : 'text-[#8a7840] border-transparent'}`}>
            {v === 'config' ? '⚙ Options' : v === 'preview' ? '🗺 Map' : '📋 Code'}
          </button>
        ))}
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT SIDEBAR — Options ─────────────────────────────────────────── */}
        <div className={`w-full md:w-64 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] flex-col overflow-y-auto ${mobileView === 'config' ? 'flex' : 'hidden md:flex'}`}>

          {/* Seed */}
          <div className="px-3 py-2 border-b border-[#1a2e1a]">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">🎲 Random Seed</div>
            <div className="flex gap-1.5 items-center">
              <input type="number" value={seed} onChange={e => setSeed(+e.target.value)}
                className="flex-1 bg-[#0c1510] border border-[#1a2e1a] rounded-sm px-2 py-1 text-[11px] text-[#27ae60] font-bold focus:outline-none focus:border-[#27ae60] min-w-0" />
              <button onClick={randomize}
                className="px-2 py-1 text-[9px] font-bold bg-[#27ae60]/20 border border-[#27ae60] text-[#27ae60] rounded-sm hover:bg-[#27ae60]/40 transition-all whitespace-nowrap">
                🎲 Random
              </button>
            </div>
            <div className="text-[7px] text-[#5a4820] mt-1">Same seed always gives the same bunker</div>
          </div>

          {/* Levels */}
          <div className="px-3 py-2 border-b border-[#1a2e1a]">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">🏗 Underground Levels</div>
            <div className="flex gap-1">
              {([1,2,3] as const).map(lv => (
                <button key={lv} onClick={() => { setLevels(lv); setPreviewLevel(0); }}
                  className={`flex-1 py-1.5 text-[10px] font-bold border rounded-sm transition-all ${levels === lv ? 'bg-[#27ae60] text-[#080f09] border-[#27ae60]' : 'text-[#b09a6a] border-[#1a2e1a] hover:border-[#6a5820]'}`}>
                  {lv}
                </button>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {([0,...Array.from({length: levels}, (_,i)=>i+1)] as number[]).map(lv => (
                <button key={lv} onClick={() => setPreviewLevel(lv)}
                  className={`flex-1 py-0.5 text-[8px] border rounded-sm transition-all ${previewLevel === lv ? 'border-[#3498db] text-[#3498db]' : 'text-[#3a6a3a] border-[#1e1c18] hover:border-[#1a2e1a]'}`}
                  style={{ color: previewLevel === lv ? LEVEL_COLORS[lv] : undefined, borderColor: previewLevel === lv ? LEVEL_COLORS[lv] : undefined }}>
                  {lv === 0 ? 'Surf' : `L${lv}`}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="px-3 py-2 border-b border-[#1a2e1a]">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">📐 Bunker Size</div>
            <div className="flex flex-col gap-1">
              {(Object.keys(SIZES) as any[]).map((s: string) => (
                <button key={s} onClick={() => setSize(s as any)}
                  className={`text-left px-2 py-1.5 text-[10px] rounded-sm border transition-all ${size === (s as any) ? 'bg-[#27ae60]/20 border-[#27ae60] text-[#27ae60]' : 'border-[#1a2e1a] text-[#b09a6a] hover:border-[#5a4820]'}`}>
                  {(SIZES as any)[s].name}
                  <span className="ml-1 text-[8px] opacity-60">
                    {(SIZES as any)[s].segments} segments
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="px-3 py-2 border-b border-[#1a2e1a]">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">🎨 Atmosphere Style</div>
            <div className="flex flex-col gap-1">
              {(Object.entries(STYLES) as any[]).map(([k, s]) => (
                <button key={k} onClick={() => setStyle(k as any)}
                  className={`text-left px-2 py-1.5 text-[10px] rounded-sm border transition-all ${style === k ? 'bg-[#27ae60]/20 border-[#27ae60] text-[#27ae60]' : 'border-[#1a2e1a] text-[#b09a6a] hover:border-[#5a4820]'}`}>
                  {s.name}
                  <div className="text-[7.5px] mt-0.5 opacity-60">Professional build theme</div>
                </button>
              ))}
            </div>
          </div>

          {/* Spine axis */}
          <div className="px-3 py-2 border-b border-[#1a2e1a]">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">🧭 Spine Orientation</div>
            <div className="flex gap-1">
              {(['NS','EW'] as const).map(ax => (
                <button key={ax} onClick={() => setSpineAxis(ax)}
                  className={`flex-1 py-1.5 text-[10px] font-bold border rounded-sm transition-all ${spineAxis === ax ? 'bg-[#27ae60] text-[#080f09] border-[#27ae60]' : 'text-[#b09a6a] border-[#1a2e1a] hover:border-[#6a5820]'}`}>
                  {AXIS_LABELS[ax]}
                </button>
              ))}
            </div>
          </div>

          {/* Options toggles */}
          <div className="px-3 py-2 border-b border-[#1a2e1a]">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">⚙ Options</div>
            {[
              { label: '🧱 Encase Exterior in Walls', val: encaseExt, set: setEncaseExt, note: 'Surrounds entire surface footprint with walls — players cannot reach exterior' },
              { label: '🚛 Convoy in Tunnels', val: convoy, set: setConvoy, note: 'Places abandoned vehicle wrecks along the main spine corridor' },
              { label: '🪣 Decorative Props', val: decor, set: setDecor, note: 'Scatter crates, barrels, garbage for abandoned feel' },
              { label: '🪨 Concrete Floors', val: floors, set: setFloors, note: 'Place concrete slabs under rooms and corridors' },
              { label: '🔲 Sakhal Keypad Panels (1.25+)', val: sakhalPanels, set: setSakhalPanels, note: 'Use Sakhal underground console objects for entry/exit panels. Requires DayZ 1.25+.' },
              { label: '🔧 Debug Alignment View', val: debugMode, set: setDebugMode, note: 'Shows piece footprints with classname tooltips, scale bar, and overlap highlights in the 2D floor plan.' },
            ].map(opt => (
              <div key={opt.label} className="mb-2">
                <button onClick={() => opt.set(!opt.val)}
                  className={`flex items-center gap-2 w-full text-left text-[10px] py-1 transition-all ${opt.val ? 'text-[#27ae60]' : 'text-[#3a6a3a]'}`}>
                  <span className={`w-3 h-3 border rounded-sm flex items-center justify-center shrink-0 ${opt.val ? 'border-[#27ae60] bg-[#27ae60]/30' : 'border-[#3a3020]'}`}>
                    {opt.val && <span className="text-[8px] text-[#27ae60]">✓</span>}
                  </span>
                  <span className="font-bold">{opt.label}</span>
                </button>
                <div className="text-[7px] text-[#4a3820] ml-5 leading-relaxed">{opt.note}</div>
              </div>
            ))}

            {decor && (
              <div className="mt-1">
                <div className="text-[#7a6a4a] text-[8px] mb-1">Decor Density</div>
                <div className="flex gap-1">
                  {(['sparse','normal','heavy'] as const).map(d => (
                    <button key={d} onClick={() => setDecorDensity(d)}
                      className={`flex-1 py-1 text-[8px] font-bold border rounded-sm transition-all ${decorDensity === d ? 'bg-[#27ae60]/30 border-[#27ae60] text-[#27ae60]' : 'text-[#3a6a3a] border-[#1a2e1a] hover:border-[#4a3820]'}`}>
                      {DENSITY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* World Position */}
          <div className="px-3 py-2 border-b border-[#1a2e1a]">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1">📍 World Origin</div>
            <div className="text-[7px] text-[#5a4820] mb-2 leading-relaxed">
              Set X/Z to your in-game position. Set Y to terrain height — underground pieces auto-sink below this.
            </div>
            {/* Quick Location Presets */}
            <div className="grid grid-cols-2 gap-1 mb-2">
              <button
                onClick={() => { setPosX(4413.29); setPosY(383.5); setPosZ(10323.60); }}
                className="py-1 text-[9px] font-bold border border-[#1a4a6a] text-[#4a9abf] bg-[#0a1520] rounded-sm hover:bg-[#1a4a6a] hover:text-white transition-all"
              >
                📡 NWAF
              </button>
              <button
                onClick={() => { setPosX(12135.58); setPosY(350.0); setPosZ(12499.14); }}
                className="py-1 text-[9px] font-bold border border-[#4a1a1a] text-[#bf4a4a] bg-[#140a0a] rounded-sm hover:bg-[#4a1a1a] hover:text-white transition-all"
              >
                🏙 Krasno
              </button>
            </div>
            {([['X', posX, setPosX], ['Y (terrain height)', posY, setPosY], ['Z', posZ, setPosZ]] as [string, number, (v:number)=>void][]).map(([label, val, set]) => (
              <div key={label} className="flex items-center gap-2 mb-1">
                <span className="text-[8px] text-[#8a7840] w-14 shrink-0 truncate">{label}</span>
                <input type="number" step="0.1" value={val} onChange={e => set(+e.target.value)}
                  className="flex-1 bg-[#0c1510] border border-[#1a2e1a] rounded-sm px-2 py-0.5 text-[10px] text-[#b8d4b8] focus:outline-none focus:border-[#27ae60] min-w-0" />
              </div>
            ))}
          </div>

          {/* Export format */}
          <div className="px-3 py-2">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">💾 Export Format</div>
            <div className="flex gap-1">
              {(['initc','json'] as const).map(f => (
                <button key={f} onClick={() => setFmt(f)}
                  className={`flex-1 py-1.5 text-[10px] font-bold border rounded-sm transition-all ${fmt === f ? 'bg-[#27ae60] text-[#080f09] border-[#27ae60]' : 'text-[#b09a6a] border-[#1a2e1a] hover:border-[#6a5820]'}`}>
                  {f === 'json' ? 'JSON Spawner' : 'init.c'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER — Floor Plan Preview ─────────────────────────────────────── */}
        <div className={`flex flex-col overflow-hidden md:w-80 shrink-0 border-r border-[#1a2e1a] ${mobileView === 'preview' ? 'flex w-full' : 'hidden md:flex'}`}>
          {/* Preview header with 2D/3D toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0a1209] shrink-0">
            <span className="text-[9px] text-[#5a8a5a] uppercase tracking-wider">Preview</span>
            <div className="flex gap-1 ml-auto">
              {(['3D','2D'] as const).map(v => (
                <button key={v}
                  onClick={() => setDebugMode(v === '2D')}
                  className={`px-2 py-0.5 text-[8px] font-bold border rounded-sm transition-all ${(v === '2D' ? debugMode : !debugMode) ? 'bg-[#27ae60] text-[#080f09] border-[#27ae60]' : 'text-[#3a6a3a] border-[#1a2e1a] hover:border-[#4a3820]'}`}>
                  {v}
                </button>
              ))}
            </div>
            {debugMode && (
              <span className="text-[7px] text-[#e74c3c] font-bold">DEBUG</span>
            )}
          </div>

          {/* Preview area — 3D or 2D floor plan */}
          <div className="flex-1 min-h-0 relative">
            {debugMode ? (
              <div className="w-full h-full overflow-auto bg-[#060402] p-1">
                <FloorPlanSVG layout={layout} showLevel={previewLevel} debugMode={true} />
              </div>
            ) : (
              <BunkerPreview3D layout={layout} />
            )}
          </div>

          {/* Stats strip */}
          <div className="shrink-0 px-3 py-2 border-t border-[#1a2e1a] bg-[#0a1209]">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-[10px] font-bold text-[#27ae60]">{layout.stats.totalObjects}</div>
                <div className="text-[7.5px] text-[#3a6a3a]">Total Objects</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-[#27ae60]">{layout.stats.rooms}</div>
                <div className="text-[7.5px] text-[#3a6a3a]">Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-[#3498db]">{layout.stats.tunnelSegments}</div>
                <div className="text-[7.5px] text-[#3a6a3a]">Tunnel Segs</div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(Object.entries(SECTION_COLORS) as [PlacedObject['section'], string][])
                .filter(([s]) => ['entrance','exit','room','tunnel','stair','decor','exterior','panel'].includes(s))
                .map(([sec, col]) => (
                <div key={sec} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: col }} />
                  <span className="text-[7px] text-[#3a6a3a] capitalize">{sec}</span>
                </div>
              ))}
            </div>

            {/* Sakhal panel warning */}
            {sakhalPanels && (
              <div className="mt-2 bg-[#0e1a0e] border border-[#9b59b633] rounded-sm px-2 py-1">
                <div className="text-[7.5px] text-[#9b59b6] leading-relaxed">
                  🔲 Sakhal panels (Land_UGComplex_*) require DayZ 1.25+ and the Sakhal map.
                  If they don't spawn, toggle off "Sakhal Panels" to use the shelf fallback.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT — Code Output ──────────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${mobileView === 'output' ? 'flex' : 'hidden md:flex'}`}>
          {/* Output header */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0a1209] shrink-0">
            <span className="text-[#27ae60] text-[10px] font-bold tracking-wider">
              ▶ {fmt === 'initc' ? 'INIT.C OUTPUT' : 'JSON SPAWNER'}
            </span>
            <span className="text-[#3a6a3a] text-[9px]">
              {fmt === 'initc' ? '— paste into mission init.c' : '— paste into JSON Spawner mod'}
            </span>
            <div className="ml-auto flex gap-1.5">
              <button onClick={copy}
                className={`px-3 py-1 text-[10px] font-bold border rounded-sm transition-all ${copied ? 'bg-[#27ae60] text-[#080f09] border-[#27ae60]' : 'border-[#27ae60] text-[#27ae60] hover:bg-[#27ae60] hover:text-[#080f09]'}`}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button onClick={download}
                className="px-3 py-1 text-[10px] font-bold bg-[#27ae60] text-[#080f09] border border-[#27ae60] rounded-sm hover:bg-[#c8980f] transition-all">
                ⬇ Download
              </button>
            </div>
          </div>

          {/* Object filter pills */}
          <div className="flex flex-wrap gap-1 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0a0906] shrink-0">
            {(Object.entries({
              '🚪 Entrance': layout.objects.filter(o => o.section === 'entrance').length,
              '🏠 Rooms':    layout.objects.filter(o => o.section === 'room').length,
              '🚇 Corridors':layout.objects.filter(o => o.section === 'tunnel' || o.section === 'branch').length,
              '🪜 Stairs':   layout.objects.filter(o => o.section === 'stair').length,
              '🎨 Decor':    layout.objects.filter(o => o.section === 'decor').length,
              '🧱 Exterior': layout.objects.filter(o => o.section === 'exterior').length,
            })).filter(([,count]) => count > 0).map(([label, count]) => (
              <div key={label}
                className="flex items-center gap-1 bg-[#0a1209] border border-[#1a2e1a] rounded-sm px-1.5 py-0.5">
                <span className="text-[8px] text-[#b09a6a]">{label}</span>
                <span className="text-[8px] text-[#27ae60] font-bold">{count}</span>
              </div>
            ))}
          </div>

          <pre className="flex-1 overflow-auto px-3 py-2 text-[10px] text-[#b8d4b8] leading-relaxed whitespace-pre bg-[#070503] min-h-0">{output}</pre>

          {/* Tip bar */}
          <div className="px-3 py-1.5 border-t border-[#1a2e1a] bg-[#0a1209] shrink-0">
            <div className="text-[8px] text-[#3a6a3a] leading-relaxed">
              💡 <strong className="text-[#5a8a5a]">Tips:</strong>{' '}
              Set World Y to your terrain height — underground containers sink automatically.
              After spawning, use DayZ's admin freecam to check piece alignment and adjust Y offsets per-object.
              Re-roll the seed to get a completely new bunker layout every time.
              Sakhal panels require DayZ 1.25+ — toggle off if they don't appear.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
