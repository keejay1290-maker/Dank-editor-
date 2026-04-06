import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { WebGLErrorBoundary, isWebGLAvailable } from "@/WebGLErrorBoundary";

export interface SpawnPt { x: number; y: number; z: number; yaw: number }

// ─── Wall dimensions per object class ────────────────────────────────────────
function getWallDims(wallObj: string): { thick: number; height: number } {
  const cn = wallObj.toLowerCase();
  if (cn.includes("hbarrier_10")) return { thick: 1.1, height: 3.2 };
  if (cn.includes("hbarrier"))    return { thick: 1.1, height: 3.0 };
  if (cn.includes("container"))   return { thick: 2.4, height: 2.9 };
  if (cn.includes("castle"))      return { thick: 0.4, height: 4.5 };
  if (cn.includes("brick"))       return { thick: 0.35, height: 4.0 };
  return { thick: 0.38, height: 4.0 };  // concrete/default
}

// ─── Wall color per object class ─────────────────────────────────────────────
function getWallColor(wallObj: string): THREE.Color {
  const cn = wallObj.toLowerCase();
  if (cn.includes("castle"))    return new THREE.Color("#8a7060");
  if (cn.includes("hbarrier"))  return new THREE.Color("#5a7040");
  if (cn.includes("container")) return new THREE.Color("#4a6b8a");
  if (cn.includes("brick"))     return new THREE.Color("#8b4520");
  return new THREE.Color("#787880");  // concrete
}

// ─── Scene ───────────────────────────────────────────────────────────────────
function Scene({
  spawns, wallObj, cellSz,
}: {
  spawns:  SpawnPt[];
  wallObj: string;
  cellSz:  number;
}) {
  const meshRef  = useRef<THREE.InstancedMesh>(null);
  const dummy    = useMemo(() => new THREE.Object3D(), []);
  const count    = spawns.length;
  const dims     = useMemo(() => getWallDims(wallObj), [wallObj]);
  const color    = useMemo(() => getWallColor(wallObj), [wallObj]);

  // Centroid + spread
  const { cx, cz, spread } = useMemo(() => {
    if (!count) return { cx: 0, cz: 0, spread: 50 };
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const s of spawns) {
      if (s.x < minX) minX = s.x; if (s.x > maxX) maxX = s.x;
      if (s.z < minZ) minZ = s.z; if (s.z > maxZ) maxZ = s.z;
    }
    return {
      cx:     (minX + maxX) / 2,
      cz:     (minZ + maxZ) / 2,
      spread: Math.max(maxX - minX, maxZ - minZ, 20),
    };
  }, [spawns, count]);

  // Set instance transforms — each wall is a box along its local Z axis
  // DayZ yaw=0 → wall extends N-S (Three.js +Z); yaw=90 → extends E-W (+X after rotY)
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !count) return;
    for (let i = 0; i < count; i++) {
      const s = spawns[i];
      dummy.position.set(s.x - cx, dims.height / 2, s.z - cz);
      dummy.rotation.set(0, -s.yaw * Math.PI / 180, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [spawns, cx, cz, dims, count, dummy]);

  // Auto-fit camera
  const { camera } = useThree();
  useEffect(() => {
    const d = spread * 1.3;
    camera.position.set(d * 0.5, d * 0.85, d * 0.6);
    (camera as THREE.PerspectiveCamera).far = d * 20;
    camera.lookAt(0, dims.height / 2, 0);
    camera.updateProjectionMatrix();
  }, [spread, dims.height, camera]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 5, 3]} intensity={0.9} />
      <directionalLight position={[-1, 2, -2]} intensity={0.25} color="#6080c0" />

      {/* Wall instances — Box(thick, height, cellSz); rotated by DayZ yaw */}
      <instancedMesh
        ref={meshRef}
        key={`${count}-${wallObj}-${cellSz}`}
        args={[undefined, undefined, Math.max(1, count)]}
        frustumCulled={false}
      >
        <boxGeometry args={[dims.thick, dims.height, cellSz]} />
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.05} />
      </instancedMesh>

      {/* Ground plane */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[spread * 1.6, spread * 1.6]} />
        <meshStandardMaterial color="#12100a" roughness={1} />
      </mesh>

      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} dampingFactor={0.12} enableDamping />
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export default function MazePreview3D({
  spawns, wallObj, cellSz,
}: {
  spawns:  SpawnPt[];
  wallObj: string;
  cellSz:  number;
}) {
  const wallDims = getWallDims(wallObj);

  if (!isWebGLAvailable()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0804] gap-2" style={{ minHeight: 320 }}>
        <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">3D Preview Unavailable</div>
        <div className="text-[#3a3010] text-[9px] text-center max-w-[220px] leading-relaxed">WebGL is not supported in this environment. Code export still works normally.</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ minHeight: 320 }}>
      <WebGLErrorBoundary>
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 50000 }}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: false, powerPreference: "default", preserveDrawingBuffer: false }}
          style={{ background: "#0a0804", width: "100%", height: "100%" }}
        >
          <Scene spawns={spawns} wallObj={wallObj} cellSz={cellSz} />
        </Canvas>
      </WebGLErrorBoundary>

      {/* Legend overlay */}
      <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none select-none">
        <span className="text-[#d4a017] text-[9px] font-mono font-bold">{spawns.length} walls</span>
        <span className="text-[#6a5a3a] text-[8px] font-mono">
          {wallDims.height.toFixed(1)}m tall · {wallDims.thick.toFixed(2)}m thick
        </span>
      </div>
      <div className="absolute bottom-2 left-0 right-0 text-center text-[#3a2e18] text-[9px] pointer-events-none select-none">
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
