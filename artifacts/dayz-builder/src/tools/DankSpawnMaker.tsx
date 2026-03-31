/**
 * DankSpawnMaker — Player spawn point builder.
 * Add named spawn points with map selector, group/zone support,
 * weight visualiser, and export as cfgplayerspawnpoints.xml or init.c.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

type MapId = "Chernarus" | "Livonia" | "Sakhal";

interface SpawnPoint {
  id: string;
  name: string;
  group: string;
  x: number;
  y: number;
  z: number;
  a: number;
  weight: number;
  enabled: boolean;
}

const MAP_SIZES: Record<MapId, number> = {
  Chernarus: 15360,
  Livonia: 8192,
  Sakhal: 12800,
};

const SPAWN_PRESETS: Record<MapId, { name: string; group: string; x: number; y: number; z: number; a: number }[]> = {
  Chernarus: [
    { name: "Elektrozavodsk Beach", group: "Coast", x: 11200, y: 0, z: 2200, a: 0 },
    { name: "Chernogorsk Docks",    group: "Coast", x: 7200,  y: 0, z: 2200, a: 90 },
    { name: "Berezino Coast",       group: "Coast", x: 13200, y: 0, z: 5400, a: 270 },
    { name: "Balota Airfield",      group: "Inland", x: 5600, y: 0, z: 2400, a: 180 },
    { name: "Kamenka Beach",        group: "Coast", x: 2400,  y: 0, z: 2200, a: 45 },
    { name: "NWAF",                 group: "Military", x: 4800, y: 0, z: 10400, a: 0 },
  ],
  Livonia: [
    { name: "Nadbor",           group: "Town",    x: 4200, y: 0, z: 4800, a: 0 },
    { name: "Radacz",           group: "Town",    x: 2800, y: 0, z: 3200, a: 90 },
    { name: "Livonia Airfield", group: "Military",x: 5200, y: 0, z: 2800, a: 0 },
  ],
  Sakhal: [
    { name: "Krasnodar",      group: "Town",    x: 6400, y: 0, z: 3200, a: 0 },
    { name: "Fishing Village",group: "Coast",   x: 9600, y: 0, z: 6400, a: 270 },
    { name: "Military Camp",  group: "Military",x: 3200, y: 0, z: 7200, a: 0 },
  ],
};

let _id = 0;
const uid = () => `sp_${++_id}`;

function download(content: string, name: string, type = "text/xml") {
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([content], { type })),
    download: name,
  });
  a.click();
}

export default function DankSpawnMaker() {
  const [, navigate] = useLocation();
  const [selectedMap, setSelectedMap] = useState<MapId>("Chernarus");
  const [spawns, setSpawns] = useState<SpawnPoint[]>([]);
  const [format, setFormat] = useState<"cfgspawnpoints" | "initc">("cfgspawnpoints");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mapSize = MAP_SIZES[selectedMap];
  const presets = SPAWN_PRESETS[selectedMap];
  const groups = [...new Set(spawns.map(s => s.group).filter(Boolean))];
  const totalWeight = spawns.filter(s => s.enabled).reduce((s, sp) => s + sp.weight, 0);

  function addSpawn(preset?: typeof presets[0]) {
    const sp: SpawnPoint = {
      id: uid(),
      name: preset?.name ?? `Spawn ${spawns.length + 1}`,
      group: preset?.group ?? "Default",
      x: preset?.x ?? 7200,
      y: preset?.y ?? 0,
      z: preset?.z ?? 2400,
      a: preset?.a ?? 0,
      weight: 1,
      enabled: true,
    };
    setSpawns(prev => [...prev, sp]);
    setEditingId(sp.id);
  }

  function update(id: string, patch: Partial<SpawnPoint>) {
    setSpawns(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function remove(id: string) {
    setSpawns(prev => prev.filter(s => s.id !== id));
    if (editingId === id) setEditingId(null);
  }

  const output = useMemo(() => {
    const active = spawns.filter(s => s.enabled);
    if (format === "cfgspawnpoints") {
      const byGroup: Record<string, SpawnPoint[]> = {};
      for (const sp of active) {
        if (!byGroup[sp.group]) byGroup[sp.group] = [];
        byGroup[sp.group].push(sp);
      }
      const groupXml = Object.entries(byGroup).map(([grp, pts]) => {
        const entries = pts.map(s =>
          `    <spawnpoint name="${s.name}" x="${s.x}" y="${s.y}" z="${s.z}" a="${s.a}" weight="${s.weight}"/>`
        ).join("\n");
        return `  <group name="${grp}">\n${entries}\n  </group>`;
      }).join("\n");
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<spawnpoints>\n${groupXml}\n</spawnpoints>`;
    }
    return active.map(s =>
      `// ${s.name} [${s.group}]\nGetGame().CreateObjectEx("SurvivorM_Boris", Vector(${s.x}, ${s.y}, ${s.z}), ECE_CREATEPHYS|ECE_UPDATEPATHGRAPH);`
    ).join("\n\n");
  }, [spawns, format]);

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const [showHow, setShowHow] = useState(false);
  const inputCls = "bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[9px] px-1.5 py-1 rounded focus:outline-none focus:border-[#f39c12]";

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#f39c12] font-black text-[13px] tracking-widest">🗺 DANKSPAWN MAKER</span>
        <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UPGRADED</span>
        <div className="ml-auto flex gap-2">
          <button onClick={copy}
            className="px-3 py-1 bg-[#0e2010] border border-[#27ae60] text-[#27ae60] text-[10px] font-bold rounded hover:bg-[#1a3a1a]">
            {copied ? "✅" : "COPY"}
          </button>
          <button onClick={() => download(output, format === "cfgspawnpoints" ? "cfgplayerspawnpoints.xml" : "spawns_init.c")}
            className="px-3 py-1 bg-[#f39c12] text-[#080f09] text-[10px] font-bold rounded hover:bg-[#e67e22]">
            ⬇ EXPORT
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: config */}
        <div className="w-56 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-3 flex flex-col gap-3 overflow-y-auto">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0c1510] text-[10px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-3 py-2 text-[9px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Select your map and output format (XML or init.c).</p>
                <p>2. Use Quick Add for preset locations, or Add Custom for manual coords.</p>
                <p>3. Click a spawn point to edit its name, group, coords and weight.</p>
                <p>4. The weight bar shows relative spawn probability.</p>
                <p>5. Export cfgplayerspawnpoints.xml and upload to your mission root.</p>
              </div>
            )}
          </div>
          {/* Map */}
          <div>
            <div className="text-[9px] text-[#f39c12] font-bold mb-1.5 tracking-widest">MAP</div>
            <div className="flex flex-col gap-1">
              {(Object.keys(MAP_SIZES) as MapId[]).map(m => (
                <button key={m} onClick={() => setSelectedMap(m)}
                  className={`px-2 py-1 text-[9px] font-bold rounded border text-left ${selectedMap === m ? "border-[#f39c12] text-[#f39c12]" : "border-[#1a2e1a] text-[#5a8a5a]"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <div className="text-[9px] text-[#f39c12] font-bold mb-1.5 tracking-widest">FORMAT</div>
            <div className="flex gap-1">
              {(["cfgspawnpoints","initc"] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-2 py-1 text-[9px] font-bold rounded border ${format === f ? "border-[#f39c12] text-[#f39c12]" : "border-[#1a2e1a] text-[#5a8a5a]"}`}>
                  {f === "cfgspawnpoints" ? "XML" : "init.c"}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <div className="text-[9px] text-[#f39c12] font-bold mb-1.5 tracking-widest">QUICK ADD</div>
            {presets.map(p => (
              <button key={p.name} onClick={() => addSpawn(p)}
                className="w-full text-left px-2 py-1 rounded text-[9px] hover:bg-[#1a2e1a] text-[#b8d4b8] flex justify-between">
                <span className="truncate">{p.name}</span>
                <span className="text-[#3a6a3a] shrink-0 ml-1">{p.group}</span>
              </button>
            ))}
          </div>

          <button onClick={() => addSpawn()}
            className="w-full py-2 bg-[#f39c12] text-[#080f09] font-black text-[11px] rounded hover:bg-[#e67e22]">
            + ADD CUSTOM
          </button>

          {/* Stats */}
          <div className="text-[9px] text-[#3a6a3a]">
            {spawns.filter(s => s.enabled).length} active / {spawns.length} total
          </div>

          {/* Weight visualiser */}
          {spawns.filter(s => s.enabled).length > 0 && (
            <div>
              <div className="text-[9px] text-[#f39c12] font-bold mb-1.5 tracking-widest">SPAWN WEIGHTS</div>
              {spawns.filter(s => s.enabled).map(sp => (
                <div key={sp.id} className="mb-1">
                  <div className="flex justify-between text-[8px] text-[#5a8a5a] mb-0.5">
                    <span className="truncate">{sp.name}</span>
                    <span>{totalWeight > 0 ? ((sp.weight / totalWeight) * 100).toFixed(0) : 0}%</span>
                  </div>
                  <div className="w-full bg-[#0e1a0e] rounded h-1.5">
                    <div className="h-full rounded bg-[#f39c12]"
                      style={{ width: `${totalWeight > 0 ? (sp.weight / totalWeight) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Centre: spawn list */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {spawns.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[#3a6a3a] text-[11px]">
              Add spawn points from the panel
            </div>
          )}

          {/* Group headers */}
          {groups.map(grp => (
            <div key={grp}>
              <div className="text-[9px] text-[#f39c12] font-bold tracking-widest mb-1 mt-2 first:mt-0">
                {grp.toUpperCase()} ({spawns.filter(s => s.group === grp).length})
              </div>
              {spawns.filter(s => s.group === grp).map(sp => (
                <div key={sp.id}
                  className={`border rounded p-2 mb-1.5 ${sp.enabled ? "border-[#1a2e1a] bg-[#0a1209]" : "border-[#0e1a0e] bg-[#080f09] opacity-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setEditingId(editingId === sp.id ? null : sp.id)}
                      className="flex-1 text-left text-[10px] font-bold text-[#f39c12] truncate">{sp.name}</button>
                    <label className="flex items-center gap-1 text-[8px] text-[#5a8a5a] cursor-pointer">
                      <input type="checkbox" checked={sp.enabled} onChange={e => update(sp.id, { enabled: e.target.checked })}
                        className="accent-[#f39c12]" />
                      On
                    </label>
                    <button onClick={() => remove(sp.id)} className="text-[9px] text-[#c0392b] hover:bg-[#1a0a0a] px-1 rounded">✕</button>
                  </div>
                  <div className="text-[8px] text-[#3a6a3a]">
                    {sp.x}, {sp.y}, {sp.z} · {sp.a}° · w:{sp.weight}
                  </div>
                  {editingId === sp.id && (
                    <div className="mt-2 space-y-1.5">
                      <div className="grid grid-cols-2 gap-1">
                        <input value={sp.name} onChange={e => update(sp.id, { name: e.target.value })}
                          className={inputCls} placeholder="Name" />
                        <input value={sp.group} onChange={e => update(sp.id, { group: e.target.value })}
                          className={inputCls} placeholder="Group" />
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {(["x","y","z","a"] as const).map(k => (
                          <div key={k}>
                            <div className="text-[7px] text-[#3a6a3a] mb-0.5">{k.toUpperCase()}</div>
                            <input type="number" value={sp[k]}
                              onChange={e => update(sp.id, { [k]: Number(e.target.value) })}
                              className={inputCls} />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-[#5a8a5a]">Weight</span>
                        <input type="number" value={sp.weight} min={0} max={100}
                          onChange={e => update(sp.id, { weight: Number(e.target.value) })}
                          className={`w-16 ${inputCls}`} />
                        <input type="range" min={0} max={10} step={0.5} value={sp.weight}
                          onChange={e => update(sp.id, { weight: Number(e.target.value) })}
                          className="flex-1 accent-[#f39c12]" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Ungrouped */}
          {spawns.filter(s => !s.group || !groups.includes(s.group)).map(sp => (
            <div key={sp.id} className={`border rounded p-2 ${sp.enabled ? "border-[#1a2e1a] bg-[#0a1209]" : "border-[#0e1a0e] opacity-50"}`}>
              <div className="flex items-center gap-2">
                <span className="flex-1 text-[10px] font-bold text-[#f39c12]">{sp.name}</span>
                <button onClick={() => remove(sp.id)} className="text-[9px] text-[#c0392b]">✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: output */}
        <div className="w-72 shrink-0 border-l border-[#1a2e1a] flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">OUTPUT</div>
          <textarea readOnly value={output}
            className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[9px] font-mono p-2 resize-none border-0 outline-none leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
