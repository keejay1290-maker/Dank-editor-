/**
 * DankCoordsTool — Map grid coordinate tool with multi-point list.
 * Click the grid to place markers, build a list of named positions,
 * measure distances, and export in multiple formats.
 */
import { useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";

type MapId = "Chernarus" | "Livonia" | "Sakhal";

interface MapInfo {
  size: number;
  description: string;
  landmarks: { name: string; x: number; z: number }[];
  gridCols: number;
}

const MAPS: Record<MapId, MapInfo> = {
  Chernarus: {
    size: 15360,
    description: "Original 15km² map. Origin at SW corner.",
    gridCols: 10,
    landmarks: [
      { name: "Elektrozavodsk", x: 11200, z: 2400 },
      { name: "Chernogorsk",    x: 7200,  z: 2400 },
      { name: "Berezino",       x: 13200, z: 5600 },
      { name: "Novodmitrovsk",  x: 11600, z: 12400 },
      { name: "Novaya Petrovka",x: 7200,  z: 13200 },
      { name: "Tisy Military",  x: 2400,  z: 14400 },
      { name: "NWAF",           x: 4800,  z: 10400 },
      { name: "NEAF",           x: 13200, z: 12000 },
      { name: "Balota Airfield",x: 5600,  z: 2400  },
      { name: "Vybor",          x: 4800,  z: 8800  },
    ],
  },
  Livonia: {
    size: 8192,
    description: "DLC 8km² map. Dense forests, eastern Europe.",
    gridCols: 8,
    landmarks: [
      { name: "Nadbor",           x: 4200, z: 4800 },
      { name: "Radacz",           x: 2800, z: 3200 },
      { name: "Lukow",            x: 6400, z: 5600 },
      { name: "Sitnik",           x: 3600, z: 6400 },
      { name: "Livonia Airfield", x: 5200, z: 2800 },
      { name: "Biela Polana",     x: 1600, z: 7200 },
    ],
  },
  Sakhal: {
    size: 12800,
    description: "Volcanic island 12km² map. Cold climate.",
    gridCols: 10,
    landmarks: [
      { name: "Krasnodar",      x: 6400, z: 3200 },
      { name: "Volcano Base",   x: 6400, z: 9600 },
      { name: "Sakhal Airfield",x: 4800, z: 4800 },
      { name: "Fishing Village",x: 9600, z: 6400 },
      { name: "Military Camp",  x: 3200, z: 7200 },
    ],
  },
};

interface Marker {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  a: number;
}

let _mid = 0;
const uid = () => `m_${++_mid}`;

function coordsToGrid(x: number, z: number, mapSize: number, cols: number): string {
  const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const cellSize = mapSize / cols;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(z / cellSize);
  return `${COLS[col] ?? "?"}${row + 1}`;
}

function dist2d(a: Marker, b: Marker): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
}

const GRID_DISPLAY = 20;

export default function DankCoordsTool() {
  const [, navigate] = useLocation();
  const [selectedMap, setSelectedMap] = useState<MapId>("Chernarus");
  const [x, setX] = useState(7200);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(2400);
  const [a, setA] = useState(0);
  const [format, setFormat] = useState<"initc" | "json" | "csv" | "pra">("json");
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const [showHow, setShowHow] = useState(false);
  const mapInfo = MAPS[selectedMap];
  const grid = useMemo(() => coordsToGrid(x, z, mapInfo.size, mapInfo.gridCols), [x, z, mapInfo]);

  function addMarker() {
    const m: Marker = { id: uid(), name: `Point ${markers.length + 1}`, x, y, z, a };
    setMarkers(prev => [...prev, m]);
    setEditingId(m.id);
  }

  function removeMarker(id: string) {
    setMarkers(prev => prev.filter(m => m.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function updateMarker(id: string, patch: Partial<Marker>) {
    setMarkers(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  }

  function loadLandmark(lm: { name: string; x: number; z: number }) {
    setX(lm.x); setZ(lm.z);
  }

  function handleGridClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const pz = (e.clientY - rect.top) / rect.height;
    setX(Math.round(px * mapInfo.size));
    setZ(Math.round(pz * mapInfo.size));
  }

  const output = useMemo(() => {
    const pts = markers.length > 0 ? markers : [{ id: "cur", name: "Current", x, y, z, a }];
    if (format === "initc") {
      return pts.map(p =>
        `// ${p.name} — Grid ${coordsToGrid(p.x, p.z, mapInfo.size, mapInfo.gridCols)}\nGetGame().CreateObjectEx("SomeObject", Vector(${p.x}, ${p.y}, ${p.z}), ECE_CREATEPHYS|ECE_UPDATEPATHGRAPH);`
      ).join("\n\n");
    }
    if (format === "json") {
      return JSON.stringify(pts.map(p => ({
        name: p.name,
        grid: coordsToGrid(p.x, p.z, mapInfo.size, mapInfo.gridCols),
        map: selectedMap, x: p.x, y: p.y, z: p.z, a: p.a,
      })), null, 2);
    }
    if (format === "csv") {
      return ["name,map,grid,x,y,z,a",
        ...pts.map(p => `${p.name},${selectedMap},${coordsToGrid(p.x, p.z, mapInfo.size, mapInfo.gridCols)},${p.x},${p.y},${p.z},${p.a}`)
      ].join("\n");
    }
    return JSON.stringify({ safePositions3D: pts.map(p => [p.x, p.y, p.z]) }, null, 2);
  }, [format, markers, x, y, z, a, selectedMap, mapInfo]);

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const inputCls = "bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded focus:outline-none focus:border-[#27ae60]";

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#1abc9c] font-black text-[13px] tracking-widest">📍 DANKCOORDS / MAP GRID</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UPGRADED</span>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: config */}
        <div className="w-64 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-3 overflow-y-auto flex flex-col gap-3">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0c1510] text-[10px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-3 py-2 text-[9px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Select your map and click the grid to set the cursor position.</p>
                <p>2. Click landmarks to jump to known locations.</p>
                <p>3. Use "+ ADD" to save named markers and measure distances.</p>
                <p>4. Choose output format: JSON, init.c, CSV, or PRA safePositions3D.</p>
                <p>5. Copy the output for use in your mission files.</p>
              </div>
            )}
          </div>
          <div>
            <div className="text-[9px] text-[#1abc9c] font-bold mb-1.5 tracking-widest">MAP</div>
            <div className="flex gap-1">
              {(Object.keys(MAPS) as MapId[]).map(m => (
                <button key={m} onClick={() => setSelectedMap(m)}
                  className={`px-2 py-1 text-[9px] font-bold rounded border ${selectedMap === m ? "border-[#1abc9c] text-[#1abc9c]" : "border-[#1a2e1a] text-[#5a8a5a]"}`}>
                  {m.substring(0, 4)}
                </button>
              ))}
            </div>
            <div className="text-[8px] text-[#3a6a3a] mt-1">{mapInfo.description}</div>
          </div>

          <div>
            <div className="text-[9px] text-[#1abc9c] font-bold mb-1.5 tracking-widest">COORDINATES</div>
            {([["X (East)", x, setX], ["Y (Height)", y, setY], ["Z (North)", z, setZ], ["Angle °", a, setA]] as const).map(([label, val, setter]) => (
              <div key={label} className="flex items-center gap-2 mb-1.5">
                <span className="text-[#5a8a5a] text-[9px] w-20 shrink-0">{label}</span>
                <input type="number" value={val} onChange={e => setter(Number(e.target.value))}
                  className={`flex-1 ${inputCls} text-right`} />
              </div>
            ))}
            <div className="mt-2 p-2 bg-[#0e1a0e] border border-[#1a2e1a] rounded">
              <div className="text-[8px] text-[#3a6a3a]">Grid Reference</div>
              <div className="text-[18px] font-black text-[#1abc9c]">{grid}</div>
              <div className="text-[8px] text-[#3a6a3a]">{selectedMap} · {x}, {y}, {z}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[9px] text-[#1abc9c] font-bold tracking-widest">MARKERS ({markers.length})</div>
              <button onClick={addMarker}
                className="text-[8px] px-2 py-0.5 rounded border border-[#1abc9c] text-[#1abc9c] hover:bg-[#0e1a0e]">
                + ADD
              </button>
            </div>
            {markers.map((m, i) => (
              <div key={m.id} className={`mb-1 rounded border p-1.5 ${editingId === m.id ? "border-[#1abc9c]" : "border-[#1a2e1a]"}`}>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingId(editingId === m.id ? null : m.id)}
                    className="flex-1 text-left text-[9px] text-[#b8d4b8] truncate">{m.name}</button>
                  <span className="text-[8px] text-[#3a6a3a]">{coordsToGrid(m.x, m.z, mapInfo.size, mapInfo.gridCols)}</span>
                  <button onClick={() => removeMarker(m.id)} className="text-[#c0392b] text-[8px] px-0.5">✕</button>
                </div>
                {editingId === m.id && (
                  <div className="mt-1 space-y-1">
                    <input value={m.name} onChange={e => updateMarker(m.id, { name: e.target.value })}
                      className={`w-full ${inputCls}`} placeholder="Name" />
                    <div className="grid grid-cols-3 gap-1">
                      {(["x","y","z"] as const).map(k => (
                        <input key={k} type="number" value={m[k]}
                          onChange={e => updateMarker(m.id, { [k]: Number(e.target.value) })}
                          className={inputCls} placeholder={k.toUpperCase()} />
                      ))}
                    </div>
                    <button onClick={() => { setX(m.x); setY(m.y); setZ(m.z); }}
                      className="text-[8px] text-[#1abc9c] hover:underline">Load to cursor</button>
                  </div>
                )}
                {i < markers.length - 1 && (
                  <div className="text-[8px] text-[#3a6a3a] mt-0.5">
                    → {dist2d(m, markers[i + 1]).toFixed(1)}m to next
                  </div>
                )}
              </div>
            ))}
            {markers.length >= 2 && (
              <div className="text-[9px] text-[#1abc9c] mt-1">
                Total path: {markers.reduce((s, m, i) => i === 0 ? 0 : s + dist2d(markers[i-1], m), 0).toFixed(1)}m
              </div>
            )}
          </div>

          <div>
            <div className="text-[9px] text-[#1abc9c] font-bold mb-1.5 tracking-widest">LANDMARKS</div>
            {mapInfo.landmarks.map(lm => (
              <button key={lm.name} onClick={() => loadLandmark(lm)}
                className="w-full text-left px-2 py-1 rounded text-[9px] hover:bg-[#1a2e1a] text-[#b8d4b8] flex justify-between">
                <span>{lm.name}</span>
                <span className="text-[#3a6a3a]">{lm.x}, {lm.z}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Centre: mini map grid */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-[#1a2e1a]">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">
            MAP GRID — click to set cursor · green = cursor · teal = markers · dark = landmarks
          </div>
          <div className="flex-1 overflow-auto p-3 flex items-start justify-center">
            <div
              ref={gridRef}
              onClick={handleGridClick}
              className="relative cursor-crosshair border border-[#1a2e1a] bg-[#050c06]"
              style={{ width: 400, height: 400 }}
            >
              {Array.from({ length: GRID_DISPLAY }, (_, i) => (
                <div key={`h${i}`} className="absolute left-0 right-0 border-t border-[#0e1a0e]"
                  style={{ top: `${(i / GRID_DISPLAY) * 100}%` }} />
              ))}
              {Array.from({ length: GRID_DISPLAY }, (_, i) => (
                <div key={`v${i}`} className="absolute top-0 bottom-0 border-l border-[#0e1a0e]"
                  style={{ left: `${(i / GRID_DISPLAY) * 100}%` }} />
              ))}
              {"ABCDEFGHIJKLMNOPQRST".split("").slice(0, GRID_DISPLAY).map((c, i) => (
                <div key={c} className="absolute text-[7px] text-[#3a6a3a] pointer-events-none"
                  style={{ left: `${(i / GRID_DISPLAY) * 100 + 0.5}%`, top: 1 }}>{c}</div>
              ))}
              {mapInfo.landmarks.map(lm => (
                <div key={lm.name} className="absolute pointer-events-none"
                  style={{ left: `${(lm.x / mapInfo.size) * 100}%`, top: `${(lm.z / mapInfo.size) * 100}%`, transform: "translate(-50%,-50%)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3a6a3a]" />
                </div>
              ))}
              {markers.map(m => (
                <div key={m.id} className="absolute pointer-events-none"
                  style={{ left: `${(m.x / mapInfo.size) * 100}%`, top: `${(m.z / mapInfo.size) * 100}%`, transform: "translate(-50%,-50%)" }}>
                  <div className="w-2 h-2 rounded-full bg-[#1abc9c] border border-[#080f09]" />
                </div>
              ))}
              <div className="absolute pointer-events-none"
                style={{ left: `${(x / mapInfo.size) * 100}%`, top: `${(z / mapInfo.size) * 100}%`, transform: "translate(-50%,-50%)" }}>
                <div className="w-3 h-3 rounded-full bg-[#27ae60] border-2 border-[#080f09]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: output */}
        <div className="w-72 shrink-0 flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center justify-between">
            <span className="text-[10px] text-[#5a8a5a]">OUTPUT</span>
            <div className="flex gap-1">
              {(["json","initc","csv","pra"] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${format === f ? "bg-[#1abc9c] text-[#080f09]" : "text-[#3a6a3a] hover:text-[#5a8a5a]"}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <textarea readOnly value={output}
            className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[9px] font-mono p-3 resize-none border-0 outline-none leading-relaxed" />
          <div className="shrink-0 px-3 py-2 border-t border-[#1a2e1a] bg-[#0c1510]">
            <button onClick={copy}
              className="w-full py-1.5 rounded text-[10px] font-black border border-[#1abc9c] text-[#1abc9c] hover:bg-[#0e1a0e] transition-colors">
              {copied ? "✅ COPIED" : "📋 COPY OUTPUT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
