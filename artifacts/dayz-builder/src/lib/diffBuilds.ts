import { DayZObject } from "./dayzParser";
import { PipelineContext } from "./pipeline";

/**
 * 🔍 BUILD DIFF ENGINE
 * Compares two build states to identify structural changes, additions, and removals.
 */

export interface BuildDiff {
  added: DayZObject[];
  removed: DayZObject[];
}

export function diffBuilds(beforeCtx: PipelineContext, afterCtx: PipelineContext): BuildDiff {
  const serialize = (o: DayZObject) => `${o.name}|${o.pos.map(p => p.toFixed(2)).join(',')}|${o.ypr.map(r => r.toFixed(2)).join(',')}`;
  
  const beforeSet = new Set(beforeCtx.objects_final.map(o => serialize(o)));
  const afterSet = new Set(afterCtx.objects_final.map(o => serialize(o)));

  const added: DayZObject[] = [];
  const removed: DayZObject[] = [];

  afterCtx.objects_final.forEach(o => {
    if (!beforeSet.has(serialize(o))) {
      added.push(o);
    }
  });

  beforeCtx.objects_final.forEach(o => {
    if (!afterSet.has(serialize(o))) {
      removed.push(o);
    }
  });

  return { added, removed };
}
