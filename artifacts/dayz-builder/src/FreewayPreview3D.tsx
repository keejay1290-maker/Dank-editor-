import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { getMimic } from "@/lib/shapeMimic";
import { WebGLErrorBoundary, isWebGLAvailable } from "@/WebGLErrorBoundary";

export interface FreewayObject {
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
}

function createMimicGeometry(shape: string, args: any[]) {
  switch (shape) {
    case "cylinder": return new THREE.CylinderGeometry(args[0], args[1], args[2], args[3] ?? 12);
    case "sphere":   return new THREE.SphereGeometry(args[0], 16, 16);
    default:         return new THREE.BoxGeometry(args[0] ?? 1, args[1] ?? 1, args[2] ?? 1);
  }
}

function ShapeGroup({ mimic, objs, cx, cy, cz }: {
  mimic: any;
  objs: FreewayObject[];
  cx: number; cy: number; cz: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const count   = objs.length;

  const geometry = useMemo(() => createMimicGeometry(mimic.shape, mimic.args), [mimic]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      const o = objs[i];
      dummy.position.set(o.x - cx, o.y - cy, o.z - cz);
      dummy.rotation.order = "YXZ";
      dummy.rotation.set(
        o.pitch * Math.PI / 180,
        -o.yaw  * Math.PI / 180,
        o.roll  * Math.PI / 180,
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [objs, cx, cy, cz, count, dummy]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <meshStandardMaterial 
        color={mimic.color || "#7f8c8d"} 
        roughness={0.7} 
        metalness={0.1} 
      />
    </instancedMesh>
  );
}

function Scene({ objects }: { objects: FreewayObject[] }) {
  const count = objects.length;

  const { cx, cy, cz, spread } = useMemo(() => {
    if (!count) return { cx: 0, cy: 0, cz: 0, spread: 50 };
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const o of objects) {
      if (o.x < minX) minX = o.x; if (o.x > maxX) maxX = o.x;
      if (o.y < minY) minY = o.y; if (o.y > maxY) maxY = o.y;
      if (o.z < minZ) minZ = o.z; if (o.z > maxZ) maxZ = o.z;
    }
    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      cz: (minZ + maxZ) / 2,
      spread: Math.max(maxX - minX, (maxY - minY) * 5, maxZ - minZ, 50),
    };
  }, [objects, count]);

  const objectsByMimic = useMemo(() => {
    const map = new Map<string, { mimic: any; items: FreewayObject[] }>();
    for (const o of objects) {
      const mimic = getMimic(o.name);
      const key = `${mimic.shape}-${JSON.stringify(mimic.args)}`;
      if (!map.has(key)) map.set(key, { mimic, items: [] });
      map.get(key)!.items.push(o);
    }
    return Array.from(map.values());
  }, [objects]);

  const { camera } = useThree();
  useEffect(() => {
    // Cap spread for camera positioning so it doesn't zoom out too far for long bridges
    const viewSpread = Math.min(spread, 150); 
    const d = viewSpread * 1.5;
    camera.position.set(d * 0.5, d * 0.4, d * 0.7);
    (camera as THREE.PerspectiveCamera).far = Math.max(spread * 10, 5000);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [spread, camera]);

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 5, -10]} intensity={0.3} color="#6080ff" />

      {objectsByMimic.map(({ mimic, items }, idx) => (
        <ShapeGroup 
          key={idx}
          mimic={mimic}
          objs={items}
          cx={cx} cy={cy} cz={cz}
        />
      ))}

      <mesh position={[0, -cy - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[spread * 2, spread * 2]} />
        <meshStandardMaterial color="#0a1209" roughness={1} />
      </mesh>

      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.3} dampingFactor={0.1} enableDamping />
    </>
  );
}

export default function FreewayPreview3D({ objects }: { objects: FreewayObject[] }) {
  if (!isWebGLAvailable()) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#060402] text-[#3a6a3a] text-[11px]">
        3D Preview Unavailable
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <WebGLErrorBoundary>
        <Canvas
          camera={{ fov: 45, near: 0.1, far: 100000 }}
          style={{ background: "#060402", width: "100%", height: "100%" }}
        >
          <Scene objects={objects} />
        </Canvas>
      </WebGLErrorBoundary>
      <div className="absolute top-2 left-2 text-[#27ae60] text-[9px] font-mono pointer-events-none select-none">
        {objects.length} OBJECTS · HIGH-FIDELITY PREVIEW
      </div>
    </div>
  );
}
