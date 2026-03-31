/**
 * DankClassnameSearch — DayZ classname reference browser.
 * Searchable offline database of common DayZ classnames across
 * weapons, clothing, food, vehicles, buildings and more.
 * Copy classnames directly for use in types.xml, spawners, loadouts.
 */
import { useState, useMemo } from "react";
import { DAYZ_LOOT_DB, DAYZ_LOOT_CATEGORIES } from "@/lib/dayzLootDB";

// ─── Data ─────────────────────────────────────────────────────────────────────

type ClassEntry = typeof DAYZ_LOOT_DB[number];


// ─── Component ────────────────────────────────────────────────────────────────

export default function DankClassnameSearch() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [showHow, setShowHow] = useState(false);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return DAYZ_LOOT_DB.filter(e => {
      const matchCat = activeCategory === "All" || e.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        e.classname.toLowerCase().includes(q) ||
        e.displayName.toLowerCase().includes(q) ||
        e.subcategory.toLowerCase().includes(q) ||
        e.tags.some(t => t.includes(q))
      );
    });
  }, [query, activeCategory]);

  function copy(classname: string) {
    navigator.clipboard.writeText(classname).then(() => {
      setCopied(classname);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function copyAll() {
    const text = results.map(e => e.classname).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied("__all__");
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="min-h-screen bg-[#080f09] text-[#b8d4b8] font-mono">
      <div className="border-b border-[#1a2e1a] bg-[#0c1510] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px]">← HOME</a>
        <span className="text-[#1a2e1a]">/</span>
        <span className="text-[11px] font-black text-[#27ae60]">🔍 DANKCLASSNAME SEARCH</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UNIQUE TOOL</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {/* HOW TO USE */}
        <div className="border border-[#1a2e1a] rounded overflow-hidden">
          <button onClick={() => setShowHow(h => !h)}
            className="w-full flex items-center justify-between px-4 py-2 bg-[#0c1510] text-[11px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
            <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
          </button>
          {showHow && (
            <div className="px-4 py-3 text-[10px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
              <p>1. Search by classname, display name, or tag (e.g. "762", "military", "backpack").</p>
              <p>2. Filter by category using the tabs.</p>
              <p>3. Click any classname to copy it to clipboard.</p>
              <p>4. Use "COPY ALL" to copy all visible classnames as a list.</p>
            </div>
          )}
        </div>

        {/* Search + filters */}
        <div className="flex gap-3 items-center">
          <input
            className="flex-1 bg-[#0a1209] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-3 py-2 rounded focus:outline-none focus:border-[#27ae60]"
            placeholder="Search classnames, names, tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={copyAll}
            className="px-3 py-2 text-[10px] font-black border border-[#5a8a5a] text-[#5a8a5a] rounded hover:border-[#27ae60] hover:text-[#27ae60] transition-colors whitespace-nowrap">
            {copied === "__all__" ? "✅ COPIED" : `COPY ALL (${results.length})`}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1">
          {["All", ...DAYZ_LOOT_CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 text-[9px] font-black rounded transition-colors ${
                activeCategory === cat
                  ? "bg-[#27ae60] text-[#080f09]"
                  : "bg-[#0a1209] border border-[#1a2e1a] text-[#5a8a5a] hover:text-[#b8d4b8]"
              }`}>
              {cat} {cat === "All" ? `(${DAYZ_LOOT_DB.length})` : `(${DAYZ_LOOT_DB.filter(e => e.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="text-[9px] text-[#3a6a3a] mb-2">{results.length} results</div>
        <div className="space-y-1">
          {results.map(entry => (
            <div key={entry.classname}
              className="flex items-center gap-3 p-2 rounded border border-[#1a2e1a] bg-[#0a1209] hover:border-[#2a4a2a] group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copy(entry.classname)}
                    className="text-[11px] font-black text-[#27ae60] hover:text-[#2ecc71] font-mono transition-colors"
                    title="Click to copy">
                    {copied === entry.classname ? "✅" : entry.classname}
                  </button>
                  <span className="text-[9px] text-[#5a8a5a]">— {entry.displayName}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] text-[#3a6a3a]">{entry.category} / {entry.subcategory}</span>
                  <div className="flex gap-1">
                    {entry.tags.slice(0, 4).map(t => (
                      <span key={t} className="text-[7px] px-1 rounded bg-[#0c1510] text-[#3a6a3a] border border-[#1a2e1a]">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => copy(entry.classname)}
                className="opacity-0 group-hover:opacity-100 text-[9px] text-[#5a8a5a] hover:text-[#27ae60] transition-all px-2">
                COPY
              </button>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-[11px] text-[#5a8a5a] text-center py-8">No classnames match your search.</div>
        )}
      </div>
    </div>
  );
}
