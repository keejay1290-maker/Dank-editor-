import React, { useState, useMemo, useCallback, Suspense } from "react";
import TrackPreview3D from "./Track3D";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Pt { x: number; z: number; }
interface SpawnObj { name: string; x: number; y: number; z: number; pitch: number; yaw: number; roll: number; scale: number; }

// ─── PIXEL FONT — 3-wide × 5-tall dot matrix ─────────────────────────────────
// Each array = 5 rows (top→bottom); each row = 3 booleans (left→right)
const FONT: Record<string, number[][]> = {
  ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  'S': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'N': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
};
const LETTER_W = 3;   // columns per letter
const PIXEL_SP = 0.8; // metres between pixel centres
const LETTER_GAP = 0.6; // metres between letters

// ─── TRACK PRESETS ────────────────────────────────────────────────────────────
type PresetKey = "oval" | "rectangle" | "diamond" | "triangle" | "figure8" | "lshape";

const PRESETS: Record<PresetKey, { label: string; icon: string; desc: string; }> = {
  oval:      { label: "Oval",       icon: "⭕", desc: "Classic elliptical circuit — smooth turns" },
  rectangle: { label: "Rectangle", icon: "⬜", desc: "Square corners — chicane straights" },
  diamond:   { label: "Diamond",   icon: "🔷", desc: "4-corner diamond — sharp hairpins" },
  triangle:  { label: "Triangle",  icon: "🔺", desc: "3-corner triangular track" },
  figure8:   { label: "Figure-8",  icon: "∞",  desc: "Crossing 8 — requires elevated start/finish" },
  lshape:    { label: "L-Shape",   icon: "📐", desc: "L-shaped drift track" },
};

function buildPresetWaypoints(key: PresetKey, rx: number, rz: number): Pt[] {
  const hw = rx, hd = rz;
  switch (key) {
    case "oval": {
      const N = 24;
      return Array.from({ length: N }, (_, i) => {
        const a = (2 * Math.PI * i) / N - Math.PI / 2;
        return { x: hw * Math.cos(a), z: hd * Math.sin(a) };
      });
    }
    case "rectangle":
      return [
        { x: -hw, z: -hd }, { x:  hw, z: -hd },
        { x:  hw, z:  hd }, { x: -hw, z:  hd },
      ];
    case "diamond":
      return [
        { x:   0, z: -hd }, { x:  hw, z:   0 },
        { x:   0, z:  hd }, { x: -hw, z:   0 },
      ];
    case "triangle":
      return [
        { x:    0, z: -hd },
        { x:  hw,  z:  hd * 0.6 },
        { x: -hw,  z:  hd * 0.6 },
      ];
    case "figure8": {
      const N = 12;
      const top: Pt[] = Array.from({ length: N }, (_, i) => {
        const a = (2 * Math.PI * i) / N - Math.PI / 2;
        return { x: hw * 0.55 * Math.cos(a), z: -hd * 0.45 + hd * 0.45 * Math.sin(a) };
      });
      const bot: Pt[] = Array.from({ length: N }, (_, i) => {
        const a = -(2 * Math.PI * i) / N + Math.PI / 2;
        return { x: hw * 0.55 * Math.cos(a), z:  hd * 0.45 + hd * 0.45 * Math.sin(a) };
      });
      return [...top, ...bot];
    }
    case "lshape":
      return [
        { x: -hw,     z: -hd },
        { x:  hw,     z: -hd },
        { x:  hw,     z:  0  },
        { x:  0,      z:  0  },
        { x:  0,      z:  hd },
        { x: -hw,     z:  hd },
      ];
  }
}

// ─── SEGMENT GEOMETRY ─────────────────────────────────────────────────────────
function segmentDir(p1: Pt, p2: Pt) {
  const dx = p2.x - p1.x, dz = p2.z - p1.z;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.001) return { fwdX: 0, fwdZ: 1, rightX: 1, rightZ: 0, len: 0, yaw: 0 };
  const fwdX = dx / len, fwdZ = dz / len;
  // DayZ yaw: 0° = +Z, 90° = +X → yaw = atan2(fwdX, fwdZ)
  const yaw = Math.atan2(fwdX, fwdZ) * 180 / Math.PI;
  // right = fwd rotated 90° clockwise (facing right when looking fwd)
  const rightX = fwdZ, rightZ = -fwdX;
  return { fwdX, fwdZ, rightX, rightZ, len, yaw };
}

// ─── TRACK GENERATOR ─────────────────────────────────────────────────────────
interface TrackOpts {
  waypoints: Pt[];
  posX: number; posY: number; posZ: number;
  trackWidth: number;       // metres
  floorObj: string;         // classname for floor panels
  barrierObj: string;       // classname for barriers
  floorPitch: number;       // rotation pitch for floor (90 = lying flat)
  barrierLen: number;       // metres per barrier object
  addFloor: boolean;
  addBarriers: boolean;
  addText: boolean;
  textScale: number;        // pixel spacing multiplier
}

function generateTrack(opts: TrackOpts): SpawnObj[] {
  const { waypoints, posX, posY, posZ, trackWidth, floorObj, barrierObj,
    floorPitch, barrierLen, addFloor, addBarriers, addText, textScale } = opts;
  const objs: SpawnObj[] = [];
  const n = waypoints.length;
  if (n < 2) return objs;

  // Floor tile geometry when pitch=floorPitch (90° = flat)
  // At pitch=90: 4m runs ACROSS track (perpendicular to yaw), 3m runs ALONG track
  const TILE_ALONG = 3;    // metres per tile along track
  const TILE_ACROSS = 4;   // metres per tile across track
  const N_ACROSS = Math.ceil(trackWidth / TILE_ACROSS);
  const halfW = (N_ACROSS * TILE_ACROSS) / 2;
  const BARRIER_EDGE = halfW + 0.35; // barrier centre = just outside floor edge

  for (let i = 0; i < n; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[(i + 1) % n];
    const { fwdX, fwdZ, rightX, rightZ, len, yaw } = segmentDir(p1, p2);
    if (len < 0.1) continue;

    // ── Floor tiles ──────────────────────────────────────────────────────────
    if (addFloor) {
      const nAlong = Math.ceil(len / TILE_ALONG);
      for (let a = 0; a < nAlong; a++) {
        const t = a * TILE_ALONG + TILE_ALONG / 2;
        const cx = p1.x + t * fwdX;
        const cz = p1.z + t * fwdZ;
        for (let ac = 0; ac < N_ACROSS; ac++) {
          // Tile centres: from -halfW+tileHalf to +halfW-tileHalf
          const k = -halfW + TILE_ACROSS / 2 + ac * TILE_ACROSS;
          objs.push({
            name: floorObj,
            x: posX + cx + k * rightX,
            y: posY,
            z: posZ + cz + k * rightZ,
            pitch: floorPitch, yaw, roll: 0, scale: 1,
          });
        }
      }
    }

    // ── Barriers ─────────────────────────────────────────────────────────────
    if (addBarriers) {
      const nBarriers = Math.ceil(len / barrierLen);
      for (let b = 0; b < nBarriers; b++) {
        const t = b * barrierLen + barrierLen / 2;
        if (t > len + barrierLen * 0.5) break;
        const cx = p1.x + t * fwdX;
        const cz = p1.z + t * fwdZ;
        // Left barrier (+right direction)
        objs.push({
          name: barrierObj,
          x: posX + cx + BARRIER_EDGE * rightX,
          y: posY,
          z: posZ + cz + BARRIER_EDGE * rightZ,
          pitch: 0, yaw, roll: 0, scale: 1,
        });
        // Right barrier (-right direction)
        objs.push({
          name: barrierObj,
          x: posX + cx - BARRIER_EDGE * rightX,
          y: posY,
          z: posZ + cz - BARRIER_EDGE * rightZ,
          pitch: 0, yaw, roll: 0, scale: 1,
        });
      }
    }
  }

  // ── START text (at waypoint 0) & FINISH text (at midpoint waypoint) ────────
  if (addText && n >= 2) {
    const sp = textScale * PIXEL_SP;
    const sg = textScale * LETTER_GAP;
    const tileW = LETTER_W * sp + sg;

    const placeText = (text: string, origin: Pt, segIdx: number, side: 1 | -1) => {
      // side: +1 = place toward right of track, -1 = left
      // Text runs ACROSS track (perpendicular to travel direction)
      const p2 = waypoints[(segIdx + 1) % n];
      const { fwdX, fwdZ, rightX, rightZ, yaw } = segmentDir(waypoints[segIdx], p2);
      const totalW = text.length * tileW - sg;
      // Start position: centre the text across the track
      const startR = -totalW / 2; // along right direction

      for (let li = 0; li < text.length; li++) {
        const ch = text[li].toUpperCase();
        const grid = FONT[ch] ?? FONT[' '];
        const letterStartR = startR + li * tileW;
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < (grid[row]?.length ?? 0); col++) {
            if (!grid[row][col]) continue;
            // col runs across track (right direction), row runs along track (fwd direction, offset to side)
            const rOffset = letterStartR + col * sp;
            // Offset along track: 1.5m per row, placed on the side of the line
            const fOffset = side * (row * sp + 1.5);
            objs.push({
              name: "StaticObj_Airfield_Light_PAPI1",
              x: posX + origin.x + rOffset * rightX + fOffset * fwdX,
              y: posY + 0.05,
              z: posZ + origin.z + rOffset * rightZ + fOffset * fwdZ,
              pitch: 0, yaw: yaw + 90, roll: 0, scale: 1,
            });
          }
        }
      }
    };

    // START at waypoint 0
    placeText("START", waypoints[0], 0, -1);
    // FINISH at the halfway waypoint
    const midIdx = Math.floor(n / 2);
    placeText("FINISH", waypoints[midIdx], midIdx, +1);
  }

  return objs;
}

// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────
function toInitC(objs: SpawnObj[], comment: string): string {
  return [
    HELPER_FUNC,
    ``,
    `// ${'='.repeat(58)}`,
    `// ${comment}`,
    `// Generated by DankDayZ Ultimate Builder`,
    `// ${'='.repeat(58)}`,
    `// Objects: ${objs.length}`,
    ``,
    ...objs.map(o =>
      formatInitC(o.name, +o.x.toFixed(3), +o.y.toFixed(3), +o.z.toFixed(3),
        +o.pitch.toFixed(1), +o.yaw.toFixed(3), +o.roll.toFixed(1), +o.scale.toFixed(2))
    ),
  ].join("\n");
}

function toJSON(objs: SpawnObj[]): string {
  return JSON.stringify({
    Objects: objs.map(o => ({
      name: o.name,
      pos: [+o.x.toFixed(4), +o.y.toFixed(4), +o.z.toFixed(4)],
      ypr: [+o.pitch.toFixed(3), +o.yaw.toFixed(3), +o.roll.toFixed(3)],
      scale: +o.scale.toFixed(4),
      enableCEPersistency: 0,
      customString: "",
    })),
  }, null, 2);
}

// ─── SVG PREVIEW ─────────────────────────────────────────────────────────────
function TrackPreview({ waypoints, trackWidth, addText, addBarriers }: {
  waypoints: Pt[]; trackWidth: number; addText: boolean; addBarriers: boolean;
}) {
  if (waypoints.length < 2) return null;
  const PAD = 24;
  const W = 420, H = 310;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  waypoints.forEach(p => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  });
  const bw = trackWidth;
  minX -= bw; maxX += bw; minZ -= bw; maxZ += bw;
  const rangeX = Math.max(maxX - minX, 1);
  const rangeZ = Math.max(maxZ - minZ, 1);
  const sc = Math.min((W - PAD * 2) / rangeX, (H - PAD * 2) / rangeZ);
  const toSVG = (p: Pt) => ({
    x: PAD + (p.x - minX) * sc,
    y: PAD + (p.z - minZ) * sc,
  });

  const n = waypoints.length;
  const segments: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    const p1 = toSVG(waypoints[i]);
    const p2 = toSVG(waypoints[(i + 1) % n]);
    const { rightX, rightZ } = segmentDir(waypoints[i], waypoints[(i + 1) % n]);
    const hw = (trackWidth / 2) * sc;
    const brw = (trackWidth / 2 + 0.6) * sc;
    // Left edge
    segments.push(<line key={`Le${i}`}
      x1={p1.x + rightX * hw} y1={p1.y + rightZ * hw}
      x2={p2.x + rightX * hw} y2={p2.y + rightZ * hw}
      stroke="#4a3820" strokeWidth="1" />);
    // Right edge
    segments.push(<line key={`Re${i}`}
      x1={p1.x - rightX * hw} y1={p1.y - rightZ * hw}
      x2={p2.x - rightX * hw} y2={p2.y - rightZ * hw}
      stroke="#4a3820" strokeWidth="1" />);
    // Track fill
    const pts = [
      [p1.x + rightX * hw, p1.y + rightZ * hw],
      [p2.x + rightX * hw, p2.y + rightZ * hw],
      [p2.x - rightX * hw, p2.y - rightZ * hw],
      [p1.x - rightX * hw, p1.y - rightZ * hw],
    ].map(p => p.join(",")).join(" ");
    segments.push(<polygon key={`Tf${i}`} points={pts} fill="#1a1810" stroke="none" />);
    // Centerline dashes
    segments.push(<line key={`CL${i}`}
      x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
      stroke="#3a3020" strokeWidth="0.8" strokeDasharray="4,4" />);
    // Barriers
    if (addBarriers) {
      segments.push(<line key={`BrL${i}`}
        x1={p1.x + rightX * brw} y1={p1.y + rightZ * brw}
        x2={p2.x + rightX * brw} y2={p2.y + rightZ * brw}
        stroke="#e74c3c" strokeWidth="1.5" />);
      segments.push(<line key={`BrR${i}`}
        x1={p1.x - rightX * brw} y1={p1.y - rightZ * brw}
        x2={p2.x - rightX * brw} y2={p2.y - rightZ * brw}
        stroke="#e74c3c" strokeWidth="1.5" />);
    }
  }

  // Start/finish line
  const sf1 = toSVG(waypoints[0]);
  const { rightX: sfRX, rightZ: sfRZ } = segmentDir(waypoints[0], waypoints[1 % n]);
  const sfW = (trackWidth / 2) * sc;
  const midIdx = Math.floor(n / 2);
  const fm1 = toSVG(waypoints[midIdx]);
  const { rightX: fRX, rightZ: fRZ } = segmentDir(waypoints[midIdx], waypoints[(midIdx + 1) % n]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ background: "#0a0804" }}>
      <rect width={W} height={H} fill="#0a0804" />
      {segments}
      {/* Start line */}
      <line x1={sf1.x + sfRX * sfW} y1={sf1.y + sfRZ * sfW}
        x2={sf1.x - sfRX * sfW} y2={sf1.y - sfRZ * sfW}
        stroke="#27ae60" strokeWidth="2.5" />
      {/* Finish line */}
      <line x1={fm1.x + fRX * sfW} y1={fm1.y + fRZ * sfW}
        x2={fm1.x - fRX * sfW} y2={fm1.y - fRZ * sfW}
        stroke="#e74c3c" strokeWidth="2.5" strokeDasharray="4,2" />
      {/* Waypoints */}
      {waypoints.map((p, i) => {
        const s = toSVG(p);
        return <circle key={i} cx={s.x} cy={s.y} r={3}
          fill={i === 0 ? '#27ae60' : i === midIdx ? '#e74c3c' : '#5a4820'}
          stroke="#d4a017" strokeWidth="0.5" />;
      })}
      {addText && (
        <>
          <text x={sf1.x} y={sf1.y - 6} textAnchor="middle" fontSize="7" fill="#27ae60" fontWeight="bold">START</text>
          <text x={fm1.x} y={fm1.y - 6} textAnchor="middle" fontSize="7" fill="#e74c3c" fontWeight="bold">FINISH</text>
        </>
      )}
      {/* Legend */}
      <line x1={10} y1={H - 18} x2={20} y2={H - 18} stroke="#27ae60" strokeWidth="2" />
      <text x={23} y={H - 14} fontSize="7" fill="#6a5a3a">Start</text>
      <line x1={45} y1={H - 18} x2={55} y2={H - 18} stroke="#e74c3c" strokeWidth="2" strokeDasharray="3,2" />
      <text x={58} y={H - 14} fontSize="7" fill="#6a5a3a">Finish</text>
      {addBarriers && <>
        <line x1={80} y1={H - 18} x2={90} y2={H - 18} stroke="#e74c3c" strokeWidth="1.5" />
        <text x={93} y={H - 14} fontSize="7" fill="#6a5a3a">Barriers</text>
      </>}
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const FLOOR_OBJECTS = [
  { value: "Land_Wall_Concrete_4m_DE",   label: "Concrete Wall 4m ★ Recommended floor" },
  { value: "Land_Wall_Concrete_8m_DE",   label: "Concrete Wall 8m (long panels)" },
  { value: "Land_Wall_Brick_4m_DE",      label: "Brick Wall 4m (textured)" },
  { value: "Land_Wall_Gate_Fen3",        label: "Metal Fence 3m (see-through floor)" },
  { value: "Land_HBarrier_5m_DE",        label: "HESCO 5m (military feel)" },
];

const BARRIER_OBJECTS = [
  { value: "StaticObj_Wall_CncBarrier_4Block", label: "Concrete Jersey Barrier 4x ★ Best", len: 6 },
  { value: "Land_Wall_Concrete_4m_DE",          label: "Concrete Wall 4m (tall barrier)", len: 4 },
  { value: "Land_Castle_Wall_3m_DE",            label: "Castle Stone Wall 3m", len: 3 },
  { value: "Land_HBarrier_5m_DE",               label: "HESCO 5m (military barrier)", len: 5 },
  { value: "Land_Container_1Bo_DE",             label: "Shipping Container 6m", len: 6 },
];

export default function RaceTrackMaker() {
  const [preset,      setPreset]      = useState<PresetKey>("oval");
  const [radiusX,     setRadiusX]     = useState(80);
  const [radiusZ,     setRadiusZ]     = useState(50);
  const [trackWidth,  setTrackWidth]  = useState(12);
  const [floorObj,    setFloorObj]    = useState("Land_Wall_Concrete_4m_DE");
  const [barrierKey,  setBarrierKey]  = useState(0);
  const [posX,        setPosX]        = useState(0);
  const [posY,        setPosY]        = useState(10);
  const [posZ,        setPosZ]        = useState(0);
  const [addFloor,    setAddFloor]    = useState(true);
  const [addBarriers, setAddBarriers] = useState(true);
  const [addText,     setAddText]     = useState(true);
  const [textScale,   setTextScale]   = useState(1.2);
  const [format,      setFormat]      = useState<"initc"|"json">("initc");
  const [toast,       setToast]       = useState("");
  const [mobileTab,   setMobileTab]   = useState<"options"|"map"|"code">("options");

  const barrierDef = BARRIER_OBJECTS[barrierKey];

  const waypoints = useMemo(() =>
    buildPresetWaypoints(preset, radiusX, radiusZ),
  [preset, radiusX, radiusZ]);

  const objects = useMemo(() => generateTrack({
    waypoints,
    posX, posY, posZ,
    trackWidth,
    floorObj,
    barrierObj: barrierDef.value,
    floorPitch: 90,
    barrierLen: barrierDef.len,
    addFloor, addBarriers, addText,
    textScale,
  }), [waypoints, posX, posY, posZ, trackWidth, floorObj, barrierDef, addFloor, addBarriers, addText, textScale]);

  const output = useMemo(() => {
    const comment = `RACE TRACK — ${PRESETS[preset].label}  ${radiusX}×${radiusZ}m  Width: ${trackWidth}m`;
    return format === "initc" ? toInitC(objects, comment) : toJSON(objects);
  }, [objects, format, preset, radiusX, radiusZ, trackWidth]);

  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(""), 2200);
  }, []);

  const copy = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));
  const download = () => {
    const ext = format === "json" ? "json" : "c";
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `racetrack_${preset}_${radiusX}x${radiusZ}.${ext}`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast(`✓ Downloaded ${objects.length} objects`);
  };

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

  const objectCounts = useMemo(() => {
    const floor = objects.filter(o => o.name !== "StaticObj_Airfield_Light_PAPI1" && o.name === floorObj).length;
    const barriers = objects.filter(o => o.name === barrierDef.value).length;
    const lights = objects.filter(o => o.name === "StaticObj_Airfield_Light_PAPI1").length;
    return { floor, barriers, lights, total: objects.length };
  }, [objects, floorObj, barrierDef.value]);

  return (
    <div className="flex flex-1 overflow-hidden bg-[#0a0804] relative">

      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-white text-[11px] font-bold px-4 py-2 rounded-sm shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      {/* Mobile tabs */}
      <div className="md:hidden absolute top-0 left-0 right-0 flex border-b border-[#2e2518] bg-[#0e0c08] z-10">
        {(["options","map","code"] as const).map(t => (
          <button key={t} onClick={() => setMobileTab(t)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mobileTab === t ? "text-[#e74c3c] border-b-2 border-[#e74c3c]" : "text-[#6a5a3a]"}`}>
            {t === "options" ? "⚙ Options" : t === "map" ? "🗺 Map" : "📋 Code"}
          </button>
        ))}
      </div>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────────── */}
      <div className={`${mobileTab !== "options" ? "hidden md:flex" : "flex"} w-full md:w-72 shrink-0 bg-[#0e0c08] border-r border-[#2e2518] overflow-y-auto flex-col md:mt-0 mt-9`}>
        <div className="px-3 py-3 border-b border-[#2e2518] shrink-0">
          <div className="text-[#e74c3c] font-bold text-[13px]">🏁 RACE TRACK MAKER</div>
          <div className="text-[#6a5a3a] text-[9px] mt-0.5">Floating track · walls as floor · barriers on sides · START/FINISH lights</div>
        </div>

        <div className="p-3 space-y-4 overflow-y-auto">

          {/* Preset shape */}
          <div>
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">🔁 Track Shape</div>
            <div className="grid grid-cols-2 gap-1">
              {(Object.entries(PRESETS) as [PresetKey, typeof PRESETS[PresetKey]][]).map(([k, p]) => (
                <button key={k} onClick={() => setPreset(k)}
                  className={`text-left px-2 py-1.5 rounded-sm border transition-all ${preset === k ? "bg-[#e74c3c]/20 border-[#e74c3c] text-[#e74c3c]" : "border-[#2e2518] text-[#b09a6a] hover:border-[#6a5820]"}`}>
                  <div className="text-[10px] font-bold">{p.icon} {p.label}</div>
                  <div className="text-[7.5px] opacity-60 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">📐 Track Dimensions</div>
            <Slider label="Radius X (East-West)" value={radiusX} onChange={setRadiusX}
              min={20} max={300} step={5} unit="m"
              badge={`${(radiusX * 2).toFixed(0)}m span`} />
            <Slider label="Radius Z (North-South)" value={radiusZ} onChange={setRadiusZ}
              min={20} max={300} step={5} unit="m"
              badge={`${(radiusZ * 2).toFixed(0)}m span`} />
            <Slider label="Track Width" value={trackWidth} onChange={setTrackWidth}
              min={8} max={24} step={4} unit="m"
              badge={`${Math.ceil(trackWidth / 4)} floor tiles wide`} />
          </div>

          {/* Options toggles */}
          <div>
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">⚙ Components</div>
            {[
              { label: "🏗 Floor Panels (walls rotated flat)", val: addFloor, set: setAddFloor,
                note: "Concrete walls placed with pitch=90° to create driveable surface" },
              { label: "🚧 Side Barriers", val: addBarriers, set: setAddBarriers,
                note: "Jersey barriers on both sides of the track to keep cars in" },
              { label: "💡 START / FINISH lights", val: addText, set: setAddText,
                note: "Airfield PAPI lights spell START & FINISH at start/finish lines" },
            ].map(opt => (
              <div key={opt.label} className="mb-2">
                <button onClick={() => opt.set(!opt.val)}
                  className={`flex items-center gap-2 w-full text-left text-[10px] py-1 transition-all ${opt.val ? "text-[#e74c3c]" : "text-[#6a5a3a]"}`}>
                  <span className={`w-3 h-3 border rounded-sm flex items-center justify-center shrink-0 ${opt.val ? "border-[#e74c3c] bg-[#e74c3c]/30" : "border-[#3a3020]"}`}>
                    {opt.val && <span className="text-[8px] text-[#e74c3c]">✓</span>}
                  </span>
                  <span className="font-bold">{opt.label}</span>
                </button>
                <div className="text-[7px] text-[#4a3820] ml-5 leading-relaxed">{opt.note}</div>
              </div>
            ))}
          </div>

          {/* Floor object */}
          {addFloor && (
            <div>
              <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">🏗 Floor Object</div>
              <select value={floorObj} onChange={e => setFloorObj(e.target.value)}
                className="w-full bg-[#1a1610] border border-[#2e2518] text-[#c8b99a] text-[10px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#e74c3c] mb-1">
                {FLOOR_OBJECTS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <div className="text-[7.5px] text-[#4a3820] font-mono">{floorObj}</div>
              <div className="text-[7px] text-[#5a4820] mt-0.5 leading-relaxed">
                Placed with pitch=90° — wall lies flat as a driving surface. Each panel is 4m across × 3m long.
              </div>
            </div>
          )}

          {/* Barrier object */}
          {addBarriers && (
            <div>
              <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">🚧 Barrier Object</div>
              <select value={barrierKey} onChange={e => setBarrierKey(Number(e.target.value))}
                className="w-full bg-[#1a1610] border border-[#2e2518] text-[#c8b99a] text-[10px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#e74c3c] mb-1">
                {BARRIER_OBJECTS.map((b, i) => (
                  <option key={b.value} value={i}>{b.label}</option>
                ))}
              </select>
              <div className="text-[7.5px] text-[#4a3820] font-mono">{barrierDef.value}</div>
            </div>
          )}

          {/* Text scale */}
          {addText && (
            <div>
              <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">💡 Light Text Scale</div>
              <Slider label="Pixel Spacing" value={textScale} onChange={setTextScale}
                min={0.6} max={2.5} step={0.1} unit="×" badge={`${(PIXEL_SP * textScale).toFixed(1)}m/pixel`} />
              <div className="text-[7px] text-[#5a4820] leading-relaxed">
                Larger scale = bigger letters. "START" is 5 letters × 3 pixels wide.
              </div>
            </div>
          )}

          {/* World position */}
          <div>
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">📍 World Origin</div>
            <div className="text-[7px] text-[#5a4820] mb-1.5 leading-relaxed">
              Set Y to the height you want the track to float at. Track tiles extend horizontally at this height.
            </div>
            {([["X", posX, setPosX], ["Y (float height)", posY, setPosY], ["Z", posZ, setPosZ]] as [string, number, (v: number) => void][]).map(([lbl, val, set]) => (
              <div key={lbl} className="flex items-center gap-2 mb-1">
                <span className="text-[8px] text-[#8a7840] w-16 shrink-0 truncate">{lbl}</span>
                <input type="number" step="0.5" value={val} onChange={e => set(Number(e.target.value))}
                  className="flex-1 bg-[#12100a] border border-[#2e2518] rounded-sm px-2 py-0.5 text-[10px] text-[#c8b99a] focus:outline-none focus:border-[#e74c3c] min-w-0" />
              </div>
            ))}
          </div>

          {/* Format */}
          <div>
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">📄 Export Format</div>
            <div className="flex gap-1">
              {(["initc", "json"] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-colors ${format === f ? "bg-[#e74c3c] text-white border-[#e74c3c]" : "border-[#2e2518] text-[#6a5a3a] hover:border-[#e74c3c] hover:text-[#e74c3c]"}`}>
                  {f === "initc" ? "init.c" : "JSON"}
                </button>
              ))}
            </div>
          </div>

          {/* Object count summary */}
          <div className="border border-[#2e2518] rounded-sm p-2 bg-[#0e0c08]">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-2">📊 Object Count</div>
            <div className="space-y-1">
              {addFloor && <div className="flex justify-between text-[9px]">
                <span className="text-[#6a5a3a]">🏗 Floor panels</span>
                <span className="text-[#d4a017] font-bold">{objectCounts.floor}</span>
              </div>}
              {addBarriers && <div className="flex justify-between text-[9px]">
                <span className="text-[#6a5a3a]">🚧 Barriers</span>
                <span className="text-[#e74c3c] font-bold">{objectCounts.barriers}</span>
              </div>}
              {addText && <div className="flex justify-between text-[9px]">
                <span className="text-[#6a5a3a]">💡 PAPI lights</span>
                <span className="text-[#3498db] font-bold">{objectCounts.lights}</span>
              </div>}
              <div className="border-t border-[#2e2518] pt-1 flex justify-between text-[10px]">
                <span className="text-[#9a8858]">Total</span>
                <span className={`font-bold ${objectCounts.total > 1500 ? "text-[#e67e22]" : "text-[#27ae60]"}`}>
                  {objectCounts.total}
                </span>
              </div>
              {objectCounts.total > 1500 && (
                <div className="text-[7.5px] text-[#e67e22] leading-relaxed">
                  ⚠ Large track — may approach spawn limits. Consider reducing size or disabling floor panels.
                </div>
              )}
            </div>
            <div className="text-[7px] text-[#4a3820] mt-2 leading-relaxed">
              Tip: Align Y to terrain then tune down ~0.5m so tiles sit flat. Jersey barriers auto-align to terrain in DayZ.
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTER: 3D PREVIEW ────────────────────────────────────────────────── */}
      <div className={`${mobileTab !== "map" ? "hidden md:flex" : "flex"} flex-col flex-1 min-w-0 overflow-hidden border-r border-[#2e2518] md:mt-0 mt-9`}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2e2518] shrink-0">
          <span className="text-[#9a8858] text-[10px] uppercase tracking-wider">3D Preview</span>
          <span className="text-[#4a3a1a] text-[9px]">— {PRESETS[preset].label} · {radiusX}×{radiusZ}m · {trackWidth}m wide</span>
          <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-sm ${objectCounts.total > 1500 ? "bg-[#e67e22]/20 text-[#e67e22]" : "bg-[#27ae60]/20 text-[#27ae60]"}`}>
            {objectCounts.total} objects
          </span>
        </div>
        <div className="flex-1 min-h-0 relative">
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-[#080c14]">
              <span className="text-[#4a3820] text-[11px] tracking-widest animate-pulse">LOADING 3D...</span>
            </div>
          }>
            <TrackPreview3D
              waypoints={waypoints}
              trackWidth={trackWidth}
              addText={addText}
              addBarriers={addBarriers}
              barrierLen={barrierDef.len}
            />
          </Suspense>
          {/* Interaction hint overlay */}
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <div className="text-[7.5px] text-[#3a3020] bg-[#0a0804]/80 px-2 py-1 rounded-sm backdrop-blur-sm border border-[#2e2518]">
              Drag to orbit · Scroll to zoom · Right-drag to pan
            </div>
          </div>
        </div>
        {/* Legend strip */}
        <div className="shrink-0 border-t border-[#2e2518] bg-[#0e0c08] px-3 py-2">
          <div className="text-[8px] text-[#6a5a3a] leading-relaxed flex flex-wrap gap-x-3 gap-y-0.5">
            <span><span className="text-[#27ae60] font-bold">━</span> Start line (green gantry)</span>
            <span><span className="text-[#e74c3c] font-bold">━</span> Finish line (checker)</span>
            <span><span className="text-[#c0bab2] font-bold">█</span> Jersey barriers</span>
            <span><span className="text-[#787878] font-bold">█</span> Concrete floor tiles</span>
          </div>
          <div className="text-[7.5px] text-[#4a3820] mt-1">
            Floor: {Math.ceil(trackWidth/4)} rows of {floorObj} laid flat (pitch=90°).
            Barriers: {barrierDef.label}, {barrierDef.len}m per block, each side.
          </div>
        </div>
      </div>

      {/* ── RIGHT: CODE OUTPUT ────────────────────────────────────────────────── */}
      <div className={`${mobileTab !== "code" ? "hidden md:flex" : "flex"} flex-col w-full md:w-[420px] shrink-0 min-h-0 md:mt-0 mt-9`}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2e2518] shrink-0 flex-wrap">
          {(["initc", "json"] as const).map(f => (
            <button key={f} onClick={() => setFormat(f)}
              className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-colors ${format === f ? "bg-[#e74c3c] text-white" : "text-[#6a5a3a] border border-[#2e2518] hover:border-[#e74c3c]"}`}>
              {f === "initc" ? "init.c" : "JSON"}
            </button>
          ))}
          <span className="text-[#5a4a2a] text-[10px]">{objectCounts.total} objects</span>
          <div className="ml-auto flex gap-1.5">
            <button onClick={copy}
              className="px-3 py-1 bg-[#1a1610] border border-[#2e2518] text-[#b09a6a] text-[10px] rounded-sm hover:border-[#e74c3c] hover:text-[#e74c3c] transition-colors">
              Copy
            </button>
            <button onClick={download}
              className="px-3 py-1 bg-[#e74c3c] text-white text-[10px] font-bold rounded-sm hover:bg-[#c0392b] transition-colors">
              Download
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-3 text-[10px] leading-relaxed font-mono text-[#7a9a5a] whitespace-pre-wrap min-h-0">
          {output.slice(0, 12000)}{output.length > 12000 ? `\n\n// ... ${output.length - 12000} more characters — Download for full output` : ""}
        </pre>
      </div>

    </div>
  );
}
