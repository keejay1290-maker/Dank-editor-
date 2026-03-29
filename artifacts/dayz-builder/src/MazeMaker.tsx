import React, { useState, useMemo, useCallback } from "react";
import { getShapePoints } from "@/lib/shapeGenerators";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";

// ─── Wall object options (console-safe) ───────────────────────────────────────
const WALL_OBJECTS = [
  { value: "Land_Castle_Wall_3m_DE",   label: "Castle Stone Wall 3m ★ Best Medieval" },
  { value: "Land_Castle_Wall_6m_DE",   label: "Castle Stone Wall 6m (tall)" },
  { value: "Land_Wall_Concrete_4m_DE", label: "Concrete Wall 4m ★ Best Modern" },
  { value: "Land_Wall_Concrete_8m_DE", label: "Concrete Wall 8m (tall)" },
  { value: "Land_Wall_Brick_4m_DE",    label: "Brick Wall 4m" },
  { value: "Land_HBarrier_5m_DE",      label: "HESCO 5m ★ Best Military" },
  { value: "Land_HBarrier_10m_DE",     label: "HESCO 10m (double-length)" },
  { value: "Land_BarbedWire_Spool_DE", label: "Barbed Wire Spool" },
  { value: "Land_Mil_Tent_DE",         label: "Military Tent (large maze)" },
  { value: "Land_Container_1Bo_DE",    label: "Shipping Container (mega maze)" },
];

// ─── Seeded RNG (same as shapeGenerators arena_maze) ─────────────────────────
function makeMazeGrid(seed: number, size: number, roomSz: number) {
  const cellW = size, cellH = size;
  const mid = Math.floor(size / 2);
  const rs = Math.min(roomSz, Math.floor(size / 2) - 1 || 1);

  let rng = (seed * 6364136223846793005 + 1) >>> 0;
  const rand = () => {
    rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5;
    return (rng >>> 0) / 0xffffffff;
  };
  for (let i = 0; i < 32; i++) rand();

  const roomR0 = mid - Math.floor(rs / 2);
  const roomR1 = roomR0 + rs - 1;
  const roomC0 = mid - Math.floor(rs / 2);
  const roomC1 = roomC0 + rs - 1;

  const hWalls: boolean[][] = Array.from({ length: cellH + 1 }, () => Array(cellW).fill(true));
  const vWalls: boolean[][] = Array.from({ length: cellH }, () => Array(cellW + 1).fill(true));
  const visited = Array.from({ length: cellH }, () => Array(cellW).fill(false));

  for (let r = roomR0; r <= roomR1; r++) {
    for (let c = roomC0; c <= roomC1; c++) {
      visited[r][c] = true;
      if (r > roomR0) hWalls[r][c] = false;
      if (c > roomC0) vWalls[r][c] = false;
    }
  }

  const roomMidR = Math.floor((roomR0 + roomR1) / 2);
  const roomMidC = Math.floor((roomC0 + roomC1) / 2);
  if (roomR0 > 0)       hWalls[roomR0][roomMidC]   = false;
  if (roomR1 < cellH-1) hWalls[roomR1+1][roomMidC] = false;
  if (roomC0 > 0)       vWalls[roomMidR][roomC0]   = false;
  if (roomC1 < cellW-1) vWalls[roomMidR][roomC1+1] = false;

  const starts: [number, number][] = [];
  const markStart = (r: number, c: number) => {
    if (r >= 0 && r < cellH && c >= 0 && c < cellW && !visited[r][c]) {
      visited[r][c] = true; starts.push([r, c]);
    }
  };
  markStart(roomR0-1, roomMidC); markStart(roomR1+1, roomMidC);
  markStart(roomMidR, roomC0-1); markStart(roomMidR, roomC1+1);
  [[0,0],[0,cellW-1],[cellH-1,0],[cellH-1,cellW-1]].forEach(([r,c]) => markStart(r,c));

  const stack: [number, number][] = [...starts];
  while (stack.length) {
    const idx = stack.length - 1;
    const [r, c] = stack[idx];
    const nbrs: [number, number, string][] = [];
    if (r > 0 && !visited[r-1][c]) nbrs.push([r-1, c, 'N']);
    if (r < cellH-1 && !visited[r+1][c]) nbrs.push([r+1, c, 'S']);
    if (c > 0 && !visited[r][c-1]) nbrs.push([r, c-1, 'W']);
    if (c < cellW-1 && !visited[r][c+1]) nbrs.push([r, c+1, 'E']);
    if (!nbrs.length) { stack.splice(idx, 1); continue; }
    const [nr, nc, dir] = nbrs[Math.floor(rand() * nbrs.length)];
    visited[nr][nc] = true;
    if (dir === 'N')      hWalls[r][c]     = false;
    else if (dir === 'S') hWalls[r+1][c]   = false;
    else if (dir === 'W') vWalls[r][c]     = false;
    else if (dir === 'E') vWalls[r][c+1]   = false;
    stack.push([nr, nc]);
  }

  return { hWalls, vWalls, roomR0, roomR1, roomC0, roomC1, cellW, cellH };
}

// ─── SVG Maze Preview ─────────────────────────────────────────────────────────
function MazePreview({ seed, size, roomSz }: { seed: number; size: number; roomSz: number }) {
  const { hWalls, vWalls, roomR0, roomR1, roomC0, roomC1, cellW, cellH } = useMemo(
    () => makeMazeGrid(seed, size, roomSz),
    [seed, size, roomSz]
  );

  const SVG_PAD = 8;
  const SVG_SIZE = 340;
  const cellPx = (SVG_SIZE - SVG_PAD * 2) / Math.max(cellW, cellH);
  const W = cellW * cellPx + SVG_PAD * 2;
  const H = cellH * cellPx + SVG_PAD * 2;
  const STROKE = Math.max(1.5, cellPx * 0.2);

  const wallLines: React.ReactElement[] = [];

  // Horizontal walls
  for (let r = 0; r <= cellH; r++) {
    for (let c = 0; c < cellW; c++) {
      if (!hWalls[r][c]) continue;
      const x1 = SVG_PAD + c * cellPx;
      const y1 = SVG_PAD + r * cellPx;
      wallLines.push(
        <line key={`h${r}-${c}`} x1={x1} y1={y1} x2={x1 + cellPx} y2={y1}
          stroke="#c8a84a" strokeWidth={STROKE} strokeLinecap="round" />
      );
    }
  }

  // Vertical walls
  for (let r = 0; r < cellH; r++) {
    for (let c = 0; c <= cellW; c++) {
      if (!vWalls[r][c]) continue;
      const x1 = SVG_PAD + c * cellPx;
      const y1 = SVG_PAD + r * cellPx;
      wallLines.push(
        <line key={`v${r}-${c}`} x1={x1} y1={y1} x2={x1} y2={y1 + cellPx}
          stroke="#c8a84a" strokeWidth={STROKE} strokeLinecap="round" />
      );
    }
  }

  // Winner's room highlight
  const rxPx = SVG_PAD + roomC0 * cellPx;
  const ryPx = SVG_PAD + roomR0 * cellPx;
  const rw = (roomC1 - roomC0 + 1) * cellPx;
  const rh = (roomR1 - roomR0 + 1) * cellPx;

  // Entry / exit markers (N and S edges)
  const mid = Math.floor(size / 2);
  const roomMidC = Math.floor((roomC0 + roomC1) / 2);
  const northEntry = SVG_PAD + roomMidC * cellPx + cellPx / 2;
  const southEntry = SVG_PAD + roomMidC * cellPx + cellPx / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[400px] mx-auto" style={{ background: "#0a0804" }}>
      {/* Cell background */}
      <rect x={SVG_PAD} y={SVG_PAD} width={cellW * cellPx} height={cellH * cellPx} fill="#12100a" />

      {/* Winner's room */}
      <rect x={rxPx} y={ryPx} width={rw} height={rh} fill="#2a2000" stroke="#d4a017" strokeWidth={1.5} />
      <text x={rxPx + rw/2} y={ryPx + rh/2 + 4} textAnchor="middle" fill="#d4a017" fontSize={Math.max(7, cellPx * 0.6)} fontWeight="bold">🏆</text>

      {/* Entry markers at top & bottom */}
      <rect x={northEntry - cellPx * 0.35} y={SVG_PAD - 5} width={cellPx * 0.7} height={8} fill="#27ae60" rx="2" />
      <rect x={southEntry - cellPx * 0.35} y={SVG_PAD + cellH * cellPx - 3} width={cellPx * 0.7} height={8} fill="#e74c3c" rx="2" />

      {/* Walls */}
      {wallLines}

      {/* Legend */}
      <rect x={SVG_PAD} y={SVG_PAD - 6} width={8} height={6} fill="#27ae60" rx="1" />
      <text x={SVG_PAD + 10} y={SVG_PAD - 1} fill="#6a5a3a" fontSize="8">Entry</text>
      <rect x={SVG_PAD + 44} y={SVG_PAD - 6} width={8} height={6} fill="#e74c3c" rx="1" />
      <text x={SVG_PAD + 54} y={SVG_PAD - 1} fill="#6a5a3a" fontSize="8">Exit</text>
    </svg>
  );
}

// ─── MAZE MAKER MAIN COMPONENT ────────────────────────────────────────────────
export default function MazeMaker() {
  const [seed,    setSeed]    = useState(42);
  const [size,    setSize]    = useState(10);
  const [wallH,   setWallH]   = useState(3);
  const [roomSz,  setRoomSz]  = useState(3);
  const [detail,  setDetail]  = useState(2);
  const [wallObj, setWallObj] = useState("Land_Castle_Wall_3m_DE");
  const [posX,    setPosX]    = useState(0);
  const [posY,    setPosY]    = useState(0);
  const [posZ,    setPosZ]    = useState(0);
  const [yaw,     setYaw]     = useState(0);
  const [format,  setFormat]  = useState<"initc" | "json">("initc");
  const [toast,   setToast]   = useState("");
  const [mobileTab, setMobileTab] = useState<"options" | "map" | "code">("options");

  const rollSeed = () => setSeed(Math.floor(Math.random() * 9998) + 1);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  // ── Generate spawn points ────────────────────────────────────────────────────
  const points = useMemo(() =>
    getShapePoints("arena_maze", { scale: 1, size, wallH, seed, roomSz, detail }),
    [size, wallH, seed, roomSz, detail]
  );

  // ── Build code output ────────────────────────────────────────────────────────
  const output = useMemo(() => {
    const wallLabel = WALL_OBJECTS.find(w => w.value === wallObj)?.label.split("★")[0].trim() ?? wallObj;

    if (format === "json") {
      const entries = points.map(pt => JSON.stringify({
        name: wallObj,
        pos: [
          parseFloat((pt.x + posX).toFixed(6)),
          parseFloat((pt.y + posY).toFixed(6)),
          parseFloat((pt.z + posZ).toFixed(6)),
        ],
        ypr: [parseFloat(yaw.toFixed(6)), 0, 0],
        scale: 1.0,
        enableCEPersistency: 0,
      }));
      return `[\n${entries.join(",\n")}\n]`;
    }

    const header = [
      HELPER_FUNC,
      ``,
      `// ═══════════════════════════════════════════════════════`,
      `// 🌀  MAZE ARENA — Generated by DankDayZ Ultimate Builder`,
      `// ═══════════════════════════════════════════════════════`,
      `// Grid : ${size}×${size} cells`,
      `// Seed : ${seed}`,
      `// Walls: ${wallLabel}`,
      `// Wall Height: ${wallH}m   Room: ${roomSz}×${roomSz}   Detail: ${detail}/3`,
      `// Objects: ${points.length}`,
      `// Position: X=${posX} Y=${posY} Z=${posZ}  Yaw=${yaw}°`,
      `// ───────────────────────────────────────────────────────`,
      ``,
    ].join("\n");

    const body = points
      .map(pt => formatInitC(wallObj, pt.x + posX, pt.y + posY, pt.z + posZ, 0, yaw, 0, 1.0))
      .join("\n");

    return header + body;
  }, [points, posX, posY, posZ, yaw, wallObj, format, size, seed, wallH, roomSz, detail]);

  const copyOutput = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));
  const downloadOutput = () => {
    const ext = format === "json" ? "json" : "c";
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `maze_${size}x${size}_seed${seed}.${ext}` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast(`✓ Downloaded maze_${size}x${size}_seed${seed}.${ext}`);
  };

  // ── Slider helper ────────────────────────────────────────────────────────────
  const Slider = ({ label, value, onChange, min, max, step, unit = "" }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step: number; unit?: string;
  }) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-[#9a8858] text-[10px]">{label}</span>
        <span className="text-[#d4a017] text-[10px] font-bold">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-[#2e2518] rounded-full appearance-none cursor-pointer accent-[#d4a017]" />
    </div>
  );

  const NumInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex-1">
      <div className="text-[#9a8858] text-[9px] mb-0.5">{label}</div>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-[#1a1610] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4a017]" />
    </div>
  );

  // ── Sidebar panel ────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="p-3 space-y-4">

      {/* Seed */}
      <div>
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">🌀 Maze Seed</div>
        <div className="flex gap-1.5 mb-2">
          <input type="number" min={1} max={9999} value={seed}
            onChange={e => setSeed(Math.max(1, Math.min(9999, Number(e.target.value))))}
            className="flex-1 bg-[#1a1610] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#d4a017]" />
          <button onClick={rollSeed}
            className="px-3 py-1.5 bg-[#d4a017] text-[#0a0804] text-[10px] font-bold rounded-sm hover:bg-[#e8b82a] transition-colors">
            🎲 ROLL
          </button>
        </div>
        <p className="text-[#5a4a2a] text-[9px]">Different seed = completely different maze layout</p>
      </div>

      {/* Grid & Wall settings */}
      <div>
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">📐 Maze Layout</div>
        <Slider label="Grid Size" value={size} onChange={setSize} min={5} max={20} step={1} unit=" cells" />
        <Slider label="Wall Height" value={wallH} onChange={setWallH} min={1.5} max={8} step={0.5} unit="m" />
        <Slider label="Winner Room" value={roomSz} onChange={setRoomSz} min={2} max={5} step={1} unit=" cells" />
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-[#9a8858] text-[10px]">Detail Level</span>
            <span className="text-[#d4a017] text-[10px] font-bold">
              {detail === 1 ? "1 — Light" : detail === 2 ? "2 — Medium" : "3 — Heavy"}
            </span>
          </div>
          <div className="flex gap-1">
            {[1,2,3].map(d => (
              <button key={d} onClick={() => setDetail(d)}
                className={`flex-1 py-1 text-[10px] font-bold rounded-sm border transition-colors ${detail === d ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017]" : "border-[#2e2518] text-[#6a5a3a] hover:border-[#d4a017] hover:text-[#d4a017]"}`}>
                {d === 1 ? "Light" : d === 2 ? "Medium" : "Heavy"}
              </button>
            ))}
          </div>
          <p className="text-[#4a3a1a] text-[8px] mt-1">Heavy adds loot barrels + corner pieces</p>
        </div>
      </div>

      {/* Wall object */}
      <div>
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">🧱 Wall Object</div>
        <select value={wallObj} onChange={e => setWallObj(e.target.value)}
          className="w-full bg-[#1a1610] border border-[#2e2518] text-[#c8b99a] text-[10px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#d4a017]">
          {WALL_OBJECTS.map(w => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
        <div className="text-[#4a3a1a] text-[9px] mt-1 font-mono">{wallObj}</div>
      </div>

      {/* Position */}
      <div>
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">📍 World Position</div>
        <div className="flex gap-1.5 mb-1.5">
          <NumInput label="X" value={posX} onChange={setPosX} />
          <NumInput label="Y" value={posY} onChange={setPosY} />
          <NumInput label="Z" value={posZ} onChange={setPosZ} />
        </div>
        <Slider label="Yaw (rotation)" value={yaw} onChange={setYaw} min={0} max={359} step={1} unit="°" />
      </div>

      {/* Format */}
      <div>
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">📄 Output Format</div>
        <div className="flex gap-1">
          <button onClick={() => setFormat("initc")}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-colors ${format === "initc" ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017]" : "border-[#2e2518] text-[#6a5a3a] hover:border-[#d4a017] hover:text-[#d4a017]"}`}>
            init.c
          </button>
          <button onClick={() => setFormat("json")}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-colors ${format === "json" ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017]" : "border-[#2e2518] text-[#6a5a3a] hover:border-[#d4a017] hover:text-[#d4a017]"}`}>
            JSON
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="border border-[#2e2518] rounded-sm p-2 bg-[#0e0c08]">
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">📊 Stats</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#d4a017] text-[9px] px-2 py-0.5 rounded-sm font-bold">{points.length} objects</span>
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">{size}×{size} grid</span>
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">~{(size * 2.5).toFixed(0)}×{(size * 2.5).toFixed(0)}m</span>
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">Seed #{seed}</span>
        </div>
        {points.length > 600 && (
          <p className="text-[#e67e22] text-[9px] mt-1.5">⚠ {points.length} objects — large server event size</p>
        )}
      </div>
    </div>
  );

  // ── Code output panel ─────────────────────────────────────────────────────────
  const CodePanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2e2518] shrink-0">
        <button onClick={() => setFormat("initc")}
          className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-colors ${format === "initc" ? "bg-[#d4a017] text-[#0a0804]" : "text-[#6a5a3a] border border-[#2e2518] hover:border-[#d4a017]"}`}>
          init.c
        </button>
        <button onClick={() => setFormat("json")}
          className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-colors ${format === "json" ? "bg-[#d4a017] text-[#0a0804]" : "text-[#6a5a3a] border border-[#2e2518] hover:border-[#d4a017]"}`}>
          JSON
        </button>
        <span className="text-[#5a4a2a] text-[10px] ml-1">{points.length} objects</span>
        <div className="ml-auto flex gap-1.5">
          <button onClick={copyOutput}
            className="px-3 py-1 bg-[#1a1610] border border-[#2e2518] text-[#b09a6a] text-[10px] rounded-sm hover:border-[#d4a017] hover:text-[#d4a017] transition-colors">
            Copy
          </button>
          <button onClick={downloadOutput}
            className="px-3 py-1 bg-[#d4a017] text-[#0a0804] text-[10px] font-bold rounded-sm hover:bg-[#e8b82a] transition-colors">
            Download
          </button>
        </div>
      </div>
      <pre className="flex-1 overflow-auto p-3 text-[10px] leading-relaxed font-mono text-[#7a9a5a] whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );

  // ── DESKTOP layout (sidebar | maze preview | code) ─────────────────────────
  return (
    <div className="flex flex-1 overflow-hidden bg-[#0a0804] relative">

      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-white text-[11px] font-bold px-4 py-2 rounded-sm shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden absolute top-0 left-0 right-0 flex border-b border-[#2e2518] bg-[#0e0c08] z-10">
        {(["options","map","code"] as const).map(t => (
          <button key={t} onClick={() => setMobileTab(t)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mobileTab === t ? "text-[#d4a017] border-b-2 border-[#d4a017]" : "text-[#6a5a3a]"}`}>
            {t === "options" ? "⚙ Options" : t === "map" ? "🗺 Map" : "📋 Code"}
          </button>
        ))}
      </div>

      {/* ── SIDEBAR ── */}
      <div className={`${mobileTab !== "options" ? "hidden md:flex" : "flex"} w-full md:w-72 shrink-0 bg-[#0e0c08] border-r border-[#2e2518] overflow-y-auto flex-col md:mt-0 mt-9`}>
        {/* Header */}
        <div className="px-3 py-3 border-b border-[#2e2518] shrink-0">
          <div className="text-[#d4a017] font-bold text-[13px]">🌀 MAZE BUILDER</div>
          <div className="text-[#6a5a3a] text-[9px] mt-0.5">Procedural seeded maze arena</div>
        </div>
        <SidebarContent />
      </div>

      {/* ── MAZE PREVIEW ── */}
      <div className={`${mobileTab !== "map" ? "hidden md:flex" : "flex"} flex-col flex-1 overflow-hidden border-r border-[#2e2518] md:mt-0 mt-9`}>
        <div className="px-3 py-2 border-b border-[#2e2518] shrink-0 flex items-center gap-2">
          <span className="text-[#9a8858] text-[10px] uppercase tracking-wider">Top-Down Map Preview</span>
          <span className="text-[#4a3a1a] text-[9px]">— {size}×{size} grid, Seed #{seed}</span>
          <button onClick={rollSeed}
            className="ml-auto px-2 py-0.5 bg-[#1a1610] border border-[#2e2518] text-[#d4a017] text-[9px] rounded-sm hover:border-[#d4a017] transition-colors">
            🎲 New Maze
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <MazePreview seed={seed} size={size} roomSz={roomSz} />
            <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#d4a017] text-[9px] px-2 py-0.5 rounded-sm font-bold">{points.length} objects</span>
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">{size}×{size} cells</span>
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">~{(size * 2.5).toFixed(0)}×{(size * 2.5).toFixed(0)}m footprint</span>
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#27ae60] text-[9px] px-2 py-0.5 rounded-sm">🏆 Winner room: centre</span>
            </div>
            <div className="mt-3 bg-[#0e0c08] border border-[#2e2518] rounded-sm p-2.5 text-[9px] text-[#5a4a2a] leading-relaxed">
              <p className="mb-1"><span className="text-[#27ae60]">■</span> Green = entry   <span className="text-[#e74c3c]">■</span> Red = exit   <span className="text-[#d4a017]">■</span> Gold = winner's room</p>
              <p>Walls shown in gold. Every corridor connects — no dead-end islands. Players enter from North, winner's room is the 🏆 centre chamber.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CODE OUTPUT ── */}
      <div className={`${mobileTab !== "code" ? "hidden md:flex" : "flex"} flex-col w-full md:w-[420px] shrink-0 overflow-hidden md:mt-0 mt-9`}>
        <CodePanel />
      </div>
    </div>
  );
}
