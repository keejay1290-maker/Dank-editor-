import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { WebGLErrorBoundary, isWebGLAvailable } from "@/WebGLErrorBoundary";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Pt { x: number; z: number; }
interface TileXfm { x: number; y: number; z: number; yr: number; }

// ─── Segment math ─────────────────────────────────────────────────────────────
function segDir(p1: Pt, p2: Pt) {
  const dx = p2.x - p1.x, dz = p2.z - p1.z;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.001) return { fx: 0, fz: 1, rx: 1, rz: 0, len: 0, yaw: 0 };
  const fx = dx / len, fz = dz / len;
  const yaw = Math.atan2(fx, fz) * 180 / Math.PI;
  return { fx, fz, rx: fz, rz: -fx, len, yaw };
}

// ─── Geometry builders ────────────────────────────────────────────────────────
export function buildFloorTiles(waypoints: Pt[], trackWidth: number): TileXfm[] {
  const out: TileXfm[] = [];
  const TILE_ALONG = 3, TILE_ACROSS = 4;
  const nAcross = Math.ceil(trackWidth / TILE_ACROSS);
  const halfW = (nAcross * TILE_ACROSS) / 2;
  const n = waypoints.length;
  for (let i = 0; i < n; i++) {
    const p1 = waypoints[i], p2 = waypoints[(i + 1) % n];
    const { fx, fz, rx, rz, len, yaw } = segDir(p1, p2);
    if (len < 0.1) continue;
    // Three.js: rotY=θ rotates local+Z to world (sin θ, 0, cos θ).
    // DayZ yaw=0→North(+Z), yaw=90→East(+X) = atan2(fx,fz) in degrees.
    // So rotY = +yaw*(π/180) aligns local Z with the segment's forward direction.
    const yr = yaw * Math.PI / 180;
    const nAlong = Math.ceil(len / TILE_ALONG);
    for (let a = 0; a < nAlong; a++) {
      const t = a * TILE_ALONG + TILE_ALONG / 2;
      const cx = p1.x + t * fx, cz = p1.z + t * fz;
      for (let ac = 0; ac < nAcross; ac++) {
        const k = -halfW + TILE_ACROSS / 2 + ac * TILE_ACROSS;
        out.push({ x: cx + k * rx, y: 0.15, z: cz + k * rz, yr });
      }
    }
  }
  return out;
}

export function buildBarriers(waypoints: Pt[], trackWidth: number, barrierLen: number): TileXfm[] {
  const out: TileXfm[] = [];
  const nAcross = Math.ceil(trackWidth / 4);
  const halfW = (nAcross * 4) / 2;
  const edge = halfW + 0.35;
  const n = waypoints.length;
  for (let i = 0; i < n; i++) {
    const p1 = waypoints[i], p2 = waypoints[(i + 1) % n];
    const { fx, fz, rx, rz, len, yaw } = segDir(p1, p2);
    if (len < 0.1) continue;
    const yr = yaw * Math.PI / 180;
    const nb = Math.ceil(len / barrierLen);
    for (let b = 0; b < nb; b++) {
      const t = b * barrierLen + barrierLen / 2;
      if (t > len + barrierLen * 0.5) break;
      const cx = p1.x + t * fx, cz = p1.z + t * fz;
      out.push({ x: cx + edge * rx, y: 0.55, z: cz + edge * rz, yr });
      out.push({ x: cx - edge * rx, y: 0.55, z: cz - edge * rz, yr });
    }
  }
  return out;
}

export function buildCenterDashes(waypoints: Pt[]): TileXfm[] {
  const out: TileXfm[] = [];
  const DASH_LEN = 2, DASH_STEP = 6;
  const n = waypoints.length;
  for (let i = 0; i < n; i++) {
    const p1 = waypoints[i], p2 = waypoints[(i + 1) % n];
    const { fx, fz, len, yaw } = segDir(p1, p2);
    if (len < 0.1) continue;
    const yr = yaw * Math.PI / 180;
    const nd = Math.floor(len / DASH_STEP);
    for (let d = 0; d < nd; d++) {
      const t = d * DASH_STEP + DASH_LEN / 2;
      out.push({ x: p1.x + t * fx, y: 0.32, z: p1.z + t * fz, yr });
    }
  }
  return out;
}

// ─── InstancedMesh helper ─────────────────────────────────────────────────────
const _mtx = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _rot = new THREE.Euler();
const _quat = new THREE.Quaternion();
const _scl = new THREE.Vector3(1, 1, 1);

function applyXfms(mesh: THREE.InstancedMesh, xfms: TileXfm[]) {
  xfms.forEach((t, i) => {
    _pos.set(t.x, t.y, t.z);
    _rot.set(0, t.yr, 0, "XYZ");
    _quat.setFromEuler(_rot);
    _mtx.compose(_pos, _quat, _scl);
    mesh.setMatrixAt(i, _mtx);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

// ─── Floor tiles — flat concrete panels ──────────────────────────────────────
function FloorTiles({ xfms }: { xfms: TileXfm[] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const edgeRef = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => { if (ref.current) applyXfms(ref.current, xfms); }, [xfms]);
  useEffect(() => { if (edgeRef.current) applyXfms(edgeRef.current, xfms); }, [xfms]);
  if (!xfms.length) return null;
  return (
    <>
      {/* Slightly larger dark slab = tile joint shadow */}
      <instancedMesh ref={edgeRef} key={`fe${xfms.length}`} args={[undefined, undefined, xfms.length]} frustumCulled={false}>
        <boxGeometry args={[4.06, 0.32, 3.06]} />
        <meshStandardMaterial color="#444444" roughness={1} metalness={0} />
      </instancedMesh>
      {/* Main concrete surface */}
      <instancedMesh ref={ref} key={`fl${xfms.length}`} args={[undefined, undefined, xfms.length]} frustumCulled={false}>
        <boxGeometry args={[3.94, 0.30, 2.94]} />
        <meshStandardMaterial color="#828282" roughness={0.88} metalness={0.04} />
      </instancedMesh>
    </>
  );
}

// ─── Jersey barriers ──────────────────────────────────────────────────────────
// Approximated with three stacked boxes: base (wide), body (mid), top (narrow)
function Barriers({ xfms }: { xfms: TileXfm[] }) {
  const baseRef  = useRef<THREE.InstancedMesh>(null!);
  const bodyRef  = useRef<THREE.InstancedMesh>(null!);
  const topRef   = useRef<THREE.InstancedMesh>(null!);
  const stripeRef = useRef<THREE.InstancedMesh>(null!);

  // Base sits at y=0.12, Body at y=0.52, Top at y=0.90
  const baseXfms = useMemo(() => xfms.map(t => ({ ...t, y: 0.12 })), [xfms]);
  const bodyXfms = useMemo(() => xfms.map(t => ({ ...t, y: 0.52 })), [xfms]);
  const topXfms  = useMemo(() => xfms.map(t => ({ ...t, y: 0.90 })), [xfms]);
  const stripeXfms = useMemo(() => xfms.map(t => ({ ...t, y: 1.10 })), [xfms]);

  useEffect(() => { if (baseRef.current)   applyXfms(baseRef.current,   baseXfms);   }, [baseXfms]);
  useEffect(() => { if (bodyRef.current)   applyXfms(bodyRef.current,   bodyXfms);   }, [bodyXfms]);
  useEffect(() => { if (topRef.current)    applyXfms(topRef.current,    topXfms);    }, [topXfms]);
  useEffect(() => { if (stripeRef.current) applyXfms(stripeRef.current, stripeXfms); }, [stripeXfms]);

  if (!xfms.length) return null;

  const mat = <meshStandardMaterial color="#cac3bb" roughness={0.84} metalness={0.02} />;

  return (
    <>
      {/* Base: 0.70m wide × 0.24m tall */}
      <instancedMesh ref={baseRef}  key={`bb${xfms.length}`} args={[undefined, undefined, xfms.length]} frustumCulled={false}>
        <boxGeometry args={[0.70, 0.24, 6]} />{mat}
      </instancedMesh>
      {/* Body: 0.50m wide × 0.56m tall */}
      <instancedMesh ref={bodyRef}  key={`bm${xfms.length}`} args={[undefined, undefined, xfms.length]} frustumCulled={false}>
        <boxGeometry args={[0.50, 0.56, 6]} />{mat}
      </instancedMesh>
      {/* Top: 0.30m wide × 0.40m tall */}
      <instancedMesh ref={topRef}   key={`bt${xfms.length}`} args={[undefined, undefined, xfms.length]} frustumCulled={false}>
        <boxGeometry args={[0.30, 0.40, 6]} />{mat}
      </instancedMesh>
      {/* Red safety stripe on top */}
      <instancedMesh ref={stripeRef} key={`bs${xfms.length}`} args={[undefined, undefined, xfms.length]} frustumCulled={false}>
        <boxGeometry args={[0.32, 0.06, 6]} />
        <meshStandardMaterial color="#c0392b" roughness={0.65} metalness={0.05} />
      </instancedMesh>
    </>
  );
}

// ─── Center dashes ────────────────────────────────────────────────────────────
function CenterLine({ xfms }: { xfms: TileXfm[] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => { if (ref.current) applyXfms(ref.current, xfms); }, [xfms]);
  if (!xfms.length) return null;
  return (
    <instancedMesh ref={ref} key={`cl${xfms.length}`} args={[undefined, undefined, xfms.length]} frustumCulled={false}>
      <boxGeometry args={[0.18, 0.02, 2]} />
      <meshStandardMaterial color="#eeeeee" roughness={0.55} metalness={0} />
    </instancedMesh>
  );
}

// ─── Start / Finish lines + gantries ─────────────────────────────────────────
function StartFinish({ waypoints, trackWidth }: { waypoints: Pt[]; trackWidth: number }) {
  const n = waypoints.length;
  const midIdx = Math.floor(n / 2);
  const startSeg  = segDir(waypoints[0], waypoints[1 % n]);
  const finishSeg = segDir(waypoints[midIdx], waypoints[(midIdx + 1) % n]);

  const nStripes = 12; // checker columns across track width
  const sw = trackWidth / nStripes;
  const startYr  = startSeg.yaw  * Math.PI / 180;
  const finishYr = finishSeg.yaw * Math.PI / 180;

  const stripes: React.ReactElement[] = [];
  for (let c = 0; c < nStripes; c++) {
    const offset = -trackWidth / 2 + sw * c + sw / 2;
    const isBlack = c % 2 === 0;

    // Start (green)
    const sp = new THREE.Vector3(
      waypoints[0].x + startSeg.rx * offset, 0.32,
      waypoints[0].z + startSeg.rz * offset
    );
    stripes.push(
      <mesh key={`s${c}`} position={sp} rotation={[0, startYr, 0]}>
        <boxGeometry args={[sw * 0.96, 0.04, 1.0]} />
        <meshStandardMaterial color="#27ae60" roughness={0.6} metalness={0} />
      </mesh>
    );

    // Finish (checkerboard)
    const fp = new THREE.Vector3(
      waypoints[midIdx].x + finishSeg.rx * offset, 0.32,
      waypoints[midIdx].z + finishSeg.rz * offset
    );
    stripes.push(
      <mesh key={`f${c}`} position={fp} rotation={[0, finishYr, 0]}>
        <boxGeometry args={[sw * 0.96, 0.04, 1.0]} />
        <meshStandardMaterial color={isBlack ? "#111111" : "#f0f0f0"} roughness={0.5} metalness={0} />
      </mesh>
    );
  }

  // Gantry poles + bar
  const gantryW = trackWidth + 2.5;
  const poleColor = "#2ecc71";
  const poleEmit  = "#1a5c38";
  const chkColor  = "#c0392b";
  const chkEmit   = "#5c1010";

  const startCx = waypoints[0].x;
  const startCz = waypoints[0].z;
  const finishCx = waypoints[midIdx].x;
  const finishCz = waypoints[midIdx].z;

  const gantries: React.ReactElement[] = [];
  for (let s = -1; s <= 1; s += 2) {
    // Start poles
    gantries.push(
      <mesh key={`sp${s}`} position={[startCx + startSeg.rx * (gantryW / 2) * s, 2.2, startCz + startSeg.rz * (gantryW / 2) * s]}>
        <cylinderGeometry args={[0.09, 0.12, 4.4, 7]} />
        <meshStandardMaterial color={poleColor} emissive={poleEmit} emissiveIntensity={0.5} roughness={0.4} metalness={0.35} />
      </mesh>
    );
    // Finish poles
    gantries.push(
      <mesh key={`fp${s}`} position={[finishCx + finishSeg.rx * (gantryW / 2) * s, 2.2, finishCz + finishSeg.rz * (gantryW / 2) * s]}>
        <cylinderGeometry args={[0.09, 0.12, 4.4, 7]} />
        <meshStandardMaterial color={chkColor} emissive={chkEmit} emissiveIntensity={0.5} roughness={0.4} metalness={0.35} />
      </mesh>
    );
  }

  // Horizontal gantry bars
  gantries.push(
    <mesh key="sg" position={[startCx, 4.55, startCz]} rotation={[0, startYr, 0]}>
      <boxGeometry args={[gantryW, 0.18, 0.18]} />
      <meshStandardMaterial color={poleColor} emissive={poleEmit} emissiveIntensity={0.4} roughness={0.4} metalness={0.35} />
    </mesh>
  );
  gantries.push(
    <mesh key="fg" position={[finishCx, 4.55, finishCz]} rotation={[0, finishYr, 0]}>
      <boxGeometry args={[gantryW, 0.18, 0.18]} />
      <meshStandardMaterial color={chkColor} emissive={chkEmit} emissiveIntensity={0.4} roughness={0.4} metalness={0.35} />
    </mesh>
  );

  return <>{stripes}{gantries}</>;
}

// ─── Auto-fit camera ──────────────────────────────────────────────────────────
function AutoCamera({ waypoints, trackWidth }: { waypoints: Pt[]; trackWidth: number }) {
  const { camera } = useThree();
  useEffect(() => {
    if (!waypoints.length) return;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    waypoints.forEach(p => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
    });
    const pad = trackWidth + 10;
    minX -= pad; maxX += pad; minZ -= pad; maxZ += pad;
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    const span = Math.max(maxX - minX, maxZ - minZ);
    const dist = span * 0.72;
    camera.position.set(cx + dist * 0.45, dist * 0.60, cz + dist * 0.68);
    camera.lookAt(cx, 0, cz);
  }, [waypoints, trackWidth, camera]);
  return null;
}

// ─── 3D Scene ─────────────────────────────────────────────────────────────────
interface Track3DSceneProps {
  waypoints: Pt[];
  trackWidth: number;
  addBarriers: boolean;
  addText: boolean;
  barrierLen: number;
}

function Track3DScene({ waypoints, trackWidth, addBarriers, addText, barrierLen }: Track3DSceneProps) {
  const floorXfms   = useMemo(() => buildFloorTiles(waypoints, trackWidth),                     [waypoints, trackWidth]);
  const barrierXfms = useMemo(() => addBarriers ? buildBarriers(waypoints, trackWidth, barrierLen) : [], [waypoints, trackWidth, barrierLen, addBarriers]);
  const dashXfms    = useMemo(() => buildCenterDashes(waypoints),                               [waypoints]);

  return (
    <>
      {/* ── Lighting ──────────────────────────────────────────────────────── */}
      <ambientLight intensity={0.50} color="#b0c4de" />
      <directionalLight position={[80, 130, 60]}   intensity={1.7} color="#fff8ef" />
      <directionalLight position={[-50, 30, -70]}  intensity={0.30} color="#5577aa" />

      {/* ── Ground (dark void under floating track) ───────────────────────── */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4000, 4000]} />
        <meshBasicMaterial color="#05080f" />
      </mesh>

      {/* ── Track surface ─────────────────────────────────────────────────── */}
      <FloorTiles xfms={floorXfms} />
      {addBarriers && <Barriers xfms={barrierXfms} />}
      <CenterLine xfms={dashXfms} />
      {addText && <StartFinish waypoints={waypoints} trackWidth={trackWidth} />}

      {/* ── Camera & controls ─────────────────────────────────────────────── */}
      <AutoCamera waypoints={waypoints} trackWidth={trackWidth} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={10}
        maxDistance={900}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

// ─── Exported canvas ──────────────────────────────────────────────────────────
export default function TrackPreview3D(props: Track3DSceneProps) {
  if (!isWebGLAvailable()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#080c14] gap-2">
        <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">3D Preview Unavailable</div>
        <div className="text-[#3a3010] text-[9px] text-center max-w-[220px] leading-relaxed">WebGL is not supported in this environment. Code export still works normally.</div>
      </div>
    );
  }
  return (
    <WebGLErrorBoundary>
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: 48, near: 1, far: 2000, position: [0, 100, 150] }}
        style={{ background: "#080c14", width: "100%", height: "100%" }}
      >
        <fog attach="fog" args={["#080c14", 350, 950]} />
        <Track3DScene {...props} />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
