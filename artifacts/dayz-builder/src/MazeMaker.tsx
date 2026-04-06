import React, { useState, useMemo, useCallback } from "react";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import { MAX_OBJECTS } from "@/lib/constants";
import MazePreview3D from "@/MazePreview3D";
import { generateContainerMaze, MazeOptions } from "@/lib/mazeGenerator";
import { executePipeline, PipelineContext } from "@/lib/pipeline";
import { Point3D } from "@/lib/types";

const CONTAINER_TYPES = [
  { value: "land_container_1bo", label: "Container 1Bo (Dark)" },
  { value: "land_container_1aoh", label: "Container 1Aoh (Grey)" },
  { value: "land_container_1mo", label: "Container 1Mo (Military Olive)" },
  { value: "land_container_1moh", label: "Container 1Moh (Mil Open-top)" },
];

export default function MazeMaker() {
  const [seed, setSeed] = useState(42);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [layers, setLayers] = useState(1);
  const [includeLoot, setIncludeLoot] = useState(true);
  const [lootChance, setLootChance] = useState(0.5);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [format, setFormat] = useState<"initc" | "json">("json");
  const [toast, setToast] = useState("");
  const [mobileTab, setMobileTab] = useState<"options" | "map" | "code">("options");
  const [pipelineCtx, setPipelineCtx] = useState<PipelineContext | null>(null);

  const rollSeed = () => setSeed(Math.floor(Math.random() * 999999));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const mazeOpts: MazeOptions = useMemo(() => ({
    seed,
    width,
    height,
    layers,
    containerTypes: CONTAINER_TYPES.map(c => c.value),
    posX,
    posY,
    posZ,
    yaw,
    includeLoot,
    lootChance,
  }), [seed, width, height, layers, posX, posY, posZ, yaw, includeLoot, lootChance]);

  const objects = useMemo(() => generateContainerMaze(mazeOpts), [mazeOpts]);

  // V2 Pipeline Execution
  useMemo(() => {
    executePipeline(
      "MazeMaker",
      "generic", 
      seed,
      { ...mazeOpts },
      () => {
        const maze = generateContainerMaze(mazeOpts);
        return maze.map(obj => ({
          x: obj.dx, y: obj.dy, z: obj.dz,
          yaw: obj.yaw, pitch: 0, roll: 0,
          name: obj.classname
        }));
      }
    ).then(setPipelineCtx).catch(console.error);
  }, [mazeOpts, seed]);

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
      `// MAZE ARENA -- Seed: ${seed} | Size: ${width}x${height} | Layers: ${layers}`,
      `// Objects: ${objects.length}`,
      ...objects.map(obj =>
        formatInitC(obj.classname, +obj.dx.toFixed(3), +obj.dy.toFixed(3), +obj.dz.toFixed(3), 0, +obj.yaw.toFixed(1), 0, 1)
      ),
    ];
    return lines.join("\n");
  }, [objects, format, seed, width, height, layers]);

  const copyOutput = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));
  const downloadOutput = () => {
    const ext = format === "json" ? "json" : "c";
    const name = pipelineCtx?.metadata.filename || `maze_${width}x${height}_seed${seed}`;
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `${name}.${ext}`,
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
        <span className="text-[#27ae60] text-[10px] font-bold">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-[#1a2e1a] rounded-full appearance-none cursor-pointer accent-[#27ae60]" />
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden bg-[#080f09] relative">
      {toast && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-white text-[11px] font-bold px-4 py-2 rounded-sm shadow-lg">{toast}</div>}

      <div className="w-72 shrink-0 bg-[#0a1209] border-r border-[#1a2e1a] overflow-y-auto flex flex-col p-4 space-y-4">
        <div className="border-b border-[#1a2e1a] pb-2">
          <div className="text-[9px] text-[#3a6a3a] font-bold tracking-widest uppercase">Builder</div>
          <div className="text-[#27ae60] font-bold text-[15px]">CONTAINER MAZE</div>
        </div>

        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">🌀 Seed & Size</div>
          <div className="flex gap-2 mb-2">
            <input type="number" value={seed} onChange={e => setSeed(Number(e.target.value))} className="flex-1 bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1 rounded" />
            <button onClick={rollSeed} className="px-2 py-1 bg-[#27ae60] text-[#080f09] text-[10px] font-bold rounded">ROLL</button>
          </div>
          <Slider label="Width" value={width} onChange={setWidth} min={4} max={20} step={1} />
          <Slider label="Height" value={height} onChange={setHeight} min={4} max={20} step={1} />
          <Slider label="Layers" value={layers} onChange={setLayers} min={1} max={3} step={1} />
        </div>

        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">💰 Loot Settings</div>
          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={includeLoot} onChange={e => setIncludeLoot(e.target.checked)} className="accent-[#27ae60]" />
            <span className="text-[#b8d4b8] text-[10px]">Include Loot Items</span>
          </div>
          {includeLoot && <Slider label="Loot Density" value={lootChance} onChange={setLootChance} min={0.1} max={1.0} step={0.1} unit="%" />}
        </div>

        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">📍 Position</div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={posX} onChange={e => setPosX(Number(e.target.value))} placeholder="X" className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-1 py-1 rounded" />
            <input type="number" value={posY} onChange={e => setPosY(Number(e.target.value))} placeholder="Y" className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-1 py-1 rounded" />
            <input type="number" value={posZ} onChange={e => setPosZ(Number(e.target.value))} placeholder="Z" className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-1 py-1 rounded" />
          </div>
        </div>

        <div className="pt-4 border-t border-[#1a2e1a] space-y-2">
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1">📊 Stats</div>
          <div className="text-[#27ae60] text-[11px] font-bold">{objects.length} / {MAX_OBJECTS} Objects</div>
          
          {pipelineCtx && (
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#b8d4b8] opacity-60">FIDELITY</span>
                <span className={`font-black tracking-tighter ${pipelineCtx.fidelityScore > 90 ? "text-[#d4a017]" : "text-[#c0392b]"}`}>
                  {pipelineCtx.fidelityScore}%
                </span>
              </div>
              <div className="bg-[#27ae60]/10 border border-[#27ae60]/20 rounded-sm px-2 py-1 text-[8px] text-[#27ae60] font-bold animate-pulse flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#27ae60]" />
                PIPELINE_V2: ENGAGED
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 bg-[#0c1510]">
          <MazePreview3D 
            spawns={objects.filter(o => o.section !== "loot").map(o => ({ x: o.dx, y: o.dy, z: o.dz, yaw: o.yaw }))} 
            wallObj="Land_Container_1Bo" 
            cellSz={6.4} 
          />
        </div>
        <div className="h-64 bg-[#0a1209] border-t border-[#1a2e1a] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a2e1a]">
            <div className="flex gap-2">
              <button onClick={() => setFormat("json")} className={`px-3 py-1 text-[10px] font-bold rounded ${format === "json" ? "bg-[#27ae60] text-[#080f09]" : "text-[#5a8a5a]"}`}>JSON</button>
              <button onClick={() => setFormat("initc")} className={`px-3 py-1 text-[10px] font-bold rounded ${format === "initc" ? "bg-[#27ae60] text-[#080f09]" : "text-[#5a8a5a]"}`}>INIT.C</button>
            </div>
            <div className="flex gap-2">
              <button onClick={copyOutput} className="px-3 py-1 bg-[#1a2e1a] text-[#b8d4b8] text-[10px] rounded hover:bg-[#2a3e2a]">Copy</button>
              <button onClick={downloadOutput} className="px-3 py-1 bg-[#27ae60] text-[#080f09] text-[10px] font-bold rounded hover:bg-[#2ecc71]">Download</button>
            </div>
          </div>
          <textarea readOnly value={output} className="flex-1 bg-transparent text-[#7a9a5a] font-mono text-[10px] p-4 resize-none outline-none" />
        </div>
      </div>
    </div>
  );
}
