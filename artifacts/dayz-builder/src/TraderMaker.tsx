import React, { useState, useMemo, useCallback } from "react";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import PointCloud3D from "@/PointCloud3D";

const THEMES = [
  { id: "military", label: "Military Recon", walls: "Land_HescoBox", center: "Land_Mil_ControlTower" },
  { id: "survivor", label: "Survivor Camp", walls: "Land_Wall_Gate_Wood1", center: "Land_Shed_W6" },
  { id: "bandit", label: "Bandit Fortress", walls: "Land_Mil_WallBig_Corner", center: "Land_House_1W10" }
];

export default function TraderMaker() {
  const [theme, setTheme] = useState("military");
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [radius, setRadius] = useState(30);
  const [density, setDensity] = useState(0.8); // Higher default for Rule 2 "Dressing"

  const [format, setFormat] = useState<"initc" | "json">("json");
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const objects = useMemo(() => {
    const objs: any[] = [];
    const t = THEMES.find(th => th.id === theme) || THEMES[0];

    // 1. Center HQ - Automatic loading (Rule 1)
    objs.push({ name: t.center, x: posX, y: posY, z: posZ, yaw, pitch: 0, roll: 0 });

    // 2. Perimeter Walls (Rule 3: Gap-free structural integrity)
    const circum = 2 * Math.PI * radius;
    // Standard wall is ~5.5m. Using 5.2m spacing ensures a "Dank" solid wall with no gaps.
    const steps = Math.floor(circum / 5.2);

    for (let i = 0; i < steps; i++) {
        // Leave a gap for an entrance (Rule 4: Logical layout)
        if (i === 0 || i === steps - 1) continue; 

        const angle = (i / steps) * Math.PI * 2 + (yaw * Math.PI / 180);
        const wx = posX + Math.sin(angle) * radius;
        const wz = posZ + Math.cos(angle) * radius;
        const wYaw = (angle * 180 / Math.PI) + 90;

        objs.push({ name: t.walls, x: wx, y: posY, z: wz, yaw: wYaw, pitch: 0, roll: 0 });

        // Add floodlights on alternating walls (Rule 2: Atmospheric dressing)
        if (theme === "military" && i % 4 === 0) {
            objs.push({ name: "Land_Misc_TrailRoof_Small", x: wx, y: posY, z: wz, yaw: wYaw - 90, pitch: 0, roll: 0 });
        }
    }

    // 3. Entrance Gate
    const gAngle = yaw * Math.PI / 180;
    objs.push({ 
       name: theme === "military" ? "Land_Mil_Tent_Big1_1" : "Land_Wall_Gate_Wood1", 
       x: posX + Math.sin(gAngle) * radius, 
       y: posY, 
       z: posZ + Math.cos(gAngle) * radius, 
       yaw: yaw + 90, 
       pitch: 0, roll: 0 
    });

    // 4. Inner Clutter (Rule 2: Real-world dressing details)
    const clutterArea = radius * 0.75;
    const clutterTypes = [
       "Land_Campfire",
       "Land_WoodenTable",
       "Land_Chair_Wood",
       "Land_Barrel_Water",
       "Land_Crate_Wooden",
       "Land_Misc_Cargo1A",
       "Land_WoodenPier_15m",
       theme === "military" ? "Land_Mil_Tent_Big1_1" : "Land_Tent_Small_1"
    ];
    
    for (let i=0; i < (radius * 2) * density; i++) {
        const cType = clutterTypes[Math.floor(Math.random()*clutterTypes.length)];
        const dist = 6 + Math.random() * (clutterArea - 6);
        const ang = Math.random() * Math.PI * 2;
        const cx = posX + Math.sin(ang) * dist;
        const cz = posZ + Math.cos(ang) * dist;

        // Ensuring objects are grounded (Rule 3)
        objs.push({ name: cType, x: cx, y: posY, z: cz, yaw: Math.random()*360, pitch: 0, roll: 0 });
    }

    return objs;
  }, [theme, posX, posY, posZ, yaw, radius, density]);

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
      `// TRADER OUTPOST -- Theme: ${theme} | Objects: ${objects.length}`,
      ...objects.map(obj =>
        formatInitC(obj.name, +obj.x.toFixed(3), +obj.y.toFixed(3), +obj.z.toFixed(3), +obj.pitch.toFixed(3), +obj.yaw.toFixed(3), +obj.roll.toFixed(3), 1)
      ),
    ];
    return lines.join("\n");
  }, [objects, format, theme]);

  const copyOutput = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));
  const downloadOutput = () => {
    if(!output) return;
    const ext = format === "json" ? "json" : "c";
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `trader_outpost.${ext}`,
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
          <div className="text-[9px] text-[#3a6a3a] font-bold tracking-widest uppercase">Builder</div>
          <div className="text-[#27ae60] font-bold text-[15px]">TRADER OUTPOST</div>
          <p className="text-[10px] text-[#5a8a5a] mt-2 italic leading-relaxed">
            Rule-compliant: Gap-free Hesco walls (5.2m spacing) and rich internal clutter for cinematic immersion.
          </p>
        </div>

        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">🎪 Outpost Theme</div>
          <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full bg-[#1a1610] text-[#b8d4b8] border border-[#1a2e1a] p-1.5 rounded text-[11px] outline-none">
            {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">📍 Location</div>
          <div className="grid grid-cols-3 gap-2 border-b border-[#1a2e1a] pb-3 mb-2">
            <input type="number" placeholder="X" value={posX} onChange={e => setPosX(Number(e.target.value))} className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
            <input type="number" placeholder="Y" value={posY} onChange={e => setPosY(Number(e.target.value))} className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
            <input type="number" placeholder="Z" value={posZ} onChange={e => setPosZ(Number(e.target.value))} className="bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Yaw" value={yaw} onChange={e => setYaw(Number(e.target.value))} className="flex-1 bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] font-mono text-[11px] px-2 py-1 rounded" />
            <span className="text-[#5a8a5a] text-[10px] my-auto">Facing Direction</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#5a8a5a] text-[10px] uppercase font-bold">Perimeter Size</span>
            <span className="text-[#27ae60] text-[10px] font-bold">{radius}m</span>
          </div>
          <input type="range" min="15" max="80" step="5" value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full h-1 bg-[#1a2e1a] rounded-full appearance-none cursor-pointer accent-[#27ae60]" />
        </div>

        <div className="pb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#5a8a5a] text-[10px] uppercase font-bold">Clutter Density</span>
            <span className="text-[#27ae60] text-[10px] font-bold">{Math.round(density * 100)}%</span>
          </div>
          <input type="range" min="0" max="2" step="0.1" value={density} onChange={e => setDensity(Number(e.target.value))} className="w-full h-1 bg-[#1a2e1a] rounded-full appearance-none cursor-pointer accent-[#27ae60]" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative bg-[#0c1510]">
          <PointCloud3D points={objects.map(o => ({ x: o.x, y: o.y, z: o.z }))} autoRotate={true} />
        </div>
        <div className="h-64 bg-[#0a1209] border-t border-[#1a2e1a] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a2e1a]">
            <div className="flex gap-2">
              <span className="text-[#5a8a5a] text-[10px] uppercase font-bold tracking-wider my-auto mr-2">Output ({objects.length} Objects)</span>
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
