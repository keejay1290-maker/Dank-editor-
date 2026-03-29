import { useMemo, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Point3D } from "@/lib/shapeGenerators";
import { WebGLErrorBoundary, isWebGLAvailable } from "@/WebGLErrorBoundary";

// ─── Inner scene: plain THREE.Points with vertex colours ─────────────────────
// Much more compatible than InstancedMesh+setColorAt (iOS WebGL extension issues)
function Scene({
  points,
  globalPitch,
  globalRoll,
  globalScale,
  autoRotate,
}: {
  points: Point3D[];
  globalPitch: number;
  globalRoll: number;
  globalScale: number;
  autoRotate: boolean;
}) {
  const count = points.length;
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Build BufferGeometry with positions + vertex colours — no extensions needed
  const { geo, spread } = useMemo(() => {
    if (!count) return { geo: new THREE.BufferGeometry(), spread: 20 };

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    const sp = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1);
    const rangeY = Math.max(maxY - minY, 0.001);

    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const p = points[i];
      pos[i * 3]     = p.x - cx;
      pos[i * 3 + 1] = p.y - cy;
      pos[i * 3 + 2] = p.z - cz;

      // Gold → deep amber gradient by Y height
      const t = (p.y - minY) / rangeY;
      col[i * 3]     = (220 * t + 55  * (1 - t)) / 255;
      col[i * 3 + 1] = (155 * t + 75  * (1 - t)) / 255;
      col[i * 3 + 2] = ( 20 * t +  8  * (1 - t)) / 255;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    return { geo: g, spread: sp };
  }, [points, count]);

  // Position camera to frame all points — update OrbitControls too
  useEffect(() => {
    if (!count) return;
    const d = spread * globalScale * 1.8;
    const px = d * 0.65, py = d * 0.5, pz = d;
    camera.position.set(px, py, pz);
    (camera as THREE.PerspectiveCamera).near = Math.max(0.01, d * 0.001);
    (camera as THREE.PerspectiveCamera).far  = d * 30;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // Sync OrbitControls so it doesn't fight the new camera position
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [spread, globalScale, camera, count]);

  if (!count) return null;

  // Cap point size — iOS GLES has max ~64px; keep it below that
  const ptSize = Math.min(48, Math.max(2, spread * globalScale * 0.02));

  const pitchR = globalPitch * Math.PI / 180;
  const rollR  = globalRoll  * Math.PI / 180;

  return (
    <>
      <group rotation={[pitchR, 0, rollR]} scale={globalScale}>
        <points geometry={geo}>
          <pointsMaterial
            size={ptSize}
            vertexColors
            sizeAttenuation
          />
        </points>
      </group>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        dampingFactor={0.12}
        enableDamping
        target={[0, 0, 0]}
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
    <div className="absolute inset-0" style={{ background: "#060402" }}>
      <WebGLErrorBoundary>
        <Canvas
          camera={{ fov: 50, near: 0.01, far: 50000 }}
          dpr={[1, 2]}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "default",
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
