/**
 * DankLootBalancer — Visual loot economy balancer.
 * Paste types.xml content, adjust category multipliers with sliders,
 * and export a rebalanced types.xml. Shows before/after nominal counts
 * per category with a bar chart.
 */
import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LootItem {
  name: string;
  nominal: number;
  newNominal: number;
  category: string;
  lifetime: number;
  newLifetime: number;
}

interface CategoryMult {
  mult: number;
  lifetimeMult: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Weapons":    ["gun", "rifle", "pistol", "shotgun", "smg", "sniper", "ak", "m4", "ump", "mp5", "fal", "svd", "mosin", "winchester", "blaze", "cr527", "kolt", "deagle", "glock", "makarov", "cz75", "p1", "fn", "aug", "sa58", "vss", "sval"],
  "Ammo":       ["ammo", "magazine", "mag", "rounds", "cartridge", "762x", "556x", "9x19", "45acp", "308win", "357mag"],
  "Clothing":   ["jacket", "pants", "shirt", "boots", "gloves", "hat", "helmet", "vest", "mask", "balaclava", "cap", "beanie", "hoodie", "coat", "raincoat", "gorka", "ttsko", "hunter", "ghillie"],
  "Food":       ["apple", "pear", "plum", "mushroom", "rice", "beans", "sardines", "tuna", "spaghetti", "cereal", "powdered", "condensed", "crackers", "bacon", "steak", "fat", "guts", "liver", "heart", "brain", "stomach", "intestines", "chicken", "rabbit", "deer", "boar", "wolf", "bear"],
  "Medical":    ["bandage", "rag", "morphine", "epinephrine", "saline", "blood", "tetracycline", "charcoal", "vitamins", "disinfect", "iodine", "splint", "defibrillator", "syringe", "pill"],
  "Tools":      ["axe", "knife", "saw", "hammer", "screwdriver", "wrench", "pliers", "shovel", "pickaxe", "hatchet", "machete", "crowbar", "rope", "wire", "nails", "planks", "logs", "stones"],
  "Vehicles":   ["car", "truck", "bus", "sedan", "hatchback", "offroad", "lada", "skoda", "golf", "transit", "v3s", "ural", "humvee", "land", "olga"],
  "Electronics":["battery", "radio", "walkie", "compass", "gps", "map", "binoculars", "nvg", "flashlight", "headtorch", "lantern"],
  "Containers": ["backpack", "bag", "drybag", "drysack", "hunting", "mountain", "assault", "courier", "smersh", "taloon", "improvised"],
};

function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return "Other";
}

function parseTypesXml(xml: string): LootItem[] {
  const items: LootItem[] = [];
  const typeRegex = /<type\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/type>/g;
  let match;
  while ((match = typeRegex.exec(xml)) !== null) {
    const name = match[1];
    const body = match[2];
    const nominalMatch = body.match(/<nominal>(\d+)<\/nominal>/);
    const lifetimeMatch = body.match(/<lifetime>(\d+)<\/lifetime>/);
    const nominal = nominalMatch ? parseInt(nominalMatch[1]) : 0;
    const lifetime = lifetimeMatch ? parseInt(lifetimeMatch[1]) : 3600;
    items.push({
      name,
      nominal,
      newNominal: nominal,
      category: detectCategory(name),
      lifetime,
      newLifetime: lifetime,
    });
  }
  return items;
}

function applyMultipliers(items: LootItem[], mults: Record<string, CategoryMult>): LootItem[] {
  return items.map(item => {
    const m = mults[item.category] ?? { mult: 1, lifetimeMult: 1 };
    return {
      ...item,
      newNominal: Math.max(0, Math.round(item.nominal * m.mult)),
      newLifetime: Math.max(60, Math.round(item.lifetime * m.lifetimeMult)),
    };
  });
}

function rebuildXml(original: string, items: LootItem[]): string {
  let result = original;
  for (const item of items) {
    // Replace nominal
    const typeRegex = new RegExp(`(<type\\s+name="${item.name}"[^>]*>[\\s\\S]*?)<nominal>\\d+<\\/nominal>`, "g");
    result = result.replace(typeRegex, `$1<nominal>${item.newNominal}</nominal>`);
    // Replace lifetime
    const ltRegex = new RegExp(`(<type\\s+name="${item.name}"[^>]*>[\\s\\S]*?)<lifetime>\\d+<\\/lifetime>`, "g");
    result = result.replace(ltRegex, `$1<lifetime>${item.newLifetime}</lifetime>`);
  }
  return result;
}

const CATEGORIES = ["Weapons", "Ammo", "Clothing", "Food", "Medical", "Tools", "Vehicles", "Electronics", "Containers", "Other"];

const DEFAULT_MULTS: Record<string, CategoryMult> = Object.fromEntries(
  CATEGORIES.map(c => [c, { mult: 1.0, lifetimeMult: 1.0 }])
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function DankLootBalancer() {
  const [xmlInput, setXmlInput] = useState("");
  const [mults, setMults] = useState<Record<string, CategoryMult>>(DEFAULT_MULTS);
  const [copied, setCopied] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [activeTab, setActiveTab] = useState<"sliders" | "preview">("sliders");

  const parsedItems = useMemo(() => parseTypesXml(xmlInput), [xmlInput]);
  const adjustedItems = useMemo(() => applyMultipliers(parsedItems, mults), [parsedItems, mults]);
  const outputXml = useMemo(() => xmlInput ? rebuildXml(xmlInput, adjustedItems) : "", [xmlInput, adjustedItems]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalBefore: number; totalAfter: number }> = {};
    for (const item of adjustedItems) {
      if (!stats[item.category]) stats[item.category] = { count: 0, totalBefore: 0, totalAfter: 0 };
      stats[item.category].count++;
      stats[item.category].totalBefore += item.nominal;
      stats[item.category].totalAfter += item.newNominal;
    }
    return stats;
  }, [adjustedItems]);

  function setMult(cat: string, key: keyof CategoryMult, val: number) {
    setMults(prev => ({ ...prev, [cat]: { ...prev[cat], [key]: val } }));
  }

  function copy() {
    navigator.clipboard.writeText(outputXml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function download() {
    const blob = new Blob([outputXml], { type: "text/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "types_balanced.xml";
    a.click();
  }

  const inputCls = "w-full bg-[#0a1209] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#27ae60]";

  return (
    <div className="min-h-screen bg-[#080f09] text-[#b8d4b8] font-mono">
      <div className="border-b border-[#1a2e1a] bg-[#0c1510] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px]">← HOME</a>
        <span className="text-[#1a2e1a]">/</span>
        <span className="text-[11px] font-black text-[#27ae60]">⚖ DANKLOOT BALANCER</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UNIQUE TOOL</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {/* HOW TO USE */}
        <div className="border border-[#1a2e1a] rounded overflow-hidden">
          <button onClick={() => setShowHow(h => !h)}
            className="w-full flex items-center justify-between px-4 py-2 bg-[#0c1510] text-[11px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
            <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
          </button>
          {showHow && (
            <div className="px-4 py-3 text-[10px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
              <p>1. Paste your types.xml content into the input box.</p>
              <p>2. Items are auto-categorised (Weapons, Food, Medical, etc.).</p>
              <p>3. Use the sliders to multiply nominal counts and lifetimes per category.</p>
              <p>4. The bar chart shows before/after totals per category.</p>
              <p>5. Copy or download the rebalanced types.xml.</p>
            </div>
          )}
        </div>

        {/* XML input */}
        <div>
          <div className="text-[10px] text-[#5a8a5a] font-bold uppercase tracking-wider mb-1">
            PASTE types.xml ({parsedItems.length} items parsed)
          </div>
          <textarea
            className={`${inputCls} h-32 resize-y font-mono`}
            placeholder="Paste your types.xml content here..."
            value={xmlInput}
            onChange={e => setXmlInput(e.target.value)}
          />
        </div>

        {parsedItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: sliders + chart */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-1">
                {(["sliders", "preview"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-[10px] font-black rounded transition-colors ${
                      activeTab === tab
                        ? "bg-[#27ae60] text-[#080f09]"
                        : "bg-[#0a1209] border border-[#1a2e1a] text-[#5a8a5a] hover:text-[#b8d4b8]"
                    }`}>
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {activeTab === "sliders" && (
                <div className="space-y-3">
                  {CATEGORIES.filter(c => categoryStats[c]?.count > 0).map(cat => (
                    <div key={cat} className="bg-[#0a1209] border border-[#1a2e1a] rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-[#b8d4b8]">{cat}</span>
                        <span className="text-[9px] text-[#5a8a5a]">{categoryStats[cat]?.count} items</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-[9px] text-[#5a8a5a] mb-0.5">
                            <span>NOMINAL ×{mults[cat]?.mult.toFixed(1)}</span>
                            <span>{categoryStats[cat]?.totalBefore} → {categoryStats[cat]?.totalAfter}</span>
                          </div>
                          <input type="range" min={0} max={5} step={0.1}
                            value={mults[cat]?.mult ?? 1}
                            onChange={e => setMult(cat, "mult", Number(e.target.value))}
                            className="w-full accent-[#27ae60]" />
                        </div>
                        <div>
                          <div className="text-[9px] text-[#5a8a5a] mb-0.5">LIFETIME ×{mults[cat]?.lifetimeMult.toFixed(1)}</div>
                          <input type="range" min={0.1} max={5} step={0.1}
                            value={mults[cat]?.lifetimeMult ?? 1}
                            onChange={e => setMult(cat, "lifetimeMult", Number(e.target.value))}
                            className="w-full accent-[#5a8a5a]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "preview" && (
                <div className="space-y-1">
                  {CATEGORIES.filter(c => categoryStats[c]?.count > 0).map(cat => {
                    const s = categoryStats[cat];
                    const maxTotal = Math.max(...CATEGORIES.map(c => categoryStats[c]?.totalAfter ?? 0));
                    const pct = maxTotal > 0 ? (s.totalAfter / maxTotal) * 100 : 0;
                    const change = s.totalBefore > 0 ? ((s.totalAfter - s.totalBefore) / s.totalBefore * 100) : 0;
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <div className="w-20 text-[9px] text-[#5a8a5a] text-right">{cat}</div>
                        <div className="flex-1 bg-[#0a1209] rounded h-4 overflow-hidden">
                          <div className="h-full rounded transition-all"
                            style={{ width: `${pct}%`, background: change > 0 ? "#27ae60" : change < 0 ? "#c0392b" : "#3a6a3a" }} />
                        </div>
                        <div className="w-16 text-[9px] text-[#b8d4b8] text-right">{s.totalAfter}</div>
                        <div className={`w-12 text-[9px] font-black text-right ${change > 0 ? "text-[#27ae60]" : change < 0 ? "text-[#c0392b]" : "text-[#5a8a5a]"}`}>
                          {change > 0 ? "+" : ""}{change.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: output */}
            <div className="space-y-3">
              <div className="text-[10px] font-black text-[#27ae60] tracking-widest">OUTPUT</div>
              <pre className="bg-[#050c06] border border-[#1a2e1a] rounded p-3 text-[9px] text-[#b8d4b8] overflow-auto whitespace-pre max-h-[500px]">
                {outputXml.substring(0, 3000)}{outputXml.length > 3000 ? "\n... (truncated for preview)" : ""}
              </pre>
              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 py-2 rounded text-[11px] font-black border border-[#27ae60] text-[#27ae60] hover:bg-[#0e2010] transition-colors">
                  {copied ? "✅ COPIED" : "📋 COPY XML"}
                </button>
                <button onClick={download}
                  className="flex-1 py-2 rounded text-[11px] font-black border border-[#5a8a5a] text-[#5a8a5a] hover:bg-[#0a1209] transition-colors">
                  ⬇ DOWNLOAD
                </button>
              </div>
            </div>
          </div>
        )}

        {parsedItems.length === 0 && xmlInput.length > 10 && (
          <div className="p-4 border border-[#c0392b] rounded text-[11px] text-[#c0392b]">
            ⚠ No &lt;type&gt; elements found. Make sure you pasted valid types.xml content.
          </div>
        )}
      </div>
    </div>
  );
}
