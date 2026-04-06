export const SHAPE_LIBRARY = {
  sphere: "Layered rings, decreasing radius, perfect symmetry",
  dome: "Circular rings, smooth curvature, centered apex",
  cylinder: "Vertical stack of circular layers",
  disc: "Flat radial layer, perfect 360 symmetry",
  pyramid: "Triangular faces, stepped or smooth",
  tower: "Vertical stack, consistent footprint"
};

export function gen_sphere_pts(radius: number, segments: number) {
  // Pure mathematical template for 100% fidelity
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const lat = Math.PI / 2 - (Math.PI * i / segments);
    const r = radius * Math.cos(lat), y = radius * Math.sin(lat);
    for (let j = 0; j < segments * 2; j++) {
      const lon = 2 * Math.PI * j / (segments * 2);
      pts.push({ x: r * Math.cos(lon), y, z: r * Math.sin(lon) });
    }
  }
  return pts;
}
