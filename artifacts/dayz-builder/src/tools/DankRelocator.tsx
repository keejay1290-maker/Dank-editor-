/**
 * DankRelocator — Object offset, rotate, scale and mirror tool.
 * Supports both init.c (CreateObjectEx) and objectSpawnersArr JSON formats.
 * Mirror mode, per-axis scale, and rotation around centroid.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

type InputFormat = "initc" | "json";

interface ParsedObject {
  id: string;
  classname: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
}

const EXAMPLE_INITC = `GetGame().CreateObjectEx("WoodenCrate", Vector(7200, 0, 2400), ECE_CREATEPHYS|ECE_UPDATEPATHGRAPH);
GetGame().CreateObjectEx("BarrelHoles_Blue", Vector(7205, 0, 2400), ECE_CREATEPHYS|ECE_UPDATEPATHGRAPH);
GetGame().CreateObjectEx("Land_Tent_Dome", Vector(7210, 0, 2410), ECE_CREATEPHYS|ECE_UPDATEPATHGRAPH);`;

const EXAMPLE_JSON = JSON.stringify([
  { name: "WoodenCrate",    pos: [7200, 0, 2400], ypr: [0, 0, 0] },
  { name: "BarrelHoles_Blue", pos: [7205, 0, 2400], ypr: [0, 0, 0] },
  { name: "Land_Tent_Dome",  pos: [7210, 0, 2410], ypr: [0, 0, 0] },
], null, 2);

let _id = 0;
const uid = () => `obj_${++_id}`;

function parseInitC(text: string): ParsedObject[] {
  const re = /CreateObjectEx\("([^"]+)",\s*Vector\(([^)]+)\)/g;
  const results: ParsedObject[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const [cx, cy, cz] = m[2].split(",").map(s => parseFloat(s.trim()));
    results.push({ id: uid(), classname: m[1], x: cx, y: cy, z: cz, yaw: 0, pitch: 0, roll: 0 });
  }
  return results;
}

function parseJson(text: string): ParsedObject[] {
  try {
    const arr = JSON.parse(text);
    const items = Array.isArray(arr) ? arr : arr?.Objects ?? [];
    return items.map((o: Record<string, unknown>) => {
      const pos = (o.pos ?? o.position ?? [0, 0, 0]) as number[];
      const ypr = (o.ypr ?? o.orientation ?? [0, 0, 0]) as number[];
      return {
        id: uid(),
        classname: String(o.name ?? o.classname ?? "Unknown"),
        x: pos[0] ?? 0, y: pos[1] ?? 0, z: pos[2] ?? 0,
        yaw: ypr[0] ?? 0, pitch: ypr[1] ?? 0, roll: ypr[2] ?? 0,
      };
    });
  } catch {
    return [];
  }
}

export default function DankRelocator() {
  const [, navigate] = useLocation();
  const [inputFormat, setInputFormat] = useState<InputFormat>("initc");
  const [input, setInput] = useState(EXAMPLE_INITC);
  const [objects, setObjects] = useState<ParsedObject[]>([]);
  const [parsed, setParsed] = useState(false);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [dz, setDz] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleZ, setScaleZ] = useState(1);
  const [rotY, setRotY] = useState(0);
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorZ, setMirrorZ] = useState(false);
  const [outputFormat, setOutputFormat] = useState<InputFormat>("initc");
  const [copied, setCopied] = useState(false);

  function parse() {
    const objs = inputFormat === "initc" ? parseInitC(input) : parseJson(input);
    setObjects(objs);
    setParsed(true);
    setOutputFormat(inputFormat);
  }

  const transformed = useMemo(() => {
    if (!objects.length) return [];
    const cx = objects.reduce((s, o) => s + o.x, 0) / objects.length;
    const cz = objects.reduce((s, o) => s + o.z, 0) / objects.length;
    const rad = (rotY * Math.PI) / 180;
    return objects.map(o => {
      let lx = (o.x - cx) * scaleX;
      let lz = (o.z - cz) * scaleZ;
      if (mirrorX) lx = -lx;
      if (mirrorZ) lz = -lz;
      const rx = lx * Math.cos(rad) - lz * Math.sin(rad);
      const rz = lx * Math.sin(rad) + lz * Math.cos(rad);
      return { ...o, x: cx + rx + dx, y: o.y + dy, z: cz + rz + dz };
    });
  }, [objects, dx, dy, dz, scaleX, scaleZ, rotY, mirrorX, mirrorZ]);

  const output = useMemo(() => {
    if (!transformed.length) return "";
    if (outputFormat === "initc") {
      return transformed.map(o =>
        `GetGame().CreateObjectEx("${o.classname}", Vector(${o.x.toFixed(3)}, ${o.y.toFixed(3)}, ${o.z.toFixed(3)}), ECE_CREATEPHYS|ECE_UPDATEPATHGRAPH);`
      ).join("\n");
    }
    return JSON.stringify(
      transformed.map(o => ({
        name: o.classname,
        pos: [parseFloat(o.x.toFixed(3)), parseFloat(o.y.toFixed(3)), parseFloat(o.z.toFixed(3))],
        ypr: [parseFloat(o.yaw.toFixed(3)), parseFloat(o.pitch.toFixed(3)), parseFloat(o.roll.toFixed(3))],
        scale: 1.0,
      })),
      null, 2
    );
  }, [transformed, outputFormat]);

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function download() {
    const ext = outputFormat === "initc" ? "c" : "json";
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([output], { type: "text/plain" })),
      download: `relocated.${ext}`,
    });
    a.click();
  }

  const [showHow, setShowHow] = useState(false);
  const inputCls = "bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded focus:outline-none focus:border-[#e67e22]";

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#e67e22] font-black text-[13px] tracking-widest">🔀 DANKRELOCATOR</span>
        <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UPGRADED</span>
        <div className="ml-auto flex gap-2">
          <button onClick={copy} className="px-3 py-1 bg-[#0e2010] border border-[#27ae60] text-[#27ae60] text-[10px] font-bold rounded hover:bg-[#1a3a1a]">
            {copied ? "✅" : "COPY"}
          </button>
          <button onClick={download} className="px-3 py-1 bg-[#e67e22] text-[#080f09] text-[10px] font-bold rounded hover:bg-[#f39c12]">
            ⬇ EXPORT
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Input */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-[#1a2e1a]">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-2">
            <span className="text-[10px] text-[#5a8a5a]">INPUT FORMAT:</span>
            {(["initc","json"] as InputFormat[]).map(f => (
              <button key={f} onClick={() => { setInputFormat(f); setInput(f === "initc" ? EXAMPLE_INITC : EXAMPLE_JSON); setParsed(false); setObjects([]); }}
                className={`px-2 py-0.5 text-[9px] font-bold rounded ${inputFormat === f ? "bg-[#e67e22] text-[#080f09]" : "text-[#3a6a3a] hover:text-[#5a8a5a]"}`}>
                {f === "initc" ? "init.c" : "JSON Spawner"}
              </button>
            ))}
            <button onClick={parse}
              className="ml-auto px-3 py-1 bg-[#e67e22] text-[#080f09] text-[9px] font-bold rounded hover:bg-[#f39c12]">
              PARSE {objects.length > 0 ? `(${objects.length})` : ""}
            </button>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[10px] font-mono p-3 resize-none border-0 outline-none leading-relaxed" />
        </div>

        {/* Transform */}
        <div className="w-56 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-4 overflow-y-auto">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden mb-4">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0c1510] text-[10px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-3 py-2 text-[9px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Select input format (init.c or JSON Spawner) and paste your content.</p>
                <p>2. Click PARSE to extract objects.</p>
                <p>3. Set ΔX/ΔY/ΔZ to offset, scale to resize, or rotate around the centroid.</p>
                <p>4. Mirror X/Z flips the layout along that axis.</p>
                <p>5. Choose output format and copy or download the result.</p>
              </div>
            )}
          </div>
          <div className="text-[9px] text-[#e67e22] font-bold mb-2 tracking-widest">TRANSLATE</div>
          {([["ΔX", dx, setDx], ["ΔY", dy, setDy], ["ΔZ", dz, setDz]] as const).map(([label, val, setter]) => (
            <div key={label} className="flex items-center gap-2 mb-2">
              <span className="text-[#5a8a5a] text-[9px] w-8 shrink-0">{label}</span>
              <input type="number" value={val} onChange={e => setter(Number(e.target.value))}
                className={`flex-1 ${inputCls} text-right`} />
            </div>
          ))}

          <div className="text-[9px] text-[#e67e22] font-bold mb-2 mt-4 tracking-widest">SCALE</div>
          {([["X", scaleX, setScaleX], ["Z", scaleZ, setScaleZ]] as const).map(([label, val, setter]) => (
            <div key={label} className="flex items-center gap-2 mb-2">
              <span className="text-[#5a8a5a] text-[9px] w-8 shrink-0">{label}</span>
              <input type="number" value={val} step={0.1} onChange={e => setter(Number(e.target.value))}
                className={`flex-1 ${inputCls} text-right`} />
            </div>
          ))}

          <div className="text-[9px] text-[#e67e22] font-bold mb-2 mt-4 tracking-widest">ROTATE (Y-axis)</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#5a8a5a] text-[9px] w-8 shrink-0">°</span>
            <input type="number" value={rotY} onChange={e => setRotY(Number(e.target.value))}
              className={`flex-1 ${inputCls} text-right`} />
          </div>
          <input type="range" min={0} max={360} value={rotY} onChange={e => setRotY(Number(e.target.value))}
            className="w-full accent-[#e67e22] mt-1" />

          <div className="text-[9px] text-[#e67e22] font-bold mb-2 mt-4 tracking-widest">MIRROR</div>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={mirrorX} onChange={e => setMirrorX(e.target.checked)} className="accent-[#e67e22]" />
              <span className="text-[9px] text-[#b8d4b8]">Mirror X</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={mirrorZ} onChange={e => setMirrorZ(e.target.checked)} className="accent-[#e67e22]" />
              <span className="text-[9px] text-[#b8d4b8]">Mirror Z</span>
            </label>
          </div>

          <div className="text-[9px] text-[#e67e22] font-bold mb-2 mt-4 tracking-widest">OUTPUT FORMAT</div>
          <div className="flex gap-1">
            {(["initc","json"] as InputFormat[]).map(f => (
              <button key={f} onClick={() => setOutputFormat(f)}
                className={`px-2 py-1 text-[9px] font-bold rounded border ${outputFormat === f ? "border-[#e67e22] text-[#e67e22]" : "border-[#1a2e1a] text-[#5a8a5a]"}`}>
                {f === "initc" ? "init.c" : "JSON"}
              </button>
            ))}
          </div>

          {parsed && (
            <div className="mt-4 p-2 bg-[#0e1a0e] border border-[#1a2e1a] rounded text-[9px] text-[#3a6a3a]">
              {objects.length} objects parsed
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">
            OUTPUT — transformed ({transformed.length} objects)
          </div>
          <textarea readOnly value={output}
            className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[10px] font-mono p-3 resize-none border-0 outline-none leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
