import { useState, useMemo, useCallback, Suspense } from "react";
import { generateStructure, makeRng } from "@/lib/randomStructureData";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import ZonePreview3D from "@/ZonePreview3D";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomSeed() { return Math.floor(Math.random() * 0xFFFFFF) + 1; }

function downloadFile(content: string, ext: string, name: string) {
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([content], { type: "text/plain" })),
    download: `${name}.${ext}`,
  });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RandomStructureMaker() {
  const [seed,       setSeed]       = useState(() => randomSeed());
  const [addExtras,  setAddExtras]  = useState(false);
  const [posX,       setPosX]       = useState(4500);
  const [posY,       setPosY]       = useState(400);
  const [posZ,       setPosZ]       = useState(5800);
  const [format,     setFormat]     = useState<"initc" | "json">("initc");
  const [generated,  setGenerated]  = useState(false);

  const result = useMemo(() => generateStructure(seed, addExtras), [seed, addExtras]);

  const generate = useCallback(() => setGenerated(true), []);
  const reroll   = useCallback(() => { setSeed(randomSeed()); setGenerated(true); }, []);

  // ── Export ──────────────────────────────────────────────────────────────────
  const buildInitC = useCallback(() => {
    const { shell, props } = result;
    const lines: string[] = [
      HELPER_FUNC,
      `// ═══ RANDOM STRUCTURE — ${shell.label.toUpperCase()} ═══`,
      `// Seed: ${seed}  |  Extras: ${addExtras}`,
      `// Objects: ${props.length + 1}`,
      "",
      `// Shell`,
      formatInitC(shell.classname, posX, posY, posZ, 0, 0, 0, 1.0),
      "",
      `// Interior props`,
    ];
    for (const { def, x, y, z, yaw } of props) {
      lines.push(formatInitC(def.classname, posX + x, posY + y, posZ + z, 0, yaw, 0, 1.0));
    }
    return lines.join("\n");
  }, [result, seed, addExtras, posX, posY, posZ]);

  const buildJSON = useCallback(() => {
    const { shell, props } = result;
    const objs = [
      { name: shell.classname, pos: [posX, posY, posZ], ypr: [0, 0, 0], scale: 1.0, enableCEPersistency: 0, customString: "" },
      ...props.map(({ def, x, y, z, yaw }) => ({
        name: def.classname,
        pos: [+(posX + x).toFixed(3), +(posY + y).toFixed(3), +(posZ + z).toFixed(3)],
        ypr: [0, +yaw.toFixed(2), 0], scale: 1.0, enableCEPersistency: 0, customString: "",
      })),
    ];
    return JSON.stringify({ Objects: objs }, null, 2);
  }, [result, posX, posY, posZ]);

  const download = useCallback(() => {
    if (format === "initc") downloadFile(buildInitC(), "c", `random_structure_${seed}`);
    else                    downloadFile(buildJSON(),  "json", `random_structure_${seed}`);
  }, [format, buildInitC, buildJSON, seed]);

  const totalObjs = result.props.length + 1;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">

      {/* Header */}
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0a1209] flex items-center gap-3">
        <span className="text-[9px] text-[#3a6a3a] font-bold tracking-widest mr-1">DANK'S DAYZ STUDIO</span>
        <span className="text-[#e91e8c] font-bold text-[11px] tracking-wider">🎲 RANDOM STRUCTURE</span>
        <span className="text-[#3a6a3a] text-[10px]">Procedural enterable building generator</span>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${totalObjs > 200 ? "bg-[#e67e22]/20 text-[#e67e22]" : "bg-[#27ae60]/20 text-[#27ae60]"}`}>
            {totalObjs} objects
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className="w-56 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] flex flex-col overflow-y-auto">
          <div className="p-3 flex flex-col gap-3">

            {/* Seed */}
            <div>
              <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">Seed</div>
              <div className="flex gap-1">
                <input type="number" value={seed} onChange={e => setSeed(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded-sm focus:border-[#e91e8c] outline-none" />
                <button onClick={reroll}
                  className="px-2 py-1 text-[9px] font-bold bg-[#1a0a14] border border-[#4a1a3a] text-[#e91e8c] rounded-sm hover:bg-[#e91e8c] hover:text-[#080f09] transition-all">
                  🎲
                </button>
              </div>
            </div>

            {/* World position */}
            <div>
              <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">World Position</div>
              {(["X","Y","Z"] as const).map((label) => {
                const val = label === "X" ? posX : label === "Y" ? posY : posZ;
                const set = label === "X" ? setPosX : label === "Y" ? setPosY : setPosZ;
                return (
                  <div key={label} className="flex items-center gap-1 mb-1">
                    <span className="text-[9px] text-[#5a8a5a] w-3">{label}</span>
                    <input type="number" value={val} onChange={e => set(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded-sm focus:border-[#e91e8c] outline-none" />
                  </div>
                );
              })}
            </div>

            {/* Add Extras */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={addExtras} onChange={e => setAddExtras(e.target.checked)}
                className="accent-[#e91e8c]" />
              <span className="text-[10px] text-[#b8d4b8]">Add Extras</span>
              <span className="text-[8px] text-[#3a6a3a]">(guns, furniture)</span>
            </label>

            {/* Generate */}
            <button onClick={generate}
              className="w-full py-2 text-[11px] font-bold bg-[#e91e8c] text-[#080f09] rounded-sm hover:bg-[#ff4db8] transition-all">
              ⚡ Generate
            </button>

            {/* Format + Download */}
            <div>
              <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">Export Format</div>
              <div className="flex gap-1 mb-2">
                {(["initc", "json"] as const).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex-1 py-1 text-[9px] font-bold rounded-sm border transition-all ${format === f ? "bg-[#e91e8c] text-[#080f09] border-[#e91e8c]" : "border-[#1a2e1a] text-[#3a6a3a] hover:border-[#e91e8c]"}`}>
                    {f === "initc" ? "init.c" : "JSON"}
                  </button>
                ))}
              </div>
              <button onClick={download}
                className="w-full py-1.5 text-[10px] font-bold bg-[#1a0a14] border border-[#4a1a3a] text-[#e91e8c] rounded-sm hover:bg-[#e91e8c] hover:text-[#080f09] transition-all">
                ⬇ Download
              </button>
            </div>

            {/* Shell info */}
            {generated && (
              <div className="border border-[#1a2e1a] rounded-sm p-2 bg-[#080f09]">
                <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">Shell</div>
                <div className="text-[10px] text-[#27ae60] font-bold">{result.shell.label}</div>
                <div className="text-[9px] text-[#3a6a3a]">{result.shell.classname}</div>
                <div className="text-[9px] text-[#5a8a5a] mt-1">{result.shell.w}×{result.shell.d}m · {result.shell.type}</div>
                <div className="text-[9px] text-[#5a8a5a]">{result.props.length} interior props</div>
              </div>
            )}
          </div>
        </div>

        {/* ── 3D Preview ── */}
        <div className="flex-1 relative overflow-hidden">
          {!generated ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="text-[#1a2e1a] text-[40px]">🎲</div>
              <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">Press Generate</div>
              <div className="text-[#3a2810] text-[9px] text-center max-w-[200px] leading-relaxed">
                Each seed produces a unique enterable structure with randomised interior layout
              </div>
            </div>
          ) : (
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-[#080c08]">
                <span className="text-[#4a3820] text-[10px] uppercase tracking-wider animate-pulse">Loading 3D…</span>
              </div>
            }>
              <ZonePreview3D objects={result.objects3D} zoneRadius={Math.max(result.shell.w, result.shell.d) * 1.2} />
            </Suspense>
          )}

          {/* Hint */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-[#1a2e1a] pointer-events-none">
            Drag to orbit · Scroll to zoom
          </div>
        </div>
      </div>
    </div>
  );
}
