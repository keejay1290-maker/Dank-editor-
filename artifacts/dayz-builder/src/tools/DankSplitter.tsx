/**
 * DankSplitter — Split large init.c or objectSpawnersArr JSON files into chunks.
 * Auto-detects format from input content. Downloads with correct extension.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

type DetectedFormat = "initc" | "json" | "unknown";

interface Chunk {
  index: number;
  content: string;
}

function detectFormat(input: string): DetectedFormat {
  const trimmed = input.trim();
  if (!trimmed) return "unknown";
  // JSON objectSpawnersArr: starts with { "Objects": or [ and contains "pos"
  if (
    (trimmed.startsWith("{") && trimmed.includes('"Objects"')) ||
    (trimmed.startsWith("[") && trimmed.includes('"pos"'))
  ) return "json";
  // init.c: contains CreateObjectEx
  if (trimmed.includes("CreateObjectEx")) return "initc";
  // Fallback: if it parses as JSON with an Objects array
  try {
    const p = JSON.parse(trimmed);
    if (Array.isArray(p) || (typeof p === "object" && p !== null && "Objects" in p)) return "json";
  } catch { /* not JSON */ }
  return "unknown";
}

function splitInitC(input: string, chunkSize: number): Chunk[] {
  const lines = input.split("\n");
  const chunks: Chunk[] = [];
  let current: string[] = [];
  let count = 0;

  for (const line of lines) {
    current.push(line);
    if (line.includes("CreateObjectEx")) {
      count++;
      if (count >= chunkSize) {
        chunks.push({ index: chunks.length, content: current.join("\n") });
        current = [];
        count = 0;
      }
    }
  }
  if (current.some(l => l.trim())) {
    chunks.push({ index: chunks.length, content: current.join("\n") });
  }
  return chunks;
}

function splitJson(input: string, chunkSize: number): Chunk[] {
  let objects: unknown[];
  try {
    const parsed = JSON.parse(input.trim());
    objects = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown[]>).Objects ?? [];
  } catch {
    return [];
  }

  const chunks: Chunk[] = [];
  for (let i = 0; i < objects.length; i += chunkSize) {
    const slice = objects.slice(i, i + chunkSize);
    const total = Math.ceil(objects.length / chunkSize);
    const chunkNum = chunks.length + 1;
    const content = JSON.stringify(
      { _comment: `Dank's Dayz Studio — chunk ${chunkNum}/${total}`, Objects: slice },
      null, 2
    );
    chunks.push({ index: chunks.length, content });
  }
  return chunks;
}

export default function DankSplitter() {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [chunkSize, setChunkSize] = useState(50);
  const [selectedChunk, setSelectedChunk] = useState(0);
  const [showHow, setShowHow] = useState(false);

  const detectedFormat = useMemo(() => detectFormat(input), [input]);

  const chunks = useMemo((): Chunk[] => {
    if (!input.trim()) return [];
    if (detectedFormat === "initc") return splitInitC(input, chunkSize);
    if (detectedFormat === "json") return splitJson(input, chunkSize);
    return [];
  }, [input, chunkSize, detectedFormat]);

  const safeChunk = Math.min(selectedChunk, Math.max(0, chunks.length - 1));
  const currentContent = chunks[safeChunk]?.content ?? "";
  const ext = detectedFormat === "json" ? "json" : "c";

  function downloadChunk(idx: number) {
    const c = chunks[idx];
    if (!c) return;
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([c.content], { type: "text/plain" })),
      download: `chunk_${String(idx + 1).padStart(3, "0")}.${ext}`,
    });
    a.click();
  }

  function downloadAll() {
    chunks.forEach((_, i) => {
      setTimeout(() => downloadChunk(i), i * 120);
    });
  }

  const formatBadgeColor = detectedFormat === "initc" ? "#27ae60" : detectedFormat === "json" ? "#3498db" : "#5a8a5a";
  const formatBadgeLabel = detectedFormat === "initc" ? "init.c" : detectedFormat === "json" ? "JSON Spawner" : "Paste content to detect";

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[9px] text-[#3a6a3a] font-bold tracking-widest">DANK'S DAYZ STUDIO</span>
        <span className="text-[#16a085] font-black text-[13px] tracking-widest">✂ DANKSPLITTER</span>
        {/* Detected format badge */}
        <span className="px-2 py-0.5 rounded text-[9px] font-black border"
          style={{ color: formatBadgeColor, borderColor: formatBadgeColor + "66", background: formatBadgeColor + "11" }}>
          {formatBadgeLabel}
        </span>
        <div className="ml-auto flex gap-2">
          {chunks.length > 0 && (
            <>
              <button onClick={() => downloadChunk(safeChunk)}
                className="px-3 py-1 bg-[#0e2010] border border-[#27ae60] text-[#27ae60] text-[10px] font-bold rounded hover:bg-[#1a3a1a]">
                ⬇ CHUNK {safeChunk + 1}
              </button>
              <button onClick={downloadAll}
                className="px-3 py-1 bg-[#16a085] text-white text-[10px] font-bold rounded hover:bg-[#1abc9c]">
                ⬇ ALL {chunks.length} CHUNKS
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Config */}
        <div className="w-52 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-4 flex flex-col gap-4">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0c1510] text-[10px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-3 py-2 text-[9px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Paste your init.c or objectSpawnersArr JSON content.</p>
                <p>2. Format is auto-detected — shown in the header badge.</p>
                <p>3. Set chunk size (objects per file).</p>
                <p>4. Select a chunk to preview, then download individually or all at once.</p>
                <p>5. JSON chunks download as .json, init.c chunks as .c</p>
              </div>
            )}
          </div>

          <div>
            <div className="text-[9px] text-[#16a085] font-bold mb-2 tracking-widest">CHUNK SIZE</div>
            <div className="text-[9px] text-[#5a8a5a] mb-1">
              {detectedFormat === "json" ? "Objects per chunk" : "CreateObjectEx calls per chunk"}
            </div>
            <input type="number" value={chunkSize} min={1} max={1000}
              onChange={e => setChunkSize(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1 rounded focus:outline-none focus:border-[#16a085]" />
            <input type="range" min={10} max={500} step={10} value={chunkSize}
              onChange={e => setChunkSize(Number(e.target.value))}
              className="w-full mt-2 accent-[#16a085]" />
          </div>

          {chunks.length > 0 && (
            <div>
              <div className="text-[9px] text-[#16a085] font-bold mb-2 tracking-widest">
                CHUNKS ({chunks.length})
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {chunks.map((_, i) => (
                  <button key={i} onClick={() => setSelectedChunk(i)}
                    className={`w-full text-left px-2 py-1 rounded text-[9px] transition-colors ${
                      i === safeChunk
                        ? "bg-[#16a085] text-[#080f09] font-bold"
                        : "text-[#5a8a5a] hover:bg-[#1a2e1a]"
                    }`}>
                    Chunk {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chunks.length > 0 && (
            <div className="text-[9px] text-[#3a6a3a] mt-auto">
              {detectedFormat === "json"
                ? `${chunks.reduce((n, c) => { try { return n + (JSON.parse(c.content).Objects?.length ?? 0); } catch { return n; } }, 0)} objects total`
                : `${(input.match(/CreateObjectEx/g) ?? []).length} objects total`
              }
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-[#1a2e1a]">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">
            INPUT — paste init.c or objectSpawnersArr JSON
          </div>
          <textarea value={input} onChange={e => { setInput(e.target.value); setSelectedChunk(0); }}
            placeholder={"Paste init.c (CreateObjectEx lines) or objectSpawnersArr JSON here..."}
            className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[10px] font-mono p-3 resize-none border-0 outline-none leading-relaxed placeholder:text-[#1a2e1a]" />
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">
            {chunks.length > 0 ? `PREVIEW — Chunk ${safeChunk + 1} of ${chunks.length}` : "PREVIEW"}
          </div>
          <textarea readOnly value={currentContent}
            className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[10px] font-mono p-3 resize-none border-0 outline-none leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
