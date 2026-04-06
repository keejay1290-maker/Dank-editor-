/**
 * DankBasePlanner — Grid-based base layout planner.
 * Draw a base on a tile grid, place walls, gates, towers, tents and
 * storage. Calculates material costs and exports a text layout map.
 */
import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TileType = "empty" | "wall" | "gate" | "tower" | "tent" | "barrel" | "watchtower" | "flag";

interface TileMeta {
  emoji: string;
  label: string;
  color: string;
  cost: { nails: number; planks: number; logs: number; wire: number };
}

const TILES: Record<TileType, TileMeta> = {
  empty:      { emoji: "·",  label: "Empty",      color: "#0a1209", cost: { nails:0, planks:0, logs:0, wire:0 } },
  wall:       { emoji: "█",  label: "Wall",        color: "#5a8a5a", cost: { nails:10, planks:4, logs:2, wire:0 } },
  gate:       { emoji: "▣",  label: "Gate",        color: "#27ae60", cost: { nails:15, planks:6, logs:3, wire:0 } },
  tower:      { emoji: "▲",  label: "Tower",       color: "#3498db", cost: { nails:20, planks:8, logs:4, wire:0 } },
  tent:       { emoji: "⛺", label: "Tent",        color: "#9b59b6", cost: { nails:0, planks:0, logs:0, wire:0 } },
  barrel:     { emoji: "🛢", label: "Barrel",      color: "#e67e22", cost: { nails:0, planks:0, logs:0, wire:0 } },
  watchtower: { emoji: "🗼", label: "Watchtower",  color: "#e74c3c", cost: { nails:30, planks:12, logs:6, wire:0 } },
  flag:       { emoji: "🚩", label: "Flag Pole",   color: "#f39c12", cost: { nails:5, planks:2, logs:1, wire:0 } },
};

const TILE_ORDER: TileType[] = ["empty","wall","gate","tower","tent","barrel","watchtower","flag"];

const GRID_SIZE = 20;

type Grid = TileType[][];

function makeGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("empty") as TileType[]);
}

function calcCosts(grid: Grid): Record<string, number> {
  const totals = { nails: 0, planks: 0, logs: 0, wire: 0 };
  for (const row of grid) {
    for (const cell of row) {
      const c = TILES[cell].cost;
      totals.nails += c.nails;
      totals.planks += c.planks;
      totals.logs += c.logs;
      totals.wire += c.wire;
    }
  }
  return totals;
}

function exportLayout(grid: Grid): string {
  const lines = [
    "# DankBase Layout",
    `# Generated: ${new Date().toLocaleDateString()}`,
    `# Grid: ${GRID_SIZE}x${GRID_SIZE}`,
    "",
    ...grid.map(row => row.map(cell => {
      switch (cell) {
        case "wall": return "#";
        case "gate": return "G";
        case "tower": return "T";
        case "tent": return "t";
        case "barrel": return "B";
        case "watchtower": return "W";
        case "flag": return "F";
        default: return ".";
      }
    }).join("")),
    "",
    "# Legend: # Wall  G Gate  T Tower  t Tent  B Barrel  W Watchtower  F Flag  . Empty",
  ];
  return lines.join("\n");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DankBasePlanner() {
  const [grid, setGrid] = useState<Grid>(makeGrid);
  const [activeTile, setActiveTile] = useState<TileType>("wall");
  const [isDrawing, setIsDrawing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const costs = calcCosts(grid);
  const layout = exportLayout(grid);

  const paint = useCallback((row: number, col: number) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = activeTile;
      return next;
    });
  }, [activeTile]);

  function clearGrid() {
    setGrid(makeGrid());
  }

  function copy() {
    navigator.clipboard.writeText(layout).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function download() {
    const blob = new Blob([layout], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "base_layout.txt";
    a.click();
  }

  // Count tiles
  const tileCounts: Partial<Record<TileType, number>> = {};
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== "empty") tileCounts[cell] = (tileCounts[cell] ?? 0) + 1;
    }
  }

  return (
    <div className="min-h-screen bg-[#080f09] text-[#b8d4b8] font-mono">
      <div className="border-b border-[#1a2e1a] bg-[#0c1510] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px]">← HOME</a>
        <span className="text-[#1a2e1a]">/</span>
        <span className="text-[11px] font-black text-[#27ae60]">🏰 DANKBASE PLANNER</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UNIQUE TOOL</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Grid */}
        <div className="space-y-3">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden">
            <button onClick={() => setShowHow(h => !h)}
              className="w-full flex items-center justify-between px-4 py-2 bg-[#0c1510] text-[11px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-4 py-3 text-[10px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Select a tile type from the palette on the right.</p>
                <p>2. Click or drag on the grid to paint tiles.</p>
                <p>3. Material costs update automatically.</p>
                <p>4. Export the layout as a text map for Discord or notes.</p>
              </div>
            )}
          </div>

          {/* Tile palette */}
          <div className="flex flex-wrap gap-1">
            {TILE_ORDER.map(t => (
              <button key={t} onClick={() => setActiveTile(t)}
                className={`px-2 py-1 text-[10px] font-black rounded border transition-colors ${
                  activeTile === t
                    ? "border-[#27ae60] bg-[#0e2010] text-[#27ae60]"
                    : "border-[#1a2e1a] bg-[#0a1209] text-[#5a8a5a] hover:text-[#b8d4b8]"
                }`}>
                {TILES[t].emoji} {TILES[t].label}
              </button>
            ))}
            <button onClick={clearGrid}
              className="px-2 py-1 text-[10px] font-black rounded border border-[#c0392b] text-[#c0392b] hover:bg-[#1a0a0a] transition-colors ml-auto">
              CLEAR
            </button>
          </div>

          {/* Grid canvas */}
          <div
            className="inline-block border border-[#1a2e1a] rounded overflow-hidden select-none"
            onMouseLeave={() => setIsDrawing(false)}
          >
            {grid.map((row, ri) => (
              <div key={ri} className="flex">
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    className="w-6 h-6 flex items-center justify-center text-[10px] cursor-crosshair border-r border-b border-[#0c1510] transition-colors"
                    style={{ background: TILES[cell].color }}
                    onMouseDown={() => { setIsDrawing(true); paint(ri, ci); }}
                    onMouseEnter={() => { if (isDrawing) paint(ri, ci); }}
                    onMouseUp={() => setIsDrawing(false)}
                  >
                    {cell !== "empty" ? TILES[cell].emoji : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Tile counts */}
          <div className="bg-[#0a1209] border border-[#1a2e1a] rounded p-3">
            <div className="text-[10px] font-black text-[#27ae60] tracking-widest mb-2">PLACED TILES</div>
            {Object.entries(tileCounts).length === 0 ? (
              <div className="text-[9px] text-[#3a6a3a]">No tiles placed yet</div>
            ) : (
              <div className="space-y-1">
                {(Object.entries(tileCounts) as [TileType, number][]).map(([t, count]) => (
                  <div key={t} className="flex items-center justify-between text-[10px]">
                    <span>{TILES[t].emoji} {TILES[t].label}</span>
                    <span className="text-[#27ae60] font-black">×{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Material costs */}
          <div className="bg-[#0a1209] border border-[#1a2e1a] rounded p-3">
            <div className="text-[10px] font-black text-[#27ae60] tracking-widest mb-2">MATERIAL COSTS</div>
            <div className="space-y-1">
              {[
                { label: "🔩 Nails",  value: costs.nails },
                { label: "🪵 Planks", value: costs.planks },
                { label: "🌲 Logs",   value: costs.logs },
                { label: "🔌 Wire",   value: costs.wire },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-[10px]">
                  <span className="text-[#5a8a5a]">{label}</span>
                  <span className={value > 0 ? "text-[#b8d4b8] font-black" : "text-[#3a6a3a]"}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="space-y-2">
            <div className="text-[10px] font-black text-[#27ae60] tracking-widest">EXPORT</div>
            <pre className="bg-[#050c06] border border-[#1a2e1a] rounded p-2 text-[8px] text-[#5a8a5a] overflow-auto max-h-48 whitespace-pre leading-tight">
              {layout}
            </pre>
            <div className="flex gap-2">
              <button onClick={copy}
                className="flex-1 py-1.5 rounded text-[10px] font-black border border-[#27ae60] text-[#27ae60] hover:bg-[#0e2010] transition-colors">
                {copied ? "✅" : "📋 COPY"}
              </button>
              <button onClick={download}
                className="flex-1 py-1.5 rounded text-[10px] font-black border border-[#5a8a5a] text-[#5a8a5a] hover:bg-[#0a1209] transition-colors">
                ⬇ SAVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
