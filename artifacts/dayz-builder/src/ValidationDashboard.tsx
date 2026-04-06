import React, { useState, useEffect, useMemo } from "react";
import { validateAllBuilds } from "@/lib/validateAllBuilds";
import { autoFixBuild } from "@/lib/autoFixBuild";
import { sortBuilds, SortMode } from "@/lib/sortBuilds";

/**
 * 🕵️ VALIDATION DASHBOARD
 * Visual reporting tool for the build fleet's structural health.
 */
export default function ValidationDashboard({ onOpenInSandbox }: { onOpenInSandbox?: (build: any) => void }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [timestamp, setTimestamp] = useState("");
  const [selectedTrace, setSelectedTrace] = useState<any | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("status");

  const runValidation = async () => {
    setLoading(true);
    const data = await validateAllBuilds();
    setResults(data);
    setTimestamp(new Date().toLocaleString());
    setLoading(false);
  };

  const handleFixAll = async () => {
    const failing = results.filter(r => r.status === "FAIL");
    if (failing.length === 0) return;
    
    setFixing(true);
    console.log(`[DASHBOARD] Fixing ${failing.length} builds...`);
    
    for (const res of failing) {
        await autoFixBuild({ id: res.id, name: res.build, shape: res.shape });
    }
    
    await runValidation();
    setFixing(false);
  };

  useEffect(() => {
    const lastReport = localStorage.getItem("DANK_VALIDATION_REPORT");
    if (lastReport) {
        try {
            const data = JSON.parse(lastReport);
            setResults(data.perBuildResults || []);
            setTimestamp(data.timestamp || "");
        } catch (e) {
            runValidation();
        }
    } else {
        runValidation();
    }
  }, []);

  const sortedResults = useMemo(() => {
    return sortBuilds(results, sortMode);
  }, [results, sortMode]);

  const stats = useMemo(() => ({
    total: results.length,
    passed: results.filter(r => r.status === "PASS").length,
    failed: results.filter(r => r.status === "FAIL").length,
    avgHealth: results.length ? (results.reduce((acc, r) => acc + r.health, 0) / results.length).toFixed(1) : 0,
    healthy: results.filter(r => r.health >= 80).length,
    warning: results.filter(r => r.health >= 40 && r.health < 80).length,
    failing: results.filter(r => r.health < 40).length
  }), [results]);

  return (
    <div className="p-6 bg-[#080f08] min-h-screen text-[#b8d4b8] font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-[#1e2a1e] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#27ae60] tracking-tighter uppercase italic">
            🛡️ DANKVAULT™ VALIDATION DASHBOARD
          </h1>
          <p className="text-[10px] text-[#5a8a5a] uppercase font-bold tracking-widest mt-1">
            Structural Integrity & Pipeline Fidelity Reports
          </p>
        </div>
        <div className="text-right flex items-center gap-3">
          <p className="text-[10px] text-[#b8d4b8] opacity-50 uppercase font-black">Last Run: {timestamp || "Never"}</p>
          <button 
            onClick={runValidation}
            disabled={loading || fixing}
            className="px-4 py-1.5 bg-[#27ae60] text-[#080f09] text-[11px] font-black rounded uppercase hover:bg-[#e8b82a] transition-all disabled:opacity-50"
          >
            {loading ? "⏳ Validating..." : "🚀 Run Compliance Pass"}
          </button>
          <button 
            onClick={handleFixAll}
            disabled={fixing || loading || stats.failed === 0}
            className="px-4 py-1.5 bg-[#e74c3c] text-[#080f09] text-[11px] font-black rounded uppercase hover:bg-[#c0392b] transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(231,76,60,0.3)]"
          >
            {fixing ? "🛠️ Fixing Builds..." : "⚡ Fix All Failing Builds"}
          </button>
        </div>
      </header>

      {/* SUMMARY PANEL */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Builds", value: stats.total, color: "text-[#b8d4b8]" },
          { label: "Passed", value: stats.passed, color: "text-[#27ae60]", sub: `${((stats.passed/stats.total)*100).toFixed(1)}%` },
          { label: "Failed", value: stats.failed, color: "text-[#e74c3c]", sub: `${((stats.failed/stats.total)*100).toFixed(1)}%` },
          { label: "Avg Health", value: `${stats.avgHealth}%`, color: "text-[#d4a017]" }
        ].map((s, i) => (
          <div key={i} className="bg-[#0e1a0e] border border-[#1e2a1e] p-4 rounded shadow-lg">
            <p className="text-[10px] uppercase font-black opacity-40 mb-1">{s.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
              {s.sub && <span className="text-[10px] font-bold opacity-30">{s.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* HEALTH DISTRIBUTION */}
      <div className="mb-8 overflow-hidden bg-[#0e1a0e] border border-[#1e2a1e] p-4 rounded">
        <h3 className="text-[10px] uppercase font-black opacity-40 mb-4 tracking-widest">Health Distribution</h3>
        <div className="flex h-8 gap-0.5 rounded-sm overflow-hidden">
          <div style={{ width: `${(stats.healthy/stats.total)*100}%` }} className="bg-[#27ae60] shadow-[0_0_10px_rgba(39,174,96,0.5)]" />
          <div style={{ width: `${(stats.warning/stats.total)*100}%` }} className="bg-[#d4a017] shadow-[0_0_10px_rgba(212,160,23,0.5)]" />
          <div style={{ width: `${(stats.failing/stats.total)*100}%` }} className="bg-[#e74c3c] shadow-[0_0_10px_rgba(231,76,60,0.5)]" />
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-bold opacity-50">
          <span>{stats.healthy} Healthy</span>
          <span>{stats.warning} Warnings</span>
          <span>{stats.failing} Failing</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] uppercase font-black opacity-40 tracking-widest">Build Compliance Table</h3>
        <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold opacity-40">SORT BY:</span>
            <select 
                value={sortMode} 
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-[#0e1a0e] border border-[#1e2a1e] text-[#27ae60] text-[9px] font-black px-2 py-1 rounded outline-none"
            >
                <option value="status">Status (PASS → FAIL)</option>
                <option value="health-desc">Health (High → Low)</option>
                <option value="health-asc">Health (Low → High)</option>
                <option value="object-count">Object Count</option>
                <option value="name">Name</option>
            </select>
        </div>
      </div>

      {/* BUILD TABLE */}
      <div className="bg-[#0e1a0e] border border-[#1e2a1e] rounded overflow-hidden">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead className="bg-[#122212] border-b border-[#1e2a1e]">
            <tr>
              <th className="p-3 uppercase font-black opacity-50">Build Name</th>
              <th className="p-3 uppercase font-black opacity-50">Status</th>
              <th className="p-3 uppercase font-black opacity-50">Health</th>
              <th className="p-3 uppercase font-black opacity-50">Points</th>
              <th className="p-3 uppercase font-black opacity-50">Shape</th>
              <th className="p-3 uppercase font-black opacity-50">Errors</th>
              <th className="p-3 uppercase font-black opacity-50 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((r, i) => (
              <tr key={i} className="border-b border-[#1e2a1e]/30 hover:bg-[#122212] transition-all">
                <td className="p-3 font-bold truncate max-w-[200px]">{r.build}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase ${
                    r.status === "PASS" ? "bg-[#0e2010] text-[#27ae60] border border-[#27ae60]" : "bg-[#201010] text-[#e74c3c] border border-[#e74c3c]"
                  }`}>
                    {r.status} {r.status === "PASS" ? "✓" : "✖"}
                  </span>
                </td>
                <td className={`p-3 font-black ${
                  r.health >= 80 ? "text-[#27ae60]" : r.health >= 40 ? "text-[#d4a017]" : "text-[#e74c3c]"
                }`}>
                  {r.health}/100
                </td>
                <td className="p-3 font-mono opacity-80">{r.objectCount?.toLocaleString()}</td>
                <td className="p-3 italic opacity-60 uppercase text-[9px] font-bold">{r.shape || "raw"}</td>
                <td className="p-3">
                  {r.error && <span className="text-[#e74c3c] font-bold line-clamp-1 truncate max-w-[200px]">{r.error}</span>}
                  {!r.error && <span className="text-[#27ae60] opacity-50">—</span>}
                </td>
                <td className="p-3 text-right">
                  <div className="flex gap-1 justify-end">
                      <button 
                        onClick={() => setSelectedTrace(r)}
                        className="px-2 py-1 bg-[#1e2a1e] text-[9px] font-black uppercase rounded border border-[#27ae6033] hover:border-[#27ae60]"
                      >
                        🔍 Trace
                      </button>
                      <button 
                        onClick={() => onOpenInSandbox?.(r)}
                        className="px-2 py-1 bg-[#0e1a0e] text-[9px] font-black uppercase rounded border border-[#d4a01733] hover:border-[#d4a017] text-[#d4a017]"
                      >
                        🚁 Sandbox
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TRACE VIEWER MODAL */}
      {selectedTrace && (
        <div className="fixed inset-0 bg-[#080f08]/90 backdrop-blur-md flex items-center justify-center p-8 z-50">
          <div className="bg-[#0e1a0e] border-2 border-[#27ae60] w-full max-w-4xl h-[80vh] flex flex-col p-6 rounded shadow-2xl relative">
            <button 
              onClick={() => setSelectedTrace(null)}
              className="absolute top-4 right-4 text-[#e74c3c] font-black text-xl hover:scale-110 transition-all font-mono"
            >
              [X] CLOSE
            </button>
            <h2 className="text-xl font-black text-[#27ae60] mb-2 uppercase italic tracking-tighter">
              ⚔️ PIPELINE TRACE: {selectedTrace.build}
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
                 <div className="bg-[#080f08] p-3 border border-[#1e2a1e] rounded">
                     <p className="text-[9px] uppercase font-black opacity-40">Status</p>
                     <p className={`text-lg font-black ${selectedTrace.status === "PASS" ? "text-[#27ae60]" : "text-[#e74c3c]"}`}>{selectedTrace.status}</p>
                 </div>
                 <div className="bg-[#080f08] p-3 border border-[#1e2a1e] rounded">
                     <p className="text-[9px] uppercase font-black opacity-40">Health Score</p>
                     <p className="text-lg font-black text-[#d4a017]">{selectedTrace.health}/100</p>
                 </div>
                 <div className="bg-[#080f08] p-3 border border-[#1e2a1e] rounded">
                     <p className="text-[9px] uppercase font-black opacity-40">Resolved Shape</p>
                     <p className="text-lg font-black text-[#3498db] uppercase italic">{selectedTrace.shape}</p>
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#080f08] p-4 font-mono text-[11px] border border-[#1e2a1e] rounded">
              <h3 className="text-[#27ae60] font-black mb-2 uppercase border-b border-[#27ae6033] pb-1">Execution Log</h3>
              {selectedTrace.trace.map((t: string, i: number) => (
                <div key={i} className="py-1 border-b border-[#1e2a1e]/30 text-[#b8d4b8] opacity-80">
                  <span className="text-[#27ae60] font-black mr-2">[{i+1}]</span> {t}
                </div>
              ))}
              {selectedTrace.error && (
                <div className="mt-4 p-3 bg-[#301010] border-l-4 border-l-[#e74c3c] text-[#ffaaaa]">
                   <p className="font-black mb-1 uppercase text-xs">❌ Validation Failure</p>
                   <p className="text-[10px] leading-relaxed">{selectedTrace.error}</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
                 <button 
                    onClick={() => onOpenInSandbox?.(selectedTrace)}
                    className="px-6 py-2 bg-[#d4a017] text-[#080f09] font-black uppercase text-[11px] rounded"
                 >
                    🛰️ Run Structural Audit in Sandbox
                 </button>
                 <button 
                    onClick={() => setSelectedTrace(null)}
                    className="px-6 py-2 bg-[#27ae60] text-[#080f09] font-black uppercase text-[11px] rounded"
                 >
                    Acknowledge Report
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
