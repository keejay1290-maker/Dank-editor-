import { useState, useMemo } from "react";
import { useLocation } from "wouter";

interface GlobalsConfig {
  ZombieMaxCount: number;
  ZombieInitCount: number;
  AnimalMaxCount: number;
  AnimalInitCount: number;
  ItemCount: number;
  FoodDecay: number;
  CleanupLifetimeDeadAnimal: number;
  CleanupLifetimeDeadPlayer: number;
  CleanupLifetimeDefault: number;
  CleanupLifetimeLimit: number;
  CleanupLifetimeRuined: number;
  TimeLogin: number;
  TimeLogout: number;
  TimePenalty: number;
  RespawnAttempt: number;
  RespawnLimit: number;
  RespawnCooldown: number;
  ServerMaxHealth: number;
  ServerMaxBlood: number;
  BleedingChance: number;
  LootProxyPlacement: number;
  NoVehicleDistance: number;
  DuplicatePlayerSpawn: number;
  FlagRefreshFrequency: number;
  FlagRefreshMaxDuration: number;
  BaseBuildingDestructionEnabled: number;
  DisableBaseDamage: number;
  DisableContainerDamage: number;
  DisableRespawnDialog: number;
}

const DEFAULTS: GlobalsConfig = {
  ZombieMaxCount: 1000, ZombieInitCount: 200, AnimalMaxCount: 200, AnimalInitCount: 50,
  ItemCount: 4000, FoodDecay: 1, CleanupLifetimeDeadAnimal: 1200, CleanupLifetimeDeadPlayer: 3600,
  CleanupLifetimeDefault: 45, CleanupLifetimeLimit: 3600, CleanupLifetimeRuined: 330,
  TimeLogin: 15, TimeLogout: 15, TimePenalty: 20, RespawnAttempt: 5, RespawnLimit: 20, RespawnCooldown: 10,
  ServerMaxHealth: 100, ServerMaxBlood: 5000, BleedingChance: 0.1, LootProxyPlacement: 1,
  NoVehicleDistance: 30, DuplicatePlayerSpawn: 0, FlagRefreshFrequency: 432000, FlagRefreshMaxDuration: 3456000,
  BaseBuildingDestructionEnabled: 1, DisableBaseDamage: 0, DisableContainerDamage: 0, DisableRespawnDialog: 0,
};

const PVE_PRESET: Partial<GlobalsConfig> = { ZombieMaxCount: 2000, ZombieInitCount: 500, BleedingChance: 0.05, DisableBaseDamage: 1, DisableContainerDamage: 1 };
const PVP_PRESET: Partial<GlobalsConfig> = { ZombieMaxCount: 500, ZombieInitCount: 100, BleedingChance: 0.2, BaseBuildingDestructionEnabled: 1 };
const HARDCORE_PRESET: Partial<GlobalsConfig> = { ZombieMaxCount: 3000, ZombieInitCount: 800, BleedingChance: 0.3, FoodDecay: 2, TimeLogout: 30, TimePenalty: 60 };

function NumField({ label, value, onChange, min, max, step=1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[#5a8a5a] text-[9px] w-52 shrink-0">{label}</span>
      <input type="number" value={value} min={min} max={max} step={step} onChange={e => onChange(Number(e.target.value))} className="w-24 bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-0.5 rounded text-right" />
    </div>
  );
}

export default function DankGlobalsGenerator() {
  const [, navigate] = useLocation();
  const [cfg, setCfg] = useState<GlobalsConfig>(DEFAULTS);
  const [showHow, setShowHow] = useState(false);

  const set = (k: keyof GlobalsConfig) => (v: number) => setCfg(prev => ({ ...prev, [k]: v }));
  const apply = (patch: Partial<GlobalsConfig>) => setCfg(prev => ({ ...prev, ...patch }));

  const xml = useMemo(() => {
    const entries = Object.entries(cfg).map(([k, v]) => `  <var name="${k}" type="0" value="${v}"/>`).join("\n");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<variables>\n${entries}\n</variables>`;
  }, [cfg]);

  function download() {
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([xml], { type: "text/xml" })), download: "globals.xml" });
    a.click();
  }

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#9b59b6] font-black text-[13px] tracking-widest">⚙ DANKGLOBALS GENERATOR</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => apply(PVE_PRESET)} className="px-2 py-1 text-[10px] font-bold rounded border border-[#1a2e1a] text-[#27ae60] hover:border-[#27ae60]">PVE</button>
          <button onClick={() => apply(PVP_PRESET)} className="px-2 py-1 text-[10px] font-bold rounded border border-[#1a2e1a] text-[#e74c3c] hover:border-[#e74c3c]">PVP</button>
          <button onClick={() => apply(HARDCORE_PRESET)} className="px-2 py-1 text-[10px] font-bold rounded border border-[#1a2e1a] text-[#e67e22] hover:border-[#e67e22]">HARDCORE</button>
          <button onClick={() => setCfg(DEFAULTS)} className="px-2 py-1 text-[10px] font-bold rounded border border-[#1a2e1a] text-[#5a8a5a] hover:border-[#5a8a5a]">RESET</button>
          <button onClick={download} className="px-3 py-1 bg-[#9b59b6] text-white text-[10px] font-bold rounded hover:bg-[#8e44ad]">⬇ EXPORT globals.xml</button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-80 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-4 overflow-y-auto">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden mb-4">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0c1510] text-[10px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-3 py-2 text-[9px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Use the PVE / PVP / HARDCORE presets or adjust values manually.</p>
                <p>2. ZombieMaxCount controls the server-wide zombie cap.</p>
                <p>3. Cleanup lifetimes are in seconds (3600 = 1 hour).</p>
                <p>4. Export globals.xml and upload to your mission's db/ folder.</p>
                <p>5. Restart the server for changes to take effect.</p>
              </div>
            )}
          </div>
          <div className="text-[9px] text-[#9b59b6] font-bold mb-2 tracking-widest">POPULATION</div>
          <NumField label="ZombieMaxCount" value={cfg.ZombieMaxCount} onChange={set("ZombieMaxCount")} min={0} />
          <NumField label="ZombieInitCount" value={cfg.ZombieInitCount} onChange={set("ZombieInitCount")} min={0} />
          <NumField label="AnimalMaxCount" value={cfg.AnimalMaxCount} onChange={set("AnimalMaxCount")} min={0} />
          <NumField label="AnimalInitCount" value={cfg.AnimalInitCount} onChange={set("AnimalInitCount")} min={0} />
          <NumField label="ItemCount" value={cfg.ItemCount} onChange={set("ItemCount")} min={0} />
          <div className="text-[9px] text-[#9b59b6] font-bold mb-2 mt-4 tracking-widest">CLEANUP LIFETIMES (seconds)</div>
          <NumField label="CleanupLifetimeDeadAnimal" value={cfg.CleanupLifetimeDeadAnimal} onChange={set("CleanupLifetimeDeadAnimal")} min={0} />
          <NumField label="CleanupLifetimeDeadPlayer" value={cfg.CleanupLifetimeDeadPlayer} onChange={set("CleanupLifetimeDeadPlayer")} min={0} />
          <NumField label="CleanupLifetimeDefault" value={cfg.CleanupLifetimeDefault} onChange={set("CleanupLifetimeDefault")} min={0} />
          <NumField label="CleanupLifetimeLimit" value={cfg.CleanupLifetimeLimit} onChange={set("CleanupLifetimeLimit")} min={0} />
          <NumField label="CleanupLifetimeRuined" value={cfg.CleanupLifetimeRuined} onChange={set("CleanupLifetimeRuined")} min={0} />
          <div className="text-[9px] text-[#9b59b6] font-bold mb-2 mt-4 tracking-widest">PLAYER TIMERS (seconds)</div>
          <NumField label="TimeLogin" value={cfg.TimeLogin} onChange={set("TimeLogin")} min={0} />
          <NumField label="TimeLogout" value={cfg.TimeLogout} onChange={set("TimeLogout")} min={0} />
          <NumField label="TimePenalty" value={cfg.TimePenalty} onChange={set("TimePenalty")} min={0} />
          <NumField label="RespawnAttempt" value={cfg.RespawnAttempt} onChange={set("RespawnAttempt")} min={0} />
          <NumField label="RespawnLimit" value={cfg.RespawnLimit} onChange={set("RespawnLimit")} min={0} />
          <NumField label="RespawnCooldown" value={cfg.RespawnCooldown} onChange={set("RespawnCooldown")} min={0} />
          <div className="text-[9px] text-[#9b59b6] font-bold mb-2 mt-4 tracking-widest">GAMEPLAY</div>
          <NumField label="FoodDecay" value={cfg.FoodDecay} onChange={set("FoodDecay")} min={0} step={0.1} />
          <NumField label="BleedingChance" value={cfg.BleedingChance} onChange={set("BleedingChance")} min={0} max={1} step={0.01} />
          <NumField label="ServerMaxHealth" value={cfg.ServerMaxHealth} onChange={set("ServerMaxHealth")} min={0} />
          <NumField label="ServerMaxBlood" value={cfg.ServerMaxBlood} onChange={set("ServerMaxBlood")} min={0} />
          <NumField label="NoVehicleDistance" value={cfg.NoVehicleDistance} onChange={set("NoVehicleDistance")} min={0} />
          <NumField label="BaseBuildingDestructionEnabled (0/1)" value={cfg.BaseBuildingDestructionEnabled} onChange={set("BaseBuildingDestructionEnabled")} min={0} max={1} />
          <NumField label="DisableBaseDamage (0/1)" value={cfg.DisableBaseDamage} onChange={set("DisableBaseDamage")} min={0} max={1} />
          <NumField label="DisableContainerDamage (0/1)" value={cfg.DisableContainerDamage} onChange={set("DisableContainerDamage")} min={0} max={1} />
          <NumField label="DisableRespawnDialog (0/1)" value={cfg.DisableRespawnDialog} onChange={set("DisableRespawnDialog")} min={0} max={1} />
          <NumField label="FlagRefreshFrequency" value={cfg.FlagRefreshFrequency} onChange={set("FlagRefreshFrequency")} min={0} />
          <NumField label="FlagRefreshMaxDuration" value={cfg.FlagRefreshMaxDuration} onChange={set("FlagRefreshMaxDuration")} min={0} />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">PREVIEW — globals.xml</div>
          <textarea readOnly value={xml} className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[11px] font-mono p-4 resize-none border-0 outline-none leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
