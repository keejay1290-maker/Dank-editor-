import { useState, useMemo, useCallback } from "react";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import { MAX_OBJECTS } from "@/lib/constants";
import { generateConstructionZone, ConstructionZoneOptions } from "@/lib/constructionZoneGenerator";
import ZonePreview3D, { ZoneObject } from "@/ZonePreview3D";
import { STRUCTURAL_POOL } from "@/lib/constructionZoneData";

export default function ConstructionZoneMaker() {
  const [seed, setSeed] = useState(42);
  const [radius, setRadius] = useState(30);
  const [includeLoot, setIncludeLoot] = useState(true);
  const [lootChance, setLootChance] = useState(0.4);
  const [posX, setPosX] = useState(4500);
  const [posY, setPosY] = useState(400);
  const [posZ, setPosZ] = useState(5800);
  const [yaw, setYaw] = useState(0);
  const [format, setFormat] = useState<"initc" | "json">("json");
  const [toast, setToast] = useState("");

  const rollSeed = () => setSeed(Math.floor(Math.random() * 999999));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const zoneOpts: ConstructionZoneOptions = useMemo(() => ({
    seed,
    radius,
    posX,
    posY,
    posZ,
    yaw,
    includeLoot,
    lootChance,
  }), [seed, radius, posX, posY, posZ, yaw, includeLoot, lootChance]);

  const objects = useMemo(() => generateConstructionZone(zoneOpts), [zoneOpts]);

  const objects3D = useMemo((): ZoneObject[] => {
    return objects.map(obj => {
      const prop = STRUCTURAL_POOL.find(p => p.classname === obj.classname);
      return {
        type: obj.classname,
        x: obj.dx - posX,
        y: obj.dy - posY,
        z: obj.dz - posZ,
        yaw: obj.yaw,
        w: prop?.w ?? 1,
        h: prop?.h ?? 1,
        d: prop?.d ?? 1,
        color: prop?.color ?? "#5a4820",
      };
    });
  }, [objects, posX, posY, posZ]);

  const output = useMemo(() => {
    if (format === "json") {
      const entries = objects.map(obj => ({
        name: obj.classname,
        pos: [+obj.dx.toFixed(3), +obj.dy.toFixed(3), +obj.dz.toFixed(3)],
        ypr: [0, +obj.yaw.toFixed(3), 0],
        scale: 1,
        enableCEPersistency: 0,
        customString: "",
      }));
      return JSON.stringify({ Objects: entries }, null, 2);
    }

    const lines = [
      HELPER_FUNC,
      `// CONSTRUCTION ZONE -- Seed: ${seed} | Radius: ${radius}m`,
      `// Objects: ${objects.length}`,
      ...objects.map(obj =>
        formatInitC(obj.classname, +obj.dx.toFixed(3), +obj.dy.toFixed(3), +obj.dz.toFixed(3), 0, +obj.yaw.toFixed(1), 0, 1)
      ),
    ];
    return lines.join("\n");
  }, [objects, format, seed, radius]);

  const copyOutput = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));
  const downloadOutput = () => {
    const ext = format === "json" ? "json" : "c";
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `conzone_seed${seed}.${ext}`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ Downloaded ${objects.length} objects`);
  };

  const Slider = ({ label, value, onChange, min, max, step, unit = "" }: any) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#5a8a5a] text-[10px]">{label}</span>
        <span className="text-[#ff9800] text-[10px] font-bold">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-[#1a2e1a] rounded-full appearance-none cursor-pointer accent-[#ff9800]" />
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden bg-[#080f09] relative font-mono">
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-black text-[11px] font-black px-4 py-2 rounded shadow-[0_0_20px_rgba(39,174,96,0.5)]">
          {toast}
        </div>
      )}
      
      <div className="w-72 shrink-0 bg-[#0a1209] border-r border-[#1a2e1a] flex flex-col p-4 space-y-4 overflow-y-auto">
        <div className="border-b border-[#1a2e1a] pb-3">
          <div className="text-[9px] text-[#3a6a3a] font-black uppercase tracking-widest leading-none mb-1">DANKVAULT™ CORE</div>
          <div className="text-[#27ae60] font-black text-[18px] italic tracking-tighter leading-none uppercase">Neural Construction</div>
        </div>

        <div className="space-y-4">
          <div>
             <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2 font-black italic">1. Neural Seed</div>
             <div className="flex gap-2">
              <input type="number" value={seed} onChange={e => setSeed(Number(e.target.value))} className="flex-1 bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded focus:border-[#27ae60] outline-none" />
              <button onClick={rollSeed} className="px-3 bg-[#27ae60] text-black text-[10px] font-black rounded hover:bg-white transition-all">ROLL</button>
            </div>
          </div>

          <div>
             <Slider label="Zone Radius" value={radius} onChange={setRadius} min={15} max={60} step={5} unit="m" />
          </div>

          <div className="pt-2 border-t border-[#1a2e1a]/30">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2 font-black italic">2. Logic Engines</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={includeLoot} onChange={e => setIncludeLoot(e.target.checked)} className="hidden" />
                <div className={`w-3 h-3 rounded-sm border border-[#27ae60] flex items-center justify-center ${includeLoot ? "bg-[#27ae60]" : "bg-transparent group-hover:bg-[#27ae6022]"}`} />
                <span className="text-[10px] text-[#b8d4b8] font-bold uppercase">Include Construction Loot</span>
              </label>
              {includeLoot && <Slider label="Loot Density" value={lootChance} onChange={setLootChance} min={0.1} max={1.0} step={0.1} unit="%" />}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1a2e1a]">
             <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2.5 font-black italic">3. World Alignment</div>
             <div className="grid grid-cols-1 gap-2">
               <div className="flex items-center gap-2">
                 <span className="text-[9px] text-[#2a4e2a] w-4">X</span>
                 <input type="number" value={posX} onChange={e => setPosX(Number(e.target.value))} className="flex-1 bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded" />
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[9px] text-[#2a4e2a] w-4">Y</span>
                 <input type="number" value={posY} onChange={e => setPosY(Number(e.target.value))} className="flex-1 bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded" />
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[9px] text-[#2a4e2a] w-4">Z</span>
                 <input type="number" value={posZ} onChange={e => setPosZ(Number(e.target.value))} className="flex-1 bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded" />
               </div>
             </div>
             <div className="mt-4">
                <Slider label="Rotation (Yaw)" value={yaw} onChange={setYaw} min={0} max={359} step={1} unit="°" />
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 bg-[#060402] relative">
          <ZonePreview3D objects={objects3D} zoneRadius={radius} />
          
          <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md border border-[#1a2e1a] px-3 py-2 rounded-sm pointer-events-auto shrink-0">
               <div className="text-[9px] text-[#5a8a5a] uppercase font-black mb-1">Active Manifest</div>
               <div className="text-[#27ae60] text-[11px] font-black">{objects.length} Objects Materialized</div>
               <div className={`text-[8px] font-bold mt-0.5 ${objects.length >= MAX_OBJECTS ? "text-[#e74c3c]" : "text-[#5a8a5a]/60"}`}>
                INTEGRITY: {objects.length >= MAX_OBJECTS ? "CRITICAL (Limit Reached)" : "NOMINAL"}
              </div>
            </div>
            
            <div className="flex gap-2 pointer-events-auto">
              <button onClick={copyOutput} className="bg-[#1a2e1a] border border-[#27ae60]/40 text-[#27ae60] hover:bg-[#27ae60] hover:text-black px-4 py-2 rounded-sm font-black text-[11px] uppercase transition-all shadow-xl">
                Copy
              </button>
              <button onClick={downloadOutput} className="bg-[#27ae60] hover:bg-white text-black px-4 py-2 rounded-sm font-black text-[11px] uppercase transition-all shadow-xl">
                ⚡ Capture Sequence
              </button>
            </div>
          </div>
        </div>
        
        <div className="h-40 border-t border-[#1a2e1a] bg-[#0a1209] flex flex-col shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="px-4 py-2 flex items-center justify-between border-b border-[#1a2e1a] bg-black/40">
             <div className="flex gap-4">
                <button onClick={() => setFormat("json")} className={`text-[10px] font-black transition-all ${format === "json" ? "text-white" : "text-[#1a2e1a] hover:text-[#3a6a3a]"}`}>JSON</button>
                <button onClick={() => setFormat("initc")} className={`text-[10px] font-black transition-all ${format === "initc" ? "text-white" : "text-[#1a2e1a] hover:text-[#3a6a3a]"}`}>INIT.C</button>
             </div>
             <div className="text-[9px] text-[#2a4e2a] font-black uppercase italic tracking-widest ring-1 ring-[#1a2e1a] px-2 py-0.5 rounded-sm">Pipe: STABLE</div>
          </div>
          <textarea readOnly value={output} className="flex-1 p-4 bg-transparent text-[#27ae60]/60 font-mono text-[10px] outline-none resize-none leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
