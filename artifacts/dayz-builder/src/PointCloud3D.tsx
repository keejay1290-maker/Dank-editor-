import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Point3D } from './lib/types';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';

/**
 * 🎨 DANKVAULT™ OBJECT COLORS
 */
const OBJECT_COLORS: Record<string, string> = {
  'Land_Container_1Bo':            '#3498db',
  'Land_ContainerLocked_Blue_DE':   '#2980b9',
  'StaticObj_Wall_CncSmall_8':      '#95a5a6',
  'StaticObj_Wall_CncSmall_4':      '#7f8c8d',
  'StaticObj_Platform1_Block':      '#ecf0f1',
  'StaticObj_Misc_Timbers_Log4':    '#d35400',
  'Grenade_ChemGas':                '#2ecc71',
  'Land_Underground_Entrance':      '#2c3e50',
  'Land_Underground_Tunnel_Single': '#34495e',
  'Land_Underground_Tunnel_T':      '#34495e',
  'Land_Underground_Tunnel_X':      '#34495e',
  'Land_Underground_Stairs':        '#d4a017',
  'Land_Underground_Room':          '#16a085',
  'StaticObj_Misc_Geothermal_Pipe': '#e67e22',
  'StaticObj_Misc_Geothermal_Vent': '#e74c3c'
};

/**
 * 🧊 OPTIMIZED INSTANCED OBJECT CLOUD
 */
function ObjectCloud({ points, objClass, mode, overlays }: { points: Point3D[], objClass: string, mode: string, overlays: any }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const color = OBJECT_COLORS[objClass] ?? '#27ae60';

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    points.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(
        ((p.pitch || 0) * Math.PI) / 180,
        ((p.yaw || 0) * Math.PI) / 180,
        ((p.roll || 0) * Math.PI) / 180
      );
      dummy.scale.set(p.scale || 1, p.scale || 1, p.scale || 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [points]);

  const isBunker = objClass.toLowerCase().includes('underground');
  const opacity = mode === "sandbox_hud" ? 0.6 : 1.0;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial 
        color={color} 
        transparent={opacity < 1} 
        opacity={opacity}
        roughness={0.3} 
        metalness={isBunker ? 0.8 : 0.4}
        emissive={color}
        emissiveIntensity={mode === "sandbox_hud" ? 0.5 : 0.1}
      />
    </instancedMesh>
  );
}

interface PointCloud3DProps {
  points?: Point3D[];
  objects?: any[];
  autoRotate?: boolean;
  globalScale?: number;
  globalPitch?: number;
  globalRoll?: number;
  mode?: "preview" | "sandbox_basic" | "sandbox_hud";
  overlays?: {
    density: boolean;
    collision: boolean;
    navigation: boolean;
    symmetry: boolean;
    structural: boolean;
    debug: boolean;
  };
  pipelineCtx?: any;
}

const PointCloud3D: React.FC<PointCloud3DProps> = ({ 
  points = [], 
  objects = [], 
  autoRotate = true,
  globalScale = 1.0,
  globalPitch = 0,
  globalRoll = 0,
  mode = "preview",
  overlays = { density: false, collision: false, navigation: false, symmetry: false, structural: false, debug: false },
  pipelineCtx = null
}) => {
  
  // 🛡️ EMERGENCY GUARD — never render canvas with bad data
  const safePoints = useMemo(() => {
    const raw = points.length > 0 ? points : objects.map(o => ({ 
      x: o.pos[0], y: o.pos[1], z: o.pos[2], 
      name: o.name, 
      yaw: o.ypr[0], pitch: o.ypr[1], roll: o.ypr[2], 
      scale: o.scale 
    }));
    
    if (!raw || !Array.isArray(raw)) return [];
    
    return raw.filter(p =>
      p != null &&
      typeof p.x === 'number' && isFinite(p.x) &&
      typeof p.y === 'number' && isFinite(p.y) &&
      typeof p.z === 'number' && isFinite(p.z)
    );
  }, [points, objects]);

  // 🏛️ GROUP BY CLASSNAME FOR INSTANCING
  const groups = useMemo(() => {
    const g: Record<string, Point3D[]> = {};
    safePoints.forEach(p => {
      const cls = p.name || 'Land_Container_1Bo';
      if (!g[cls]) g[cls] = [];
      g[cls].push(p);
    });
    return g;
  }, [safePoints]);

  // 🏗️ SMART-FRAME: AUTO-CALCULATE BUILD BOUNDS
  const { center, zoomDist } = useMemo(() => {
    if (safePoints.length === 0) return { center: new THREE.Vector3(0,0,0), zoomDist: 50 };
    
    const box = new THREE.Box3();
    safePoints.forEach(p => box.expandByPoint(new THREE.Vector3(p.x, p.y, p.z)));
    
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    const size = new THREE.Vector3();
    box.getSize(size);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const zoomDist = Math.max(20, maxDim * 2.2); // Golden ratio for architectural framing
    
    return { center, zoomDist };
  }, [safePoints]);

  if (safePoints.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#080f09] text-[#27ae60] font-mono border border-[#1a2e1a]">
        <div className="animate-pulse mb-2">⚠ DEGENERATE BUILD ⚠</div>
        <div className="text-[10px] opacity-50 uppercase">Zero valid nodes found for materialization</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#050805] relative overflow-hidden">
      <WebGLErrorBoundary fallback={<div className="p-4 text-red-500 font-mono text-[10px]">WEBGL_CONTEXT_LOST — RELOAD APP</div>}>
        <Canvas 
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          frameloop="always"
          camera={{ position: [zoomDist, zoomDist, zoomDist], fov: 45 }}
          style={{ background: mode === "sandbox_hud" ? "#0a1a1a" : "#050805" }}
        >
          <color attach="background" args={[mode === "sandbox_hud" ? '#0a1510' : '#050805']} />
          <Stars radius={120} depth={60} count={6000} factor={4} saturation={0.5} fade speed={1.5} />
          <fog attach="fog" args={[mode === "sandbox_hud" ? '#102518' : '#050805', 100, 300]} />
          
          {/* 🚨 ROBUST ARCHITECTURAL LIGHTING */}
          <ambientLight intensity={0.6} color="#ffffff" />
          <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-20, -10, -20]} intensity={1.0} color="#27ae60" />
          <spotLight position={[0, 100, 0]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" castShadow />
          
          <group scale={globalScale} rotation={[globalPitch * Math.PI / 180, 0, globalRoll * Math.PI / 180]} position={[-center.x, -center.y, -center.z]}>
            {Object.entries(groups).map(([objClass, pts]) => (
              <ObjectCloud key={objClass} points={pts} objClass={objClass} mode={mode} overlays={overlays} />
            ))}
          </group>

          <OrbitControls 
            autoRotate={autoRotate} 
            autoRotateSpeed={0.8} 
            enableDamping={true}
            dampingFactor={0.08}
            minDistance={5}
            maxDistance={1000}
            target={[0, 0, 0]} 
          />
          
          {/* Legend Overlay */}
          <Html position={[-18, 12, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`border p-2.5 text-[9px] font-mono backdrop-blur-xl rounded shadow-2xl transition-all duration-500 ${mode === "sandbox_hud" ? "bg-[#0c2010cc] border-[#27ae60] text-[#27ae60]" : "bg-[#000000aa] border-[#27ae6044] text-[#b8d4b8]"}`}>
              <div className="font-black border-b border-[#27ae6044] mb-1.5 pb-1 uppercase tracking-[0.2em] flex justify-between gap-4">
                  <span>{mode === "sandbox_hud" ? "🛰️ SANDBOX AUDIT" : "🏛️ ARCHITECTURAL PREVIEW"}</span>
                  {mode === "sandbox_hud" && <span className="animate-pulse bg-[#27ae60] text-[#080f08] px-1 rounded-sm">ACTIVE</span>}
              </div>
              <div className="flex flex-col gap-0.5 opacity-90">
                <div className="flex justify-between"><span>NODES:</span> <span className="font-bold text-[#f1c40f]">{safePoints.length.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>GROUPS:</span> <span className="font-bold text-[#f1c40f]">{Object.keys(groups).length}</span></div>
                <div className="flex justify-between"><span>POWER:</span> <span className="font-bold text-[#27ae60]">OPTIMAL</span></div>
                {mode === "sandbox_hud" && (
                    <div className="mt-2 border-t border-[#27ae6022] pt-1 text-[7px] text-[#5a8a5a] uppercase">
                        Telemetery: Synchronized // Fidelity: S-Tier
                    </div>
                )}
              </div>
            </div>
          </Html>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};

export default PointCloud3D;
