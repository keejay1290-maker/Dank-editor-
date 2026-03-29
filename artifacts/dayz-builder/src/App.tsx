import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { getShapePoints, Point3D } from "@/lib/shapeGenerators";
import { SHAPE_DEFS, SHAPE_GROUPS, ParamDef } from "@/lib/shapeParams";
import { DAYZ_OBJECTS, OBJECT_GROUPS, formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import { COMPLETED_BUILDS, CompletedBuild } from "@/lib/completedBuilds";
import WeaponBuilder from "@/WeaponBuilder";

type EditorMode = "architect" | "text" | "builds" | "weapons";
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
    // Physical pixel dimensions — the actual canvas buffer size
    const PW = canvas.width;
    const PH = canvas.height;
    // CSS dimensions — used for projection math (centering, spread)
    const W = cssDimsRef.current.w || PW / dpr;
    const H = cssDimsRef.current.h || PH / dpr;
    if (PW <= 0 || PH <= 0) return;

    const pts = ptsRef.current;
    const userScale = scaleRef.current;

    // ── Draw directly in physical pixels — no ctx.scale, so every coordinate
    //    is an integer screen pixel. This is the key to crispness on retina/mobile.
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#060402";
    ctx.fillRect(0, 0, PW, PH);

    if (!pts.length) {
      ctx.fillStyle = "#2e2518";
      ctx.font = `bold ${Math.round(12 * dpr)}px 'Courier New'`;
      ctx.textAlign = "center";
      ctx.fillText("← Configure shape  ·  real-time 3D updates instantly", Math.round(PW / 2), Math.round(PH / 2));
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
      // Convert to physical pixels — round to nearest integer for pixel-perfect placement
      const px = Math.round((W / 2 + rx1 * baseZoom * sc) * dpr);
      const py = Math.round((H / 2 - ry2 * baseZoom * sc) * dpr);
      return { px, py, depth: rz2 };
    }).filter(Boolean) as { px: number; py: number; depth: number }[];

    projected.sort((a, b) => b.depth - a.depth);
    const maxD = spread * 1.5, minD = -spread * 1.5;

    // ── Zoom-aware dot size: cap scales WITH zoom so dots shrink at low zoom
    //    preventing them from overlapping into a solid blob when zoomed out
    const zoomCap  = Math.max(1.5, 4.0 * dpr * Math.min(1, zoom * 0.75));
    const baseDotPhys = Math.max(1, Math.min(zoomCap, (380 / Math.sqrt(pts.length + 1)) * zoom * dpr));

    // ── Occlusion culling at low zoom: skip dots that land on an already-drawn cell
    //    This breaks up the blob by showing only one dot per occupied pixel region
    const cullCell  = zoom < 1.2 ? Math.max(1, Math.round(baseDotPhys * 1.4)) : 0;
    const occupied  = cullCell > 0 ? new Set<number>() : null;

    projected.forEach(({ px, py, depth }) => {
      // Occlusion check — keyed by grid cell so nearby dots are skipped
      if (occupied) {
        const cx2 = Math.round(px / cullCell);
        const cy2 = Math.round(py / cullCell);
        const key = cx2 * 100003 + cy2; // prime-multiplied hash to avoid collisions
        if (occupied.has(key)) return;
        occupied.add(key);
      }

      const t = Math.max(0, Math.min(1, (depth - minD) / (maxD - minD)));
      // ── Wider depth range: front bright gold, back very dim brown (better separation)
      const r = Math.round(220 * t + 50 * (1 - t));
      const g = Math.round(160 * t + 70 * (1 - t));
      const b = Math.round(20  * t + 6  * (1 - t));
      const alpha = 0.28 + 0.72 * t;    // was 0.6+0.4 — now much wider range
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;

      // Front dots slightly larger than back dots for natural depth cue
      const rad = baseDotPhys * (0.7 + 0.3 * t);

      // ── Crisp rendering: small → fillRect (zero blur), larger → arc at integer centre
      if (rad <= 2) {
        const s = Math.max(1, Math.round(rad * 2));
        ctx.fillRect(px - (s >> 1), py - (s >> 1), s, s);
      } else {
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // HUD — scale font to physical pixels
    ctx.fillStyle = "rgba(212,160,23,0.9)";
    ctx.font = `bold ${Math.round(11 * dpr)}px 'Courier New'`;
    ctx.textAlign = "left";
    ctx.fillText(
      `● LIVE  ${pts.length.toLocaleString()} pts  ×${zoom.toFixed(2)}`,
      Math.round(9 * dpr), Math.round(17 * dpr)
    );
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
    // Pinch-to-zoom — track distance between two fingers
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

  // Resize observer — DPR-aware sizing prevents blurriness on HiDPI screens
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

// ─── QUICK PRESETS ────────────────────────────────────────────────────────────
type Preset = { label: string; shape: string; params: Record<string, number>; category: string };
const QUICK_PRESETS: Preset[] = [
  // 🚀 Sci-Fi & Space
  { category: "🚀 Sci-Fi", label: "Death Star", shape: "deathstar", params: { radius:40,latSegs:10,lonSegs:16,dishRadius:12,dishDepth:8,dishLat:30 } },
  { category: "🚀 Sci-Fi", label: "Orbital Ring", shape: "orbital_station", params: { radius:40 } },
  { category: "🚀 Sci-Fi", label: "DNA Helix", shape: "dna_double", params: { radius:12,height:40,turns:5,pointsPerTurn:12 } },
  { category: "🚀 Sci-Fi", label: "Millennium Falcon", shape: "millennium_falcon", params: { radius:30 } },
  { category: "🚀 Sci-Fi", label: "Sci-Fi Gate", shape: "sci_fi_gate", params: { width:40,height:30 } },
  { category: "🚀 Sci-Fi", label: "Reactor Core", shape: "reactor_core", params: { radius:25,height:30,rings:5 } },
  { category: "🚀 Sci-Fi", label: "Crashed UFO", shape: "crashed_ufo", params: { radius:25,tiltDeg:25,debris:10 } },
  { category: "🚀 Sci-Fi", label: "Alien Mothership", shape: "alien_mothership", params: { radius:50,emitterCount:8 } },
  { category: "🚀 Sci-Fi", label: "Black Hole", shape: "black_hole", params: { radius:30,arcs:4 } },
  { category: "🚀 Sci-Fi", label: "Torus Gate", shape: "torus", params: { majorR:30,minorR:8,majorSegs:20,minorSegs:10 } },
  { category: "🚀 Sci-Fi", label: "Ring Platform", shape: "disc", params: { radius:30,rings:2,points:24,innerRadius:15 } },
  { category: "🚀 Sci-Fi", label: "Hex Tunnel", shape: "tunnel_hex", params: { radius:8,length:50,spacing:4,segments:10 } },

  // 🤖 Mechs & Robots
  { category: "🤖 Mechs", label: "Mech Warrior", shape: "mech_bipedal", params: { height:25,width:14 } },
  { category: "🤖 Mechs", label: "Spider Walker", shape: "mech_walker", params: { height:20,width:18 } },
  { category: "🤖 Mechs", label: "Minigun Turret", shape: "mech_minigun", params: { baseRadius:10,height:20,barrelCount:6 } },
  { category: "🤖 Mechs", label: "Cannon Turret", shape: "cannon_turret", params: { baseRadius:8,height:12 } },

  // 🏛️ Monuments & Structures
  { category: "🏛️ Monuments", label: "Colosseum", shape: "colosseum", params: { radius:60,height:30,tiers:3,arches:20 } },
  { category: "🏛️ Monuments", label: "Stonehenge", shape: "stonehenge", params: { outerRadius:30,innerRadius:16,stoneHeight:8,stoneWidth:2,outerCount:30,trilithonCount:5,archCount:6 } },
  { category: "🏛️ Monuments", label: "Celtic Ring", shape: "celtic_ring", params: { radius:30,height:8,stoneCount:24,archCount:6 } },
  { category: "🏛️ Monuments", label: "Azkaban", shape: "azkaban_tower", params: { baseRadius:20,height:60,towerCount:5 } },
  { category: "🏛️ Monuments", label: "Skyscraper", shape: "skyscraper", params: { width:20,height:100,floors:20 } },
  { category: "🏛️ Monuments", label: "Pyramid Aztec", shape: "pyramid_stepped", params: { baseSize:80,height:40,steps:6,shrink:0.18,spacing:6 } },
  { category: "🏛️ Monuments", label: "Prison Tower", shape: "prison_tower", params: { baseRadius:15,height:40,tiers:4 } },
  { category: "🏛️ Monuments", label: "Star Fort", shape: "star_fort", params: { outerR:50,innerR:30,points:5,height:12,rings:2 } },
  { category: "🏛️ Monuments", label: "Bastion Round", shape: "bastion_round", params: { radius:30,height:10,towerRadius:6,towerCount:4 } },
  { category: "🏛️ Monuments", label: "Bastion Square", shape: "bastion_square", params: { size:40,height:8,towerRadius:5 } },

  // 🪑 Furniture & Thrones (pair with weapons/barrels!)
  { category: "🪑 Furniture", label: "Weapon Throne", shape: "disc", params: { radius:4,rings:1,points:16,innerRadius:0 } },
  { category: "🪑 Furniture", label: "Campfire Ring", shape: "disc", params: { radius:5,rings:1,points:12,innerRadius:3 } },
  { category: "🪑 Furniture", label: "Round Table", shape: "disc", params: { radius:6,rings:2,points:18,innerRadius:0 } },
  { category: "🪑 Furniture", label: "Bench (long)", shape: "wall_line", params: { length:8,height:1,rings:1,spacing:1 } },
  { category: "🪑 Furniture", label: "Bench (short)", shape: "wall_line", params: { length:4,height:1,rings:1,spacing:1 } },
  { category: "🪑 Furniture", label: "Chair Circle", shape: "disc", params: { radius:3,rings:1,points:8,innerRadius:2 } },
  { category: "🪑 Furniture", label: "Trophy Wall", shape: "wall_line", params: { length:20,height:4,rings:4,spacing:2 } },
  { category: "🪑 Furniture", label: "Barrel Ring", shape: "disc", params: { radius:6,rings:1,points:8,innerRadius:5 } },

  // ⚔️ Medieval & Fantasy
  { category: "⚔️ Medieval", label: "Sword Circle", shape: "disc", params: { radius:8,rings:1,points:16,innerRadius:6 } },
  { category: "⚔️ Medieval", label: "Weapon Wall", shape: "wall_line", params: { length:30,height:8,rings:8,spacing:2 } },
  { category: "⚔️ Medieval", label: "Castle Wall", shape: "bastion_square", params: { size:80,height:12,towerRadius:8 } },
  { category: "⚔️ Medieval", label: "Guard Tower", shape: "tower", params: { radius:5,height:20,rings:6,points:12 } },
  { category: "⚔️ Medieval", label: "Arena Floor", shape: "disc", params: { radius:25,rings:4,points:32,innerRadius:0 } },

  // 💀 Dark & Horror
  { category: "💀 Dark", label: "Skull Giant", shape: "body_skull", params: { radius:18,eyeSocket:5,jawDrop:8 } },
  { category: "💀 Dark", label: "Mushroom Cloud", shape: "mushroom_cloud", params: { radius:40,height:80 } },
  { category: "💀 Dark", label: "Volcano", shape: "volcano", params: { baseRadius:50,height:32,craterRadius:10,rimHeight:4,rings:10,spacing:6 } },
  { category: "💀 Dark", label: "Rib Cage", shape: "body_ribcage", params: { width:8,height:14,ribs:8 } },
  { category: "💀 Dark", label: "Humanoid", shape: "body_humanoid", params: { height:20,width:8 } },

  // 🌿 Nature & Terrain
  { category: "🌿 Nature", label: "Grid Platform", shape: "grid_flat", params: { width:40,depth:40,spacingX:4,spacingZ:4 } },
  { category: "🌿 Nature", label: "Staircase Up", shape: "staircase", params: { steps:12,stepH:1,stepD:2,width:6 } },
  { category: "🌿 Nature", label: "Landing Pad", shape: "disc", params: { radius:20,rings:3,points:24,innerRadius:0 } },
  { category: "🌿 Nature", label: "Sphere", shape: "sphere", params: { radius:25,latSegs:8,lonSegs:12 } },
  { category: "🌿 Nature", label: "Helix Spiral", shape: "helix", params: { radius:15,height:30,turns:4,pointsPerTurn:12,strands:1 } },

  // 🎬 Movies & TV
  { category: "🎬 Movies", label: "Halo Ring", shape: "torus", params: { majorR:60,minorR:4,majorSegs:36,minorSegs:6 } },
  { category: "🎬 Movies", label: "AT-AT Walker", shape: "atat_walker", params: { height:30,width:20 } },
  { category: "🎬 Movies", label: "Iron Throne", shape: "disc", params: { radius:4,rings:1,points:20,innerRadius:0 } },
  { category: "🎬 Movies", label: "The Wall (GoT)", shape: "wall_line", params: { length:100,height:24,rings:12,spacing:2 } },
  { category: "🎬 Movies", label: "Eye of Sauron", shape: "eye_of_sauron", params: { height:90,towerWidth:28,eyeRadius:22 } },
  { category: "🎬 Movies", label: "Avengers Tower", shape: "skyscraper", params: { width:14,height:130,floors:26 } },
  { category: "🎬 Movies", label: "Borg Cube", shape: "borg_cube", params: { size:40,gridLines:4 } },
  { category: "🎬 Movies", label: "Mordor Gate", shape: "sci_fi_gate", params: { width:80,height:60 } },
  { category: "🎬 Movies", label: "Minas Tirith", shape: "azkaban_tower", params: { baseRadius:35,height:90,towerCount:7 } },
  { category: "🎬 Movies", label: "T-800 Terminator", shape: "t800_endoskeleton", params: { height:22,width:10 } },
  { category: "🎬 Movies", label: "Squid Game Arena", shape: "disc", params: { radius:50,rings:6,points:36,innerRadius:0 } },
  { category: "🎬 Movies", label: "Predator Camp", shape: "disc", params: { radius:10,rings:2,points:12,innerRadius:6 } },
  { category: "🎬 Movies", label: "Nether Portal", shape: "sci_fi_gate", params: { width:16,height:22 } },
  { category: "🎬 Movies", label: "Star Destroyer", shape: "pyramid_stepped", params: { baseSize:120,height:20,steps:3,shrink:0.3,spacing:6 } },
  // ── Transformers ──────────────────────────────────────────────────────────
  { category: "🤖 Transformers", label: "Bumblebee", shape: "tf_bumblebee", params: { scale: 1 } },
  { category: "🤖 Transformers", label: "Optimus Prime", shape: "tf_optimus", params: { scale: 1 } },
  { category: "🤖 Transformers", label: "Ironhide", shape: "tf_ironhide", params: { scale: 1 } },
  { category: "🤖 Transformers", label: "Jazz", shape: "tf_jazz", params: { scale: 1 } },
  { category: "🤖 Transformers", label: "Ratchet", shape: "tf_ratchet", params: { scale: 1 } },
  { category: "🤖 Transformers", label: "Megatron", shape: "tf_megatron", params: { scale: 1 } },
  { category: "🤖 Transformers", label: "Starscream", shape: "tf_starscream", params: { scale: 1 } },
  { category: "🦄 Fantasy & Mythic", label: "Dragon",  shape: "dragon",      params: { scale: 1, length: 12, wings: 8, neck: 4 } },
  { category: "🏴‍☠️ Nautical",      label: "Pirate Ship (3-mast)", shape: "pirate_ship", params: { scale: 1, length: 20, masts: 3 } },
  { category: "🏴‍☠️ Nautical",      label: "Sloop (1-mast)", shape: "pirate_ship", params: { scale: 0.6, length: 12, masts: 1 } },
  { category: "🏟 Structures",       label: "PVP Arena",  shape: "pvp_arena",  params: { scale: 1, radius: 15, height: 5, walls: 8 } },
  { category: "🏟 Structures",       label: "Helipad",    shape: "helipad",    params: { scale: 1, radius: 8,  elevated: 0, lights: 1 } },
  { category: "🏟 Structures",       label: "Elevated Helipad", shape: "helipad", params: { scale: 1, radius: 8, elevated: 1, height: 5, lights: 1 } },
  // ── Arena types
  { category: "⚔ Arenas", label: "Colosseum (Standard)", shape: "arena_colosseum", params: { scale: 1, radiusX: 22, radiusZ: 15, height: 7, tiers: 3 } },
  { category: "⚔ Arenas", label: "Colosseum (Grand)",    shape: "arena_colosseum", params: { scale: 1.4, radiusX: 28, radiusZ: 20, height: 9, tiers: 4 } },
  { category: "⚔ Arenas", label: "Colosseum (Intimate)", shape: "arena_colosseum", params: { scale: 0.7, radiusX: 14, radiusZ: 10, height: 5, tiers: 2 } },
  { category: "⚔ Arenas", label: "Fortress Arena",       shape: "arena_fort",      params: { scale: 1, width: 28, depth: 28, height: 6, bastions: 1 } },
  { category: "⚔ Arenas", label: "Fortress (No Bastions)",shape: "arena_fort",     params: { scale: 1, width: 32, depth: 22, height: 5, bastions: 0 } },
  { category: "⚔ Arenas", label: "Fortress (Massive)",   shape: "arena_fort",      params: { scale: 1.5, width: 40, depth: 40, height: 8, bastions: 1 } },
  { category: "⚔ Arenas", label: "Maze 10×10",           shape: "arena_maze",      params: { scale: 1, size: 10, wallH: 3 } },
  { category: "⚔ Arenas", label: "Maze 14×14 (Large)",   shape: "arena_maze",      params: { scale: 1, size: 14, wallH: 3.5 } },
  { category: "⚔ Arenas", label: "Maze 6×6 (Quick)",     shape: "arena_maze",      params: { scale: 1.2, size: 6, wallH: 2.5 } },
  { category: "⚔ Arenas", label: "Siege Arena",          shape: "arena_siege",     params: { scale: 1, width: 35, wallH: 6, towerH: 14 } },
  { category: "⚔ Arenas", label: "Siege (Massive Keep)",  shape: "arena_siege",    params: { scale: 1, width: 50, wallH: 8, towerH: 22 } },
  { category: "⚔ Arenas", label: "Military Compound",    shape: "arena_compound",  params: { scale: 1, width: 32, depth: 24, height: 4, rows: 3 } },
  { category: "⚔ Arenas", label: "Compound (Big Grid)",  shape: "arena_compound",  params: { scale: 1.2, width: 48, depth: 36, height: 4, rows: 5 } },
  { category: "⚔ Arenas", label: "Wall Perimeter (30m)", shape: "wall_perimeter",  params: { scale: 1, width: 30, depth: 30, wallSpacing: 3, wallH: 3, gapN: 0, gapS: 1, gapE: 0, gapW: 0, gapWidth: 4, corners: 1, towerH: 8 } },
  { category: "⚔ Arenas", label: "Wall Perimeter (50m)", shape: "wall_perimeter",  params: { scale: 1, width: 50, depth: 50, wallSpacing: 3, wallH: 4, gapN: 1, gapS: 1, gapE: 0, gapW: 0, gapWidth: 5, corners: 1, towerH: 10 } },
  { category: "⚔ Arenas", label: "Concrete Wall Base",   shape: "wall_perimeter",  params: { scale: 1, width: 40, depth: 25, wallSpacing: 4, wallH: 4, gapN: 0, gapS: 1, gapE: 0, gapW: 0, gapWidth: 4, corners: 1, towerH: 9 } },
  { category: "⚔ Arenas", label: "Huge Fortress Wall",   shape: "wall_perimeter",  params: { scale: 1, width: 80, depth: 60, wallSpacing: 3, wallH: 5, gapN: 0, gapS: 1, gapE: 1, gapW: 0, gapWidth: 6, corners: 1, towerH: 14 } },
];

// Arena shapes available for randomization
const ARENA_SHAPES = ['arena_colosseum', 'arena_fort', 'arena_maze', 'arena_siege', 'arena_compound', 'pvp_arena', 'wall_perimeter'] as const;

// ─── FAMOUS CHERNARUS LOCATIONS ────────────────────────────────────────────────
const FAMOUS_LOCATIONS = [
  { name: "📍 NWAF (Northwest Airfield)",  x: 4630,  y: 135, z: 10490 },
  { name: "📍 NEAF (Northeast Airfield)",  x: 11500, y: 130, z: 2500  },
  { name: "📍 Balota Airstrip",            x: 4980,  y: 10,  z: 2320  },
  { name: "📍 Krasnoe Airfield",           x: 11950, y: 148, z: 12540 },
  { name: "📍 Tisy Military Base",         x: 1500,  y: 260, z: 11700 },
  { name: "📍 Myshkino Military",          x: 2200,  y: 250, z: 8500  },
  { name: "📍 Pavlovo Military",           x: 3200,  y: 300, z: 4000  },
  { name: "📍 Kamensk Military",           x: 14800, y: 200, z: 12500 },
  { name: "📍 Chernogorsk (Cherno)",       x: 6500,  y: 10,  z: 2500  },
  { name: "📍 Elektrozavodsk (Elektro)",   x: 10200, y: 10,  z: 2100  },
  { name: "📍 Berezino",                   x: 13000, y: 10,  z: 7000  },
  { name: "📍 Krasnostav",                 x: 13000, y: 200, z: 4500  },
  { name: "📍 Zelenogorsk",               x: 2800,  y: 250, z: 5900  },
  { name: "📍 Vybor",                     x: 4000,  y: 200, z: 8000  },
  { name: "📍 Stary Sobor",               x: 6200,  y: 230, z: 7800  },
  { name: "📍 Gorka",                     x: 9000,  y: 200, z: 7200  },
  { name: "📍 Novy Sobor",               x: 7200,  y: 200, z: 7800  },
  { name: "📍 Lopatino",                  x: 2400,  y: 200, z: 7500  },
  { name: "📍 Rogovo",                    x: 3200,  y: 150, z: 5200  },
  { name: "📍 Devil's Castle",            x: 6800,  y: 400, z: 6000  },
  { name: "📍 Altar (NW Radio Tower)",    x: 3800,  y: 380, z: 6900  },
  { name: "📍 Black Lake (North)",        x: 7500,  y: 400, z: 12000 },
  { name: "📍 Staroye",                   x: 10000, y: 200, z: 6500  },
  { name: "📍 Novodmitrovsk",            x: 11400, y: 200, z: 4900  },
  { name: "📍 Kamenka",                  x: 1800,  y: 10,  z: 2200  },
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
  const [autoOrient, setAutoOrient] = useState(false);
  const [orientInward, setOrientInward] = useState(false);
  const [jitter, setJitter] = useState(0);
  const [buildNotes, setBuildNotes] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const [toast, setToast] = useState("");
  const [presetFilter, setPresetFilter] = useState("");
  const [presetCategory, setPresetCategory] = useState("All");

  // Completed Builds mode
  const [selectedBuildId, setSelectedBuildId] = useState<string>(COMPLETED_BUILDS[0]?.id || "");
  const [buildFilter, setBuildFilter] = useState("");
  const [buildCategory, setBuildCategory] = useState("All");

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
  const { updatePoints, startAutoRotate, stopAutoRotate, zoomStep, resetZoom } = use3DCanvas(canvasRef);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── SAVE / LOAD STATE ─────────────────────────────────────────────────────
  const captureCurrentState = useCallback(() => ({
    shapeType, params, posX, posY, posZ, yaw, pitch, roll,
    scaleVal, fillMode, fillDensity, format, objClass, extraObjs,
    stackY, jitter, autoOrient, orientInward, buildNotes,
  }), [shapeType, params, posX, posY, posZ, yaw, pitch, roll,
    scaleVal, fillMode, fillDensity, format, objClass, extraObjs,
    stackY, jitter, autoOrient, orientInward, buildNotes]);

  const restoreState = useCallback((s: any) => {
    setShapeType(s.shapeType ?? "deathstar");
    setParams(s.params ?? {});
    setPosX(s.posX ?? 12000); setPosY(s.posY ?? 150); setPosZ(s.posZ ?? 12600);
    setYaw(s.yaw ?? 0); setPitch(s.pitch ?? 0); setRoll(s.roll ?? 0);
    setScaleVal(s.scaleVal ?? 1);
    setFillMode(s.fillMode ?? "frame");
    setFillDensity(s.fillDensity ?? 2);
    setFormat(s.format ?? "initc");
    setObjClass(s.objClass ?? "StaticObj_Container_1D");
    setExtraObjs(s.extraObjs ?? "");
    setStackY(s.stackY ?? 0);
    setJitter(s.jitter ?? 0);
    setAutoOrient(s.autoOrient ?? false);
    setOrientInward(s.orientInward ?? false);
    setBuildNotes(s.buildNotes ?? "");
    setMode("architect");
  }, []);

  // ── COMPUTE SHAPE POINTS ──────────────────────────────────────────────────
  const rawPoints = useMemo(() => {
    if (mode === "text") {
      return getTextPoints(textInput, textLetterH, textSpacing, textDepth, textRings);
    }
    if (mode === "builds" && selectedBuildId) {
      const b = COMPLETED_BUILDS.find(b => b.id === selectedBuildId);
      if (b) return getShapePoints(b.shape, b.params);
    }
    return getShapePoints(shapeType, params);
  }, [mode, shapeType, params, selectedBuildId, textInput, textLetterH, textSpacing, textDepth, textRings]);

  // Apply fill mode with density — smart per-Y-level fill
  const displayPoints = useMemo(() => {
    if (mode === "text" || fillMode === "frame") return rawPoints;
    const extras: Point3D[] = [];
    if (!rawPoints.length) return rawPoints;
    // Bin points by Y level so each horizontal cross-section fills toward its
    // own centroid — this preserves silhouette on mechs, buildings, etc.
    const yMin = rawPoints.reduce((m, p) => Math.min(m, p.y), Infinity);
    const yMax = rawPoints.reduce((m, p) => Math.max(m, p.y), -Infinity);
    const binSize = Math.max(0.05, (yMax - yMin) * 0.025); // 2.5% of height per bin
    const yGroups = new Map<number, Point3D[]>();
    rawPoints.forEach(p => {
      const key = Math.round(p.y / binSize) * binSize;
      if (!yGroups.has(key)) yGroups.set(key, []);
      yGroups.get(key)!.push(p);
    });
    yGroups.forEach(levelPts => {
      if (levelPts.length < 2) return;
      const lCx = levelPts.reduce((s, p) => s + p.x, 0) / levelPts.length;
      const lCz = levelPts.reduce((s, p) => s + p.z, 0) / levelPts.length;
      const avgY = levelPts.reduce((s, p) => s + p.y, 0) / levelPts.length;
      levelPts.forEach(p => {
        for (let i = 1; i <= fillDensity; i++) {
          const t = i / (fillDensity + 1);
          extras.push({ x: p.x + (lCx - p.x) * t, y: avgY, z: p.z + (lCz - p.z) * t });
        }
      });
    });
    return [...rawPoints, ...extras];
  }, [rawPoints, fillMode, fillDensity, mode]);

  // Bounding-box dimensions in metres (scale-adjusted) — shown live in info bar
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

  const surpriseMe = () => {
    const pick = QUICK_PRESETS[Math.floor(Math.random() * QUICK_PRESETS.length)];
    applyPreset(pick);
    showToast(`🎲 Surprise: ${pick.label}`);
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
    showToast(`🎲 ${def.label} — new layout!`);
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
      lines.push(`// YPR: ${pitch}° / ${yaw}° / ${roll}°   Scale: ${scaleVal}${autoOrient ? "   [Auto-Orient: ON]" : ""}`);
      lines.push(`// Mode: ${fillMode}${fillMode === "fill" ? " density " + fillDensity : ""}   Objects: ${ptsToUse.length * (1 + extras.length)}`);
      if (buildNotes.trim()) lines.push(`// Notes: ${buildNotes.trim().replace(/\n+/g, " | ")}`);
      lines.push(``);
    }

    const yawRad = yaw * Math.PI / 180;

    // Compute centroid for auto-orient
    const cx = ptsToUse.reduce((s, p) => s + p.x, 0) / Math.max(1, ptsToUse.length);
    const cz = ptsToUse.reduce((s, p) => s + p.z, 0) / Math.max(1, ptsToUse.length);

    ptsToUse.forEach(pt => {
      const sx = pt.x * scaleVal, sy = pt.y * scaleVal, sz = pt.z * scaleVal;
      const jx = jitter > 0 ? (Math.random() - 0.5) * jitter : 0;
      const jz = jitter > 0 ? (Math.random() - 0.5) * jitter : 0;
      const wx = sx * Math.cos(yawRad) - sz * Math.sin(yawRad) + posX + jx;
      const wy = sy + posY;
      const wz = sx * Math.sin(yawRad) + sz * Math.cos(yawRad) + posZ + jz;

      // Per-point yaw: auto-orient faces outward (or inward) from shape centroid
      const ptYaw = autoOrient
        ? Math.atan2(pt.x - cx, pt.z - cz) * 180 / Math.PI + (orientInward ? 180 : 0)
        : yaw;

      if (format === "initc") {
        lines.push(formatInitC(objClass, wx, wy, wz, pitch, ptYaw, roll, scaleVal));
        objCount++;
        extras.forEach((ex, ei) => {
          lines.push(formatInitC(ex, wx, wy + stackY * (ei + 1), wz, pitch, ptYaw, roll, scaleVal));
          objCount++;
        });
      } else {
        jsonObjects.push({ name: objClass, pos: [+wx.toFixed(6), +wy.toFixed(6), +wz.toFixed(6)], ypr: [+pitch.toFixed(4), +ptYaw.toFixed(4), +roll.toFixed(4)], scale: +scaleVal.toFixed(4), enableCEPersistency: cePersist, customString: "" });
        objCount++;
        extras.forEach((ex, ei) => {
          jsonObjects.push({ name: ex, pos: [+wx.toFixed(6), +(wy + stackY * (ei + 1)).toFixed(6), +wz.toFixed(6)], ypr: [+pitch.toFixed(4), +ptYaw.toFixed(4), +roll.toFixed(4)], scale: +scaleVal.toFixed(4), enableCEPersistency: cePersist, customString: "" });
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

  // ── COMPLETED BUILD DOWNLOAD ──────────────────────────────────────────────
  const downloadBuild = (build: CompletedBuild, mode: "frame" | "fill", format: "initc" | "json") => {
    // 1. Get shape points
    const raw = getShapePoints(build.shape, build.params);

    // 2. Apply fill if needed (per-Y-level fill — mirrors the main fill logic)
    let pts = raw;
    if (mode === "fill" && raw.length) {
      const density = build.fillDensity ?? 2;
      const extras: Point3D[] = [];
      const yMin = raw.reduce((m, p) => Math.min(m, p.y), Infinity);
      const yMax = raw.reduce((m, p) => Math.max(m, p.y), -Infinity);
      const binSize = Math.max(0.05, (yMax - yMin) * 0.025);
      const yGroups = new Map<number, Point3D[]>();
      raw.forEach(p => {
        const key = Math.round(p.y / binSize) * binSize;
        if (!yGroups.has(key)) yGroups.set(key, []);
        yGroups.get(key)!.push(p);
      });
      yGroups.forEach(group => {
        const cx2 = group.reduce((s, p) => s + p.x, 0) / group.length;
        const cz2 = group.reduce((s, p) => s + p.z, 0) / group.length;
        const avgY = group[0].y;
        group.forEach(p => {
          for (let d = 1; d <= density; d++) {
            const t = d / (density + 1);
            extras.push({ x: p.x * (1 - t) + cx2 * t, y: avgY, z: p.z * (1 - t) + cz2 * t });
          }
        });
      });
      pts = [...raw, ...extras];
    }

    // 3. Select objects
    const obj = mode === "frame" ? build.frameObj : build.fillObj;
    const extrasStr = mode === "frame" ? (build.extraFrame || "") : (build.extraFill || "");
    const extraList = extrasStr.split(",").map(s => s.trim()).filter(Boolean);

    // 4. Compute centroid for auto-orient
    const cx3 = pts.reduce((s, p) => s + p.x, 0) / Math.max(1, pts.length);
    const cz3 = pts.reduce((s, p) => s + p.z, 0) / Math.max(1, pts.length);

    // 5. Build output
    let code = "";
    if (format === "initc") {
      const lines: string[] = [
        HELPER_FUNC,
        `// ═══ ${build.name} — ${mode.toUpperCase()} MODE ═══`,
        `// ${build.tagline}`,
        `// Object: ${obj}${extraList.length ? " + " + extraList.join(", ") : ""}`,
        `// Location: ${build.posX} ${build.posY} ${build.posZ} (${build.posX < 8000 ? "NWAF" : "Krasnoe"})`,
        `// Objects: ${pts.length * (1 + extraList.length)}`,
        `// ${build.objectNotes}`,
        "",
      ];
      pts.forEach(pt => {
        const wx = pt.x + build.posX;
        const wy = pt.y + build.posY;
        const wz = pt.z + build.posZ;
        const ptYaw = build.autoOrient ? Math.atan2(pt.x - cx3, pt.z - cz3) * 180 / Math.PI : 0;
        lines.push(formatInitC(obj, wx, wy, wz, 0, ptYaw, 0, 1.0));
        extraList.forEach((ex, ei) => {
          lines.push(formatInitC(ex, wx, wy + ei + 1, wz, 0, ptYaw, 0, 1.0));
        });
      });
      code = lines.join("\n");
    } else {
      const objs: object[] = [];
      pts.forEach(pt => {
        const wx = pt.x + build.posX;
        const wy = pt.y + build.posY;
        const wz = pt.z + build.posZ;
        const ptYaw = build.autoOrient ? Math.atan2(pt.x - cx3, pt.z - cz3) * 180 / Math.PI : 0;
        objs.push({ name: obj, pos: [+wx.toFixed(3), +wy.toFixed(3), +wz.toFixed(3)], ypr: [0, +ptYaw.toFixed(4), 0], scale: 1.0, enableCEPersistency: 0, customString: "" });
        extraList.forEach((ex, ei) => {
          objs.push({ name: ex, pos: [+wx.toFixed(3), +(wy + ei + 1).toFixed(3), +wz.toFixed(3)], ypr: [0, +ptYaw.toFixed(4), 0], scale: 1.0, enableCEPersistency: 0, customString: "" });
        });
      });
      code = JSON.stringify({ Objects: objs }, null, 2);
    }

    const ext = format === "initc" ? "c" : "json";
    const filename = `${build.id}_${mode}`;
    downloadCode(code, ext, filename);
    showToast(`✓ Downloaded ${build.name} [${mode}] — ${pts.length * (1 + extraList.length)} objects`);
  };

  const currentCode = mode === "architect" ? output : textOutput;
  const currentExt = (mode === "architect" ? format : textFormat) === "initc" ? "c" : "json";
  const currentParamDefs: ParamDef[] = SHAPE_DEFS[shapeType]?.params || [];
  const PRESET_CATEGORIES = ["All", ...Array.from(new Set(QUICK_PRESETS.map(p => p.category)))];
  const filteredPresets = QUICK_PRESETS.filter(p => {
    const catOk = presetCategory === "All" || p.category === presetCategory;
    const searchOk = !presetFilter || p.label.toLowerCase().includes(presetFilter.toLowerCase()) || p.shape.includes(presetFilter.toLowerCase());
    return catOk && searchOk;
  });

  return (
    <div className="flex flex-col h-screen bg-[#0a0804] text-[#c8b99a] font-mono overflow-hidden select-none">
      {/* ── HEADER ── */}
      <header className="flex items-center gap-2 px-3 py-2 border-b border-[#2e2518] bg-[#12100a] shrink-0">
        <button onClick={() => setSidebarOpen(v => !v)}
          className="flex flex-col gap-1 p-1.5 rounded-sm border border-[#2e2518] hover:border-[#6a5a3a] transition-colors"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}>
          <span className="block w-4 h-0.5 bg-[#6a5a3a]" />
          <span className="block w-4 h-0.5 bg-[#6a5a3a]" />
          <span className="block w-4 h-0.5 bg-[#6a5a3a]" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#d4a017] font-black text-base tracking-widest">DANK</span>
            <span className="text-[#c0392b] font-black text-base tracking-widest">DAYZ</span>
            <span className="text-[10px] border border-[#8b1a1a] text-[#c0392b] px-1 py-0.5 rounded-sm hidden sm:inline">ULTIMATE v3</span>
          </div>
          <div className="text-[#9a8858] text-[9px] tracking-widest hidden sm:block">REAL-TIME 3D · SHAPES · TUNNELS · MECHS · TEXT · CONSOLE SAFE</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex gap-0.5 border border-[#2e2518] rounded-sm p-0.5">
            <button onClick={() => setMode("architect")}
              className={`px-2 py-1.5 text-[10px] rounded-sm font-bold tracking-wider transition-all ${mode === "architect" ? "bg-[#d4a017] text-[#0a0804]" : "text-[#b09a6a] hover:text-[#c8b99a]"}`}>
              🏗 BUILD
            </button>
            <button onClick={() => setMode("text")}
              className={`px-2 py-1.5 text-[10px] rounded-sm font-bold tracking-wider transition-all ${mode === "text" ? "bg-[#d4a017] text-[#0a0804]" : "text-[#b09a6a] hover:text-[#c8b99a]"}`}>
              ✏ TEXT
            </button>
            <button onClick={() => setMode("builds")}
              className={`px-2 py-1.5 text-[10px] rounded-sm font-bold tracking-wider transition-all ${mode === "builds" ? "bg-[#27ae60] text-[#0a0804]" : "text-[#7ec060] hover:text-[#a0d890]"}`}>
              🏆 BUILDS
            </button>
            <button onClick={() => setMode("weapons")}
              className={`px-2 py-1.5 text-[10px] rounded-sm font-bold tracking-wider transition-all ${mode === "weapons" ? "bg-[#e67e22] text-[#0a0804]" : "text-[#e67e22] opacity-70 hover:opacity-100"}`}>
              🔫 WEAPONS
            </button>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#27ae60] animate-pulse shrink-0" title="Live preview active" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── WEAPON BUILDER MODE (full-panel takeover) ── */}
        {mode === "weapons" && <WeaponBuilder />}

        {/* ── SIDEBAR ── */}
        {/* Mobile backdrop */}
        {mode !== "weapons" && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`${mode === "weapons" ? "hidden" : ""} ${sidebarOpen ? "w-72" : "w-0"} shrink-0 bg-[#0e0c08] border-r border-[#2e2518] overflow-y-auto flex flex-col transition-all duration-200 z-30 md:relative md:z-auto ${sidebarOpen ? "absolute inset-y-0 left-0 md:relative" : "overflow-hidden"}`}>
          {mode === "architect" ? (
            <ArchitectSidebar
              shapeType={shapeType} params={params} paramDefs={currentParamDefs}
              objClass={objClass} posX={posX} posY={posY} posZ={posZ}
              yaw={yaw} pitch={pitch} roll={roll}
              scaleVal={scaleVal} fillMode={fillMode} fillDensity={fillDensity}
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
              setScaleVal={setScaleVal} setFillMode={setFillMode} setFillDensity={setFillDensity}
              setFormat={setFormat} setCePersist={setCePersist} setIncludeHelper={setIncludeHelper}
              setExtraObjs={setExtraObjs} setStackY={setStackY}
              setParam={setParam} setParams={setParams} setAutoRotate={setAutoRotate}
              setAutoOrient={setAutoOrient} setOrientInward={setOrientInward}
              setPresetFilter={setPresetFilter} setPresetCategory={setPresetCategory}
              setJitter={setJitter}
              onGenerate={generate}
              onClear={() => setOutput("")}
              applyPreset={applyPreset}
              onSurpriseMe={surpriseMe}
              buildNotes={buildNotes} setBuildNotes={setBuildNotes}
              captureCurrentState={captureCurrentState} restoreState={restoreState}
            />
          ) : mode === "builds" ? (
            <BuildsSidebar
              builds={COMPLETED_BUILDS}
              selectedId={selectedBuildId}
              filter={buildFilter}
              category={buildCategory}
              onSelect={setSelectedBuildId}
              onFilterChange={setBuildFilter}
              onCategoryChange={setBuildCategory}
              onDownload={downloadBuild}
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
        <div className={`${mode === "weapons" ? "hidden" : ""} flex-1 flex flex-col overflow-hidden`}>
          {/* Info bar */}
          <div className="flex items-center gap-3 px-3 py-1 bg-[#0e0c08] border-b border-[#2e2518] text-[11px] shrink-0">
            <span className="text-[#9a8858]">Shape</span>
            <span className="text-[#d4a017] font-bold truncate max-w-[180px]">
              {mode === "architect" ? (SHAPE_DEFS[shapeType]?.label || shapeType)
               : mode === "builds" ? (COMPLETED_BUILDS.find(b => b.id === selectedBuildId)?.name || "—")
               : `"${textInput}"`}
            </span>
            <span className="text-[#9a8858]">Objects</span>
            <span className={`font-bold ${displayPoints.length > 800 ? "text-[#e07a20]" : "text-[#d4a017]"}`}>{displayPoints.length}</span>
            {displayPoints.length > 800 && <span className="text-[#e07a20] text-[10px]">⚠ large!</span>}
            {dims && <span className="text-[#8a7840] text-[10px]">{dims.w}×{dims.d}×{dims.h}m</span>}
            {mode === "builds" && <span className="text-[#27ae60] text-[10px] font-bold">● LIVE PREVIEW</span>}
            <span className="ml-auto text-[#8a7840]">Drag=rotate · Scroll=zoom</span>
          </div>

          {/* 3D Canvas */}
          <div className="relative bg-[#060402]" style={{ flex: "0 0 55%", minHeight: 200 }}>
            <canvas ref={canvasRef} className="block" />
            {/* Zoom controls */}
            <div className="absolute bottom-2 right-2 flex flex-col gap-1">
              <button onClick={() => zoomStep(1.25)}
                className="w-8 h-8 flex items-center justify-center bg-[#1a1408] border border-[#3a2e18] text-[#d4a017] text-xl font-black rounded-sm hover:bg-[#2e2518] hover:border-[#d4a017] transition-all leading-none select-none"
                title="Zoom in (also: scroll up)">+</button>
              <button onClick={() => zoomStep(0.8)}
                className="w-8 h-8 flex items-center justify-center bg-[#1a1408] border border-[#3a2e18] text-[#d4a017] text-xl font-black rounded-sm hover:bg-[#2e2518] hover:border-[#d4a017] transition-all leading-none select-none"
                title="Zoom out (also: scroll down)">−</button>
              <button onClick={resetZoom}
                className="w-8 h-8 flex items-center justify-center bg-[#1a1408] border border-[#3a2e18] text-[#b09a6a] text-[11px] font-bold rounded-sm hover:bg-[#2e2518] hover:text-[#c8b99a] hover:border-[#6a5a3a] transition-all select-none"
                title="Reset zoom & rotation">⟲</button>
            </div>
          </div>

          {/* Output */}
          {mode === "builds" ? (
            <div className="flex flex-col border-t border-[#2e2518] bg-[#0e0c08] flex-1 min-h-0">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2e2518] shrink-0">
                <span className="text-[#27ae60] text-[11px] font-bold tracking-wider">🏆 COMPLETED BUILDS</span>
                <span className="text-[#9a8858] text-[10px]">{COMPLETED_BUILDS.length} ready-to-download builds</span>
              </div>
              {(() => {
                const b = COMPLETED_BUILDS.find(x => x.id === selectedBuildId);
                return b ? (
                  <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
                    <div className="text-[#d4a017] text-lg font-black">{b.icon} {b.name}</div>
                    <div className="text-[#c8b99a] text-[11px] leading-relaxed">{b.tagline}</div>
                    <div className="border border-[#2e2518] rounded-sm p-3 flex flex-col gap-2">
                      <div className="text-[#9a8858] text-[10px] uppercase tracking-wider mb-1">Objects Used</div>
                      <div className="text-[11px]">
                        <span className="text-[#27ae60] font-bold">FRAME: </span>
                        <span className="text-[#c8b99a]">{b.frameObj}</span>
                        {b.extraFrame && <span className="text-[#9a8858]"> + {b.extraFrame}</span>}
                      </div>
                      <div className="text-[11px]">
                        <span className="text-[#d4a017] font-bold">FILL: </span>
                        <span className="text-[#c8b99a]">{b.fillObj}</span>
                        {b.extraFill && <span className="text-[#9a8858]"> + {b.extraFill}</span>}
                      </div>
                      <div className="text-[#9a8858] text-[10px] leading-relaxed mt-1">{b.objectNotes}</div>
                    </div>
                    {b.frameCount !== undefined && (
                      <div className="flex items-center gap-2 p-2 rounded-sm bg-[#0f1f0f] border border-[#27ae60]">
                        <span className="text-[#27ae60] text-[18px] font-black">{b.frameCount}</span>
                        <div>
                          <div className="text-[#27ae60] text-[10px] font-bold">OBJECTS TOTAL</div>
                          <div className="text-[#5a8a5a] text-[9px]">⚡ Server-friendly · stays loaded long-term</div>
                        </div>
                      </div>
                    )}
                    <div className="border border-[#2e2518] rounded-sm p-3">
                      <div className="text-[#9a8858] text-[10px] uppercase tracking-wider mb-2">Location</div>
                      <div className="text-[#c8b99a] text-[11px] font-mono">
                        <span className="text-[#d4a017] font-bold">{b.posX < 8000 ? "NWAF" : b.category === "⚡ Lightweight" ? "Krasnoe Airfield" : "Krasnoe"}</span>
                        {" "}X={b.posX} Y={b.posY} Z={b.posZ}
                      </div>
                      {b.category === "⚡ Lightweight" && (
                        <div className="mt-1 text-[9px] text-[#6a5a3a]">Pre-positioned at Krasnoe Airfield flat apron — ready to paste into init.c</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button onClick={() => downloadBuild(b, "frame", "initc")}
                        className="py-2 text-[11px] font-bold bg-[#1a2e1a] border border-[#27ae60] text-[#27ae60] rounded-sm hover:bg-[#27ae60] hover:text-[#0a0804] transition-all">
                        ⬇ FRAME .c
                      </button>
                      <button onClick={() => downloadBuild(b, "fill", "initc")}
                        className="py-2 text-[11px] font-bold bg-[#2e2010] border border-[#d4a017] text-[#d4a017] rounded-sm hover:bg-[#d4a017] hover:text-[#0a0804] transition-all">
                        ⬇ FILL .c
                      </button>
                      <button onClick={() => downloadBuild(b, "frame", "json")}
                        className="py-2 text-[10px] font-bold bg-[#1a1a2e] border border-[#6a7abf] text-[#6a7abf] rounded-sm hover:bg-[#6a7abf] hover:text-[#0a0804] transition-all">
                        ⬇ FRAME .json
                      </button>
                      <button onClick={() => downloadBuild(b, "fill", "json")}
                        className="py-2 text-[10px] font-bold bg-[#1a1a2e] border border-[#6a7abf] text-[#6a7abf] rounded-sm hover:bg-[#6a7abf] hover:text-[#0a0804] transition-all">
                        ⬇ FILL .json
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#9a8858] text-[11px]">
                    Select a build on the left to preview and download
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col border-t border-[#2e2518] bg-[#0e0c08] flex-1 min-h-0">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2e2518] shrink-0">
                <div className="text-[#d4a017] text-[11px] font-bold tracking-wider">
                  {format === "initc" ? "▶ INIT.C" : "▶ JSON SPAWNER"}
                  {currentCode && <span className="ml-2 text-[#b09a6a] font-normal">({currentCode.split("\n").length} lines)</span>}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => copyCode(currentCode)}
                    className="px-3 py-1 text-[11px] border border-[#2e2518] text-[#b09a6a] hover:border-[#d4a017] hover:text-[#d4a017] rounded-sm transition-all">
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
          )}
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
  return <div className="text-[#b09a6a] text-[10px] mb-0.5">{children}</div>;
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

// ─── SAVE / LOAD PANEL ────────────────────────────────────────────────────────

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
          className="flex-1 bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[10px] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4a017]" />
        <button onClick={save} disabled={!saveName.trim()}
          className="px-2 py-1 text-[10px] font-bold rounded-sm border border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017] hover:text-[#0a0804] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          Save
        </button>
      </div>
      {saveErr && <div className="text-[#c0392b] text-[8px] mb-1.5 leading-tight">{saveErr}</div>}
      {saves.length === 0 ? (
        <div className="text-[#5a4820] text-[9px] py-1.5 text-center">No saves yet — name your build above and hit Save</div>
      ) : (
        <div className="flex flex-col gap-1">
          {saves.map(slot => (
            <div key={slot.id} className="flex items-center gap-1 border border-[#2e2518] rounded-sm px-2 py-1 bg-[#060402]">
              <div className="flex-1 min-w-0">
                <div className="text-[#c8b99a] text-[10px] font-bold truncate">{slot.name}</div>
                <div className="text-[#5a4820] text-[8px]">{new Date(slot.timestamp).toLocaleDateString()} · {slot.data.shapeType}</div>
              </div>
              <button onClick={() => onLoad(slot.data)}
                className="px-1.5 py-0.5 text-[8px] text-[#d4a017] border border-[#d4a01733] hover:border-[#d4a017] rounded-sm transition-all shrink-0">
                Load
              </button>
              <button onClick={() => persist(saves.filter(s => s.id !== slot.id))}
                className="px-1.5 py-0.5 text-[8px] text-[#c0392b] border border-[#c0392b33] hover:border-[#c0392b] rounded-sm transition-all shrink-0">
                ✕
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
      <div className="text-[8px] text-[#9a8858] mb-0.5">{label}</div>
      <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph}
        className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[10px] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4a017]" />
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
          <div className="text-[8px] text-[#9a8858] mb-0.5">Points (2–20)</div>
          <input type="number" min={2} max={20} value={count} onChange={e => setCount(+e.target.value)}
            className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[10px] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4a017]" />
        </div>
        {numInput("Fixed Y (height)", fixedY, setFixedY, "383")}
      </div>
      {dist !== null && (
        <div className={`text-[9px] mb-1.5 ${dist === 0 ? 'text-[#c0392b]' : 'text-[#d4a017]'}`}>
          {dist === 0
            ? '⚠ Points A and B are the same — all objects will stack!'
            : <><strong>Distance: {dist.toFixed(2)}m</strong>{pts.length > 1 && <span className="text-[#8a7840]"> · {(dist / (pts.length - 1)).toFixed(2)}m gap</span>}</>
          }
        </div>
      )}
      {pts.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-1">
            <div className="text-[8px] text-[#9a8858]">{pts.length} coordinates:</div>
            <button onClick={copy}
              className={`text-[8px] px-1.5 py-0.5 rounded-sm border transition-all ${copied ? "border-[#27ae60] text-[#27ae60]" : "border-[#d4a01733] text-[#d4a017] hover:border-[#d4a017]"}`}>
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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setCollapsed(prev => ({ ...prev, [k]: !prev[k] }));
  const sec = (k: string, label: string, children: React.ReactNode) => (
    <div>
      <button onClick={() => toggle(k)}
        className="w-full flex items-center justify-between text-[#d4a017] text-[9px] tracking-widest uppercase border-b border-[#2e2518] pb-1 mb-2 mt-3 px-3 bg-transparent hover:text-[#e8b82a] transition-colors">
        <span>{label}</span>
        <span className="text-[#9a8858]">{collapsed[k] ? "▶" : "▼"}</span>
      </button>
      {!collapsed[k] && children}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Quick Presets */}
      {sec("presets", "⚡ Quick Presets", (
        <div className="px-3">
          <input type="text" placeholder="Search presets..." value={p.presetFilter}
            onChange={e => p.setPresetFilter(e.target.value)}
            className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
          />
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 mb-2">
            {(p.presetCategories || []).map((cat: string) => (
              <button key={cat} onClick={() => p.setPresetCategory(cat)}
                className={`text-[9px] px-1.5 py-0.5 rounded-sm border transition-all ${p.presetCategory === cat ? "border-[#d4a017] text-[#d4a017] bg-[#1a1408]" : "border-[#2e2518] text-[#b09a6a] hover:text-[#c8b99a]"}`}>
                {cat === "All" ? "All" : cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-52 overflow-y-auto pr-0.5">
            {p.filteredPresets.map((preset: any) => (
              <button key={preset.label} onClick={() => p.applyPreset(preset)}
                className={`text-left text-[10px] px-2 py-1.5 rounded-sm border transition-all truncate ${p.shapeType === preset.shape ? "border-[#d4a017] text-[#d4a017] bg-[#1a1408]" : "border-[#2e2518] text-[#c0aa70] hover:border-[#6a5a3a] hover:text-[#c8b99a]"}`}>
                {preset.label}
              </button>
            ))}
            {p.filteredPresets.length === 0 && (
              <div className="col-span-2 text-center text-[10px] text-[#8a7840] py-3">No presets match filter</div>
            )}
          </div>
          <button onClick={p.onSurpriseMe}
            className="mt-2 w-full py-1.5 text-[10px] font-bold rounded-sm border border-[#3a2e18] text-[#d4a017] bg-[#1a1408] hover:bg-[#221a08] hover:border-[#d4a017] transition-all">
            🎲 Surprise Me — Random Preset
          </button>
        </div>
      ))}

      {/* ⚔ Arena Maker */}
      {sec("arena", "⚔ Arena Maker", (
        <div className="px-3">
          {/* Big roll button */}
          <button onClick={p.onRollArena}
            className="w-full py-2.5 mb-2.5 text-[11px] font-black tracking-wider rounded-sm border border-[#d4a017] text-[#0a0804] bg-[#d4a017] hover:bg-[#e8b82a] hover:border-[#e8b82a] transition-all shadow-lg">
            🎲 ROLL RANDOM ARENA
          </button>
          <div className="text-[9px] text-[#8a7840] mb-2 text-center">Every click generates a fully different layout with randomized parameters</div>
          {/* 6 arena type tiles */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {[
              { key: "arena_colosseum", icon: "🏛", label: "Colosseum", desc: "Oval, tiered seating" },
              { key: "arena_fort",      icon: "🏰", label: "Fortress",  desc: "Square, bastions" },
              { key: "arena_maze",      icon: "🌀", label: "Maze",      desc: "Labyrinth corridors" },
              { key: "arena_siege",     icon: "⚔",  label: "Siege",     desc: "Tower vs wall" },
              { key: "arena_compound",  icon: "🪖", label: "Compound",  desc: "Military grid" },
              { key: "pvp_arena",       icon: "🔵", label: "Ring",      desc: "Polygon arena" },
            ].map(({ key, icon, label, desc }) => (
              <button key={key} onClick={() => p.onShapeChange(key)}
                className={`text-left px-2 py-1.5 rounded-sm border transition-all ${p.shapeType === key ? "border-[#d4a017] bg-[#1a1408]" : "border-[#2e2518] hover:border-[#6a5a3a] bg-[#060402]"}`}>
                <div className={`text-[11px] font-bold ${p.shapeType === key ? "text-[#d4a017]" : "text-[#c8b99a]"}`}>{icon} {label}</div>
                <div className="text-[9px] text-[#8a7840]">{desc}</div>
              </button>
            ))}
          </div>
          {/* Randomize current arena type */}
          <button onClick={p.onRollSameArena}
            className="w-full py-1 text-[10px] font-bold rounded-sm border border-[#3a2e18] text-[#b09a6a] hover:border-[#d4a017] hover:text-[#d4a017] transition-all">
            🔀 Randomize This Type Again
          </button>
        </div>
      ))}

      {/* Format */}
      {sec("fmt", "📄 Output Format", (
        <div className="flex gap-1 px-3">
          {(["initc", "json"] as OutputFormat[]).map(f => (
            <button key={f} onClick={() => p.setFormat(f)}
              className={`flex-1 py-1.5 text-[11px] rounded-sm border transition-all font-bold ${p.format === f ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017]" : "border-[#2e2518] text-[#b09a6a] hover:border-[#6a5a3a] hover:text-[#c8b99a]"}`}>
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
                className={`flex-1 py-1.5 text-[10px] rounded-sm border font-bold transition-all ${p.fillMode === f ? "bg-[#1e4a2a] text-[#5dcc80] border-[#2e6a3a]" : "border-[#2e2518] text-[#b09a6a] hover:border-[#6a5a3a]"}`}>
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
              <button
                onClick={() => {
                  const defaults: Record<string, number> = {};
                  p.paramDefs.forEach((def: ParamDef) => { defaults[def.id] = def.val; });
                  p.setParams(defaults);
                }}
                className="mt-1 text-[8px] text-[#6a5a3a] hover:text-[#d4a017] transition-colors border border-[#2e2518] hover:border-[#d4a01744] px-2 py-0.5 rounded-sm w-full">
                ↺ Reset to defaults
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Position */}
      {sec("pos", "📍 Base Position", (
        <div className="px-3">
          {/* Famous Locations picker */}
          <Lbl>Famous Chernarus Location</Lbl>
          <select
            className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm mb-2 focus:outline-none focus:border-[#8a6a0f]"
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
                <Inp value={val as number} onChange={v => (setter as any)(parseFloat(v) || 0)} step="10" />
              </div>
            ))}
          </div>
          <div className="mt-1">
            <Slider label={`Position Jitter ±${(p.jitter || 0).toFixed(1)}m`} value={p.jitter || 0} min={0} max={15} step={0.5} onChange={p.setJitter} />
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
          <label className="flex items-center gap-2 text-[10px] text-[#b09a6a] cursor-pointer">
            <input type="checkbox" className="accent-[#d4a017]" checked={p.includeHelper} onChange={e => p.setIncludeHelper(e.target.checked)} />
            Include SpawnObject() helper
          </label>
          <label className="flex items-center gap-2 text-[10px] text-[#b09a6a] cursor-pointer">
            <input type="checkbox" className="accent-[#d4a017]" checked={p.autoRotate} onChange={e => p.setAutoRotate(e.target.checked)} />
            Auto-spin 3D preview
          </label>
          <div className="border-t border-[#2e2518] pt-2 mt-1">
            <div className="text-[9px] text-[#8a6a0f] mb-1 uppercase tracking-wider">🔄 Auto-Orient YPR</div>
            <label className="flex items-center gap-2 text-[10px] text-[#c8b99a] cursor-pointer mb-1">
              <input type="checkbox" className="accent-[#d4a017]" checked={p.autoOrient} onChange={e => p.setAutoOrient(e.target.checked)} />
              <span>Auto-orient objects (faces outward/inward)</span>
            </label>
            {p.autoOrient && (
              <label className="flex items-center gap-2 text-[10px] text-[#b09a6a] cursor-pointer ml-4">
                <input type="checkbox" className="accent-[#d4a017]" checked={p.orientInward} onChange={e => p.setOrientInward(e.target.checked)} />
                Face inward (toward center)
              </label>
            )}
            {p.autoOrient && (
              <div className="text-[9px] text-[#b09a6a] mt-1 ml-0 leading-tight">
                Objects rotate to face outward from the shape centre — perfect for walls, rings, squares &amp; perimeters.
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 💾 Save / Load */}
      {sec("saveload", "💾 Save / Load Builds", (
        <SaveLoadPanel captureState={p.captureCurrentState} onLoad={p.restoreState} />
      ))}

      {/* 📝 Build Notes */}
      {sec("notes", "📝 Build Notes", (
        <div className="px-3">
          <div className="text-[#7a6a2a] text-[8px] mb-1.5 leading-tight">Notes are embedded as comments in your init.c export.</div>
          <textarea
            value={p.buildNotes}
            onChange={e => p.setBuildNotes(e.target.value)}
            placeholder="e.g. North arena, Troitskoe base — added March 2025&#10;Use Land_Castle_Wall_3m_DE for frame objects..."
            rows={4}
            className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[10px] px-2 py-1.5 rounded-sm resize-none focus:outline-none focus:border-[#d4a017] placeholder-[#3a2e18] leading-relaxed"
          />
          {p.buildNotes.trim() && (
            <button onClick={() => p.setBuildNotes("")}
              className="mt-1 text-[8px] text-[#5a4820] hover:text-[#9a8858] transition-colors">
              Clear notes
            </button>
          )}
        </div>
      ))}

      {/* 📐 Spacing Calculator */}
      {sec("spacing", "📐 Object Spacing Calculator", (
        <SpacingCalcPanel />
      ))}

      {/* Stats */}
      <div className="px-3 mx-3 mt-3 rounded-sm border border-[#2e2518] p-2 bg-[#060402] text-[10px]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="text-[#b09a6a]">Objects</div><div className="text-[#d4a017] font-bold">{p.objCount}</div>
          <div className="text-[#b09a6a]">Format</div><div className="text-[#d4a017]">{p.format === "initc" ? "init.c" : "JSON"}</div>
          <div className="text-[#b09a6a]">Mode</div><div className="text-[#d4a017]">{p.fillMode}{p.fillMode === "fill" ? ` d${p.fillDensity}` : ""}</div>
          <div className="text-[#b09a6a]">Scale</div><div className="text-[#d4a017]">{p.scaleVal.toFixed(2)}×</div>
          {p.dims && <><div className="text-[#b09a6a]">W×D×H</div><div className="text-[#d4a017]">{p.dims.w}×{p.dims.d}×{p.dims.h}m</div></>}
          <div className="text-[#b09a6a]">Y/P/R</div><div className="text-[#d4a017]">{p.yaw}°/{p.pitch}°/{p.roll}°</div>
          <div className="text-[#b09a6a]">Orient</div><div className={p.autoOrient ? "text-[#27ae60] font-bold" : "text-[#8a7840]"}>{p.autoOrient ? (p.orientInward ? "↙ inward" : "↗ outward") : "off"}</div>
        </div>
      </div>

      {/* Object count warning */}
      {p.objCount > 1000 && (
        <div className="px-3 mx-3 mt-2">
          <div className="rounded-sm border border-[#c0392b55] bg-[#1a0808] px-2 py-1.5 text-[8px] text-[#c0392b] leading-snug">
            ⚠ <strong>{p.objCount} objects</strong> — DayZ console may struggle above ~1 000.
            {p.fillMode === "fill" ? " Try lowering Fill Density or switching to Frame mode." : " Consider a smaller shape or higher spacing."}
          </div>
        </div>
      )}
      {p.objCount > 500 && p.objCount <= 1000 && (
        <div className="px-3 mx-3 mt-2">
          <div className="rounded-sm border border-[#d4a01744] bg-[#1a1408] px-2 py-1.5 text-[8px] text-[#c8a050] leading-snug">
            ℹ <strong>{p.objCount} objects</strong> — getting large. Test server performance before final use.
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="px-3 mt-3 flex flex-col gap-1.5">
        <button onClick={p.onGenerate}
          className="w-full py-2.5 bg-[#d4a017] text-[#0a0804] font-black text-[12px] tracking-widest rounded-sm hover:bg-[#e8b82a] transition-all shadow-lg">
          ⚙ GENERATE CODE
        </button>
        <button onClick={p.onClear}
          className="w-full py-1.5 bg-[#1e1608] text-[#b09a6a] text-[11px] font-bold rounded-sm hover:bg-[#2e2518] hover:text-[#8a7a5a] transition-all">
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

      <Sec>📦 Object — Quick Picks ⚡</Sec>
      <div className="px-3">
        {/* Airstrip light quick-selects — best for spelling visible from above */}
        <div className="text-[9px] text-[#8a6a0f] mb-1.5 uppercase tracking-wider">✈ Airstrip Lights (best for spelling)</div>
        <div className="grid grid-cols-1 gap-1 mb-3">
          {[
            ["PAPI Light ⭐", "StaticObj_Airfield_Light_PAPI1"],
            ["Centreline Light", "StaticObj_Airfield_Light_Centreline_01"],
            ["Edge Light", "StaticObj_Airfield_Light_Edge_01"],
            ["Threshold Light", "StaticObj_Airfield_Light_Threshold_01"],
            ["Taxiway Light", "StaticObj_Airfield_Light_Taxiway_01"],
            ["Strobe Light", "StaticObj_Airfield_Light_Strobe_01"],
          ].map(([label, val]) => (
            <button key={val} onClick={() => p.setTextObj(val)}
              className={`text-left text-[10px] px-2 py-1.5 rounded-sm border truncate transition-all ${p.textObj === val ? "border-[#d4a017] text-[#d4a017] bg-[#1a1408]" : "border-[#2e2518] text-[#b09a6a] hover:border-[#6a5a3a] hover:text-[#c8b99a]"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="text-[9px] text-[#b09a6a] mb-1.5 uppercase tracking-wider">All objects</div>
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
        <Lbl>Custom Classname (type any valid DayZ class)</Lbl>
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
            className={`flex-1 py-1.5 text-[11px] rounded-sm border font-bold transition-all ${p.textFormat === f ? "bg-[#d4a017] text-[#0a0804] border-[#d4a017]" : "border-[#2e2518] text-[#b09a6a] hover:border-[#6a5a3a]"}`}>
            {f === "initc" ? "init.c" : "JSON"}
          </button>
        ))}
      </div>

      {/* Live stats */}
      <div className="px-3 mx-3 rounded-sm border border-[#2e2518] p-2 bg-[#060402] text-[10px]">
        <div className="flex justify-between mb-1"><span className="text-[#b09a6a]">Objects</span><span className="text-[#d4a017] font-bold">{p.objCount}</span></div>
        <div className="flex justify-between"><span className="text-[#b09a6a]">Scale</span><span className="text-[#d4a017]">{p.textScale.toFixed(2)}×</span></div>
      </div>

      <div className="px-3 mt-3">
        <button onClick={p.onGenerate}
          className="w-full py-2.5 bg-[#d4a017] text-[#0a0804] font-black text-[12px] tracking-widest rounded-sm hover:bg-[#e8b82a] transition-all shadow-lg">
          ⚙ GENERATE TEXT CODE
        </button>
      </div>

      <Sec>Supported Characters</Sec>
      <div className="px-3 text-[10px] text-[#b09a6a] leading-loose">A B C D E F G H I J K L M N O P Q R S T U V W X Y Z<br />0 1 2 3 4 5 6 7 8 9  !  ?  .  ,  (space)</div>
    </div>
  );
}

// ─── BUILDS SIDEBAR ────────────────────────────────────────────────────────────
function BuildsSidebar(p: {
  builds: CompletedBuild[];
  selectedId: string;
  filter: string;
  category: string;
  onSelect: (id: string) => void;
  onFilterChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onDownload: (b: CompletedBuild, mode: "frame" | "fill", fmt: "initc" | "json") => void;
}) {
  const CATS = ["All", ...Array.from(new Set(p.builds.map(b => b.category)))];
  const filtered = p.builds.filter(b => {
    const catOk = p.category === "All" || b.category === p.category;
    const q = p.filter.toLowerCase();
    const textOk = !q || b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q);
    return catOk && textOk;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-[#2e2518] shrink-0">
        <div className="text-[#27ae60] text-[9px] font-bold tracking-widest uppercase mb-2">
          🏆 Completed Builds — {p.builds.length} Builds Ready
        </div>
        <input
          type="text"
          value={p.filter}
          onChange={e => p.onFilterChange(e.target.value)}
          placeholder="Search builds..."
          className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[11px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#27ae60] transition-colors mb-2"
        />
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1">
          {CATS.map(cat => (
            <button key={cat} onClick={() => p.onCategoryChange(cat)}
              className={`px-1.5 py-0.5 text-[9px] rounded-sm font-bold transition-all border ${p.category === cat
                ? "bg-[#27ae60] text-[#0a0804] border-[#27ae60]"
                : "border-[#2e2518] text-[#9a8858] hover:border-[#27ae60] hover:text-[#7ec060]"
              }`}>
              {cat === "All" ? "All" : cat.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Build list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-[#9a8858] text-[11px]">No builds match your search</div>
        )}
        {filtered.map(b => {
          const isSelected = b.id === p.selectedId;
          const loc = b.posX < 8000 ? "NWAF" : "Krasnoe";
          return (
            <div key={b.id}
              onClick={() => p.onSelect(b.id)}
              className={`border-b border-[#1e1c18] cursor-pointer transition-all ${isSelected ? "bg-[#0f1f0f] border-l-2 border-l-[#27ae60]" : "hover:bg-[#0f0d09]"}`}>
              {/* Build title row */}
              <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                <span className="text-base shrink-0">{b.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className={`text-[11px] font-bold truncate ${isSelected ? "text-[#27ae60]" : "text-[#c8b99a]"}`}>{b.name}</div>
                  <div className="text-[9px] text-[#9a8858] truncate">{b.category}</div>
                </div>
                <span className={`text-[8px] px-1 py-0.5 rounded-sm border font-bold shrink-0 ${loc === "NWAF" ? "border-[#1a4a6a] text-[#4a9abf]" : "border-[#4a1a1a] text-[#bf4a4a]"}`}>
                  {loc}
                </span>
              </div>

              {/* Tagline */}
              <div className="px-3 pb-1 text-[9px] text-[#8a7840] leading-relaxed line-clamp-2">{b.tagline}</div>

              {/* Object count badge */}
              {b.frameCount !== undefined && (
                <div className="px-3 pb-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold bg-[#1a2e1a] border border-[#27ae60] text-[#27ae60]">
                    ⚡ {b.frameCount} objects
                  </span>
                  <span className="text-[#6a5a3a] text-[8px]">server-friendly</span>
                </div>
              )}

              {/* Download buttons */}
              <div className="px-3 pb-2 grid grid-cols-2 gap-1">
                <button
                  onClick={e => { e.stopPropagation(); p.onDownload(b, "frame", "initc"); }}
                  className="py-1.5 text-[9px] font-bold border border-[#27ae60] text-[#27ae60] rounded-sm hover:bg-[#27ae60] hover:text-[#0a0804] transition-all">
                  ⬇ FRAME .c
                </button>
                <button
                  onClick={e => { e.stopPropagation(); p.onDownload(b, "fill", "initc"); }}
                  className="py-1.5 text-[9px] font-bold border border-[#d4a017] text-[#d4a017] rounded-sm hover:bg-[#d4a017] hover:text-[#0a0804] transition-all">
                  ⬇ FILL .c
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#2e2518] text-[9px] text-[#9a8858] shrink-0">
        All builds pre-positioned at NWAF or Krasnoe · Console safe
      </div>
    </div>
  );
}
