
import React, { useState, useMemo, useCallback } from "react";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import FreewayPreview3D from "@/FreewayPreview3D";
import { executePipeline, PipelineContext } from "@/lib/pipeline";
import { Point3D } from "@/lib/types";

export default function FreewayMaker() {
  // ─── STATE ───────────────────────────────────────────────────────────
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(10);
  const [startZ, setStartZ] = useState(0);

  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(10);
  const [endZ, setEndZ] = useState(100);

  // Bezier Control Point
  const [cp1X, setCp1X] = useState(50);
  const [cp1Y, setCp1Y] = useState(20);
  const [cp1Z, setCp1Z] = useState(50);

  const [roadType, setRoadType] = useState<"concrete" | "stone" | "planking">("concrete");
  const [supportPillars, setSupportPillars] = useState(true);
  const [guardRails, setGuardRails] = useState(true);
  const [carWrecks, setCarWrecks] = useState(0.2);
  const [format, setFormat] = useState<"initc" | "json">("json");
  const [snapGrid, setSnapGrid] = useState(1.0);
  const [toast, setToast] = useState("");
  const [pipelineCtx, setPipelineCtx] = useState<PipelineContext | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const applySnap = (v: number) => snapGrid > 0 ? Math.round(v / snapGrid) * snapGrid : v;

  const ROAD_DEFS = {
    concrete: {
      name:   "StaticObj_BusStation_wall",
      width:  8.0,
      length: 8.0, // Length of the wall asset
      guard:  "StaticObj_Mil_HBarrier_6m"
    },
    stone: {
      name:   "Land_Castle_Wall1_20",
      width:  12.0,
      length: 20.0,
      guard:  "StaticObj_Roadblock_CncBlock"
    },
    planking: {
      name:   "Land_Roadblock_WoodenCrate",
      width:  2.5,
      length: 2.5,
      guard:  "StaticObj_Roadblock_Bags_Long"
    },
  };


  const chordLen = Math.sqrt((endX-startX)**2 + (endY-startY)**2 + (endZ-startZ)**2);
  const controlDist = Math.sqrt((cp1X-startX)**2 + (cp1Z-startZ)**2) + Math.sqrt((endX-cp1X)**2 + (endZ-cp1Z)**2);
  const estimatedLen = (chordLen + controlDist) / 2;

  // ─── BEZIER GENERATION ENGINE ──────────────────────────────────────────
  const objects = useMemo(() => {
    const objs: any[] = [];
    const def = ROAD_DEFS[roadType];
    
    const MAX_FREEWAY_OBJECTS = 3000;
    
    if (estimatedLen < 1) return objs;
    
    const steps = Math.ceil(estimatedLen / def.length);
    const dt = 1.0 / steps;

    for (let i = 0; i <= steps; i++) {
        if (objs.length >= MAX_FREEWAY_OBJECTS) break;
        
        const t = i * dt;
        const nextT = (i + 1) * dt;

        // Quadratic Bezier Formula: P(t) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
        const getPt = (time: number) => {
            const it = 1 - time;
            return {
                x: it*it*startX + 2*it*time*cp1X + time*time*endX,
                y: it*it*startY + 2*it*time*cp1Y + time*time*endY,
                z: it*it*startZ + 2*it*time*cp1Z + time*time*endZ
            };
        };

        const p = getPt(t);
        const pNext = getPt(Math.min(nextT, 1.0));

        // Calculate segment orientation
        const dx = pNext.x - p.x;
        const dy = pNext.y - p.y;
        const dz = pNext.z - p.z;
        const segLen = Math.sqrt(dx*dx + dz*dz + dy*dy);
        if (segLen < 0.01 && i < steps) continue;

        const yaw = (Math.atan2(dx, dz) * 180) / Math.PI + 90;
        const pitch = (Math.atan2(dy, Math.sqrt(dx*dx + dz*dz)) * -180) / Math.PI;

        // Road Deck
        objs.push({ name: def.name, x: p.x, y: p.y, z: p.z, yaw, pitch, roll: 0 });

        // Support Pillars (Optimized: limit depth and frequency)
        if (supportPillars && i % 4 === 0 && p.y > -2) {
            const pillarName = roadType === "planking" ? "Land_Roadblock_WoodenCrate" : "StaticObj_Mil_HBarrier_1m";
            const maxPillarDepth = 15; // Cap pillar height to prevent explosion
            const startYPos = p.y - 4;
            const endYPos = Math.max(-50, p.y - maxPillarDepth);
            
            for (let py = startYPos; py >= endYPos; py -= 4) {
               if (objs.length >= MAX_FREEWAY_OBJECTS) break;
               objs.push({ name: pillarName, x: p.x, y: py, z: p.z, yaw, pitch: 0, roll: 0 });
            }
        }

        // Guard Rails
        if (guardRails && i < steps) {
            const rYaw = yaw * (Math.PI / 180);
            const halfWidth = def.width / 2;
            const oxL = Math.cos(rYaw) * halfWidth;
            const ozL = -Math.sin(rYaw) * halfWidth;
            const oxR = -Math.cos(rYaw) * halfWidth;
            const ozR = Math.sin(rYaw) * halfWidth;

            // Finer steps for rails to ensure smooth curves
            const railSubsteps = 2;
            for (let sub = 0; sub < railSubsteps; sub++) {
                if (objs.length >= MAX_FREEWAY_OBJECTS) break;
                const subT = t + (sub / railSubsteps) * dt;
                const sp = getPt(subT);
                objs.push({ name: def.guard, x: sp.x + oxL, y: sp.y + 1.1, z: sp.z + ozL, yaw, pitch, roll: 0 });
                objs.push({ name: def.guard, x: sp.x + oxR, y: sp.y + 1.1, z: sp.z + ozR, yaw, pitch, roll: 0 });
            }
        }

        // Wrecks
        if (carWrecks > 0 && Math.random() < carWrecks * 0.1 && objs.length < MAX_FREEWAY_OBJECTS) {
            const wreckTypes = ["Land_Wreck_Ssed19_1", "Land_Wreck_Volha_1", "Land_Wreck_V3S"];
            const wName = wreckTypes[Math.floor(Math.random() * wreckTypes.length)];
            const laneOff = (Math.random() - 0.5) * (def.width * 0.7);
            const rYaw = yaw * (Math.PI / 180);
            objs.push({ 
                name: wName, 
                x: p.x + Math.cos(rYaw)*laneOff, y: p.y + 0.3, z: p.z - Math.sin(rYaw)*laneOff, 
                yaw: yaw + 90 + (Math.random()*40-20), pitch, roll: 0 
            });
        }
    }

    return objs;
  }, [startX, startY, startZ, endX, endY, endZ, cp1X, cp1Y, cp1Z, roadType, supportPillars, guardRails, carWrecks]);

  // V2 Pipeline Sync
  useCallback(() => {
    executePipeline("Freeway_High_Fidelity", "industrial", 0, 
      { startX, startY, startZ, endX, endY, endZ, cp1X, cp1Y, cp1Z, roadType },
      () => objects.map(o => ({ ...o, x: o.x - startX, y: o.y - startY, z: o.z - startZ }))
    ).then(setPipelineCtx).catch(console.error);
  }, [objects, startX, startY, startZ, endX, endY, endZ, cp1X, cp1Y, cp1Z, roadType])();

  const output = useMemo(() => {
    if (objects.length === 0) return "";
    if (format === "json") {
      const entries = objects.map(obj => ({
        name: obj.name,
        pos: [+obj.x.toFixed(3), +obj.y.toFixed(3), +obj.z.toFixed(3)],
        ypr: [+obj.pitch.toFixed(3), +obj.yaw.toFixed(3), +obj.roll.toFixed(3)],
        scale: 1
      }));
      return JSON.stringify({ Objects: entries }, null, 2);
    }
    const lines = [HELPER_FUNC, `// DANK FREEWAY PLUS -- Objects: ${objects.length}`, ...objects.map(obj => formatInitC(obj.name, obj.x, obj.y, obj.z, obj.pitch, obj.yaw, obj.roll, 1))];
    return lines.join("\n");
  }, [objects, format]);


  const copyOutput = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));

  const downloadOutput = () => {
    if (!output) return;
    const ext = format === "json" ? "json" : "c";
    const name = `freeway_plus_${Date.now()}`;
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `${name}.${ext}`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ Downloaded ${objects.length} nodes`);
  };
  
  const InputCoord = ({ label, x, setX, y, setY, z, setZ, color = "#27ae60" }: any) => (
    <div className="mb-4 border-l-2 pl-3 border-[#1a2e1a]">
      <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color }}>{label}</div>
      <div className="flex gap-1.5">
         <input type="number" value={x} onChange={e => setX(applySnap(Number(e.target.value)))} className="w-1/3 bg-[#060402] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[10px] px-2 py-1.5 rounded" />
         <input type="number" value={y} onChange={e => setY(applySnap(Number(e.target.value)))} className="w-1/3 bg-[#060402] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[10px] px-2 py-1.5 rounded" />
         <input type="number" value={z} onChange={e => setZ(applySnap(Number(e.target.value)))} className="w-1/3 bg-[#060402] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[10px] px-2 py-1.5 rounded" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden bg-[#080f09]">
      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-[#080f09] text-[11px] font-black px-6 py-2 rounded-sm shadow-2xl">{toast}</div>}

      <div className="w-80 shrink-0 bg-[#0a1209] border-r border-[#1a2e1a] overflow-y-auto flex flex-col p-4 space-y-4 shadow-xl">
        <div className="border-b border-[#1a2e1a] pb-3">
          <div className="text-[10px] text-[#27ae60] font-black tracking-widest uppercase">🛣️ Freeway Plus</div>
          <div className="text-[#5a4a2a] text-[9px] font-bold italic leading-tight mt-1">Bezier Curve Road Engine · High-Fidelity Snapping</div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
             <div className="text-[9px] text-[#3a6a3a] font-black uppercase tracking-widest">🧲 Snapping</div>
             <select value={snapGrid} onChange={e => setSnapGrid(Number(e.target.value))} className="bg-[#060402] border border-[#1a2e1a] text-[#27ae60] text-[10px] font-bold px-2 py-0.5 rounded">
                <option value="0">Off</option>
                <option value="1">1m</option>
                <option value="5">5m</option>
                <option value="10">10m</option>
             </select>
          </div>

          <InputCoord label="A: Start Point" x={startX} setX={setStartX} y={startY} setY={setStartY} z={startZ} setZ={setStartZ} />
          <InputCoord label="B: Curve Center (CP1)" x={cp1X} setX={setCp1X} y={cp1Y} setY={setCp1Y} z={cp1Z} setZ={setCp1Z} color="#f1c40f" />
          <InputCoord label="C: End Point" x={endX} setX={setEndX} y={endY} setY={setEndY} z={endZ} setZ={setEndZ} color="#e74c3c" />
        </div>

        <div className="pt-2">
          <div className="text-[#3a6a3a] text-[9px] uppercase tracking-widest font-black mb-3 border-b border-[#1a2e1a] pb-1">Road Config</div>
          <select value={roadType} onChange={e => setRoadType(e.target.value as any)}
            className="w-full bg-[#060402] border border-[#1a2e1a] text-[#27ae60] font-bold text-[11px] px-2 py-2 rounded mb-4">
            <option value="concrete">🏙️ Modern Concrete (8m)</option>
            <option value="stone">⛰️ Castle Stone (12m)</option>
            <option value="planking">🪵 Log Planking (2.5m)</option>
          </select>

          <div className="grid grid-cols-1 gap-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={supportPillars} onChange={e => setSupportPillars(e.target.checked)} className="hidden" />
              <div className={`w-3.5 h-3.5 rounded border border-[#27ae60] flex items-center justify-center transition-all ${supportPillars ? "bg-[#27ae60]" : "bg-transparent group-hover:bg-[#27ae6022]"}`}>
                  {supportPillars && <span className="text-[#080f09] text-[10px] font-black">✓</span>}
              </div>
              <span className="text-[#b8d4b8] text-[10px] font-bold uppercase opacity-70 group-hover:opacity-100">Drop Pillars</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={guardRails} onChange={e => setGuardRails(e.target.checked)} className="hidden" />
              <div className={`w-3.5 h-3.5 rounded border border-[#27ae60] flex items-center justify-center transition-all ${guardRails ? "bg-[#27ae60]" : "bg-transparent group-hover:bg-[#27ae6022]"}`}>
                  {guardRails && <span className="text-[#080f09] text-[10px] font-black">✓</span>}
              </div>
              <span className="text-[#b8d4b8] text-[10px] font-bold uppercase opacity-70 group-hover:opacity-100">Attach Guardrails</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1a2e1a]">
           <div className="flex justify-between items-center text-[10px] mb-2">
              <span className="text-[#3a6a3a] font-bold">NODE COUNT</span>
              <span className={`font-black ${objects.length > 2000 ? "text-[#e74c3c]" : "text-[#27ae60]"}`}>{objects.length} / 5000</span>
           </div>
           {pipelineCtx && (
               <div className="bg-[#27ae60]/5 border border-[#27ae60]/20 p-2 rounded flex flex-col gap-1">
                   <div className="flex justify-between text-[9px]">
                       <span className="text-[#5a8a5a]">FIDELITY SCORE</span>
                       <span className="text-[#d4a017] font-black">{pipelineCtx.fidelityScore}%</span>
                   </div>
                   <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                       <div className="h-full bg-[#27ae60] transition-all" style={{ width: `${pipelineCtx.fidelityScore}%` }} />
                   </div>
               </div>
           )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative bg-[#0c1510] shadow-inner">
           {/* Visual Aid Overlays */}
           <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <div className="px-3 py-1.5 bg-[#0a1209]/80 border border-[#27ae6033] rounded backdrop-blur-md">
                 <div className="text-[8px] text-[#5a8a5a] font-black uppercase tracking-tighter mb-1 select-none">Live Analysis</div>
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                       <span className="text-[12px] font-black text-[#27ae60]">{Math.round(objects.length/estimatedLen||0)}</span>
                       <span className="text-[7px] text-[#3a6a3a]">Objs / Metre</span>
                    </div>
                    <div className="flex flex-col border-l border-[#1a2e1a] pl-3">
                       <span className="text-[12px] font-black text-[#3498db]">{(chordLen || 0).toFixed(0)}m</span>
                       <span className="text-[7px] text-[#3a6a3a]">Span Distance</span>
                    </div>
                 </div>
              </div>
           </div>
           <FreewayPreview3D objects={objects} />
        </div>
        <div className="h-64 bg-[#0a1209] border-t border-[#1a2e1a] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d160d] border-b border-[#1a2e1a]">
            <div className="flex gap-3">
               <div className="flex p-0.5 bg-black/40 rounded border border-[#27ae60]/20">
                  <button onClick={() => setFormat("json")} className={`px-4 py-1 text-[10px] font-black uppercase rounded-sm transition-all ${format === "json" ? "bg-[#27ae60] text-[#080f08]" : "text-[#5a8a5a] hover:text-[#27ae60]"}`}>JSON</button>
                  <button onClick={() => setFormat("initc")} className={`px-4 py-1 text-[10px] font-black uppercase rounded-sm transition-all ${format === "initc" ? "bg-[#27ae60] text-[#080f08]" : "text-[#5a8a5a] hover:text-[#27ae60]"}`}>init.c</button>
               </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyOutput} className="px-4 py-1.5 bg-[#0e2010] border border-[#27ae60] text-[#27ae60] text-[10px] font-bold rounded hover:bg-[#27ae60] hover:text-[#080f09] transition-all">COPY CODE</button>
              <button onClick={downloadOutput} className="px-4 py-1.5 bg-[#27ae60] text-[#080f09] text-[10px] font-black rounded hover:bg-[#e8b82a] transition-all shadow-lg">DOWNLOAD EXPORT</button>
            </div>
          </div>
          <textarea readOnly value={output} className="flex-1 bg-transparent text-[#27ae60]/80 font-mono text-[10px] p-4 resize-none outline-none leading-relaxed" spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
