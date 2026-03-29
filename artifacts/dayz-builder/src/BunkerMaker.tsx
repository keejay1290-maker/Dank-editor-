
import { useState, useCallback, useMemo } from "react";
import { generateBunker, exportBunkerInitC, exportBunkerJSON, BunkerOptions, BunkerLayout } from "@/lib/bunkerGenerator";
import { STYLES, SIZES, BunkerStyle, BunkerSize, PlacedObject } from "@/lib/bunkerData";

// ─── 2D Floor Plan Preview ────────────────────────────────────────────────────

const SECTION_COLORS: Record<PlacedObject['section'], string> = {
  entrance: '#27ae60',
  exit:     '#e74c3c',
  panel:    '#9b59b6',
  exterior: '#7f8c8d',
  stair:    '#f39c12',
  spine:    '#3498db',
  branch:   '#2980b9',
  room:     '#d4a017',
  decor:    '#5a4820',
};

const LEVEL_COLORS = ['#27ae60', '#3498db', '#e67e22', '#e74c3c'];

function FloorPlanSVG({ layout, showLevel }: { layout: BunkerLayout; showLevel: number }) {
  const W = 520, H = 360;
  const MARGIN = 30;

  const allObjs = layout.objects.filter(o => o.level === showLevel);
  if (allObjs.length === 0) return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect width={W} height={H} fill="#060402" />
      <text x={W/2} y={H/2} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#5a4820">
        No objects at this level
      </text>
    </svg>
  );

  // Compute bounding box of all objects at this level
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const o of layout.objects) {
    minX = Math.min(minX, o.dx - 5);
    maxX = Math.max(maxX, o.dx + 5);
    minZ = Math.min(minZ, o.dz - 5);
    maxZ = Math.max(maxZ, o.dz + 5);
  }

  const rangeX = Math.max(maxX - minX, 20);
  const rangeZ = Math.max(maxZ - minZ, 20);
  const scaleX = (W - MARGIN * 2) / rangeX;
  const scaleZ = (H - MARGIN * 2) / rangeZ;
  const scale = Math.min(scaleX, scaleZ, 4);

  const toSvgX = (dx: number) => MARGIN + (dx - minX) * scale;
  const toSvgY = (dz: number) => MARGIN + (dz - minZ) * scale;

  const levelObjs = layout.objects.filter(o =>
    o.level === showLevel || (showLevel === 0 && o.level === 0)
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      style={{ fontFamily: 'monospace', userSelect: 'none' }}>
      <rect width={W} height={H} fill="#060402" />
      {/* Grid */}
      {Array.from({ length: 10 }, (_, i) => i).map(i => (
        <g key={i}>
          <line x1={MARGIN + i * ((W - MARGIN * 2) / 9)} y1={MARGIN} x2={MARGIN + i * ((W - MARGIN * 2) / 9)} y2={H - MARGIN}
            stroke="#0e0c08" strokeWidth="1" />
          <line x1={MARGIN} y1={MARGIN + i * ((H - MARGIN * 2) / 9)} x2={W - MARGIN} y2={MARGIN + i * ((H - MARGIN * 2) / 9)}
            stroke="#0e0c08" strokeWidth="1" />
        </g>
      ))}

      {/* Objects */}
      {levelObjs.map((obj, i) => {
        const cx = toSvgX(obj.dx);
        const cy = toSvgY(obj.dz);
        const color = SECTION_COLORS[obj.section] ?? '#5a4820';
        const r = obj.section === 'room' ? 8 : obj.section === 'spine' || obj.section === 'branch' ? 4 : 5;
        const isLarge = obj.section === 'room';
        return (
          <g key={i}>
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
      <text x={W - 20} y={22} fontSize="9" fill="#6a5a3a" textAnchor="middle">N↑</text>
      <text x={14} y={H / 2} fontSize="9" fill="#6a5a3a" textAnchor="middle"
        transform={`rotate(-90, 14, ${H / 2})`}>W←</text>

      {/* Legend */}
      {(['entrance','room','spine','stair','decor'] as PlacedObject['section'][]).map((sec, i) => (
        <g key={sec}>
          <circle cx={MARGIN + i * 100} cy={H - 12} r={4} fill={SECTION_COLORS[sec]} />
          <text x={MARGIN + i * 100 + 7} y={H - 9} fontSize="7.5" fill="#8a7840" dominantBaseline="middle">
            {sec}
          </text>
        </g>
      ))}

      {/* Level label */}
      <text x={8} y={14} fontSize="9" fill={LEVEL_COLORS[showLevel]} fontWeight="bold">
        {showLevel === 0 ? 'SURFACE' : `LEVEL ${showLevel} (−${showLevel === 1 ? 5 : showLevel === 2 ? 11 : 18}m)`}
      </text>
      <text x={8} y={24} fontSize="7.5" fill="#6a5a3a">
        {levelObjs.length} objects at this level
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
  const [size,        setSize]        = useState<BunkerSize>('standard');
  const [style,       setStyle]       = useState<BunkerStyle>('military');
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
  const [copied,      setCopied]      = useState(false);
  const [mobileView,  setMobileView]  = useState<'config'|'preview'|'output'>('config');

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
    const blob = new Blob([output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bunker_seed${seed}.${fmt === 'json' ? 'json' : 'c'}`;
    a.click();
  }, [output, seed, fmt]);

  const maxLevel = levels;

  return (
    <div className="flex flex-col h-full bg-[#0a0804] text-[#c8b99a] font-mono overflow-hidden">

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2e2518] bg-[#0e0c08] shrink-0">
        <span className="text-[#d4a017] text-[12px] font-black tracking-wider">🏗 BUNKER MAKER</span>
        <span className="text-[#6a5a3a] text-[9px]">Random underground bunker generator</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[#9a8858] text-[9px]">{layout.stats.totalObjects} objects</span>
          <span className="text-[#5a4820] text-[8px]">·</span>
          <span className="text-[#9a8858] text-[9px]">{layout.stats.rooms} rooms</span>
          <span className="text-[#5a4820] text-[8px]">·</span>
          <span className="text-[#9a8858] text-[9px]">~{layout.stats.footprintRadius * 2}m wide</span>
          <button onClick={copy}
            className={`ml-2 px-2 py-1 text-[9px] font-bold border rounded-sm transition-all ${copied ? 'bg-[#27ae60] text-[#0a0804] border-[#27ae60]' : 'border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017] hover:text-[#0a0804]'}`}>
            {copied ? '✓' : 'Copy'}
          </button>
          <button onClick={download}
            className="px-2 py-1 text-[9px] font-bold bg-[#d4a017] text-[#0a0804] border border-[#d4a017] rounded-sm hover:bg-[#c8980f] transition-all">
            ⬇ DL
          </button>
        </div>
      </div>

      {/* ── Mobile tabs ─────────────────────────────────────────────────────── */}
      <div className="flex md:hidden border-b border-[#2e2518] bg-[#12100a] shrink-0">
        {(['config','preview','output'] as const).map(v => (
          <button key={v} onClick={() => setMobileView(v)}
            className={`flex-1 py-1.5 text-[9px] font-bold capitalize border-b-2 transition-all ${mobileView === v ? 'text-[#d4a017] border-[#d4a017]' : 'text-[#8a7840] border-transparent'}`}>
            {v === 'config' ? '⚙ Options' : v === 'preview' ? '🗺 Map' : '📋 Code'}
          </button>
        ))}
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT SIDEBAR — Options ─────────────────────────────────────────── */}
        <div className={`w-full md:w-64 shrink-0 border-r border-[#2e2518] bg-[#0e0c08] flex-col overflow-y-auto ${mobileView === 'config' ? 'flex' : 'hidden md:flex'}`}>

          {/* Seed */}
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">🎲 Random Seed</div>
            <div className="flex gap-1.5 items-center">
              <input type="number" value={seed} onChange={e => setSeed(+e.target.value)}
                className="flex-1 bg-[#12100a] border border-[#2e2518] rounded-sm px-2 py-1 text-[11px] text-[#d4a017] font-bold focus:outline-none focus:border-[#d4a017] min-w-0" />
              <button onClick={randomize}
                className="px-2 py-1 text-[9px] font-bold bg-[#d4a017]/20 border border-[#d4a017] text-[#d4a017] rounded-sm hover:bg-[#d4a017]/40 transition-all whitespace-nowrap">
                🎲 Random
              </button>
            </div>
            <div className="text-[7px] text-[#5a4820] mt-1">Same seed always gives the same bunker</div>
          </div>

          {/* Levels */}
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">🏗 Underground Levels</div>
            <div className="flex gap-1">
              {([1,2,3] as const).map(lv => (
                <button key={lv} onClick={() => { setLevels(lv); setPreviewLevel(0); }}
                  className={`flex-1 py-1.5 text-[10px] font-bold border rounded-sm transition-all ${levels === lv ? 'bg-[#d4a017] text-[#0a0804] border-[#d4a017]' : 'text-[#b09a6a] border-[#2e2518] hover:border-[#6a5820]'}`}>
                  {lv}
                </button>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {([0,...Array.from({length: levels}, (_,i)=>i+1)] as number[]).map(lv => (
                <button key={lv} onClick={() => setPreviewLevel(lv)}
                  className={`flex-1 py-0.5 text-[8px] border rounded-sm transition-all ${previewLevel === lv ? 'border-[#3498db] text-[#3498db]' : 'text-[#6a5a3a] border-[#1e1c18] hover:border-[#2e2518]'}`}
                  style={{ color: previewLevel === lv ? LEVEL_COLORS[lv] : undefined, borderColor: previewLevel === lv ? LEVEL_COLORS[lv] : undefined }}>
                  {lv === 0 ? 'Surf' : `L${lv}`}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">📐 Bunker Size</div>
            <div className="flex flex-col gap-1">
              {(Object.keys(SIZES) as BunkerSize[]).map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`text-left px-2 py-1.5 text-[10px] rounded-sm border transition-all ${size === s ? 'bg-[#d4a017]/20 border-[#d4a017] text-[#d4a017]' : 'border-[#2e2518] text-[#b09a6a] hover:border-[#5a4820]'}`}>
                  {SIZES[s].label}
                  <span className="ml-1 text-[8px] opacity-60">
                    {SIZES[s].spineMin}–{SIZES[s].spineMax} segments, {SIZES[s].branchMin}–{SIZES[s].branchMax} branches/lvl
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">🎨 Atmosphere Style</div>
            <div className="flex flex-col gap-1">
              {(Object.entries(STYLES) as [BunkerStyle, typeof STYLES[BunkerStyle]][]).map(([k, s]) => (
                <button key={k} onClick={() => setStyle(k)}
                  className={`text-left px-2 py-1.5 text-[10px] rounded-sm border transition-all ${style === k ? 'bg-[#d4a017]/20 border-[#d4a017] text-[#d4a017]' : 'border-[#2e2518] text-[#b09a6a] hover:border-[#5a4820]'}`}>
                  {s.label}
                  <div className="text-[7.5px] mt-0.5 opacity-60">{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Spine axis */}
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">🧭 Spine Orientation</div>
            <div className="flex gap-1">
              {(['NS','EW'] as const).map(ax => (
                <button key={ax} onClick={() => setSpineAxis(ax)}
                  className={`flex-1 py-1.5 text-[10px] font-bold border rounded-sm transition-all ${spineAxis === ax ? 'bg-[#d4a017] text-[#0a0804] border-[#d4a017]' : 'text-[#b09a6a] border-[#2e2518] hover:border-[#6a5820]'}`}>
                  {AXIS_LABELS[ax]}
                </button>
              ))}
            </div>
          </div>

          {/* Options toggles */}
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">⚙ Options</div>
            {[
              { label: '🧱 Encase Exterior in Walls', val: encaseExt, set: setEncaseExt, note: 'Surrounds entire surface footprint with walls — players cannot reach exterior' },
              { label: '🚛 Convoy in Tunnels', val: convoy, set: setConvoy, note: 'Places abandoned vehicle wrecks along the main spine corridor' },
              { label: '🪣 Decorative Props', val: decor, set: setDecor, note: 'Scatter crates, barrels, garbage for abandoned feel' },
              { label: '🪨 Concrete Floors', val: floors, set: setFloors, note: 'Place concrete slabs under rooms and corridors' },
              { label: '🔲 Sakhal Keypad Panels (1.25+)', val: sakhalPanels, set: setSakhalPanels, note: 'Use Sakhal underground console objects for entry/exit panels. Requires DayZ 1.25+.' },
            ].map(opt => (
              <div key={opt.label} className="mb-2">
                <button onClick={() => opt.set(!opt.val)}
                  className={`flex items-center gap-2 w-full text-left text-[10px] py-1 transition-all ${opt.val ? 'text-[#d4a017]' : 'text-[#6a5a3a]'}`}>
                  <span className={`w-3 h-3 border rounded-sm flex items-center justify-center shrink-0 ${opt.val ? 'border-[#d4a017] bg-[#d4a017]/30' : 'border-[#3a3020]'}`}>
                    {opt.val && <span className="text-[8px] text-[#d4a017]">✓</span>}
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
                      className={`flex-1 py-1 text-[8px] font-bold border rounded-sm transition-all ${decorDensity === d ? 'bg-[#d4a017]/30 border-[#d4a017] text-[#d4a017]' : 'text-[#6a5a3a] border-[#2e2518] hover:border-[#4a3820]'}`}>
                      {DENSITY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* World Position */}
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1">📍 World Origin</div>
            <div className="text-[7px] text-[#5a4820] mb-2 leading-relaxed">
              Set X/Z to your in-game position. Set Y to terrain height — underground pieces auto-sink below this.
            </div>
            {([['X', posX, setPosX], ['Y (terrain height)', posY, setPosY], ['Z', posZ, setPosZ]] as [string, number, (v:number)=>void][]).map(([label, val, set]) => (
              <div key={label} className="flex items-center gap-2 mb-1">
                <span className="text-[8px] text-[#8a7840] w-14 shrink-0 truncate">{label}</span>
                <input type="number" step="0.1" value={val} onChange={e => set(+e.target.value)}
                  className="flex-1 bg-[#12100a] border border-[#2e2518] rounded-sm px-2 py-0.5 text-[10px] text-[#c8b99a] focus:outline-none focus:border-[#d4a017] min-w-0" />
              </div>
            ))}
          </div>

          {/* Export format */}
          <div className="px-3 py-2">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">💾 Export Format</div>
            <div className="flex gap-1">
              {(['initc','json'] as const).map(f => (
                <button key={f} onClick={() => setFmt(f)}
                  className={`flex-1 py-1.5 text-[10px] font-bold border rounded-sm transition-all ${fmt === f ? 'bg-[#d4a017] text-[#0a0804] border-[#d4a017]' : 'text-[#b09a6a] border-[#2e2518] hover:border-[#6a5820]'}`}>
                  {f === 'json' ? 'JSON Spawner' : 'init.c'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER — Floor Plan Preview ─────────────────────────────────────── */}
        <div className={`flex flex-col overflow-hidden md:w-80 shrink-0 border-r border-[#2e2518] ${mobileView === 'preview' ? 'flex w-full' : 'hidden md:flex'}`}>
          {/* Level switcher */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#2e2518] bg-[#0e0c08] shrink-0">
            <span className="text-[9px] text-[#6a5a3a] uppercase tracking-wider mr-1">Level:</span>
            {([0, ...Array.from({length: levels}, (_,i) => i+1)]).map(lv => (
              <button key={lv} onClick={() => setPreviewLevel(lv)}
                className={`px-2 py-0.5 text-[9px] font-bold border rounded-sm transition-all`}
                style={{
                  color: previewLevel === lv ? '#0a0804' : LEVEL_COLORS[lv],
                  background: previewLevel === lv ? LEVEL_COLORS[lv] : 'transparent',
                  borderColor: LEVEL_COLORS[lv],
                }}>
                {lv === 0 ? '🌍 Surface' : `L${lv}`}
              </button>
            ))}
          </div>

          {/* SVG floor plan */}
          <div className="flex-1 bg-[#060402] min-h-0">
            <FloorPlanSVG layout={layout} showLevel={previewLevel} />
          </div>

          {/* Stats strip */}
          <div className="shrink-0 px-3 py-2 border-t border-[#2e2518] bg-[#0e0c08]">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-[10px] font-bold text-[#d4a017]">{layout.stats.totalObjects}</div>
                <div className="text-[7.5px] text-[#6a5a3a]">Total Objects</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-[#27ae60]">{layout.stats.rooms}</div>
                <div className="text-[7.5px] text-[#6a5a3a]">Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-[#3498db]">{layout.stats.corridorSegments}</div>
                <div className="text-[7.5px] text-[#6a5a3a]">Corridor Segs</div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(Object.entries(SECTION_COLORS) as [PlacedObject['section'], string][])
                .filter(([s]) => ['entrance','exit','room','spine','stair','decor','exterior','panel'].includes(s))
                .map(([sec, col]) => (
                <div key={sec} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: col }} />
                  <span className="text-[7px] text-[#6a5a3a] capitalize">{sec}</span>
                </div>
              ))}
            </div>

            {/* Sakhal panel warning */}
            {sakhalPanels && (
              <div className="mt-2 bg-[#1a1408] border border-[#9b59b633] rounded-sm px-2 py-1">
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
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2e2518] bg-[#0e0c08] shrink-0">
            <span className="text-[#d4a017] text-[10px] font-bold tracking-wider">
              ▶ {fmt === 'initc' ? 'INIT.C OUTPUT' : 'JSON SPAWNER'}
            </span>
            <span className="text-[#6a5a3a] text-[9px]">
              {fmt === 'initc' ? '— paste into mission init.c' : '— paste into JSON Spawner mod'}
            </span>
            <div className="ml-auto flex gap-1.5">
              <button onClick={copy}
                className={`px-3 py-1 text-[10px] font-bold border rounded-sm transition-all ${copied ? 'bg-[#27ae60] text-[#0a0804] border-[#27ae60]' : 'border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017] hover:text-[#0a0804]'}`}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button onClick={download}
                className="px-3 py-1 text-[10px] font-bold bg-[#d4a017] text-[#0a0804] border border-[#d4a017] rounded-sm hover:bg-[#c8980f] transition-all">
                ⬇ Download
              </button>
            </div>
          </div>

          {/* Object filter pills */}
          <div className="flex flex-wrap gap-1 px-3 py-1.5 border-b border-[#2e2518] bg-[#0a0906] shrink-0">
            {(Object.entries({
              '🚪 Entrance': layout.objects.filter(o => o.section === 'entrance').length,
              '🏠 Rooms':    layout.objects.filter(o => o.section === 'room').length,
              '🚇 Corridors':layout.objects.filter(o => o.section === 'spine' || o.section === 'branch').length,
              '🪜 Stairs':   layout.objects.filter(o => o.section === 'stair').length,
              '🎨 Decor':    layout.objects.filter(o => o.section === 'decor').length,
              '🧱 Exterior': layout.objects.filter(o => o.section === 'exterior').length,
            })).filter(([,count]) => count > 0).map(([label, count]) => (
              <div key={label}
                className="flex items-center gap-1 bg-[#0e0c08] border border-[#2e2518] rounded-sm px-1.5 py-0.5">
                <span className="text-[8px] text-[#b09a6a]">{label}</span>
                <span className="text-[8px] text-[#d4a017] font-bold">{count}</span>
              </div>
            ))}
          </div>

          <pre className="flex-1 overflow-auto px-3 py-2 text-[10px] text-[#c8b99a] leading-relaxed whitespace-pre bg-[#070503] min-h-0">{output}</pre>

          {/* Tip bar */}
          <div className="px-3 py-1.5 border-t border-[#2e2518] bg-[#0e0c08] shrink-0">
            <div className="text-[8px] text-[#6a5a3a] leading-relaxed">
              💡 <strong className="text-[#9a8858]">Tips:</strong>{' '}
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
