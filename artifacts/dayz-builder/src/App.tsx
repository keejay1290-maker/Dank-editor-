import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { getShapePoints, Point3D } from "@/lib/shapeGenerators";
import { MAX_OBJECTS } from "@/lib/constants";
import { SHAPE_DEFS, SHAPE_GROUPS, ParamDef } from "@/lib/shapeParams";
import { DAYZ_OBJECTS, OBJECT_GROUPS, formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import { COMPLETED_BUILDS, CompletedBuild } from "@/lib/completedBuilds";
import { getObjectLength, OBJECT_LENGTHS } from "@/lib/objectFamilies";
import { generateBuildInterior, interiorToInitC, interiorToJSON } from "@/lib/buildInteriorData";
import WeaponBuilder from "@/WeaponBuilder";
import BunkerMaker from "@/BunkerMaker";
import MazeMaker from "@/MazeMaker";
import RaceTrackMaker from "@/RaceTrackMaker";
import RandomStructureMaker from "@/RandomStructureMaker";
import ConstructionZoneMaker from "@/ConstructionZoneMaker";
import ShipwreckBuilder from "@/ShipwreckBuilder"; // 🚢 NEW
import TeleportMaker from "@/TeleportMaker";
import PointCloud3D from "@/PointCloud3D";
import AirdropDashboard from "@/AirdropDashboard";
import BuildMover from "@/BuildMover";
import FreewayMaker from "@/FreewayMaker";
import TraderMaker from "@/TraderMaker";
import TerrainMaker from "@/TerrainMaker";
import DankVault from "@/DankVault";
import { executePipeline, PipelineContext } from "@/lib/pipeline";
import { generateExportPackage, downloadFile } from "@/lib/exporter";
import { addBuildToRegistry, initRegistry, getAllBuildsFromRegistry, RegistryBuild } from "@/lib/buildRegistry";
import BuildLibrary from "@/BuildLibrary";
import { safeScanAllShapes } from "@/lib/scanAllShapes";
import { preValidateBuild } from "@/lib/permanentPatch";
import { loadPrebuildGeometry } from "@/lib/prebuildLoader";
import { VAULT_FILES } from "@/lib/vaultData";

type EditorMode = "architect" | "text" | "builds" | "weapons" | "bunker" | "maze" | "race" | "random" | "conzone" | "shipwreck" | "teleport" | "airdrops" | "mover" | "freeway" | "trader" | "terrain" | "vault" | "validation";
import ValidationDashboard from "./ValidationDashboard";
import { validateAllBuilds } from "./lib/validateAllBuilds";
import { autoFixBuild } from "./lib/autoFixBuild";
import { startNightlyScheduler } from "./lib/nightlyAutoValidate";
import { cleanupBuild } from "./lib/cleanupBuild";
import { diffBuilds, BuildDiff } from "./lib/diffBuilds";
import { evolveBuild, EvolutionMode } from "./lib/evolveBuild";
import { computeBuildDNA, encodeDNA, decodeDNA } from "./lib/buildDNA";
import { exportDankBuild, importDankBuild } from "./lib/buildSharing";
import { applyPackagingProfile, PackagingProfile } from "./lib/applyPackagingProfile";
import { runSandboxIntelligence } from "./lib/runSandboxIntelligence";
import { estimateStress, StressScenario } from "./lib/stressTest";
import { getReplaySteps } from "./lib/buildReplay";
import { auditAllBuilds } from "./lib/auditAllBuilds";

type OutputFormat = "initc" | "json";


// ─── TEXT FONT ─────────────────────────────────────────────────────────────
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

function getTextPoints(text: string, letterH: number, letterSpacing: number, depth: number, rings: number, arcDeg = 0): Point3D[] {
  // First pass: collect all flat points and track total text width
  const flatPts: Array<{ x: number; y: number; z: number }> = [];
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
          flatPts.push({ x: xOffset + (x1 + (x2 - x1) * t) * letterH, y, z: (z1 + (z2 - z1) * t) * letterH });
        }
      }
    }
    xOffset += letterH * letterSpacing;
    if (ch === " ") xOffset -= letterH * 0.4;
  }
  const totalW = xOffset;

  // If no arc, return flat
  if (Math.abs(arcDeg) < 1 || totalW < 0.1) return flatPts;

  // Arc mode: curve text along a horizontal arc in the XZ (ground) plane
  // arcDeg = total angular span of the text (positive = curves toward Z+)
  const arcRad = arcDeg * Math.PI / 180;
  const R = totalW / arcRad; // arc radius
  const sign = arcDeg > 0 ? 1 : -1;

  return flatPts.map(pt => {
    // Map pt.x (horizontal text position) to an angle on the arc, centred
    const theta = (pt.x / totalW) * arcRad - arcRad / 2;
    const ax = R * Math.sin(theta) * sign;
    const az = R * (1 - Math.cos(theta)) * sign; // z offset for curvature
    return { x: ax, y: pt.y, z: pt.z + az };
  });
}

// ─── 3D RENDERER ─────────────────────────────────────────────────────────────
function use3DCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rotRef = useRef({ x: -0.4, y: 0.5 });
  const dragRef = useRef({ dragging: false, lx: 0, ly: 0 });
  const zoomRef = useRef(2.0);
  const animRef = useRef<number | null>(null);
  const autoRef = useRef(false);
  const ptsRef = useRef<Point3D[]>([]);
  const scaleRef = useRef(1.0);
  const pitchRef = useRef(0);
  const rollRef = useRef(0);
  // CSS logical dimensions (used for drawing math, canvas.width = W * dpr)
  const cssDimsRef = useRef({ w: 0, h: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Physical pixel dimensions â€" the actual canvas buffer size
    const PW = canvas.width;
    const PH = canvas.height;
    // CSS dimensions â€" used for projection math (centering, spread)
    const W = cssDimsRef.current.w || PW / dpr;
    const H = cssDimsRef.current.h || PH / dpr;
    if (PW <= 0 || PH <= 0) return;

    const pts = ptsRef.current;
    const userScale = scaleRef.current;

    // â"€â"€ Draw directly in physical pixels â€" no ctx.scale, so every coordinate
    //    is an integer screen pixel. This is the key to crispness on retina/mobile.
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#060402";
    ctx.fillRect(0, 0, PW, PH);

    if (!pts.length) {
      ctx.fillStyle = "#0e2010";
      ctx.font = `bold ${Math.round(12 * dpr)}px 'Courier New'`;
      ctx.textAlign = "center";
      ctx.fillText("â† Configure shape  Â·  real-time 3D updates instantly", Math.round(PW / 2), Math.round(PH / 2));
      return;
    }

    const rx = rotRef.current.x, ry = rotRef.current.y;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const pitch = pitchRef.current * Math.PI / 180;
    const roll  = rollRef.current  * Math.PI / 180;
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    const cosRoll  = Math.cos(roll),  sinRoll  = Math.sin(roll);
    const zoom = zoomRef.current;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity,
        minZ = Infinity, maxZ = -Infinity;
    pts.forEach(p => {
      if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.z)) return;
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    });
    if (!isFinite(minX) || !isFinite(maxX)) return;

    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;
    const spread = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1);
    const baseZoom = Math.min(W, H) * 0.4 / spread * zoom;

    // Project to CSS pixels first, then scale to physical pixels at the last step
    const projected = pts.map(p => {
      if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.z)) return null;
      let lx = (p.x - cx) * userScale, ly = (p.y - cy) * userScale, lz = (p.z - cz) * userScale;
      const ly2 = ly * cosPitch - lz * sinPitch;
      const lz2 = ly * sinPitch + lz * cosPitch;
      const lx3 = lx * cosRoll  + ly2 * sinRoll;
      const ly3 = -lx * sinRoll + ly2 * cosRoll;
      const lz3 = lz2;
      const rx1 = lx3 * cosY + lz3 * sinY;
      const rz1 = -lx3 * sinY + lz3 * cosY;
      const ry2 = ly3 * cosX - rz1 * sinX;
      const rz2 = ly3 * sinX + rz1 * cosX;
      const fov = 700;
      const sc  = fov / (fov + rz2 + spread * 1.5);
      // Convert to physical pixels â€" round to nearest integer for pixel-perfect placement
      const px = Math.round((W / 2 + rx1 * baseZoom * sc) * dpr);
      const py = Math.round((H / 2 - ry2 * baseZoom * sc) * dpr);
      return { px, py, depth: rz2 };
    }).filter(Boolean) as { px: number; py: number; depth: number }[];

    projected.sort((a, b) => b.depth - a.depth);
    const maxD = spread * 1.5, minD = -spread * 1.5;

    // â"€â"€ Zoom-aware dot size: cap scales WITH zoom so dots shrink at low zoom
    //    preventing them from overlapping into a solid blob when zoomed out
    const zoomCap  = Math.max(1.5, 4.0 * dpr * Math.min(1, zoom * 0.75));
    const baseDotPhys = Math.max(1, Math.min(zoomCap, (380 / Math.sqrt(pts.length + 1)) * zoom * dpr));

    // â"€â"€ Occlusion culling at low zoom: skip dots that land on an already-drawn cell
    //    This breaks up the blob by showing only one dot per occupied pixel region
    const cullCell  = zoom < 1.2 ? Math.max(1, Math.round(baseDotPhys * 1.4)) : 0;
    const occupied  = cullCell > 0 ? new Set<number>() : null;

    projected.forEach(({ px, py, depth }) => {
      // Occlusion check â€" keyed by grid cell so nearby dots are skipped
      if (occupied) {
        const cx2 = Math.round(px / cullCell);
        const cy2 = Math.round(py / cullCell);
        const key = cx2 * 100003 + cy2; // prime-multiplied hash to avoid collisions
        if (occupied.has(key)) return;
        occupied.add(key);
      }

      const t = Math.max(0, Math.min(1, (depth - minD) / (maxD - minD)));
      // â"€â"€ Wider depth range: front bright gold, back very dim brown (better separation)
      const r = Math.round(220 * t + 50 * (1 - t));
      const g = Math.round(160 * t + 70 * (1 - t));
      const b = Math.round(20  * t + 6  * (1 - t));
      const alpha = 0.28 + 0.72 * t;    // was 0.6+0.4 â€" now much wider range
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;

      // Front dots slightly larger than back dots for natural depth cue
      const rad = baseDotPhys * (0.7 + 0.3 * t);

      // â"€â"€ Crisp rendering: small â†' fillRect (zero blur), larger â†' arc at integer centre
      if (rad <= 2) {
        const s = Math.max(1, Math.round(rad * 2));
        ctx.fillRect(px - (s >> 1), py - (s >> 1), s, s);
      } else {
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // HUD â€" scale font to physical pixels
    ctx.fillStyle = "rgba(212,160,23,0.9)";
    ctx.font = `bold ${Math.round(11 * dpr)}px 'Courier New'`;
    ctx.textAlign = "left";
    ctx.fillText(
      `â— LIVE  ${pts.length.toLocaleString()} pts  Ã—${zoom.toFixed(2)}`,
      Math.round(9 * dpr), Math.round(17 * dpr)
    );
    if (pts.length >= MAX_OBJECTS) {
      ctx.fillStyle = "#e74c3c";
      ctx.fillText("âš  LIMIT REACHED (1200)", Math.round(9 * dpr), Math.round(32 * dpr));
    }
  }, [canvasRef]);

  const zoomStep = useCallback((factor: number) => {
    zoomRef.current = Math.max(0.5, Math.min(8, zoomRef.current * factor));
    if (!autoRef.current) draw();
  }, [draw]);

  const resetZoom = useCallback(() => {
    zoomRef.current = 2.0;
    rotRef.current = { x: -0.4, y: 0.5 };
    if (!autoRef.current) draw();
  }, [draw]);

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
    const clampZoom = (z: number) => Math.max(0.5, Math.min(8, z));
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = clampZoom(zoomRef.current * (e.deltaY > 0 ? 0.88 : 1.12));
      if (!autoRef.current) draw();
    };
    // Pinch-to-zoom â€" track distance between two fingers
    let lastPinchDist = 0;
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragRef.current = { dragging: true, lx: e.touches[0].clientX, ly: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        dragRef.current.dragging = false;
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (lastPinchDist > 0) {
          zoomRef.current = clampZoom(zoomRef.current * (dist / lastPinchDist));
        }
        lastPinchDist = dist;
        if (!autoRef.current) draw();
      } else if (e.touches.length === 1 && dragRef.current.dragging) {
        // Single-finger rotate
        rotRef.current.y += (e.touches[0].clientX - dragRef.current.lx) * 0.012;
        rotRef.current.x += (e.touches[0].clientY - dragRef.current.ly) * 0.012;
        dragRef.current.lx = e.touches[0].clientX;
        dragRef.current.ly = e.touches[0].clientY;
        if (!autoRef.current) draw();
      }
    };
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
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

  // Resize observer â€" DPR-aware sizing prevents blurriness on HiDPI screens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    let rafId: number | null = null;
    const resizeCanvas = (parent: Element) => {
      const rect = parent.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      cssDimsRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      // Explicit CSS dimensions prevent CSS from stretching/distorting the buffer
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      draw();
    };
    const obs = new ResizeObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (canvas.parentElement) resizeCanvas(canvas.parentElement);
        rafId = null;
      });
    });
    obs.observe(canvas.parentElement);
    resizeCanvas(canvas.parentElement);
    return () => {
      obs.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [draw]);

  return { updatePoints, startAutoRotate, stopAutoRotate, draw, zoomStep, resetZoom };
}

// ─── QUICK PRESETS ──────────────────────────────────────────────────────────
type Preset = { label: string; shape: string; params: Record<string, number>; category: string; suggestedClass?: string };
const QUICK_PRESETS: Preset[] = COMPLETED_BUILDS.map(b => ({
  category: b.category,
  label: b.name,
  shape: b.shape,
  params: b.params,
  suggestedClass: b.frameObj
}));


// Arena shapes available for randomization
const ARENA_SHAPES = ['arena_colosseum', 'arena_fort', 'arena_maze', 'arena_siege', 'arena_compound', 'pvp_arena', 'wall_perimeter'] as const;

// ─── FAMOUS CHERNARUS LOCATIONS ──────────────────────────────────────────────
const FAMOUS_LOCATIONS = [
  { name: "NWAF (Airfield)",           x: 4630,  y: 135, z: 10490 },
  { name: "Chernogorsk (City)",        x: 11500, y: 130, z: 2500  },
  { name: "Elektrozavodsk (Docks)",    x: 4980,  y: 10,  z: 2320  },
  { name: "Berezino (Port)",           x: 11950, y: 148, z: 12540 },
  { name: "Tisy (Military)",           x: 1500,  y: 260, z: 11700 },
  { name: "Zelenogorsk (Town)",        x: 2200,  y: 250, z: 8500  },
  { name: "Vybor (Military)",          x: 3200,  y: 300, z: 4000  },
  { name: "Svetlojarsk (Port)",        x: 14800, y: 200, z: 12500 },
  { name: "Balota (Airfield)",         x: 6500,  y: 10,  z: 2500  },
  { name: "Krasnostav (Airfield)",     x: 10200, y: 10,  z: 2100  },
  { name: "Solnichniy (Quarry)",       x: 13000, y: 10,  z: 7000  },
  { name: "Kamyshovo (Coastal)",       x: 13000, y: 200, z: 4500  },
  { name: "Pavlovo (Town)",            x: 2800,  y: 250, z: 5900  },
  { name: "Pogorevka (Farm)",          x: 4000,  y: 200, z: 8000  },
  { name: "Pustoshka (Town)",          x: 6200,  y: 230, z: 7800  },
  { name: "Stary Sobor (Hub)",         x: 9000,  y: 200, z: 7200  },
  { name: "Novy Sobor (Central)",      x: 7200,  y: 200, z: 7800  },
  { name: "Gorka (Inland)",            x: 2400,  y: 200, z: 7500  },
  { name: "Grishino (Central)",        x: 3200,  y: 150, z: 5200  },
  { name: "Altar (Mountain)",          x: 6800,  y: 400, z: 6000  },
  { name: "Green Mountain (Tower)",    x: 3800,  y: 380, z: 6900  },
  { name: "Nizhnoye (Coastal)",        x: 7500,  y: 400, z: 12000 },
  { name: "Pusta (Rural)",             x: 10000, y: 200, z: 6500  },
  { name: "Shakhovka (Town)",          x: 11400, y: 200, z: 4900  },
  { name: "Prigorodki (Coastal)",      x: 1800,  y: 10,  z: 2200  },
  // ─── Sakhal ─────────────────────────────────────────────────────────────────
  { name: "Sakhal: Base Alpha",        x: 4200, y: 200, z: 6800 },
  { name: "Sakhal: Port Beta",         x: 6500, y: 10,  z: 4200 },
  { name: "Sakhal: Outpost Gamma",     x: 3800, y: 50,  z: 3200 },

  { name: "StaticObj_Wall_VilVar2_4_2",             x: 7200, y: 5,   z: 5600 },
  { name: "StaticObj_Wall_VilVar2_4_2",      x: 5000, y: 850, z: 5000 },
  { name: "StaticObj_Wall_VilVar2_4_2",         x: 4800, y: 15,  z: 4500 },
];

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState<EditorMode>("vault");

  // Architect
  const [shapeType, setShapeType] = useState("star_fort");
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>("FOB Bastion");
  const [params, setParams] = useState<Record<string, number>>(() => {
    const d: Record<string, number> = {};
    SHAPE_DEFS["star_fort"].params.forEach(p => { d[p.id] = p.val; });
    return d;
  });
  const [objClass, setObjClass] = useState("Land_HBarrier_5m");
  const [posX, setPosX] = useState(11950); // Default to Krasnoe
  const [posY, setPosY] = useState(140);   // Enforced Krasno Y
  const [posZ, setPosZ] = useState(12600);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [scaleVal, setScaleVal] = useState(1.0);

  // 🚀 FIX 4: Reactive Coordinate Enforcement (App.tsx)
  useEffect(() => {
    if (posX > 4000 && posX < 4100 && posY !== 340) {
      console.log("[COORDINATE_AUDIT] NWAF detected, enforcing posY=340");
      setPosY(340);
    } else if (posX > 11900 && posX < 12000 && posY !== 140) {
      console.log("[COORDINATE_AUDIT] Krasno detected, enforcing posY=140");
      setPosY(140);
    }
  }, [posX, posY]);

  const [format, setFormat] = useState<OutputFormat>("initc");
  const [cePersist, setCePersist] = useState(0);
  const [includeHelper, setIncludeHelper] = useState(true);
  const [extraObjs, setExtraObjs] = useState("");
  const [stackY, setStackY] = useState(0);
  const [pipelineCtx, setPipelineCtx] = useState<PipelineContext | null>(null);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [performanceRef, setPerformanceRef] = useState<any>(null);
  const [buildDna, setBuildDna] = useState<string | null>(null);
  const [packagingProfile, setPackagingProfile] = useState<PackagingProfile>("default");
  const [output, setOutput] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);
  const [autoOrient, setAutoOrient] = useState(false);
  const [orientInward, setOrientInward] = useState(false);
  const [jitter, setJitter] = useState(0);
  const [buildNotes, setBuildNotes] = useState("");

  // ─── GLOBAL PROJECT MANAGEMENT ──────────────────────────────────
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [snapGrid, setSnapGrid] = useState(0); 
  const [snapAngle, setSnapAngle] = useState(0); 
  const [showProjectTools, setShowProjectTools] = useState(false);

  const captureState = useCallback(() => {
    const currentState = {
      mode, shapeType, params: { ...params }, objClass, posX, posY, posZ, yaw, pitch, roll, scaleVal,
      autoOrient, orientInward, jitter, buildNotes
    };
    setHistory(prev => [...prev.slice(-19), currentState]);
    setRedoStack([]);
  }, [mode, shapeType, params, objClass, posX, posY, posZ, yaw, pitch, roll, scaleVal, autoOrient, orientInward, jitter, buildNotes]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const current = { mode, shapeType, params: { ...params }, objClass, posX, posY, posZ, yaw, pitch, roll, scaleVal, autoOrient, orientInward, jitter, buildNotes };
    setRedoStack(r => [...r, current]);
    setHistory(h => h.slice(0, -1));
    setMode(prev.mode); setShapeType(prev.shapeType); setParams(prev.params);
    setObjClass(prev.objClass); setPosX(prev.posX); setPosY(prev.posY); setPosZ(prev.posZ);
    setYaw(prev.yaw); setPitch(prev.pitch); setRoll(prev.roll); setScaleVal(prev.scaleVal);
    setAutoOrient(prev.autoOrient); setOrientInward(prev.orientInward); setJitter(prev.jitter);
    setBuildNotes(prev.buildNotes || "");
  }, [history, mode, shapeType, params, objClass, posX, posY, posZ, yaw, pitch, roll, scaleVal, autoOrient, orientInward, jitter, buildNotes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const current = { mode, shapeType, params: { ...params }, objClass, posX, posY, posZ, yaw, pitch, roll, scaleVal, autoOrient, orientInward, jitter, buildNotes };
    setHistory(h => [...h, current]);
    setRedoStack(r => r.slice(0, -1));
    setMode(next.mode); setShapeType(next.shapeType); setParams(next.params);
    setObjClass(next.objClass); setPosX(next.posX); setPosY(next.posY); setPosZ(next.posZ);
    setYaw(next.yaw); setPitch(next.pitch); setRoll(next.roll); setScaleVal(next.scaleVal);
    setAutoOrient(next.autoOrient); setOrientInward(next.orientInward); setJitter(next.jitter);
    setBuildNotes(next.buildNotes || "");
  }, [redoStack, mode, shapeType, params, objClass, posX, posY, posZ, yaw, pitch, roll, scaleVal, autoOrient, orientInward, jitter, buildNotes]);

  const saveProject = useCallback(() => {
    const project = {
      version: "2.5",
      state: { mode, shapeType, params, objClass, posX, posY, posZ, yaw, pitch, roll, scaleVal, autoOrient, orientInward, jitter, buildNotes }
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `dank_project_${shapeType}_${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [mode, shapeType, params, objClass, posX, posY, posZ, yaw, pitch, roll, scaleVal, autoOrient, orientInward, jitter, buildNotes]);

  const loadProject = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const project = JSON.parse(ev.target?.result as string);
        if (project.state) {
          const s = project.state;
          setMode(s.mode); setShapeType(s.shapeType); setParams(s.params);
          setObjClass(s.objClass); setPosX(s.posX); setPosY(s.posY); setPosZ(s.posZ);
          setYaw(s.yaw); setPitch(s.pitch); setRoll(s.roll); setScaleVal(s.scaleVal);
          setAutoOrient(s.autoOrient); setOrientInward(s.orientInward); setJitter(s.jitter);
          setBuildNotes(s.buildNotes || "");
        }
      } catch (err) { console.error("Load failed", err); }
    };
    reader.readAsText(file);
  }, []);

  const applySnap = (val: number, step: number) => step > 0 ? Math.round(val / step) * step : val;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // 🏗️ UNIFIED VALIDATION STATE
  const [validationResults, setValidationResults] = useState<any[]>([]);

  // ——— UNIFIED PREBUILDS LIST ——————————————————————————————————————————————————————
  const allAvailablePrebuilds = useMemo(() => {
    const list = [
      ...COMPLETED_BUILDS.map(b => ({ ...b, category: b.category || "Masterpiece" })),
      ...validationResults.filter(r => r.source === "Registry") // Any temp builds
    ];
    // Unique by ID
    return list.filter((b: any, i: number, self: any[]) => self.findIndex((t: any) => t.id === b.id) === i);
  }, [validationResults]);

  const [toast, setToast] = useState("");
  const [objSearch, setObjSearch] = useState("");
  const [textObjSearch, setTextObjSearch] = useState("");
  const [presetFilter, setPresetFilter] = useState("");
  const [presetCategory, setPresetCategory] = useState("All");

  // â"€â"€ FAVOURITES â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const [favourites, setFavourites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("dayz_fav_presets") ?? "[]"); } catch { return []; }
  });
  const toggleFavourite = useCallback((label: string) => {
    setFavourites(prev => {
      const next = prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label];
      try { localStorage.setItem("dayz_fav_presets", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Completed Builds mode
  const [selectedBuildId, setSelectedBuildId] = useState<string>(COMPLETED_BUILDS[0]?.id || "");
  const [buildFilter, setBuildFilter] = useState("");
  const [buildCategory, setBuildCategory] = useState("All");
  const [zipGenerating, setZipGenerating] = useState(false);
  const [addInteriorRooms, setAddInteriorRooms] = useState(false);
  const [addInteriorFurniture, setAddInteriorFurniture] = useState(true);
  const [intFloors, setIntFloors] = useState(2);
  const [intFloorH, setIntFloorH] = useState(4);
  const [intRoomSize, setIntRoomSize] = useState(8);
  const [lootSeed, setLootSeed] = useState(() => Math.floor(Math.random() * 99999));


  // Live object count for selected build (replaces hardcoded b.frameCount)
  const selectedBuildLiveCount = useMemo(() => {
    if (pipelineCtx) return (pipelineCtx as any).objects_final.length || pipelineCtx.points.length;
    const b = COMPLETED_BUILDS.find(x => x.id === selectedBuildId);
    if (!b) return 0;
    const basePts = getShapePoints(b.shape, b.params);
    return basePts.length;
  }, [selectedBuildId, pipelineCtx]);

  // Auto-run pipeline whenever a build is selected in builds mode
  // Populates pipelineCtx + output so the Download button works without an extra click
  useEffect(() => {
    if (mode !== "builds" || !selectedBuildId) return;
    const b = COMPLETED_BUILDS.find(x => x.id === selectedBuildId);
    if (!b) return;
    let cancelled = false;
    executePipeline(
      "AutoPreview",
      (b.category || "").toLowerCase().includes("sci-fi") ? "death_star" : "generic",
      0,
      { ...b.params, buildName: b.name, posX: b.posX, posY: b.posY, posZ: b.posZ, shape: b.shape },
      () => getShapePoints(b.shape, b.params)
    ).then(ctx => {
      if (cancelled) return;
      const processed = runSandboxIntelligence(ctx);
      setPipelineCtx(processed);
      setOutput(JSON.stringify({ Objects: processed.objects_final }, null, 2));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [selectedBuildId, mode]);

  // Text maker
  const [textInput, setTextInput] = useState("DAYZ");
  const [textObj, setTextObj] = useState("Land_Container_1Bo");
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
  const [textArcDeg, setTextArcDeg] = useState(0);

  // ─── SANDBOX STATE ─────────────────────────────────────────────────────────
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [sandboxHUD, setSandboxHUD] = useState(false);
  const [sandboxOverlays, setSandboxOverlays] = useState({
    density: false,
    collision: false,
    navigation: false,
    symmetry: false,
    structural: false
  });
  const [replayActive, setReplayActive] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [stressScenario, setStressScenario] = useState<StressScenario | null>(null);
  const [stressResult, setStressResult] = useState<any>(null);
  const [developerMode, setDeveloperMode] = useState(false);
  const [showDebugGeometry, setShowDebugGeometry] = useState(false);


  // ─── SAVE / LOAD STATE ──────────────────────────────────────────────────────
  const captureCurrentState = useCallback(() => ({
    shapeType, params, posX, posY, posZ, yaw, pitch, roll,
    scaleVal, format, objClass, extraObjs,
    stackY, jitter, autoOrient, orientInward, buildNotes,
  }), [shapeType, params, posX, posY, posZ, yaw, pitch, roll,
    scaleVal, format, objClass, extraObjs,
    stackY, jitter, autoOrient, orientInward, buildNotes]);



  const restoreState = useCallback((s: any) => {
    setShapeType(s.shapeType ?? "deathstar");
    setParams(s.params ?? {});
    setPosX(s.posX ?? 12000); setPosY(s.posY ?? 150); setPosZ(s.posZ ?? 12600);
    setYaw(s.yaw ?? 0); setPitch(s.pitch ?? 0); setRoll(s.roll ?? 0);
    setScaleVal(s.scaleVal ?? 1);
    setFormat(s.format ?? "initc");
    setObjClass(s.objClass ?? "Land_Container_1Bo");
    setExtraObjs(s.extraObjs ?? "");
    setStackY(s.stackY ?? 0);
    setJitter(s.jitter ?? 0);
    setAutoOrient(s.autoOrient ?? false);
    setOrientInward(s.orientInward ?? false);
    setBuildNotes(s.buildNotes ?? "");
    setMode("architect");
  }, []);

  // â"€â"€ COMPUTE SHAPE POINTS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const rawPoints = useMemo((): Point3D[] => {
    if (mode === "builds" && selectedBuildId) {
      const b = COMPLETED_BUILDS.find(x => x.id === selectedBuildId);
      if (b) {
        try { return getShapePoints(b.shape, b.params); } catch (_) { /* skip */ }
      }
    }
    if (pipelineCtx && Array.isArray(pipelineCtx.points) && pipelineCtx.points.length > 0) {
      return pipelineCtx.points;
    }
    if (mode === "text") {
      return getTextPoints(textInput, textLetterH, textSpacing, textDepth, textRings, textArcDeg);
    }
    try { return getShapePoints(shapeType, params); } catch (_) { return []; }
  }, [pipelineCtx, mode, shapeType, params, selectedBuildId, textInput, textLetterH, textSpacing, textDepth, textRings, textArcDeg]);

  // All shapes render as hollow frames — displayPoints is always the raw frame points
  const displayPoints = useMemo(() => rawPoints, [rawPoints]);

  // Bounding-box dimensions in metres (scale-adjusted) â€" shown live in info bar
  const dims = useMemo(() => {
    if (!rawPoints.length) return null;
    const xs = rawPoints.map(p => p.x * scaleVal);
    const ys = rawPoints.map(p => p.y * scaleVal);
    const zs = rawPoints.map(p => p.z * scaleVal);
    return {
      w: (Math.max(...xs) - Math.min(...xs)).toFixed(1),
      h: (Math.max(...ys) - Math.min(...ys)).toFixed(1),
      d: (Math.max(...zs) - Math.min(...zs)).toFixed(1),
    };
  }, [rawPoints, scaleVal]);


  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setShapeType(preset.shape);
    setSelectedPresetLabel(preset.label);
    const newParams: Record<string, number> = {};
    SHAPE_DEFS[preset.shape]?.params.forEach(p => {
      newParams[p.id] = (preset.params as any)[p.id] ?? p.val;
    });
    setParams(newParams);
    if (preset.suggestedClass) {
      setObjClass(preset.suggestedClass);
      setObjSearch("");
    }
    showToast(`âœ" Loaded: ${preset.label}`);
    // Auto-generate after state settles
    setTimeout(() => generate(), 50);
  };

  const surpriseMe = () => {
    const pick = QUICK_PRESETS[Math.floor(Math.random() * QUICK_PRESETS.length)];
    applyPreset(pick);
  };

  const randomizeArenaParams = (shapeKey: string) => {
    const def = SHAPE_DEFS[shapeKey];
    if (!def) return;
    const newParams: Record<string, number> = {};
    def.params.forEach(pd => {
      const lo   = pd.min + (pd.max - pd.min) * 0.2;
      const hi   = pd.max - (pd.max - pd.min) * 0.1;
      const step = pd.step ?? 1;
      let v = lo + Math.random() * (hi - lo);
      if (step >= 1) v = Math.round(v);
      else v = Math.round(v / step) * step;
      newParams[pd.id] = v;
    });
    setShapeType(shapeKey);
    setParams(newParams);
    setMode("architect");
    showToast(`\u{1F3B2} ${def.label} \u2014 new layout!`);
  };

  const rollRandomArena = () => randomizeArenaParams(
    ARENA_SHAPES[Math.floor(Math.random() * ARENA_SHAPES.length)]
  );

  const rollSameArena = () => {
    const isArena = (ARENA_SHAPES as readonly string[]).includes(shapeType);
    if (isArena) randomizeArenaParams(shapeType);
    else rollRandomArena();
  };

  const onShapeChange = (st: string) => {
    setShapeType(st);
    setSelectedPresetLabel("");
    const newParams: Record<string, number> = {};
    SHAPE_DEFS[st]?.params.forEach(p => { newParams[p.id] = p.val; });
    setParams(newParams);
  };

  const setParam = (id: string, v: number) => setParams(prev => ({ ...prev, [id]: v }));

  // â"€â"€ BUILD CODE STRING (pure â€" returns without setting state) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  /**
   * 🏗️ LEGACY buildShapeCode REMOVED.
   * All generation must flow through executePipeline and use ctx.objects_final.
   */

  /**
   * 🏗️ LEGACY buildTextCode REMOVED.
   * All generation must flow through executePipeline and use ctx.objects_final.
   */

  const generateText = async () => {
    if (!displayPoints.length) return;
    
    try {
      // Build params and force shape normalization
      const rawShape = "text";
      const ctx = await executePipeline(
        "Text_Build_Engine",
        "generic",
        0,
        { 
          posX: textPosX, posY: textPosY, posZ: textPosZ,
          text: textInput,
          shape: rawShape,
          objClass: textObj,
          scale: textScale
        },
        () => getTextPoints(textInput, textLetterH, textSpacing, textDepth, textRings, textArcDeg)
      );
      
      const processed = runSandboxIntelligence(ctx);
      setPipelineCtx(processed);
      const latestObj = processed.objects_final;
      const json = JSON.stringify({ Objects: latestObj }, null, 2);
      setTextOutput(json);
      showToast(`✓ Text optimized (${latestObj.length} objects)`);
    } catch (e: any) {
      alert(`Pipeline error: ${e.message}`);
    }
  };

  const copyCode = (code: string) => navigator.clipboard.writeText(code).then(() => showToast("✓ Copied!"));

  const handleDownloadPackage = async (name: string, shape: string, buildParams: any, category?: string, formatType: "json" | "initc" = "json") => {
    setZipGenerating(true);
    try {
      const isSciFi = (category || "").toLowerCase().includes("sci-fi") || shape === "deathstar" || (name || "").toLowerCase().includes("death star");
      const theme = isSciFi ? "death_star" : "generic";
      
      const ctx = await executePipeline(
        "Dank-Global-Exporter",
        theme,
        0,
        { ...buildParams, buildName: name.replace(".json", "") },
        () => getShapePoints(shape, buildParams)
      );

      const pkg = generateExportPackage(ctx);
      const buildName = ctx.params.buildName || "DankBuild";
      
      if (formatType === "json") {
        const file = pkg.jsonFiles[0];
        if (file) downloadFile(file.content, file.name, "application/json");
      } else {
        const file = pkg.initcFiles[0];
        if (file) downloadFile(file.content, file.name, "text/plain");
      }
      showToast(`📦 Downloaded ${formatType.toUpperCase()} file directly!`);
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    } finally {
      setZipGenerating(false);
    }
  };

  const generate = async () => {
    if (!displayPoints.length) return;
    
    const theme = (selectedPresetLabel || "").toLowerCase().includes("death star") || shapeType === "deathstar" ? "death_star" : "generic";

    try {
      const ctx = await executePipeline(
        "Architect_Build_Engine",
        theme,
        0,
        { 
          ...params, 
          posX, posY, posZ, 
          yaw, pitch, roll, 
          scale: scaleVal,
          shape: shapeType,
          objClass,
          addInteriorRooms,
          addInteriorFurniture,
          buildName: selectedPresetLabel || "DankBuild" 
        },
        () => getShapePoints(shapeType, params)
      );
      
      const processed = runSandboxIntelligence(ctx);
      setPipelineCtx(processed);
      const latestObj = processed.objects_final;
      const json = JSON.stringify({ Objects: latestObj }, null, 2);
      setOutput(json);

      // Add to Registry
      addBuildToRegistry({
        id: `editor-${Date.now()}`,
        name: selectedPresetLabel || "Custom Build",
        category: "Custom",
        icon: "🛠️",
        tagline: "User-generated architectural build.",
        objectCount: latestObj.length,
        source: "editor",
        shape: shapeType,
        params,
        objects_final: latestObj,
        metadata: {
          size: json.length,
          tags: ["Custom"],
          timestamp: new Date().toISOString()
        }
      });

      showToast(`🛠️ Build optimized and added to Prebuilds Library!`);
    } catch (e: any) {
      alert(`Pipeline error: ${e.message}`);
    }
  };


  // ——— URL SHARE ———————————————————————————————————————————————————————————————————
  const shareCurrentBuild = useCallback(() => {
    try {
      const state = {
        s: shapeType,
        p: params,
        x: posX, y: posY, z: posZ,
        yw: yaw, pi: pitch, ro: roll,
        sc: scaleVal,
        cl: objClass,
        fo: format,
      };
      const encoded = btoa(JSON.stringify(state));
      const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      navigator.clipboard.writeText(url).then(() => showToast("✓ Share URL copied!"));
    } catch {
      showToast("⚠ Could not generate share URL");
    }
  }, [shapeType, params, posX, posY, posZ, yaw, pitch, roll, scaleVal, objClass, format]);

  // 🏗️ UNIFIED BUILD LOADER
  const loadBuildIntoEditor = async (build: CompletedBuild | any) => {
    
    // 1. Prepare Environment
    const shape = build.shape || build.id;
    const posX = build.posX ?? 12000;
    const posY = build.posY ?? 150;
    const posZ = build.posZ ?? 12600;
    const objClass = build.fillObj || "Land_Container_1Bo";
    const theme = (build.category || "").toLowerCase().includes("sci-fi") ? "death_star" : "generic";

    // 2. Load Real Geometry before Pipeline (Critical for Composites)
    let preloaded: any[] = [];
    const baked = loadPrebuildGeometry(shape);
    if (baked && baked.objects?.length) {
      preloaded = baked.objects;
    } else if (build.objects?.length) {
      preloaded = build.objects;
    }

    // 🏗️ PRE-PIPELINE VALIDATION HOOK (PERMANENT PATCH MODULE)
    const dummyCtx: any = { 
        shape, originalShape: shape, 
        objects: preloaded, 
        objects_final: [], 
        params: build.params || {},
        metadata: {} 
    };
    preValidateBuild(dummyCtx);
    
    // Use recovered geometry from patch if applicable
    if (dummyCtx.objects_final.length > 0) {
        preloaded = dummyCtx.objects_final;
    }

    // 3. UI Pre-Sync
    setShapeType(shape);
    setParams(build.params || {});
    setPosX(posX);
    setPosY(posY);
    setPosZ(posZ);
    setObjClass(objClass);
    setMode("architect");
    setSelectedBuildId(build.id);

    // 4. Run Unified Pipeline (Ensures Sandbox Intelligence attaches metadata)
    try {
      const ctx = await executePipeline(
        "Dank-Editor-Loader",
        theme,
        0,
        { 
          ...build.params, 
          shape, 
          posX, 
          posY, 
          posZ,
          objClass,
          preloadedObjects: preloaded 
        },
        () => getShapePoints(shape, build.params || {})
      );

      const processed = runSandboxIntelligence(ctx);
      setPipelineCtx(processed);
      setOutput(JSON.stringify({ Objects: processed.objects_final }, null, 2));
      setSandboxEnabled(true);
      setSandboxHUD(true);
      
    } catch (err: any) {
      console.error("[LOAD_BUILD_FATAL] Editor transition failed:", err);
      showToast(`❌ Materialization failure: ${err?.message || "Build data incompatible"}`);
    }
  };


  useEffect(() => {
    const runInitialValidation = async () => {
      try {
        const data = await validateAllBuilds();
        setValidationResults(data);
        startNightlyScheduler(); // 🌙 Start background scan
      } catch (e) {
        console.error("Initial validation failed", e);
      }
    };
    runInitialValidation();
  }, []);

  const getValidationStatus = (build: any) => {
    return validationResults.find(r => r.build === build.name || r.id === build.id);
  };

  const downloadCode = async (code: string, ext: string, name: string) => {
    const isArchitect = mode === "architect";
    if (!pipelineCtx) {
      alert("Please click 'Generate Build' first to lock the unified objects.");
      return;
    }

    // 📦 APPLY PACKAGING PROFILE
    const optimizedCtx = applyPackagingProfile(pipelineCtx, packagingProfile);

    const pkg = generateExportPackage(optimizedCtx);
    const files = ext === "json" ? pkg.jsonFiles : pkg.initcFiles;
    
    files.forEach(file => {
      downloadFile(file.content, file.name, ext === "json" ? "application/json" : "text/plain");
    });

    if (optimizedCtx.metadata.requires_split) {
      showToast(`⚡ Large buildup downloaded in ${optimizedCtx.metadata.split_parts?.length || 0} parts!`);
    }
  };

  const downloadBuild = async (build: CompletedBuild, fmt: "initc" | "json") => {
    const ctx = await executePipeline(
      "Prebuilt_Downloader",
      (build.category || "").toLowerCase().includes("sci-fi") ? "death_star" : "generic",
      lootSeed,
      {
        buildName: build.id,
        posX: build.posX,
        posY: build.posY,
        posZ: build.posZ,
        shape: build.shape,
        addInteriorRooms,
        addInteriorFurniture,
        interior_floors: intFloors,
        interior_floor_height: intFloorH,
        interior_room_size: intRoomSize,
        ...build.params,

      },
      () => getShapePoints(build.shape, build.params)
    );

    // 📦 APPLY PACKAGING PROFILE
    const optimizedCtx = applyPackagingProfile(ctx, packagingProfile);

    const pkg = generateExportPackage(optimizedCtx);
    const files = fmt === "json" ? pkg.jsonFiles : pkg.initcFiles;

    files.forEach(file => {
      downloadFile(file.content, file.name, fmt === "json" ? "application/json" : "text/plain");
    });

    const total = optimizedCtx.objects_final.length;
  };

  /**
   * 📄 XML PIPELINE HELPERS (Section 15, Fix 7/8)
   */
  const generateMapgroupposXml = (objects: any[]) => {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<mapgrouppos>',
      ...objects.map(o => `  <group name="${o.name}" pos="${o.pos[0].toFixed(3)} ${o.pos[1].toFixed(3)} ${o.pos[2].toFixed(3)}" ypr="${o.ypr[1].toFixed(3)} ${o.ypr[0].toFixed(3)} ${o.ypr[2].toFixed(3)}" />`),
      '</mapgrouppos>'
    ];
    return lines.join('\n');
  };

  const parseMapgroupPos = (xml: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const groups = doc.getElementsByTagName("group");
      const objs = [];
      for (let i = 0; i < groups.length; i++) {
          const g = groups[i];
          const name = g.getAttribute("name") || "";
          const posStr = g.getAttribute("pos") || "0 0 0";
          const yprStr = g.getAttribute("ypr") || "0 0 0";
          const pos = posStr.split(/\s+/).map(Number);
          const yprArray = yprStr.split(/\s+/).map(Number);
          // XML is YPR (Yaw, Pitch, Roll) vs Editor YPR
          objs.push({ name, pos, ypr: [yprArray[1], yprArray[0], yprArray[2]], scale: 1 });
      }
      return objs;
    } catch(e) {
      alert("XML Parse Failed: " + e);
      return [];
    }
  };

  const downloadAllBuilds = async () => {
    setZipGenerating(true);
    try {
      const allBuilds = getAllBuildsFromRegistry();
      const manifest = {
        Metadata: {
          Format: "DANKVAULT_REGISTRY_MANIFEST",
          Version: "2.5",
          ExportedAt: new Date().toISOString(),
          BuildCount: allBuilds.length
        },
        Builds: allBuilds.map((b: RegistryBuild) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          objectCount: b.objectCount,
          params: b.params,
          shape: b.shape,
          objects: b.objects_final
        }))
      };

      const json = JSON.stringify(manifest, null, 2);
      downloadFile(json, `DankVault_Registry_Full_${Date.now()}.json`, "application/json");
      showToast("✓ Registry Manifest exported successfully!");
    } catch (e: any) {
      alert(`Bulk export failed: ${e.message}`);
    } finally {
      setZipGenerating(false);
    }
  };

  // Load from URL hash on mount + Init Registry
  useEffect(() => {
    safeScanAllShapes();
    initRegistry().then(() => {
        console.log("🛡️ [DANKVAULT] Registry Materialized. Initiating compliance audit...");
        auditAllBuilds().then(report => {
            console.log("📊 [DANKVAULT] Fleet compliance report: ", report.summary);
        });
    });
    try {
      const hash = window.location.hash;
      if (!hash.startsWith("#share=")) return;
      const encoded = hash.slice(7);
      const state = JSON.parse(atob(encoded));
      if (state.s) setShapeType(state.s);
      if (state.p) setParams(state.p);
      if (state.x !== undefined) setPosX(state.x);
      if (state.y !== undefined) setPosY(state.y);
      if (state.z !== undefined) setPosZ(state.z);
      if (state.yw !== undefined) setYaw(state.yw);
      if (state.pi !== undefined) setPitch(state.pi);
      if (state.ro !== undefined) setRoll(state.ro);
      if (state.sc !== undefined) setScaleVal(state.sc);
      if (state.cl) setObjClass(state.cl);
      if (state.fo) setFormat(state.fo);
      // Clear hash after loading
      window.history.replaceState(null, "", window.location.pathname);
      showToast("✓ Loaded shared build!");
    } catch { /* ignore malformed hash */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




  const currentCode = mode === "text" ? textOutput : output;
  const currentExt = (mode === "architect" ? format : textFormat) === "initc" ? "c" : "json";
  const currentParamDefs: ParamDef[] = SHAPE_DEFS[shapeType]?.params || [];
  const PRESET_CATEGORIES = ["All", ...Array.from(new Set(QUICK_PRESETS.map(p => p.category)))];
  const filteredPresets = QUICK_PRESETS.filter(p => {
    const catOk = presetCategory === "All" || p.category === presetCategory;
    const searchOk = !presetFilter || p.label.toLowerCase().includes(presetFilter.toLowerCase()) || p.shape.includes(presetFilter.toLowerCase());
    return catOk && searchOk;
  });

  // ─── PERSISTENCE ENGINE ───────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("dankvault_current_project");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.mode) setMode(data.mode);
        if (data.params) setParams(data.params);
        if (data.objClass) setObjClass(data.objClass);
        if (data.shapeType) setShapeType(data.shapeType);
        if (data.pos) { setPosX(data.pos[0]); setPosY(data.pos[1]); setPosZ(data.pos[2]); }
        if (data.rpy) { setYaw(data.rpy[0]); setPitch(data.rpy[1]); setRoll(data.rpy[2]); }
        if (data.scale) setScaleVal(data.scale);
        if (data.extra) {
           setExtraObjs(data.extra.objs);
           setStackY(data.extra.stack);
           setCePersist(data.extra.ce);
           setIncludeHelper(data.extra.helper);
        }
      } catch (e) {
        console.error("Failed to restore project from local storage", e);
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      mode, params, objClass, shapeType,
      pos: [posX, posY, posZ],
      rpy: [yaw, pitch, roll],
      scale: scaleVal,
      extra: { objs: extraObjs, stack: stackY, ce: cePersist, helper: includeHelper }
    };
    localStorage.setItem("dankvault_current_project", JSON.stringify(state));
  }, [mode, params, objClass, shapeType, posX, posY, posZ, yaw, pitch, roll, scaleVal, extraObjs, stackY, cePersist, includeHelper]);

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden select-none">
      {/* ——— HEADER ——— */}
      <header className="shrink-0 bg-[#0c1510] border-b border-[#0e2010] relative z-50">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
            <h1 className="text-[12px] font-black text-[#27ae60] flex items-baseline gap-1 uppercase tracking-widest">
              DANKVAULT <span className="text-[#3a6a3a] opacity-50">STUDIO</span>
              <span className="text-[8px] bg-[#0e2010] border border-[#27ae6044] px-1.5 py-0.5 rounded text-[#27ae60] uppercase tracking-tighter ml-1">V2.50 FINAL</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-2.5 py-1.5 bg-[#e74c3c22] border border-[#e74c3c44] text-[#e74c3c] text-[9px] font-black rounded hover:bg-[#e74c3c] hover:text-white transition-all uppercase"
            >
              ♻ RELOAD
            </button>
            <button 
              onClick={downloadAllBuilds}
              className="px-2.5 py-1.5 bg-[#d4a01722] border border-[#d4a01744] text-[#d4a017] text-[9px] font-black rounded hover:bg-[#d4a017] hover:text-[#080f09] transition-all uppercase"
            >
              📥 REGISTRY
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto scrollbar-none border-t border-[#162016]" style={{scrollbarWidth:'none'}}>
          {([
            { key: "architect", emoji: "🏗", label: "BUILD",   active: "bg-[#2ecc71] text-[#080f09]",   inactive: "text-[#3a7a3a] hover:text-[#2ecc71]",   dot: "bg-[#2ecc71]" },
            { key: "text",      emoji: "✍️",  label: "TEXT",    active: "bg-[#2ecc71] text-[#080f09]",   inactive: "text-[#3a7a3a] hover:text-[#2ecc71]",   dot: "bg-[#2ecc71]" },
            { key: "builds",    emoji: "🏆", label: "PREBUILDS",  active: "bg-[#27ae60] text-[#080f09]",   inactive: "text-[#1a6a3a] hover:text-[#27ae60]",   dot: "bg-[#27ae60]" },
            { key: "weapons",   emoji: "🔫", label: "WEAPONS", active: "bg-[#e67e22] text-[#080f09]",   inactive: "text-[#a05010] hover:text-[#e67e22]",   dot: "bg-[#e67e22]" },
            { key: "bunker",    emoji: "🏰", label: "BUNKER",  active: "bg-[#5dade2] text-[#080f09]",   inactive: "text-[#2a6a9a] hover:text-[#5dade2]",   dot: "bg-[#5dade2]" },
            { key: "maze",      emoji: "🌀", label: "MAZE",    active: "bg-[#9b59b6] text-white",        inactive: "text-[#6a3a8a] hover:text-[#9b59b6]",   dot: "bg-[#9b59b6]" },
            { key: "race",      emoji: "🏁", label: "RACE",    active: "bg-[#e74c3c] text-white",        inactive: "text-[#8a2a20] hover:text-[#e74c3c]",   dot: "bg-[#e74c3c]" },
            { key: "random",    emoji: "🎲", label: "RANDOM",  active: "bg-[#1abc9c] text-[#080f09]",    inactive: "text-[#0e7a60] hover:text-[#1abc9c]",   dot: "bg-[#1abc9c]" },
            { key: "conzone",   emoji: "🚧", label: "CONZONE", active: "bg-[#f39c12] text-[#080f09]",    inactive: "text-[#a06010] hover:text-[#f39c12]",   dot: "bg-[#f39c12]" },
            { key: "shipwreck", emoji: "🚢", label: "SHIPWRECK", active: "bg-[#34495e] text-white",       inactive: "text-[#2c3e50] hover:text-[#34495e]",   dot: "bg-[#34495e]" },
            { key: "teleport",  emoji: "⚡", label: "TELEPORT",active: "bg-[#8e44ad] text-white",         inactive: "text-[#5a2a7a] hover:text-[#8e44ad]",   dot: "bg-[#8e44ad]" },
            { key: "airdrops",  emoji: "📦", label: "AIRDROPS",active: "bg-[#27ae60] text-[#080f09]",    inactive: "text-[#1a401a] hover:text-[#27ae60]",   dot: "bg-[#27ae60]" },
            { key: "mover",     emoji: "🔭", label: "MOVER",   active: "bg-[#e67e22] text-[#080f09]",    inactive: "text-[#8a4410] hover:text-[#e67e22]",   dot: "bg-[#e67e22]" },
            { key: "freeway",   emoji: "🌉", label: "FREEWAY", active: "bg-[#3498db] text-[#080f09]",    inactive: "text-[#1a5a8a] hover:text-[#3498db]",   dot: "bg-[#3498db]" },
            { key: "trader",    emoji: "⛺", label: "TRADER",  active: "bg-[#1abc9c] text-[#080f09]",    inactive: "text-[#0e7a60] hover:text-[#1abc9c]",   dot: "bg-[#1abc9c]" },
            { key: "terrain",   emoji: "🏔️", label: "TERRAIN", active: "bg-[#95a5a6] text-[#080f09]",    inactive: "text-[#5a6a6a] hover:text-[#95a5a6]",   dot: "bg-[#95a5a6]" },
            { key: "vault",     emoji: "📂", label: "VAULT",   active: "bg-[#d4a017] text-[#080f09]",    inactive: "text-[#8a6a1a] hover:text-[#d4a017]",   dot: "bg-[#d4a017]" },
          ] as const).map(t => {
            const isActive = mode === t.key;
            return (
              <button key={t.key} onClick={() => { setPipelineCtx(null); if (t.key === "builds") setOutput(""); setMode(t.key as EditorMode); }}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3.5 py-2 shrink-0 font-bold transition-all duration-150 ${isActive ? t.active : `${t.inactive} hover:bg-[#0e1a0e]`}`}>
                <span className="text-[13px] leading-none">{t.emoji}</span>
                <span className="text-[8px] tracking-widest leading-none">{t.label}</span>
                {isActive && <span className={`absolute bottom-0 left-0 right-0 h-[2px] ${t.dot}`} />}
              </button>
            );
          })}
        </div>
      </header>


      <div className="flex flex-1 overflow-hidden">
        {/* ── WEAPON BUILDER MODE ── */}
        {mode === "weapons" && <WeaponBuilder />}

        {/* ── BUNKER MAKER MODE ── */}
        {mode === "bunker" && <BunkerMaker />}

        {/* ── MAZE MAKER MODE ── */}
        {mode === "maze" && <MazeMaker />}

        {/* ── RACE TRACK MAKER MODE ── */}
        {mode === "race" && <RaceTrackMaker />}

        {/* ── RANDOM STRUCTURE MAKER MODE ── */}
        {mode === "random" && <RandomStructureMaker />}

        {/* ── CONSTRUCTION ZONE MAKER MODE ── */}
        {mode === "conzone" && <ConstructionZoneMaker />}

        {/* ── SHIPWRECK MAKER MODE ── */}
        {mode === "shipwreck" && <ShipwreckBuilder onGenerate={(_pts, p) => { setShapeType(p.shape || "shipwreck"); setParams(prev => ({ ...prev, ...p })); }} />}

        {/* ── TELEPORT MAKER MODE ── */}
        {mode === "teleport" && <TeleportMaker />}

        {/* ── AIRDROP MANAGEMENT MODE ── */}
        {mode === "airdrops" && <AirdropDashboard />}

        {/* ── MOVER TRANSLATION MODE ── */}
        {mode === "mover" && <BuildMover />}

        {/* ── FREEWAY GENERATOR MODE ── */}
        {mode === "freeway" && <FreewayMaker />}

        {/* ── TRADER OUTPOST MODE ── */}
        {mode === "trader" && <TraderMaker />}

        {/* ── TERRAIN SCULPTOR MODE ── */}
        {mode === "terrain" && <TerrainMaker />}

        {/* ── DANK VAULT MODE ── */}
        {mode === "validation" && <ValidationDashboard />}
        {mode === "vault" && (
          <DankVault 
            onLoadIntoEditor={loadBuildIntoEditor} 
            onGetValidationStatus={getValidationStatus} 
          />
        )}

        {/* ── UNIFIED LIBRARY MODE ── */}
        {mode === "builds" && (
          <BuildLibrary 
            onLoadIntoEditor={loadBuildIntoEditor} 
            onGetValidationStatus={getValidationStatus} 
            sandboxEnabled={sandboxEnabled} setSandboxEnabled={setSandboxEnabled}
            sandboxHUD={sandboxHUD} setSandboxHUD={setSandboxHUD}
            sandboxOverlays={sandboxOverlays} setSandboxOverlays={setSandboxOverlays}
            developerMode={developerMode} setDeveloperMode={setDeveloperMode}
            showDebugGeometry={showDebugGeometry} setShowDebugGeometry={setShowDebugGeometry}
          />
        )}

        {/* Mobile backdrop */}
        {mode !== "weapons" && mode !== "bunker" && mode !== "maze" && mode !== "race" && mode !== "random" && mode !== "conzone" && mode !== "shipwreck" && mode !== "teleport" && mode !== "airdrops" && mode !== "mover" && mode !== "freeway" && mode !== "trader" && mode !== "terrain" && mode !== "vault" && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className={`${(mode === "weapons" || mode === "bunker" || mode === "maze" || mode === "race" || mode === "random" || mode === "conzone" || mode === "shipwreck" || mode === "teleport" || mode === "airdrops" || mode === "mover" || mode === "freeway" || mode === "trader" || mode === "terrain" || mode === "vault") ? "hidden" : ""} ${sidebarOpen ? "w-72" : "w-0"} shrink-0 bg-[#0a1209] border-r border-[#0e2010] overflow-y-auto flex flex-col transition-all duration-200 z-30 md:relative md:z-auto ${sidebarOpen ? "absolute inset-y-0 left-0 md:relative" : "overflow-hidden"}`}>
          {mode === "architect" ? (
            <ArchitectSidebar
              shapeType={shapeType} params={params} paramDefs={currentParamDefs}
              objClass={objClass} posX={posX} posY={posY} posZ={posZ}
              yaw={yaw} pitch={pitch} roll={roll}
              scaleVal={scaleVal}
              format={format} cePersist={cePersist} includeHelper={includeHelper}
              extraObjs={extraObjs} stackY={stackY}
              objCount={displayPoints.length}
              autoRotate={autoRotate} autoOrient={autoOrient} orientInward={orientInward}
              presetFilter={presetFilter} filteredPresets={filteredPresets}
              presetCategory={presetCategory} presetCategories={PRESET_CATEGORIES}
              jitter={jitter} dims={dims} famousLocations={FAMOUS_LOCATIONS}
              arenaShapes={ARENA_SHAPES} onRollArena={rollRandomArena} onRollSameArena={rollSameArena}
              onShapeChange={onShapeChange} setObjClass={setObjClass}
              setPosX={setPosX} setPosY={setPosY} setPosZ={setPosZ}
              setYaw={setYaw} setPitch={setPitch} setRoll={setRoll}
              setScaleVal={setScaleVal}
              setFormat={setFormat} setCePersist={setCePersist} setIncludeHelper={setIncludeHelper}
              setExtraObjs={setExtraObjs} setStackY={setStackY}
              setParam={setParam} setParams={setParams} setAutoRotate={setAutoRotate}
              setAutoOrient={setAutoOrient} setOrientInward={setOrientInward}
              setPresetFilter={setPresetFilter} setPresetCategory={setPresetCategory}
              setJitter={setJitter}
              onGenerate={generate}
              onClear={() => setOutput("")}
              applyPreset={applyPreset}
              selectedPresetLabel={selectedPresetLabel}
              onSurpriseMe={surpriseMe}


              buildNotes={buildNotes} setBuildNotes={setBuildNotes}
              captureCurrentState={captureCurrentState} restoreState={restoreState}
              captureState={captureState}
              
              /* ── PROJECT STUDIO UI ── */
              extraControls={(
                <div className="px-4 py-3 border-b border-[#2a2a1a] bg-[#0d0d08]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] text-[#27ae60] font-black tracking-widest uppercase">💾 Project Studio</div>
                    <button onClick={() => setShowProjectTools(!showProjectTools)} className="text-[10px] text-[#5a4820] hover:text-[#27ae60]">
                      {showProjectTools ? "Collapse ▲" : "Expand ▼"}
                    </button>
                  </div>
                  
                  {showProjectTools && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={undo} disabled={history.length === 0}
                          className="flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold border border-[#27ae60]/30 text-[#27ae60] rounded-sm hover:bg-[#27ae60]/10 disabled:opacity-30 transition-all">
                          <span>↺</span> Undo
                        </button>
                        <button onClick={redo} disabled={redoStack.length === 0}
                          className="flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold border border-[#27ae60]/30 text-[#27ae60] rounded-sm hover:bg-[#27ae60]/10 disabled:opacity-30 transition-all">
                          Redo <span>↻</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={saveProject}
                          className="flex-1 py-1.5 text-[10px] font-bold bg-[#d4a017]/10 border border-[#d4a017] text-[#d4a017] rounded-sm hover:bg-[#d4a017]/30 transition-all">
                          Save JSON
                        </button>
                        <label className="flex-1">
                          <div className="w-full py-1.5 text-center text-[10px] font-bold bg-[#3498db]/10 border border-[#3498db] text-[#3498db] rounded-sm hover:bg-[#3498db]/30 cursor-pointer transition-all">
                            Load JSON
                          </div>
                          <input type="file" accept=".json" onChange={loadProject} className="hidden" />
                        </label>
                      </div>

                      <div className="pt-2 border-t border-[#1a1c18]">
                        <div className="text-[9px] text-[#5a8a5a] mb-1.5 uppercase font-bold">🧲 Snapping</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[8px] text-[#3a6a3a] mb-1">Grid (m)</div>
                            <select value={snapGrid} onChange={e => setSnapGrid(+e.target.value)}
                              className="w-full bg-[#080f09] border border-[#1a2e1a] text-[#27ae60] text-[10px] px-1 py-1 rounded-sm">
                              <option value="0">Off</option>
                              <option value="1">1m</option>
                              <option value="5">5m</option>
                              <option value="10">10m</option>
                              <option value="12.0">12.0m (Bunker)</option>
                            </select>
                          </div>
                          <div>
                            <div className="text-[8px] text-[#3a6a3a] mb-1">Angle (°)</div>
                            <select value={snapAngle} onChange={e => setSnapAngle(+e.target.value)}
                              className="w-full bg-[#080f09] border border-[#1a2e1a] text-[#27ae60] text-[10px] px-1 py-1 rounded-sm">
                              <option value="0">Off</option>
                              <option value="22.5">22.5°</option>
                              <option value="45">45°</option>
                              <option value="90">90°</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              objSearch={objSearch} setObjSearch={setObjSearch}
              favourites={favourites} toggleFavourite={toggleFavourite}
              packagingProfile={packagingProfile} setPackagingProfile={setPackagingProfile}
              sandboxEnabled={sandboxEnabled} setSandboxEnabled={setSandboxEnabled}
              sandboxHUD={sandboxHUD} setSandboxHUD={setSandboxHUD}
              sandboxOverlays={sandboxOverlays} setSandboxOverlays={setSandboxOverlays}
              developerMode={developerMode} setDeveloperMode={setDeveloperMode}
              showDebugGeometry={showDebugGeometry} setShowDebugGeometry={setShowDebugGeometry}
              addInteriorRooms={addInteriorRooms} setAddInteriorRooms={setAddInteriorRooms}
              onRunAudit={auditAllBuilds}
            />
          ) : mode === "builds" ? (
            <BuildsSidebar
              builds={allAvailablePrebuilds}
              selectedId={selectedBuildId}
              filter={buildFilter}
              category={buildCategory}
              zipGenerating={zipGenerating}
              onSelect={(id: string) => { setPipelineCtx(null); setOutput(""); setSelectedBuildId(id); }}
              onLoadIntoEditor={loadBuildIntoEditor}
              onFilterChange={setBuildFilter}
              onCategoryChange={setBuildCategory}
              onDownloadPackage={handleDownloadPackage}
              onGetValidationStatus={getValidationStatus}
              packagingProfile={packagingProfile} setPackagingProfile={setPackagingProfile}
              sandboxEnabled={sandboxEnabled} setSandboxEnabled={setSandboxEnabled}
              sandboxHUD={sandboxHUD} setSandboxHUD={setSandboxHUD}
              sandboxOverlays={sandboxOverlays} setSandboxOverlays={setSandboxOverlays}
              developerMode={developerMode} setDeveloperMode={setDeveloperMode}
              showDebugGeometry={showDebugGeometry} setShowDebugGeometry={setShowDebugGeometry}
            />
          ) : (
            <TextSidebar
              textInput={textInput} textObj={textObj} textScale={textScale}
              textLetterH={textLetterH} textSpacing={textSpacing} textDepth={textDepth}
              textRings={textRings} textPosX={textPosX} textPosY={textPosY} textPosZ={textPosZ}
              textFormat={textFormat} objCount={displayPoints.length}
              textArcDeg={textArcDeg}
              setTextInput={setTextInput} setTextObj={setTextObj} setTextScale={setTextScale}
              setTextLetterH={setTextLetterH} setTextSpacing={setTextSpacing}
              setTextDepth={setTextDepth} setTextRings={setTextRings}
              setTextPosX={setTextPosX} setTextPosY={setTextPosY} setTextPosZ={setTextPosZ}
              setTextFormat={setTextFormat} setTextArcDeg={setTextArcDeg}
              onGenerate={generateText}
              textObjSearch={textObjSearch} setTextObjSearch={setTextObjSearch}
              packagingProfile={packagingProfile} setPackagingProfile={setPackagingProfile}
              sandboxEnabled={sandboxEnabled} setSandboxEnabled={setSandboxEnabled}
              sandboxHUD={sandboxHUD} setSandboxHUD={setSandboxHUD}
              sandboxOverlays={sandboxOverlays} setSandboxOverlays={setSandboxOverlays}
              developerMode={developerMode} setDeveloperMode={setDeveloperMode}
              showDebugGeometry={showDebugGeometry} setShowDebugGeometry={setShowDebugGeometry}
            />
          )}
        </div>

        {/* ─── MAIN PANEL ─── */}
        <div className={`${(mode === "weapons" || mode === "bunker" || mode === "maze" || mode === "race" || mode === "random" || mode === "conzone" || mode === "shipwreck" || mode === "teleport" || mode === "airdrops" || mode === "mover" || mode === "freeway" || mode === "trader" || mode === "terrain" || mode === "vault") ? "hidden" : ""} flex-1 flex flex-col overflow-hidden`}>
          {/* Info bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#091209] border-b border-[#0e2010] text-[11px] shrink-0">
            <span className="text-[#2a5a2a] text-[10px]">Shape</span>
            <span className="text-[#27ae60] font-bold truncate max-w-[160px]">
              {mode === "architect" ? (SHAPE_DEFS[shapeType]?.label || shapeType)
               : mode === "builds" ? (allAvailablePrebuilds.find(b => b.id === selectedBuildId)?.name || "—")
               : `"${textInput}"`}
            </span>
            {(() => {
              const obj_count = (pipelineCtx?.objects_final && pipelineCtx.objects_final.length > 0)
                ? pipelineCtx.objects_final.length
                : displayPoints.length;
              
              const hasLogical = pipelineCtx?.objects_final?.some(o => 
                ["neutral_structural","wall","decorative","sandbag","wreck"].includes(o.name)
              );
              
              return (
                <>
                  {hasLogical && developerMode && <span className="text-[#e74c3c] text-[12px] animate-pulse ml-1">●</span>}
                  <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ml-1 ${obj_count >= MAX_OBJECTS ? "text-[#e74c3c] bg-[#1a0a0a]" : obj_count > 800 ? "text-[#e07a20] bg-[#0a1a0a]" : "text-[#27ae60] bg-[#0e180e]"}`}>
                    {obj_count} obj{obj_count !== 1 ? "s" : ""}
                    {mode === "architect" && (
                      <span className="ml-2 opacity-50 italic">
                         (~{Math.round(displayPoints.length * (6.0 / getObjectLength(objClass)))} est.)
                      </span>
                    )}
                  </span>
                  {obj_count >= MAX_OBJECTS && (
                    <span className="text-[#e74c3c] text-[9px] font-black animate-pulse border border-[#e74c3c] px-1 py-0.5 rounded bg-[#1a0a0a] ml-1">
                      LIMIT REACHED
                    </span>
                  )}
                  {obj_count > 800 && obj_count < MAX_OBJECTS && <span className="text-[#e07a20] text-[9px] font-bold ml-1">⚠️ LARGE</span>}
                </>
              );
            })()}
            {dims && <span className="text-[#6a5830] text-[9px] bg-[#0a140a] px-1.5 py-0.5 rounded border border-[#0e2010] ml-1">{dims.w}×{dims.d}×{dims.h}m</span>}
            
            {/* 🏎️ PERFORMANCE BADGE */}
            {(() => {
              const perf = pipelineCtx?.metadata?.performance;
              if (!perf) return null;
              const color = perf.tier === "S" ? "text-[#27ae60]" : perf.tier === "A" ? "text-[#f1c40f]" : "text-[#e74c3c]";
              return (
                <span className={`text-[9px] font-black border border-current px-1.5 py-0.5 rounded-sm bg-[#080f08] ${color}`} title={`Estimated Cost: ${perf.cost.toFixed(0)}`}>
                  TIER {perf.tier}
                </span>
              );
            })()}

            {mode === "builds" && <span className="text-[#27ae60] text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0a1a0e] border border-[#1a4020]">● LIVE</span>}
            <div className="ml-auto flex items-center gap-4">
                <button 
                  onClick={() => {
                    window.dispatchEvent(new Event('resize'));
                    showToast("Scene Resynchronised!");
                  }}
                  className="px-3 py-1 text-[9px] font-black uppercase text-[#5a8a5a] hover:text-[#27ae60] transition-all"
                >
                  Reset View
                </button>
                <div className="flex bg-black/40 p-0.5 rounded border border-[#27ae6033]">
                    <button 
                        onClick={() => setSandboxEnabled(false)}
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-sm transition-all ${!sandboxEnabled ? "bg-[#27ae60] text-[#080f08]" : "text-[#5a8a5a] hover:text-[#27ae60]"}`}
                    >
                        Preview
                    </button>
                    <button 
                        onClick={() => setSandboxEnabled(true)}
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-sm transition-all ${sandboxEnabled ? "bg-[#27ae60] text-[#080f08]" : "text-[#5a8a5a] hover:text-[#27ae60]"}`}
                    >
                        Sandbox
                    </button>
                </div>
                <span className="text-[#4a3c20] text-[9px] hidden md:block">Drag · Orbit · Scroll zoom</span>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="relative bg-[#060402]" style={{ flex: "0 0 55%", minHeight: 200 }}>
            <PointCloud3D
              points={replayActive ? (getReplaySteps(pipelineCtx)[replayStep]?.objects || []) : displayPoints}
              objects={replayActive ? [] : pipelineCtx?.objects_final}
              globalPitch={mode === "text" ? 0 : pitch}
              globalRoll={mode === "text" ? 0 : roll}
              globalScale={mode === "text" ? textScale : scaleVal}
              autoRotate={autoRotate}
              mode={sandboxEnabled ? (sandboxHUD || (sandboxOverlays.density || sandboxOverlays.collision || sandboxOverlays.navigation || sandboxOverlays.symmetry || sandboxOverlays.structural) ? "sandbox_hud" : "sandbox_basic") : "preview"}
              overlays={{...sandboxOverlays, debug: showDebugGeometry}}
              pipelineCtx={pipelineCtx}
            />

            <>
                  {/* Minimal overlay - auto-rotate toggle */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={() => setAutoRotate(!autoRotate)}
                        className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase backdrop-blur-sm border transition-all ${autoRotate ? "bg-[#27ae60]/20 border-[#27ae60] text-[#27ae60]" : "bg-black/40 border-[#333] text-[#666]"}`}
                    >
                        {autoRotate ? "Rotating" : "Paused"}
                    </button>
                    
                  </div>
                </>
            {/* Object count badge */}
          </div>

          {/* Output */}
          {mode === "builds" ? (
            <div className="flex flex-col border-t border-[#0e2010] bg-[#0a1209] flex-1 min-h-0">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#0e2010] shrink-0">
                {(() => {
                  const b = COMPLETED_BUILDS.find(x => x.id === selectedBuildId);
                  return b ? (
                    <>
                      <span className="text-[#27ae60] text-[11px] font-bold truncate">{b.icon} {b.name}</span>
                      <span className="text-[#5a8a5a] text-[9px]">{selectedBuildLiveCount} obj</span>
                    </>
                  ) : (
                    <span className="text-[#27ae60] text-[11px] font-bold tracking-wider">🏆 COMPLETED BUILDS</span>
                  );
                })()}
                <div className="flex-1" />
                {output && (
                  <>
                    <button
                      onClick={() => copyCode(output)}
                      className="px-2 py-1 text-[9px] font-bold border border-[#0e2010] text-[#b09a6a] hover:border-[#27ae60] hover:text-[#27ae60] rounded-sm transition-all shrink-0"
                    >Copy</button>
                    {(() => {
                      const b = COMPLETED_BUILDS.find(x => x.id === selectedBuildId);
                      return b ? (
                        <>
                          <button
                            disabled={zipGenerating}
                            onClick={() => handleDownloadPackage(b.id, b.shape, b.params, b.category, "initc")}
                            className="px-2 py-1 text-[9px] font-bold bg-[#0e2010] border border-[#27ae60] text-[#27ae60] rounded-sm hover:bg-[#27ae60] hover:text-[#080f09] transition-all disabled:opacity-50 shrink-0"
                          >{zipGenerating ? "⏳" : "⬇ .C"}</button>
                          <button
                            disabled={zipGenerating}
                            onClick={() => handleDownloadPackage(b.id, b.shape, b.params, b.category, "json")}
                            className="px-2 py-1 text-[9px] font-bold bg-[#1a1a2e] border border-[#6a7abf] text-[#6a7abf] rounded-sm hover:bg-[#6a7abf] hover:text-[#080f09] transition-all disabled:opacity-50 shrink-0"
                          >{zipGenerating ? "⏳" : "⬇ JSON"}</button>
                          <button
                            onClick={() => loadBuildIntoEditor(b)}
                            className="px-2 py-1 text-[9px] font-black bg-[#27ae60] text-[#080f09] rounded-sm hover:bg-[#e8b82a] transition-all shrink-0"
                          >🛠️ Editor</button>
                        </>
                      ) : null;
                    })()}
                  </>
                )}
              </div>
              {output ? (
                <textarea readOnly value={output}
                  className="flex-1 resize-none p-3 text-[11px] text-[#7ec060] bg-transparent border-0 outline-none leading-relaxed font-mono overflow-auto"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#3a6a3a] text-[11px] flex-col gap-2 opacity-60">
                  <span>Select a build on the left</span>
                  <span className="text-[9px]">Code generates automatically on selection</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col border-t border-[#0e2010] bg-[#0a1209] flex-1 min-h-0">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#0e2010] shrink-0">
                {/* Format toggle */}
                {mode === "architect" && (
                  <div className="flex gap-0.5 border border-[#0e2010] rounded-sm p-0.5 shrink-0">
                    {(["initc", "json"] as OutputFormat[]).map(f => (
                      <button key={f} onClick={() => setFormat(f)}
                        className={`px-2 py-0.5 text-[10px] rounded-sm font-bold transition-all ${format === f ? "bg-[#27ae60] text-[#080f09]" : "text-[#b09a6a] hover:text-[#b8d4b8]"}`}>
                        {f === "initc" ? "init.c" : "JSON"}
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-[#3a6a3a] text-[10px] flex-1 truncate">
                  {(() => {
                    const obj_count = (pipelineCtx?.objects_final && pipelineCtx.objects_final.length > 0)
                      ? pipelineCtx.objects_final.length
                      : displayPoints.length;
                    return `${obj_count} objects allocated · `;
                  })()}
                  {currentCode ? `${currentCode.split("\n").length} export lines` : "configure & generate →"}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => {
                    if (!currentCode) return alert("Please click 'Generate Build' first.");
                    copyCode(currentCode);
                  }}
                    className="px-3 py-1 text-[11px] border border-[#0e2010] text-[#b09a6a] hover:border-[#27ae60] hover:text-[#27ae60] rounded-sm transition-all">
                    Copy
                  </button>
                  <button onClick={() => {
                    if (!currentCode) return alert("Please click 'Generate Build' first.");
                    downloadCode(currentCode, currentExt, mode === "architect" ? `shape_${shapeType}` : `text_${textInput || "text"}`);
                  }}
                    className="px-3 py-1 text-[11px] bg-[#27ae60] text-[#080f09] font-bold rounded-sm hover:bg-[#e8b82a] transition-all">
                    Download
                  </button>
                </div>
              </div>
              <textarea readOnly value={currentCode}
                placeholder={"// â† Configure your shape on the left, then click GENERATE\n// The 3D preview updates in real time as you adjust settings\n// Drag the preview to rotate â€¢ Scroll to zoom"}
                className="flex-1 resize-none p-3 text-[11px] text-[#7ec060] bg-transparent border-0 outline-none leading-relaxed font-mono overflow-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-[#27ae60] text-[#080f09] px-4 py-2 rounded-sm text-sm font-bold z-50 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}

// --- HELPERS ---
function Sec({ children }: { children: any }) {
  return <div className="text-[#27ae60] text-[9px] tracking-widest uppercase border-b border-[#0e2010] pb-1 mb-2 mt-3 px-3">{children}</div>;
}
function Lbl({ children }: { children: any }) {
  return <div className="text-[#b09a6a] text-[10px] mb-0.5">{children}</div>;
}

function Inp({ value, onChange, type = "number", onFocus, ...rest }: { value: string | number; onChange: (v: string) => void; type?: string; onFocus?: () => void; [k: string]: any }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      onFocus={onFocus}
      className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[11px] px-2 py-1 rounded-sm mb-1.5 focus:outline-none focus:border-[#8a6a0f] transition-colors"
      {...rest}
    />
  );
}

function Slider({ label, value, min, max, step = "any", onChange, onMouseDown }: { label: string; value: number; min: number; max: number; step?: number | string; onChange: (v: number) => void; onMouseDown?: () => void }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-0.5">
        <Lbl>{label}</Lbl>
        <span className="text-[#27ae60] text-[10px] font-bold">{typeof step === "number" && step >= 1 ? Math.round(value) : value}</span>
      </div>
      <input type="range" value={value} min={min} max={max} step={step}
        onChange={e => onChange(parseFloat(e.target.value))}
        onMouseDown={onMouseDown}
        className="w-full h-1 rounded-full cursor-pointer accent-[#27ae60]"
        style={{ background: `linear-gradient(to right, #27ae60 ${((value - min) / (max - min)) * 100}%, #0e2010 0%)` }}
      />
    </div>
  );
}

// --- SAVE / LOAD PANEL ---
interface SaveSlot { id: string; name: string; timestamp: number; data: Record<string, any> }

function SaveLoadPanel({ captureState, onLoad }: { captureState: () => any; onLoad: (s: any) => void }) {
  const [saves, setSaves] = useState<SaveSlot[]>(() => {
    try { return JSON.parse(localStorage.getItem("dayz_builder_saves") ?? "[]"); } catch { return []; }
  });
  const [saveName, setSaveName] = useState("");
  const [saveErr, setSaveErr] = useState("");

  const persist = (updated: SaveSlot[]) => {
    setSaves(updated);
    try {
      localStorage.setItem("dayz_builder_saves", JSON.stringify(updated));
    } catch {
      setSaveErr("Storage full — delete a save first");
      setTimeout(() => setSaveErr(""), 3000);
    }
  };
  const save = () => {
    const name = saveName.trim();
    if (!name) return;
    if (saves.some(s => s.name === name)) {
      setSaveErr(`"${name}" already exists — rename or delete it first`);
      setTimeout(() => setSaveErr(""), 3000);
      return;
    }
    persist([{ id: Date.now().toString(), name, timestamp: Date.now(), data: captureState() }, ...saves].slice(0, 8));
    setSaveName("");
    setSaveErr("");
  };

  return (
    <div className="px-3">
      <div className="flex gap-1 mb-1">
        <input type="text" placeholder="Name this build..." value={saveName}
          onChange={e => { setSaveName(e.target.value); setSaveErr(""); }}
          onKeyDown={e => e.key === "Enter" && save()}
          className="flex-1 bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[10px] px-2 py-1 rounded-sm focus:outline-none focus:border-[#27ae60]" />
        <button onClick={save} disabled={!saveName.trim()}
          className="px-2 py-1 text-[10px] font-bold rounded-sm border border-[#27ae60] text-[#27ae60] hover:bg-[#27ae60] hover:text-[#080f09] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          Save
        </button>
      </div>
      {saveErr && <div className="text-[#c0392b] text-[8px] mb-1.5 leading-tight">{saveErr}</div>}
      {saves.length === 0 ? (
        <div className="text-[#5a4820] text-[9px] py-1.5 text-center">No saves yet — name your build above and hit Save</div>
      ) : (
        <div className="flex flex-col gap-1">
          {saves.map(slot => (
            <div key={slot.id} className="flex items-center gap-1 border border-[#0e2010] rounded-sm px-2 py-1 bg-[#060402]">
              <div className="flex-1 min-w-0">
                <div className="text-[#b8d4b8] text-[10px] font-bold truncate">{slot.name}</div>
                <div className="text-[#5a4820] text-[8px]">{new Date(slot.timestamp).toLocaleDateString()} · {slot.data.shapeType}</div>
              </div>
              <button onClick={() => onLoad(slot.data)}
                className="px-1.5 py-0.5 text-[8px] text-[#27ae60] border border-[#27ae6033] hover:border-[#27ae60] rounded-sm transition-all shrink-0">
                Load
              </button>
              <button onClick={() => persist(saves.filter(s => s.id !== slot.id))}
                className="px-1.5 py-0.5 text-[8px] text-[#c0392b] border border-[#c0392b33] hover:border-[#c0392b] rounded-sm transition-all shrink-0">
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="text-[#4a3820] text-[8px] mt-1.5">{saves.length}/8 slots · Stored in your browser only</div>
    </div>
  );
}

// ─── SPACING CALCULATOR ────────────────────────────────────────────────────────

function SpacingCalcPanel() {
  const [ax, setAx] = useState(""); const [az, setAz] = useState("");
  const [bx, setBx] = useState(""); const [bz, setBz] = useState("");
  const [count, setCount] = useState(5);
  const [fixedY, setFixedY] = useState("");
  const [copied, setCopied] = useState(false);

  const pts = useMemo(() => {
    const nax = parseFloat(ax), naz = parseFloat(az);
    const nbx = parseFloat(bx), nbz = parseFloat(bz);
    if (isNaN(nax) || isNaN(naz) || isNaN(nbx) || isNaN(nbz)) return [];
    const n = Math.max(2, Math.min(20, count));
    const y = parseFloat(fixedY) || 0;
    return Array.from({ length: n }, (_, i) => ({
      x: nax + (nbx - nax) * (i / (n - 1)),
      y,
      z: naz + (nbz - naz) * (i / (n - 1)),
    }));
  }, [ax, az, bx, bz, count, fixedY]);

  const dist = useMemo(() => {
    const nax = parseFloat(ax), naz = parseFloat(az);
    const nbx = parseFloat(bx), nbz = parseFloat(bz);
    if (isNaN(nax) || isNaN(naz) || isNaN(nbx) || isNaN(nbz)) return null;
    return Math.sqrt((nbx - nax) ** 2 + (nbz - naz) ** 2);
  }, [ax, az, bx, bz]);

  const outText = pts.map(p => `${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)}`).join("\n");
  const copy = () => {
    if (!outText) return;
    navigator.clipboard.writeText(outText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  const numInput = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <div>
      <div className="text-[8px] text-[#5a8a5a] mb-0.5">{label}</div>
      <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph}
        className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[10px] px-2 py-1 rounded-sm focus:outline-none focus:border-[#27ae60]" />
    </div>
  );

  return (
    <div className="px-3">
      <div className="text-[#7a6a2a] text-[8px] mb-2 leading-tight">Enter two world coordinates to get evenly-spaced points between them.</div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mb-2">
        {numInput("Point A — X", ax, setAx, "7400")}
        {numInput("Point A — Z", az, setAz, "5600")}
        {numInput("Point B — X", bx, setBx, "7430")}
        {numInput("Point B — Z", bz, setBz, "5600")}
        <div>
          <div className="text-[8px] text-[#5a8a5a] mb-0.5">Points (2–20)</div>
          <input type="number" min={2} max={20} value={count} onChange={e => setCount(+e.target.value)}
            className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[10px] px-2 py-1 rounded-sm focus:outline-none focus:border-[#27ae60]" />
        </div>
        {numInput("Fixed Y (height)", fixedY, setFixedY, "383")}
      </div>
      {dist !== null && (
        <div className={`text-[9px] mb-1.5 ${dist === 0 ? 'text-[#c0392b]' : 'text-[#27ae60]'}`}>
          {dist === 0
            ? '⚠️ Points A and B are the same — all objects will stack!'
            : <><strong>Distance: {dist.toFixed(2)}m</strong>{pts.length > 1 && <span className="text-[#8a7840]"> · {(dist / (pts.length - 1)).toFixed(2)}m gap</span>}</>
          }
        </div>
      )}
      {pts.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-1">
            <div className="text-[8px] text-[#5a8a5a]">{pts.length} coordinates:</div>
            <button onClick={copy}
              className={`text-[8px] px-1.5 py-0.5 rounded-sm border transition-all ${copied ? "border-[#27ae60] text-[#27ae60]" : "border-[#27ae6033] text-[#27ae60] hover:border-[#27ae60]"}`}>
              {copied ? "✓ Copied" : "Copy All"}
            </button>
          </div>
          <div className="bg-[#060402] border border-[#1e1c18] rounded-sm p-2 max-h-36 overflow-y-auto">
            {pts.map((p, i) => (
              <div key={i} className="text-[9px] font-mono text-[#7ec060] leading-relaxed">
                <span className="text-[#5a4820] mr-1">{i + 1}.</span>
                {p.x.toFixed(3)}, {p.y.toFixed(3)}, {p.z.toFixed(3)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ARCHITECT SIDEBAR ────────────────────────────────────────────────────────

function ArchitectSidebar(p: any) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    presets: false, arena: true, obj: true, shape: false,
    pos: true, ypr: true, opts: true, saveload: true, notes: true, spacing: true,
  });
  const toggle = (k: string) => setCollapsed(prev => ({ ...prev, [k]: !prev[k] }));
  const sec = (k: string, label: string, children: React.ReactNode) => (
    <div>
      <button onClick={() => toggle(k)}
        className="w-full flex items-center justify-between text-[#5a8a5a] text-[9px] tracking-wider uppercase border-b border-[#1e1c18] pb-1 mb-2 mt-3 px-3 bg-transparent hover:text-[#27ae60] transition-colors">
        <span>{label}</span>
        <span className="text-[#5a4820]">{collapsed[k] ? "▶" : "▼"}</span>
      </button>
      {!collapsed[k] && children}
    </div>
  );

  const sandboxSec = (
    <div className="px-3">
        <label className="flex items-center gap-2 cursor-pointer group mb-2">
            <input type="checkbox" checked={p.sandboxEnabled} onChange={e => p.setSandboxEnabled(e.target.checked)} className="hidden" />
            <div className={`w-3 h-3 rounded-full border border-[#27ae60] flex items-center justify-center ${p.sandboxEnabled ? "bg-[#27ae60]" : "bg-transparent group-hover:bg-[#27ae6022]"}`} />
            <span className="text-[10px] uppercase font-bold text-[#b8d4b8] opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">🛰️ Sandbox Intelligence</span>
        </label>
        
        {p.sandboxEnabled && (
            <div className="space-y-2 pl-4 border-l border-[#27ae6033] animate-in slide-in-from-left-2 duration-200">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={p.sandboxHUD} onChange={e => p.setSandboxHUD(e.target.checked)} className="hidden" />
                    <div className={`w-2.5 h-2.5 rounded-full border border-[#27ae60] flex items-center justify-center ${p.sandboxHUD ? "bg-[#27ae60]" : "bg-transparent group-hover:bg-[#27ae6022]"}`} />
                    <span className="text-[9px] uppercase font-bold text-[#b8d4b8] opacity-60">Show HUD Telemetry</span>
                </label>

                {p.developerMode && (
                    <div className="pt-1 space-y-2">
                         <p className="text-[7px] font-black text-[#5c6c5c] uppercase">Advanced Overlays (Dev)</p>
                         {[
                             { id: 'density', label: 'Density Map' },
                             { id: 'collision', label: 'Collision Mesh' },
                             { id: 'navigation', label: 'Nav-Mesh Filter' },
                             { id: 'symmetry', label: 'Symmetry Plane' },
                             { id: 'structural', label: 'Mat-Typing' }
                         ].map(ov => (
                            <label key={ov.id} className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={(p.sandboxOverlays as any)[ov.id]} onChange={e => p.setSandboxOverlays((prev: any) => ({...prev, [ov.id]: e.target.checked}))} className="hidden" />
                                <div className={`w-2 h-2 rounded-sm border border-[#b8d4b844] flex items-center justify-center ${(p.sandboxOverlays as any)[ov.id] ? "bg-[#27ae60] border-[#27ae60]" : "bg-transparent"}`} />
                                <span className="text-[9px] uppercase font-bold opacity-50 group-hover:opacity-100 transition-opacity">{ov.label}</span>
                            </label>
                         ))}
                         
                         <label className="flex items-center gap-2 cursor-pointer group pt-1">
                            <input type="checkbox" checked={p.showDebugGeometry} onChange={e => p.setShowDebugGeometry(e.target.checked)} className="hidden" />
                            <div className={`w-2 h-2 rounded-sm border border-[#e74c3c] flex items-center justify-center ${p.showDebugGeometry ? "bg-[#e74c3c]" : "bg-transparent"}`} />
                            <span className="text-[9px] uppercase font-bold text-[#e74c3c] opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">Draw Debug Geometry</span>
                         </label>
                    </div>
                )}
            </div>
        )}
        
        {p.developerMode && (
            <div className="mt-3 pt-2 border-t border-[#f1c40f33]">
                <button 
                    onClick={async () => {
                        const results = await p.onRunAudit();
                        alert(`Full Architectural Audit Complete!\n\nTotal: ${results.summary.total}\nOK: ${results.summary.passed}\nFAIL: ${results.summary.failed}\nERROR: ${results.summary.errored}\n\nCheck console for detailed report.`);
                    }}
                    className="w-full py-2 text-[10px] font-black uppercase tracking-widest rounded border border-[#f1c40f] text-[#f1c40f] bg-[#1a160a] hover:bg-[#f1c40f] hover:text-[#0a0804] transition-all"
                >
                    Run Full Build Audit
                </button>
            </div>
        )}
        
        <div className="mt-3 pt-2 border-t border-[#1e1c18]">
            <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={p.developerMode} onChange={e => p.setDeveloperMode(e.target.checked)} className="hidden" />
                <div className={`w-3 h-3 rounded-full border border-[#f1c40f] flex items-center justify-center ${p.developerMode ? "bg-[#f1c40f]" : "bg-transparent group-hover:bg-[#f1c40f22]"}`} />
                <span className="text-[9px] uppercase font-black text-[#f1c40f] opacity-60 group-hover:opacity-100 transition-opacity">🛠️ Developer Controls</span>
            </label>
        </div>
    </div>
  );

  return (

    <div className="flex-1 overflow-y-auto pb-4">
      {sec("sandbox", "📡 Intelligent Sandbox", sandboxSec)}
      {p.extraControls}
      {/* Quick Presets */}
      {sec("presets", "⚡ Quick Presets", (
        <div className="px-3">
          <div className="relative mb-2">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6a5830] text-[11px] pointer-events-none">🔍</span>
            <input type="text" placeholder="Search presets..." value={p.presetFilter}
              onChange={e => p.setPresetFilter(e.target.value)}
              className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[11px] pl-6 pr-2 py-1 rounded-sm focus:outline-none focus:border-[#8a6a0f] transition-colors"
            />
          </div>
          {/* Category tabs — scrollable pill row */}
          <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-none pb-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {(p.presetCategories || []).map((cat: string) => (
              <button key={cat} onClick={() => p.setPresetCategory(cat)}
                className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full border transition-all duration-150 ${p.presetCategory === cat ? "border-[#27ae60] text-[#080f09] bg-[#27ae60] font-bold" : "border-[#3a2e18] text-[#9a8050] hover:border-[#27ae60]/60 hover:text-[#b8d4b8]"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-[#2a5a2a]">
              {p.filteredPresets.length} preset{p.filteredPresets.length !== 1 ? "s" : ""}
              {p.presetCategory !== "All" && ` · ${p.presetCategory}`}
            </span>
            {p.presetFilter && (
              <button onClick={() => p.setPresetFilter("")} className="text-[9px] text-[#8a6a30] hover:text-[#27ae60] transition-colors">✖ clear</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-52 overflow-y-auto pr-0.5">
            {p.filteredPresets.map((preset: any) => {
              const isActive = p.selectedPresetLabel === preset.label;
              const isFav = (p.favourites ?? []).includes(preset.label);
              return (
                <div key={preset.label} className="relative group">
                  <button onClick={() => p.applyPreset(preset)}
                    className={`w-full text-left text-[10px] px-2 py-1.5 pr-6 rounded border transition-all duration-150 flex items-center gap-1 min-w-0 ${isActive ? "border-[#27ae60] text-[#27ae60] bg-[#0e1a0e] shadow-[0_0_8px_rgba(39,174,96,0.2)]" : "border-[#0e2010] text-[#c0aa70] hover:border-[#27ae60]/50 hover:text-[#e8c878] hover:bg-[#120e06]"}`}>
                    {isActive && <span className="shrink-0 text-[#27ae60] text-[9px]">✓</span>}
                    <span className="truncate">{preset.label}</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); p.toggleFavourite(preset.label); }}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 text-[10px] transition-all ${isFav ? "opacity-100 text-[#f39c12]" : "opacity-0 group-hover:opacity-60 text-[#5a8a5a] hover:text-[#f39c12]"}`}
                    title={isFav ? "Remove from favourites" : "Add to favourites"}>
                    {isFav ? "★" : "☆"}
                  </button>
                </div>
              );
            })}
            {p.filteredPresets.length === 0 && (
              <div className="col-span-2 text-center text-[10px] text-[#8a7840] py-3">No presets match filter</div>
            )}
          </div>
          {(p.favourites ?? []).length > 0 && (
            <div className="mt-2 pt-2 border-t border-[#0e2010]">
              <div className="text-[8px] text-[#5a4820] mb-1 tracking-widest">â˜… FAVOURITES ({p.favourites.length})</div>
              <div className="flex flex-wrap gap-1">
                {(p.favourites as string[]).map((label: string) => (
                  <button key={label} onClick={() => { const pr = p.filteredPresets.find((x: any) => x.label === label) ?? { label, shape: label, params: {}, category: "" }; p.applyPreset(pr); }}
                    className="text-[9px] px-1.5 py-0.5 rounded border border-[#f39c1244] text-[#f39c12] bg-[#120e06] hover:border-[#f39c12] transition-colors truncate max-w-[120px]">
                    ★ {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={p.onSurpriseMe}
            className="mt-2 w-full py-1.5 text-[10px] font-bold rounded border border-[#27ae60]/40 text-[#27ae60] bg-[#14100a] hover:bg-[#27ae60] hover:text-[#080f09] hover:border-[#27ae60] transition-all duration-150 active:scale-95">
            🎲 Surprise Me — Random Preset
          </button>
        </div>
      ))}

      {/* ⚔ Arena Maker */}
      {sec("arena", "⚔ Arena Maker", (
        <div className="px-3">
          {/* Big roll button */}
          <button onClick={p.onRollArena}
            className="w-full py-2.5 mb-2.5 text-[11px] font-black tracking-wider rounded-sm border border-[#27ae60] text-[#080f09] bg-[#27ae60] hover:bg-[#e8b82a] hover:border-[#e8b82a] transition-all shadow-lg">
            🎲 ROLL RANDOM ARENA
          </button>
          {/* 6 arena type tiles */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            {[
              { key: "arena_colosseum", icon: "\u{1F3DB}", label: "Colosseum" },
              { key: "arena_fort",      icon: "\u{1F3F0}", label: "Fortress"  },
              { key: "arena_maze",      icon: "\u{1F300}", label: "Maze"      },
              { key: "arena_siege",     icon: "\u2694", label: "Siege"     },
              { key: "arena_compound",  icon: "\u{1FA96}", label: "Compound"  },
              { key: "pvp_arena",       icon: "\u{1F535}", label: "Ring"      },
            ].map(({ key, icon, label }) => (
              <button key={key} onClick={() => p.onShapeChange(key)}
                className={`text-center px-1 py-1.5 rounded-sm border transition-all ${p.shapeType === key ? "border-[#27ae60] bg-[#0e1a0e]" : "border-[#0e2010] hover:border-[#3a6a3a] bg-[#060402]"}`}>
                <div className="text-base leading-none mb-0.5">{icon}</div>
                <div className={`text-[9px] font-bold ${p.shapeType === key ? "text-[#27ae60]" : "text-[#b09a6a]"}`}>{label}</div>
              </button>
            ))}
          </div>
          {/* Randomize current arena type */}
          <button onClick={p.onRollSameArena}
            className="w-full py-1 text-[10px] font-bold rounded-sm border border-[#3a2e18] text-[#b09a6a] hover:border-[#27ae60] hover:text-[#27ae60] transition-all">
            🔄 Randomize This Type Again
          </button>
        </div>
      ))}


      {/* 📦 Object */}
      {sec("obj", "📦 Object Class", (
        <div className="px-3">
          <Lbl>Search Objects (27 groups, 494+ items)</Lbl>
          <input
            type="text"
            placeholder="Search classname or label..."
            value={p.objSearch || ""}
            onChange={e => p.setObjSearch(e.target.value)}
            className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[11px] px-2 py-1 rounded-sm mb-1 focus:outline-none focus:border-[#8a6a0f]"
          />
          {(p.objSearch || "").length > 0 && (
            <div className="text-[9px] text-[#7a6040] mb-1">
              {DAYZ_OBJECTS.filter(o => `${o.label} ${o.value}`.toLowerCase().includes((p.objSearch || "").toLowerCase())).length} matches
            </div>
          )}
          <select className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
            onChange={e => { p.setObjClass(e.target.value); p.setObjSearch(""); }} value={p.objClass}>
            {(() => {
              const q = (p.objSearch || "").toLowerCase().trim();
              if (!q) {
                return OBJECT_GROUPS.map((group: string) => (
                  <optgroup key={group} label={group}>
                    {DAYZ_OBJECTS.filter(o => o.group === group).map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                ));
              }
              const matches = DAYZ_OBJECTS.filter(o => `${o.label} ${o.value}`.toLowerCase().includes(q));
              const groups = [...new Set(matches.map(o => o.group))];
              return groups.map((group: string) => (
                <optgroup key={group} label={group}>
                  {matches.filter(o => o.group === group).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </optgroup>
              ));
            })()}
          </select>

          <Lbl>Classname / Path</Lbl>
          <Inp onFocus={p.captureState} type="text" value={p.objClass} onChange={v => p.setObjClass(v)} />
          <Lbl>Extra Objects per Point (comma-sep)</Lbl>
          <Inp onFocus={p.captureState} type="text" value={p.extraObjs} onChange={v => p.setExtraObjs(v)} placeholder="Barrel_Blue,HatchbackWheel" />
          {p.extraObjs && (
            <>
              <Lbl>Y Offset Between Stacked (m)</Lbl>
              <Inp onFocus={p.captureState} value={p.stackY} onChange={v => p.setStackY(parseFloat(v) || 0)} step="0.5" />
            </>
          )}
        </div>
      ))}

      {/* 🔷 Shape */}
      {sec("shape", "🔷 Shape", (
        <div className="px-3">
          {/* Shape type selection removed as per DANKVAULT_STABLE_V2 */}

          {/* Parameters as sliders */}
          {p.paramDefs.length > 0 && (
            <div className="border border-[#0e2010] rounded-sm p-2 bg-[#060402]">
              {p.paramDefs.map((def: ParamDef) => (
                <Slider key={def.id}
                  label={def.label}
                  value={p.params[def.id] ?? def.val}
                  min={def.min} max={def.max}
                  step={def.step ?? (def.max - def.min <= 20 ? 1 : "any")}

                  onMouseDown={p.captureState}
                  onChange={v => p.setParam(def.id, v)}
                />
              ))}
              <button
                onClick={() => {
                  const defaults: Record<string, number> = {};
                  p.paramDefs.forEach((def: ParamDef) => { defaults[def.id] = def.val; });
                  p.setParams(defaults);
                }}
                className="mt-1 text-[8px] text-[#3a6a3a] hover:text-[#27ae60] transition-colors border border-[#0e2010] hover:border-[#27ae6044] px-2 py-0.5 rounded-sm w-full">
                â†º Reset to defaults
              </button>
            </div>
          )}
        </div>
      ))}

      {/* 🏠 Interior */}
      {sec("interior", "🏠 Interior", (
        <div className="px-3">
          <label className="flex items-center gap-2 cursor-pointer group mb-2">
            <input 
              type="checkbox" 
              checked={p.addInteriorRooms} 
              onChange={e => p.setAddInteriorRooms(e.target.checked)} 
              className="hidden" 
            />
            <div className={`w-3 h-3 rounded-sm border border-[#27ae60] flex items-center justify-center ${p.addInteriorRooms ? "bg-[#27ae60]" : "bg-transparent group-hover:bg-[#27ae6022]"}`} />
            <span className="text-[10px] uppercase font-black text-[#b8d4b8] opacity-70 group-hover:opacity-100 transition-opacity">Add Interior Rooms</span>
          </label>
          <div className="text-[8px] text-[#5a4a2a] leading-tight">
            Optional dividers using StaticObj_BusStation_wall.
          </div>
        </div>
      ))}

      {/* Position */}
      {sec("pos", "\u{1F4CD} Base Position", (
        <div className="px-3">
          {/* Famous Locations picker */}
          <Lbl>Famous Chernarus Location</Lbl>
          <select
            className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
            defaultValue=""
            onChange={e => {
              const loc = (p.famousLocations || []).find((l: any) => l.name === e.target.value);
              if (loc) { p.setPosX(loc.x); p.setPosY(loc.y); p.setPosZ(loc.z); }
              e.target.value = "";
            }}>
            <option value="" disabled>⚡ Jump to location…</option>
            {(p.famousLocations || []).map((loc: any) => (
              <option key={loc.name} value={loc.name}>{loc.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-1.5">

            {[["X", p.posX, p.setPosX], ["Y", p.posY, p.setPosY], ["Z", p.posZ, p.setPosZ]].map(([label, val, setter]) => (
              <div key={label as string}>
                <Lbl>{label as string}</Lbl>
                <Inp onFocus={p.captureState} value={val as number} onChange={v => (setter as any)(parseFloat(v) || 0)} step="10" />
              </div>
            ))}
          </div>
          <div className="mt-1">
            <Slider label={`Position Jitter ±${(p.jitter || 0).toFixed(1)}m`} value={p.jitter || 0} min={0} max={15} step={0.5} onChange={p.setJitter} />
          </div>
        </div>
      ))}

      {/* 📝 Build Notes */}
      {sec("notes", "📝 Build Notes", (
        <div className="px-3">
          <div className="text-[#7a6a2a] text-[8px] mb-1.5 leading-tight">Notes are embedded as comments in your init.c export.</div>
          <textarea
            value={p.buildNotes}
            onChange={e => p.setBuildNotes(e.target.value)}
            placeholder="e.g. North arena, Troitskoe base — added March 2025 & #10;Use Land_Wall_Brick_4m for frame objects..."
            rows={4}
            className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[10px] px-2 py-1.5 rounded-sm resize-none focus:outline-none focus:border-[#27ae60] placeholder-[#3a2e18] leading-relaxed"
          />
          {p.buildNotes.trim() && (
            <button onClick={() => p.setBuildNotes("")}
              className="mt-1 text-[8px] text-[#5a4820] hover:text-[#5a8a5a] transition-colors">
              Clear notes
            </button>
          )}
        </div>
      ))}

      {/* 📝 Spacing Calculator */}
      {sec("spacing", "📝 Object Spacing Calculator", (
        <SpacingCalcPanel />
      ))}

      {/* Stats — compact strip */}
      <div className="mx-3 mt-3 rounded-sm border border-[#1e1c18] px-2 py-1.5 bg-[#060402] flex items-center gap-3 flex-wrap text-[9px]">
        <span className="text-[#27ae60] font-bold">{p.objCount} obj</span>
        {p.dims && <span className="text-[#8a7840]">{p.dims.w}×{p.dims.d}×{p.dims.h}m</span>}
        <span className="text-[#8a7840]">{p.scaleVal.toFixed(2)}×</span>
        {p.autoOrient && <span className="text-[#27ae60]">{p.orientInward ? "↙ inward" : "↗ outward"}</span>}
      </div>

      {/* 📦 Packaging Profile */}
      {sec("package", "📦 Packaging Profile", (
        <div className="px-3">
          <Lbl>Optimisation Preset</Lbl>
          <select 
            className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#27ae60]"
            value={p.packagingProfile}
            onChange={e => p.setPackagingProfile(e.target.value as PackagingProfile)}
          >
            <option value="default">Default (Standard)</option>
            <option value="console_safe">Console Safe (Max 1800)</option>
            <option value="high_fidelity">High Fidelity (Total Detail)</option>
            <option value="budget">Budget (Max 1200)</option>
            <option value="pvp">PvP (Cover-Focused)</option>
            <option value="rp">RP (Detail-Focused)</option>
          </select>
          <div className="mt-1 text-[8px] text-[#5a4a2a] leading-tight">
            Applied during final export pass.
          </div>
        </div>
      ))}

      {/* Buttons */}
      <div className="px-3 mt-3 flex flex-col gap-1.5">
        <button onClick={p.onGenerate}
          className={`w-full py-2.5 font-black text-[12px] tracking-widest rounded-sm transition-all shadow-lg ${p.objCount > 1500 ? "bg-[#c0392b] text-white hover:bg-[#e74c3c]" : "bg-[#27ae60] text-[#080f09] hover:bg-[#e8b82a]"}`}>
          {p.objCount > 1500 ? "⚠️ GENERATE CODE" : "⚙️ GENERATE CODE"}
        </button>
        <button onClick={p.onClear}
          className="w-full py-1.5 bg-[#1e1608] text-[#b09a6a] text-[11px] font-bold rounded-sm border border-[#1e1c18] hover:bg-[#0e2010] hover:text-[#8a7a5a] transition-all">
          ✖ Clear Output
        </button>
      </div>
    </div>
  );
}

// ─── TEXT SIDEBAR ────────────────────────────────────────────────────────
function TextSidebar(p: {
  textInput: string; textObj: string; textScale: number;
  textLetterH: number; textSpacing: number; textDepth: number;
  textRings: number; textPosX: number; textPosY: number; textPosZ: number;
  textFormat: OutputFormat; objCount: number;
  textArcDeg: number;
  setTextInput: (v: string) => void; setTextObj: (v: string) => void; setTextScale: (v: number) => void;
  setTextLetterH: (v: number) => void; setTextSpacing: (v: number) => void;
  setTextDepth: (v: number) => void; setTextRings: (v: number) => void;
  setTextPosX: (v: number) => void; setTextPosY: (v: number) => void; setTextPosZ: (v: number) => void;
  setTextFormat: (v: OutputFormat) => void; setTextArcDeg: (v: number) => void;
  onGenerate: () => void;
  textObjSearch: string; setTextObjSearch: (v: string) => void;
  packagingProfile: PackagingProfile; setPackagingProfile: (v: PackagingProfile) => void;
  sandboxEnabled: boolean; setSandboxEnabled: (v: boolean) => void;
  sandboxHUD: boolean; setSandboxHUD: (v: boolean) => void;
  sandboxOverlays: any; setSandboxOverlays: (v: any) => void;
  developerMode: boolean; setDeveloperMode: (v: boolean) => void;
  showDebugGeometry: boolean; setShowDebugGeometry: (v: boolean) => void;
}) {
  const Sec = ({ children }: any) => <div className="text-[10px] font-black uppercase text-[#27ae60] px-3 py-2 bg-[#0d1a0e] border-y border-[#1a2e1a] mb-2">{children}</div>;
  const Lbl = ({ children }: any) => <div className="text-[9px] text-[#4a7a4a] uppercase font-bold mb-1 tracking-wider">{children}</div>;

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* 📡 Sandbox section (copied logic) */}
      <div className="text-[10px] font-black uppercase text-[#27ae60] px-3 py-2 bg-[#0d1a0e] border-y border-[#1a2e1a] mb-2 flex justify-between items-center">
          <span>📡 Intelligent Sandbox</span>
          <button onClick={() => p.setSandboxEnabled(!p.sandboxEnabled)} className={`text-[8px] px-1.5 py-0.5 rounded border ${p.sandboxEnabled ? "bg-[#27ae60] text-black border-[#27ae60]" : "border-[#27ae6044] text-[#27ae60]"}`}>
            {p.sandboxEnabled ? "ON" : "OFF"}
          </button>
      </div>
      {p.sandboxEnabled && (
          <div className="px-3 mb-4 space-y-2 border-l border-[#27ae6033] ml-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={p.sandboxHUD} onChange={e => p.setSandboxHUD(e.target.checked)} className="hidden" />
                  <div className={`w-2.5 h-2.5 rounded-full border border-[#27ae60] flex items-center justify-center ${p.sandboxHUD ? "bg-[#27ae60]" : "bg-transparent group-hover:bg-[#27ae6022]"}`} />
                  <span className="text-[9px] uppercase font-bold text-[#b8d4b8] opacity-60">Show HUD Telemetry</span>
              </label>
              {p.developerMode && (
                   <label className="flex items-center gap-2 cursor-pointer group pt-1">
                      <input type="checkbox" checked={p.showDebugGeometry} onChange={e => p.setShowDebugGeometry(e.target.checked)} className="hidden" />
                      <div className={`w-2 h-2 rounded-sm border border-[#e74c3c] flex items-center justify-center ${p.showDebugGeometry ? "bg-[#e74c3c]" : "bg-transparent"}`} />
                      <span className="text-[9px] uppercase font-bold text-[#e74c3c] opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">Draw Debug Geometry</span>
                   </label>
              )}
          </div>
      )}

      <Sec>✍ Text Input [LIVE PREVIEW]</Sec>
      <div className="px-3">
        <Lbl>Type your text (A–Z, 0–9, !?., space)</Lbl>
        <input type="text" value={p.textInput} onChange={e => p.setTextInput(e.target.value.toUpperCase())}
          placeholder="DAYZ"
          className="w-full bg-[#060402] border-2 border-[#27ae60] text-[#27ae60] text-xl px-3 py-2 rounded-sm mb-2 focus:outline-none font-mono font-black tracking-[0.3em] text-center"
        />
        <Slider label="Letter Height (m)" value={p.textLetterH} min={3} max={50} step={1} onChange={p.setTextLetterH} />
        <Slider label="Letter Spacing" value={p.textSpacing} min={0.8} max={2.5} step={0.05} onChange={p.setTextSpacing} />
        <Slider label="Extrusion Depth (m)" value={p.textDepth} min={0} max={40} step={1} onChange={p.setTextDepth} />
        <Slider label="Scale" value={p.textScale} min={0.1} max={10} step={0.1} onChange={p.setTextScale} />
        <Slider label="Arc Bend (°)" value={p.textArcDeg} min={-360} max={360} step={5} onChange={p.setTextArcDeg} />
      </div>

      <Sec>📦 Packaging Profile</Sec>
        <div className="px-3">
          <select 
            className="w-full bg-[#1a2e1a] border border-[#27ae6044] text-[#27ae60] text-[10px] font-bold px-2 py-1.5 rounded-sm mb-2 focus:outline-none"
            value={p.packagingProfile}
            onChange={e => p.setPackagingProfile(e.target.value as PackagingProfile)}
          >
            <option value="default">Profile: Default</option>
            <option value="console_safe">Profile: Console Safe</option>
            <option value="high_fidelity">Profile: High Fidelity</option>
            <option value="budget">Profile: Budget</option>
            <option value="pvp">Profile: PvP</option>
            <option value="rp">Profile: RP</option>
          </select>
        </div>

      <Sec>📄 Format</Sec>
      <div className="flex gap-1 px-3 mb-3">
        {(["initc", "json"] as OutputFormat[]).map(f => (
          <button key={f} onClick={() => p.setTextFormat(f)}
            className={`flex-1 py-1.5 text-[11px] rounded-sm border font-bold transition-all ${p.textFormat === f ? "bg-[#27ae60] text-[#080f09] border-[#27ae60]" : "border-[#0e2010] text-[#b09a6a] hover:border-[#3a6a3a]"}`}>
            {f === "initc" ? "init.c" : "JSON"}
          </button>
        ))}
      </div>

      <div className="px-3 mt-3">
        <button onClick={p.onGenerate}
          className="w-full py-2.5 bg-[#27ae60] text-[#080f09] font-black text-[12px] tracking-widest rounded-sm hover:bg-[#e8b82a] transition-all shadow-lg">
          ⚙️ GENERATE TEXT CODE
        </button>
      </div>
    </div>
  );
}

// ─── BUILDS SIDEBAR ────────────────────────────────────────────────────────
function BuildsSidebar(p: {
  builds: CompletedBuild[];
  selectedId: string;
  filter: string;
  category: string;
  zipGenerating: boolean;
  onSelect: (id: string) => void;
  onLoadIntoEditor: (build: CompletedBuild | any) => void;
  onFilterChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onDownloadPackage: (id: string, shape: string, params: any, cat: string, fmt?: "json" | "initc") => void;
  onGetValidationStatus: (build: any) => any;
  packagingProfile: PackagingProfile;
  setPackagingProfile: (v: PackagingProfile) => void;
  sandboxEnabled: boolean; setSandboxEnabled: (v: boolean) => void;
  sandboxHUD: boolean; setSandboxHUD: (v: boolean) => void;
  sandboxOverlays: any; setSandboxOverlays: (v: any) => void;
  developerMode: boolean; setDeveloperMode: (v: boolean) => void;
  showDebugGeometry: boolean; setShowDebugGeometry: (v: boolean) => void;
}) {
  const CATS = ["All", ...Array.from(new Set(p.builds.map(b => b.category)))];
  const filtered = p.builds.filter(b => {
    const catOk = p.category === "All" || b.category === p.category;
    const q = p.filter.toLowerCase();
    const textOk = !q || (b.name || "").toLowerCase().includes(q) || (b.tagline || "").toLowerCase().includes(q);
    return catOk && textOk;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a1209]">
      <div className="px-3 pt-3 pb-2 border-b border-[#0e2010] shrink-0">
        <div className="text-[#27ae60] text-[9px] font-bold tracking-widest uppercase mb-2">
            🏆 Library Builds — {p.builds.length} Ready
        </div>
        <input
          type="text"
          value={p.filter}
          onChange={e => p.onFilterChange(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-[#060402] border border-[#0e2010] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded-sm focus:outline-none mb-2"
        />

        {/* 📡 Sandbox section (compact) */}
        <div className="flex gap-1 mb-2">
            <button onClick={() => p.setSandboxEnabled(!p.sandboxEnabled)} 
                className={`flex-1 py-1 text-[9px] font-black uppercase rounded-sm border transition-all ${p.sandboxEnabled ? "bg-[#27ae60] text-[#080f08] border-[#27ae60]" : "border-[#27ae6033] text-[#27ae60]"}`}>
                {p.sandboxEnabled ? "📡 Sandbox ON" : "📡 Sandbox OFF"}
            </button>
            {p.sandboxEnabled && (
                <button onClick={() => p.setSandboxHUD(!p.sandboxHUD)} 
                    className={`flex-1 py-1 text-[9px] font-black uppercase rounded-sm border transition-all ${p.sandboxHUD ? "bg-[#d4a017] text-[#080f08] border-[#d4a017]" : "border-[#d4a01733] text-[#d4a017]"}`}>
                    HUD {p.sandboxHUD ? "ON" : "OFF"}
                </button>
            )}
        </div>

        <select 
            className="w-full bg-[#1a2e1a] border border-[#27ae6044] text-[#27ae60] text-[10px] font-bold px-2 py-1.5 rounded-sm mb-2 focus:outline-none"
            value={p.packagingProfile}
            onChange={e => p.setPackagingProfile(e.target.value as PackagingProfile)}
        >
            <option value="default">📦 Profile: Default</option>
            <option value="console_safe">📦 Profile: Console Safe</option>
            <option value="high_fidelity">📦 Profile: High Fidelity</option>
            <option value="budget">📦 Profile: Budget</option>
            <option value="pvp">📦 Profile: PvP</option>
            <option value="rp">📦 Profile: RP</option>
        </select>

        <div className="flex flex-wrap gap-1">
          {CATS.map(cat => (
            <button key={cat} onClick={() => p.onCategoryChange(cat)}
              className={`px-1.5 py-0.5 text-[9px] rounded-sm font-bold border ${p.category === cat ? "bg-[#27ae60] text-[#080f09] border-[#27ae60]" : "border-[#0e2010] text-[#5a8a5a]"}`}>
              {cat === "All" ? "All" : cat.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(b => {
          const isSelected = b.id === p.selectedId;
          const status = p.onGetValidationStatus(b);
          const color = status?.health >= 80 ? "text-[#27ae60]" : status?.health >= 40 ? "text-[#d4a017]" : "text-[#e74c3c]";
          
          return (
            <div key={b.id}
              onClick={() => p.onSelect(b.id)}
              className={`border-b border-[#1e1c18] cursor-pointer p-3 transition-all ${isSelected ? "bg-[#0f1f0f] border-l-2 border-l-[#27ae60]" : "hover:bg-[#0f0d09]"}`}>
              <div className="flex justify-between items-start mb-1">
                <div className={`text-[11px] font-bold ${isSelected ? "text-[#27ae60]" : "text-[#b8d4b8]"}`}>{b.name}</div>
                {status && <span className={`text-[8px] font-black ${color}`}>{status.health}%</span>}
              </div>
              <div className="text-[9px] text-[#8a7840] line-clamp-1 mb-2">{b.tagline}</div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  disabled={p.zipGenerating}
                  onClick={e => { e.stopPropagation(); p.onDownloadPackage(b.id, b.shape, b.params, b.category, "initc"); }}
                  className="py-1 text-[8px] font-bold border border-[#27ae60] text-[#27ae60] rounded-sm hover:bg-[#27ae60] hover:text-[#080f09] disabled:opacity-50">
                  ⬇ .C {p.zipGenerating && "..."}
                </button>
                <button
                  disabled={p.zipGenerating}
                  onClick={e => { e.stopPropagation(); p.onDownloadPackage(b.id, b.shape, b.params, b.category, "json"); }}
                  className="py-1 text-[8px] font-bold border border-[#6a7abf] text-[#6a7abf] rounded-sm hover:bg-[#6a7abf] hover:text-[#080f09] disabled:opacity-50">
                  ⬇ JSON
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#0e2010] text-[9px] text-[#5a8a5a] shrink-0">
        All builds pre-positioned at NWAF or Krasnoe · Console safe
      </div>
    </div>
  );
}

