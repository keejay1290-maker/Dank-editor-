import { useState, useMemo, useCallback, Suspense } from "react";
import { generateZone, STATION_LOOT, getLootPlacements } from "@/lib/constructionZoneData";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import ZonePreview3D from "@/ZonePreview3D";

function randomSeed() { return Math.floor(Math.random() * 0xFFFFFF) + 1; }

function downloadFile(content: string, ext: string, name: string) {
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([content], { type: "text/plain" })),
    download: `${name}.${ext}`,
  });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export default function ConstructionZoneMaker() {
  const [seed,         setSeed]         = useState(() => randomSeed());
  const [radius,       setRadius]       = useState(30);
  const [stationCount, setStationCount] = useState(2);
  const [posX,         setPosX]         = useState(4500);
  const [posY,         setPosY]         = useState(400);
  const [posZ,         setPosZ]         = useState(5800);
  const [format,       setFormat]       = useState<"initc" | "json">("initc");
  const [generated,    setGenerated]    = useState(false);

  const result = useMemo(() => generateZone(seed, radius, stationCount), [seed, radius, stationCount]);

  const reroll   = useCallback(() => { setSeed(randomSeed()); setGenerated(true); }, []);
  const generate = useCallback(() => setGenerated(true), []);

  // ── Export ──────────────────────────────────────────────────────────────────
  const buildInitC = useCallback(() => {
    const { structural, buildings, cranes } = result;
    const lootPerStation = STATION_LOOT.reduce((s, l) => s + l.count, 0);
    const lines: string[] = [
      HELPER_FUNC,
      `// ═══ CONSTRUCTION ZONE ═══`,
      `// Seed: ${seed}  |  Radius: ${radius}m  |  Stations: ${stationCount}`,
      `// Buildings: ${buildings.length}  |  Cranes: ${cranes.length}`,
      `// Structural objects: ${structural.filter(p => !p.isStation).length}`,
      `// Loot per station: ${lootPerStation} items (60% inside building, 40% at crane base)`,
      "",
      "// ─── STRUCTURAL OBJECTS ─────────────────────────────────────────────────────",
    ];
    for (const p of structural) {
      lines.push(formatInitC(p.classname, posX + p.x, posY + p.y, posZ + p.z, 0, p.yaw, 0, 1.0));
    }
    for (let i = 0; i < stationCount; i++) {
      lines.push("", `// ─── SUPPLY STATION ${i + 1} — LOOT (60% building / 40% crane) ─────────────────`);
      const placements = getLootPlacements(i, posX, posY, posZ, buildings, cranes);
      for (const lp of placements) {
        lines.push(formatInitC(lp.classname, lp.x, lp.y, lp.z, 0, 0, 0, 1.0));
      }
    }
    return lines.join("\n");
  }, [result, seed, radius, stationCount, posX, posY, posZ]);

  const buildJSON = useCallback(() => {
    const { structural, buildings, cranes } = result;
    const objs: object[] = structural.map(p => ({
      name: p.classname,
      pos: [+(posX + p.x).toFixed(3), +(posY + p.y).toFixed(3), +(posZ + p.z).toFixed(3)],
      ypr: [0, +p.yaw.toFixed(2), 0], scale: 1.0, enableCEPersistency: 0, customString: "",
    }));
    for (let i = 0; i < stationCount; i++) {
      const placements = getLootPlacements(i, posX, posY, posZ, buildings, cranes);
      for (const lp of placements) {
        objs.push({
          name: lp.classname,
          pos: [+lp.x.toFixed(3), +lp.y.toFixed(3), +lp.z.toFixed(3)],
          ypr: [0, 0, 0], scale: 1.0, enableCEPersistency: 0, customString: "",
        });
      }
    }
    return JSON.stringify({ Objects: objs }, null, 2);
  }, [result, stationCount, posX, posY, posZ]);

  const download = useCallback(() => {
    if (format === "initc") downloadFile(buildInitC(), "c",    `conzone_${seed}`);
    else                    downloadFile(buildJSON(),  "json", `conzone_${seed}`);
  }, [format, buildInitC, buildJSON, seed]);

  const structCount = result.structural.length;
  const totalObjs   = structCount + result.totalLootItems;

  return (
    <div className="flex flex-col h-full bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">

      {/* Header */}
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0a1209] flex items-center gap-3">
        <span className="text-[9px] text-[#3a6a3a] font-bold tracking-widest mr-1">DANK'S DAYZ STUDIO</span>
        <span className="text-[#ff9800] font-bold text-[11px] tracking-wider">🚧 CONSTRUCTION ZONE</span>
        <span className="text-[#3a6a3a] text-[10px]">Base-building supply site generator</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] text-[#5a8a5a]">{structCount} structural</span>
          <span className="text-[9px] text-[#27ae60] font-bold">+{result.totalLootItems} loot</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${totalObjs > 500 ? "bg-[#e67e22]/20 text-[#e67e22]" : "bg-[#27ae60]/20 text-[#27ae60]"}`}>
            {totalObjs} total
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
                  className="flex-1 bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded-sm focus:border-[#ff9800] outline-none" />
                <button onClick={reroll}
                  className="px-2 py-1 text-[9px] font-bold bg-[#1a1000] border border-[#4a3000] text-[#ff9800] rounded-sm hover:bg-[#ff9800] hover:text-[#080f09] transition-all">
                  🎲
                </button>
              </div>
            </div>

            {/* Zone radius */}
            <div>
              <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">Zone Radius</div>
              <div className="flex gap-1">
                {[20, 30, 40].map(r => (
                  <button key={r} onClick={() => setRadius(r)}
                    className={`flex-1 py-1 text-[9px] font-bold rounded-sm border transition-all ${radius === r ? "bg-[#ff9800] text-[#080f09] border-[#ff9800]" : "border-[#1a2e1a] text-[#3a6a3a] hover:border-[#ff9800]"}`}>
                    {r}m
                  </button>
                ))}
              </div>
            </div>

            {/* Station count */}
            <div>
              <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">Supply Stations</div>
              <div className="flex gap-1">
                {[2, 3].map(n => (
                  <button key={n} onClick={() => setStationCount(n)}
                    className={`flex-1 py-1 text-[9px] font-bold rounded-sm border transition-all ${stationCount === n ? "bg-[#27ae60] text-[#080f09] border-[#27ae60]" : "border-[#1a2e1a] text-[#3a6a3a] hover:border-[#27ae60]"}`}>
                    {n} stations
                  </button>
                ))}
              </div>
            </div>

            {/* World position */}
            <div>
              <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">World Position</div>
              {(["X","Y","Z"] as const).map(label => {
                const val = label === "X" ? posX : label === "Y" ? posY : posZ;
                const set = label === "X" ? setPosX : label === "Y" ? setPosY : setPosZ;
                return (
                  <div key={label} className="flex items-center gap-1 mb-1">
                    <span className="text-[9px] text-[#5a8a5a] w-3">{label}</span>
                    <input type="number" value={val} onChange={e => set(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded-sm focus:border-[#ff9800] outline-none" />
                  </div>
                );
              })}
            </div>

            {/* Generate */}
            <button onClick={generate}
              className="w-full py-2 text-[11px] font-bold bg-[#ff9800] text-[#080f09] rounded-sm hover:bg-[#ffb74d] transition-all">
              ⚡ Generate
            </button>

            {/* Format + Download */}
            <div>
              <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">Export Format</div>
              <div className="flex gap-1 mb-2">
                {(["initc", "json"] as const).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex-1 py-1 text-[9px] font-bold rounded-sm border transition-all ${format === f ? "bg-[#ff9800] text-[#080f09] border-[#ff9800]" : "border-[#1a2e1a] text-[#3a6a3a] hover:border-[#ff9800]"}`}>
                    {f === "initc" ? "init.c" : "JSON"}
                  </button>
                ))}
              </div>
              <button onClick={download}
                className="w-full py-1.5 text-[10px] font-bold bg-[#1a1000] border border-[#4a3000] text-[#ff9800] rounded-sm hover:bg-[#ff9800] hover:text-[#080f09] transition-all">
                ⬇ Download
              </button>
            </div>

            {/* Loot manifest */}
            <div className="border border-[#1a2e1a] rounded-sm p-2 bg-[#080f09]">
              <div className="text-[9px] text-[#3a6a3a] uppercase tracking-wider mb-1">Per Station Loot</div>
              {STATION_LOOT.map(l => (
                <div key={l.classname} className="flex justify-between text-[8px] text-[#7a6a4a]">
                  <span>{l.label}</span>
                  <span className="text-[#5a8a5a]">×{l.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3D Preview ── */}
        <div className="flex-1 relative overflow-hidden">
          {!generated ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="text-[#1a2e1a] text-[40px]">🚧</div>
              <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">Press Generate</div>
              <div className="text-[#3a2810] text-[9px] text-center max-w-[220px] leading-relaxed">
                Amber = structural props · Green = supply stations with full loot kit
              </div>
            </div>
          ) : (
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-[#080c08]">
                <span className="text-[#4a3820] text-[10px] uppercase tracking-wider animate-pulse">Loading 3D…</span>
              </div>
            }>
              <ZonePreview3D objects={result.objects3D} zoneRadius={radius} />
            </Suspense>
          )}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-[#1a2e1a] pointer-events-none">
            Drag to orbit · Scroll to zoom · Green = supply stations
          </div>
        </div>
      </div>
    </div>
  );
}
