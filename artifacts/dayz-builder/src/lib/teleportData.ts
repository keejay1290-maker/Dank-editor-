// ─── DankTeleport — data layer ───────────────────────────────────────────────
// Console-compatible PRA JSON format verified from:
//   scalespeeder/DayZ-CHERNARUS-Fast-Travel-Teleport-Mod
//   BohemiaInteractive/DayZ-Script-Diff

export type TeleportTheme =
  | "scifi" | "transporter" | "stargate"
  | "ufo" | "ritual" | "lava" | "bunker_hatch" | "event_mega";

export type SizeMode = "small" | "medium" | "event";

export interface PadConfig {
  theme: TeleportTheme;
  sizeMode: SizeMode;
  padRadius: number;       // metres — overrides sizeMode default when changed
  seed: number;
  posX: number;
  posY: number;
  posZ: number;
  destX: number;
  destY: number;
  destZ: number;
}

export const SIZE_DEFAULTS: Record<SizeMode, number> = {
  small:  3,
  medium: 4,
  event:  12,
};

export interface ThemeDef {
  key: TeleportTheme;
  label: string;
  emoji: string;
  desc: string;
  shape: string;
  suggestedClass: string;
  color: string;
  eventOnly?: boolean;
}

export const THEMES: ThemeDef[] = [
  {
    key: "scifi",
    label: "Sci-Fi Pad",
    emoji: "🔵",
    desc: "Circular platform · energy columns · overhead ring emitter",
    shape: "teleporter_scifi",
    suggestedClass: "Land_Fuel_Tank_Small", // Grey metallic industrial look
    color: "#27ae60",
  },
  {
    key: "transporter",
    label: "Transporter Pad",
    emoji: "🟡",
    desc: "Hexagonal platform · 6 emitter columns · overhead arch",
    shape: "teleporter_transporter",
    suggestedClass: "Land_HBarrier_5m", // Classic Scalespeeder-style HESCO setup
    color: "#f39c12",
  },
  {
    key: "stargate",
    label: "Stargate Portal",
    emoji: "🟣",
    desc: "Standing ring · chevrons · DHD console · approach ramp",
    shape: "teleporter_stargate",
    suggestedClass: "Land_Power_Station_Main", // Dark lattice metal for the ring
    color: "#8e44ad",
  },
  {
    key: "ufo",
    label: "UFO Abduction",
    emoji: "🛸",
    desc: "Hovering saucer overhead · beam columns · stand underneath",
    shape: "teleporter_ufo",
    suggestedClass: "Land_Mil_Cargo_Tower",
    color: "#1abc9c",
  },
  {
    key: "ritual",
    label: "Ritual Circle",
    emoji: "🔮",
    desc: "Stone monolith ring · pentagram floor · central altar",
    shape: "teleporter_ritual",
    suggestedClass: "Land_Castle_Stairs_nolc",
    color: "#9b59b6",
  },
  {
    key: "lava",
    label: "Lava Portal",
    emoji: "🌋",
    desc: "Jagged rock arch · lava pool surround · glowing core",
    shape: "teleporter_lava",
    suggestedClass: "Land_Wreck_T72Wreck",
    color: "#e74c3c",
  },
  {
    key: "bunker_hatch",
    label: "Bunker Hatch",
    emoji: "🪖",
    desc: "Concrete surround · hatch frame · warning signs (Sakhal-style)",
    shape: "teleporter_bunker_hatch",
    suggestedClass: "Land_Mil_Barracks_i",
    color: "#7f8c8d",
  },
  {
    key: "event_mega",
    label: "Event Mega-Pad",
    emoji: "🎪",
    desc: "Large raised stage · 8 pylons · overhead arch · crowd barriers",
    shape: "teleporter_event_mega",
    suggestedClass: "Land_Mil_Barracks_HQ",
    color: "#e67e22",
    eventOnly: true,
  },
];

// ─── Output builders ──────────────────────────────────────────────────────────

export function buildObjectsJson(
  points: { x: number; y: number; z: number }[],
  classname: string,
  posX: number,
  posY: number,
  posZ: number,
  padLabel: string,
): string {
  const objects = points.map(p => ({
    name: classname,
    pos: [
      parseFloat((posX + p.x).toFixed(3)),
      parseFloat((posY + p.y).toFixed(3)),
      parseFloat((posZ + p.z).toFixed(3)),
    ],
    ypr: [0, 0, 0],
    scale: 1.0,
    enableCEPersistency: 0,
  }));
  return JSON.stringify(
    { _comment: `Dank's Dayz Studio — ${padLabel} objects`, Objects: objects },
    null,
    2,
  );
}

export function buildPraJson(
  padRadius: number,
  posX: number,
  posY: number,
  posZ: number,
  destX: number,
  destY: number,
  destZ: number,
  areaName: string,
): string {
  const w = parseFloat((padRadius * 2).toFixed(3));
  const h = 3.0;
  const d = parseFloat((padRadius * 2).toFixed(3));
  const data = {
    areaName,
    PRABoxes: [[[w, h, d], [0, 0, 0], [posX, posY, posZ]]],
    safePositions3D: [[destX, destY, destZ]],
  };
  return JSON.stringify(data, null, 2);
}

export function buildSetupText(
  padLabel: string,
  areaName: string,
  padRadius: number,
  posX: number, posY: number, posZ: number,
  destX: number, destY: number, destZ: number,
  hasReturnPad: boolean,
): string {
  const w = (padRadius * 2).toFixed(1);
  return `=== DANK TELEPORT — ${padLabel.toUpperCase()} SETUP ===
Source: github.com/scalespeeder (console PRA method)
        github.com/BohemiaInteractive/DayZ-Script-Diff

TRIGGER BOX : ${w}m wide × 3m tall × ${w}m deep
PAD POSITION: ${posX}, ${posY}, ${posZ}
DESTINATION : ${destX}, ${destY}, ${destZ}

─────────────────────────────────────────────────
STEP 1 — UPLOAD FILES TO SERVER
─────────────────────────────────────────────────
Console (Nitrado):
  File Browser → mpmissions/YourMission/custom/
  Upload:
    • ${areaName}_objects.json
    • ${areaName}_pra.json
${hasReturnPad ? "    • (repeat for Pad B files)\n" : ""}
PC:
  mpmissions\\YourMission\\custom\\

─────────────────────────────────────────────────
STEP 2 — EDIT cfggameplay.json
─────────────────────────────────────────────────
Find the "WorldsData" section and add/merge:

  "playerRestrictedAreaFiles": [
    "custom/${areaName}_pra.json"${hasReturnPad ? `,\n    "custom/${areaName}_B_pra.json"` : ""}
  ],
  "objectSpawnersArr": [
    "custom/${areaName}_objects.json"${hasReturnPad ? `,\n    "custom/${areaName}_B_objects.json"` : ""}
  ],

Console: Enable cfggameplay.json in Nitrado → General Settings first.
PC: Ensure enableCfgGameplayFile = 1 in serverDZ.cfg

─────────────────────────────────────────────────
STEP 3 — RESTART SERVER
─────────────────────────────────────────────────
Players who log off inside the PRA box will be
teleported to the destination on next login.

This is the same system used by the official
Sakhal underground bunker (BohemiaInteractive).

NOTE: The trigger box is shown as a wireframe in
the 3D preview. Ensure your decorative objects
fit within it.
`;
}
