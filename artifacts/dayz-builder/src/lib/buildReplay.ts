
export interface ReplayStep {
  stage: string;
  objects: any[];
}

export function getReplaySteps(ctx: any): ReplayStep[] {
  return ctx.replaySteps || [];
}

export function pushReplayStep(ctx: any, stage: string) {
  ctx.replaySteps = ctx.replaySteps || [];
  ctx.replaySteps.push({
    stage,
    objects: JSON.parse(JSON.stringify(ctx.objects_final || ctx.objects || []))
  });
}
