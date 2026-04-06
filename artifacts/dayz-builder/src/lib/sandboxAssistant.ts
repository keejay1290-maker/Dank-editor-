
export interface Insight {
  id: string;
  text: string;
  type: "warning" | "suggestion" | "error";
}

export function generateBuildInsights(ctx: any): string[] {
  const insights: string[] = [];
  
  const metrics = ctx.metrics;
  const introspection = ctx.introspection;
  const performance = ctx.performance;
  const annotations = ctx.annotations;
  
  if (metrics?.deadEnds > 10) {
    insights.push("This build has many dead ends. Consider adding more loops or alternate paths.");
  }
  
  if (metrics?.chokePoints > 8) {
    insights.push("High number of choke points detected — excellent for PvP, but may hinder smooth exploration.");
  }
  
  if (performance?.tier === "D") {
    insights.push("Performance tier D: Apply 'Console Safe' or 'Budget' packaging profile before exporting.");
  }
  
  if (introspection?.floatingObjects?.length > 0) {
    insights.push(`Detected ${introspection.floatingObjects.length} potentially floating objects. Run Cleanup Wizard.`);
  }
  
  if (annotations?.entrances?.length < 2) {
    insights.push("Limited entry points detected. Adding secondary entrances can improve navigation flow.");
  }
  
  if (insights.length === 0) {
    insights.push("Structural integrity verified. Build is optimized for deployment.");
  }
  
  return insights;
}
