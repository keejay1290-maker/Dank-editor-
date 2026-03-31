import { useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";

interface TypeEntry {
  name: string;
  nominal: number;
  lifetime: number;
  restock: number;
  min: number;
  quantmin: number;
  quantmax: number;
  cost: number;
  flags: string;
  category: string;
  usages: string[];
  values: string[];
  raw: string; // original XML block
}

function parseTypes(xml: string): TypeEntry[] {
  const entries: TypeEntry[] = [];
  const typeRe = /<type\s+name="([^"]+)">([\s\S]*?)<\/type>/g;
  let m: RegExpExecArray | null;
  while ((m = typeRe.exec(xml)) !== null) {
    const name = m[1];
    const body = m[2];
    const get = (tag: string) => { const r = new RegExp(`<${tag}>([^<]*)</${tag}>`); const t = r.exec(body); return t ? t[1].trim() : ""; };
    const getAll = (tag: string) => { const r = new RegExp(`<${tag}[^>]*name="([^"]*)"`, "g"); const res: string[] = []; let tm; while ((tm = r.exec(body)) !== null) res.push(tm[1]); return res; };
    const flagsM = /<flags([^/]*)\/?>/.exec(body);
    entries.push({
      name,
      nominal:  parseInt(get("nominal"))  || 0,
      lifetime: parseInt(get("lifetime")) || 0,
      restock:  parseInt(get("restock"))  || 0,
      min:      parseInt(get("min"))      || 0,
      quantmin: parseInt(get("quantmin")) || -1,
      quantmax: parseInt(get("quantmax")) || -1,
      cost:     parseInt(get("cost"))     || 100,
      flags:    flagsM ? flagsM[1].trim() : "",
      category: getAll("category")[0] || "",
      usages:   getAll("usage"),
      values:   getAll("value"),
      raw:      m[0],
    });
  }
  return entries;
}

function serializeEntry(e: TypeEntry): string {
  const flagsStr = e.flags ? ` <flags ${e.flags}/>\n` : "";
  const cats = e.category ? `    <category name="${e.category}"/>\n` : "";
  const usages = e.usages.map(u => `    <usage name="${u}"/>`).join("\n") + (e.usages.length ? "\n" : "");
  const values = e.values.map(v => `    <value name="${v}"/>`).join("\n") + (e.values.length ? "\n" : "");
  return `<type name="${e.name}">\n    <nominal>${e.nominal}</nominal>\n    <lifetime>${e.lifetime}</lifetime>\n    <restock>${e.restock}</restock>\n    <min>${e.min}</min>\n    <quantmin>${e.quantmin}</quantmin>\n    <quantmax>${e.quantmax}</quantmax>\n    <cost>${e.cost}</cost>\n${flagsStr}${cats}${usages}${values}</type>`;
}

const ALL_USAGES = ["Military","Police","Medic","Firefighter","Hunting","Farm","Village","Town","Heli","Lunapark","Industrial","Coast","Prison","Office","School","Contaminated"];

export default function DankTypesEditor() {
  const [, navigate] = useLocation();
  const [entries, setEntries] = useState<TypeEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterUsage, setFilterUsage] = useState("All");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkNominal, setBulkNominal] = useState("");
  const [bulkMin, setBulkMin] = useState("");
  const [bulkLifetime, setBulkLifetime] = useState("");
  const [showHow, setShowHow] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return entries.filter((e, i) => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
      const matchUsage = filterUsage === "All" || e.usages.includes(filterUsage);
      return matchSearch && matchUsage;
    }).map((e, _) => ({ ...e, _origIdx: entries.indexOf(e) }));
  }, [entries, search, filterUsage]);

  function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setEntries(parseTypes(ev.target?.result as string));
    reader.readAsText(file);
  }

  function loadPaste(text: string) {
    setEntries(parseTypes(text));
  }

  function updateEntry(idx: number, patch: Partial<TypeEntry>) {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, ...patch } : e));
  }

  function applyBulk() {
    setEntries(prev => prev.map((e, i) => {
      if (!selected.has(i)) return e;
      return {
        ...e,
        ...(bulkNominal !== "" ? { nominal: parseInt(bulkNominal) } : {}),
        ...(bulkMin !== "" ? { min: parseInt(bulkMin) } : {}),
        ...(bulkLifetime !== "" ? { lifetime: parseInt(bulkLifetime) } : {}),
      };
    }));
    setBulkNominal(""); setBulkMin(""); setBulkLifetime("");
    setSelected(new Set());
  }

  function exportXml() {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<types>\n${entries.map(serializeEntry).join("\n")}\n</types>`;
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([xml], { type: "text/xml" })),
      download: "types.xml",
    });
    a.click();
  }

  const toggleSelect = (idx: number) => {
    setSelected(prev => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });
  };

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#27ae60] font-black text-[13px] tracking-widest">📋 DANKTYPES EDITOR</span>
        <span className="text-[#5a8a5a] text-[10px]">types.xml editor · offline</span>
        <div className="ml-auto flex gap-2">
          <input ref={fileRef} type="file" accept=".xml" onChange={loadFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="px-3 py-1 bg-[#0e2010] border border-[#27ae60] text-[#27ae60] text-[10px] font-bold rounded hover:bg-[#1a3020]">📂 LOAD XML</button>
          {entries.length > 0 && <button onClick={exportXml} className="px-3 py-1 bg-[#27ae60] text-[#080f09] text-[10px] font-bold rounded hover:bg-[#2ecc71]">⬇ EXPORT XML</button>}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          {/* HOW TO USE */}
          <div className="w-full max-w-2xl border border-[#1a2e1a] rounded overflow-hidden">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-4 py-2 bg-[#0c1510] text-[11px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-4 py-3 text-[10px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Click LOAD XML to open your types.xml, or paste content below.</p>
                <p>2. Search and filter items by name or usage tag.</p>
                <p>3. Click any row to edit nominal, min, lifetime, and usage tags.</p>
                <p>4. Select multiple rows with checkboxes for bulk edits.</p>
                <p>5. Export the modified types.xml and upload to your mission's db/ folder.</p>
              </div>
            )}
          </div>
          <div className="text-4xl">📋</div>
          <div className="text-[14px] font-bold text-[#b8d4b8]">Load a types.xml file to begin</div>
          <div className="text-[11px] text-[#5a8a5a]">Or paste XML content below</div>
          <textarea
            placeholder="Paste types.xml content here..."
            className="w-full max-w-2xl h-48 bg-[#0a1209] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] p-3 rounded font-mono resize-none"
            onBlur={e => e.target.value && loadPaste(e.target.value)}
          />
          <button onClick={() => fileRef.current?.click()} className="px-6 py-2 bg-[#27ae60] text-[#080f09] font-black text-[12px] rounded hover:bg-[#2ecc71]">📂 LOAD FILE</button>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Filters + bulk */}
          <div className="w-56 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-3 flex flex-col gap-3 overflow-y-auto">
            <div className="text-[10px] text-[#5a8a5a] font-bold tracking-widest">{entries.length} ITEMS LOADED</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search classname..." className="bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1.5 rounded" />
            <div>
              <div className="text-[9px] text-[#3a6a3a] mb-1">FILTER BY USAGE</div>
              <select value={filterUsage} onChange={e => setFilterUsage(e.target.value)} className="w-full bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1.5 rounded">
                <option>All</option>
                {ALL_USAGES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            {selected.size > 0 && (
              <div className="border border-[#27ae60] rounded p-2 bg-[#0e2010]">
                <div className="text-[9px] text-[#27ae60] font-bold mb-2">BULK EDIT ({selected.size} selected)</div>
                {[["Nominal", bulkNominal, setBulkNominal], ["Min", bulkMin, setBulkMin], ["Lifetime", bulkLifetime, setBulkLifetime]].map(([label, val, setter]) => (
                  <div key={label as string} className="mb-1.5">
                    <div className="text-[8px] text-[#3a6a3a]">{label as string}</div>
                    <input type="number" value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} placeholder="leave blank to skip" className="w-full bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[9px] px-1.5 py-1 rounded" />
                  </div>
                ))}
                <button onClick={applyBulk} className="w-full py-1 bg-[#27ae60] text-[#080f09] text-[9px] font-bold rounded mt-1">APPLY BULK</button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead className="sticky top-0 bg-[#0c1510] border-b border-[#1a2e1a]">
                <tr>
                  <th className="px-2 py-1.5 text-left text-[#5a8a5a] w-6"><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(f => f._origIdx)) : new Set())} /></th>
                  <th className="px-2 py-1.5 text-left text-[#5a8a5a]">Classname</th>
                  <th className="px-2 py-1.5 text-center text-[#5a8a5a] w-16">Nominal</th>
                  <th className="px-2 py-1.5 text-center text-[#5a8a5a] w-16">Min</th>
                  <th className="px-2 py-1.5 text-center text-[#5a8a5a] w-20">Lifetime</th>
                  <th className="px-2 py-1.5 text-center text-[#5a8a5a] w-20">Restock</th>
                  <th className="px-2 py-1.5 text-left text-[#5a8a5a]">Usages</th>
                  <th className="px-2 py-1.5 text-left text-[#5a8a5a] w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => {
                  const idx = entry._origIdx;
                  const isEdit = editIdx === idx;
                  return (
                    <tr key={entry.name} className={`border-b border-[#0e1a0e] ${selected.has(idx) ? "bg-[#0e2010]" : "hover:bg-[#0a1a0a]"}`}>
                      <td className="px-2 py-1"><input type="checkbox" checked={selected.has(idx)} onChange={() => toggleSelect(idx)} /></td>
                      <td className="px-2 py-1 font-bold text-[#b8d4b8]">{entry.name}</td>
                      {isEdit ? (
                        <>
                          {(["nominal","min","lifetime","restock"] as const).map(field => (
                            <td key={field} className="px-1 py-1">
                              <input type="number" value={entry[field]} onChange={e => updateEntry(idx, { [field]: parseInt(e.target.value) || 0 })}
                                className="w-full bg-[#0e1a0e] border border-[#27ae60] text-[#b8d4b8] text-[10px] px-1 py-0.5 rounded text-center" />
                            </td>
                          ))}
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-1 text-center text-[#27ae60] font-bold">{entry.nominal}</td>
                          <td className="px-2 py-1 text-center">{entry.min}</td>
                          <td className="px-2 py-1 text-center text-[#5a8a5a]">{entry.lifetime}</td>
                          <td className="px-2 py-1 text-center text-[#5a8a5a]">{entry.restock}</td>
                        </>
                      )}
                      <td className="px-2 py-1">
                        <div className="flex flex-wrap gap-0.5">
                          {entry.usages.map(u => <span key={u} className="px-1 py-0.5 rounded text-[8px] bg-[#0e2010] text-[#27ae60] border border-[#1a3020]">{u}</span>)}
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        <button onClick={() => setEditIdx(isEdit ? null : idx)} className={`text-[9px] px-1.5 py-0.5 rounded ${isEdit ? "bg-[#27ae60] text-[#080f09]" : "text-[#5a8a5a] hover:text-[#27ae60]"}`}>
                          {isEdit ? "✓" : "✏"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
