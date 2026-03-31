/**
 * DankValidator — Multi-format DayZ file validator.
 * Validates init.c (CreateObjectEx), objectSpawnersArr JSON, and XML files.
 * Reports errors, warnings and info with line numbers.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

type InputMode = "initc" | "json" | "xml";

interface ValidationIssue {
  line: number;
  severity: "error" | "warning" | "info";
  message: string;
  code: string;
}

// ─── init.c validator ─────────────────────────────────────────────────────────

const KNOWN_CLASSNAMES = new Set([
  "WoodenCrate","BarrelHoles_Blue","BarrelHoles_Green","BarrelHoles_Red","BarrelHoles_Yellow",
  "Land_Tent_Dome","Land_Tent_Military","Land_Tent_Medic","Land_Tent_East",
  "CamoNet_USMC","CamoNet_East","CamoNet_Camo",
  "Land_Wreck_UralWreck","Land_Wreck_T72Wreck","Land_Wreck_BusWreck",
  "Land_Mil_Watchtower","Land_Mil_Barracks_i","Land_Mil_Barracks_HQ",
  "Land_Mil_Guardhouse","Land_Mil_Tent_Big","Land_Mil_Tent_Small",
  "Land_Mil_Cargo_Tower","Land_Mil_Cargo_House","Land_Mil_Cargo_Cont_Big",
  "Land_Castle_Gate_DE","Land_Castle_Wall_3m_DE","Land_Castle_Wall_Tower_DE",
  "Land_GasTank_Cylindrical","Land_BarrierConcrete_01_DE",
  "SurvivorM_Boris","SurvivorM_Cyril","SurvivorF_Frida","SurvivorF_Gabi",
  "ZmbM_CitizenA","ZmbM_CitizenB","ZmbF_CitizenA","ZmbF_CitizenB",
  "Hen","Pig","Cow","Goat","Sheep","Rabbit","Deer","Boar","Wolf","Bear",
  "M4A1","AKM","AK74","AK101","SKS","Mosin9130","Winchester70","CR527",
  "Glock19","CZ75","Makarov","Deagle","UMP45","MP5K",
  "IZH43","MP133","BK133",
  "Axe_Splitting","Axe_Fire","Shovel","Pickaxe","Sledgehammer",
  "KnifeCarving","KnifeHunting",
]);

function validateInitC(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = text.split("\n");
  const positions = new Map<string, number[]>();

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//")) return;

    const createMatch = trimmed.match(/CreateObjectEx\("([^"]+)",\s*Vector\(([^)]+)\)/);
    if (createMatch) {
      const classname = createMatch[1];
      const coords = createMatch[2].split(",").map(s => parseFloat(s.trim()));

      if (!KNOWN_CLASSNAMES.has(classname)) {
        issues.push({ line: lineNum, severity: "warning", message: `Unknown classname: "${classname}"`, code: "W001" });
      }
      if (coords.length !== 3) {
        issues.push({ line: lineNum, severity: "error", message: "Vector must have exactly 3 components (x, y, z)", code: "E001" });
      } else {
        const [x, y, z] = coords;
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
          issues.push({ line: lineNum, severity: "error", message: "Non-numeric coordinate value", code: "E002" });
        }
        if (x < 0 || x > 16000 || z < 0 || z > 16000) {
          issues.push({ line: lineNum, severity: "warning", message: `Coordinates out of typical map bounds: (${x}, ${y}, ${z})`, code: "W002" });
        }
        if (y > 500) {
          issues.push({ line: lineNum, severity: "warning", message: `Very high Y value (${y}) — object may be floating`, code: "W003" });
        }
        if (y < -10) {
          issues.push({ line: lineNum, severity: "warning", message: `Negative Y value (${y}) — object may be underground`, code: "W004" });
        }
        const key = `${Math.round(x)},${Math.round(z)}`;
        if (!positions.has(key)) positions.set(key, []);
        positions.get(key)!.push(lineNum);
      }
    } else if (trimmed.includes("CreateObjectEx")) {
      issues.push({ line: lineNum, severity: "error", message: "Malformed CreateObjectEx call", code: "E003" });
    }

    if (trimmed.length > 0 && !trimmed.endsWith(";") && !trimmed.startsWith("//") && !trimmed.startsWith("{") && !trimmed.startsWith("}")) {
      issues.push({ line: lineNum, severity: "warning", message: "Line may be missing semicolon", code: "W005" });
    }
  });

  positions.forEach((lineNums, key) => {
    if (lineNums.length > 1) {
      lineNums.forEach(ln => {
        issues.push({ line: ln, severity: "info", message: `Duplicate position ${key} — shared with lines ${lineNums.filter(l => l !== ln).join(", ")}`, code: "I001" });
      });
    }
  });

  return issues.sort((a, b) => a.line - b.line);
}

// ─── JSON objectSpawnersArr validator ────────────────────────────────────────

function validateObjectSpawnersJson(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    issues.push({ line: 1, severity: "error", message: `JSON parse error: ${(e as Error).message}`, code: "J001" });
    return issues;
  }

  const arr = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown>)?.Objects;
  if (!Array.isArray(arr)) {
    issues.push({ line: 1, severity: "error", message: "Expected an array or an object with an 'Objects' array", code: "J002" });
    return issues;
  }

  arr.forEach((obj: unknown, i: number) => {
    const lineNum = i + 1;
    if (typeof obj !== "object" || obj === null) {
      issues.push({ line: lineNum, severity: "error", message: `Item ${i}: not an object`, code: "J003" });
      return;
    }
    const o = obj as Record<string, unknown>;
    if (!o.name && !o.classname) {
      issues.push({ line: lineNum, severity: "error", message: `Item ${i}: missing 'name' or 'classname' field`, code: "J004" });
    }
    const pos = o.pos ?? o.position;
    if (!Array.isArray(pos) || pos.length < 3) {
      issues.push({ line: lineNum, severity: "error", message: `Item ${i}: missing or invalid position array`, code: "J005" });
    } else {
      const [x, , z] = pos as number[];
      if (x < 0 || x > 16000 || z < 0 || z > 16000) {
        issues.push({ line: lineNum, severity: "warning", message: `Item ${i}: position out of typical map bounds`, code: "J006" });
      }
    }
    const ypr = o.ypr ?? o.orientation;
    if (ypr !== undefined && (!Array.isArray(ypr) || ypr.length < 3)) {
      issues.push({ line: lineNum, severity: "warning", message: `Item ${i}: 'ypr'/'orientation' should be a 3-element array`, code: "J007" });
    }
  });

  if (arr.length === 0) {
    issues.push({ line: 1, severity: "info", message: "Array is empty — no objects defined", code: "I002" });
  } else {
    issues.push({ line: 1, severity: "info", message: `${arr.length} objects found`, code: "I003" });
  }

  return issues;
}

// ─── XML validator ────────────────────────────────────────────────────────────

function validateXml(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = text.split("\n");

  // Check for XML declaration
  if (!text.trim().startsWith("<?xml")) {
    issues.push({ line: 1, severity: "warning", message: "Missing XML declaration (<?xml version=\"1.0\"...?>)", code: "X001" });
  }

  // Unmatched tags (simple heuristic)
  const tagStack: { tag: string; line: number }[] = [];
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const openTags = [...line.matchAll(/<([a-zA-Z][a-zA-Z0-9_]*)[^/]*>/g)].map(m => m[1]);
    const closeTags = [...line.matchAll(/<\/([a-zA-Z][a-zA-Z0-9_]*)>/g)].map(m => m[1]);
    const selfClose = [...line.matchAll(/<[a-zA-Z][^>]*\/>/g)];

    for (const tag of openTags) {
      if (!selfClose.some(m => m[0].includes(tag))) {
        tagStack.push({ tag, line: lineNum });
      }
    }
    for (const tag of closeTags) {
      const idx = tagStack.findLastIndex(t => t.tag === tag);
      if (idx === -1) {
        issues.push({ line: lineNum, severity: "error", message: `Unexpected closing tag </${tag}>`, code: "X002" });
      } else {
        tagStack.splice(idx, 1);
      }
    }

    // Check for unescaped & (common mistake)
    if (line.includes("&") && !line.match(/&(amp|lt|gt|quot|apos);/)) {
      issues.push({ line: lineNum, severity: "warning", message: "Possible unescaped '&' — use &amp;", code: "X003" });
    }
  });

  tagStack.forEach(({ tag, line }) => {
    issues.push({ line, severity: "error", message: `Unclosed tag <${tag}>`, code: "X004" });
  });

  if (issues.length === 0) {
    issues.push({ line: 1, severity: "info", message: "XML structure looks valid", code: "I004" });
  }

  return issues;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  error: "#e74c3c", warning: "#f39c12", info: "#3498db",
};
const SEVERITY_BG: Record<string, string> = {
  error: "#1a0a0a", warning: "#1a1200", info: "#0a1220",
};

export default function DankValidator() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<InputMode>("initc");
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">("all");
  const [showHow, setShowHow] = useState(false);

  const issues = useMemo(() => {
    if (!input.trim()) return [];
    if (mode === "initc") return validateInitC(input);
    if (mode === "json") return validateObjectSpawnersJson(input);
    return validateXml(input);
  }, [input, mode]);

  const filtered = useMemo(() =>
    filter === "all" ? issues : issues.filter(i => i.severity === filter),
    [issues, filter]
  );

  const counts = useMemo(() => ({
    error: issues.filter(i => i.severity === "error").length,
    warning: issues.filter(i => i.severity === "warning").length,
    info: issues.filter(i => i.severity === "info").length,
  }), [issues]);

  const objectCount = useMemo(() => {
    if (mode === "initc") return (input.match(/CreateObjectEx/g) ?? []).length;
    if (mode === "json") {
      try {
        const p = JSON.parse(input);
        const arr = Array.isArray(p) ? p : p?.Objects;
        return Array.isArray(arr) ? arr.length : 0;
      } catch { return 0; }
    }
    return (input.match(/<type\s/g) ?? []).length;
  }, [input, mode]);

  const PLACEHOLDERS: Record<InputMode, string> = {
    initc: "Paste init.c content here...",
    json: "Paste objectSpawnersArr JSON here...",
    xml: "Paste types.xml, globals.xml, cfgenvironment.xml, etc...",
  };

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#27ae60] font-black text-[13px] tracking-widest">✅ DANKVALIDATOR</span>
        <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UPGRADED</span>
        {input.trim() && (
          <div className="flex gap-2 ml-2">
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#1a0a0a] text-[#e74c3c] font-bold">{counts.error} errors</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#1a1200] text-[#f39c12] font-bold">{counts.warning} warnings</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#0a1220] text-[#3498db] font-bold">{counts.info} info</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#0e1a0e] text-[#27ae60] font-bold">{objectCount} items</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Input */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-[#1a2e1a]">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-2">
            <span className="text-[10px] text-[#5a8a5a]">MODE:</span>
            {(["initc","json","xml"] as InputMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-2 py-0.5 text-[9px] font-bold rounded ${mode === m ? "bg-[#27ae60] text-[#080f09]" : "text-[#3a6a3a] hover:text-[#5a8a5a]"}`}>
                {m === "initc" ? "init.c" : m === "json" ? "JSON Spawner" : "XML"}
              </button>
            ))}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={PLACEHOLDERS[mode]}
            className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[10px] font-mono p-3 resize-none border-0 outline-none leading-relaxed placeholder:text-[#1a2e1a]"
          />
        </div>

        {/* Issues */}
        <div className="w-96 shrink-0 flex flex-col min-h-0">
          {/* HOW TO USE */}
          <div className="shrink-0 border-b border-[#1a2e1a] overflow-hidden">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0c1510] text-[10px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-3 py-2 text-[9px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Select mode: init.c, JSON Spawner, or XML.</p>
                <p>2. Paste your file content into the left panel.</p>
                <p>3. Issues appear instantly with line numbers and codes.</p>
                <p>4. Filter by severity: errors, warnings, or info.</p>
                <p>5. Fix issues in your file and re-paste to re-validate.</p>
              </div>
            )}
          </div>
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-2">
            <span className="text-[10px] text-[#5a8a5a]">ISSUES</span>
            <div className="flex gap-1 ml-auto">
              {(["all","error","warning","info"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded ${filter === f ? "bg-[#1a2e1a] text-[#b8d4b8]" : "text-[#3a6a3a] hover:text-[#5a8a5a]"}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!input.trim() && (
              <div className="flex items-center justify-center h-full text-[#3a6a3a] text-[11px]">
                Paste content to validate
              </div>
            )}
            {input.trim() && filtered.length === 0 && (
              <div className="flex items-center justify-center h-full text-[#27ae60] text-[11px]">
                ✅ No {filter === "all" ? "" : filter} issues found
              </div>
            )}
            {filtered.map((issue, i) => (
              <div key={i} className="border-b border-[#0e1a0e] px-3 py-2" style={{ backgroundColor: SEVERITY_BG[issue.severity] }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-bold" style={{ color: SEVERITY_COLORS[issue.severity] }}>{issue.severity.toUpperCase()}</span>
                  <span className="text-[9px] text-[#3a6a3a]">Line {issue.line}</span>
                  <span className="text-[9px] text-[#1a2e1a] ml-auto">{issue.code}</span>
                </div>
                <div className="text-[10px] text-[#b8d4b8]">{issue.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
