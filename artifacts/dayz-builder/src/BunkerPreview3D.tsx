import { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { BunkerLayout } from "@/lib/bunkerGenerator";
import type { PlacedObject } from "@/lib/bunkerData";
import { getMimic } from "@/lib/shapeMimic";
import { WebGLErrorBoundary, isWebGLAvailable } from "@/WebGLErrorBoundary";

// ─── Section palette (matches FloorPlanSVG legend) ────────────────────────────
const SEC_COLOR: Record<PlacedObject["section"], THREE.Color> = {
  entrance: new THREE.Color("#27ae60"),
  exit:     new THREE.Color("#e74c3c"),
  panel:    new THREE.Color("#9b59b6"),
  exterior: new THREE.Color("#7f8c8d"),
  stair:    new THREE.Color("#f39c12"),
  stairs:   new THREE.Color("#f39c12"),
  tunnel:   new THREE.Color("#3498db"),
  corridor: new THREE.Color("#3498db"),
  branch:   new THREE.Color("#2980b9"),
  room:     new THREE.Color("#d4a017"),
  decor:    new THREE.Color("#8a7040"),
  loot:     new THREE.Color("#f1c40f"),
  wall:     new THREE.Color("#2c3e50"),
  floor:    new THREE.Color("#1a2e1a"),
  wreck:    new THREE.Color("#c0392b"),
};

// ─── Geometry factory ─────────────────────────────────────────────────────────
function createMimicGeometry(shape: string, args: any[]) {
  switch (shape) {
    case "cylinder": return new THREE.CylinderGeometry(args[0], args[1], args[2], args[3] ?? 12);
    case "sphere":   return new THREE.SphereGeometry(args[0], 16, 16);
    case "torus":    return new THREE.TorusGeometry(args[0], args[1], 12, 24);
    case "ramp":     {
      // A ramp is a box that's long and thin, or a specialized wedge. 
      // For simplicity in InstancedMesh, we use a box but we can use a custom buffer geometry later.
      return new THREE.BoxGeometry(args[0], args[1], args[2]);
    }
    default:         return new THREE.BoxGeometry(args[0] ?? 1, args[1] ?? 1, args[2] ?? 1);
  }
}

function SectionMesh({
  objs, cx, cy, cz, color,
}: {
  objs: PlacedObject[];
  cx: number; cy: number; cz: number;
  color: THREE.Color;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const count   = objs.length;

  // Group objects by their shape mimic
  const objectsByMimic = useMemo(() => {
    const map = new Map<string, { mimic: any; items: PlacedObject[] }>();
    for (const o of objs) {
      const mimic = getMimic(o.classname);
      const key = `${mimic.shape}-${JSON.stringify(mimic.args)}`;
      if (!map.has(key)) map.set(key, { mimic, items: [] });
      map.get(key)!.items.push(o);
    }
    return Array.from(map.values());
  }, [objs]);

  return (
    <>
      {objectsByMimic.map(({ mimic, items }, idx) => (
        <ShapeGroup 
          key={idx}
          mimic={mimic}
          objs={items}
          cx={cx} cy={cy} cz={cz}
          color={color}
        />
      ))}
    </>
  );
}

function ShapeGroup({ mimic, objs, cx, cy, cz, color }: {
  mimic: any;
  objs: PlacedObject[];
  cx: number; cy: number; cz: number;
  color: THREE.Color;
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
      dummy.position.set(o.dx - cx, o.dy - cy, o.dz - cz);
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
        color={mimic.color || color} 
        roughness={0.6} 
        metalness={mimic.shape === "crane" ? 0.3 : 0} 
        transparent 
        opacity={0.88} 
      />
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

  const sectionGroups = useMemo(() => {
    const map = new Map<PlacedObject["section"], PlacedObject[]>();
    for (const o of objs) {
      if (!map.has(o.section)) map.set(o.section, []);
      map.get(o.section)!.push(o);
    }
    return Array.from(map.entries());
  }, [objs]);

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
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[2, 4, 3]} intensity={0.85} castShadow />
      <directionalLight position={[-1, 1, -2]} intensity={0.2} color="#6080ff" />

      {sectionGroups.map(([sec, group]) => (
        <SectionMesh
          key={sec}
          objs={group}
          cx={cx} cy={cy} cz={cz}
          color={SEC_COLOR[sec] ?? new THREE.Color("#888")}
        />
      ))}

      <mesh position={[0, -cy, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[spread * 1.8, spread * 1.8]} />
        <meshStandardMaterial color="#12100a" roughness={1} transparent opacity={0.6} />
      </mesh>

      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.4} dampingFactor={0.12} enableDamping />
    </>
  );
}

export default function BunkerPreview3D({ layout, component = "bunker" }: { 
  layout: BunkerLayout; 
  component?: "bunker" | "airdrop";
}) {
  if (!isWebGLAvailable()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#060402] gap-2" style={{ minHeight: 400 }}>
        <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">3D Preview Unavailable</div>
      </div>
    );
  }

  const legendEntries = component === "airdrop" ? [
    ["exterior", "#7f8c8d", "Architecture"],
    ["loot",     "#f1c40f", "Loot / Drops"],
    ["decor",    "#8a7040", "Industrial Props"],
  ] : [
    ["entrance", "#27ae60", "entrance"],
    ["exit",     "#e74c3c", "exit"],
    ["tunnel",   "#3498db", "tunnel"],
    ["room",     "#d4a017", "room"],
    ["stair",    "#f39c12", "stair"],
    ["decor",    "#8a7040", "decor"],
  ];

  return (
    <div className="w-full h-full relative" style={{ minHeight: 400 }}>
      <WebGLErrorBoundary>
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 50000 }}
          style={{ background: "#060402", width: "100%", height: "100%" }}
        >
          <Scene layout={layout} />
        </Canvas>
      </WebGLErrorBoundary>
      <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none select-none">
        {legendEntries.map(([sec, col, label]) => (
          <div key={sec} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: col as string }} />
            <span className="text-[8px] font-mono capitalize" style={{ color: col as string }}>{label}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-2 right-2 text-[9px] font-mono text-[#d4a017] pointer-events-none select-none">
        {layout.objects.length} objects · {component === "airdrop" ? "AIRDROP MIMIC SYSTEM" : "HIGH ACCURACY GEOMETRY"}
      </div>
    </div>
  );
}
