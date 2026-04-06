import React, { useState, useMemo, useCallback } from "react";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import PointCloud3D from "@/PointCloud3D";

const ROCK_TYPES = [
   "Land_Rock_Ch_M1", "Land_Rock_Ch_m2", "Land_Rock_Ch_B1", "Land_Rock_Ch_B2",
   "Land_Rock_Ch_B3", "Land_Rock_Ch_B4", "Land_Rock_Wall1", "Land_Rock_Wall2"
];

export default function TerrainMaker() {
  const [seed, setSeed] = useState(42);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0); // Base Y level
  const [posZ, setPosZ] = useState(0);
  const [radius, setRadius] = useState(100);
  const [heightFactor, setHeightFactor] = useState(40);
  const [density, setDensity] = useState(300);

  const [format, setFormat] = useState<"initc" | "json">("json");
  const [toast, setToast] = useState("");

  const rollSeed = () => setSeed(Math.floor(Math.random() * 999999));
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  // Simple PRNG
  const rng = useCallback((seedVal: number) => {
    let s = seedVal >>> 0;
    return () => {
      s += 0x6D2B79F5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, []);

  const objects = useMemo(() => {
    const objs: any[] = [];
    const rand = rng(seed);
    
    // Generate 'peaks' within the radius to cluster rocks around
    const numPeaks = Math.max(1, Math.floor(radius / 20));
    const peaks = Array.from({ length: numPeaks }, () => ({
        x: posX + (rand() - 0.5) * (radius * 1.2),
        z: posZ + (rand() - 0.5) * (radius * 1.2),
        weight: 0.5 + rand() * 0.5
    }));

    for (let i = 0; i < density; i++) {
        // Random point in circle
        const angle = rand() * Math.PI * 2;
        const rDist = Math.sqrt(rand()) * radius;
        const px = posX + Math.cos(angle) * rDist;
        const pz = posZ + Math.sin(angle) * rDist;

        // Calculate Y based on proximity to peaks
        let highestY = 0;
        for (const pk of peaks) {
           const distToPeak = Math.sqrt(Math.pow(px - pk.x, 2) + Math.pow(pz - pk.z, 2));
           // Smooth dropoff bell curve
           const infl = Math.max(0, 1 - (distToPeak / (radius * 0.6)));
           const py = infl * heightFactor * pk.weight;
           if (py > highestY) highestY = py;
        }

        // Add some noise to Y
        const finalY = posY + highestY + (rand() * 4 - 2);

        const rockName = ROCK_TYPES[Math.floor(rand() * ROCK_TYPES.length)];
        objs.push({ 
            name: rockName, 
            x: px, 
            y: finalY, 
            z: pz, 
            yaw: rand() * 360, 
            pitch: rand() * 30 - 15, 
            roll: rand() * 30 - 15 
        });
    }

    return objs;
  }, [seed, posX, posY, posZ, radius, heightFactor, density, rng]);

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
    const lines = [
      HELPER_FUNC,
      `// TERRAIN MAKER -- Seed: ${seed} | Objects: ${objects.length}`,
      ...objects.map(obj =>
        formatInitC(obj.name, +obj.x.toFixed(3), +obj.y.toFixed(3), +obj.z.toFixed(3), +obj.pitch.toFixed(3), +obj.yaw.toFixed(3), +obj.roll.toFixed(3), 1)
      ),
    ];
    return lines.join("\n");
  }, [objects, format, seed]);

  const copyOutput = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));
  const downloadOutput = () => {
    if(!output) return;
    const ext = format === "json" ? "json" : "c";
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `custom_terrain.${ext}`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ Downloaded ${objects.length} objects`);
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-[#080f09] relative">
      {toast && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-white text-[11px] font-bold px-4 py-2 rounded-sm shadow-lg">{toast}</div>}

      <div className="w-80 shrink-0 bg-[#0a1209] border-r border-[#1a2e1a] overflow-y-auto flex flex-col p-4 space-y-4">
        <div className="border-b border-[#1a2e1a] pb-2">
          <div className="text-[9px] text-[#3a6a3a] font-bold tracking-widest uppercase">Utility</div>
          <div className="text-[#27ae60] font-bold text-[15px]">TERRAIN SCULPTOR</div>
        </div>

        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">🏔️ Generation</div>
          <div className="flex gap-2 mb-3">
             <input type="number" value={seed} onChange={e => setSeed(Number(e.target.value))} className="flex-1 bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
             <button onClick={rollSeed} className="px-2 py-1 bg-[#27ae60] text-[#080f09] text-[10px] font-bold rounded">ROLL</button>
          </div>
        </div>

        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">📍 Base Location</div>
          <div className="grid grid-cols-3 gap-2 border-b border-[#1a2e1a] pb-3 mb-2">
             <input type="number" placeholder="X" value={posX} onChange={e => setPosX(Number(e.target.value))} className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
             <input type="number" placeholder="Y" value={posY} onChange={e => setPosY(Number(e.target.value))} className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
             <input type="number" placeholder="Z" value={posZ} onChange={e => setPosZ(Number(e.target.value))} className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#5a8a5a] text-[10px] uppercase font-bold">Terrain Spread Radius</span>
            <span className="text-[#27ae60] text-[10px] font-bold">{radius}m</span>
          </div>
          <input type="range" min="30" max="400" step="10" value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full h-1 bg-[#1a2e1a] rounded-full appearance-none mb-3 cursor-pointer accent-[#27ae60]" />
          
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#5a8a5a] text-[10px] uppercase font-bold">Peak Elevation</span>
            <span className="text-[#27ae60] text-[10px] font-bold">{heightFactor}m</span>
          </div>
          <input type="range" min="0" max="150" step="5" value={heightFactor} onChange={e => setHeightFactor(Number(e.target.value))} className="w-full h-1 bg-[#1a2e1a] rounded-full appearance-none mb-3 cursor-pointer accent-[#27ae60]" />

          <div className="flex justify-between items-center mb-1">
            <span className="text-[#5a8a5a] text-[10px] uppercase font-bold">Boulder Count</span>
            <span className="text-[#27ae60] text-[10px] font-bold">{density}</span>
          </div>
          <input type="range" min="50" max="1000" step="50" value={density} onChange={e => setDensity(Number(e.target.value))} className="w-full h-1 bg-[#1a2e1a] rounded-full appearance-none cursor-pointer accent-[#27ae60]" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative bg-[#0c1510]">
          <PointCloud3D points={objects.map(o => ({ x: o.x, y: o.y, z: o.z }))} autoRotate={true} />
        </div>
        <div className="h-64 bg-[#0a1209] border-t border-[#1a2e1a] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a2e1a]">
            <div className="flex gap-2">
              <span className="text-[#5a8a5a] text-[10px] uppercase font-bold tracking-wider my-auto mr-2">Output ({objects.length} Boulders)</span>
              <button onClick={() => setFormat("json")} className={`px-3 py-1 text-[10px] font-bold rounded ${format === "json" ? "bg-[#27ae60] text-[#080f09]" : "text-[#5a8a5a]"}`}>JSON</button>
              <button onClick={() => setFormat("initc")} className={`px-3 py-1 text-[10px] font-bold rounded ${format === "initc" ? "bg-[#27ae60] text-[#080f09]" : "text-[#5a8a5a]"}`}>INIT.C</button>
            </div>
            <div className="flex gap-2">
              <button onClick={copyOutput} className="px-3 py-1 bg-[#1a2e1a] text-[#b8d4b8] text-[10px] rounded hover:bg-[#2a3e2a]">Copy</button>
              <button onClick={downloadOutput} className="px-3 py-1 bg-[#27ae60] text-[#080f09] text-[10px] font-bold rounded hover:bg-[#2ecc71]">Download</button>
            </div>
          </div>
          <textarea readOnly value={output} className="flex-1 bg-transparent text-[#27ae60] font-mono text-[10px] p-4 resize-none outline-none" />
        </div>
      </div>
    </div>
  );
}
