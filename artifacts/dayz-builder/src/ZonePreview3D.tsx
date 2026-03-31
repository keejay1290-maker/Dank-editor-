import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { WebGLErrorBoundary, isWebGLAvailable } from "@/WebGLErrorBoundary";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ZoneObject {
  type: string;    // category key for colour lookup
  x: number;      // local offset from zone centre
  y: number;
  z: number;
  yaw: number;    // degrees
  w: number;      // box width
  h: number;      // box height
  d: number;      // box depth
  color: string;  // hex
}

// ─── Instanced box group ──────────────────────────────────────────────────────
function BoxGroup({ objects, color, w, h, d }: {
  objects: { x: number; y: number; z: number; yaw: number }[];
  color: string; w: number; h: number; d: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current || objects.length === 0) return;
    objects.forEach(({ x, y, z, yaw }, i) => {
      dummy.position.set(x, y + h / 2, z);
      dummy.rotation.set(0, yaw * Math.PI / 180, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [objects, dummy, h]);

  if (objects.length === 0) return null;
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, objects.length]} frustumCulled={false}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.65} metalness={0.1}
        emissive={color} emissiveIntensity={0.08} transparent opacity={0.92} />
    </instancedMesh>
  );
}

// ─── Auto-fit camera ──────────────────────────────────────────────────────────
function AutoCamera({ objects }: { objects: ZoneObject[] }) {
  const { camera } = useThree();
  useEffect(() => {
    if (objects.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, maxY = 0;
    for (const o of objects) {
      minX = Math.min(minX, o.x - o.w / 2);
      maxX = Math.max(maxX, o.x + o.w / 2);
      minZ = Math.min(minZ, o.z - o.d / 2);
      maxZ = Math.max(maxZ, o.z + o.d / 2);
      maxY = Math.max(maxY, o.y + o.h);
    }
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    const span = Math.max(maxX - minX, maxZ - minZ, maxY, 20);
    camera.position.set(cx + span * 0.7, span * 0.8, cz + span * 0.9);
    camera.lookAt(cx, maxY * 0.3, cz);
  }, [objects, camera]);
  return null;
}

// ─── Ground grid ──────────────────────────────────────────────────────────────
function Ground({ radius }: { radius: number }) {
  return (
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[radius * 2.5, radius * 2.5]} />
      <meshBasicMaterial color="#0a0c08" />
    </mesh>
  );
}

// ─── Zone boundary ring ───────────────────────────────────────────────────────
function ZoneRing({ radius }: { radius: number }) {
  const pts: THREE.Vector3[] = [];
  const segs = 64;
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0.1, Math.sin(a) * radius));
  }
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [radius]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#2e2518" }))} />
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function ZoneScene({ objects, zoneRadius }: { objects: ZoneObject[]; zoneRadius: number }) {
  // Group objects by colour + dimensions for instancing
  const groups = useMemo(() => {
    const map = new Map<string, { color: string; w: number; h: number; d: number; items: { x: number; y: number; z: number; yaw: number }[] }>();
    for (const o of objects) {
      const key = `${o.color}_${o.w.toFixed(1)}_${o.h.toFixed(1)}_${o.d.toFixed(1)}`;
      if (!map.has(key)) map.set(key, { color: o.color, w: o.w, h: o.h, d: o.d, items: [] });
      map.get(key)!.items.push({ x: o.x, y: o.y, z: o.z, yaw: o.yaw });
    }
    return Array.from(map.values());
  }, [objects]);

  return (
    <>
      <ambientLight intensity={0.55} color="#b0c4de" />
      <directionalLight position={[60, 120, 80]}  intensity={1.6} color="#fff8ef" />
      <directionalLight position={[-40, 30, -60]} intensity={0.25} color="#4466aa" />

      <Ground radius={zoneRadius} />
      <ZoneRing radius={zoneRadius} />

      {groups.map((g, i) => (
        <BoxGroup key={i} objects={g.items} color={g.color} w={g.w} h={g.h} d={g.d} />
      ))}

      <AutoCamera objects={objects} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={5}
        maxDistance={600}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

// ─── Exported canvas ──────────────────────────────────────────────────────────
export default function ZonePreview3D({ objects, zoneRadius = 40 }: {
  objects: ZoneObject[];
  zoneRadius?: number;
}) {
  if (!isWebGLAvailable()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#080c08] gap-2">
        <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">3D Preview Unavailable</div>
        <div className="text-[#3a3010] text-[9px] text-center max-w-[220px] leading-relaxed">
          WebGL is not supported. Code export still works normally.
        </div>
      </div>
    );
  }
  return (
    <WebGLErrorBoundary>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, powerPreference: "default", preserveDrawingBuffer: false }}
        camera={{ fov: 50, near: 0.5, far: 1500, position: [0, 60, 80] }}
        style={{ background: "#080c08", width: "100%", height: "100%" }}
      >
        <fog attach="fog" args={["#080c08", 300, 900]} />
        <ZoneScene objects={objects} zoneRadius={zoneRadius} />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
