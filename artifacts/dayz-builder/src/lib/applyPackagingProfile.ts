import { PipelineContext } from "./pipeline";
import { getObjectPerformanceCost } from "./profileBuildPerformance";

/**
 * 📦 BUILD PACKAGING PROFILES
 * Filters and optimizes builds for specific console deployment tiers.
 */

export type PackagingProfile = "default" | "console_safe" | "high_fidelity" | "budget" | "pvp" | "rp";

export function applyPackagingProfile(ctx: PipelineContext, profileName: PackagingProfile): PipelineContext {
  const clone: PipelineContext = JSON.parse(JSON.stringify(ctx));
  const objects = clone.objects_final;

  switch (profileName) {
    case "console_safe":
        // Max 1800 objects, skip high-cost interior props
        clone.objects_final = objects
            .filter(obj => getObjectPerformanceCost(obj.name) < 5.0)
            .slice(0, 1800);
        break;

    case "budget":
        // Max 1200 objects, aggressive culling
        clone.objects_final = objects.filter((_, i) => i % 2 === 0).slice(0, 1200);
        break;

    case "pvp":
        // Remove tiny props, keep structural cover
        clone.objects_final = objects.filter(obj => !(obj.name || "").toLowerCase().includes("prop_") && !(obj.name || "").toLowerCase().includes("misc_"));
        break;

    case "rp":
        // Keep everything for detail
        break;

    case "high_fidelity":
        // Preserve all complexity
        break;

    default:
        break;
  }

  return clone;
}
