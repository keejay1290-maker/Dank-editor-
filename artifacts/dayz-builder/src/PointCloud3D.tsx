import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Point3D } from "@/lib/shapeGenerators";
import { WebGLErrorBoundary, isWebGLAvailable } from "@/WebGLErrorBoundary";

// ─── Inner scene: InstancedMesh for fast point-cloud rendering ────────────────
function Scene({
  points, globalPitch, globalRoll, globalScale, autoRotate,
}: {
  points: Point3D[];
  globalPitch: number;
  globalRoll: number;
  globalScale: number;
  autoRotate: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy  = useMemo(() => new THREE.Object3D(), []);
  const count  = points.length;

  const { cx, cy, cz, spread } = useMemo(() => {
    if (!count) return { cx: 0, cy: 0, cz: 0, spread: 20 };
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    }
    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      cz: (minZ + maxZ) / 2,
      spread: Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1),
    };
  }, [points, count]);

  // Box size: 2% of spread, clamped
  const boxSize = Math.max(0.4, Math.min(2.5, spread * 0.022));

  // Update instanced matrices + per-instance color
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !count) return;

    let minY = Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const rangeY = Math.max(maxY - minY, 0.001);
    const color  = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const p = points[i];
      dummy.position.set(p.x - cx, p.y - cy, p.z - cz);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Gold → deep amber depth gradient (matches existing canvas palette)
      const t = (p.y - minY) / rangeY;
      color.setRGB(
        (220 * t + 55 * (1 - t)) / 255,
        (155 * t + 75 * (1 - t)) / 255,
        (20  * t + 8  * (1 - t)) / 255,
      );
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [points, cx, cy, cz, count, dummy]);

  // Auto-fit camera whenever points or scale change
  const { camera } = useThree();
  useEffect(() => {
    if (!count) return;
    const d = spread * globalScale * 1.8;
    camera.position.set(d * 0.65, d * 0.5, d);
    (camera as THREE.PerspectiveCamera).far = d * 20;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [spread, globalScale, camera, count]);

  if (!count) return null;

  const pitchR = globalPitch * Math.PI / 180;
  const rollR  = globalRoll  * Math.PI / 180;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[1, 2, 1.5]} intensity={0.9} />
      <directionalLight position={[-1, 0.5, -1]} intensity={0.25} color="#8080ff" />

      {/* Global pitch+roll wraps the entire point cloud */}
      <group rotation={[pitchR, 0, rollR]} scale={globalScale}>
        <instancedMesh
          ref={meshRef}
          key={count}
          args={[undefined, undefined, count]}
          frustumCulled={false}
        >
          <boxGeometry args={[boxSize, boxSize, boxSize]} />
          <meshStandardMaterial vertexColors roughness={0.6} metalness={0.1} />
        </instancedMesh>
      </group>

      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        dampingFactor={0.12}
        enableDamping
      />
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export default function PointCloud3D({
  points,
  globalPitch  = 0,
  globalRoll   = 0,
  globalScale  = 1,
  autoRotate   = false,
}: {
  points: Point3D[];
  globalPitch?: number;
  globalRoll?: number;
  globalScale?: number;
  autoRotate?: boolean;
}) {
  if (!points.length) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#060402] text-[#2e2518] text-[11px] font-mono select-none">
        Configure shape — real-time 3D preview updates instantly
      </div>
    );
  }

  if (!isWebGLAvailable()) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060402] gap-2">
        <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">3D Preview Unavailable</div>
        <div className="text-[#3a3010] text-[9px] text-center max-w-[220px] leading-relaxed">WebGL is not supported in this environment. Code export still works normally.</div>
      </div>
    );
  }

  return (
    // Use absolute inset so iOS Safari doesn't compute zero height from h-full chains
    <div className="absolute inset-0" style={{ background: "#060402" }}>
      <WebGLErrorBoundary>
        <Canvas
          camera={{ fov: 50, near: 0.01, far: 50000 }}
          // Cap DPR at 2 — iPhones have DPR=3 which exhausts the WebGL context silently
          dpr={[1, 2]}
          gl={{
            antialias: false,        // too expensive at 2× DPR on mobile
            alpha: false,
            powerPreference: "default", // "high-performance" can fail on iOS
            preserveDrawingBuffer: false,
          }}
          style={{ background: "#060402", width: "100%", height: "100%" }}
        >
          <Scene
            points={points}
            globalPitch={globalPitch}
            globalRoll={globalRoll}
            globalScale={globalScale}
            autoRotate={autoRotate}
          />
        </Canvas>
      </WebGLErrorBoundary>

      {/* HUD */}
      <div className="absolute top-2 left-2 text-[#d4a017] text-[9px] font-mono pointer-events-none select-none">
        {points.length.toLocaleString()} pts
      </div>
      <div className="absolute bottom-2 left-0 right-0 text-center text-[#3a2e18] text-[9px] pointer-events-none select-none">
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
