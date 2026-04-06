/**
 * 🛰️ DANKVAULT™ AUTO-REPAIR MODULE
 * Corrects malformed coordinates, rotations, names, scale, and composite JSON.
 */

import { DayZObject } from "./dayzParser";
import { PipelineContext } from "./pipeline";

if (!(globalThis as any).__DANKVAULT_AUTOREPAIR__) {
  (globalThis as any).__DANKVAULT_AUTOREPAIR__ = true;

  // ---------------------------------------------
  // 1. SAFE HELPERS
  // ---------------------------------------------
  function safeVec3(v: any, fallback: number[] = [0, 0, 0]): number[] {
    if (!Array.isArray(v) || v.length !== 3) return [...fallback];
    return v.map(n => {
        const val = Number(n);
        return Number.isFinite(val) ? val : 0;
    });
  }

  function safeYPR(v: any): number[] {
    return safeVec3(v, [0, 0, 0]);
  }

  function safeScale(s: any): number {
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return n;
  }

  function safeName(name: any): string {
    if (typeof name !== "string" || !name.trim()) {
      return "land_misc_concreteblock_damaged_f";
    }
    return name.trim();
  }

  function repairObject(o: any): DayZObject {
    return {
      ...o,
      pos: safeVec3(o.pos || o.position || [0, 0, 0]),
      ypr: safeYPR(o.ypr || o.rotation || [0, 0, 0]),
      scale: safeScale(o.scale),
      name: safeName(o.name || o.className)
    };
  }

  /**
   * 🛠️ REPAIR OBJECT ARRAY
   * Sanitizes every object in a build configuration.
   */
  (globalThis as any).repairObjectArray = function repairObjectArray(arr: any[]): DayZObject[] {
    if (!Array.isArray(arr)) return [];
    return arr.map(repairObject);
  };

  /**
   * 🛠️ REPAIR PIPELINE CONTEXT GEOMETRY
   * Ensures all objects in the context are correctly formed.
   */
  (globalThis as any).repairCtxGeometry = function repairCtxGeometry(ctx: PipelineContext, label: string = "UNKNOWN") {
    if (!ctx) return;

    if (Array.isArray(ctx.objects)) {
        ctx.objects = (globalThis as any).repairObjectArray(ctx.objects);
    }
    
    if (Array.isArray(ctx.objects_final)) {
        ctx.objects_final = (globalThis as any).repairObjectArray(ctx.objects_final);
    }

    console.log(`[AUTOREPAIR_CTX] ${label} pass complete.`, {
      objects: ctx.objects?.length || 0,
      objects_final: ctx.objects_final?.length || 0
    });
  };

  console.log("DankVault™ Auto-Repair Module Initialized (Real-time coordinate and structural remediation active).");
}

export const repairObjectArray = (globalThis as any).repairObjectArray;
export const repairCtxGeometry = (globalThis as any).repairCtxGeometry;
