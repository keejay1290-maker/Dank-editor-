
export type StressScenario = "50_players" | "100_ai" | "pvp_heavy" | "explosions";

export interface StressResult {
  scenario: StressScenario;
  estimatedCost: number;
  predictedTier: string;
}

export function estimateStress(ctx: any, scenario: StressScenario): StressResult {
  const baseCost = ctx.performance?.cost || 0;
  let multiplier = 1.0;
  
  switch (scenario) {
    case "50_players":   multiplier = 1.35; break;
    case "100_ai":       multiplier = 1.60; break;
    case "pvp_heavy":    multiplier = 1.50; break;
    case "explosions":   multiplier = 1.45; break;
  }
  
  const estimatedCost = baseCost * multiplier;
  
  let tier = "S";
  if (estimatedCost > 8000) tier = "D";
  else if (estimatedCost > 6000) tier = "C";
  else if (estimatedCost > 4000) tier = "B";
  else if (estimatedCost > 2500) tier = "A";
  
  return { scenario, estimatedCost, predictedTier: tier };
}
