import { createRoot } from "react-dom/client";

// --- DANKVAULT GLOBAL STABILITY PATCH (CONTRACT SECTION 6) ---
const originalRequestPointerLock = Element.prototype.requestPointerLock;
Element.prototype.requestPointerLock = function(options?: PointerLockOptions): Promise<void> {
  if (this && this.isConnected && document.body.contains(this)) {
    return originalRequestPointerLock.apply(this, [options]) as Promise<void>;
  } else {
    console.warn("[DANKVAULT] Blocked requestPointerLock on disconnected element to prevent UI crash.");
    return Promise.resolve();
  }
};

const originalExitPointerLock = document.exitPointerLock;
document.exitPointerLock = function(): void {
  if (document.pointerLockElement) {
    originalExitPointerLock.apply(document);
  }
};

import { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import App from "./App";
import HomePage from "./HomePage";
import DankTypesEditor from "./tools/DankTypesEditor";
import DankLoadoutBuilder from "./tools/DankLoadoutBuilder";
import DankWeatherGenerator from "./tools/DankWeatherGenerator";
import DankGlobalsGenerator from "./tools/DankGlobalsGenerator";
import DankGameplayConfig from "./tools/DankGameplayConfig";
import DankCoordsTool from "./tools/DankCoordsTool";
import DankSpawnMaker from "./tools/DankSpawnMaker";
import DankRelocator from "./tools/DankRelocator";
import DankSplitter from "./tools/DankSplitter";
import DankValidator from "./tools/DankValidator";
import DankServerDNA from "./tools/DankServerDNA";
import DankMissionPackager from "./tools/DankMissionPackager";
import DankLootBalancer from "./tools/DankLootBalancer";
import DankTimeline from "./tools/DankTimeline";
import DankClassnameSearch from "./tools/DankClassnameSearch";
import DankBasePlanner from "./tools/DankBasePlanner";
import DankNitradoHelper from "./tools/DankNitradoHelper";
import "./index.css";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { safeBootstrap } from "./bootstrap/safeBootstrap";
import { APPLY_DANKVAULT_GLOBAL_BUILDER_PIPELINE } from "./lib/ai/bootstrap/loadAI";
import "./lib/shapeAnalyzer";
import "./lib/prebuildRestoration";
import "./lib/prebuildEnhancer";
import "./lib/advancedSystems";
import "./lib/ultraIntelligence";
import "./lib/metaIntelligence";
import { COMPLETED_BUILDS } from "./lib/completedBuilds";

// ─── Electron update notification banner ─────────────────────────────────────
// Only active when running inside Electron (window.electronAPI is injected by preload)
declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      appVersion: string;
      onUpdateAvailable: (cb: (info: { version: string }) => void) => void;
      onUpdateDownloaded: (cb: (info: { version: string }) => void) => void;
      installUpdate: () => void;
    };
  }
}

function UpdateBanner() {
  const [state, setState] = useState<"idle" | "available" | "downloaded">("idle");
  const [version, setVersion] = useState("");

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onUpdateAvailable(({ version: v }) => {
      setState("available");
      setVersion(v);
    });
    window.electronAPI.onUpdateDownloaded(({ version: v }) => {
      setState("downloaded");
      setVersion(v);
    });
  }, []);

  if (state === "idle") return null;

  return (
    <div style={{
      position: "fixed", bottom: 16, right: 16, zIndex: 9999,
      background: state === "downloaded" ? "#27ae60" : "#d4a017",
      color: "#0a0804", fontFamily: "monospace", fontSize: 11,
      fontWeight: "bold", padding: "8px 14px", borderRadius: 3,
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
    }}>
      {state === "downloaded"
        ? `✓ v${version} ready — installs on next restart`
        : `⬇ Downloading update v${version}…`}
      {state === "downloaded" && (
        <button
          onClick={() => window.electronAPI?.installUpdate()}
          style={{
            background: "#0a0804", color: "#27ae60", border: "none",
            padding: "3px 10px", fontFamily: "monospace", fontSize: 10,
            fontWeight: "bold", cursor: "pointer", borderRadius: 2,
          }}
        >
          Restart now
        </button>
      )}
    </div>
  );
}

// Suppress the "ResizeObserver loop limit exceeded" non-error that browsers
// emit as a non-Error object — Replit's sandbox catches it and reports a crash,
// but it is a benign browser warning, not an actual app failure.
const _origError = window.onerror;
window.onerror = (msg, src, line, col, err) => {
  if (typeof msg === "string" && msg.includes("ResizeObserver loop")) return true;
  return _origError ? _origError(msg, src, line, col, err) : false;
};
window.addEventListener("error", e => {
  if (e.message && e.message.includes("ResizeObserver loop")) { e.stopImmediatePropagation(); e.preventDefault(); }
}, true);

// ─── INITIALIZE DANKVAULT™ GLOBAL BUILDER PIEPLINE ─────────────────────────
safeBootstrap(() => {
  APPLY_DANKVAULT_GLOBAL_BUILDER_PIPELINE({
    engines: {
      universal_prebuild_engine: true,
      universal_shape_library: true,
      universal_material_palette: true,
      universal_object_family_map: true,
      bunker_connection_engine: true,
      maze_engine: true,
      racetrack_engine: true,
      construction_zone_engine: true,
      symmetry_engine: true,
      proportion_engine: true,
      auto_fix_engine: true,
      preview_compatibility_engine: true,
      visual_fidelity_engine: {
        enable: true,
        targets: ["taj_mahal", "death_star", "helms_deep", "azkaban", "colosseum", "custom"],
        reference_images: {
          enable_lookup: true,
          sources: ["google_images", "local_refs", "cdn_cache"],
          mode: "SILHOUETTE_FIRST",
          fallback_when_missing: "PROFILE"
        },
        silhouette_extraction: {
          enable: true,
          outputs: ["outlinePoints", "heightWidthRatio", "symmetryAxes"],
          symmetryAxes: { detect_vertical: true, detect_horizontal: true, detect_radial: true }
        },
        feature_detection: {
          enable: true,
          features: ["domes", "towers", "rings", "trenches", "arches", "tiers"],
          tolerance: { count_delta: 1, allow_minor_variants: true }
        },
        shape_comparison: {
          enable: true,
          metrics: { heightWidthRatio_maxDelta: 0.10, outlinePenalty_max: 0.15, symmetry_required_when_reference_has_it: true },
          scoring: { base: 1.0, ratio_penalty_cap: 0.30, outline_penalty_cap: 0.30, symmetry_penalty: 0.20, feature_issue_penalty: 0.05, min_score: 0.0 }
        },
        auto_correction: {
          enable: true,
          min_score_threshold: 0.80,
          severity_mode: "MAJOR_FIRST",
          corrections: [
            "ADJUST_DOME_COUNT", "ADJUST_TOWER_COUNT", "ADJUST_RING_COUNT", "ADJUST_TRENCH_PRESENCE",
            "ADJUST_ARCH_COUNT", "ADJUST_TIERING", "ADJUST_HEIGHT_WIDTH_RATIO", "ENFORCE_SYMMETRY_WHEN_REQUIRED",
            "ALIGN_SILHOUETTE_TO_REFERENCE"
          ],
          integration_points: {
            use_shape_library: true, use_universal_prebuild_engine: true,
            use_bunker_connection_engine_when_bunker: true, use_symmetry_engine: true,
            use_proportion_engine: true, use_fidelity_engine_existing: true
          }
        }
      }
    },
    pipeline: {
      name: "GLOBAL_DANKVAULT_BUILDER_PIPELINE",
      order: [
        "universal_prebuild_engine", "universal_shape_library", "universal_material_palette", "universal_object_family_map",
        "bunker_connection_engine", "maze_engine", "racetrack_engine", "construction_zone_engine",
        "symmetry_engine", "proportion_engine", "visual_fidelity_engine", "auto_fix_engine", "preview_compatibility_engine"
      ],
      apply_to_builders: {
        BunkerMaker: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "bunker" },
        MazeMaker: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "maze" },
        RaceTrackMaker: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "racetrack" },
        PrebuildMaker: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "prebuild" },
        ConstructionZoneGenerator: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "construction_zone" },
        MonumentProfiles: {
          TajMahal: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "taj_mahal" },
          DeathStar: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "death_star" },
          HelmsDeep: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "helms_deep" },
          Azkaban: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "azkaban" },
          Colosseum: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "colosseum" },
          CustomHybrid: { route: "GLOBAL_DANKVAULT_BUILDER_PIPELINE", type: "custom" }
        }
      }
    },
    reasoning_layers: { claude_structured_reasoning: true, copilot_chain_of_thought_suppression: true, spatial_reasoning_engine: true, optimisation_engine: true, memory_consistency_engine: true },
    compliance: { object_only_rule: true, gold_standard_json: true, naming_restoration: true, loot_injection: true, high_fidelity_geometry: true, enforce_real_world_accuracy: true, enforce_profile_consistency: true, never_fallback_to_legacy_shape_generators: true },
    diagnostics: { hook_into: "RUN_FULL_DANKVAULT_DIAGNOSTIC", include_in_reports: true, fail_if_fidelity_score_below: 0.70, warn_if_fidelity_score_below: 0.85, fields: ["builder_name", "target_profile", "fidelity_score", "issues", "applied_corrections", "before_after_shape_summary"] }
  });

  // 🛰️ RESTORE ARCHITECTURAL PREBUILDS
  (globalThis as any).restorePrebuilds(COMPLETED_BUILDS);

  // 🚀 MOUNT REACT APPLICATION
  createRoot(document.getElementById("root")!).render(
    <GlobalErrorBoundary>
      <Router>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/editor" component={App} />
          <Route path="/types" component={DankTypesEditor} />
          <Route path="/loadout" component={DankLoadoutBuilder} />
          <Route path="/weather" component={DankWeatherGenerator} />
          <Route path="/globals" component={DankGlobalsGenerator} />
          <Route path="/gameplay" component={DankGameplayConfig} />
          <Route path="/coords" component={DankCoordsTool} />
          <Route path="/spawns" component={DankSpawnMaker} />
          <Route path="/relocator" component={DankRelocator} />
          <Route path="/splitter" component={DankSplitter} />
          <Route path="/validator" component={DankValidator} />
          <Route path="/dna" component={DankServerDNA} />
          <Route path="/packager" component={DankMissionPackager} />
          <Route path="/lootbalancer" component={DankLootBalancer} />
          <Route path="/timeline" component={DankTimeline} />
          <Route path="/classnames" component={DankClassnameSearch} />
          <Route path="/baseplanner" component={DankBasePlanner} />
          <Route path="/nitrado" component={DankNitradoHelper} />
          <Route component={HomePage} />
        </Switch>
      </Router>
      <UpdateBanner />
    </GlobalErrorBoundary>
  );
});
