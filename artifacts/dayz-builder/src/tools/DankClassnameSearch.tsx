/**
 * DankClassnameSearch — DayZ classname reference browser.
 * Searchable offline database of common DayZ classnames across
 * weapons, clothing, food, vehicles, buildings and more.
 * Copy classnames directly for use in types.xml, spawners, loadouts.
 */
import { useState, useMemo } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface ClassEntry {
  classname: string;
  displayName: string;
  category: string;
  subcategory: string;
  tags: string[];
}

const DB: ClassEntry[] = [
  // ── Weapons ──────────────────────────────────────────────────────────────
  { classname: "AKM",              displayName: "AKM",                category: "Weapons", subcategory: "Rifles",   tags: ["assault","762x39","military"] },
  { classname: "AK101",            displayName: "AK-101",             category: "Weapons", subcategory: "Rifles",   tags: ["assault","556x45","military"] },
  { classname: "AK74",             displayName: "AK-74",              category: "Weapons", subcategory: "Rifles",   tags: ["assault","545x39","military"] },
  { classname: "M4A1",             displayName: "M4-A1",              category: "Weapons", subcategory: "Rifles",   tags: ["assault","556x45","military"] },
  { classname: "FAL",              displayName: "FAL",                category: "Weapons", subcategory: "Rifles",   tags: ["battle","762x51","military"] },
  { classname: "SVD",              displayName: "SVD",                category: "Weapons", subcategory: "Snipers",  tags: ["sniper","762x54","military"] },
  { classname: "Mosin9130",        displayName: "Mosin 91/30",        category: "Weapons", subcategory: "Snipers",  tags: ["bolt","762x54","civilian"] },
  { classname: "Winchester70",     displayName: "Winchester Model 70",category: "Weapons", subcategory: "Snipers",  tags: ["bolt","308win","civilian"] },
  { classname: "Blaze95",          displayName: "Blaze 95 Double Rifle",category:"Weapons",subcategory: "Snipers",  tags: ["double","762x51","civilian"] },
  { classname: "CR527",            displayName: "CR 527",             category: "Weapons", subcategory: "Rifles",   tags: ["bolt","762x39","civilian"] },
  { classname: "UMP45",            displayName: "UMP-45",             category: "Weapons", subcategory: "SMGs",     tags: ["smg","45acp","military"] },
  { classname: "MP5K",             displayName: "MP5-K",              category: "Weapons", subcategory: "SMGs",     tags: ["smg","9x19","military"] },
  { classname: "Glock19",          displayName: "Glock 19",           category: "Weapons", subcategory: "Pistols",  tags: ["pistol","9x19","civilian"] },
  { classname: "Makarov",          displayName: "Makarov",            category: "Weapons", subcategory: "Pistols",  tags: ["pistol","9x18","military"] },
  { classname: "CZ75",             displayName: "CZ 75",              category: "Weapons", subcategory: "Pistols",  tags: ["pistol","9x19","civilian"] },
  { classname: "Deagle",           displayName: "Desert Eagle",       category: "Weapons", subcategory: "Pistols",  tags: ["pistol","357mag","civilian"] },
  { classname: "IZH43",            displayName: "IZH-43",             category: "Weapons", subcategory: "Shotguns", tags: ["shotgun","12ga","civilian"] },
  { classname: "MP133",            displayName: "MP-133",             category: "Weapons", subcategory: "Shotguns", tags: ["shotgun","12ga","civilian"] },
  { classname: "BK133",            displayName: "BK-133",             category: "Weapons", subcategory: "Shotguns", tags: ["shotgun","12ga","military"] },
  // ── Ammo ─────────────────────────────────────────────────────────────────
  { classname: "Ammo_762x39",      displayName: "7.62x39mm Rounds",   category: "Ammo", subcategory: "Rifle Ammo",  tags: ["762x39","akm","ak74"] },
  { classname: "Ammo_556x45",      displayName: "5.56x45mm Rounds",   category: "Ammo", subcategory: "Rifle Ammo",  tags: ["556x45","m4","ak101"] },
  { classname: "Ammo_762x51",      displayName: "7.62x51mm Rounds",   category: "Ammo", subcategory: "Rifle Ammo",  tags: ["762x51","fal","blaze"] },
  { classname: "Ammo_762x54",      displayName: "7.62x54mm Rounds",   category: "Ammo", subcategory: "Rifle Ammo",  tags: ["762x54","svd","mosin"] },
  { classname: "Ammo_9x19",        displayName: "9x19mm Rounds",      category: "Ammo", subcategory: "Pistol Ammo", tags: ["9x19","glock","cz75","mp5"] },
  { classname: "Ammo_45ACP",       displayName: ".45 ACP Rounds",     category: "Ammo", subcategory: "Pistol Ammo", tags: ["45acp","ump"] },
  { classname: "Ammo_12ga",        displayName: "12ga Buckshot",      category: "Ammo", subcategory: "Shotgun Ammo",tags: ["12ga","shotgun"] },
  // ── Clothing ─────────────────────────────────────────────────────────────
  { classname: "GorkaEJacket_Black",displayName: "Gorka E Jacket (Black)",category:"Clothing",subcategory:"Jackets",tags:["military","gorka"] },
  { classname: "TTSKOJacket",       displayName: "TTSKO Jacket",       category: "Clothing", subcategory: "Jackets",  tags: ["military","camo"] },
  { classname: "HunterJacket_Brown",displayName: "Hunter Jacket (Brown)",category:"Clothing",subcategory:"Jackets",tags:["civilian","hunter"] },
  { classname: "RainCoat_Green",    displayName: "Rain Coat (Green)",  category: "Clothing", subcategory: "Jackets",  tags: ["civilian","rain"] },
  { classname: "BDUJacket",         displayName: "BDU Jacket",         category: "Clothing", subcategory: "Jackets",  tags: ["military","bdu"] },
  { classname: "SoldierBoots_Black",displayName: "Soldier Boots (Black)",category:"Clothing",subcategory:"Boots",  tags:["military","boots"] },
  { classname: "HikingBootsLow_Brown",displayName:"Hiking Boots (Brown)",category:"Clothing",subcategory:"Boots", tags:["civilian","boots"] },
  { classname: "BalaclavaKnit_Black",displayName:"Knit Balaclava (Black)",category:"Clothing",subcategory:"Headgear",tags:["mask","balaclava"] },
  { classname: "HelmetSteelProtector",displayName:"Steel Protector Helmet",category:"Clothing",subcategory:"Headgear",tags:["helmet","military"] },
  { classname: "PlateCarrierVest",  displayName: "Plate Carrier Vest",category: "Clothing", subcategory: "Vests",    tags: ["military","vest","plate"] },
  { classname: "PressVest_Black",   displayName: "Press Vest (Black)", category: "Clothing", subcategory: "Vests",    tags: ["civilian","vest"] },
  // ── Backpacks ─────────────────────────────────────────────────────────────
  { classname: "TaloonBag_Blue",    displayName: "Taloon Bag (Blue)",  category: "Containers", subcategory: "Backpacks", tags: ["backpack","civilian"] },
  { classname: "HuntingBag",        displayName: "Hunting Bag",        category: "Containers", subcategory: "Backpacks", tags: ["backpack","civilian"] },
  { classname: "MountainBag_Green", displayName: "Mountain Bag (Green)",category:"Containers",subcategory:"Backpacks",tags:["backpack","civilian"] },
  { classname: "AssaultBag_Black",  displayName: "Assault Bag (Black)",category:"Containers",subcategory:"Backpacks",tags:["backpack","military"] },
  { classname: "SmershBag",         displayName: "Smersh Bag",         category: "Containers", subcategory: "Backpacks", tags: ["backpack","military","smersh"] },
  // ── Food ─────────────────────────────────────────────────────────────────
  { classname: "RiceBag",           displayName: "Rice Bag",           category: "Food", subcategory: "Dry Food",  tags: ["food","rice"] },
  { classname: "BakedBeansCan",     displayName: "Baked Beans Can",    category: "Food", subcategory: "Canned",    tags: ["food","canned","beans"] },
  { classname: "TunaCan",           displayName: "Tuna Can",           category: "Food", subcategory: "Canned",    tags: ["food","canned","tuna"] },
  { classname: "SardinesCan",       displayName: "Sardines Can",       category: "Food", subcategory: "Canned",    tags: ["food","canned","sardines"] },
  { classname: "SpaghettiCan",      displayName: "Spaghetti Can",      category: "Food", subcategory: "Canned",    tags: ["food","canned","spaghetti"] },
  { classname: "Apple",             displayName: "Apple",              category: "Food", subcategory: "Fruit",     tags: ["food","fruit","apple"] },
  { classname: "Pear",              displayName: "Pear",               category: "Food", subcategory: "Fruit",     tags: ["food","fruit","pear"] },
  // ── Medical ───────────────────────────────────────────────────────────────
  { classname: "Bandage_Clean",     displayName: "Bandage (Clean)",    category: "Medical", subcategory: "Bandages",  tags: ["medical","bandage"] },
  { classname: "Rag",               displayName: "Rag",                category: "Medical", subcategory: "Bandages",  tags: ["medical","rag"] },
  { classname: "Morphine",          displayName: "Morphine Auto-Injector",category:"Medical",subcategory:"Injectors",tags:["medical","morphine","fracture"] },
  { classname: "Epinephrine",       displayName: "Epinephrine Auto-Injector",category:"Medical",subcategory:"Injectors",tags:["medical","epi","shock"] },
  { classname: "SalineIV_500",      displayName: "Saline IV Bag (500ml)",category:"Medical",subcategory:"IV",       tags:["medical","saline","blood"] },
  { classname: "BloodBag_Empty",    displayName: "Blood Bag (Empty)",  category: "Medical", subcategory: "IV",        tags: ["medical","blood","transfusion"] },
  { classname: "Tetracycline",      displayName: "Tetracycline Pills", category: "Medical", subcategory: "Pills",     tags: ["medical","tetracycline","infection"] },
  { classname: "CharcoalTablets",   displayName: "Charcoal Tablets",   category: "Medical", subcategory: "Pills",     tags: ["medical","charcoal","food poisoning"] },
  // ── Tools ─────────────────────────────────────────────────────────────────
  { classname: "Hatchet",           displayName: "Hatchet",            category: "Tools", subcategory: "Axes",      tags: ["tool","axe","hatchet","wood"] },
  { classname: "Hacksaw",           displayName: "Hacksaw",            category: "Tools", subcategory: "Saws",      tags: ["tool","saw","hacksaw"] },
  { classname: "Hammer",            displayName: "Hammer",             category: "Tools", subcategory: "Hand Tools",tags: ["tool","hammer","base building"] },
  { classname: "Screwdriver",       displayName: "Screwdriver",        category: "Tools", subcategory: "Hand Tools",tags: ["tool","screwdriver"] },
  { classname: "Rope",              displayName: "Rope",               category: "Tools", subcategory: "Materials", tags: ["tool","rope","craft"] },
  { classname: "WireCoil",          displayName: "Wire Coil",          category: "Tools", subcategory: "Materials", tags: ["tool","wire","fence","base building"] },
  { classname: "Nails",             displayName: "Nails",              category: "Tools", subcategory: "Materials", tags: ["tool","nails","base building"] },
  // ── Vehicles ─────────────────────────────────────────────────────────────
  { classname: "OffroadHatchback",  displayName: "Offroad Hatchback",  category: "Vehicles", subcategory: "Cars",    tags: ["vehicle","car","hatchback"] },
  { classname: "Sedan_02",          displayName: "Sedan",              category: "Vehicles", subcategory: "Cars",    tags: ["vehicle","car","sedan"] },
  { classname: "CivilianSedan",     displayName: "Civilian Sedan",     category: "Vehicles", subcategory: "Cars",    tags: ["vehicle","car","sedan"] },
  { classname: "Truck_01_Covered",  displayName: "V3S Truck (Covered)",category:"Vehicles",subcategory:"Trucks",    tags:["vehicle","truck","v3s"] },
  { classname: "Truck_01_Open",     displayName: "V3S Truck (Open)",   category: "Vehicles", subcategory: "Trucks",  tags: ["vehicle","truck","v3s"] },
  // ── Buildings ─────────────────────────────────────────────────────────────
  { classname: "Land_Mil_Barracks_HQ",    displayName: "Military HQ Barracks",  category: "Buildings", subcategory: "Military",  tags: ["building","military","barracks"] },
  { classname: "Land_Mil_Barracks_i",     displayName: "Military Barracks (i)", category: "Buildings", subcategory: "Military",  tags: ["building","military","barracks"] },
  { classname: "Land_Mil_Cargo_Tower",    displayName: "Military Cargo Tower",  category: "Buildings", subcategory: "Military",  tags: ["building","military","tower"] },
  { classname: "Land_Mil_Watchtower",     displayName: "Military Watchtower",   category: "Buildings", subcategory: "Military",  tags: ["building","military","watchtower"] },
  { classname: "Land_Castle_Gate_DE",     displayName: "Castle Gate",           category: "Buildings", subcategory: "Ruins",     tags: ["building","castle","gate","ruin"] },
  { classname: "Land_Castle_Wall_3m_DE",  displayName: "Castle Wall (3m)",      category: "Buildings", subcategory: "Ruins",     tags: ["building","castle","wall","ruin"] },
  { classname: "Land_Castle_Wall_Tower_DE",displayName:"Castle Wall Tower",     category: "Buildings", subcategory: "Ruins",     tags: ["building","castle","tower","ruin"] },
  { classname: "Land_GasTank_Cylindrical",displayName:"Gas Tank (Cylindrical)", category: "Buildings", subcategory: "Industrial",tags: ["building","industrial","tank"] },
  { classname: "Land_BarrierConcrete_01_DE",displayName:"Concrete Barrier",     category: "Buildings", subcategory: "Industrial",tags: ["building","barrier","concrete"] },
  { classname: "Land_Mil_Cargo_Cont_Big", displayName: "Cargo Container (Big)", category: "Buildings", subcategory: "Industrial",tags: ["building","container","cargo"] },
];

const CATEGORIES = [...new Set(DB.map(e => e.category))];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DankClassnameSearch() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [showHow, setShowHow] = useState(false);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return DB.filter(e => {
      const matchCat = activeCategory === "All" || e.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        e.classname.toLowerCase().includes(q) ||
        e.displayName.toLowerCase().includes(q) ||
        e.subcategory.toLowerCase().includes(q) ||
        e.tags.some(t => t.includes(q))
      );
    });
  }, [query, activeCategory]);

  function copy(classname: string) {
    navigator.clipboard.writeText(classname).then(() => {
      setCopied(classname);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function copyAll() {
    const text = results.map(e => e.classname).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied("__all__");
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="min-h-screen bg-[#080f09] text-[#b8d4b8] font-mono">
      <div className="border-b border-[#1a2e1a] bg-[#0c1510] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px]">← HOME</a>
        <span className="text-[#1a2e1a]">/</span>
        <span className="text-[11px] font-black text-[#27ae60]">🔍 DANKCLASSNAME SEARCH</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UNIQUE TOOL</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {/* HOW TO USE */}
        <div className="border border-[#1a2e1a] rounded overflow-hidden">
          <button onClick={() => setShowHow(h => !h)}
            className="w-full flex items-center justify-between px-4 py-2 bg-[#0c1510] text-[11px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
            <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
          </button>
          {showHow && (
            <div className="px-4 py-3 text-[10px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
              <p>1. Search by classname, display name, or tag (e.g. "762", "military", "backpack").</p>
              <p>2. Filter by category using the tabs.</p>
              <p>3. Click any classname to copy it to clipboard.</p>
              <p>4. Use "COPY ALL" to copy all visible classnames as a list.</p>
            </div>
          )}
        </div>

        {/* Search + filters */}
        <div className="flex gap-3 items-center">
          <input
            className="flex-1 bg-[#0a1209] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-3 py-2 rounded focus:outline-none focus:border-[#27ae60]"
            placeholder="Search classnames, names, tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={copyAll}
            className="px-3 py-2 text-[10px] font-black border border-[#5a8a5a] text-[#5a8a5a] rounded hover:border-[#27ae60] hover:text-[#27ae60] transition-colors whitespace-nowrap">
            {copied === "__all__" ? "✅ COPIED" : `COPY ALL (${results.length})`}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1">
          {["All", ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 text-[9px] font-black rounded transition-colors ${
                activeCategory === cat
                  ? "bg-[#27ae60] text-[#080f09]"
                  : "bg-[#0a1209] border border-[#1a2e1a] text-[#5a8a5a] hover:text-[#b8d4b8]"
              }`}>
              {cat} {cat === "All" ? `(${DB.length})` : `(${DB.filter(e => e.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="text-[9px] text-[#3a6a3a] mb-2">{results.length} results</div>
        <div className="space-y-1">
          {results.map(entry => (
            <div key={entry.classname}
              className="flex items-center gap-3 p-2 rounded border border-[#1a2e1a] bg-[#0a1209] hover:border-[#2a4a2a] group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copy(entry.classname)}
                    className="text-[11px] font-black text-[#27ae60] hover:text-[#2ecc71] font-mono transition-colors"
                    title="Click to copy">
                    {copied === entry.classname ? "✅" : entry.classname}
                  </button>
                  <span className="text-[9px] text-[#5a8a5a]">— {entry.displayName}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] text-[#3a6a3a]">{entry.category} / {entry.subcategory}</span>
                  <div className="flex gap-1">
                    {entry.tags.slice(0, 4).map(t => (
                      <span key={t} className="text-[7px] px-1 rounded bg-[#0c1510] text-[#3a6a3a] border border-[#1a2e1a]">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => copy(entry.classname)}
                className="opacity-0 group-hover:opacity-100 text-[9px] text-[#5a8a5a] hover:text-[#27ae60] transition-all px-2">
                COPY
              </button>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-[11px] text-[#5a8a5a] text-center py-8">No classnames match your search.</div>
        )}
      </div>
    </div>
  );
}
