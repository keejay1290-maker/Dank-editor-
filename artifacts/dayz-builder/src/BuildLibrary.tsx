import React, { useState, useMemo, useEffect } from "react";
import { getAllBuildsFromRegistry, subscribeToRegistry, RegistryBuild } from "@/lib/buildRegistry";
import PointCloud3D from "@/PointCloud3D";
import { downloadFile, generateExportPackage, ExportFile } from "@/lib/exporter";
import { sortBuilds, SortMode } from "@/lib/sortBuilds";
import { autoFixBuild } from "@/lib/autoFixBuild";

function BuildPreview({ objects }: { objects: any[] }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div 
            onMouseEnter={() => setHovered(true)} 
            onMouseLeave={() => setHovered(false)} 
            className="w-full h-full relative pointer-events-auto"
        >
            {!hovered && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 opacity-40">
                  <span className="text-[14px]">📦</span>
                  <span className="text-[8px] font-black uppercase">Hover to Materialise 3D</span>
                  <span className="text-[7px] text-[#27ae60]">{objects?.length || 0} CANONICAL NODES</span>
                </div>
            )}
            {hovered && (
                <PointCloud3D 
                  points={[]} 
                  objects={objects} 
                  autoRotate={true}
                  globalScale={1.3}
                  globalPitch={0}
                  globalRoll={0}
                />
            )}
        </div>
    );
}

export default function BuildLibrary({ 
    onLoadIntoEditor,
    onGetValidationStatus,
    sandboxEnabled, setSandboxEnabled,
    sandboxHUD, setSandboxHUD,
    sandboxOverlays, setSandboxOverlays,
    developerMode, setDeveloperMode,
    showDebugGeometry, setShowDebugGeometry
}: { 
    onLoadIntoEditor?: (build: any) => void;
    onGetValidationStatus?: (build: any) => any;
    sandboxEnabled: boolean; setSandboxEnabled: (v: boolean) => void;
    sandboxHUD: boolean; setSandboxHUD: (v: boolean) => void;
    sandboxOverlays: any; setSandboxOverlays: (v: any) => void;
    developerMode: boolean; setDeveloperMode: (v: boolean) => void;
    showDebugGeometry: boolean; setShowDebugGeometry: (v: boolean) => void;
}) {
  const [builds, setBuilds] = useState<RegistryBuild[]>(getAllBuildsFromRegistry());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>("name");

  useEffect(() => {
    return subscribeToRegistry(() => {
      setBuilds([...getAllBuildsFromRegistry()]);
    });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(builds.map(b => b.category));
    return ["All", ...Array.from(cats)];
  }, [builds]);

  const filteredBuilds = useMemo(() => {
    const list = builds.filter(b => {
      const matchQuery = (b.name || "").toLowerCase().includes(query.toLowerCase()) ||
                         (b.tagline || "").toLowerCase().includes(query.toLowerCase()) ||
                         (b.category || "").toLowerCase().includes(query.toLowerCase());
      const matchCat = category === "All" || b.category === category;
      return matchQuery && matchCat;
    });
    return sortBuilds(list, sortMode);
  }, [builds, query, category, sortMode]);

  const handleDownload = (build: RegistryBuild, format: "json" | "initc") => {
    const ctx = {
      objects_final: build.objects_final,
      params: { ...build.params, buildName: build.name },
      errors: [],
      metadata: {},
      fidelityScore: 100
    } as any;

    const pkg = generateExportPackage(ctx);
    if (format === "json") {
      const file = pkg.jsonFiles[0];
      if (file) downloadFile(file.content, file.name, "application/json");
    } else {
      const file = pkg.initcFiles[0];
      if (file) downloadFile(file.content, file.name, "text/plain");
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#1a2e1a] bg-[#0c1510] shrink-0">
        <div className="mb-4">
          <h1 className="text-xl font-black tracking-widest text-[#27ae60]">
            UNIFIED <span className="text-[#d4a017]">PREBUILDS</span>
          </h1>
          <p className="text-[10px] text-[#5a8a5a] mt-1 uppercase tracking-tighter">
            Master Library: Browsing {builds.length} Integrated Masterpieces (Quick-Download Mode)
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a6a3a] opacity-50">⌕</span>
              <input 
                type="text" 
                placeholder="Search canonical builds..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-[#0a1209] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] pl-8 pr-4 py-2 rounded focus:border-[#27ae60] transition-colors outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black opacity-40">SORT:</span>
                <select 
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="bg-[#0a1209] border border-[#1a2e1a] text-[#27ae60] text-[9px] font-black px-2 py-2 rounded outline-none"
                >
                    <option value="name">Name</option>
                    <option value="health-desc">Health (Hi-Lo)</option>
                    <option value="status">Status (PASS-FAIL)</option>
                    <option value="object-count">Complexity</option>
                </select>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-[9px] font-black rounded-sm border transition-all whitespace-nowrap ${category === cat ? 'bg-[#27ae60] text-[#080f09] border-[#27ae60]' : 'bg-[#0a1209] border-[#1a2e1a] text-[#5a8a5a] hover:border-[#3a6a3a]'}`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#1a2e1a]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {filteredBuilds.map((build) => (
            <div key={build.id} className="bg-[#0c1510] border border-[#1a2e1a] rounded-sm hover:border-[#27ae60] transition-all group flex flex-col h-[380px] overflow-hidden relative">
              {/* Category Badge */}
              <div className="absolute top-2 left-2 z-20 flex gap-1">
                <span className="text-[8px] font-black px-1.5 py-0.5 bg-[#080f09] border border-[#27ae6044] text-[#27ae60] rounded-sm uppercase">
                  {build.category}
                </span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 bg-[#080f09] border rounded-sm uppercase ${
                  build.source === 'prebuild' ? 'border-[#3498db] text-[#3498db]' : 
                  build.source === 'vault' ? 'border-[#d4a017] text-[#d4a017]' : 'border-[#9b59b6] text-[#9b59b6]'
                }`}>
                  {build.source}
                </span>
              </div>

              {/* Preview Canvas (Lazy rendered on hover to prevent WebGL context loss) */}
              <div 
                className="relative h-48 w-full bg-[#060402] border-b border-[#1a2e1a] shrink-0 pointer-events-none overflow-hidden"
              >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                    <BuildPreview objects={build.objects_final} />
                  </div>
              </div>

              {/* Info Area */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[12px] font-black text-[#d4a017] truncate flex-1 pr-2 uppercase tracking-wider">{build.name}</h3>
                  <span className="text-[10px]">{build.icon || '📦'}</span>
                </div>
                <p className="text-[9px] text-[#5a8a5a] mb-3 line-clamp-2 h-6 italic leading-snug">{build.tagline || "Advanced architectural build."}</p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex justify-between text-[10px] font-mono border-b border-[#1a2e1a] pb-1">
                    <span className="text-[#3a6a3a]">OBJECTS:</span>
                    <span className="text-[#27ae60] font-black">{build.objectCount.toLocaleString()}</span>
                  </div>
                  
                  {(() => {
                    const status = onGetValidationStatus?.(build);
                    if (!status) return null;
                    const color = status.health >= 80 ? "text-[#27ae60] border-[#27ae60]" : status.health >= 40 ? "text-[#d4a017] border-[#d4a017]" : "text-[#e74c3c] border-[#e74c3c]";
                    const label = status.health >= 80 ? "VALID ✓" : status.health >= 40 ? "WARN ⚠" : "FAIL ✖";
                    return (
                        <div className={`mt-1 flex justify-between items-center text-[9px] font-black border-b border-[#1a2e1a] pb-1 ${color}`}>
                            <span className="opacity-50">HEALTH:</span>
                            <span>{label} {status.health}%</span>
                        </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button 
                      onClick={() => handleDownload(build, "initc")}
                      className="py-1.5 bg-[#0e1a0e] border border-[#27ae6044] text-[#27ae60] text-[9px] font-black rounded hover:bg-[#27ae60] hover:text-[#080f09] transition-all uppercase tracking-tighter"
                    >
                      Export Init.c
                    </button>
                    <button 
                      onClick={() => handleDownload(build, "json")}
                      className="py-1.5 bg-[#1a0f0a] border border-[#d4a01744] text-[#d4a017] text-[9px] font-black rounded hover:bg-[#d4a017] hover:text-[#080f09] transition-all uppercase tracking-tighter"
                    >
                      Export JSON
                    </button>
                  </div>
                  <button 
                    onClick={() => onLoadIntoEditor?.(build)}
                    className="w-full py-2 bg-[#27ae6011] border border-[#27ae6055] text-[#27ae60] text-[9px] font-black rounded hover:bg-[#27ae60] hover:text-[#080f09] transition-all flex items-center justify-center gap-2 uppercase"
                  >
                    🛠️ Perfect in Architect
                  </button>


                  {(() => {
                      const status = onGetValidationStatus?.(build);
                      if (status?.status === "FAIL") {
                          return (
                              <button 
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    await autoFixBuild(build);
                                    window.location.reload(); 
                                }}
                                className="w-full py-1.5 bg-[#d4a017] text-[#080f09] text-[8px] font-black rounded hover:bg-[#f1c40f] transition-all border border-[#d4a017] uppercase"
                              >
                                ✨ Auto-Fix Build
                              </button>
                          );
                      }
                      return null;
                  })()}
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 border border-[#27ae60] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none shadow-[inset_0_0_20px_rgba(39,174,96,0.2)]" />
            </div>
          ))}
        </div>

        {filteredBuilds.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-[#3a6a3a] opacity-50 uppercase tracking-widest text-[11px] font-black">
            NO BUILDS FOUND IN REGISTRY
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-[#1a2e1a] bg-[#0c1510] flex justify-between items-center text-[9px] text-[#3a6a3a] shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold">{builds.length} BUILDS INTEGRATED</span>
          <div className="w-[1px] h-3 bg-[#1a2e1a]" />
          <span>VAULT: {builds.filter(b => b.source === 'vault').length}</span>
          <span>PREBUILDS: {builds.filter(b => b.source === 'prebuild').length}</span>
          <span>CUSTOM: {builds.filter(b => b.source === 'editor').length}</span>
        </div>
        <div className="italic uppercase">Registry Active // Live Preview Mode</div>
      </div>
    </div>
  );
}
