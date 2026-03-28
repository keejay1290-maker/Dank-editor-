import { useState, useRef, useEffect, useCallback } from "react";
import { getShapePoints, applyTransform, Point3D } from "@/lib/shapeGenerators";
import { SHAPE_DEFS, SHAPE_GROUPS, ParamDef } from "@/lib/shapeParams";
import { DAYZ_OBJECTS, OBJECT_GROUPS, formatInitC, formatJSON, HELPER_FUNC } from "@/lib/dayzObjects";

type EditorMode = "architect" | "text";
type OutputFormat = "initc" | "json";
type FillMode = "frame" | "fill";

// ─── TEXT MAKER PRESETS ──────────────────────────────────────────────────────
const TEXT_FONT: Record<string, number[][]> = {
  A: [[0,0],[0.5,1],[1,0],[0.2,0.5],[0.8,0.5]],
  B: [[0,0],[0,1],[0.6,0.8],[0.7,0.6],[0.6,0.4],[0,0.5],[0.6,0.4],[0.7,0.2],[0.6,0]],
  C: [[1,0.8],[0.5,1],[0,0.5],[0.5,0],[1,0.2]],
  D: [[0,0],[0,1],[0.5,1],[1,0.5],[0.5,0]],
  E: [[1,0],[0,0],[0,1],[1,1],[0,0.5],[0.7,0.5]],
  F: [[0,0],[0,1],[1,1],[0,0.5],[0.7,0.5]],
  G: [[1,0.8],[0.5,1],[0,0.5],[0.5,0],[1,0.2],[1,0.5],[0.6,0.5]],
  H: [[0,0],[0,1],[1,1],[1,0],[0,0.5],[1,0.5]],
  I: [[0,0],[1,0],[0.5,0],[0.5,1],[0,1],[1,1]],
  J: [[0,0.2],[0.5,0],[1,0.2],[1,1],[0,1]],
  K: [[0,0],[0,1],[0.5,0.5],[1,1],[0.5,0.5],[1,0]],
  L: [[0,1],[0,0],[1,0]],
  M: [[0,0],[0,1],[0.5,0.5],[1,1],[1,0]],
  N: [[0,0],[0,1],[1,0],[1,1]],
  O: [[0.5,1],[1,0.5],[0.5,0],[0,0.5],[0.5,1]],
  P: [[0,0],[0,1],[0.7,1],[1,0.8],[0.7,0.5],[0,0.5]],
  Q: [[0.5,1],[1,0.5],[0.5,0],[0,0.5],[0.5,1],[0.8,0.2],[1,0]],
  R: [[0,0],[0,1],[0.7,1],[1,0.8],[0.7,0.5],[0,0.5],[0.5,0.5],[1,0]],
  S: [[1,0.8],[0.5,1],[0,0.7],[0.5,0.5],[1,0.3],[0.5,0],[0,0.2]],
  T: [[0,1],[1,1],[0.5,1],[0.5,0]],
  U: [[0,1],[0,0.2],[0.5,0],[1,0.2],[1,1]],
  V: [[0,1],[0.5,0],[1,1]],
  W: [[0,1],[0.25,0],[0.5,0.4],[0.75,0],[1,1]],
  X: [[0,0],[1,1],[0.5,0.5],[0,1],[1,0]],
  Y: [[0,1],[0.5,0.5],[1,1],[0.5,0.5],[0.5,0]],
  Z: [[0,1],[1,1],[0,0],[1,0]],
  "0": [[0.5,1],[1,0.5],[0.5,0],[0,0.5],[0.5,1]],
  "1": [[0.2,0.8],[0.5,1],[0.5,0],[0.2,0],[0.8,0]],
  "2": [[0,0.8],[0.5,1],[1,0.7],[0,0],[1,0]],
  "3": [[0,0.8],[0.5,1],[1,0.5],[0.5,0.5],[1,0.2],[0.5,0],[0,0.2]],
  "!": [[0.5,1],[0.5,0.3],[0.5,0.1]],
  "?": [[0,0.8],[0.5,1],[1,0.7],[0.5,0.4],[0.5,0.1]],
  " ": [],
};

function getTextPoints(text: string, letterH: number, letterSpacing: number, depth: number, rings: number, scale: number): Point3D[] {
  const pts: Point3D[] = [];
  let xOffset = 0;
  for (const ch of text.toUpperCase()) {
    const segs = TEXT_FONT[ch] || TEXT_FONT[" "];
    for (let ri = 0; ri <= rings; ri++) {
      const y = depth * ri / rings;
      for (let i = 0; i < segs.length - 1; i++) {
        const [x1, z1] = segs[i];
        const [x2, z2] = segs[i + 1];
        const dist = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const n = Math.max(1, Math.ceil(dist * letterH / (scale * 3)));
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          pts.push({
            x: (xOffset + (x1 + (x2 - x1) * t) * letterH) * scale,
            y,
            z: (z1 + (z2 - z1) * t) * letterH * scale,
          });
        }
      }
    }
    xOffset += letterH * 1.2;
    if (ch === " ") xOffset -= letterH * 0.5;
  }
  return pts;
}

// ─── 3D PREVIEW ─────────────────────────────────────────────────────────────
function use3DPreview(canvasRef: React.RefObject<HTMLCanvasElement>, points: Point3D[], scale: number) {
  const rotRef = useRef({ x: -0.4, y: 0.5 });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const zoomRef = useRef(1);
  const animRef = useRef<number | null>(null);
  const autoRotRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (points.length === 0) {
      ctx.fillStyle = "rgba(100,80,40,0.15)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#6a5a3a";
      ctx.font = "14px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText("[ Click Preview 3D to render ]", W / 2, H / 2);
      return;
    }

    // Project 3D → 2D with simple perspective
    const rx = rotRef.current.x, ry = rotRef.current.y;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const zoom = zoomRef.current;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    });
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;
    const spread = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
    const baseZoom = Math.min(W, H) * 0.4 / spread * zoom;

    ctx.fillStyle = "#060402";
    ctx.fillRect(0, 0, W, H);

    const projected: { sx: number; sy: number; depth: number }[] = points.map(p => {
      const lx = (p.x - cx) * scale, ly = (p.y - cy) * scale, lz = (p.z - cz) * scale;
      const ry1 = lx * cosY + lz * sinY;
      const rz1 = -lx * sinY + lz * cosY;
      const ry2 = ly * cosX - rz1 * sinX;
      const rz2 = ly * sinX + rz1 * cosX;
      const fov = 500;
      const sc = fov / (fov + rz2 + spread * 2);
      return {
        sx: W / 2 + ry1 * baseZoom * sc,
        sy: H / 2 - ry2 * baseZoom * sc,
        depth: rz2,
      };
    });

    // Sort by depth for painter's algo
    const sorted = projected.map((p, i) => ({ ...p, i })).sort((a, b) => b.depth - a.depth);

    sorted.forEach(({ sx, sy, depth }) => {
      const maxDepth = spread;
      const t = Math.max(0, Math.min(1, (depth + maxDepth) / (2 * maxDepth)));
      const r = Math.round(180 * t + 30 * (1 - t));
      const g = Math.round(140 * t + 80 * (1 - t));
      const b = Math.round(20 * t + 10 * (1 - t));
      const alpha = 0.6 + 0.4 * t;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(1, 1.8 * zoom), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    });
  }, [points, scale, canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onDown = (e: MouseEvent) => {
      dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
      autoRotRef.current = false;
    };
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      rotRef.current.y += dx * 0.01;
      rotRef.current.x += dy * 0.01;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      draw();
    };
    const onUp = () => { dragRef.current.dragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.max(0.2, zoomRef.current * (e.deltaY > 0 ? 0.9 : 1.1));
      draw();
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragRef.current = { dragging: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.dragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragRef.current.lastX;
      const dy = e.touches[0].clientY - dragRef.current.lastY;
      rotRef.current.y += dx * 0.01;
      rotRef.current.x += dy * 0.01;
      dragRef.current.lastX = e.touches[0].clientX;
      dragRef.current.lastY = e.touches[0].clientY;
      draw();
    };
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("mouseleave", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouch);
    canvas.addEventListener("touchmove", onTouchMove);
    canvas.addEventListener("touchend", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mouseleave", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  return { draw, rotRef, zoomRef };
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState<EditorMode>("architect");

  // Architect state
  const [shapeType, setShapeType] = useState("deathstar");
  const [params, setParams] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    SHAPE_DEFS["deathstar"].params.forEach(p => { defaults[p.id] = p.val; });
    return defaults;
  });
  const [objClass, setObjClass] = useState("StaticObj_Container_1D");
  const [posX, setPosX] = useState(12000);
  const [posY, setPosY] = useState(150);
  const [posZ, setPosZ] = useState(12600);
  const [rotY, setRotY] = useState(0);
  const [scaleVal, setScaleVal] = useState(1.0);
  const [fillMode, setFillMode] = useState<FillMode>("frame");
  const [format, setFormat] = useState<OutputFormat>("initc");
  const [cePersist, setCePersist] = useState(0);
  const [includeHelper, setIncludeHelper] = useState(true);
  const [extraObjs, setExtraObjs] = useState("");
  const [stackY, setStackY] = useState(0);
  const [output, setOutput] = useState("");
  const [points3D, setPoints3D] = useState<Point3D[]>([]);
  const [previewScale, setPreviewScale] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [toast, setToast] = useState("");

  // Text Maker state
  const [textInput, setTextInput] = useState("DAYZ");
  const [textObj, setTextObj] = useState("StaticObj_Container_1D");
  const [textScale, setTextScale] = useState(1.0);
  const [textLetterH, setTextLetterH] = useState(10);
  const [textSpacing, setTextSpacing] = useState(1.2);
  const [textDepth, setTextDepth] = useState(8);
  const [textRings, setTextRings] = useState(2);
  const [textPosX, setTextPosX] = useState(12000);
  const [textPosY, setTextPosY] = useState(150);
  const [textPosZ, setTextPosZ] = useState(12600);
  const [textFormat, setTextFormat] = useState<OutputFormat>("initc");
  const [textOutput, setTextOutput] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { draw, rotRef, zoomRef } = use3DPreview(canvasRef, points3D, previewScale);

  // Auto-rotate
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    if (autoRotate) {
      const loop = () => {
        rotRef.current.y += 0.008;
        draw();
        animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
    } else if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [autoRotate, draw, rotRef]);

  // Canvas resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) { canvas.width = rect.width; canvas.height = rect.height; }
      draw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const onShapeChange = (st: string) => {
    setShapeType(st);
    const newParams: Record<string, number> = {};
    (SHAPE_DEFS[st]?.params || []).forEach(p => { newParams[p.id] = p.val; });
    setParams(newParams);
  };

  const setParam = (id: string, v: number) => {
    setParams(prev => ({ ...prev, [id]: v }));
  };

  const previewShape = () => {
    const rawPts = getShapePoints(shapeType, params);
    setPoints3D(rawPts);
    setPreviewScale(scaleVal);
    draw();
  };

  const generate = () => {
    const rawPts = getShapePoints(shapeType, params);
    setPoints3D(rawPts);
    setPreviewScale(scaleVal);

    const extras = extraObjs.split(",").map(s => s.trim()).filter(Boolean);
    const lines: string[] = [];
    let objCount = 0;

    if (format === "initc" && includeHelper) {
      lines.push(HELPER_FUNC);
    }
    if (format === "initc") {
      lines.push(`// ---- Structural Details ----`);
      lines.push(`// Architecture: ${SHAPE_DEFS[shapeType]?.label || shapeType}`);
      lines.push(`// Asset Used: ${objClass}`);
      lines.push(`// Component Count: (generated)`);
      lines.push(`// Base Coordinate: <${posX}, ${posY}, ${posZ}>`);
      lines.push(`// --------------------------`);
      lines.push(``);
    }

    // Apply fill mode — for frame only use shell; for fill add interior points
    let ptsToUse = rawPts;
    if (fillMode === "fill") {
      // Add interior fill: for each raw point, also add intermediate points toward center
      const extras2: Point3D[] = [];
      const cx = rawPts.reduce((s, p) => s + p.x, 0) / rawPts.length;
      const cz = rawPts.reduce((s, p) => s + p.z, 0) / rawPts.length;
      rawPts.forEach(p => {
        for (let t = 0.25; t < 1; t += 0.25) {
          extras2.push({ x: p.x + (cx - p.x) * t, y: p.y, z: p.z + (cz - p.z) * t });
        }
      });
      ptsToUse = [...rawPts, ...extras2];
    }

    const jsonObjects: object[] = [];

    ptsToUse.forEach(pt => {
      const sx = pt.x * scaleVal, sy = pt.y * scaleVal, sz = pt.z * scaleVal;
      const r = rotY * Math.PI / 180;
      const wx = sx * Math.cos(r) - sz * Math.sin(r) + posX;
      const wy = sy + posY;
      const wz = sx * Math.sin(r) + sz * Math.cos(r) + posZ;
      const yawDeg = rotY;

      if (format === "initc") {
        lines.push(formatInitC(objClass, wx, wy, wz, 0, yawDeg, 0, scaleVal));
        objCount++;
        extras.forEach((ex, ei) => {
          lines.push(formatInitC(ex, wx, wy + stackY * (ei + 1), wz, 0, yawDeg, 0, scaleVal));
          objCount++;
        });
      } else {
        jsonObjects.push({
          name: objClass,
          pos: [parseFloat(wx.toFixed(6)), parseFloat(wy.toFixed(6)), parseFloat(wz.toFixed(6))],
          ypr: [parseFloat(yawDeg.toFixed(6)), 0.0, 0.0],
          scale: parseFloat(scaleVal.toFixed(6)),
          enableCEPersistency: cePersist,
          customString: ""
        });
        objCount++;
        extras.forEach((ex, ei) => {
          jsonObjects.push({
            name: ex,
            pos: [parseFloat(wx.toFixed(6)), parseFloat((wy + stackY * (ei + 1)).toFixed(6)), parseFloat(wz.toFixed(6))],
            ypr: [parseFloat(yawDeg.toFixed(6)), 0.0, 0.0],
            scale: parseFloat(scaleVal.toFixed(6)),
            enableCEPersistency: cePersist,
            customString: ""
          });
          objCount++;
        });
      }
    });

    let result = "";
    if (format === "initc") {
      result = lines.join("\n");
    } else {
      result = JSON.stringify({ Objects: jsonObjects }, null, 2);
    }
    setOutput(result);
    showToast(`✓ Generated ${objCount} objects`);
  };

  const generateText = () => {
    const rawPts = getTextPoints(textInput, textLetterH, textSpacing, textDepth, textRings, 1.0);
    setPoints3D(rawPts);
    setPreviewScale(textScale);

    const lines: string[] = [];
    const jsonObjects: object[] = [];

    if (textFormat === "initc") {
      lines.push(HELPER_FUNC);
      lines.push(`// ---- Text: "${textInput}" ----`);
      lines.push(`// Object: ${textObj}`);
      lines.push(``);
    }

    rawPts.forEach(pt => {
      const sx = pt.x * textScale, sy = pt.y * textScale, sz = pt.z * textScale;
      const wx = sx + textPosX, wy = sy + textPosY, wz = sz + textPosZ;
      if (textFormat === "initc") {
        lines.push(formatInitC(textObj, wx, wy, wz, 0, 0, 0, textScale));
      } else {
        jsonObjects.push({
          name: textObj,
          pos: [parseFloat(wx.toFixed(6)), parseFloat(wy.toFixed(6)), parseFloat(wz.toFixed(6))],
          ypr: [0.0, 0.0, 0.0],
          scale: parseFloat(textScale.toFixed(6)),
          enableCEPersistency: 0,
          customString: ""
        });
      }
    });

    setTextOutput(textFormat === "initc" ? lines.join("\n") : JSON.stringify({ Objects: jsonObjects }, null, 2));
    showToast(`✓ Text generated: ${rawPts.length} objects`);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => showToast("✓ Copied!"));
  };

  const downloadCode = (code: string, ext: string, name: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const currentParamDefs: ParamDef[] = SHAPE_DEFS[shapeType]?.params || [];

  return (
    <div className="flex flex-col h-screen bg-[#0a0804] text-[#c8b99a] font-mono overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[#2e2518] bg-[#12100a] shrink-0">
        <div>
          <div className="text-[#d4a017] font-bold text-lg tracking-widest">
            DANK <span className="text-[#c0392b]">DAYZ</span>
            <span className="ml-2 text-[10px] border border-[#8b1a1a] text-[#c0392b] px-1.5 py-0.5 rounded-sm">v3</span>
          </div>
          <div className="text-[#6a5a3a] text-[10px] tracking-widest">ULTIMATE BUILDER — SHAPES · TUNNELS · TEXT · MECHS</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex gap-1 border border-[#2e2518] rounded-sm p-1">
            <button
              onClick={() => setMode("architect")}
              className={`px-3 py-1 text-xs rounded-sm font-bold tracking-wider transition-all ${mode === "architect" ? "bg-[#d4a017] text-[#0a0804]" : "text-[#6a5a3a] hover:text-[#c8b99a]"}`}
            >
              🏗 ARCHITECT
            </button>
            <button
              onClick={() => setMode("text")}
              className={`px-3 py-1 text-xs rounded-sm font-bold tracking-wider transition-all ${mode === "text" ? "bg-[#1a3a5a] text-[#c8b99a]" : "text-[#6a5a3a] hover:text-[#c8b99a]"}`}
            >
              ✏ TEXT MAKER
            </button>
          </div>
          <div className="pulse-dot" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-72 shrink-0 bg-[#12100a] border-r border-[#2e2518] overflow-y-auto flex flex-col">
          {mode === "architect" ? (
            <ArchitectSidebar
              shapeType={shapeType}
              params={params}
              paramDefs={currentParamDefs}
              objClass={objClass}
              posX={posX} posY={posY} posZ={posZ}
              rotY={rotY}
              scaleVal={scaleVal}
              fillMode={fillMode}
              format={format}
              cePersist={cePersist}
              includeHelper={includeHelper}
              extraObjs={extraObjs}
              stackY={stackY}
              objCount={points3D.length}
              onShapeChange={onShapeChange}
              setObjClass={setObjClass}
              setPosX={setPosX} setPosY={setPosY} setPosZ={setPosZ}
              setRotY={setRotY}
              setScaleVal={setScaleVal}
              setFillMode={setFillMode}
              setFormat={setFormat}
              setCePersist={setCePersist}
              setIncludeHelper={setIncludeHelper}
              setExtraObjs={setExtraObjs}
              setStackY={setStackY}
              setParam={setParam}
              onGenerate={generate}
              onPreview={previewShape}
              onClear={() => { setOutput(""); setPoints3D([]); draw(); }}
              autoRotate={autoRotate}
              setAutoRotate={setAutoRotate}
            />
          ) : (
            <TextSidebar
              textInput={textInput}
              textObj={textObj}
              textScale={textScale}
              textLetterH={textLetterH}
              textDepth={textDepth}
              textRings={textRings}
              textPosX={textPosX}
              textPosY={textPosY}
              textPosZ={textPosZ}
              textFormat={textFormat}
              setTextInput={setTextInput}
              setTextObj={setTextObj}
              setTextScale={setTextScale}
              setTextLetterH={setTextLetterH}
              setTextDepth={setTextDepth}
              setTextRings={setTextRings}
              setTextPosX={setTextPosX}
              setTextPosY={setTextPosY}
              setTextPosZ={setTextPosZ}
              setTextFormat={setTextFormat}
              onGenerate={generateText}
              onPreview={() => {
                const rawPts = getTextPoints(textInput, textLetterH, textSpacing, textDepth, textRings, 1.0);
                setPoints3D(rawPts);
                setPreviewScale(textScale);
              }}
            />
          )}
        </div>

        {/* MAIN PANEL */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas info bar */}
          <div className="flex items-center gap-4 px-3 py-1.5 bg-[#12100a] border-b border-[#2e2518] text-xs shrink-0">
            <span className="text-[#6a5a3a]">Shape:</span>
            <span className="text-[#d4a017] font-bold">
              {mode === "architect" ? (SHAPE_DEFS[shapeType]?.label || shapeType) : "Text Maker"}
            </span>
            <span className="text-[#6a5a3a] ml-2">Objects:</span>
            <span className="text-[#d4a017]">{points3D.length}</span>
            <span className="text-[#6a5a3a] ml-auto">Drag=rotate · Scroll=zoom · {autoRotate ? "🔄 Auto-spinning" : "Click preview to load"}</span>
          </div>

          {/* 3D Preview Canvas */}
          <div className="flex-1 relative min-h-0" style={{ minHeight: "280px", maxHeight: "50vh" }}>
            <canvas ref={canvasRef} className="w-full h-full block" style={{ background: "#060402" }} />
          </div>

          {/* Output Area */}
          <div className="flex flex-col border-t border-[#2e2518] bg-[#12100a]" style={{ maxHeight: "50vh", minHeight: "200px" }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2e2518]">
              <div className="text-[#d4a017] text-xs font-bold tracking-wider">
                {mode === "architect" ? (format === "initc" ? "▶ INIT.C OUTPUT" : "▶ JSON SPAWNER OUTPUT") : "▶ TEXT MAKER OUTPUT"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyCode(mode === "architect" ? output : textOutput)}
                  className="px-3 py-1 text-xs border border-[#2e2518] text-[#6a5a3a] hover:border-[#d4a017] hover:text-[#d4a017] rounded-sm transition-all"
                >Copy</button>
                <button
                  onClick={() => {
                    const code = mode === "architect" ? output : textOutput;
                    const ext = (mode === "architect" ? format : textFormat) === "initc" ? "c" : "json";
                    downloadCode(code, ext, mode === "architect" ? `shape_${shapeType}` : `text_${textInput}`);
                  }}
                  className="px-3 py-1 text-xs bg-[#d4a017] text-[#0a0804] font-bold rounded-sm hover:bg-[#e8b82a] transition-all"
                >Download</button>
              </div>
            </div>
            <textarea
              readOnly
              value={mode === "architect" ? output : textOutput}
              placeholder={`// Click Generate or Preview to begin...\n// Use the controls on the left to configure your shape.\n// Drag the canvas to rotate • Scroll to zoom`}
              className="flex-1 resize-none p-3 text-[11px] text-[#9ec080] bg-[#060402] border-0 outline-none leading-relaxed font-mono overflow-auto"
              style={{ minHeight: "150px" }}
            />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-[#d4a017] text-[#0a0804] px-4 py-2 rounded-sm text-sm font-bold z-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── ARCHITECT SIDEBAR ───────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[#d4a017] text-[10px] tracking-widest uppercase border-b border-[#2e2518] pb-1 mb-2 mt-3 px-3">
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[#6a5a3a] text-[10px] mb-0.5">{children}</div>;
}

interface ArchitectSidebarProps {
  shapeType: string;
  params: Record<string, number>;
  paramDefs: ParamDef[];
  objClass: string;
  posX: number; posY: number; posZ: number;
  rotY: number; scaleVal: number;
  fillMode: FillMode;
  format: OutputFormat;
  cePersist: number;
  includeHelper: boolean;
  extraObjs: string;
  stackY: number;
  objCount: number;
  onShapeChange: (s: string) => void;
  setObjClass: (v: string) => void;
  setPosX: (v: number) => void; setPosY: (v: number) => void; setPosZ: (v: number) => void;
  setRotY: (v: number) => void;
  setScaleVal: (v: number) => void;
  setFillMode: (v: FillMode) => void;
  setFormat: (v: OutputFormat) => void;
  setCePersist: (v: number) => void;
  setIncludeHelper: (v: boolean) => void;
  setExtraObjs: (v: string) => void;
  setStackY: (v: number) => void;
  setParam: (id: string, v: number) => void;
  onGenerate: () => void;
  onPreview: () => void;
  onClear: () => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean) => void;
}

function ArchitectSidebar(props: ArchitectSidebarProps) {
  const { shapeType, params, paramDefs, objClass, posX, posY, posZ, rotY, scaleVal, fillMode, format, cePersist, includeHelper, extraObjs, stackY, objCount } = props;

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Output Format */}
      <SectionTitle>Output Format</SectionTitle>
      <div className="flex gap-1 px-3">
        {(["initc", "json"] as OutputFormat[]).map(f => (
          <button key={f}
            onClick={() => props.setFormat(f)}
            className={`flex-1 py-1.5 text-xs rounded-sm border transition-all ${format === f ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017] font-bold" : "border-[#2e2518] text-[#6a5a3a] hover:border-[#6a5a3a]"}`}
          >
            {f === "initc" ? "init.c" : "JSON Spawner"}
          </button>
        ))}
      </div>

      {/* Object Selection */}
      <SectionTitle>Object</SectionTitle>
      <div className="px-3">
        <FieldLabel>Quick Select</FieldLabel>
        <select
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
          onChange={e => props.setObjClass(e.target.value)}
          value={objClass}
        >
          <option value="">-- Custom --</option>
          {OBJECT_GROUPS.map(group => (
            <optgroup key={group} label={group} className="text-[#8a6a0f]">
              {DAYZ_OBJECTS.filter(o => o.group === group).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <FieldLabel>Object Classname / Path</FieldLabel>
        <input
          type="text"
          value={objClass}
          onChange={e => props.setObjClass(e.target.value)}
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
        />
        <FieldLabel>Extra Objects per Point (comma-sep)</FieldLabel>
        <input
          type="text"
          value={extraObjs}
          onChange={e => props.setExtraObjs(e.target.value)}
          placeholder="e.g. Barrel_Blue,HatchbackWheel"
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#6a5a3a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
        />
        <FieldLabel>Y Offset Between Stacked Objects (m)</FieldLabel>
        <input
          type="number"
          value={stackY}
          onChange={e => props.setStackY(parseFloat(e.target.value))}
          step="0.5"
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
        />
      </div>

      {/* Shape */}
      <SectionTitle>Shape</SectionTitle>
      <div className="px-3">
        <FieldLabel>Shape Type</FieldLabel>
        <select
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
          value={shapeType}
          onChange={e => props.onShapeChange(e.target.value)}
        >
          {SHAPE_GROUPS.map(group => (
            <optgroup key={group} label={group} className="text-[#8a6a0f]">
              {Object.entries(SHAPE_DEFS)
                .filter(([, def]) => def.group === group)
                .map(([key, def]) => (
                  <option key={key} value={key}>{def.label}</option>
                ))}
            </optgroup>
          ))}
        </select>

        {/* Fill Mode */}
        <FieldLabel>Structure Mode</FieldLabel>
        <div className="flex gap-1 mb-3">
          {(["frame", "fill"] as FillMode[]).map(f => (
            <button key={f}
              onClick={() => props.setFillMode(f)}
              className={`flex-1 py-1.5 text-[10px] rounded-sm border transition-all ${fillMode === f ? "bg-[#1a3a5a] text-[#c8b99a] border-[#1a3a5a] font-bold" : "border-[#2e2518] text-[#6a5a3a] hover:border-[#6a5a3a]"}`}
            >
              {f === "frame" ? "🔲 FRAME" : "⬛ FILL"}
            </button>
          ))}
        </div>

        {/* Parameters */}
        {paramDefs.length > 0 && (
          <div className="border border-[#2e2518] rounded-sm p-2 bg-[#0a0804] mb-2">
            {paramDefs.map(p => (
              <div key={p.id}>
                <FieldLabel>{p.label}</FieldLabel>
                <input
                  type="number"
                  value={params[p.id] ?? p.val}
                  min={p.min} max={p.max} step={p.step ?? "any"}
                  onChange={e => props.setParam(p.id, parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1 rounded-sm mb-1.5 focus:outline-none focus:border-[#8a6a0f]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Position */}
      <SectionTitle>Base Position</SectionTitle>
      <div className="px-3 grid grid-cols-3 gap-1.5">
        {[["X", posX, props.setPosX], ["Y", posY, props.setPosY], ["Z", posZ, props.setPosZ]].map(([label, val, setter]) => (
          <div key={label as string}>
            <FieldLabel>{label as string}</FieldLabel>
            <input type="number" value={val as number} step="1"
              onChange={e => (setter as (v: number) => void)(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-1.5 py-1 rounded-sm mb-1 focus:outline-none focus:border-[#8a6a0f]"
            />
          </div>
        ))}
      </div>

      {/* Options */}
      <SectionTitle>Options</SectionTitle>
      <div className="px-3 grid grid-cols-2 gap-1.5">
        <div>
          <FieldLabel>Rot Y (yaw °)</FieldLabel>
          <input type="number" value={rotY} step="5"
            onChange={e => props.setRotY(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[#8a6a0f]"
          />
        </div>
        <div>
          <FieldLabel>Scale</FieldLabel>
          <input type="number" value={scaleVal} step="0.1" min="0.01"
            onChange={e => props.setScaleVal(parseFloat(e.target.value) || 1)}
            className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[#8a6a0f]"
          />
        </div>
      </div>
      <div className="px-3 mt-2">
        {format === "json" && (
          <>
            <FieldLabel>CE Persistency</FieldLabel>
            <select value={cePersist} onChange={e => props.setCePersist(parseInt(e.target.value))}
              className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
            >
              <option value={0}>0 — disabled (recommended)</option>
              <option value={1}>1 — enabled</option>
            </select>
          </>
        )}
        {format === "initc" && (
          <label className="flex items-center gap-2 text-[10px] text-[#6a5a3a] cursor-pointer mb-2">
            <input type="checkbox" checked={includeHelper} onChange={e => props.setIncludeHelper(e.target.checked)} />
            Include SpawnObject() helper function
          </label>
        )}
        <label className="flex items-center gap-2 text-[10px] text-[#6a5a3a] cursor-pointer">
          <input type="checkbox" checked={props.autoRotate} onChange={e => props.setAutoRotate(e.target.checked)} />
          Auto-rotate 3D preview
        </label>
      </div>

      {/* Stats */}
      <SectionTitle>Stats</SectionTitle>
      <div className="px-3 text-[10px]">
        <div className="flex justify-between mb-1"><span className="text-[#6a5a3a]">Points</span><span className="text-[#d4a017]">{objCount}</span></div>
        <div className="flex justify-between mb-1"><span className="text-[#6a5a3a]">Format</span><span className="text-[#d4a017]">{format === "initc" ? "init.c" : "JSON"}</span></div>
        <div className="flex justify-between mb-1"><span className="text-[#6a5a3a]">Mode</span><span className="text-[#d4a017]">{fillMode}</span></div>
        <div className="flex justify-between"><span className="text-[#6a5a3a]">Scale</span><span className="text-[objCount > 500 ? '#e07a20' : '#d4a017']">{scaleVal.toFixed(2)}×</span></div>
      </div>

      {/* Action buttons */}
      <div className="px-3 mt-3 flex flex-col gap-2">
        <button onClick={props.onGenerate}
          className="w-full py-2 bg-[#d4a017] text-[#0a0804] font-bold text-xs tracking-widest rounded-sm hover:bg-[#e8b82a] transition-all">
          ⚙ GENERATE
        </button>
        <button onClick={props.onPreview}
          className="w-full py-2 bg-[#1a3a5a] text-[#c8b99a] font-bold text-xs tracking-widest rounded-sm hover:bg-[#2a5a8a] transition-all">
          👁 PREVIEW 3D
        </button>
        <button onClick={props.onClear}
          className="w-full py-2 bg-[#2e2518] text-[#6a5a3a] font-bold text-xs tracking-widest rounded-sm hover:bg-[#3e3020] transition-all">
          ✕ CLEAR
        </button>
      </div>
    </div>
  );
}

// ─── TEXT SIDEBAR ────────────────────────────────────────────────────────────
interface TextSidebarProps {
  textInput: string;
  textObj: string;
  textScale: number;
  textLetterH: number;
  textDepth: number;
  textRings: number;
  textPosX: number;
  textPosY: number;
  textPosZ: number;
  textFormat: OutputFormat;
  setTextInput: (v: string) => void;
  setTextObj: (v: string) => void;
  setTextScale: (v: number) => void;
  setTextLetterH: (v: number) => void;
  setTextDepth: (v: number) => void;
  setTextRings: (v: number) => void;
  setTextPosX: (v: number) => void;
  setTextPosY: (v: number) => void;
  setTextPosZ: (v: number) => void;
  setTextFormat: (v: OutputFormat) => void;
  onGenerate: () => void;
  onPreview: () => void;
}

function TextSidebar(props: TextSidebarProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <SectionTitle>Output Format</SectionTitle>
      <div className="flex gap-1 px-3">
        {(["initc", "json"] as OutputFormat[]).map(f => (
          <button key={f} onClick={() => props.setTextFormat(f)}
            className={`flex-1 py-1.5 text-xs rounded-sm border transition-all ${props.textFormat === f ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017] font-bold" : "border-[#2e2518] text-[#6a5a3a] hover:border-[#6a5a3a]"}`}
          >
            {f === "initc" ? "init.c" : "JSON Spawner"}
          </button>
        ))}
      </div>

      <SectionTitle>Text Input</SectionTitle>
      <div className="px-3">
        <FieldLabel>Text to Render (A-Z, 0-9, spaces)</FieldLabel>
        <input type="text" value={props.textInput} onChange={e => props.setTextInput(e.target.value.toUpperCase())}
          placeholder="DAYZ"
          className="w-full bg-[#0a0804] border border-[#d4a017] text-[#d4a017] text-base px-2 py-2 rounded-sm mb-2 focus:outline-none font-mono font-bold tracking-widest text-center"
        />
        <FieldLabel>Letter Height (m)</FieldLabel>
        <input type="number" value={props.textLetterH} step="1" min="2" max="50"
          onChange={e => props.setTextLetterH(parseFloat(e.target.value) || 10)}
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1 rounded-sm mb-1.5 focus:outline-none focus:border-[#8a6a0f]"
        />
        <FieldLabel>Extrusion Depth (m)</FieldLabel>
        <input type="number" value={props.textDepth} step="0.5" min="0" max="50"
          onChange={e => props.setTextDepth(parseFloat(e.target.value) || 0)}
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1 rounded-sm mb-1.5 focus:outline-none focus:border-[#8a6a0f]"
        />
        <FieldLabel>Height Rings</FieldLabel>
        <input type="number" value={props.textRings} step="1" min="1" max="8"
          onChange={e => props.setTextRings(parseInt(e.target.value) || 1)}
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1 rounded-sm mb-1.5 focus:outline-none focus:border-[#8a6a0f]"
        />
      </div>

      <SectionTitle>Object</SectionTitle>
      <div className="px-3">
        <FieldLabel>Quick Select</FieldLabel>
        <select className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
          value={props.textObj} onChange={e => props.setTextObj(e.target.value)}>
          {OBJECT_GROUPS.map(group => (
            <optgroup key={group} label={group} className="text-[#8a6a0f]">
              {DAYZ_OBJECTS.filter(o => o.group === group).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <FieldLabel>Classname</FieldLabel>
        <input type="text" value={props.textObj} onChange={e => props.setTextObj(e.target.value)}
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
        />
      </div>

      <SectionTitle>Base Position</SectionTitle>
      <div className="px-3 grid grid-cols-3 gap-1.5">
        {[["X", props.textPosX, props.setTextPosX], ["Y", props.textPosY, props.setTextPosY], ["Z", props.textPosZ, props.setTextPosZ]].map(([label, val, setter]) => (
          <div key={label as string}>
            <FieldLabel>{label as string}</FieldLabel>
            <input type="number" value={val as number} step="1"
              onChange={e => (setter as (v: number) => void)(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-1.5 py-1 rounded-sm focus:outline-none focus:border-[#8a6a0f]"
            />
          </div>
        ))}
      </div>

      <SectionTitle>Scale</SectionTitle>
      <div className="px-3">
        <FieldLabel>Object Scale</FieldLabel>
        <input type="number" value={props.textScale} step="0.1" min="0.1" max="10"
          onChange={e => props.setTextScale(parseFloat(e.target.value) || 1)}
          className="w-full bg-[#0a0804] border border-[#2e2518] text-[#c8b99a] text-xs px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
        />
      </div>

      <div className="px-3 mt-3 flex flex-col gap-2">
        <button onClick={props.onGenerate}
          className="w-full py-2 bg-[#d4a017] text-[#0a0804] font-bold text-xs tracking-widest rounded-sm hover:bg-[#e8b82a] transition-all">
          ⚙ GENERATE TEXT
        </button>
        <button onClick={props.onPreview}
          className="w-full py-2 bg-[#1a3a5a] text-[#c8b99a] font-bold text-xs tracking-widest rounded-sm hover:bg-[#2a5a8a] transition-all">
          👁 PREVIEW 3D
        </button>
      </div>

      {/* Alphabet reference */}
      <SectionTitle>Supported Characters</SectionTitle>
      <div className="px-3 text-[10px] text-[#6a5a3a] leading-relaxed">
        A-Z, 0-9, !, ?, (space)
      </div>
    </div>
  );
}
