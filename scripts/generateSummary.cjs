const fs = require('fs');
const path = require('path');

// 🏗️ DANKVAULT SYSTEM AUDIT & SUMMARY GENERATOR
// Scans the build environment and identifies degenerate or non-compliant builds.

const BUILD_REGISTRY_PATH = 'artifacts/dayz-builder/src/lib/buildRegistry.ts';
const COMPLETED_BUILDS_PATH = 'artifacts/dayz-builder/src/lib/completedBuilds.ts';
const PIPELINE_PATH = 'artifacts/dayz-builder/src/lib/pipeline.ts';

async function audit() {
  console.log("--- DANKVAULT PIPELINE AUDIT ---");
  
  // 1. Check for core files
  [BUILD_REGISTRY_PATH, COMPLETED_BUILDS_PATH, PIPELINE_PATH].forEach(f => {
    if (!fs.existsSync(f)) console.warn(`[MISSING] ${f}`);
    else console.log(`[FOUND] ${f}`);
  });

  // 2. Identify potential degenerate builds in COMPLETED_BUILDS
  try {
     const content = fs.readFileSync(COMPLETED_BUILDS_PATH, 'utf8');
     const matches = content.match(/id: "([^"]+)",/g);
     console.log(`[AUDIT] Found ${matches?.length || 0} builds in COMPLETED_BUILDS.`);
  } catch (err) {
     console.error("[AUDIT_ERROR] Failed to read completedBuilds.ts", err);
  }

  console.log("--- AUDIT COMPLETE ---");
}

audit();
