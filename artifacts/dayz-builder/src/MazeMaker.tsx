import React, { useState, useMemo, useCallback } from "react";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";

// ─── Wall object registry — base length (m) = how long each model is at scale 1 ─
const WALL_OBJECTS = [
  { value: "Land_Castle_Wall_3m_DE",   label: "Castle Stone Wall 3m ★ Best Medieval", baseLen: 3 },
  { value: "Land_Castle_Wall_6m_DE",   label: "Castle Stone Wall 6m (tall)",           baseLen: 6 },
  { value: "Land_Wall_Concrete_4m_DE", label: "Concrete Wall 4m ★ Best Modern",        baseLen: 4 },
  { value: "Land_Wall_Concrete_8m_DE", label: "Concrete Wall 8m (tall)",               baseLen: 8 },
  { value: "Land_Wall_Brick_4m_DE",    label: "Brick Wall 4m",                         baseLen: 4 },
  { value: "Land_HBarrier_5m_DE",      label: "HESCO 5m ★ Best Military",              baseLen: 5 },
  { value: "Land_HBarrier_10m_DE",     label: "HESCO 10m (double-length)",             baseLen: 10 },
  { value: "Land_Container_1Bo_DE",    label: "Shipping Container",                    baseLen: 6 },
];

// Max wall objects so we never exceed 1000
const MAX_OBJ = 1000;

// ─── Seeded RNG (same algorithm as arena_maze generator) ─────────────────────
function makeMazeGrid(seed: number, size: number, roomSz: number) {
  const cellW = size, cellH = size;
  const mid   = Math.floor(size / 2);
  const rs    = Math.min(roomSz, Math.floor(size / 2) - 1 || 1);

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
    if (r > 0       && !visited[r-1][c]) nbrs.push([r-1, c, 'N']);
    if (r < cellH-1 && !visited[r+1][c]) nbrs.push([r+1, c, 'S']);
    if (c > 0       && !visited[r][c-1]) nbrs.push([r, c-1, 'W']);
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

// ─── Generate one spawn per wall segment (scaled) ────────────────────────────
// Returns array of { x, y, z, yaw } world positions.
// cellSz = baseLen * wallScale  →  each scaled object exactly fills one corridor
// h-walls (East-West): yaw = 90°  |  v-walls (North-South): yaw = 0°
interface SpawnPt { x: number; y: number; z: number; yaw: number }

function generateMazeSpawns(
  seed: number, size: number, roomSz: number,
  baseLen: number, wallScale: number,
  posX: number, posY: number, posZ: number,
  userYaw: number,
): SpawnPt[] {
  const { hWalls, vWalls, roomR0, roomR1, roomC0, roomC1, cellW, cellH } = makeMazeGrid(seed, size, roomSz);

  const cellSz = baseLen * wallScale;       // each cell in metres
  const offX   = -(cellW * cellSz) / 2;
  const offZ   = -(cellH * cellSz) / 2;

  const inRoom = (r: number, c: number) => r >= roomR0 && r <= roomR1 && c >= roomC0 && c <= roomC1;
  const hSkip  = (r: number, c: number) => inRoom(r, c) && r > 0 && inRoom(r-1, c);
  const vSkip  = (r: number, c: number) => inRoom(r, c) && c > 0 && inRoom(r, c-1);

  const pts: SpawnPt[] = [];

  // Horizontal walls — each extends East-West, yaw = 90
  for (let r = 0; r <= cellH; r++) {
    for (let c = 0; c < cellW; c++) {
      if (!hWalls[r][c]) continue;
      if (hSkip(r, c)) continue;
      pts.push({
        x: offX + (c + 0.5) * cellSz + posX,
        y: posY,
        z: offZ + r * cellSz + posZ,
        yaw: 90 + userYaw,
      });
    }
  }

  // Vertical walls — each extends North-South, yaw = 0
  for (let r = 0; r < cellH; r++) {
    for (let c = 0; c <= cellW; c++) {
      if (!vWalls[r][c]) continue;
      if (vSkip(r, c)) continue;
      pts.push({
        x: offX + c * cellSz + posX,
        y: posY,
        z: offZ + (r + 0.5) * cellSz + posZ,
        yaw: 0 + userYaw,
      });
    }
  }

  return pts;
}

// ─── SVG Maze Preview (top-down) ─────────────────────────────────────────────
function MazePreview({ seed, size, roomSz }: { seed: number; size: number; roomSz: number }) {
  const { hWalls, vWalls, roomR0, roomR1, roomC0, roomC1, cellW, cellH } = useMemo(
    () => makeMazeGrid(seed, size, roomSz),
    [seed, size, roomSz]
  );

  const PAD  = 8;
  const SIDE = 340;
  const cpx  = (SIDE - PAD * 2) / Math.max(cellW, cellH);
  const W    = cellW * cpx + PAD * 2;
  const H    = cellH * cpx + PAD * 2;
  const SW   = Math.max(1.5, cpx * 0.22);

  const wallLines: React.ReactElement[] = [];
  for (let r = 0; r <= cellH; r++) {
    for (let c = 0; c < cellW; c++) {
      if (!hWalls[r][c]) continue;
      const x1 = PAD + c * cpx, y1 = PAD + r * cpx;
      wallLines.push(<line key={`h${r}-${c}`} x1={x1} y1={y1} x2={x1+cpx} y2={y1}
        stroke="#c8a84a" strokeWidth={SW} strokeLinecap="round" />);
    }
  }
  for (let r = 0; r < cellH; r++) {
    for (let c = 0; c <= cellW; c++) {
      if (!vWalls[r][c]) continue;
      const x1 = PAD + c * cpx, y1 = PAD + r * cpx;
      wallLines.push(<line key={`v${r}-${c}`} x1={x1} y1={y1} x2={x1} y2={y1+cpx}
        stroke="#c8a84a" strokeWidth={SW} strokeLinecap="round" />);
    }
  }

  const rxPx = PAD + roomC0 * cpx, ryPx = PAD + roomR0 * cpx;
  const rw   = (roomC1 - roomC0 + 1) * cpx, rh = (roomR1 - roomR0 + 1) * cpx;
  const roomMidC = Math.floor((roomC0 + roomC1) / 2);
  const entryX   = PAD + roomMidC * cpx + cpx / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[400px] mx-auto" style={{ background: "#0a0804" }}>
      <rect x={PAD} y={PAD} width={cellW*cpx} height={cellH*cpx} fill="#12100a" />
      <rect x={rxPx} y={ryPx} width={rw} height={rh} fill="#2a2000" stroke="#d4a017" strokeWidth={1.5} />
      <text x={rxPx+rw/2} y={ryPx+rh/2+4} textAnchor="middle" fill="#d4a017"
        fontSize={Math.max(7, cpx * 0.6)} fontWeight="bold">🏆</text>
      <rect x={entryX - cpx*0.35} y={PAD - 5} width={cpx*0.7} height={8} fill="#27ae60" rx="2" />
      <rect x={entryX - cpx*0.35} y={PAD + cellH*cpx - 3} width={cpx*0.7} height={8} fill="#e74c3c" rx="2" />
      {wallLines}
      <rect x={PAD}    y={PAD-6} width={8} height={6} fill="#27ae60" rx="1"/>
      <text x={PAD+10} y={PAD-1} fill="#6a5a3a" fontSize="8">Entry</text>
      <rect x={PAD+44} y={PAD-6} width={8} height={6} fill="#e74c3c" rx="1"/>
      <text x={PAD+54} y={PAD-1} fill="#6a5a3a" fontSize="8">Exit</text>
    </svg>
  );
}

// ─── MAZE MAKER ───────────────────────────────────────────────────────────────
export default function MazeMaker() {
  const [seed,      setSeed]      = useState(42);
  const [size,      setSize]      = useState(12);
  const [wallScale, setWallScale] = useState(2.0);
  const [roomSz,    setRoomSz]    = useState(3);
  const [wallObj,   setWallObj]   = useState("Land_Castle_Wall_3m_DE");
  const [posX,      setPosX]      = useState(0);
  const [posY,      setPosY]      = useState(0);
  const [posZ,      setPosZ]      = useState(0);
  const [yaw,       setYaw]       = useState(0);
  const [format,    setFormat]    = useState<"initc" | "json">("initc");
  const [toast,     setToast]     = useState("");
  const [mobileTab, setMobileTab] = useState<"options"|"map"|"code">("options");

  const rollSeed = () => setSeed(Math.floor(Math.random() * 9998) + 1);

  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(""), 2200);
  }, []);

  const wallDef = WALL_OBJECTS.find(w => w.value === wallObj) ?? WALL_OBJECTS[0];

  // Cell size in metres
  const cellSz = +(wallDef.baseLen * wallScale).toFixed(2);

  // Max safe size: (size+1)² ≤ MAX_OBJ → size ≤ sqrt(MAX_OBJ) - 1
  const maxSize = Math.floor(Math.sqrt(MAX_OBJ)) - 1; // ≈ 30

  // ── Generate spawn points ────────────────────────────────────────────────────
  const spawns = useMemo(() => generateMazeSpawns(
    seed, size, roomSz, wallDef.baseLen, wallScale, posX, posY, posZ, yaw
  ), [seed, size, roomSz, wallDef.baseLen, wallScale, posX, posY, posZ, yaw]);

  const footprint = +(size * cellSz).toFixed(1);

  // ── Build code output ────────────────────────────────────────────────────────
  const output = useMemo(() => {
    const wallLabel = wallDef.label.split("★")[0].trim();

    if (format === "json") {
      const entries = spawns.map(pt => ({
        name: wallObj,
        pos: [+pt.x.toFixed(6), +pt.y.toFixed(6), +pt.z.toFixed(6)],
        ypr: [0, +pt.yaw.toFixed(6), 0],
        scale: +wallScale.toFixed(2),
        enableCEPersistency: 0,
        customString: "",
      }));
      return JSON.stringify({ Objects: entries }, null, 2);
    }

    const lines = [
      HELPER_FUNC,
      ``,
      `// ===================================================`,
      `// MAZE ARENA -- Generated by DankDayZ Ultimate Builder`,
      `// ===================================================`,
      `// Grid   : ${size}×${size} cells  (Seed #${seed})`,
      `// Walls  : ${wallLabel} — scale ${wallScale.toFixed(1)}×`,
      `// Cell   : ${cellSz}m per corridor  |  Footprint: ~${footprint}×${footprint}m`,
      `// Objects: ${spawns.length}  (1 scaled wall per maze segment)`,
      `// World  : X=${posX} Y=${posY} Z=${posZ}  Yaw=${yaw}°`,
      `// ───────────────────────────────────────────────────────`,
      ``,
      ...spawns.map(pt =>
        formatInitC(wallObj, +pt.x.toFixed(3), +pt.y.toFixed(3), +pt.z.toFixed(3), 0, +pt.yaw.toFixed(1), 0, +wallScale.toFixed(2))
      ),
    ];
    return lines.join("\n");
  }, [spawns, wallObj, wallScale, format, size, seed, cellSz, footprint, posX, posY, posZ, yaw, wallDef]);

  const copyOutput    = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));
  const downloadOutput = () => {
    const ext  = format === "json" ? "json" : "c";
    const blob = new Blob([output], { type: "text/plain" });
    const a    = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `maze_${size}x${size}_seed${seed}.${ext}`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast(`✓ Downloaded ${spawns.length} objects`);
  };

  // ── Reusable slider component ────────────────────────────────────────────────
  const Slider = ({ label, value, onChange, min, max, step, unit = "", badge }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step: number; unit?: string; badge?: string;
  }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#9a8858] text-[10px]">{label}</span>
        <div className="flex items-center gap-1">
          {badge && <span className="bg-[#2e2518] text-[#6a5a3a] text-[8px] px-1.5 py-0.5 rounded-sm">{badge}</span>}
          <span className="text-[#d4a017] text-[10px] font-bold">{value}{unit}</span>
        </div>
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

  // ── Sidebar content ──────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="p-3 space-y-4">

      {/* Seed */}
      <div>
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">🌀 Maze Seed</div>
        <div className="flex gap-1.5 mb-1.5">
          <input type="number" min={1} max={9999} value={seed}
            onChange={e => setSeed(Math.max(1, Math.min(9999, Number(e.target.value))))}
            className="flex-1 bg-[#1a1610] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#d4a017]" />
          <button onClick={rollSeed}
            className="px-3 py-1.5 bg-[#d4a017] text-[#0a0804] text-[10px] font-bold rounded-sm hover:bg-[#e8b82a] transition-colors">
            🎲 ROLL
          </button>
        </div>
        <p className="text-[#4a3a1a] text-[9px]">Same seed = same maze every time</p>
      </div>

      {/* Layout */}
      <div>
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">📐 Layout</div>
        <Slider
          label="Grid Size"
          value={size}
          onChange={v => setSize(Math.min(v, maxSize))}
          min={5} max={maxSize} step={1} unit=" cells"
          badge={`~${footprint}×${footprint}m`}
        />
        <Slider
          label="Winner Room"
          value={roomSz} onChange={setRoomSz}
          min={2} max={5} step={1} unit=" cells"
        />
      </div>

      {/* Wall settings */}
      <div>
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">🧱 Wall Object & Scale</div>
        <select value={wallObj} onChange={e => setWallObj(e.target.value)}
          className="w-full bg-[#1a1610] border border-[#2e2518] text-[#c8b99a] text-[10px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#d4a017] mb-2">
          {WALL_OBJECTS.map(w => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
        <div className="text-[#4a3a1a] text-[9px] font-mono mb-2">{wallObj}</div>

        <Slider
          label="Wall Scale (size & height)"
          value={wallScale} onChange={setWallScale}
          min={1.0} max={4.0} step={0.25} unit="×"
          badge={`${cellSz}m corridor`}
        />

        {/* Efficiency display */}
        <div className="bg-[#0e0c08] border border-[#2e2518] rounded-sm p-2 text-[9px]">
          <div className="flex justify-between mb-1">
            <span className="text-[#6a5a3a]">1 object per wall segment</span>
            <span className="text-[#27ae60] font-bold">{spawns.length} total</span>
          </div>
          <div className="w-full bg-[#1a1610] rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${spawns.length > 800 ? "bg-[#e67e22]" : "bg-[#27ae60]"}`}
              style={{ width: `${Math.min(100, (spawns.length / MAX_OBJ) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[#4a3a1a]">0</span>
            <span className="text-[#4a3a1a]">{MAX_OBJ} max</span>
          </div>
        </div>
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
          {(["initc","json"] as const).map(f => (
            <button key={f} onClick={() => setFormat(f)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-colors ${format === f ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017]" : "border-[#2e2518] text-[#6a5a3a] hover:border-[#d4a017] hover:text-[#d4a017]"}`}>
              {f === "initc" ? "init.c" : "JSON"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="border border-[#2e2518] rounded-sm p-2 bg-[#0e0c08]">
        <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">📊 Summary</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#d4a017] text-[9px] px-2 py-0.5 rounded-sm font-bold">{spawns.length} objects</span>
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">{size}×{size} grid</span>
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">~{footprint}×{footprint}m</span>
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">{cellSz}m corridor</span>
          <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">Scale {wallScale}×</span>
        </div>
        <p className="text-[#4a3a1a] text-[8px] mt-1.5">
          Scaled wall strategy: 1 object per maze wall vs ~16 with the old dot method.
          {spawns.length <= MAX_OBJ
            ? ` ${MAX_OBJ - spawns.length} objects remaining before limit.`
            : ` ⚠ Over limit — reduce grid size.`}
        </p>
      </div>
    </div>
  );

  // ── Code panel ───────────────────────────────────────────────────────────────
  const CodePanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2e2518] shrink-0 flex-wrap">
        {(["initc","json"] as const).map(f => (
          <button key={f} onClick={() => setFormat(f)}
            className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-colors ${format === f ? "bg-[#d4a017] text-[#0a0804]" : "text-[#6a5a3a] border border-[#2e2518] hover:border-[#d4a017]"}`}>
            {f === "initc" ? "init.c" : "JSON"}
          </button>
        ))}
        <span className="text-[#5a4a2a] text-[10px]">{spawns.length} objects · scale {wallScale.toFixed(1)}×</span>
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

  // ── Full-panel layout ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 overflow-hidden bg-[#0a0804] relative">

      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-white text-[11px] font-bold px-4 py-2 rounded-sm shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      {/* Mobile tab bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 flex border-b border-[#2e2518] bg-[#0e0c08] z-10">
        {(["options","map","code"] as const).map(t => (
          <button key={t} onClick={() => setMobileTab(t)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mobileTab === t ? "text-[#d4a017] border-b-2 border-[#d4a017]" : "text-[#6a5a3a]"}`}>
            {t === "options" ? "⚙ Options" : t === "map" ? "🗺 Map" : "📋 Code"}
          </button>
        ))}
      </div>

      {/* Sidebar */}
      <div className={`${mobileTab !== "options" ? "hidden md:flex" : "flex"} w-full md:w-72 shrink-0 bg-[#0e0c08] border-r border-[#2e2518] overflow-y-auto flex-col md:mt-0 mt-9`}>
        <div className="px-3 py-3 border-b border-[#2e2518] shrink-0">
          <div className="text-[#d4a017] font-bold text-[13px]">🌀 MAZE BUILDER</div>
          <div className="text-[#6a5a3a] text-[9px] mt-0.5">1 scaled wall per segment · max {MAX_OBJ} objects</div>
        </div>
        <SidebarContent />
      </div>

      {/* Map preview */}
      <div className={`${mobileTab !== "map" ? "hidden md:flex" : "flex"} flex-col flex-1 overflow-hidden border-r border-[#2e2518] md:mt-0 mt-9`}>
        <div className="px-3 py-2 border-b border-[#2e2518] shrink-0 flex items-center gap-2">
          <span className="text-[#9a8858] text-[10px] uppercase tracking-wider">Top-Down Map</span>
          <span className="text-[#4a3a1a] text-[9px]">— {size}×{size} · Seed #{seed}</span>
          <button onClick={rollSeed}
            className="ml-auto px-2 py-0.5 bg-[#1a1610] border border-[#2e2518] text-[#d4a017] text-[9px] rounded-sm hover:border-[#d4a017] transition-colors">
            🎲 New Maze
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <MazePreview seed={seed} size={size} roomSz={roomSz} />
            <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#d4a017] text-[9px] px-2 py-0.5 rounded-sm font-bold">{spawns.length} objects</span>
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">{cellSz}m corridors</span>
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">~{footprint}×{footprint}m</span>
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#9a8858] text-[9px] px-2 py-0.5 rounded-sm">Scale {wallScale}×</span>
              <span className="bg-[#1a1610] border border-[#2e2518] text-[#27ae60] text-[9px] px-2 py-0.5 rounded-sm">🏆 winner's room: centre</span>
            </div>
            <div className="mt-3 bg-[#0e0c08] border border-[#2e2518] rounded-sm p-2.5 text-[9px] text-[#5a4a2a] leading-relaxed">
              <p className="mb-1">
                <span className="text-[#27ae60]">■</span> Green = entry &nbsp;
                <span className="text-[#e74c3c]">■</span> Red = exit &nbsp;
                <span className="text-[#d4a017]">■</span> Gold = winner's room
              </p>
              <p>
                <span className="text-[#7a9a5a]">Scaled wall strategy:</span> each maze wall = 1 object at scale {wallScale.toFixed(1)}×.
                Wall piece covers {cellSz}m so corridors match exactly.
                Far fewer objects than multi-dot approach = much less server lag.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code output */}
      <div className={`${mobileTab !== "code" ? "hidden md:flex" : "flex"} flex-col w-full md:w-[420px] shrink-0 overflow-hidden md:mt-0 mt-9`}>
        <CodePanel />
      </div>
    </div>
  );
}
