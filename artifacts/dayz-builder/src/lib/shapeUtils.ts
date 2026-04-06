/**
 * 🛰️ DANKVAULT™ SHAPE VOCABULARY & UTILITIES (Circular Dependency Shield)
 * Contains the canonical shape vocabulary and identification logic.
 */

export const CANONICAL_SHAPES = [
    "sphere", "ring", "disc", "tower", "spoke_hub", "cross", "grid", 
    "arc", "line", "cluster", "mech_core", "orbital_station"
];

/**
 * 🏗️ IDENTIFY SHAPE ARCHETYPE
 * Maps architectural terms to canonical core shapes.
 */
export function identifyShapeArchetype(name: string): string {
    if (!name) return "cluster";
    const s = name.toLowerCase().trim();

    // 1. Direct matches first
    for (const canonical of CANONICAL_SHAPES) {
        if (s.includes(canonical)) return canonical;
    }

    // 2. Specific Masterpiece matches (Fixed Section 7)
    if (s.includes("falcon")) return "millennium_falcon";
    if (s.includes("torus")) return "torus";
    if (s.includes("star_fort") || s.includes("star fort") || s.includes("fort")) {
        if (s.includes("star")) return "star_fort";
    }

    // 3. Architectural identification patterns
    if (s.includes("ufo") || s.includes("saucer")) return "disc";
    if (s.includes("dna") || s.includes("double") || s.includes("helix")) return "line";
    if (s.includes("spire") || s.includes("pylon") || s.includes("obelisk")) return "tower";
    if (s.includes("satellite") || s.includes("repeater") || s.includes("array")) return "spoke_hub";
    if (s.includes("bio") || s.includes("organic") || s.includes("crashed")) return "cluster";
    if (s.includes("station") || s.includes("platform") || s.includes("orbital")) return "orbital_station";

    return "cluster";
}
