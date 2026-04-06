/**
 * Relative loot points for common DayZ buildings derived from mapgroupproto.xml
 * Each point is [x, y, z] relative to the building's origin.
 */
export const BUILDING_LOOT_POINTS: Record<string, [number, number, number][] | undefined> = {
  // --- Military ---
  "Land_Mil_Barracks1": [
    [-3.0, 0.5, 0.0], [-1.0, 0.5, 0.0], [1.0, 0.5, 0.0], [3.0, 0.5, 0.0],
    [-2.0, 0.5, 1.5], [0.0, 0.5, 1.5], [2.0, 0.5, 1.5]
  ],
  "Land_Mil_Barracks2": [
    [-2.5, 0.4, -1.0], [2.5, 0.4, -1.0], [0.0, 0.4, 0.0],
    [-2.0, 0.4, 2.0], [2.0, 0.4, 2.0]
  ],
  "Land_Mil_Barracks3": [
    [-5.0, 0.5, 0.0], [-3.0, 0.5, 0.0], [-1.0, 0.5, 0.0], [1.0, 0.5, 0.0], [3.0, 0.5, 0.0], [5.0, 0.5, 0.0],
    [-4.0, 0.5, 1.8], [0.0, 0.5, 1.8], [4.0, 0.5, 1.8]
  ],
  "Land_Mil_Guardhouse1": [
    [0.0, 0.3, 0.5], [-1.2, 0.3, -0.5], [1.2, 0.3, -0.5]
  ],
  "Land_Mil_Guardhouse2": [
    [0.0, 0.3, 0.8], [-1.5, 0.3, -0.8], [1.5, 0.3, -0.8], [0.0, 0.3, -0.2]
  ],

  // --- Underground (Bunker) ---
  "Land_Underground_Storage_Big": [
    [0.0, 0.2, 0.0], [-3.0, 0.2, -3.0], [3.0, 0.2, -3.0], [-3.0, 0.2, 3.0], [3.0, 0.2, 3.0],
    [5.5, 0.2, 0.0], [-5.5, 0.2, 0.0], [0.0, 0.2, 5.5], [0.0, 0.2, -5.5]
  ],
  "Land_Underground_Storage_Ammo": [
    [-1.5, 0.2, -1.5], [1.5, 0.2, -1.5], [-1.5, 0.2, 1.5], [1.5, 0.2, 1.5],
    [0.0, 0.7, 0.0] // On the table/shelf
  ],
  "Land_Underground_Storage_Ammo2": [
    [-2.0, 0.2, -2.0], [2.0, 0.2, -2.0], [-2.0, 0.2, 2.0], [2.0, 0.2, 2.0],
    [0.0, 0.2, 0.0], [0.0, 0.8, -1.5]
  ],
  "Land_Underground_Storage_Barracks": [
    [-2.0, 0.3, -3.5], [2.0, 0.3, -3.5], [-2.0, 0.3, -1.0], [2.0, 0.3, -1.0],
    [-2.0, 0.3, 1.5], [2.0, 0.3, 1.5], [-2.0, 0.3, 4.0], [2.0, 0.3, 4.0]
  ],
  "Land_Underground_Storage_Hospital": [
    [0.0, 0.2, 0.0], [-1.0, 0.8, -2.0], [1.0, 0.8, -2.0], [0.0, 0.2, 3.0]
  ],
  "Land_Underground_Storage_Laboratory": [
    [0.0, 0.2, 0.0], [-1.5, 0.9, -1.5], [1.5, 0.9, -1.5], [0.0, 0.2, 4.0]
  ],
  "Land_Underground_Storage_Workshop": [
    [0.0, 0.2, 0.0], [-2.5, 0.9, -2.0], [2.5, 0.9, -2.0], [0.0, 0.2, 3.5]
  ],
  "Land_Underground_Corridor_Main_Both": [
    [0.0, 0.2, -4.0], [0.0, 0.2, 0.0], [0.0, 0.2, 4.0]
  ],
  "Land_Underground_Corridor_Main_Left": [
    [0.0, 0.2, 0.0], [-2.0, 0.2, 0.0]
  ],
  "Land_Underground_Corridor_Main_Right": [
    [0.0, 0.2, 0.0], [2.0, 0.2, 0.0]
  ],

  // --- Construction ---
  "Land_Construction_Building": [
    [3.0, 0.5, 3.0], [-3.0, 0.5, 3.0], [3.0, 0.5, -3.0], [-3.0, 0.5, -3.0],
    [0.0, 4.5, 0.0], // 2nd floor center
    [2.0, 4.5, 2.0], [-2.0, 4.5, -2.0]
  ],
  "Land_Construction_House1": [
    [0.0, 0.4, 0.0], [-1.5, 0.4, -1.5], [1.5, 0.4, 1.5]
  ],
  "Land_Construction_House2": [
    [0.0, 0.4, 0.0], [-2.0, 0.4, -2.0], [2.0, 0.4, 2.0], [0.0, 4.6, 0.0]
  ],
  "Land_Workshop1": [
    [-1.5, 0.2, -2.0], [1.5, 0.2, -2.0], [0.0, 0.2, 0.0]
  ],
  "Land_Workshop2": [
    [-2.0, 0.3, -3.0], [2.0, 0.3, -3.0], [0.0, 0.9, 0.0] // On the bench
  ],

  // --- Containers (as used in Maze) ---
  "Land_Container_1Bo": [[0.0, 0.2, 0.0]],
  "Land_Container_1Aoh": [[0.0, 0.2, 0.0]],
  "Land_Container_1Mo": [[0.0, 0.2, 0.0]],
  "Land_Container_1Moh": [[0.0, 0.2, 0.0]],
  "Land_Construction_Crane": [
    [0.0, 0.5, 0.0], [4.0, 0.5, 0.0], [-4.0, 0.5, 4.0], // Base platforms
    [0.0, 26.5, 2.5], [1.2, 26.5, 2.5], // Inside the high cab
    [0.0, 26.5, -5.0], [0.0, 26.5, -12.0] // Along the jib walkway
  ],
  "Land_Misc_Scaffolding": [
    [0.0, 0.4, 0.0], [0.0, 2.4, 0.0], [0.0, 4.4, 0.0], [0.0, 6.4, 0.0]
  ],
  "Land_Shed_M4": [
    [0.0, 0.2, 0.0], [-1.5, 0.2, 1.5], [1.5, 0.2, -1.5]
  ],
  "Wreck_UH1Y": [
    [0.5, 0.4, 1.5], [-0.5, 0.4, 1.5], // Cockpit
    [0.0, 0.4, -0.5], [0.0, 0.4, -2.5]  // Main cabin
  ],
  "Land_Wreck_offroad02_aban1": [
    [0.4, 0.5, 0.5], [-0.4, 0.5, 0.5], // Front seats
    [0.0, 0.5, -0.8] // Back area
  ],
};
