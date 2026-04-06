import { Point3D } from "./types";

/**
 * 🎨 DANKVAULT™ GEOMETRY UTILITIES
 * High-fidelity curves and rotation alignment.
 */

/**
 * Catmull-Rom Interpolation between four points.
 * t goes from 0.0 to 1.0 (between p1 and p2).
 */
export function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
  );
}

/**
 * Generates a smooth path of points between the given control points using Catmull-Rom.
 */
export function interpolateSmoothPath(controlPoints: Point3D[], segmentsPerPair: number = 10): Point3D[] {
  if (controlPoints.length < 2) return controlPoints;

  const results: Point3D[] = [];
  
  // Extend points for boundary conditions
  const pts = [
    { ...controlPoints[0] }, // virtual p-1
    ...controlPoints,
    { ...controlPoints[controlPoints.length - 1] } // virtual pn+1
  ];

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];

    for (let j = 0; j < segmentsPerPair; j++) {
      const t = j / segmentsPerPair;
      results.push({
        x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
        y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
        z: catmullRom(p0.z, p1.z, p2.z, p3.z, t)
      });
    }
  }
  
  // Add last point
  results.push(controlPoints[controlPoints.length - 1]);
  
  return results;
}

/**
 * Computes the tangent-aligned rotation (yaw, pitch) for a set of points.
 * Mode: prev_next_points (uses neighbors for orientation).
 */
export function computeTangentAlignment(points: Point3D[], snapIncrement: number = 1): Point3D[] {
  return points.map((p, i) => {
    let next = points[i + 1] || p;
    let prev = points[i - 1] || p;
    
    // Fallback if at start/end
    if (i === 0) {
      next = points[i + 1] || p;
      prev = p;
    } else if (i === points.length - 1) {
      next = p;
      prev = points[i - 1] || p;
    }

    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const dz = next.z - prev.z;

    const lenXZ = Math.sqrt(dx * dx + dz * dz);
    
    // Yaw: Rotation around Y (In DayZ, 0 is North-ish, depends on map, but typically atan2(x, z))
    let yaw = Math.atan2(dx, dz) * (180 / Math.PI);
    
    // Pitch: Up/Down tilt
    let pitch = -Math.atan2(dy, lenXZ || 0.0001) * (180 / Math.PI);

    // Apply snapping
    if (snapIncrement > 0) {
      yaw = Math.round(yaw / snapIncrement) * snapIncrement;
      pitch = Math.round(pitch / snapIncrement) * snapIncrement;
    }

    // Guard against NaN
    if (isNaN(yaw)) yaw = p.yaw || 0;
    if (isNaN(pitch)) pitch = p.pitch || 0;

    return { ...p, yaw, pitch };
  });
}

/**
 * 🚂 FRENET-SERRET FRAME ENGINE (V2)
 * Computes Tangent, Normal, and Binormal for 3D paths.
 * Extracts high-fidelity Yaw, Pitch, and Roll with stabilization.
 */
export function computeFrenetSerretFrame(points: Point3D[], snapIncrement: number = 0.5): Point3D[] {
  if (points.length < 2) return points;

  // Initial Reference Up-Vector (Absolute Y-Up)
  let prevUp = { x: 0, y: 1, z: 0 };

  return points.map((p, i) => {
    const next = points[i + 1] || p;
    const prev = points[i - 1] || p;
    
    // 1. Tangent Vec (T)
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const tz = next.z - prev.z;
    const tLen = Math.sqrt(tx*tx + ty*ty + tz*tz) || 0.0001;
    const T = { x: tx/tLen, y: ty/tLen, z: tz/tLen };

    // 2. Binormal Vec (B) - Stabilized using previous Up-Vector (Parallel Transport)
    // B = T x prevUp (orthogonal to path and previous up)
    let bx = T.y * prevUp.z - T.z * prevUp.y;
    let by = T.z * prevUp.x - T.x * prevUp.z;
    let bz = T.x * prevUp.y - T.y * prevUp.x;
    let bLen = Math.sqrt(bx*bx + by*by + bz*bz);

    // Prevent axis flipping at vertical singularity (Gimbal Lock)
    if (bLen < 0.0001) {
      // Fallback: use Z as temporary ortho if path is perfectly vertical-Y
      bx = 1; by = 0; bz = 0;
      bLen = 1;
    }
    const B = { x: bx/bLen, y: by/bLen, z: bz/bLen };

    // 3. Normal Vec (N) - Up-Vector for this segment
    // N = B x T
    const nx = B.y * T.z - B.z * T.y;
    const ny = B.z * T.x - B.x * T.z;
    const nz = B.x * T.y - B.y * T.x;
    const N = { x: nx, y: ny, z: nz };

    // Update prevUp for next iteration (Stability Propagation)
    prevUp = N;

    // 4. Extract EULER Angles (Yaw, Pitch, Roll)
    // Yaw (Around Y): atan2(dx, dz)
    let yaw = Math.atan2(T.x, T.z) * (180 / Math.PI);
    
    // Pitch (Around X): elevation
    const lenXZ = Math.sqrt(T.x*T.x + T.z*T.z);
    let pitch = -Math.atan2(T.y, lenXZ) * (180 / Math.PI);

    // Roll (Around Z): twist relative to the horizon
    // Calculate the tilt of the Normal (Up) vector relative to the vertical
    // DayZ Roll maps to bank angle.
    let roll = Math.atan2(B.y, Math.sqrt(B.x*B.x + B.z*B.z)) * (180 / Math.PI);

    // 5. Apply Snap & Guards
    if (snapIncrement > 0) {
      yaw = Math.round(yaw / snapIncrement) * snapIncrement;
      pitch = Math.round(pitch / snapIncrement) * snapIncrement;
      roll = Math.round(roll / snapIncrement) * snapIncrement;
    }

    if (isNaN(yaw)) yaw = p.yaw || 0;
    if (isNaN(pitch)) pitch = p.pitch || 0;
    if (isNaN(roll)) roll = p.roll || 0;

    return { ...p, yaw, pitch, roll };
  });
}

/**
 * Checks for NaN values in specified fields.
 */
export function hasNaN(obj: any, fields: string[]): boolean {
  return fields.some(f => isNaN(obj[f]));
}
