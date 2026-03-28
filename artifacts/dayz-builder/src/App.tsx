import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { getShapePoints, Point3D } from "@/lib/shapeGenerators";
import { SHAPE_DEFS, SHAPE_GROUPS, ParamDef } from "@/lib/shapeParams";
import { DAYZ_OBJECTS, OBJECT_GROUPS, formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";

type EditorMode = "architect" | "text";
type OutputFormat = "initc" | "json";
type FillMode = "frame" | "fill";

// ─── TEXT FONT ───────────────────────────────────────────────────────────────
const TEXT_FONT: Record<string, number[][]> = {
  A:[[0,0],[0.5,1],[1,0],[0.2,0.5],[0.8,0.5]], B:[[0,0],[0,1],[0.6,0.8],[0.7,0.6],[0.6,0.4],[0,0.5],[0.6,0.4],[0.7,0.2],[0.6,0]],
  C:[[1,0.8],[0.5,1],[0,0.5],[0.5,0],[1,0.2]], D:[[0,0],[0,1],[0.5,1],[1,0.5],[0.5,0]],
  E:[[1,0],[0,0],[0,1],[1,1],[0,0.5],[0.7,0.5]], F:[[0,0],[0,1],[1,1],[0,0.5],[0.7,0.5]],
  G:[[1,0.8],[0.5,1],[0,0.5],[0.5,0],[1,0.2],[1,0.5],[0.6,0.5]], H:[[0,0],[0,1],[1,1],[1,0],[0,0.5],[1,0.5]],
  I:[[0,0],[1,0],[0.5,0],[0.5,1],[0,1],[1,1]], J:[[0,0.2],[0.5,0],[1,0.2],[1,1],[0,1]],
  K:[[0,0],[0,1],[0.5,0.5],[1,1],[0.5,0.5],[1,0]], L:[[0,1],[0,0],[1,0]],
  M:[[0,0],[0,1],[0.5,0.5],[1,1],[1,0]], N:[[0,0],[0,1],[1,0],[1,1]],
  O:[[0.5,1],[1,0.5],[0.5,0],[0,0.5],[0.5,1]], P:[[0,0],[0,1],[0.7,1],[1,0.8],[0.7,0.5],[0,0.5]],
  Q:[[0.5,1],[1,0.5],[0.5,0],[0,0.5],[0.5,1],[0.8,0.2],[1,0]], R:[[0,0],[0,1],[0.7,1],[1,0.8],[0.7,0.5],[0,0.5],[0.5,0.5],[1,0]],
  S:[[1,0.8],[0.5,1],[0,0.7],[0.5,0.5],[1,0.3],[0.5,0],[0,0.2]], T:[[0,1],[1,1],[0.5,1],[0.5,0]],
  U:[[0,1],[0,0.2],[0.5,0],[1,0.2],[1,1]], V:[[0,1],[0.5,0],[1,1]],
  W:[[0,1],[0.25,0],[0.5,0.4],[0.75,0],[1,1]], X:[[0,0],[1,1],[0.5,0.5],[0,1],[1,0]],
  Y:[[0,1],[0.5,0.5],[1,1],[0.5,0.5],[0.5,0]], Z:[[0,1],[1,1],[0,0],[1,0]],
  "0":[[0.5,1],[1,0.5],[0.5,0],[0,0.5],[0.5,1]], "1":[[0.2,0.8],[0.5,1],[0.5,0],[0.2,0],[0.8,0]],
  "2":[[0,0.8],[0.5,1],[1,0.7],[0,0],[1,0]], "3":[[0,0.8],[0.5,1],[1,0.5],[0.5,0.5],[1,0.2],[0.5,0],[0,0.2]],
  "4":[[0,1],[0,0.4],[1,0.4],[1,1],[1,0]], "5":[[1,1],[0,1],[0,0.55],[0.6,0.55],[1,0.3],[0.5,0],[0,0.2]],
  "6":[[1,0.8],[0.5,1],[0,0.5],[0,0],[0.6,0],[1,0.3],[0.6,0.5],[0,0.5]], "7":[[0,1],[1,1],[0.3,0]],
  "8":[[0.5,0.5],[1,0.8],[0.5,1],[0,0.8],[0.5,0.5],[1,0.2],[0.5,0],[0,0.2],[0.5,0.5]],
  "9":[[1,0.5],[0.5,1],[0,0.8],[0.5,0.5],[1,0.5],[1,0],[0.4,0]],
  "!":[[0.5,1],[0.5,0.3],[0.5,0.05]], "?":[[0,0.8],[0.5,1],[1,0.7],[0.5,0.4],[0.5,0.1]],
  ".":[[0.5,0.05]], ",":[[0.5,0.1],[0.4,-0.1]], " ":[],
};

function getTextPoints(text: string, letterH: number, letterSpacing: number, depth: number, rings: number): Point3D[] {
  const pts: Point3D[] = [];
  let xOffset = 0;
  for (const ch of text.toUpperCase()) {
    const segs = TEXT_FONT[ch] || TEXT_FONT[" "];
    for (let ri = 0; ri <= rings; ri++) {
      const y = depth * ri / Math.max(1, rings);
      for (let i = 0; i < segs.length - 1; i++) {
        const [x1, z1] = segs[i], [x2, z2] = segs[i + 1];
        const dist = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const n = Math.max(2, Math.ceil(dist * letterH / 4));
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          pts.push({ x: xOffset + (x1 + (x2 - x1) * t) * letterH, y, z: (z1 + (z2 - z1) * t) * letterH });
        }
      }
    }
    xOffset += letterH * letterSpacing;
    if (ch === " ") xOffset -= letterH * 0.4;
  }
  return pts;
}

// ─── 3D RENDERER ─────────────────────────────────────────────────────────────
function use3DCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const rotRef = useRef({ x: -0.4, y: 0.5 });
  const dragRef = useRef({ dragging: false, lx: 0, ly: 0 });
  const zoomRef = useRef(1.0);
  const animRef = useRef<number | null>(null);
  const autoRef = useRef(false);
  const ptsRef = useRef<Point3D[]>([]);
  const scaleRef = useRef(1.0);
  const pitchRef = useRef(0);
  const rollRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const pts = ptsRef.current;
    const userScale = scaleRef.current;
    ctx.clearRect(0, 0, W, H);

    if (!pts.length) {
      ctx.fillStyle = "#060402";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#3a2e18";
      ctx.font = "bold 13px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText("← Configure shape & it renders here in real time", W / 2, H / 2);
      return;
    }

    ctx.fillStyle = "#060402";
    ctx.fillRect(0, 0, W, H);

    const rx = rotRef.current.x, ry = rotRef.current.y;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const pitch = pitchRef.current * Math.PI / 180;
    const roll = rollRef.current * Math.PI / 180;
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll), sinRoll = Math.sin(roll);
    const zoom = zoomRef.current;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    pts.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    });
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;
    const spread = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1);
    const baseZoom = Math.min(W, H) * 0.38 / spread * zoom;

    const projected: { sx: number; sy: number; depth: number }[] = pts.map(p => {
      let lx = (p.x - cx) * userScale, ly = (p.y - cy) * userScale, lz = (p.z - cz) * userScale;
      // apply pitch (X rotation for YPR effect)
      const ly2 = ly * cosPitch - lz * sinPitch;
      const lz2 = ly * sinPitch + lz * cosPitch;
      // apply roll (Z rotation)
      const lx3 = lx * cosRoll + ly2 * sinRoll;
      const ly3 = -lx * sinRoll + ly2 * cosRoll;
      const lz3 = lz2;
      // camera rotation (drag)
      const rx1 = lx3 * cosY + lz3 * sinY;
      const rz1 = -lx3 * sinY + lz3 * cosY;
      const ry2 = ly3 * cosX - rz1 * sinX;
      const rz2 = ly3 * sinX + rz1 * cosX;
      const fov = 600;
      const sc = fov / (fov + rz2 + spread * 1.5);
      return { sx: W / 2 + rx1 * baseZoom * sc, sy: H / 2 - ry2 * baseZoom * sc, depth: rz2 };
    });

    const sorted = projected.map((p, i) => ({ ...p, i })).sort((a, b) => b.depth - a.depth);
    const maxD = spread * 1.5, minD = -spread * 1.5;

    sorted.forEach(({ sx, sy, depth }) => {
      const t = Math.max(0, Math.min(1, (depth - minD) / (maxD - minD)));
      const r = Math.round(200 * t + 60 * (1 - t));
      const g = Math.round(160 * t + 90 * (1 - t));
      const b = Math.round(30 * t + 15 * (1 - t));
      const alpha = 0.55 + 0.45 * t;
      const dotR = Math.max(1, 1.6 * zoom);
      ctx.beginPath();
      ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    });

    // LIVE badge
    ctx.fillStyle = "rgba(212,160,23,0.8)";
    ctx.font = "bold 10px 'Courier New'";
    ctx.textAlign = "left";
    ctx.fillText(`● LIVE  ${pts.length} pts`, 8, 16);
  }, [canvasRef]);

  const startAutoRotate = useCallback(() => {
    autoRef.current = true;
    const loop = () => {
      if (!autoRef.current) return;
      rotRef.current.y += 0.008;
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  }, [draw]);

  const stopAutoRotate = useCallback(() => {
    autoRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  const updatePoints = useCallback((pts: Point3D[], scale: number, pitchDeg: number, rollDeg: number) => {
    ptsRef.current = pts;
    scaleRef.current = scale;
    pitchRef.current = pitchDeg;
    rollRef.current = rollDeg;
    if (!autoRef.current) draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onDown = (e: MouseEvent) => { dragRef.current = { dragging: true, lx: e.clientX, ly: e.clientY }; };
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      rotRef.current.y += (e.clientX - dragRef.current.lx) * 0.01;
      rotRef.current.x += (e.clientY - dragRef.current.ly) * 0.01;
      dragRef.current.lx = e.clientX; dragRef.current.ly = e.clientY;
      if (!autoRef.current) draw();
    };
    const onUp = () => { dragRef.current.dragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.max(0.15, zoomRef.current * (e.deltaY > 0 ? 0.88 : 1.12));
      if (!autoRef.current) draw();
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length === 1) dragRef.current = { dragging: true, lx: e.touches[0].clientX, ly: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.dragging || e.touches.length !== 1) return;
      rotRef.current.y += (e.touches[0].clientX - dragRef.current.lx) * 0.012;
      rotRef.current.x += (e.touches[0].clientY - dragRef.current.ly) * 0.012;
      dragRef.current.lx = e.touches[0].clientX; dragRef.current.ly = e.touches[0].clientY;
      if (!autoRef.current) draw();
    };
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [draw]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const obs = new ResizeObserver(() => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      draw();
    });
    obs.observe(canvas.parentElement);
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height;
    draw();
    return () => obs.disconnect();
  }, [draw]);

  return { updatePoints, startAutoRotate, stopAutoRotate, draw };
}

// ─── QUICK PRESETS ────────────────────────────────────────────────────────────
const QUICK_PRESETS = [
  { label: "Death Star", shape: "deathstar", params: { radius:40,latSegs:10,lonSegs:16,dishRadius:12,dishDepth:8,dishLat:30 } },
  { label: "Mech Warrior", shape: "mech_bipedal", params: { height:25,width:14 } },
  { label: "Azkaban", shape: "azkaban_tower", params: { baseRadius:20,height:60,towerCount:5 } },
  { label: "Orbital Ring", shape: "orbital_station", params: { radius:40 } },
  { label: "Minigun", shape: "mech_minigun", params: { baseRadius:10,height:20,barrelCount:6 } },
  { label: "DNA Helix", shape: "dna_double", params: { radius:12,height:40,turns:5,pointsPerTurn:12 } },
  { label: "Falcon", shape: "millennium_falcon", params: { radius:30 } },
  { label: "Star Fort", shape: "star_fort", params: { outerR:50,innerR:30,points:5,height:12,rings:2 } },
  { label: "Skull Giant", shape: "body_skull", params: { radius:18,eyeSocket:5,jawDrop:8 } },
  { label: "Reactor Core", shape: "reactor_core", params: { radius:25,height:30,rings:5 } },
  { label: "Skyscraper", shape: "skyscraper", params: { width:20,height:100,floors:20 } },
  { label: "Spider Walker", shape: "mech_walker", params: { height:20,width:18 } },
  { label: "Torus Gate", shape: "torus", params: { majorR:30,minorR:8,majorSegs:20,minorSegs:10 } },
  { label: "Pyramid Aztec", shape: "pyramid_stepped", params: { baseSize:80,height:40,steps:6,shrink:0.18,spacing:6 } },
  { label: "Hex Tunnel", shape: "tunnel_hex", params: { radius:8,length:50,spacing:4,segments:10 } },
  { label: "Sci-Fi Gate", shape: "sci_fi_gate", params: { width:40,height:30 } },
  { label: "Crashed UFO", shape: "crashed_ufo", params: { radius:25,tiltDeg:25,debris:10 } },
  { label: "Volcano", shape: "volcano", params: { baseRadius:50,height:60,craterRadius:12,rimHeight:5,rings:8,spacing:8 } },
  { label: "Colosseum", shape: "colosseum", params: { radius:60,height:30,tiers:3,arches:20 } },
  { label: "Stonehenge", shape: "stonehenge", params: { outerRadius:30,innerRadius:16,stoneHeight:8,stoneWidth:2,outerCount:30,trilithonCount:5,archCount:6 } },
  { label: "Mushroom Cloud", shape: "mushroom_cloud", params: { radius:40,height:80 } },
  { label: "Black Hole", shape: "black_hole", params: { radius:30,arcs:4 } },
  { label: "Mothership", shape: "alien_mothership", params: { radius:50,emitterCount:8 } },
  { label: "Celtic Ring", shape: "celtic_ring", params: { radius:30,height:8,stoneCount:24,archCount:6 } },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState<EditorMode>("architect");

  // Architect
  const [shapeType, setShapeType] = useState("deathstar");
  const [params, setParams] = useState<Record<string, number>>(() => {
    const d: Record<string, number> = {};
    SHAPE_DEFS["deathstar"].params.forEach(p => { d[p.id] = p.val; });
    return d;
  });
  const [objClass, setObjClass] = useState("StaticObj_Container_1D");
  const [posX, setPosX] = useState(12000);
  const [posY, setPosY] = useState(150);
  const [posZ, setPosZ] = useState(12600);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [scaleVal, setScaleVal] = useState(1.0);
  const [fillMode, setFillMode] = useState<FillMode>("frame");
  const [fillDensity, setFillDensity] = useState(2);
  const [format, setFormat] = useState<OutputFormat>("initc");
  const [cePersist, setCePersist] = useState(0);
  const [includeHelper, setIncludeHelper] = useState(true);
  const [extraObjs, setExtraObjs] = useState("");
  const [stackY, setStackY] = useState(0);
  const [output, setOutput] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);
  const [toast, setToast] = useState("");
  const [presetFilter, setPresetFilter] = useState("");

  // Text maker
  const [textInput, setTextInput] = useState("DAYZ");
  const [textObj, setTextObj] = useState("StaticObj_Container_1D");
  const [textScale, setTextScale] = useState(1.0);
  const [textLetterH, setTextLetterH] = useState(10);
  const [textSpacing, setTextSpacing] = useState(1.2);
  const [textDepth, setTextDepth] = useState(0);
  const [textRings, setTextRings] = useState(1);
  const [textPosX, setTextPosX] = useState(12000);
  const [textPosY, setTextPosY] = useState(150);
  const [textPosZ, setTextPosZ] = useState(12600);
  const [textFormat, setTextFormat] = useState<OutputFormat>("initc");
  const [textOutput, setTextOutput] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { updatePoints, startAutoRotate, stopAutoRotate } = use3DCanvas(canvasRef);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── COMPUTE SHAPE POINTS ──────────────────────────────────────────────────
  const rawPoints = useMemo(() => {
    if (mode === "text") {
      return getTextPoints(textInput, textLetterH, textSpacing, textDepth, textRings);
    }
    return getShapePoints(shapeType, params);
  }, [mode, shapeType, params, textInput, textLetterH, textSpacing, textDepth, textRings]);

  // Apply fill mode with density
  const displayPoints = useMemo(() => {
    if (mode === "text" || fillMode === "frame") return rawPoints;
    const extras: Point3D[] = [];
    const cx = rawPoints.reduce((s, p) => s + p.x, 0) / (rawPoints.length || 1);
    const cz = rawPoints.reduce((s, p) => s + p.z, 0) / (rawPoints.length || 1);
    rawPoints.forEach(p => {
      for (let i = 1; i <= fillDensity; i++) {
        const t = i / (fillDensity + 1);
        extras.push({ x: p.x + (cx - p.x) * t, y: p.y, z: p.z + (cz - p.z) * t });
      }
    });
    return [...rawPoints, ...extras];
  }, [rawPoints, fillMode, fillDensity, mode]);

  // ── REAL-TIME CANVAS UPDATE ────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const pts = mode === "text"
        ? displayPoints.map(p => ({ x: p.x, y: p.y, z: p.z }))
        : displayPoints;
      updatePoints(pts, mode === "text" ? textScale : scaleVal, pitch, roll);
    }, 60);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [displayPoints, scaleVal, textScale, pitch, roll, mode, updatePoints]);

  // ── AUTO ROTATE ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoRotate) startAutoRotate();
    else stopAutoRotate();
    return () => stopAutoRotate();
  }, [autoRotate, startAutoRotate, stopAutoRotate]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setShapeType(preset.shape);
    const newParams: Record<string, number> = {};
    SHAPE_DEFS[preset.shape]?.params.forEach(p => {
      newParams[p.id] = (preset.params as any)[p.id] ?? p.val;
    });
    setParams(newParams);
    showToast(`✓ Loaded: ${preset.label}`);
  };

  const onShapeChange = (st: string) => {
    setShapeType(st);
    const newParams: Record<string, number> = {};
    SHAPE_DEFS[st]?.params.forEach(p => { newParams[p.id] = p.val; });
    setParams(newParams);
  };

  const setParam = (id: string, v: number) => setParams(prev => ({ ...prev, [id]: v }));

  // ── GENERATE CODE ──────────────────────────────────────────────────────────
  const generate = () => {
    const ptsToUse = displayPoints;
    const extras = extraObjs.split(",").map(s => s.trim()).filter(Boolean);
    const lines: string[] = [];
    const jsonObjects: object[] = [];
    let objCount = 0;

    if (format === "initc") {
      if (includeHelper) lines.push(HELPER_FUNC);
      lines.push(`// Shape: ${SHAPE_DEFS[shapeType]?.label || shapeType}`);
      lines.push(`// Asset: ${objClass}   Base: <${posX}, ${posY}, ${posZ}>`);
      lines.push(`// YPR: ${pitch}° / ${yaw}° / ${roll}°   Scale: ${scaleVal}`);
      lines.push(`// Mode: ${fillMode}${fillMode === "fill" ? " density " + fillDensity : ""}   Objects: ${ptsToUse.length * (1 + extras.length)}`);
      lines.push(``);
    }

    const yawRad = yaw * Math.PI / 180;

    ptsToUse.forEach(pt => {
      const sx = pt.x * scaleVal, sy = pt.y * scaleVal, sz = pt.z * scaleVal;
      const wx = sx * Math.cos(yawRad) - sz * Math.sin(yawRad) + posX;
      const wy = sy + posY;
      const wz = sx * Math.sin(yawRad) + sz * Math.cos(yawRad) + posZ;

      if (format === "initc") {
        lines.push(formatInitC(objClass, wx, wy, wz, pitch, yaw, roll, scaleVal));
        objCount++;
        extras.forEach((ex, ei) => {
          lines.push(formatInitC(ex, wx, wy + stackY * (ei + 1), wz, pitch, yaw, roll, scaleVal));
          objCount++;
        });
      } else {
        jsonObjects.push({ name: objClass, pos: [+wx.toFixed(6), +wy.toFixed(6), +wz.toFixed(6)], ypr: [+pitch.toFixed(4), +yaw.toFixed(4), +roll.toFixed(4)], scale: +scaleVal.toFixed(4), enableCEPersistency: cePersist, customString: "" });
        objCount++;
        extras.forEach((ex, ei) => {
          jsonObjects.push({ name: ex, pos: [+wx.toFixed(6), +(wy + stackY * (ei + 1)).toFixed(6), +wz.toFixed(6)], ypr: [+pitch.toFixed(4), +yaw.toFixed(4), +roll.toFixed(4)], scale: +scaleVal.toFixed(4), enableCEPersistency: cePersist, customString: "" });
          objCount++;
        });
      }
    });

    const result = format === "initc" ? lines.join("\n") : JSON.stringify({ Objects: jsonObjects }, null, 2);
    setOutput(result);
    showToast(`✓ Generated ${objCount} object${objCount !== 1 ? "s" : ""}`);
  };

  const generateText = () => {
    const pts = displayPoints;
    const lines: string[] = [];
    const jsonObjects: object[] = [];
    if (textFormat === "initc") { lines.push(HELPER_FUNC); lines.push(`// Text: "${textInput}"   Object: ${textObj}`); lines.push(``); }
    pts.forEach(pt => {
      const wx = pt.x * textScale + textPosX, wy = pt.y * textScale + textPosY, wz = pt.z * textScale + textPosZ;
      if (textFormat === "initc") lines.push(formatInitC(textObj, wx, wy, wz, 0, 0, 0, textScale));
      else jsonObjects.push({ name: textObj, pos: [+wx.toFixed(6), +wy.toFixed(6), +wz.toFixed(6)], ypr: [0, 0, 0], scale: +textScale.toFixed(4), enableCEPersistency: 0, customString: "" });
    });
    setTextOutput(textFormat === "initc" ? lines.join("\n") : JSON.stringify({ Objects: jsonObjects }, null, 2));
    showToast(`✓ Text: ${pts.length} objects`);
  };

  const copyCode = (code: string) => navigator.clipboard.writeText(code).then(() => showToast("✓ Copied!"));
  const downloadCode = (code: string, ext: string, name: string) => {
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([code], { type: "text/plain" })), download: `${name}.${ext}` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const currentCode = mode === "architect" ? output : textOutput;
  const currentExt = (mode === "architect" ? format : textFormat) === "initc" ? "c" : "json";
  const currentParamDefs: ParamDef[] = SHAPE_DEFS[shapeType]?.params || [];
  const filteredPresets = QUICK_PRESETS.filter(p => !presetFilter || p.label.toLowerCase().includes(presetFilter.toLowerCase()) || p.shape.includes(presetFilter.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-[#0a0804] text-[#c8b99a] font-mono overflow-hidden select-none">
      {/* ── HEADER ── */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-[#2e2518] bg-[#12100a] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#d4a017] font-black text-lg tracking-widest">DANK</span>
            <span className="text-[#c0392b] font-black text-lg tracking-widest">DAYZ</span>
            <span className="text-[10px] border border-[#8b1a1a] text-[#c0392b] px-1.5 py-0.5 rounded-sm">ULTIMATE v3</span>
          </div>
          <div className="text-[#4a3a22] text-[9px] tracking-widest">REAL-TIME 3D · SHAPES · TUNNELS · MECHS · TEXT · CONSOLE SAFE</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex gap-1 border border-[#2e2518] rounded-sm p-0.5">
            {(["architect", "text"] as EditorMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-[11px] rounded-sm font-bold tracking-wider transition-all ${mode === m ? "bg-[#d4a017] text-[#0a0804]" : "text-[#6a5a3a] hover:text-[#c8b99a]"}`}>
                {m === "architect" ? "🏗 ARCHITECT" : "✏ TEXT MAKER"}
              </button>
            ))}
          </div>
          <div className="w-2 h-2 rounded-full bg-[#27ae60] animate-pulse" title="Live preview active" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ── */}
        <div className="w-72 shrink-0 bg-[#0e0c08] border-r border-[#2e2518] overflow-y-auto flex flex-col">
          {mode === "architect" ? (
            <ArchitectSidebar
              shapeType={shapeType} params={params} paramDefs={currentParamDefs}
              objClass={objClass} posX={posX} posY={posY} posZ={posZ}
              yaw={yaw} pitch={pitch} roll={roll}
              scaleVal={scaleVal} fillMode={fillMode} fillDensity={fillDensity}
              format={format} cePersist={cePersist} includeHelper={includeHelper}
              extraObjs={extraObjs} stackY={stackY}
              objCount={displayPoints.length}
              autoRotate={autoRotate}
              presetFilter={presetFilter} filteredPresets={filteredPresets}
              onShapeChange={onShapeChange} setObjClass={setObjClass}
              setPosX={setPosX} setPosY={setPosY} setPosZ={setPosZ}
              setYaw={setYaw} setPitch={setPitch} setRoll={setRoll}
              setScaleVal={setScaleVal} setFillMode={setFillMode} setFillDensity={setFillDensity}
              setFormat={setFormat} setCePersist={setCePersist} setIncludeHelper={setIncludeHelper}
              setExtraObjs={setExtraObjs} setStackY={setStackY}
              setParam={setParam} setAutoRotate={setAutoRotate}
              setPresetFilter={setPresetFilter}
              onGenerate={generate}
              onClear={() => setOutput("")}
              applyPreset={applyPreset}
            />
          ) : (
            <TextSidebar
              textInput={textInput} textObj={textObj} textScale={textScale}
              textLetterH={textLetterH} textSpacing={textSpacing} textDepth={textDepth}
              textRings={textRings} textPosX={textPosX} textPosY={textPosY} textPosZ={textPosZ}
              textFormat={textFormat} objCount={displayPoints.length}
              setTextInput={setTextInput} setTextObj={setTextObj} setTextScale={setTextScale}
              setTextLetterH={setTextLetterH} setTextSpacing={setTextSpacing}
              setTextDepth={setTextDepth} setTextRings={setTextRings}
              setTextPosX={setTextPosX} setTextPosY={setTextPosY} setTextPosZ={setTextPosZ}
              setTextFormat={setTextFormat}
              onGenerate={generateText}
            />
          )}
        </div>

        {/* ── MAIN PANEL ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Info bar */}
          <div className="flex items-center gap-3 px-3 py-1 bg-[#0e0c08] border-b border-[#2e2518] text-[11px] shrink-0">
            <span className="text-[#4a3a22]">Shape</span>
            <span className="text-[#d4a017] font-bold truncate max-w-[180px]">
              {mode === "architect" ? (SHAPE_DEFS[shapeType]?.label || shapeType) : `"${textInput}"`}
            </span>
            <span className="text-[#4a3a22]">Objects</span>
            <span className={`font-bold ${displayPoints.length > 800 ? "text-[#e07a20]" : "text-[#d4a017]"}`}>{displayPoints.length}</span>
            {displayPoints.length > 800 && <span className="text-[#e07a20] text-[10px]">⚠ large!</span>}
            <span className="ml-auto text-[#3a2e18]">Drag=rotate · Scroll=zoom</span>
          </div>

          {/* 3D Canvas */}
          <div className="relative bg-[#060402]" style={{ flex: "0 0 55%", minHeight: 200 }}>
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Output */}
          <div className="flex flex-col border-t border-[#2e2518] bg-[#0e0c08] flex-1 min-h-0">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2e2518] shrink-0">
              <div className="text-[#d4a017] text-[11px] font-bold tracking-wider">
                {format === "initc" ? "▶ INIT.C" : "▶ JSON SPAWNER"}
                {currentCode && <span className="ml-2 text-[#6a5a3a] font-normal">({currentCode.split("\n").length} lines)</span>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => copyCode(currentCode)}
                  className="px-3 py-1 text-[11px] border border-[#2e2518] text-[#6a5a3a] hover:border-[#d4a017] hover:text-[#d4a017] rounded-sm transition-all">
                  Copy
                </button>
                <button onClick={() => downloadCode(currentCode, currentExt, mode === "architect" ? `shape_${shapeType}` : `text_${textInput}`)}
                  className="px-3 py-1 text-[11px] bg-[#d4a017] text-[#0a0804] font-bold rounded-sm hover:bg-[#e8b82a] transition-all">
                  Download
                </button>
              </div>
            </div>
            <textarea readOnly value={currentCode}
              placeholder={"// ← Configure your shape on the left, then click GENERATE\n// The 3D preview updates in real time as you adjust settings\n// Drag the preview to rotate • Scroll to zoom"}
              className="flex-1 resize-none p-3 text-[11px] text-[#7ec060] bg-transparent border-0 outline-none leading-relaxed font-mono overflow-auto"
            />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-[#d4a017] text-[#0a0804] px-4 py-2 rounded-sm text-sm font-bold z-50 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Sec({ children }: { children: React.ReactNode }) {
  return <div className="text-[#d4a017] text-[9px] tracking-widest uppercase border-b border-[#2e2518] pb-1 mb-2 mt-3 px-3">{children}</div>;
}
function Lbl({ children }: { children: React.ReactNode }) {
  return <div className="text-[#5a4a2e] text-[10px] mb-0.5">{children}</div>;
}
function Inp({ value, onChange, type = "number", ...rest }: { value: string | number; onChange: (v: string) => void; type?: string; [k: string]: any }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1 rounded-sm mb-1.5 focus:outline-none focus:border-[#8a6a0f] transition-colors"
      {...rest}
    />
  );
}
function Slider({ label, value, min, max, step = "any", onChange }: { label: string; value: number; min: number; max: number; step?: number | string; onChange: (v: number) => void }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-0.5">
        <Lbl>{label}</Lbl>
        <span className="text-[#d4a017] text-[10px] font-bold">{typeof step === "number" && step >= 1 ? Math.round(value) : value}</span>
      </div>
      <input type="range" value={value} min={min} max={max} step={step}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full cursor-pointer accent-[#d4a017]"
        style={{ background: `linear-gradient(to right, #d4a017 ${((value - min) / (max - min)) * 100}%, #2e2518 0%)` }}
      />
    </div>
  );
}

// ─── ARCHITECT SIDEBAR ────────────────────────────────────────────────────────
function ArchitectSidebar(p: any) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setCollapsed(prev => ({ ...prev, [k]: !prev[k] }));
  const sec = (k: string, label: string, children: React.ReactNode) => (
    <div>
      <button onClick={() => toggle(k)}
        className="w-full flex items-center justify-between text-[#d4a017] text-[9px] tracking-widest uppercase border-b border-[#2e2518] pb-1 mb-2 mt-3 px-3 bg-transparent hover:text-[#e8b82a] transition-colors">
        <span>{label}</span>
        <span className="text-[#4a3a22]">{collapsed[k] ? "▶" : "▼"}</span>
      </button>
      {!collapsed[k] && children}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Quick Presets */}
      {sec("presets", "⚡ Quick Presets", (
        <div className="px-3">
          <input type="text" placeholder="Filter presets..." value={p.presetFilter}
            onChange={e => p.setPresetFilter(e.target.value)}
            className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
          />
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
            {p.filteredPresets.map((preset: any) => (
              <button key={preset.label} onClick={() => p.applyPreset(preset)}
                className={`text-left text-[10px] px-2 py-1.5 rounded-sm border transition-all truncate ${p.shapeType === preset.shape ? "border-[#d4a017] text-[#d4a017] bg-[#1a1408]" : "border-[#2e2518] text-[#7a6a4a] hover:border-[#6a5a3a] hover:text-[#c8b99a]"}`}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Format */}
      {sec("fmt", "📄 Output Format", (
        <div className="flex gap-1 px-3">
          {(["initc", "json"] as OutputFormat[]).map(f => (
            <button key={f} onClick={() => p.setFormat(f)}
              className={`flex-1 py-1.5 text-[11px] rounded-sm border transition-all font-bold ${p.format === f ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017]" : "border-[#2e2518] text-[#5a4a2e] hover:border-[#6a5a3a] hover:text-[#c8b99a]"}`}>
              {f === "initc" ? "init.c" : "JSON"}
            </button>
          ))}
        </div>
      ))}

      {/* Object */}
      {sec("obj", "📦 Object Class", (
        <div className="px-3">
          <Lbl>Quick Select</Lbl>
          <select className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
            onChange={e => p.setObjClass(e.target.value)} value={p.objClass}>
            {OBJECT_GROUPS.map(group => (
              <optgroup key={group} label={group}>
                {DAYZ_OBJECTS.filter(o => o.group === group).map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <Lbl>Classname / Path</Lbl>
          <Inp type="text" value={p.objClass} onChange={v => p.setObjClass(v)} />
          <Lbl>Extra Objects per Point (comma-sep)</Lbl>
          <Inp type="text" value={p.extraObjs} onChange={v => p.setExtraObjs(v)} placeholder="Barrel_Blue,HatchbackWheel" />
          {p.extraObjs && (
            <>
              <Lbl>Y Offset Between Stacked (m)</Lbl>
              <Inp value={p.stackY} onChange={v => p.setStackY(parseFloat(v) || 0)} step="0.5" />
            </>
          )}
        </div>
      ))}

      {/* Shape */}
      {sec("shape", "🔷 Shape", (
        <div className="px-3">
          <Lbl>Shape Type</Lbl>
          <select className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
            value={p.shapeType} onChange={e => p.onShapeChange(e.target.value)}>
            {SHAPE_GROUPS.map(group => (
              <optgroup key={group} label={group}>
                {Object.entries(SHAPE_DEFS).filter(([, def]) => def.group === group).map(([key, def]) => (
                  <option key={key} value={key}>{def.label}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <Lbl>Structure Mode</Lbl>
          <div className="flex gap-1 mb-3">
            {(["frame", "fill"] as FillMode[]).map(f => (
              <button key={f} onClick={() => p.setFillMode(f)}
                className={`flex-1 py-1.5 text-[10px] rounded-sm border font-bold transition-all ${p.fillMode === f ? "bg-[#1e4a2a] text-[#5dcc80] border-[#2e6a3a]" : "border-[#2e2518] text-[#5a4a2e] hover:border-[#6a5a3a]"}`}>
                {f === "frame" ? "🔲 FRAME" : "⬛ FILL"}
              </button>
            ))}
          </div>

          {p.fillMode === "fill" && (
            <Slider label="Fill Density (layers inside)" value={p.fillDensity} min={1} max={6} step={1} onChange={v => p.setFillDensity(v)} />
          )}

          {/* Parameters as sliders */}
          {p.paramDefs.length > 0 && (
            <div className="border border-[#2e2518] rounded-sm p-2 bg-[#060402]">
              {p.paramDefs.map((def: ParamDef) => (
                <Slider key={def.id}
                  label={def.label}
                  value={p.params[def.id] ?? def.val}
                  min={def.min} max={def.max}
                  step={def.step ?? (def.max - def.min <= 20 ? 1 : "any")}
                  onChange={v => p.setParam(def.id, v)}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Position */}
      {sec("pos", "📍 Base Position", (
        <div className="px-3">
          <div className="grid grid-cols-3 gap-1.5">
            {[["X", p.posX, p.setPosX], ["Y", p.posY, p.setPosY], ["Z", p.posZ, p.setPosZ]].map(([label, val, setter]) => (
              <div key={label as string}>
                <Lbl>{label as string}</Lbl>
                <Inp value={val as number} onChange={v => (setter as any)(parseFloat(v) || 0)} step="10" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* YPR + Scale — ALL LIVE */}
      {sec("ypr", "🔄 Rotation & Scale  [LIVE]", (
        <div className="px-3">
          <Slider label="Yaw (Y-axis rotation °)" value={p.yaw} min={-180} max={180} step={1} onChange={p.setYaw} />
          <Slider label="Pitch (X-axis tilt °)" value={p.pitch} min={-180} max={180} step={1} onChange={p.setPitch} />
          <Slider label="Roll (Z-axis bank °)" value={p.roll} min={-180} max={180} step={1} onChange={p.setRoll} />
          <Slider label="Scale" value={p.scaleVal} min={0.1} max={5} step={0.05} onChange={p.setScaleVal} />
          <div className="mt-1 grid grid-cols-3 gap-1 text-[10px] text-center">
            {[
              ["P", p.pitch, p.setPitch], ["Y", p.yaw, p.setYaw], ["R", p.roll, p.setRoll]
            ].map(([label, val, setter]) => (
              <div key={label as string}>
                <Lbl>{label as string} exact</Lbl>
                <Inp value={val as number} onChange={v => (setter as any)(parseFloat(v) || 0)} step="1" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Options */}
      {sec("opts", "⚙ Options", (
        <div className="px-3 space-y-1.5">
          {p.format === "json" && (
            <>
              <Lbl>CE Persistency</Lbl>
              <select value={p.cePersist} onChange={e => p.setCePersist(parseInt(e.target.value))}
                className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]">
                <option value={0}>0 — disabled (recommended)</option>
                <option value={1}>1 — enabled</option>
              </select>
            </>
          )}
          <label className="flex items-center gap-2 text-[10px] text-[#6a5a3a] cursor-pointer">
            <input type="checkbox" className="accent-[#d4a017]" checked={p.includeHelper} onChange={e => p.setIncludeHelper(e.target.checked)} />
            Include SpawnObject() helper
          </label>
          <label className="flex items-center gap-2 text-[10px] text-[#6a5a3a] cursor-pointer">
            <input type="checkbox" className="accent-[#d4a017]" checked={p.autoRotate} onChange={e => p.setAutoRotate(e.target.checked)} />
            Auto-spin 3D preview
          </label>
        </div>
      ))}

      {/* Stats */}
      <div className="px-3 mx-3 mt-3 rounded-sm border border-[#2e2518] p-2 bg-[#060402] text-[10px]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="text-[#5a4a2e]">Objects</div><div className="text-[#d4a017] font-bold">{p.objCount}</div>
          <div className="text-[#5a4a2e]">Format</div><div className="text-[#d4a017]">{p.format === "initc" ? "init.c" : "JSON"}</div>
          <div className="text-[#5a4a2e]">Mode</div><div className="text-[#d4a017]">{p.fillMode}{p.fillMode === "fill" ? ` d${p.fillDensity}` : ""}</div>
          <div className="text-[#5a4a2e]">Scale</div><div className="text-[#d4a017]">{p.scaleVal.toFixed(2)}×</div>
          <div className="text-[#5a4a2e]">Y/P/R</div><div className="text-[#d4a017]">{p.yaw}°/{p.pitch}°/{p.roll}°</div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-3 mt-3 flex flex-col gap-1.5">
        <button onClick={p.onGenerate}
          className="w-full py-2.5 bg-[#d4a017] text-[#0a0804] font-black text-[12px] tracking-widest rounded-sm hover:bg-[#e8b82a] transition-all shadow-lg">
          ⚙ GENERATE CODE
        </button>
        <button onClick={p.onClear}
          className="w-full py-1.5 bg-[#1e1608] text-[#5a4a2e] text-[11px] font-bold rounded-sm hover:bg-[#2e2518] hover:text-[#8a7a5a] transition-all">
          ✕ Clear Output
        </button>
      </div>
    </div>
  );
}

// ─── TEXT SIDEBAR ─────────────────────────────────────────────────────────────
function TextSidebar(p: any) {
  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <Sec>✏ Text Input [LIVE PREVIEW]</Sec>
      <div className="px-3">
        <Lbl>Type your text (A–Z, 0–9, !?., space)</Lbl>
        <input type="text" value={p.textInput} onChange={e => p.setTextInput(e.target.value.toUpperCase())}
          placeholder="DAYZ"
          className="w-full bg-[#060402] border-2 border-[#d4a017] text-[#d4a017] text-xl px-3 py-2 rounded-sm mb-2 focus:outline-none font-mono font-black tracking-[0.3em] text-center"
        />
        <Slider label="Letter Height (m)" value={p.textLetterH} min={3} max={50} step={1} onChange={p.setTextLetterH} />
        <Slider label="Letter Spacing" value={p.textSpacing} min={0.8} max={2.5} step={0.05} onChange={p.setTextSpacing} />
        <Slider label="Extrusion Depth (m)" value={p.textDepth} min={0} max={40} step={1} onChange={p.setTextDepth} />
        <Slider label="Height Rings" value={p.textRings} min={1} max={6} step={1} onChange={p.setTextRings} />
        <Slider label="Scale" value={p.textScale} min={0.1} max={10} step={0.1} onChange={p.setTextScale} />
      </div>

      <Sec>📦 Object</Sec>
      <div className="px-3">
        <select className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
          value={p.textObj} onChange={(e: any) => p.setTextObj(e.target.value)}>
          {OBJECT_GROUPS.map((group: string) => (
            <optgroup key={group} label={group}>
              {DAYZ_OBJECTS.filter((o: any) => o.group === group).map((o: any) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <Lbl>Custom Classname</Lbl>
        <input type="text" value={p.textObj} onChange={(e: any) => p.setTextObj(e.target.value)}
          className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
        />
      </div>

      <Sec>📍 Base Position</Sec>
      <div className="px-3 grid grid-cols-3 gap-1.5">
        {[["X", p.textPosX, p.setTextPosX], ["Y", p.textPosY, p.setTextPosY], ["Z", p.textPosZ, p.setTextPosZ]].map(([label, val, setter]) => (
          <div key={label as string}>
            <Lbl>{label as string}</Lbl>
            <Inp value={val as number} onChange={v => (setter as any)(parseFloat(v) || 0)} step="10" />
          </div>
        ))}
      </div>

      <Sec>📄 Format</Sec>
      <div className="flex gap-1 px-3 mb-3">
        {(["initc", "json"] as OutputFormat[]).map(f => (
          <button key={f} onClick={() => p.setTextFormat(f)}
            className={`flex-1 py-1.5 text-[11px] rounded-sm border font-bold transition-all ${p.textFormat === f ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017]" : "border-[#2e2518] text-[#5a4a2e] hover:border-[#6a5a3a]"}`}>
            {f === "initc" ? "init.c" : "JSON"}
          </button>
        ))}
      </div>

      {/* Live stats */}
      <div className="px-3 mx-3 rounded-sm border border-[#2e2518] p-2 bg-[#060402] text-[10px]">
        <div className="flex justify-between mb-1"><span className="text-[#5a4a2e]">Objects</span><span className="text-[#d4a017] font-bold">{p.objCount}</span></div>
        <div className="flex justify-between"><span className="text-[#5a4a2e]">Scale</span><span className="text-[#d4a017]">{p.textScale.toFixed(2)}×</span></div>
      </div>

      <div className="px-3 mt-3">
        <button onClick={p.onGenerate}
          className="w-full py-2.5 bg-[#d4a017] text-[#0a0804] font-black text-[12px] tracking-widest rounded-sm hover:bg-[#e8b82a] transition-all shadow-lg">
          ⚙ GENERATE TEXT CODE
        </button>
      </div>

      <Sec>Supported Characters</Sec>
      <div className="px-3 text-[10px] text-[#5a4a2e] leading-loose">A B C D E F G H I J K L M N O P Q R S T U V W X Y Z<br />0 1 2 3 4 5 6 7 8 9  !  ?  .  ,  (space)</div>
    </div>
  );
}
