export const OBJECT_FAMILY_MAP = {
  scifi: {
    walls: ["Land_ContainerLocked_Blue_DE", "StaticObj_Roadblock_CncBlock"],
    panels: ["StaticObj_DieselPowerPlant_Tank_Small"],
    containers: ["Land_ContainerLocked_Blue_DE"],
    theme: "Grey/Blue metallic surfaces"
  },
  military: {
    walls: ["StaticObj_Mil_HBarrier_Big", "StaticObj_Mil_HBarrier_6m"],
    fortifications: ["StaticObj_Mil_HBarrier_6m", "Land_Roadblock_Bags_Long"],
    theme: "Concrete and reinforced HESCO structures"
  },
  ancient: {
    stone: ["Land_Castle_Wall1_20"],
    weathered: ["Land_Castle_Wall1_20"],
    theme: "Weathered castle stone blocks"
  },
  architectural: {
    white: ["Land_Castle_Wall1_20", "StaticObj_BusStation_wall"],
    clean: ["StaticObj_BusStation_wall"],
    theme: "Polished stone and clean glass/concrete"
  },
  industrial: {
    walls: ["Land_Container_1Bo", "StaticObj_Roadblock_CncBlock"],
    theme: "Red containers and raw industrial concrete"
  },
  underground: {
    walls: ["Land_Underground_Tunnel_Single", "Land_Underground_Tunnel_Double"],
    rooms: ["Land_Underground_Room_Small"],
    entrances: ["Land_Underground_Entrance"],
    theme: "Livonia-grade bunker tunnels and modular corridor segments"
  }
};
