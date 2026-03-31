import { useState, useMemo } from "react";
import { useLocation } from "wouter";

interface ToolCard {
  emoji: string;
  name: string;
  desc: string;
  path: string;
  accent: string;
  badge?: string;
  tags: string[];
}

const SECTIONS: { title: string; icon: string; tools: ToolCard[] }[] = [
  {
    title: "Dank's Dayz Studio — Makers",
    icon: "🏗",
    tools: [
      { emoji: "🏗", name: "DankDayz Builder",    desc: "Shape generator, text maker, completed builds library, weapon builder",  path: "/editor",    accent: "#2ecc71", badge: "CORE",  tags: ["builder","shape","3d","objects","spawn"] },
      { emoji: "🏚", name: "DankBunker Maker",     desc: "Underground bunker layouts with rooms, corridors and loot",              path: "/editor",    accent: "#5dade2",              tags: ["bunker","underground","rooms","loot"] },
      { emoji: "🌀", name: "DankMaze Maker",        desc: "Procedural maze structures for PvP arenas and events",                  path: "/editor",    accent: "#9b59b6",              tags: ["maze","pvp","arena","event"] },
      { emoji: "🏁", name: "DankRace Maker",        desc: "Race track designer with hazards, checkpoints and 3D preview",          path: "/editor",    accent: "#e74c3c",              tags: ["race","track","event","checkpoint"] },
      { emoji: "🎲", name: "DankRandom Maker",      desc: "Seeded random structure generator with enterable buildings",            path: "/editor",    accent: "#1abc9c",              tags: ["random","structure","seed","building"] },
      { emoji: "🚧", name: "DankConZone Maker",     desc: "Construction zone generator with cranes, tools and loot",              path: "/editor",    accent: "#f39c12",              tags: ["construction","zone","crane","loot"] },
      { emoji: "⚡", name: "DankTeleport Maker",    desc: "Creative teleportation structures — Sci-Fi Pad, Transporter, Stargate", path: "/editor",    accent: "#8e44ad", badge: "NEW", tags: ["teleport","pra","console","pad","stargate"] },
    ],
  },
  {
    title: "Server Tools",
    icon: "⚙️",
    tools: [
      { emoji: "📋", name: "DankTypes Editor",      desc: "Edit types.xml — nominal, lifetime, usage tags, bulk operations",      path: "/types",     accent: "#27ae60", badge: "NEW", tags: ["types","xml","loot","nominal","lifetime"] },
      { emoji: "🎒", name: "DankLoadout Builder",   desc: "Build player loadouts with slots, attachments and spawn weights",      path: "/loadout",   accent: "#e67e22", badge: "NEW", tags: ["loadout","spawn","gear","clothing","weapons"] },
      { emoji: "🌦", name: "DankWeather Generator", desc: "Generate cfgweather.xml with fog, rain, wind and storm settings",      path: "/weather",   accent: "#3498db", badge: "NEW", tags: ["weather","fog","rain","wind","storm","xml"] },
      { emoji: "⚙️", name: "DankGlobals Generator", desc: "Configure globals.xml — zombie counts, cleanup, time acceleration",    path: "/globals",   accent: "#95a5a6", badge: "NEW", tags: ["globals","zombie","cleanup","xml"] },
      { emoji: "🎮", name: "DankGameplay Config",   desc: "Generate cfggameplay.json — crosshair, stamina, base building, PRA",  path: "/gameplay",  accent: "#e74c3c", badge: "NEW", tags: ["gameplay","crosshair","stamina","json","pra"] },
    ],
  },
  {
    title: "Map Tools",
    icon: "🗺",
    tools: [
      { emoji: "📍", name: "DankCoords / Map Grid", desc: "Click Chernarus, Livonia or Sakhal maps — markers, distances, export", path: "/coords",    accent: "#1abc9c", badge: "NEW", tags: ["coords","map","grid","chernarus","livonia","sakhal","distance"] },
      { emoji: "🚀", name: "DankSpawn Maker",       desc: "Place player spawn points with groups, weights and map selector",      path: "/spawns",    accent: "#9b59b6", badge: "NEW", tags: ["spawn","player","xml","group","weight"] },
    ],
  },
  {
    title: "File Utilities",
    icon: "🔧",
    tools: [
      { emoji: "↔️", name: "DankRelocator",         desc: "Offset, rotate, scale and mirror objects — init.c and JSON formats",  path: "/relocator", accent: "#f39c12", badge: "NEW", tags: ["relocator","offset","rotate","mirror","json","initc"] },
      { emoji: "✂️", name: "DankSplitter",           desc: "Split large object JSONs into chunks, or merge multiple files",       path: "/splitter",  accent: "#e74c3c", badge: "NEW", tags: ["splitter","chunk","merge","initc","large"] },
      { emoji: "✅", name: "DankValidator",          desc: "Validate init.c, JSON spawners and XML files with line-level errors",  path: "/validator", accent: "#27ae60", badge: "NEW", tags: ["validator","validate","xml","json","initc","error"] },
    ],
  },
  {
    title: "Advanced Tools",
    icon: "🧬",
    tools: [
      { emoji: "🧬", name: "DankServer DNA",        desc: "Generate a shareable ASCII identity card for your server",            path: "/dna",         accent: "#27ae60", badge: "NEW", tags: ["server","dna","card","share","identity"] },
      { emoji: "📦", name: "DankMission Packager",  desc: "Mission file checklist with Nitrado upload paths and manifest",       path: "/packager",    accent: "#3498db", badge: "NEW", tags: ["mission","packager","nitrado","checklist","manifest"] },
      { emoji: "⚖",  name: "DankLoot Balancer",     desc: "Paste types.xml, adjust per-category multipliers, export rebalanced", path: "/lootbalancer",accent: "#e67e22", badge: "NEW", tags: ["loot","balancer","types","xml","multiplier","economy"] },
      { emoji: "📅", name: "DankTimeline",           desc: "Plan wipes, events and maintenance — export a Discord schedule",     path: "/timeline",    accent: "#9b59b6", badge: "NEW", tags: ["timeline","wipe","event","schedule","discord"] },
      { emoji: "🔍", name: "DankClassname Search",  desc: "Offline classname browser — weapons, clothing, buildings, copy",      path: "/classnames",  accent: "#1abc9c", badge: "NEW", tags: ["classname","search","weapons","clothing","buildings","copy"] },
      { emoji: "🏰", name: "DankBase Planner",       desc: "Grid-based base layout designer with material cost calculator",      path: "/baseplanner", accent: "#e74c3c", badge: "NEW", tags: ["base","planner","grid","layout","materials","cost"] },
      { emoji: "🖥",  name: "DankNitrado Helper",    desc: "Step-by-step Nitrado console server setup checklist",               path: "/nitrado",     accent: "#f39c12", badge: "NEW", tags: ["nitrado","setup","console","checklist","guide"] },
    ],
  },
];

const TOTAL_TOOLS = SECTIONS.reduce((n, s) => n + s.tools.length, 0);

export default function HomePage() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.map(section => ({
      ...section,
      tools: section.tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
      ),
    })).filter(s => s.tools.length > 0);
  }, [query]);

  const matchCount = filteredSections.reduce((n, s) => n + s.tools.length, 0);

  return (
    <div className="min-h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-y-auto">
      {/* Header */}
      <div className="border-b border-[#1a2e1a] bg-[#0c1510]">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-2xl font-black tracking-widest">
                <span style={{ color: "#d4a017" }}>DANK'S</span>
                <span style={{ color: "#c0392b" }}> DAYZ</span>
                <span className="text-[#b8d4b8]"> STUDIO</span>
                <span className="ml-2 text-[10px] border border-[#8b1a1a] text-[#c0392b] px-1.5 py-0.5 rounded align-middle">v4</span>
              </div>
              <div className="text-[11px] text-[#5a8a5a] mt-1">
                {TOTAL_TOOLS} tools · All run offline · Console-friendly · No account required
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">✅ OFFLINE READY</span>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-[#1a0a0a] border border-[#c0392b] text-[#c0392b]">🎮 CONSOLE SAFE</span>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-[#0a1220] border border-[#3498db] text-[#3498db]">🔗 URL SHARING</span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Total Tools",  value: String(TOTAL_TOOLS), color: "#27ae60" },
              { label: "Makers",       value: "7",  color: "#9b59b6" },
              { label: "Server Tools", value: "12", color: "#3498db" },
              { label: "Unique Tools", value: "7",  color: "#f39c12" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#080f09] border border-[#1a2e1a] rounded px-3 py-2 flex items-center gap-2">
                <span className="text-[18px] font-black" style={{ color }}>{value}</span>
                <span className="text-[9px] text-[#5a8a5a] uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a6a3a] text-[13px] pointer-events-none">⌕</span>
            <input
              type="text"
              placeholder="Search tools by name, feature or tag… (e.g. 'teleport', 'xml', 'nitrado', 'loot')"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] pl-8 pr-8 py-2 rounded focus:outline-none focus:border-[#27ae60] transition-colors"
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a8a5a] hover:text-[#27ae60] text-[11px]">
                ✕
              </button>
            )}
          </div>
          {query && (
            <div className="mt-1 text-[9px] text-[#5a8a5a]">
              {matchCount} tool{matchCount !== 1 ? "s" : ""} match &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Tool sections */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {filteredSections.length === 0 && (
          <div className="text-center py-16 text-[#3a6a3a] text-[13px]">
            No tools match &quot;{query}&quot; — try a different search term
          </div>
        )}

        {filteredSections.map(section => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{section.icon}</span>
              <h2 className="text-[13px] font-black tracking-widest text-[#b8d4b8]">
                {section.title.toUpperCase()}
              </h2>
              <span className="text-[9px] text-[#3a6a3a]">({section.tools.length})</span>
              <div className="flex-1 h-px bg-[#1a2e1a] ml-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {section.tools.map(tool => (
                <button
                  key={tool.name}
                  onClick={() => navigate(tool.path)}
                  className="text-left p-4 rounded border border-[#1a2e1a] bg-[#0a1209] hover:bg-[#0e1a0e] transition-all group relative overflow-hidden"
                  onMouseEnter={e => (e.currentTarget.style.borderColor = tool.accent + "66")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "")}
                >
                  {tool.badge && (
                    <span
                      className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black"
                      style={{ background: tool.accent + "22", color: tool.accent, border: `1px solid ${tool.accent}44` }}>
                      {tool.badge}
                    </span>
                  )}
                  <div className="text-2xl mb-2">{tool.emoji}</div>
                  <div className="text-[12px] font-black text-[#b8d4b8] mb-1 pr-8">{tool.name}</div>
                  <div className="text-[10px] text-[#5a8a5a] leading-relaxed">{tool.desc}</div>
                  <div className="mt-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {tool.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[7px] px-1 rounded bg-[#0c1510] text-[#3a6a3a] border border-[#1a2e1a]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div
                    className="mt-1 text-[10px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: tool.accent }}>
                    OPEN →
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#1a2e1a] mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-[10px] text-[#3a6a3a] flex-wrap gap-2">
          <span>Dank's Dayz Studio · {TOTAL_TOOLS} tools · All run locally · No data sent to any server</span>
          <span>Built for DayZ console &amp; PC players 🎮</span>
        </div>
      </div>
    </div>
  );
}
