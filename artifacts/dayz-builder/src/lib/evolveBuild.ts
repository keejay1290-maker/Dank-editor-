import { PipelineContext, executePipeline } from "./pipeline";
import { getShapePoints } from "./shapeGenerators";

/**
 * 🧬 BUILD EVOLUTION SYSTEM
 * Generates structural variants by mutating geometric DNA.
 */

export type EvolutionMode = "more_circular" | "more_fortified" | "more_sci_fi" | "more_minimal" | "more_detailed" | "lower_object_count";

export async function evolveBuild(ctx: PipelineContext, mode: EvolutionMode): Promise<PipelineContext> {
  const clone: PipelineContext = JSON.parse(JSON.stringify(ctx));
  const buildName = (ctx.params.buildName || "evolved_variant");
  
  switch (mode) {
    case "more_circular":
      clone.params.circularity = (clone.params.circularity || 0) + 0.2;
      break;
    
    case "more_fortified":
      clone.params.layers = (clone.params.layers || 1) + 1;
      clone.params.thickness = (clone.params.thickness || 1) * 1.5;
      break;

    case "more_sci_fi":
      clone.theme = "death_star";
      break;

    case "more_minimal":
      clone.params.radius = (clone.params.radius || 10) * 0.8;
      clone.params.density = (clone.params.density || 1) * 0.7;
      break;

    case "more_detailed":
        clone.params.fillClutter = true;
        break;

    case "lower_object_count":
        clone.params.safeBudget = true;
        break;
  }

  // RE-RUN PIPELINE
  return executePipeline(
      `evolve-${buildName}`, 
      clone.theme, 
      0, 
      clone.params, 
      () => getShapePoints(clone.params.shape || ctx.shape_normalised, clone.params)
  );
}
