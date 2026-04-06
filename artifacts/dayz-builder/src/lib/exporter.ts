import { DayZObject } from "./dayzParser";
import { PipelineContext } from "./pipeline";

/**
 * 📦 DANKVAULT™ EXPORT ENGINE
 * Handles generation of multi-part zip packages for large builds.
 */

export interface ExportFile {
  name: string;
  content: string;
}

export interface ExportPackage {
  jsonFiles: ExportFile[];
  initcFiles: ExportFile[];
  readme?: ExportFile;
}

export function generateExportPackage(ctx: PipelineContext): ExportPackage {
  const buildName = (ctx.params.buildName || "DankBuild").replace(/\s+/g, "_");
  const finalObjects = ctx.objects_final;

  // 🛡️ EXPORT GUARD
  finalObjects.forEach((obj, i) => {
    if (obj.name === "neutral_structural" || obj.name === "wall" ||
        obj.name === "decorative" || obj.name === "centrepiece") {
      console.warn(`[EXPORT_GUARD] Unresolved logical name at index ${i}: "${obj.name}". Resetting to Land_Container_1Bo.`);
      obj.name = "Land_Container_1Bo";
    }
  });

  const pkg: ExportPackage = {
    jsonFiles: [],
    initcFiles: []
  };

  // 🏗️ CONSOLE-READY SINGLE FILE EXPORT
  const objs = finalObjects;
  
  // JSON
  const jsonContent = JSON.stringify({ 
      Metadata: {
          Build: buildName,
          ObjectCount: objs.length,
          PerformanceWarning: objs.length > 2000 ? "HIGH_OBJECT_COUNT_DETECTED" : "OPTIMIZED",
          Timestamp: new Date().toISOString()
      },
      Objects: objs.map(obj => ({
          name: obj.name,
          pos: [parseFloat(obj.pos[0].toFixed(6)), parseFloat(obj.pos[1].toFixed(6)), parseFloat(obj.pos[2].toFixed(6))],
          ypr: [parseFloat(obj.ypr[0].toFixed(6)), parseFloat(obj.ypr[1].toFixed(6)), parseFloat(obj.ypr[2].toFixed(6))],
          scale: obj.scale ? parseFloat(obj.scale.toFixed(6)) : 1.0
      })) 
  }, null, 2);

  pkg.jsonFiles.push({
    name: `${buildName}.json`,
    content: jsonContent
  });

  // Init.c
  pkg.initcFiles.push({
    name: `${buildName}_init.c`,
    content: generateInitC(objs, buildName)
  });

  // README (If applicable, though console players usually just want the code)
  if (ctx.metadata.split_readme) {
    pkg.readme = {
      name: `${buildName}_README.txt`,
      content: ctx.metadata.split_readme
    };
  }

  return pkg;
}

function generateInitC(objects: DayZObject[], buildName: string): string {
  let content = `// 🏗️ DANKVAULT™ MASTERPIECE: ${buildName}\n`;
  content += `// Registered Objects: ${objects.length}\n`;
  if (objects.length > 2000) {
    content += `// ⚠️ PERFORMANCE WARNING: High object count (>2000). Console server performance may be impacted.\n`;
    content += `// ℹ️ TIP: Consider breaking this build into smaller sections or using larger structural pieces.\n`;
  }
  content += "\n";
  content += `void Spawn${buildName}(PlayerBase player) {\n`;
  objects.forEach(obj => {
    const p = obj.pos;
    const o = obj.ypr;
    const s = obj.scale || 1.0;
    content += `  SpawnObject("${obj.name}", "${p[0].toFixed(3)} ${p[1].toFixed(3)} ${p[2].toFixed(3)}", "${o[0].toFixed(6)} ${o[1].toFixed(6)} ${o[2].toFixed(6)}", ${s.toFixed(2)});\n`;
  });
  content += "}\n\n";
  content += "// Paste the helper SpawnObject function into your mission init.c if not already present.\n";
  return content;
}

export function generateJsonExport(ctx: PipelineContext): string {
  const pkg = generateExportPackage(ctx);
  return pkg.jsonFiles[0]?.content || "";
}

export function generateInitCExport(ctx: PipelineContext): string {
  const pkg = generateExportPackage(ctx);
  return pkg.initcFiles[0]?.content || "";
}

export function downloadFile(content: string, fileName: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


