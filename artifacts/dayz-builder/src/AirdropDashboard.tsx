import React, { useState, useEffect, useMemo, Suspense } from "react";
import { listAirdrops, loadAirdrop, saveAirdrop, generateRandomAirdrop, AirdropFile, AirdropObject } from "@/lib/airdropManager";
import BunkerPreview3D from "./BunkerPreview3D"; // Reusing the high-fidelity renderer
import { getMimic } from "@/lib/shapeMimic";

export default function AirdropDashboard() {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [airdrop, setAirdrop] = useState<AirdropFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    refreshFiles();
  }, []);

  async function refreshFiles() {
    try {
      const list = await listAirdrops();
      setFiles(list);
      if (list.length > 0 && !selectedFile) {
        handleSelectFile(list[0]);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleSelectFile(name: string) {
    setLoading(true);
    setSelectedFile(name);
    try {
      const data = await loadAirdrop(name);
      setAirdrop(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRandomize() {
    if (!airdrop) return;
    const randomized = generateRandomAirdrop(airdrop);
    setAirdrop(randomized);
    showToast("✓ Randomized build (template-seeded)");
  }

  async function handleSave() {
    if (!selectedFile || !airdrop) return;
    try {
      await saveAirdrop(selectedFile, airdrop);
      showToast("✓ Saved successfully to DayZ/Editor/Custom/airdrops");
    } catch (e: any) {
      setError(e.message);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleDownload() {
    if (!airdrop || !selectedFile) return;
    const blob = new Blob([JSON.stringify(airdrop, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("✓ File downloaded locally");
  }

  // Adapter to convert AirdropObject[] to PlacedObject[] for the BunkerPreview3D
  const previewLayout = useMemo(() => {
    if (!airdrop) return null;
    return {
      objects: airdrop.Objects.map((obj, i) => ({
        classname: obj.name,
        dx: obj.pos[0],
        dy: obj.pos[1],
        dz: obj.pos[2],
        yaw: obj.ypr[1],
        pitch: obj.ypr[0],
        roll: obj.ypr[2],
        note: `Object ${i+1}`,
        level: 0,
        section: (obj.name.toLowerCase().includes('loot') || obj.name.toLowerCase().includes('barrel')) ? 'loot' : 'exterior' as any
      }))
    };
  }, [airdrop]);

  return (
    <div className="flex h-full bg-[#080f09] text-[#3a6a3a] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#1a2e1a] bg-[#0a1209] flex flex-col p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#5a8a5a] mb-4">Airdrop Configs</div>
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
          {files.map(f => (
            <button 
              key={f}
              onClick={() => handleSelectFile(f)}
              className={`w-full text-left px-3 py-2 text-[11px] rounded transition-colors ${selectedFile === f ? "bg-[#1a2e1a] text-[#27ae60] font-bold" : "hover:bg-[#111c11]"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button 
          onClick={refreshFiles}
          className="mt-4 w-full py-2 border border-[#1a2e1a] text-[10px] uppercase font-bold hover:bg-[#1a2e1a] transition-all"
        >
          Refresh Folder
        </button>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="h-12 border-b border-[#1a2e1a] flex items-center justify-between px-6 bg-[#0a1209]">
          <div className="flex items-center gap-4">
            <span className="text-[#27ae60] font-bold uppercase tracking-tighter text-[13px]">📦 Airdrop Maker</span>
            <span className="text-[10px] text-[#3a6a3a]">{selectedFile || "No file selected"}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRandomize}
              className="px-4 py-1.5 bg-[#d4a017] text-[#0a0f0a] text-[10px] font-bold uppercase rounded-sm hover:scale-105 active:scale-95 transition-all"
            >
              🎲 Random Button
            </button>
            <button 
              onClick={handleDownload}
              className="px-4 py-1.5 bg-[#3498db] text-[#0a0f0a] text-[10px] font-bold uppercase rounded-sm hover:bg-[#2980b9] transition-all"
            >
              📥 Download
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#27ae60] text-[#0a0f0a] text-[10px] font-bold uppercase rounded-sm hover:bg-[#2ecc71] transition-all"
            >
              💾 Save Fix
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#060402] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#060402]/80 z-20">
              <div className="text-[#27ae60] animate-pulse">LOADING ASSETS...</div>
            </div>
          ) : previewLayout ? (
             <BunkerPreview3D layout={previewLayout as any} component="airdrop" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#1a2e1a] text-[10px] uppercase tracking-widest">
              Select an airdrop file to preview 3D mimics
            </div>
          )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-6 bg-[#0a1209]/90 border border-[#1a2e1a] p-4 text-[10px] min-w-[150px] z-10">
          <div className="mb-2 text-[#5a8a5a] text-[8px] uppercase font-bold tracking-widest">Map Legend</div>
          <div className="space-y-1.5">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#4a9a4a] border border-black/50"></div>
                <span>Exterior Architecture</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#a88d32] border border-black/50"></div>
                <span>Loot Points / Barrels</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#555555] border border-black/50"></div>
                <span>Industrial Objects</span>
             </div>
          </div>
        </div>

        {/* Validation Overlay */}
        <div className="absolute bottom-4 right-4 bg-[#0a1209]/90 border border-[#1a2e1a] p-4 text-[10px] min-w-[200px] z-10">
          <div className="mb-2 text-[#5a8a5a] text-[8px] uppercase">Integrity Score</div>
          <div className="space-y-1">
             <div className="flex justify-between">
                <span>Objects:</span>
                <span className={ (airdrop?.Objects.length || 0) > 1200 ? "text-[#e74c3c]" : "text-[#27ae60]" }>
                   {airdrop?.Objects.length || 0} / 1200
                </span>
             </div>
             <div className="flex justify-between">
                <span>Visual Fidelity:</span>
                <span className="text-[#27ae60]">HIGH (Geometric Mimics)</span>
             </div>
             <div className="flex justify-between">
                <span>Local FS Sync:</span>
                <span className="text-[#27ae60]">ACTIVE</span>
             </div>
          </div>
        </div>

        {error && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#e74c3c] text-white px-4 py-2 rounded text-[11px] font-bold z-50">
            ERROR: {error}
          </div>
        )}

        {toast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#27ae60] text-white px-4 py-2 rounded text-[11px] font-bold z-50 animate-bounce">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
