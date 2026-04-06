/**
 * 🏗️ DANKVAULT™ MASTER BUILD RULESET
 * Absolute Source of Truth for Build Pipelines & Enforcement.
 */

export const MASTER_RULESET = {
  patch: "GLOBAL_TOTAL_COVERAGE_V3_COMPLETE",
  scope: "ALL_BUILDS_AND_PREBUILDS",
  
  // ⚡ DANKVAULT™ META TOGGLES (CONTRACT SECTION 7)
  meta_toggles: {
    enabled: true,
    pipeline_map: true,
    stage_counters: true,
    inspector: true,
    family_preview: true,
    meta_extensions: true
  },

  // 🏗️ SHAPE, GEOMETRY, AND VALIDATION
  shape_registry: {
    enforce: true,
    shapes: {
      composite_shape: {
        type: "composite",
        supports_hollow_shell: false,
        curvature_critical: false
      },
      azkaban_prison: { type: "complex" },
      stargate_portal: { type: "complex" },
      helms_deep: { type: "complex" },
      jurassic_park_gate: { type: "complex" },
      nakatomi_plaza: { type: "complex" },
      full_sphere: {
        type: "sphere",
        generator: "gen_sphere",
        supports_hollow_shell: true,
        curvature_critical: true
      },
      fullsphere: { alias_of: "full_sphere" },
      complete_sphere: { alias_of: "full_sphere" },
      sphere_full: { alias_of: "full_sphere" },
      sphere: { alias_of: "full_sphere" },
      matrix_zion_dock: { type: "complex" },
      tardis: { type: "complex" },
      nuketown: { type: "complex" },
      dust2_a_site: { type: "complex" },
      peach_castle: { type: "complex" },
      shinra_hq: { type: "complex" },
      halo_control_room: { type: "complex" },
      colosseum: { type: "complex" },
      golden_gate_bridge: { type: "complex" },
      normandy_bunkers: { type: "complex" },
      the_pentagon: { type: "complex" },
      pyramid_giza: { type: "complex" },
      taj_mahal: { type: "complex" },
      stonehenge: { type: "complex" },
      starship_enterprise: { type: "complex" },
      star_destroyer: { type: "complex" },
      king_kong_empire: { type: "complex" },
      deathstar: { 
        type: "sphere",
        curvature_critical: true,
        silhouette_locked: true,
        alias_of: "death_star"
      },
      death_star: {
        type: "sphere",
        curvature_critical: true,
        silhouette_locked: true
      },
      hemisphere: { type: "complex" },
      torus: { type: "complex" },
      disc: { type: "complex" },
      helix: { type: "complex" },
      cone: { type: "complex" },
      cylinder: { type: "complex" },
      hyperboloid: { type: "complex" },
      mobius: { type: "complex" },
      icosphere: { type: "complex" },
      millennium_falcon: { type: "complex" },
      orbital_station: { type: "complex" },
      reactor_core: { type: "composite" },
      sci_fi_gate: { type: "composite" },
      dna_double: { type: "complex" },
      mech_bipedal: { type: "composite" },
      t800_endoskeleton: { type: "composite" },
      atat_walker: { type: "composite", alias_of: "at_at_walker" },
      at_at_walker: { type: "composite" },
      borg_cube: { type: "complex" },
      eye_of_sauron: { type: "composite" },
      mech_minigun: { type: "composite" },
      mech_walker: { type: "composite" },
      cannon_turret: { type: "composite" },
      body_skull: { type: "complex" },
      body_hand: { type: "complex" },
      body_ribcage: { type: "complex" },
      body_spine: { type: "complex" },
      body_eye: { type: "complex" },
      body_humanoid: { type: "complex" },
      body_arm: { type: "complex" },
      body_leg: { type: "complex" },
      body_ball_joint: { type: "complex" },
      bastion_round: { type: "complex" },
      bastion_square: { type: "complex" },
      tower: { type: "complex" },
      prison_tower: { type: "complex" },
      azkaban_tower: { type: "complex" },
      wall_line: { type: "complex" },
      wall_arc: { type: "complex" },
      star_fort: { type: "complex" },
      tunnel_circle: { type: "complex" },
      tunnel_square: { type: "complex" },
      tunnel_hex: { type: "complex" },
      pyramid_stepped: { type: "complex" },
      grid_flat: { type: "complex" },
      staircase: { type: "complex" },
      pyramid: { type: "complex" },
      ring_platform: { type: "complex" },
      cross: { type: "complex" },
      arrow: { type: "complex" },
      letter_D: { type: "complex" },
      letter_Z: { type: "complex" },
      volcano: { type: "complex" },
      celtic_ring: { type: "complex" },
      treehouse: { type: "complex" },
      checkpoint: { type: "complex" },
      watchtower_post: { type: "complex" },
      fuel_depot: { type: "complex" },
      sniper_nest: { type: "complex" },
      farmstead: { type: "complex" },
      survivor_camp: { type: "complex" },
      bunker_line: { type: "complex" },
      power_relay: { type: "complex" },
      radio_outpost: { type: "complex" },
      tf_bumblebee: { type: "composite" },
      tf_optimus: { type: "composite" },
      tf_ironhide: { type: "composite" },
      tf_jazz: { type: "composite" },
      tf_ratchet: { type: "composite" },
      tf_megatron: { type: "composite" },
      tf_starscream: { type: "composite" },
      dragon: { type: "composite" },
      pirate_ship: { type: "composite" },
      pvp_arena: { type: "composite" },
      helipad: { type: "composite" },
      arena_colosseum: { type: "composite" },
      arena_fort: { type: "composite" },
      arena_maze: { type: "composite" },
      arena_siege: { type: "composite" },
      arena_compound: { type: "composite" },
      iron_throne: { type: "composite" },
      wall_perimeter: { type: "complex" },
      gothic_arch: { type: "complex" },
      bridge_truss: { type: "complex" },
      amphitheater: { type: "complex" },
      vaulted_ceiling: { type: "complex" },
      minas_tirith_tier: { type: "composite" },
      minas_tirith_wall: { type: "composite" },
      helms_deep_gate: { type: "composite" },
      helms_deep_keep: { type: "composite" },
      zion_dock: { type: "composite" },
      airport_runway: { type: "composite" },
      crop_circle: { type: "composite" },
      bunker_hatch: { type: "composite" },
      military_fob: { type: "composite" },
      checkpoint_charlie: { type: "composite" },
      trench_network: { type: "composite" },
      deep_sea_oil_rig: { type: "composite" },
      panama_canal: { type: "composite" },
      bunker_entrance: { type: "composite" },
      generic: { type: "complex" },
      text: { type: "complex" },
      ring: { type: "complex" },
      cube: { type: "complex" },
      cluster: { type: "complex" },
      spoke_hub: { type: "complex" },
      line: { type: "complex" }
    },
    on_undefined_shape: "HARD_FAIL"
  },

  shape_validation: {
    enforce: true,
    checks: {
      no_inverted_normals: true,
      no_degenerate_segments: true,
      no_self_intersections: true,
      no_zero_radius_curves: true,
      no_zero_length_edges: true,
      no_malformed_splines: true,
      enforce_closed_geometry_for_spheres: true,
      max_triangle_aspect_ratio: 50,
      max_edge_length_ratio: 100
    },
    on_invalid_shape: "HARD_FAIL"
  },

  // 🏗️ GLOBAL OBJECT FAMILY RULES (CONDITIONAL ALLOWLIST)
  object_family_mapping: {
    enforce: true,
    on_mismatch: "HARD_FAIL",
    on_missing_family: "HARD_FAIL",
    global_forbid_families: [
      "land_bastion_castle",
      "land_castle_tower",
      "land_castle_gate",
      "land_bastion",
      "land_fortress",
      "land_ruins"
    ],
    conditional_allow_families: {
      "land_castle_wall": {
        allow_when_used_by_builders: [
          "wall_builder",
          "box_structure_builder",
          "modular_wall_builder",
          "structural_shell_builder"
        ],
        allow_when_usage_context: [
          "structural_wall",
          "box_structure",
          "rectilinear_enclosure",
          "load_bearing_wall"
        ],
        require_material_profile: "neutral_structural_strict",
        forbid_material_profiles: ["castle_theme_materials","ruins_theme_materials"],
        require_shape_types: ["line","corridor","trench","cylinder"],
        require_validation_checks: ["no_inverted_normals","no_degenerate_segments","no_self_intersections"],
        on_violation: "HARD_FAIL"
      }
    },
    fallback_family: "neutral_structural_strict",
    themes: {
      death_star: {
        wall_family: "scifi_hull",
        trench_family: "scifi_trench",
        detail_family: "scifi_greeble",
        forbid_families: [
          "prison_wall",
          "industrial_concrete",
          "wooden_fence",
          "land_bastion_castle",
          "land_castle_tower",
          "land_castle_gate",
          "land_bastion",
          "land_fortress",
          "land_ruins"
        ]
      },
      generic: {
        fallback_family: "neutral_structural",
        forbid_families: []
      }
    }
  },

  geometry_overrides: {
    death_star: {
      shape: "full_sphere",
      curvature_critical: true,
      silhouette_locked: true,
      radius_mode: "uniform",
      vertical_segments: "full_360",
      horizontal_segments: "full_360",
      enforce_closed_poles: true,
      enforce_equator_symmetry: true,
      allow_trench_cutout: true,
      forbid_hemisphere_mode: true
    }
  },

  // 🏗️ ROTATION, CURVE, AND STABILITY ENGINE
  rotation_and_curve_rules: {
    enforce: true,
    rotation: {
      mode: "FRENET_SERRET_FRAME",
      compute_from: "tangent_normal",
      fallback_mode: "TANGENT_ALIGNED",
      snap_to_increment_degrees: 0.5,
      stabilize_binormal: true,
      propagate_rotation_smoothly: true,
      prevent_axis_flipping: true,
      axis_stabilizer: {
        enable: true,
        clamp_angle_delta_degrees: 15,
        lock_initial_frame: true,
        smooth_rotation_blending: true,
        max_twist_per_meter_degrees: 10
      },
      on_nan: {
        action: "HARD_FAIL_SEGMENT",
        replace_with: "NONE",
        log_tag: "ROTATION_NAN_DETECTED"
      }
    },
    curves: {
      interpolation: "CATMULL_ROM",
      min_segment_length: 0.02,
      max_angle_step_degrees: 5,
      auto_insert_turn_markers: true,
      enforce_uniform_tessellation: true,
      adaptive_subdivision_threshold: 0.01
    },
    segment_rules: {
      require_non_zero_length: true,
      skip_zero_length_segments: true,
      on_zero_length: "LOG_AND_SKIP"
    }
  },

  // 🏗️ 3D PREVIEW / RENDERER
  preview_renderer: {
    renderer: {
      enable_high_precision_mode: true,
      use_gpu_accelerated_math: true,
      enforce_double_precision_vectors: true,
      enable_frustum_culling: true,
      enable_occlusion_culling: true,
      enable_dynamic_lod: true,
      lod_levels: [0.25, 0.5, 1.0, 2.0],
      async_mesh_generation: true,
      render_batching: true,
      gpu_instancing: true,
      instance_merging: true
    },
    shape_visualization: {
      enforce_shape_registry: true,
      use_uniform_tessellation_for_spheres: true,
      use_adaptive_tessellation_for_curves: true,
      use_closed_geometry_for_rings: true,
      forbid_hemisphere_rendering: true,
      enforce_full_sphere_rendering: true
    },
    rotation_visualizer: {
      enable: true,
      show_tangent_vectors: true,
      show_normal_vectors: true,
      show_binormal_vectors: true,
      smooth_rotation_interpolation: true,
      prevent_axis_flipping: true,
      debug_overlay: {
        enable: true,
        show_axis_gizmos: true,
        show_angle_deltas: true,
        highlight_instability_regions: true
      }
    },
    lighting_profiles: {
      enable: true,
      default_profile: "neutral_studio",
      profiles: {
        neutral_studio: { brightness: 1.0, contrast: 1.0, ambient: 0.5 },
        harsh_shadow:   { brightness: 1.2, contrast: 1.5, ambient: 0.2 },
        scifi_blue:     { tint: "#00aaff", brightness: 1.0, ambient: 0.6 }
      }
    },
    debug_modes: {
      wireframe: { enable: true, toggle_key: "F1", show_edges: true },
      fidelity_heatmap: { enable: true, toggle_key: "F2", map_from_fidelity_score: true },
      collision_preview: { enable: true, toggle_key: "F3", show_collision_boxes: true }
    },
    camera: {
      enable_dynamic_zoom_scaling: true,
      enable_collision_avoidance: true,
      smooth_interpolation_ms: 120
    }
  },

  // 🏗️ ADDITIONAL FEATURES & SAFEGUARDS
  physics_preview: {
    enable: true,
    collision_mesh_detail_levels: [0.5, 1.0, 2.0],
    simple_gravity_simulation: true
  },
  navmesh_and_pathing: {
    enable_navmesh_visualizer: true,
    show_navmesh: true,
    agent_parameters: { radius: 0.5, height: 1.8 }
  },
  telemetry_and_audit: {
    enable: true,
    level: "info",
    structured_log_schema_version: "1.0",
    log_fields: ["timestamp","patch_id","element_id","event_type","error_code"]
  },
  versioning_and_rollback: {
    enable: true,
    attach_version_metadata: true,
    allow_quick_rollback: true
  },
  regression_tests: {
    enable: true,
    canonical_builds: ["death_star","racetrack","bunker","maze"],
    run_on_patch: true,
    pass_thresholds: { fidelity_score: 0.95, no_hard_fail: true }
  },
  schema_validation_and_contract_tests: {
    enable: true,
    schema_version: "v1.2",
    preflight_validate_payload: true
  },
  plugin_api_and_hooks: {
    enable: true,
    sandboxed_plugins: true,
    hooks: ["tessellator","material_mapper","family_resolver"],
    max_plugin_runtime_ms: 2000
  },
  access_control_and_approval: {
    enable: true,
    enforce_roles: true,
    roles: ["admin","reviewer","deployer","viewer"],
    require_code_review_for_enforcement_toggles: true
  },
  quarantine_and_safety_mode: {
    enable: true,
    hard_fail_threshold: 5,
    quarantine_action: "READ_ONLY_PREVIEW"
  },

  nan_guard: {
    check_fields: ["x", "y", "z", "yaw", "pitch", "roll"],
    on_nan_detected: {
      action: "HARD_FAIL_BUILD",
      log_tag: "NAN_DETECTED_CRITICAL"
    }
  },

  global_pipeline: {
    order: [
      "input_validation",
      "shape_registry_validation",
      "theme_and_profile_resolution",
      "path_and_curve_generation",
      "structural_shape_validation",
      "rotation_and_alignment",
      "object_family_resolution",
      "placement_and_snapping",
      "visual_fidelity_engine",
      "REGENERATE_TESSELLATION",
      "smart_shape_classifier",
      "curvature_integrity_test",
      "silhouette_preservation_pass",
      "curvature_protection_pass",
      "lod_aware_density_pass",
      "smart_density_optimizer",
      "budget_enforcement",
      "auto_split_resolution",
      "object_budget_heatmap_pass",
      "final_shape_accuracy_verification",
      "auto_fix_engine",
      "nan_guard",
      "FINAL_VALIDATION",
      "prebuild_persist"
    ]
  },

  build_pipeline: {
    order: [
      "input_validation",
      "path_and_curve_generation",
      "rotation_and_alignment",
      "placement_and_snapping",
      "REGENERATE_TESSELLATION",
      "smart_shape_classifier",
      "curvature_integrity_test",
      "silhouette_preservation_pass",
      "curvature_protection_pass",
      "lod_aware_density_pass",
      "smart_density_optimizer",
      "budget_enforcement",
      "auto_split_resolution",
      "object_budget_heatmap_pass",
      "final_shape_accuracy_verification",
      "FINAL_VALIDATION"
    ]
  },

  prebuild_pipeline: {
    order: [
      "input_validation",
      "theme_and_profile_resolution",
      "path_and_curve_generation",
      "rotation_and_alignment",
      "object_family_resolution",
      "placement_and_snapping",
      "REGENERATE_TESSELLATION",
      "smart_shape_classifier",
      "curvature_integrity_test",
      "silhouette_preservation_pass",
      "curvature_protection_pass",
      "lod_aware_density_pass",
      "smart_density_optimizer",
      "budget_enforcement",
      "auto_split_resolution",
      "object_budget_heatmap_pass",
      "final_shape_accuracy_verification",
      "FINAL_VALIDATION"
    ]
  },

  vault_pipeline: {
    order: [
      "input_validation",
      "path_and_curve_generation",
      "rotation_and_alignment",
      "placement_and_snapping",
      "REGENERATE_TESSELLATION",
      "smart_shape_classifier",
      "curvature_integrity_test",
      "silhouette_preservation_pass",
      "curvature_protection_pass",
      "lod_aware_density_pass",
      "smart_density_optimizer",
      "budget_enforcement",
      "auto_split_resolution",
      "object_budget_heatmap_pass",
      "final_shape_accuracy_verification",
      "FINAL_VALIDATION"
    ]
  },

  operational_safeguards: {
    fail_safe_defaults: { preview_mode: "READ_ONLY", reason: "missing_subsystem" },
    rate_limits: { max_instances_per_session: 50000 },
    canary_rollout: { enable: true, percent_initial: 5 }
  },

  enforcement: {
    enforce_shape_registry: true,
    enforce_shape_validation: true,
    enforce_geometry_overrides: true,
    enforce_rotation_rules: true,
    enforce_curve_rules: true,
    enforce_object_family_rules: true,
    enforce_preview_rules: true,
    enforce_telemetry_rules: true,
    enforce_access_control: true,
    reject_on_any_hard_fail: true
  },

  // 🏗️ OBJECT BUDGET & EXPORT ENGINE (NEW)
  budget_and_export_rules: {
    enable: true,

    // ABSOLUTE MAXIMUM OBJECT COUNT
    hard_cap: 3000,
    never_exceed_hard_cap: true,

    // SAFE LIMIT BEFORE SPLITTING
    safe_limit: 1200,

    // AUTO-SPLIT BEHAVIOUR
    auto_split_when_exceeding_safe_limit: true,
    split_into_parts: 3,
    target_objects_per_part: 1000,
    balance_parts_evenly: true,

    // AUTO-NAMING (BASED ON USER BUILD NAME)
    auto_name_parts: true,
    naming_format: "{build_name}_part{index}",
    init_c_naming_format: "{build_name}_part{index}_init.c",
    readme_naming_format: "{build_name}_README.txt",

    // EXPORT FORMAT
    export_parts_as: {
      json: true,
      init_c: true
    },

    // AUTO-GENERATED README
    generate_readme: true,
    readme_contents:
      "This build exceeded 1200 objects and was automatically split into 3 parts.\n\n" +
      "UPLOAD INSTRUCTIONS:\n" +
      "1. Upload all 3 JSON files and all 3 init.c files to your Nitrado 'custom' folder.\n" +
      "2. Reference all 3 JSON files in your cfggameplay.xml under <objectspawner>.\n" +
      "3. Keep all parts at the same coordinates to maintain alignment.\n" +
      "4. Do not delete or rename any of the files.\n\n" +
      "All parts are automatically aligned because the split occurs after final object placement.",

    // DOWNLOAD BEHAVIOUR
    download_all_parts_together: true,
    no_optional_selection: true,
    enforce_full_package_download: true,

    // ALIGNMENT (NO LOCKING REQUIRED)
    preserve_structure_alignment: true,
    lock_world_position: false,
    allow_in_game_movement: true,

    // ACCURACY PRESERVATION
    preserve_silhouette: true,
    preserve_major_features: true,
    avoid_shape_loss: true,

    // HOLLOW-SHELL MODE (PREVENTS DEATH STAR DOME ISSUE)
    hollow_shell_mode: true,
    never_fill_interior: true,
    avoid_solid_volumes: true,
    maintain_full_sphere_geometry: true,
    maintain_closed_poles: true,
    maintain_equator_symmetry: true,

    // SCALE-AWARE DENSITY
    scale_aware_density: {
      large_objects_use_low_density: true,
      medium_objects_use_normal_density: true,
      small_objects_use_high_density: true,
      micro_detail_use_minimal_density: true
    },

    // COMPLEX SHAPES (LIKE MOTHERSHIP)
    complex_shape_handling: {
      use_frame_and_shell_only: true,
      avoid_internal_geometry: true,
      fallback_to_low_poly_outline_if_needed: true
    }
  }
} as const;

export type MasterRuleset = typeof MASTER_RULESET;
