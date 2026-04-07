/**
 * PointCloud3D — Dank DayZ Studio 3D Preview
 * Uses getMimic for real object dimensions, instanced rendering, proper rotations.
 */
import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Point3D } from './lib/types';
import { getMimic } from './lib/shapeMimic';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface PointCloud3DProps {
  points?:      Point3D[];
  objects?:     any[];
  autoRotate?:  boolean;
  globalScale?: number;
  globalPitch?: number;
  globalRoll?:  number;
  mode?:        'preview' | 'sandbox_basic' | 'sandbox_hud';
  overlays?:    any;
  pipelineCtx?: any;
}

// ─── NORMALISE INPUT ──────────────────────────────────────────────────────────
// Accepts both {x,y,z} (from getShapePoints) and {pos:[x,y,z]} (from pipeline)

interface Pt {
  x: number; y: number; z: number;
  yaw?: number; pitch?: number; roll?: number;
  scale?: number; name?: string;
}

function ok(v: any): v is number {
  return typeof v === 'number' && isFinite(v);
}

function normalisePoints(points?: Point3D[], objects?: any[]): Pt[] {
  const out: Pt[] = [];

  // Shape-generator format: { x, y, z, yaw?, pitch?, roll?, name? }
  if (Array.isArray(points) && points.length > 0) {
    for (const p of points) {
      if (!p) continue;
      const x = p.x ?? 0, y = p.y ?? 0, z = p.z ?? 0;
      if (!isFinite(x) || !isFinite(y) || !isFinite(z)) continue;
      out.push({ x, y, z, yaw: p.yaw, pitch: p.pitch, roll: p.roll, scale: p.scale, name: p.name });
    }
  }

  // Pipeline-final format: { name, pos:[x,y,z], ypr:[yaw,pitch,roll], scale }
  if (out.length === 0 && Array.isArray(objects) && objects.length > 0) {
    for (const o of objects) {
      if (!o || !Array.isArray(o.pos)) continue;
      const [x, y, z] = o.pos;
      if (!isFinite(x) || !isFinite(y) || !isFinite(z)) continue;
      const [yaw, pitch, roll] = Array.isArray(o.ypr) ? o.ypr : [0, 0, 0];
      out.push({ x, y, z, yaw, pitch, roll, scale: o.scale, name: o.name });
    }
  }

  return out;
}

// ─── INSTANCED GROUP ─────────────────────────────────────────────────────────

const TMP = new THREE.Object3D();
const EULER = new THREE.Euler();

// Split into oriented (has explicit yaw) vs unoriented (yaw undefined) sub-groups.
// Unoriented points get a compact cube so they don't render as giant sideways slabs.
function ObjectGroup({ pts, objClass }: { pts: Pt[], objClass: string }) {
  const mimic = useMemo(() => getMimic(objClass), [objClass]);

  const [bw, bh, bd] = useMemo(() => {
    const a = mimic.args;
    if (a.length >= 3) return [a[0] as number, a[1] as number, a[2] as number];
    const s = (a[0] as number) || 2;
    return [s, s, s];
  }, [mimic]);

  const color = useMemo(() => mimic.color || '#4a7a50', [mimic]);

  // Cube size for unoriented points — use wall height so the cube is actually visible.
  // Math.min(bw,bh,bd) for thin walls (0.6m) produced near-invisible cubes.
  const cubeSize = Math.max(bh, 2.5);

  const [oriented, unoriented] = useMemo(() => {
    const o: Pt[] = [], u: Pt[] = [];
    for (const p of pts) (p.yaw !== undefined ? o : u).push(p);
    return [o, u];
  }, [pts]);

  const orientedRef   = useRef<THREE.InstancedMesh>(null);
  const unorientedRef = useRef<THREE.InstancedMesh>(null);

  const applyMatrix = (ref: React.RefObject<THREE.InstancedMesh | null>, list: Pt[], wallH: number, isOriented: boolean) => {
    const mesh = ref.current;
    if (!mesh || list.length === 0) return;
    list.forEach((p, i) => {
      TMP.position.set(p.x, p.y + wallH * 0.5, p.z);
      EULER.set(
        ((p.pitch || 0) * Math.PI) / 180,
        isOriented ? -((p.yaw!) * Math.PI) / 180 : 0,
        ((p.roll  || 0) * Math.PI) / 180,
        'YXZ',
      );
      TMP.rotation.copy(EULER);
      const s = ok(p.scale) && p.scale! > 0 ? p.scale! : 1;
      TMP.scale.set(s, s, s);
      TMP.updateMatrix();
      mesh.setMatrixAt(i, TMP.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => { applyMatrix(orientedRef,   oriented,   bh,       true);  }, [oriented,   bh]);
  useEffect(() => { applyMatrix(unorientedRef, unoriented, cubeSize, false); }, [unoriented, cubeSize]);

  const mat = (
    <meshStandardMaterial
      color={color}
      roughness={0.55}
      metalness={0.15}
      emissive={color}
      emissiveIntensity={0.38}
    />
  );

  return (
    <>
      {oriented.length > 0 && (
        <instancedMesh ref={orientedRef} args={[undefined, undefined, oriented.length]}>
          <boxGeometry args={[bw, bh, bd]} />
          {mat}
        </instancedMesh>
      )}
      {unoriented.length > 0 && (
        <instancedMesh ref={unorientedRef} args={[undefined, undefined, unoriented.length]}>
          <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
          {mat}
        </instancedMesh>
      )}
    </>
  );
}

// ─── REACTIVE CAMERA ─────────────────────────────────────────────────────────
// Runs INSIDE Canvas so it can use useThree(). Fires whenever zoomDist changes
// (i.e. when a different build is selected). Build group is always at origin.

function CameraRig({ zoomDist, controlsRef }: { zoomDist: number, controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(zoomDist * 0.75, zoomDist * 0.55, zoomDist * 1.0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomDist]);
  return null;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const PointCloud3D: React.FC<PointCloud3DProps> = ({
  points      = [],
  objects     = [],
  autoRotate  = true,
  globalScale = 1.0,
  globalPitch = 0,
  globalRoll  = 0,
  mode        = 'preview',
}) => {
  const controlsRef = useRef<any>(null);

  // ── Normalise ──────────────────────────────────────────────────────────────
  const pts = useMemo(() => normalisePoints(points, objects), [points, objects]);

  // ── Group by classname ────────────────────────────────────────────────────
  const groups = useMemo(() => {
    const g: Record<string, Pt[]> = {};
    for (const p of pts) {
      const k = p.name || 'Land_Container_1Bo';
      (g[k] ??= []).push(p);
    }
    return g;
  }, [pts]);

  // ── Bounding box → camera distance ────────────────────────────────────────
  const { center, zoomDist } = useMemo(() => {
    if (pts.length === 0) return { center: new THREE.Vector3(), zoomDist: 50 };
    let minX = Infinity, maxX = -Infinity,
        minY = Infinity, maxY = -Infinity,
        minZ = Infinity, maxZ = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    }
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;
    const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 10);
    return { center: new THREE.Vector3(cx, cy, cz), zoomDist: Math.max(20, span * 1.6) };
  }, [pts]);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (pts.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#080f09] text-[#3a6a3a] font-mono border border-[#1a2e1a]">
        <div className="text-[11px] uppercase tracking-widest animate-pulse">No build selected</div>
        <div className="text-[9px] opacity-40 mt-1">Select a shape or prebuild to preview</div>
      </div>
    );
  }

  const bg = '#050805';

  return (
    <div className="w-full h-full relative" style={{ background: bg }}>
      <WebGLErrorBoundary>
        <Canvas
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [zoomDist * 0.75, zoomDist * 0.55, zoomDist], fov: 48, near: 0.5, far: zoomDist * 25 }}
          style={{ background: bg }}
        >
          <color attach="background" args={[bg as any]} />
          <fog attach="fog" args={[bg, zoomDist * 6, zoomDist * 35]} />

          <Stars radius={100} depth={50} count={3000} factor={3} saturation={0.2} fade speed={0.6} />

          <ambientLight intensity={1.4} />
          <directionalLight position={[1, 2, 1.5]} intensity={1.8} castShadow={false} />
          <directionalLight position={[-1, 0.5, -1]} intensity={0.7} />
          <pointLight position={[-20, 40, -20]} intensity={1.0} color="#27ae60" />

          {/* Reactive camera — updates when build changes */}
          <CameraRig zoomDist={zoomDist} controlsRef={controlsRef} />

          {/* Build geometry — shifted so bounding-box centre sits at world origin */}
          <group
            scale={globalScale}
            rotation={[globalPitch * Math.PI / 180, 0, globalRoll * Math.PI / 180]}
            position={[-center.x, -center.y, -center.z]}
          >
            {Object.entries(groups).map(([cls, grpPts]) => (
              <ObjectGroup key={cls} pts={grpPts} objClass={cls} />
            ))}
          </group>

          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={[0, 0, 0]}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            enableDamping
            dampingFactor={0.07}
            minDistance={2}
            maxDistance={zoomDist * 15}
          />
        </Canvas>
      </WebGLErrorBoundary>

      {/* HUD overlay */}
      <div className="absolute top-2 left-2 pointer-events-none z-10">
        <div className={`text-[9px] font-mono px-2 py-1.5 rounded border backdrop-blur-sm ${
          mode === 'sandbox_hud'
            ? 'bg-[#0a1a0acc] border-[#27ae60] text-[#27ae60]'
            : 'bg-[#00000088] border-[#27ae6033] text-[#7aaa7a]'
        }`}>
          <div className="font-black uppercase tracking-widest text-[8px] mb-0.5">
            {mode === 'sandbox_hud' ? '🛰 AUDIT' : '🏛 PREVIEW'}
          </div>
          <div>{pts.length.toLocaleString()} objects · {Object.keys(groups).length} types</div>
        </div>
      </div>
    </div>
  );
};

export default PointCloud3D;
