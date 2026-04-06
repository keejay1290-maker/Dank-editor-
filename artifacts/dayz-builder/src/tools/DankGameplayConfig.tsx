/**
 * DankGameplayConfig — Full cfggameplay.json builder.
 * Covers all GeneralData flags, time acceleration, stamina/bleeding/fracture,
 * WorldsData with playerRestrictedAreaFiles and objectSpawnersArr per map.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

type MapName = "ChernarusPlus" | "Livonia" | "Sakhal";

interface GameplayConfig {
  // GeneralData flags
  disableMultiAccountMitigation: boolean;
  disableRespawnDialog: boolean;
  disableHudCrosshair: boolean;
  disablePersonalLight: boolean;
  disableBaseDamage: boolean;
  disableContainerDamage: boolean;
  disableRuinMoveableLoot: boolean;
  disableDeathPenalty: boolean;
  disableVoN: boolean;
  disableVoNForDeadPlayers: boolean;
  disableNVGIsNight: boolean;
  disableWeaponSwayWhileBreathing: boolean;
  disableAutoAim: boolean;
  disableThirdPerson: boolean;
  disableHitIndicator: boolean;
  disableNameTags: boolean;
  disableDeathMessages: boolean;
  disableKillfeed: boolean;
  spawnInitialEquipment: boolean;
  serverTimePersistent: boolean;
  staminaEnabled: boolean;
  bleedingEnabled: boolean;
  fractureEnabled: boolean;
  // Time
  serverTimeAcceleration: number;
  serverNightTimeAcceleration: number;
  // WorldsData
  worldName: MapName;
  praFiles: string[];
  spawnerFiles: string[];
}

const DEFAULTS: GameplayConfig = {
  disableMultiAccountMitigation: false, disableRespawnDialog: false, disableHudCrosshair: false,
  disablePersonalLight: false, disableBaseDamage: false, disableContainerDamage: false,
  disableRuinMoveableLoot: false, disableDeathPenalty: false, disableVoN: false,
  disableVoNForDeadPlayers: false, disableNVGIsNight: false,
  disableWeaponSwayWhileBreathing: false, disableAutoAim: false, disableThirdPerson: false,
  disableHitIndicator: false, disableNameTags: false, disableDeathMessages: false,
  disableKillfeed: false, spawnInitialEquipment: false, serverTimePersistent: false,
  staminaEnabled: true, bleedingEnabled: true, fractureEnabled: true,
  serverTimeAcceleration: 1, serverNightTimeAcceleration: 1,
  worldName: "ChernarusPlus",
  praFiles: [],
  spawnerFiles: [],
};

const MAP_OPTIONS: { value: MapName; label: string }[] = [
  { value: "ChernarusPlus", label: "Chernarus Plus" },
  { value: "Livonia",       label: "Livonia" },
  { value: "Sakhal",        label: "Sakhal" },
];

function Toggle({ label, value, onChange, desc }: {
  label: string; value: boolean; onChange: (v: boolean) => void; desc?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-2 cursor-pointer group" onClick={() => onChange(!value)}>
      <div className={`mt-0.5 w-8 h-4 rounded-full shrink-0 transition-colors ${value ? "bg-[#27ae60]" : "bg-[#1a2e1a]"} relative`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <div>
        <div className="text-[10px] text-[#b8d4b8] group-hover:text-[#27ae60] font-mono">{label}</div>
        {desc && <div className="text-[9px] text-[#3a6a3a]">{desc}</div>}
      </div>
    </div>
  );
}

export default function DankGameplayConfig() {
  const [, navigate] = useLocation();
  const [cfg, setCfg] = useState<GameplayConfig>(DEFAULTS);
  const [newPra, setNewPra] = useState("");
  const [newSpawner, setNewSpawner] = useState("");
  const [copied, setCopied] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const set = (k: keyof GameplayConfig) => (v: boolean | number | string) =>
    setCfg(prev => ({ ...prev, [k]: v }));

  function addPra() {
    const name = newPra.trim();
    if (!name) return;
    const withExt = name.endsWith(".json") ? name : name + ".json";
    if (!cfg.praFiles.includes(withExt)) {
      setCfg(prev => ({ ...prev, praFiles: [...prev.praFiles, withExt] }));
    }
    setNewPra("");
  }

  function removePra(i: number) {
    setCfg(prev => ({ ...prev, praFiles: prev.praFiles.filter((_, idx) => idx !== i) }));
  }

  function addSpawner() {
    const name = newSpawner.trim();
    if (!name) return;
    const withExt = name.endsWith(".json") ? name : name + ".json";
    if (!cfg.spawnerFiles.includes(withExt)) {
      setCfg(prev => ({ ...prev, spawnerFiles: [...prev.spawnerFiles, withExt] }));
    }
    setNewSpawner("");
  }

  function removeSpawner(i: number) {
    setCfg(prev => ({ ...prev, spawnerFiles: prev.spawnerFiles.filter((_, idx) => idx !== i) }));
  }

  const json = useMemo(() => {
    const {
      praFiles, spawnerFiles, worldName,
      serverTimeAcceleration, serverNightTimeAcceleration,
      ...flags
    } = cfg;

    const obj: Record<string, unknown> = {
      GeneralData: {
        ...flags,
        serverTimeAcceleration,
        serverNightTimeAcceleration,
      },
    };

    // WorldsData only included when there is something to put in it
    if (praFiles.length > 0 || spawnerFiles.length > 0) {
      const worldEntry: Record<string, unknown> = { name: worldName };
      if (praFiles.length > 0) worldEntry.playerRestrictedAreaFiles = praFiles;
      if (spawnerFiles.length > 0) worldEntry.objectSpawnersArr = spawnerFiles;
      obj.WorldsData = [worldEntry];
    }

    return JSON.stringify(obj, null, 2);
  }, [cfg]);

  function download() {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([json], { type: "application/json" })),
      download: "cfggameplay.json",
    });
    a.click();
  }

  function copy() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const inputCls = "bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded focus:outline-none focus:border-[#27ae60]";

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[9px] text-[#3a6a3a] font-bold tracking-widest">DANK'S DAYZ STUDIO</span>
        <span className="text-[#e74c3c] font-black text-[13px] tracking-widest">🎮 CFGGAMEPLAY BUILDER</span>
        <div className="ml-auto flex gap-2">
          <button onClick={copy} className="px-3 py-1 bg-[#0e2010] border border-[#27ae60] text-[#27ae60] text-[10px] font-bold rounded hover:bg-[#1a3a1a]">
            {copied ? "✅ COPIED" : "COPY"}
          </button>
          <button onClick={download} className="px-3 py-1 bg-[#e74c3c] text-white text-[10px] font-bold rounded hover:bg-[#c0392b]">
            ⬇ EXPORT
          </button>
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
                <p>1. Toggle flags on/off — the JSON preview updates live.</p>
                <p>2. Set time acceleration (1× = real-time, 6× = 4min day).</p>
                <p>3. Select your map, then add PRA file names for teleporters.</p>
                <p>4. Add objectSpawnersArr file names for decorative objects.</p>
                <p>5. Copy or Export cfggameplay.json and upload to your mission root.</p>
              </div>
            )}
          </div>

          {/* Time acceleration */}
          <div className="text-[9px] text-[#e74c3c] font-bold mb-2 tracking-widest">TIME ACCELERATION</div>
          <div className="mb-3 space-y-2">
            <div>
              <div className="text-[9px] text-[#5a8a5a] mb-1">Day Acceleration ×{cfg.serverTimeAcceleration}</div>
              <input type="range" min={1} max={24} step={1} value={cfg.serverTimeAcceleration}
                onChange={e => set("serverTimeAcceleration")(Number(e.target.value))}
                className="w-full accent-[#e74c3c]" />
            </div>
            <div>
              <div className="text-[9px] text-[#5a8a5a] mb-1">Night Acceleration ×{cfg.serverNightTimeAcceleration}</div>
              <input type="range" min={1} max={64} step={1} value={cfg.serverNightTimeAcceleration}
                onChange={e => set("serverNightTimeAcceleration")(Number(e.target.value))}
                className="w-full accent-[#e74c3c]" />
            </div>
          </div>

          <div className="text-[9px] text-[#e74c3c] font-bold mb-3 tracking-widest">GENERAL</div>
          <Toggle label="disableMultiAccountMitigation" value={cfg.disableMultiAccountMitigation} onChange={set("disableMultiAccountMitigation") as (v: boolean) => void} desc="Allow multiple accounts from same IP" />
          <Toggle label="disableRespawnDialog" value={cfg.disableRespawnDialog} onChange={set("disableRespawnDialog") as (v: boolean) => void} desc="Skip respawn selection screen" />
          <Toggle label="disableHudCrosshair" value={cfg.disableHudCrosshair} onChange={set("disableHudCrosshair") as (v: boolean) => void} desc="Remove crosshair from HUD" />
          <Toggle label="disablePersonalLight" value={cfg.disablePersonalLight} onChange={set("disablePersonalLight") as (v: boolean) => void} desc="Remove ambient personal light" />
          <Toggle label="disableBaseDamage" value={cfg.disableBaseDamage} onChange={set("disableBaseDamage") as (v: boolean) => void} desc="Base building takes no damage" />
          <Toggle label="disableContainerDamage" value={cfg.disableContainerDamage} onChange={set("disableContainerDamage") as (v: boolean) => void} desc="Containers take no damage" />
          <Toggle label="disableRuinMoveableLoot" value={cfg.disableRuinMoveableLoot} onChange={set("disableRuinMoveableLoot") as (v: boolean) => void} />

          <div className="text-[9px] text-[#e74c3c] font-bold mb-3 mt-4 tracking-widest">CHARACTER</div>
          <Toggle label="disableDeathPenalty" value={cfg.disableDeathPenalty} onChange={set("disableDeathPenalty") as (v: boolean) => void} />
          <Toggle label="disableVoN" value={cfg.disableVoN} onChange={set("disableVoN") as (v: boolean) => void} desc="Disable voice over network" />
          <Toggle label="disableVoNForDeadPlayers" value={cfg.disableVoNForDeadPlayers} onChange={set("disableVoNForDeadPlayers") as (v: boolean) => void} />
          <Toggle label="disableNVGIsNight" value={cfg.disableNVGIsNight} onChange={set("disableNVGIsNight") as (v: boolean) => void} />

          <div className="text-[9px] text-[#e74c3c] font-bold mb-3 mt-4 tracking-widest">WORLD</div>
          <Toggle label="disableWeaponSwayWhileBreathing" value={cfg.disableWeaponSwayWhileBreathing} onChange={set("disableWeaponSwayWhileBreathing") as (v: boolean) => void} />
          <Toggle label="disableAutoAim" value={cfg.disableAutoAim} onChange={set("disableAutoAim") as (v: boolean) => void} />
          <Toggle label="disableThirdPerson" value={cfg.disableThirdPerson} onChange={set("disableThirdPerson") as (v: boolean) => void} desc="Force first-person only" />
          <Toggle label="disableHitIndicator" value={cfg.disableHitIndicator} onChange={set("disableHitIndicator") as (v: boolean) => void} />
          <Toggle label="disableNameTags" value={cfg.disableNameTags} onChange={set("disableNameTags") as (v: boolean) => void} />
          <Toggle label="disableDeathMessages" value={cfg.disableDeathMessages} onChange={set("disableDeathMessages") as (v: boolean) => void} />
          <Toggle label="disableKillfeed" value={cfg.disableKillfeed} onChange={set("disableKillfeed") as (v: boolean) => void} />

          <div className="text-[9px] text-[#e74c3c] font-bold mb-3 mt-4 tracking-widest">FEATURES</div>
          <Toggle label="staminaEnabled" value={cfg.staminaEnabled} onChange={set("staminaEnabled") as (v: boolean) => void} />
          <Toggle label="bleedingEnabled" value={cfg.bleedingEnabled} onChange={set("bleedingEnabled") as (v: boolean) => void} />
          <Toggle label="fractureEnabled" value={cfg.fractureEnabled} onChange={set("fractureEnabled") as (v: boolean) => void} />
          <Toggle label="spawnInitialEquipment" value={cfg.spawnInitialEquipment} onChange={set("spawnInitialEquipment") as (v: boolean) => void} desc="Spawn with starter gear" />
          <Toggle label="serverTimePersistent" value={cfg.serverTimePersistent} onChange={set("serverTimePersistent") as (v: boolean) => void} desc="Server time persists across restarts" />

          {/* WorldsData */}
          <div className="text-[9px] text-[#e74c3c] font-bold mb-2 mt-4 tracking-widest">WORLDS DATA</div>
          <div className="text-[8px] text-[#3a6a3a] mb-2">
            Required for teleporters and object spawners. Adds a WorldsData section to the JSON.
          </div>

          {/* Map selector */}
          <div className="mb-3">
            <div className="text-[9px] text-[#5a8a5a] mb-1">Map</div>
            <select
              value={cfg.worldName}
              onChange={e => set("worldName")(e.target.value)}
              className={`w-full ${inputCls}`}>
              {MAP_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* PRA files */}
          <div className="mb-3">
            <div className="text-[9px] text-[#5a8a5a] mb-1">playerRestrictedAreaFiles (teleporters)</div>
            <div className="flex gap-1 mb-1">
              <input value={newPra} onChange={e => setNewPra(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addPra()}
                placeholder="RestrictedAreaPadA.json"
                className={`flex-1 ${inputCls}`} />
              <button onClick={addPra}
                className="px-2 py-1 text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60] rounded hover:bg-[#1a3a1a]">+</button>
            </div>
            {cfg.praFiles.length === 0 && <div className="text-[8px] text-[#3a6a3a] italic">No PRA files added</div>}
            {cfg.praFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1 mb-0.5">
                <span className="flex-1 text-[9px] text-[#27ae60] font-mono truncate">{f}</span>
                <button onClick={() => removePra(i)} className="text-[#c0392b] text-[8px] px-1">✕</button>
              </div>
            ))}
          </div>

          {/* objectSpawnersArr */}
          <div>
            <div className="text-[9px] text-[#5a8a5a] mb-1">objectSpawnersArr (decorative objects)</div>
            <div className="flex gap-1 mb-1">
              <input value={newSpawner} onChange={e => setNewSpawner(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSpawner()}
                placeholder="env/myObjects.json"
                className={`flex-1 ${inputCls}`} />
              <button onClick={addSpawner}
                className="px-2 py-1 text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60] rounded hover:bg-[#1a3a1a]">+</button>
            </div>
            {cfg.spawnerFiles.length === 0 && <div className="text-[8px] text-[#3a6a3a] italic">No spawner files added</div>}
            {cfg.spawnerFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1 mb-0.5">
                <span className="flex-1 text-[9px] text-[#27ae60] font-mono truncate">{f}</span>
                <button onClick={() => removeSpawner(i)} className="text-[#c0392b] text-[8px] px-1">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">
            PREVIEW — cfggameplay.json
          </div>
          <textarea readOnly value={json}
            className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[11px] font-mono p-4 resize-none border-0 outline-none leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
