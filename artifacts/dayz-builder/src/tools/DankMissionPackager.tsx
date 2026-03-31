/**
 * DankMissionPackager — Mission file checklist and packager.
 * Helps server admins verify they have all required mission files,
 * generates a manifest, and produces a ZIP-ready file list with
 * correct folder structure for Nitrado / PC deployment.
 */
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MissionFile {
  id: string;
  path: string;
  required: boolean;
  present: boolean;
  notes: string;
}

interface PackageConfig {
  missionName: string;
  map: string;
  version: string;
  author: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const REQUIRED_FILES: Omit<MissionFile, "present">[] = [
  { id: "init",        path: "init.c",                                    required: true,  notes: "Mission init script" },
  { id: "types",       path: "db/types.xml",                              required: true,  notes: "Loot economy — item counts, lifetimes, usage" },
  { id: "events",      path: "db/events.xml",                             required: true,  notes: "Dynamic events (heli crashes, infected camps)" },
  { id: "messages",    path: "db/messages.xml",                           required: true,  notes: "Server broadcast messages" },
  { id: "globals",     path: "db/globals.xml",                            required: true,  notes: "Global server variables (zombie count, cleanup)" },
  { id: "economy",     path: "db/economy.xml",                            required: true,  notes: "Economy core settings" },
  { id: "mapgrouppos", path: "db/mapgrouppos.xml",                        required: true,  notes: "Loot group positions on map" },
  { id: "mapgroupproto",path: "db/mapgroupproto.xml",                     required: true,  notes: "Loot group prototypes" },
  { id: "cfgenv",      path: "cfgenvironment.xml",                        required: true,  notes: "Environment / ambient life" },
  { id: "cfggameplay", path: "cfggameplay.json",                          required: false, notes: "Gameplay flags (crosshair, stamina, etc.)" },
  { id: "cfgweather",  path: "cfgweather.xml",                            required: false, notes: "Weather configuration" },
  { id: "spawns",      path: "cfgplayerspawnpoints.xml",                  required: false, notes: "Player spawn positions" },
  { id: "pra",         path: "playerRestrictedAreaFiles/",                required: false, notes: "Teleport / restricted area PRA JSONs" },
  { id: "spawners",    path: "env/",                                      required: false, notes: "Object spawner JSONs (decorations, vehicles)" },
  { id: "storage",     path: "storage_1/",                                required: false, notes: "Persistent storage (base building)" },
];

const MAPS = ["ChernarusPlus", "Livonia", "Sakhal", "Namalsk", "Deer Isle", "Takistan", "Other"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildManifest(files: MissionFile[], cfg: PackageConfig): string {
  const present = files.filter(f => f.present);
  const missing = files.filter(f => f.required && !f.present);
  const optional = files.filter(f => !f.required && !f.present);

  const lines = [
    `# DankDayz Mission Package Manifest`,
    `# Generated: ${new Date().toISOString()}`,
    ``,
    `[MISSION]`,
    `Name    = ${cfg.missionName}`,
    `Map     = ${cfg.map}`,
    `Version = ${cfg.version}`,
    `Author  = ${cfg.author}`,
    ...(cfg.description ? [`Desc    = ${cfg.description}`] : []),
    ``,
    `[FILES PRESENT — ${present.length}]`,
    ...present.map(f => `  ✓  ${f.path.padEnd(45)} ${f.notes}`),
    ``,
    ...(missing.length ? [
      `[MISSING REQUIRED — ${missing.length}]`,
      ...missing.map(f => `  ✗  ${f.path.padEnd(45)} ${f.notes}`),
      ``,
    ] : []),
    ...(optional.length ? [
      `[OPTIONAL NOT INCLUDED — ${optional.length}]`,
      ...optional.map(f => `  -  ${f.path.padEnd(45)} ${f.notes}`),
      ``,
    ] : []),
    `[NITRADO UPLOAD PATH]`,
    `  /games/<id>/noftp/dayzxb_<map>/mpmissions/${cfg.missionName}.${cfg.map}/`,
    ``,
    `[STATUS]`,
    missing.length === 0
      ? `  ✅ All required files present — ready to deploy`
      : `  ⚠  ${missing.length} required file(s) missing — fix before deploying`,
  ];
  return lines.join("\n");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DankMissionPackager() {
  const [cfg, setCfg] = useState<PackageConfig>({
    missionName: "dayzOffline",
    map: "ChernarusPlus",
    version: "1.0.0",
    author: "",
    description: "",
  });
  const [files, setFiles] = useState<MissionFile[]>(
    REQUIRED_FILES.map(f => ({ ...f, present: f.required }))
  );
  const [copied, setCopied] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const manifest = buildManifest(files, cfg);
  const missingRequired = files.filter(f => f.required && !f.present).length;
  const presentCount = files.filter(f => f.present).length;

  function toggleFile(id: string) {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, present: !f.present } : f));
  }

  function setAll(present: boolean) {
    setFiles(prev => prev.map(f => ({ ...f, present })));
  }

  function copy() {
    navigator.clipboard.writeText(manifest).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function download() {
    const blob = new Blob([manifest], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${cfg.missionName}_manifest.txt`;
    a.click();
  }

  const inputCls = "w-full bg-[#0a1209] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#27ae60]";
  const labelCls = "text-[10px] text-[#5a8a5a] font-bold uppercase tracking-wider mb-1 block";

  return (
    <div className="min-h-screen bg-[#080f09] text-[#b8d4b8] font-mono">
      <div className="border-b border-[#1a2e1a] bg-[#0c1510] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px]">← HOME</a>
        <span className="text-[#1a2e1a]">/</span>
        <span className="text-[11px] font-black text-[#27ae60]">📦 DANKMISSION PACKAGER</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UNIQUE TOOL</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden">
            <button onClick={() => setShowHow(h => !h)}
              className="w-full flex items-center justify-between px-4 py-2 bg-[#0c1510] text-[11px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-4 py-3 text-[10px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Enter your mission name and map.</p>
                <p>2. Tick each file you have prepared.</p>
                <p>3. The manifest shows what's ready and what's missing.</p>
                <p>4. Copy or download the manifest to keep with your mission folder.</p>
                <p>5. The Nitrado upload path is shown at the bottom of the manifest.</p>
              </div>
            )}
          </div>

          {/* Mission info */}
          <div className="bg-[#0a1209] border border-[#1a2e1a] rounded p-4 space-y-3">
            <div className="text-[10px] font-black text-[#27ae60] tracking-widest mb-2">MISSION INFO</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Mission Name</label>
                <input className={inputCls} value={cfg.missionName}
                  onChange={e => setCfg(p => ({ ...p, missionName: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Map</label>
                <select className={inputCls} value={cfg.map}
                  onChange={e => setCfg(p => ({ ...p, map: e.target.value }))}>
                  {MAPS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Version</label>
                <input className={inputCls} value={cfg.version}
                  onChange={e => setCfg(p => ({ ...p, version: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Author</label>
                <input className={inputCls} value={cfg.author} placeholder="Your name / clan"
                  onChange={e => setCfg(p => ({ ...p, author: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input className={inputCls} value={cfg.description} placeholder="Optional short description"
                onChange={e => setCfg(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          {/* File checklist */}
          <div className="bg-[#0a1209] border border-[#1a2e1a] rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-black text-[#27ae60] tracking-widest">FILE CHECKLIST</div>
              <div className="flex gap-2">
                <button onClick={() => setAll(true)} className="text-[9px] text-[#27ae60] hover:underline">ALL ✓</button>
                <button onClick={() => setAll(false)} className="text-[9px] text-[#5a8a5a] hover:underline">NONE</button>
              </div>
            </div>
            <div className="space-y-1.5">
              {files.map(f => (
                <label key={f.id} className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox" checked={f.present} onChange={() => toggleFile(f.id)}
                    className="mt-0.5 accent-[#27ae60]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#b8d4b8]">{f.path}</span>
                      {f.required && (
                        <span className="text-[8px] text-[#c0392b] font-black">REQ</span>
                      )}
                    </div>
                    <div className="text-[9px] text-[#3a6a3a]">{f.notes}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className={`p-3 rounded border text-[11px] font-black ${
            missingRequired === 0
              ? "border-[#27ae60] bg-[#0e2010] text-[#27ae60]"
              : "border-[#c0392b] bg-[#1a0a0a] text-[#c0392b]"
          }`}>
            {missingRequired === 0
              ? `✅ ${presentCount} files present — ready to deploy`
              : `⚠ ${missingRequired} required file(s) missing`}
          </div>
        </div>

        {/* Right: manifest */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-[#27ae60] tracking-widest">MANIFEST PREVIEW</div>
          <pre className="bg-[#050c06] border border-[#1a2e1a] rounded p-4 text-[10px] text-[#b8d4b8] overflow-auto whitespace-pre leading-relaxed max-h-[600px]">
            {manifest}
          </pre>
          <div className="flex gap-2">
            <button onClick={copy}
              className="flex-1 py-2 rounded text-[11px] font-black border border-[#27ae60] text-[#27ae60] hover:bg-[#0e2010] transition-colors">
              {copied ? "✅ COPIED" : "📋 COPY MANIFEST"}
            </button>
            <button onClick={download}
              className="flex-1 py-2 rounded text-[11px] font-black border border-[#5a8a5a] text-[#5a8a5a] hover:bg-[#0a1209] transition-colors">
              ⬇ DOWNLOAD .TXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
