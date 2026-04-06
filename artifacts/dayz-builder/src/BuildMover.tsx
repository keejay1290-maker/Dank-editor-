import React, { useState, useMemo, useCallback } from "react";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import PointCloud3D from "@/PointCloud3D";

interface ParsedObj {
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
}


export default function BuildMover() {
  const [inputCode, setInputCode] = useState("");
  const [deltaX, setDeltaX] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const [deltaZ, setDeltaZ] = useState(0);
  const [deltaYaw, setDeltaYaw] = useState(0);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [format, setFormat] = useState<"initc" | "json">("json");

  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const parsedObjects = useMemo((): ParsedObj[] => {
    const objs: ParsedObj[] = [];
    if (!inputCode.trim()) return objs;
    try {
      if (inputCode.trim().startsWith("{")) {
        const data = JSON.parse(inputCode);
        if (data.Objects && Array.isArray(data.Objects)) {
          for (const o of data.Objects) {
            objs.push({
              name: o.name || "Unknown",
              x: o.pos?.[0] || 0, y: o.pos?.[1] || 0, z: o.pos?.[2] || 0,
              yaw: o.ypr?.[1] || 0, pitch: o.ypr?.[0] || 0, roll: o.ypr?.[2] || 0
            });
          }
        }
        return objs;
      }
    } catch (e) {}
    const lines = inputCode.split("\n");
    for (const line of lines) {
      const match = line.match(/SpawnObject\(\s*"([^"]+)"\s*,\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?/i);
      if (match) {
        const name = match[1];
        const posSplit = match[2].split(" ").map(Number);
        const yprSplit = match[3] ? match[3].split(" ").map(Number) : [0,0,0];
        if (posSplit.length >= 3) {
           objs.push({
             name, x: posSplit[0]||0, y: posSplit[1]||0, z: posSplit[2]||0,
             pitch: yprSplit[0]||0, yaw: yprSplit[1]||0, roll: yprSplit[2]||0
           });
        }
      }
    }
    return objs;
  }, [inputCode]);

  // Output calculations mit scaling
  const output = useMemo(() => {
    if (parsedObjects.length === 0) return { outputStr: "", pts: [] };

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const o of parsedObjects) {
      if (o.x < minX) minX = o.x; if (o.x > maxX) maxX = o.x;
      if (o.z < minZ) minZ = o.z; if (o.z > maxZ) maxZ = o.z;
      if (o.y < minY) minY = o.y; if (o.y > maxY) maxY = o.y;
    }
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    const cy = minY; // Scale from the basement up

    const angle = deltaYaw * (Math.PI / 180);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const transformed = parsedObjects.map(obj => {
       // Offset from local center
       let dx = obj.x - cx;
       let dy = obj.y - cy;
       let dz = obj.z - cz;

       // 1. Proportional Scale
       dx *= scaleFactor;
       dy *= scaleFactor;
       dz *= scaleFactor;

       // 2. Orbit Math
       const rx = dx * cosA - dz * sinA;
       const rz = dx * sinA + dz * cosA;

       return {
         name: obj.name,
         x: cx + rx + deltaX,
         y: cy + dy + deltaY,
         z: cz + rz + deltaZ,
         yaw: (obj.yaw + deltaYaw) % 360,
         pitch: obj.pitch,
         roll: obj.roll
       };
    });

    if (format === "json") {
      const entries = transformed.map(obj => ({
        name: obj.name,
        pos: [+obj.x.toFixed(3), +obj.y.toFixed(3), +obj.z.toFixed(3)],
        ypr: [+obj.pitch.toFixed(3), +obj.yaw.toFixed(3), +obj.roll.toFixed(3)],
        scale: 1
      }));
      return { outputStr: JSON.stringify({ Objects: entries }, null, 2), pts: transformed };
    }

    const lines = [
      HELPER_FUNC,
      `// MOVED BUILD -- Original Objects: ${parsedObjects.length}`,
      ...transformed.map(obj =>
        formatInitC(obj.name, +obj.x.toFixed(3), +obj.y.toFixed(3), +obj.z.toFixed(3), +obj.pitch.toFixed(3), +obj.yaw.toFixed(3), +obj.roll.toFixed(3), 1)
      ),
    ];
    return { outputStr: lines.join("\n"), pts: transformed };
  }, [parsedObjects, deltaX, deltaY, deltaZ, deltaYaw, format]);

  const copyOutput = () => navigator.clipboard.writeText(output.outputStr).then(() => showToast("✓ Copied!"));
  const downloadOutput = () => {
    if(!output.outputStr) return;
    const ext = format === "json" ? "json" : "c";
    const blob = new Blob([output.outputStr], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `moved_build.${ext}`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ Downloaded ${parsedObjects.length} objects`);
  };

  const InputSlider = ({ label, value, onChange, min, max, step, placeholder }: any) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#5a8a5a] text-[10px] uppercase font-bold">{label}</span>
      </div>
      <div className="flex gap-2">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1 my-auto bg-[#1a2e1a] rounded-full appearance-none cursor-pointer accent-[#27ae60]" />
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
           placeholder={placeholder}
           className="w-20 bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden bg-[#080f09] relative">
      {toast && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-white text-[11px] font-bold px-4 py-2 rounded-sm shadow-lg">{toast}</div>}

      {/* Control Panel */}
      <div className="w-80 shrink-0 bg-[#0a1209] border-r border-[#1a2e1a] overflow-y-auto flex flex-col p-4 space-y-4">
        <div className="border-b border-[#1a2e1a] pb-2">
          <div className="text-[9px] text-[#3a6a3a] font-bold tracking-widest uppercase">Utility</div>
          <div className="text-[#27ae60] font-bold text-[15px]">BUILD MOVER</div>
        </div>

        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">🔭 Translation Offset</div>
          <InputSlider label="X Offset (East/West)" value={deltaX} onChange={setDeltaX} min={-15000} max={15000} step={1} />
          <InputSlider label="Y Offset (Up/Down)" value={deltaY} onChange={setDeltaY} min={-500} max={500} step={0.1} />
          <InputSlider label="Z Offset (North/South)" value={deltaZ} onChange={setDeltaZ} min={-15000} max={15000} step={1} />
        </div>


        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">🔄 Orbital Rotation</div>
          <InputSlider label="Rotate Build (Yaw)" value={deltaYaw} onChange={setDeltaYaw} min={-180} max={180} step={1} />
          <div className="text-[#3a6a3a] text-[9px] leading-tight">Rotates all objects around the calculated center-point of the build.</div>
        </div>

        <div>
           <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">📐 Proportional Scale ({scaleFactor.toFixed(2)}x)</div>
           <InputSlider label="Global Scale" value={scaleFactor} onChange={setScaleFactor} min={0.1} max={5.0} step={0.01} />
           <div className="text-[#3a6a3a] text-[9px] leading-tight">Resizes the spacing between all objects uniformly. Use values &lt; 1 to compress.</div>
        </div>
        
        <div className="pt-4 border-t border-[#1a2e1a]">
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">📊 Parser Stats</div>
            <div className="text-[#27ae60] text-[11px] font-bold">{parsedObjects.length > 0 ? `${parsedObjects.length} Objects Found` : "No valid objects detected"}</div>
        </div>
      </div>

      {/* Editors and Previews */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Input Area (Collapsed heavily to make room for preview!) */}
        <div className="h-32 flex flex-col bg-[#0c1510]">
           <div className="px-4 py-2 border-b border-[#1a2e1a] text-[#5a8a5a] text-[10px] font-bold uppercase tracking-wider flex justify-between">
              <span>Paste Original Code (JSON / INIT.C)</span>
              <span className="text-[#27ae60]">{parsedObjects.length > 0 ? "✓ Extracted" : "..."}</span>
           </div>
           <textarea 
               value={inputCode} 
               onChange={(e) => setInputCode(e.target.value)}
               placeholder="Paste DayZ Editor JSON or init.c exported objects here..."
               className="flex-1 bg-transparent text-[#7a9a5a] font-mono text-[10px] p-4 resize-none outline-none" 
           />
        </div>

        {/* 3D Visualizer */}
        <div className="flex-1 relative bg-[#0c1510] border-t border-[#1a2e1a]">
          {/* We show the ORIGINAL build as Ghosted points, and the NEW build as green points by passing them all to one PointCloud or just rendering the output. Let's just render the output output.*/}
          <PointCloud3D points={output.pts.map(obj => ({x: obj.x, y: obj.y, z: obj.z}))} autoRotate={true} />
        </div>

        {/* Output Area */}
        <div className="h-64 bg-[#0a1209] border-t border-[#1a2e1a] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a2e1a]">
            <div className="flex gap-2">
              <span className="text-[#5a8a5a] text-[10px] uppercase font-bold tracking-wider my-auto mr-2">Output</span>
              <button onClick={() => setFormat("json")} className={`px-3 py-1 text-[10px] font-bold rounded ${format === "json" ? "bg-[#27ae60] text-[#080f09]" : "text-[#5a8a5a]"}`}>JSON</button>
              <button onClick={() => setFormat("initc")} className={`px-3 py-1 text-[10px] font-bold rounded ${format === "initc" ? "bg-[#27ae60] text-[#080f09]" : "text-[#5a8a5a]"}`}>INIT.C</button>
            </div>
            <div className="flex gap-2">
              <button onClick={copyOutput} className="px-3 py-1 bg-[#1a2e1a] text-[#b8d4b8] text-[10px] rounded hover:bg-[#2a3e2a]">Copy</button>
              <button onClick={downloadOutput} className="px-3 py-1 bg-[#27ae60] text-[#080f09] text-[10px] font-bold rounded hover:bg-[#2ecc71]">Download</button>
            </div>
          </div>
          <textarea readOnly value={output.outputStr} className="flex-1 bg-transparent text-[#27ae60] font-mono text-[10px] p-4 resize-none outline-none" />
        </div>

      </div>
    </div>
  );
}
