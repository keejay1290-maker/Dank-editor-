import React, { useState, useMemo, useEffect } from "react";
import { VAULT_FILES, VaultFile } from "@/lib/vaultData";
import { parseInitC, parseDZE, parseJSONSpawner, DayZObject } from "@/lib/dayzParser";
import { perfectAllBuilds, GlobalPerfectingReport } from "@/lib/perfectingEngine";
import { COMPLETED_BUILDS } from "@/lib/completedBuilds";
import { getShapePoints } from "@/lib/shapeGenerators";
import { generateExportPackage, downloadFile } from "@/lib/exporter";
import { executePipeline } from "@/lib/pipeline";
import { addBuildToRegistry, RegistryBuild } from "@/lib/buildRegistry";
import { sortBuilds, SortMode } from "@/lib/sortBuilds";
import { autoFixBuild } from "@/lib/autoFixBuild";

export default function DankVault({ 
    onLoadIntoEditor, 
    onGetValidationStatus 
}: { 
    onLoadIntoEditor?: (build: any) => void;
    onGetValidationStatus?: (build: any) => any;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [isScanning, setIsScanning] = useState(false);
  const [activeConversion, setActiveConversion] = useState<{ name: string; content: string; objects: DayZObject[] } | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isPerfecting, setIsPerfecting] = useState(false);
  const [perfectingReport, setPerfectingReport] = useState<GlobalPerfectingReport | null>(null);

  const categories = useMemo(() => {
    const combinedCats = [
      ...VAULT_FILES.map(f => f.category),
      ...COMPLETED_BUILDS.map(b => b.category)
    ];
    const cats = new Set(combinedCats);
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredFiles = useMemo(() => {
    const combined = [
      ...VAULT_FILES.map(f => ({ ...f, type: 'vault' })),
      ...COMPLETED_BUILDS.map(b => ({
        ...b,
        type: 'prebuild',
        source: 'prebuild',
        downloadReady: true,
        ext: "json",
        path: `INTERNAL:masterpiece:${b.id}`,
        size: 0,
        mtime: new Date().toISOString(),
        id: b.id
      }))
    ];
    const list = combined.filter(f => {
      const matchQuery = f.name.toLowerCase().includes(query.toLowerCase()) || 
                         f.category.toLowerCase().includes(query.toLowerCase());
      const matchCat = category === "All" || f.category === category;
      return matchQuery && matchCat;
    });
    return sortBuilds(list as any, sortMode);
  }, [query, category, sortMode]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/vault/sync', { method: 'POST' });
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse sync response:", responseText);
        throw new Error(`Server returned invalid response (likely HTML). Details: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Sync failed with status ${response.status}`);
      }
      
      // Artificial delay for premium feel
      await new Promise(r => setTimeout(r, 1000));
      window.location.reload(); 
    } catch (e: any) {
      console.error("Sync error:", e);
      alert(`Sync failed: ${e.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePerfect = async () => {
    setIsPerfecting(true);
    try {
      const report = await perfectAllBuilds();
      setPerfectingReport(report);
    } catch (e: any) {
      alert(`Perfecting failed: ${e.message}`);
    } finally {
      setIsPerfecting(false);
    }
  };

    const handleDownload = async (file: VaultFile, formatType: "json" | "initc" = "json") => {
    if (file.path.startsWith("INTERNAL:masterpiece:")) {
      const buildId = file.path.split(":").pop();
      const build = COMPLETED_BUILDS.find(b => b.id === buildId);
      if (build) {
        const ctx = await executePipeline(
          "DankVault_Downloader",
          build.category.toLowerCase().includes("sci-fi") ? "death_star" : "generic",
          0,
          { ...build.params, buildName: build.id },
          () => getShapePoints(build.shape, build.params)
        );

        const pkg = generateExportPackage(ctx);
        if (formatType === "json") {
          const file = pkg.jsonFiles[0];
          if (file) downloadFile(file.content, file.name, "application/json");
        } else {
          const file = pkg.initcFiles[0];
          if (file) downloadFile(file.content, file.name, "text/plain");
        }
        return;
      }
    }
    
    const downloadUrl = `/api/vault/download?path=${encodeURIComponent(file.path)}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleConvert = async (file: VaultFile) => {
    setIsConverting(true);
    try {
      let objects: DayZObject[] = [];
      
      if (file.path.startsWith("INTERNAL:masterpiece:")) {
        const buildId = file.path.split(":").pop();
        const build = COMPLETED_BUILDS.find(b => b.id === buildId);
        if (build) {
          const pts = getShapePoints(build.shape, build.params);
          objects = pts.map(p => ({
            name: p.name || build.fillObj,
            pos: [p.x + build.posX, p.y + build.posY, p.z + build.posZ],
            ypr: [p.yaw || 0, p.pitch || 0, p.roll || 0],
            scale: p.scale || 1.0
          }));
        }
      } else {
        const response = await fetch(`/api/vault/fetch?path=${encodeURIComponent(file.path)}`);
        if (!response.ok) throw new Error("Failed to fetch file content");
        const text = await response.text();
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'c') objects = parseInitC(text);
        else if (ext === 'dze') objects = parseDZE(text);
        else if (ext === 'json') objects = parseJSONSpawner(text);
      }

      setActiveConversion({
        name: file.name.replace(/\.[^/.]+$/, "") + ".json",
        content: JSON.stringify(objects, null, 2),
        objects: objects
      });
    } catch (e: any) {
      alert(`Error converting file: ${e.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const themedGroups = useMemo(() => {
    if (typeof (globalThis as any).getThemedPrebuildGroups === "function") {
      return (globalThis as any).getThemedPrebuildGroups();
    }
    return { "Archive": COMPLETED_BUILDS };
  }, []);

  return (
    <div className="flex flex-col flex-1 bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-[#1a2e1a] bg-[#0c1510]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-widest text-[#d4a017]">DANK<span className="text-[#c0392b]">VAULT</span></h1>
            <p className="text-[11px] text-[#5a8a5a] mt-1 italic">Download and convert DayZ community masterpieces with one click.</p>
          </div>
          <div className="flex gap-3">
             {/* 🎖️ NEW PERFECTING ENGINE BUTTON */}
            <button 
              onClick={handlePerfect}
              disabled={isPerfecting}
              className={`px-4 py-2 bg-[#d4a017] text-[#080f09] text-[12px] font-black rounded-sm shadow-[0_0_20px_rgba(212,160,23,0.3)] hover:bg-[#f1c40f] transition-all flex items-center gap-2 ${isPerfecting ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isPerfecting ? "🛠️ PERFECTING BUILDS..." : "🏁 PERFECT ALL CONSOLE BUILDS"}
            </button>

            <button 
              onClick={handleScan}
              disabled={isScanning}
              className={`px-4 py-2 bg-[#27ae60] text-[#080f09] text-[12px] font-bold rounded-sm shadow-[0_0_15px_rgba(39,174,96,0.3)] hover:bg-[#2ecc71] transition-all flex items-center gap-2 ${isScanning ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isScanning ? "🚀 SCANNING..." : "📂 SCAN FOR NEW FILES"}
            </button>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-[300px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a6a3a]">⌕</span>
            <input 
              type="text" 
              placeholder="Search by filename or category..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#0a1209] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] pl-8 pr-4 py-2 rounded outline-none focus:border-[#d4a017] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#0a1209] border border-[#1a2e1a] px-3 py-1.5 rounded">
                <span className="text-[9px] font-black opacity-40 uppercase">Sort by:</span>
                <select 
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="bg-transparent text-[#d4a017] text-[10px] font-black outline-none border-none cursor-pointer"
                >
                    <option value="name">Name</option>
                    <option value="health-desc">Health (Hi-Lo)</option>
                    <option value="status">Status (PASS-FAIL)</option>
                </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#d4a01744] scrollbar-track-transparent no-scrollbar mask-fade-right">
            <div className="flex gap-2 pr-12 min-w-max">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-[10px] font-black rounded-sm border transition-all whitespace-nowrap tracking-tighter ${category === cat ? 'bg-[#d4a017] text-[#080f09] border-[#d4a017] shadow-[0_0_10px_rgba(212,160,23,0.3)]' : 'bg-[#0a1209] border-[#1a2e1a] text-[#5a8a5a] hover:border-[#3a6a3a] hover:text-[#b8d4b8]'}`}
                >
                  {cat?.toUpperCase() || "MISC"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#1a2e1a]">
        <div className="flex flex-col gap-10 pb-10">
          {Object.entries(themedGroups).map(([theme, items]: [string, any[]]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={theme} className="flex flex-col gap-4">
                <div className="border-l-4 border-[#d4a017] pl-3 py-1 mb-2">
                  <h2 className="text-[#d4a017] text-sm font-black tracking-widest uppercase">✨ {theme} Masterpieces</h2>
                  <p className="text-[10px] text-[#5a8a5a] italic">Hand-picked premium builds for the {theme} archetype.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((build, idx) => (
                    <div key={`${theme}-${idx}`} className="bg-[#0c1510] border border-[#d4a01744] p-4 rounded-sm hover:border-[#d4a017] transition-all group relative flex flex-col h-full shadow-[0_0_15px_rgba(212,160,23,0.1)]">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded border border-[#d4a017] text-[#d4a017] bg-[#1a150a] uppercase tracking-tighter">{theme} ARCHETYPE</span>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[14px]">{build.icon}</span>
                          {(() => {
                            const status = onGetValidationStatus?.(build);
                            if (!status) return null;
                            const color = status.health >= 80 ? "text-[#27ae60]" : status.health >= 40 ? "text-[#d4a017]" : "text-[#e74c3c]";
                            const label = status.health >= 80 ? "VALID ✓" : status.health >= 40 ? "WARN ⚠" : "FAIL ✖";
                            return (
                                <span className={`text-[8px] font-black border border-current px-1 rounded-sm ${color} bg-[#0c1510]/80 backdrop-blur-sm`} title={`Health: ${status.health}/100`}>
                                    {label}
                                </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* 🌌 High-Fidelity Thumbnail */}
                      <div className="h-32 bg-[#060402] border border-[#1a2e1a] rounded-sm mb-4 relative flex items-center justify-center overflow-hidden">
                        {build.thumbnail ? (
                          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: build.thumbnail }} />
                        ) : (
                          <>
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#27ae60_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 duration-500">{build.icon}</span>
                          </>
                        )}
                        <div className="absolute top-1 right-1 px-1 bg-[#1a2e1a]/80 text-[#5a8a5a] text-[7px] font-mono rounded">
                          {build.upgraded ? "UPGRADED_V2" : "LEGACY_CORE"}
                        </div>
                      </div>

                      <h3 className="text-[12px] font-black text-[#d4a017] mb-1">{build.name}</h3>
                      <p className="text-[9px] text-[#5a8a5a] mb-4 flex-1 line-clamp-2">{build.tagline || build.objectNotes}</p>
                      
                      <div className="flex flex-col gap-1.5 mt-auto">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleDownload({ 
                              name: `${build.id}.json`, 
                              path: `INTERNAL:masterpiece:${build.id}`, 
                              category: build.category, 
                              size: 0, 
                              isCommunity: false,
                              ext: 'json',
                              mtime: new Date().toISOString()
                            }, "initc")}
                            className="flex-1 py-1.5 bg-[#0e2010] border border-[#27ae60] text-[#27ae60] text-[9px] font-black rounded hover:bg-[#27ae60] hover:text-[#080f09] transition-all flex items-center justify-center gap-1"
                          >
                            ⬇️ INIT.C
                          </button>
                          <button 
                            onClick={() => handleDownload({ 
                              name: `${build.id}.json`, 
                              path: `INTERNAL:masterpiece:${build.id}`, 
                              category: build.category, 
                              size: 0, 
                              isCommunity: false,
                              ext: 'json',
                              mtime: new Date().toISOString()
                            }, "json")}
                            className="flex-1 py-1.5 bg-[#1a0f0a] border border-[#d4a01744] text-[#d4a017] text-[9px] font-black rounded hover:bg-[#d4a017] hover:text-[#080f09] transition-all flex items-center justify-center gap-1"
                          >
                            ⬇️ JSON
                          </button>
                        </div>
                        {(() => {
                          const status = onGetValidationStatus?.(build);
                          if (status?.status === "FAIL") {
                            return (
                              <button 
                                 onClick={async () => {
                                    await autoFixBuild(build);
                                    window.location.reload();
                                 }}
                                 className="w-full py-1.5 mt-1 bg-[#d4a017] text-[#080f09] text-[8px] font-black rounded uppercase"
                              >
                                 ✨ Auto-Fix Build
                              </button>
                            );
                          }
                          return null;
                        })()}
                        <button 
                          onClick={() => onLoadIntoEditor?.(build)}
                          className="w-full py-1.5 bg-[#27ae60] text-[#080f09] text-[10px] font-black rounded hover:bg-[#e8b82a] transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(39,174,96,0.2)]"
                        >
                          🚀 OPEN IN EDITOR (PERFECTING)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20 mt-10">
          <div className="col-span-full border-l-4 border-[#27ae60] pl-3 py-1 mb-2">
            <h2 className="text-[#27ae60] text-sm font-black tracking-widest uppercase">📂 Vault Archive</h2>
            <p className="text-[10px] text-[#5a8a5a]">Community assets and legacy conversions.</p>
          </div>
          {filteredFiles.map((file, idx) => (
            <div key={idx} className="bg-[#0a1209] border border-[#1a2e1a] p-4 rounded-sm hover:border-[#27ae60] transition-colors group relative overflow-hidden flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${file.isCommunity ? 'bg-[#1a0a20] border-[#9b59b6] text-[#9b59b6]' : 'bg-[#0e2010] border-[#27ae60] text-[#27ae60]'}`}>
                  {file.category}
                </span>
                <div className="flex gap-1 items-center">
                  <span className="text-[9px] bg-[#1a2e1a] px-1.5 py-0.5 rounded text-[#5a8a5a] font-black uppercase">{file.name.split('.').pop()}</span>
                  <span className="text-[9px] text-[#3a6a3a]">{formatSize(file.size)}</span>
                </div>
              </div>
              <h3 className="text-[12px] font-black text-[#b8d4b8] mb-2 truncate" title={file.name}>{file.name}</h3>
              <p className="text-[9px] text-[#5a8a5a] font-mono break-all line-clamp-1 mb-4 flex-1 opacity-60 italic">{file.path}</p>
              
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex gap-1.5">
                   <button 
                    onClick={() => handleDownload(file)}
                    className="flex-1 text-center py-2 bg-[#d4a017] text-[#080f09] text-[10px] font-black rounded border border-transparent hover:bg-[#f39c12] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    ⬇️ DOWNLOAD
                  </button>
                   {file.name.toLowerCase().endsWith('.c') || file.name.toLowerCase().endsWith('.dze') ? (
                     <button 
                      onClick={() => handleConvert(file)}
                      disabled={isConverting}
                      className="flex-1 text-center py-2 bg-[#1a2e1a] text-[#27ae60] text-[10px] font-black rounded border border-[#27ae6033] hover:border-[#27ae60] hover:bg-[#27ae6011] transition-all flex items-center justify-center gap-2"
                    >
                      {isConverting ? "⏳ ..." : "🔄 CONVERT"}
                    </button>
                   ) : (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(file.path);
                        const toast = document.getElementById(`copy-toast-${idx}`);
                        if (toast) {
                          toast.classList.remove('opacity-0');
                          setTimeout(() => toast.classList.add('opacity-0'), 2000);
                        }
                      }}
                      className="px-3 text-center py-2 bg-[#0c1510] border border-[#1a2e1a] text-[#5a8a5a] text-[10px] font-bold rounded hover:text-[#b8d4b8] hover:border-[#3a6a3a] transition-all flex items-center justify-center gap-1"
                    >
                      📋 PATH
                    </button>
                   )}
                </div>
                <div id={`copy-toast-${idx}`} className="absolute -top-8 left-1/2 -translateX-1/2 bg-[#27ae60] text-[#080f09] text-[8px] font-bold px-2 py-1 rounded opacity-0 transition-opacity pointer-events-none">
                  COPIED TO CLIPBOARD
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredFiles.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#3a6a3a] py-20">
            <span className="text-4xl mb-4 grayscale opacity-50">📂</span>
            <p className="text-[13px] font-black tracking-tighter uppercase opacity-50">Vault empty or no results</p>
          </div>
        )}
      </div>

      {/* Perfecting Report Modal */}
      {perfectingReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="bg-[#0c1510] border border-[#d4a017] w-full max-w-4xl rounded-sm shadow-[0_0_50px_rgba(212,160,23,0.2)] flex flex-col max-h-[85vh] overflow-hidden">
             <div className="p-6 border-b border-[#1a2e1a] flex justify-between items-center bg-[#0a1209]">
                <div>
                  <h2 className="text-[#d4a017] font-black tracking-widest text-lg uppercase">DANKVAULT™ PERFECTING REPORT</h2>
                  <p className="text-[10px] text-[#5a8a5a] font-mono mt-1 italic">Scan ID: {perfectingReport.timestamp.replace('T', ' ').split('.')[0]}</p>
                </div>
                <button onClick={() => setPerfectingReport(null)} className="text-[#3a6a3a] hover:text-[#c0392b] text-2xl font-bold">✕</button>
             </div>

             <div className="flex-1 overflow-auto p-6 bg-[#080f09]">
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#0a1209] border border-[#1a2e1a] p-4 text-center">
                    <span className="text-[10px] text-[#5a8a5a] block mb-1">TOTAL SCANNED</span>
                    <span className="text-2xl font-black text-[#b8d4b8]">{perfectingReport.totalBuilds}</span>
                  </div>
                  <div className="bg-[#0a1209] border border-[#27ae6022] p-4 text-center">
                    <span className="text-[10px] text-[#27ae60] block mb-1">PERFECT (STABLE)</span>
                    <span className="text-2xl font-black text-[#27ae60]">{perfectingReport.perfect}</span>
                  </div>
                  <div className="bg-[#0a1209] border border-[#d4a01722] p-4 text-center">
                    <span className="text-[10px] text-[#d4a017] block mb-1">AUTO-FIXED</span>
                    <span className="text-2xl font-black text-[#d4a017]">{perfectingReport.corrected}</span>
                  </div>
                  <div className="bg-[#0a1209] border border-[#c0392b22] p-4 text-center">
                    <span className="text-[10px] text-[#c0392b] block mb-1">QUARANTINED</span>
                    <span className="text-2xl font-black text-[#c0392b]">{perfectingReport.quarantined}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {perfectingReport.reports.map((r, i) => (
                    <div key={i} className={`p-4 border font-mono ${r.status === 'PERFECT' ? 'border-[#1a2e1a] bg-[#0c1510]' : r.status === 'CORRECTED' ? 'border-[#d4a01733] bg-[#0a1209]' : 'border-[#c0392b33] bg-[#1a0a20]'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-black text-[#b8d4b8] uppercase tracking-tighter">[{r.status}] {r.buildId}</span>
                        <span className="text-[10px] text-[#5a8a5a]">FIDELITY: {r.fidelityScore}%</span>
                      </div>
                      
                      {r.fixes.length > 0 && (
                        <div className="mt-2 pl-3 border-l border-[#d4a01755]">
                          <p className="text-[9px] text-[#d4a017] mb-1 font-black">🛠️ AUTO-FIXES APPLIED:</p>
                          {r.fixes.map((fix, fi) => <p key={fi} className="text-[9px] text-[#5a8a5a]">• {fix}</p>)}
                        </div>
                      )}

                      {r.optimizations.length > 0 && (
                        <div className="mt-2 pl-3 border-l border-[#27ae6055]">
                          <p className="text-[9px] text-[#27ae60] mb-1 font-black">⚡ PERFORMANCE OPTIMIZATIONS:</p>
                          {r.optimizations.map((opt, oi) => <p key={oi} className="text-[9px] text-[#5a8a5a]">• {opt}</p>)}
                        </div>
                      )}

                      {r.errors.length > 0 && (
                        <div className="mt-2 pl-3 border-l border-[#c0392b55]">
                          <p className="text-[9px] text-[#c0392b] mb-1 font-black">⚠️ BLOCKING ERRORS (QUARANTINED):</p>
                          {r.errors.map((err, ei) => <p key={ei} className="text-[9px] text-[#5a8a5a]">• {err}</p>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
             </div>

             <div className="p-6 border-t border-[#1a2e1a] bg-[#0a1209] flex gap-4">
                <button 
                  onClick={() => setPerfectingReport(null)}
                  className="flex-1 py-3 bg-[#1a2e1a] text-[#5a8a5a] text-[11px] font-black rounded hover:text-[#b8d4b8] hover:border-[#3a6a3a] border border-[#1a2e1a] transition-all"
                >
                  DISMISS REPORT
                </button>
                <button 
                  className="flex-1 py-3 bg-[#d4a017] text-[#080f09] text-[11px] font-black rounded hover:bg-[#f1c40f] border border-transparent shadow-[0_0_15px_rgba(212,160,23,0.3)] transition-all"
                >
                  📦 EXPORT PERFECTED REBOOT UNIT
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-[#1a2e1a] bg-[#0c1510] flex justify-between items-center text-[10px] text-[#3a6a3a] z-10">
        <div className="flex items-center gap-4">
          <span className="text-[#5a8a5a] font-bold tracking-widest uppercase">{filteredFiles.length} MASTERPIECES READY</span>
          <div className="h-4 w-[1px] bg-[#1a2e1a]" />
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#27ae60]"></span> LOCAL BUILDS</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9b59b6]"></span> COMMUNITY</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#d4a017]"></span> PRIME ASSETS</span>
        </div>
        <div className="flex items-center gap-2 italic font-mono text-[8px]">
          VAULT_SYNC_SECURE_AUTH: ACTIVE // LAST_SCAN: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
