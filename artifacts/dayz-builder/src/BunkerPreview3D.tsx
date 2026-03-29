import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { BunkerLayout } from "@/lib/bunkerGenerator";
import type { PlacedObject } from "@/lib/bunkerData";
import { WebGLErrorBoundary, isWebGLAvailable } from "@/WebGLErrorBoundary";

// ─── Section palette (matches FloorPlanSVG legend) ────────────────────────────
const SEC_COLOR: Record<PlacedObject["section"], THREE.Color> = {
  entrance: new THREE.Color("#27ae60"),
  exit:     new THREE.Color("#e74c3c"),
  panel:    new THREE.Color("#9b59b6"),
  exterior: new THREE.Color("#7f8c8d"),
  stair:    new THREE.Color("#f39c12"),
  tunnel:   new THREE.Color("#3498db"),
  branch:   new THREE.Color("#2980b9"),
  room:     new THREE.Color("#d4a017"),
  decor:    new THREE.Color("#8a7040"),
};

// ─── Approximate box size for each section type ───────────────────────────────
function secBox(sec: PlacedObject["section"]): [number, number, number] {
  switch (sec) {
    case "room":     return [9,   0.3,  9  ];   // thin floor slab
    case "stair":    return [2,   6,    4  ];
    case "decor":    return [1.2, 1.2,  1.2];
    case "panel":    return [3,   3,    0.3];
    case "exterior": return [0.3, 3.5,  9  ];
    default:         return [0.35, 3.5, 9  ];   // tunnel / branch / entrance / exit
  }
}

// ─── One InstancedMesh per section group ──────────────────────────────────────
function SectionMesh({
  objs, cx, cy, cz, color, boxW, boxH, boxD,
}: {
  objs: PlacedObject[];
  cx: number; cy: number; cz: number;
  color: THREE.Color;
  boxW: number; boxH: number; boxD: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const count   = objs.length;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      const o = objs[i];
      dummy.position.set(o.dx - cx, o.dy - cy, o.dz - cz);
      // DayZ YPR → Three.js Euler 'YXZ' (yaw first, then pitch, then roll)
      dummy.rotation.order = "YXZ";
      dummy.rotation.set(
        o.pitch * Math.PI / 180,
        o.yaw   * Math.PI / 180,
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
      key={count}
      args={[undefined, undefined, Math.max(1, count)]}
      frustumCulled={false}
    >
      <boxGeometry args={[boxW, boxH, boxD]} />
      <meshStandardMaterial color={color} roughness={0.7} transparent opacity={0.88} />
    </instancedMesh>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────
function Scene({ layout }: { layout: BunkerLayout }) {
  const objs  = layout.objects;
  const count = objs.length;

  const { cx, cy, cz, spread } = useMemo(() => {
    if (!count) return { cx: 0, cy: 0, cz: 0, spread: 50 };
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const o of objs) {
      if (o.dx < minX) minX = o.dx; if (o.dx > maxX) maxX = o.dx;
      if (o.dy < minY) minY = o.dy; if (o.dy > maxY) maxY = o.dy;
      if (o.dz < minZ) minZ = o.dz; if (o.dz > maxZ) maxZ = o.dz;
    }
    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      cz: (minZ + maxZ) / 2,
      spread: Math.max(maxX - minX, (maxY - minY) * 3, maxZ - minZ, 30),
    };
  }, [objs, count]);

  // Group objects by section
  const sectionGroups = useMemo(() => {
    const map = new Map<PlacedObject["section"], PlacedObject[]>();
    for (const o of objs) {
      if (!map.has(o.section)) map.set(o.section, []);
      map.get(o.section)!.push(o);
    }
    return map;
  }, [objs]);

  // Auto-fit camera
  const { camera } = useThree();
  useEffect(() => {
    const d = spread * 1.5;
    camera.position.set(d * 0.6, d * 0.55, d * 0.8);
    (camera as THREE.PerspectiveCamera).far = d * 20;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [spread, camera]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 3]} intensity={0.85} />
      <directionalLight position={[-1, 1, -2]} intensity={0.2} color="#6080ff" />

      {Array.from(sectionGroups.entries()).map(([sec, group]) => {
        const [bw, bh, bd] = secBox(sec);
        return (
          <SectionMesh
            key={sec}
            objs={group}
            cx={cx} cy={cy} cz={cz}
            color={SEC_COLOR[sec] ?? new THREE.Color("#888")}
            boxW={bw} boxH={bh} boxD={bd}
          />
        );
      })}

      {/* Surface ground plane */}
      <mesh position={[0, -cy, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[spread * 1.8, spread * 1.8]} />
        <meshStandardMaterial color="#12100a" roughness={1} transparent opacity={0.6} />
      </mesh>

      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.4} dampingFactor={0.12} enableDamping />
    </>
  );
}

// ─── Legend strip ─────────────────────────────────────────────────────────────
const LEGEND_ENTRIES: Array<[PlacedObject["section"], string]> = [
  ["entrance", "#27ae60"],
  ["exit",     "#e74c3c"],
  ["tunnel",   "#3498db"],
  ["room",     "#d4a017"],
  ["stair",    "#f39c12"],
  ["decor",    "#8a7040"],
];

// ─── Public component ─────────────────────────────────────────────────────────
export default function BunkerPreview3D({ layout }: { layout: BunkerLayout }) {
  if (!isWebGLAvailable()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#060402] gap-2" style={{ minHeight: 300 }}>
        <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">3D Preview Unavailable</div>
        <div className="text-[#3a3010] text-[9px] text-center max-w-[220px] leading-relaxed">WebGL is not supported in this environment. Code export still works normally.</div>
      </div>
    );
  }
  return (
    <div className="w-full h-full relative" style={{ minHeight: 300 }}>
      <WebGLErrorBoundary>
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 50000 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#060402" }}
        >
          <Scene layout={layout} />
        </Canvas>
      </WebGLErrorBoundary>

      {/* Legend overlay */}
      <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none select-none">
        {LEGEND_ENTRIES.map(([sec, col]) => (
          <div key={sec} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: col }} />
            <span className="text-[8px] font-mono capitalize" style={{ color: col }}>{sec}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-2 right-2 text-[9px] font-mono text-[#d4a017] pointer-events-none select-none">
        {layout.objects.length} objects
      </div>

      <div className="absolute bottom-2 left-0 right-0 text-center text-[#3a2e18] text-[9px] pointer-events-none select-none">
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
