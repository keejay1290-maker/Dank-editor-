import { DayZObject } from "./dayzParser";
import { PipelineContext } from "./pipeline";

/**
 * 🧹 BUILD CLEANUP WIZARD
 * Automated system for removing duplicate, overlapping, and structural failures.
 */

export function cleanupBuild(ctx: PipelineContext): PipelineContext {
    const clone: PipelineContext = JSON.parse(JSON.stringify(ctx));
    clone.objects_final = removeDuplicateObjects(clone.objects_final);
    clone.objects_final = removeExactOverlaps(clone.objects_final);
    clone.objects_final = fixFloatingObjects(clone.objects_final);
    clone.objects_final = normalizeRotations(clone.objects_final);
    return clone;
}

function removeDuplicateObjects(objects: DayZObject[]): DayZObject[] {
    const seen = new Set<string>();
    return objects.filter(obj => {
        const key = `${obj.name}|${obj.pos.join(',')}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function removeExactOverlaps(objects: DayZObject[]): DayZObject[] {
    const seen = new Set<string>();
    return objects.filter(obj => {
        const key = obj.pos.map(p => p.toFixed(3)).join(',');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function fixFloatingObjects(objects: DayZObject[]): DayZObject[] {
    return objects.map(obj => ({
        ...obj,
        pos: [obj.pos[0], Math.max(obj.pos[1], 0.1), obj.pos[2]] as [number, number, number]
    }));
}

function normalizeRotations(objects: DayZObject[]): DayZObject[] {
    return objects.map(obj => ({
        ...obj,
        ypr: [
            parseFloat(obj.ypr[0].toFixed(3)),
            parseFloat(obj.ypr[1].toFixed(3)),
            parseFloat(obj.ypr[2].toFixed(3))
        ] as [number, number, number]
    }));
}
