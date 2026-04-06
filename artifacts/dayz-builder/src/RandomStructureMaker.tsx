import { useState, useMemo, useCallback } from "react";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import { OBJECT_FAMILY_MAP } from "@/lib/ai/engines/objectFamilyMap";
import { generateRandomStructure, RandomStructureOptions } from "@/lib/randomStructureGenerator";
import ZonePreview3D, { ZoneObject } from "@/ZonePreview3D";

// ─── Dimensions lookup for previews ───────────────────────────────────────────
const PREVIEW_DIMENSIONS: Record<string, { w: number, h: number, d: number, color: string }> = {
  "Land_ContainerLocked_Blue_DE": { w: 6, h: 2.6, d: 2.4, color: "#004488" },
  "StaticObj_Roadblock_CncBlock": { w: 3, h: 1, d: 1.2, color: "#8a8a8a" },
  "StaticObj_DieselPowerPlant_Tank_Small": { w: 4, h: 4, d: 4, color: "#555555" },
  "StaticObj_Mil_HBarrier_Big": { w: 1.5, h: 1.5, d: 1.5, color: "#8a7a5a" },
  "StaticObj_Mil_HBarrier_6m": { w: 6, h: 2.5, d: 1.2, color: "#8a7a5a" },
  "Land_Roadblock_Bags_Long": { w: 4, h: 0.8, d: 1, color: "#6a6a6a" },
  "Land_Castle_Wall1_20": { w: 8, h: 12, d: 4, color: "#7a7a7a" },
  "StaticObj_BusStation_wall": { w: 6, h: 4, d: 0.4, color: "#dddddd" },
  "Land_Container_1Bo": { w: 6, h: 2.6, d: 2.4, color: "#3a3a3a" },
  "Land_Underground_Tunnel_Single": { w: 12, h: 6, d: 6, color: "#2a2a2a" },
  "Land_Underground_Tunnel_Double": { w: 12, h: 6, d: 12, color: "#2a2a2a" },
  "Land_Underground_Room_Small": { w: 12, h: 6, d: 12, color: "#2a2a2a" },
  "Land_Underground_Entrance": { w: 6, h: 8, d: 4, color: "#2a2a2a" },
};

function randomSeed() { return Math.floor(Math.random() * 0xFFFFFF) + 1; }

export default function RandomStructureMaker() {
  const [seed, setSeed] = useState(() => randomSeed());
  const [count, setCount] = useState(12);
  const [radius, setRadius] = useState(25);
  const [category, setCategory] = useState<keyof typeof OBJECT_FAMILY_MAP>("military");
  
  const [posX, setPosX] = useState(12000);
  const [posY, setPosY] = useState(400);
  const [posZ, setPosZ] = useState(12600);
  const [format, setFormat] = useState<"initc" | "json">("json");
  const [toast, setToast] = useState("");

  const rollSeed = () => setSeed(randomSeed());
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const opts: RandomStructureOptions = useMemo(() => ({
    seed, category, count, radius, posX, posY, posZ
  }), [seed, category, count, radius, posX, posY, posZ]);

  const objects = useMemo(() => generateRandomStructure(opts), [opts]);

  const objects3D = useMemo((): ZoneObject[] => {
    return objects.map(obj => {
      const dim = PREVIEW_DIMENSIONS[obj.classname] || { w: 4, h: 4, d: 4, color: "#445544" };
      return {
        type: obj.classname,
        x: obj.dx - posX,
        y: obj.dy - posY,
        z: obj.dz - posZ,
        yaw: obj.yaw,
        ...dim
      };
    });
  }, [objects, posX, posY, posZ]);

  const output = useMemo(() => {
    if (format === "json") {
      const entries = objects.map(o => ({
        name: o.classname,
        pos: [+o.dx.toFixed(3), +o.dy.toFixed(3), +o.dz.toFixed(3)],
        ypr: [0, +o.yaw.toFixed(3), 0],
        scale: 1,
        enableCEPersistency: 0,
        customString: "",
      }));
      return JSON.stringify({ Objects: entries }, null, 2);
    }
    const lines = [
      HELPER_FUNC,
      `// DANKVAULT™ RANDOM ${category.toUpperCase()} CLUSTER -- Seed: ${seed} | Radius: ${radius}m`,
      `// Total Objects Generated: ${objects.length}`,
      ...objects.map(o => formatInitC(o.classname, +o.dx.toFixed(3), +o.dy.toFixed(3), +o.dz.toFixed(3), 0, +o.yaw.toFixed(3), 0, 1))
    ];
    return lines.join("\n");
  }, [objects, format, seed, count, category, radius]);

  const copyOutput = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));

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
          <div className="text-[#27ae60] font-black text-[18px] italic tracking-tighter leading-none uppercase">Neural Scatter</div>
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
             <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2 font-black italic">2. Geometric Family</div>
             <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-2 rounded outline-none capitalize focus:border-[#27ae60]">
               {Object.keys(OBJECT_FAMILY_MAP).map(f => <option key={f} value={f}>{f}</option>)}
             </select>
          </div>

          <div>
             <div className="flex justify-between text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2 font-black italic">
               <span>3. Node Density</span>
               <span className="text-[#27ae60] font-black">{count} pts</span>
             </div>
             <input type="range" min="3" max="25" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full accent-[#27ae60]" />
          </div>

          <div>
             <div className="flex justify-between text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2 font-black italic">
               <span>4. Spatial Radius</span>
               <span className="text-[#27ae60] font-black">{radius}m</span>
             </div>
             <input type="range" min="5" max="80" value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full accent-[#27ae60]" />
          </div>

          <div className="pt-4 border-t border-[#1a2e1a]">
             <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2.5 font-black italic">5. World Alignment</div>
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
            </div>
            
            <button onClick={copyOutput} className="bg-[#27ae60] hover:bg-white text-black px-4 py-2 rounded-sm font-black text-[11px] uppercase pointer-events-auto transition-all shadow-xl self-end">
              ⚡ Capture Sequence
            </button>
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
