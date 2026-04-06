import { RegistryBuild } from "./buildRegistry";

/**
 * 📊 HEALTH-BASED SORTING ENGINE
 * Optimized for architectural quality control and fleet management.
 */
export type SortMode = "health-desc" | "health-asc" | "status" | "object-count" | "name" | "category";

export function sortBuilds(builds: any[], mode: SortMode): any[] {
    const list = [...builds];

    // Status Ranking (0: PASS, 1: FAIL)
    const statusRank = (b: any) => {
        const status = b.metadata?.validationStatus || (b.health >= 40 ? "PASS" : "FAIL");
        return status === "PASS" ? 0 : 2; // FAIL = 2, WARN (legacy/unused) = 1
    };

    switch (mode) {
        case "health-desc":
            return list.sort((a, b) => (b.metadata?.healthScore || 0) - (a.metadata?.healthScore || 0));
        
        case "health-asc":
            return list.sort((a, b) => (a.metadata?.healthScore || 0) - (b.metadata?.healthScore || 0));
        
        case "status":
            return list.sort((a, b) => statusRank(a) - statusRank(b));
        
        case "object-count":
            return list.sort((a, b) => (b.objectCount || 0) - (a.objectCount || 0));
        
        case "name":
            return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            
        case "category":
            return list.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
        
        default:
            return list;
    }
}
