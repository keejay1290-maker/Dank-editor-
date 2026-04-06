import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { DAYZ_OBJECTS } from "@/lib/dayzObjects";

interface SlotItem {
  id: string;
  slotName: string;
  itemType: string;
  healthMin: number;
  healthMax: number;
  quantityMin: number;
  quantityMax: number;
  quickBarSlot: number;
  attachments: string[]; // simpleChildrenTypes
}

const SLOT_NAMES = [
  "Body", "Legs", "Feet", "Back", "Vest", "Mask", "Headgear", "Gloves", "Eyewear",
  "Shoulder", "Melee", "Handgun"
];

const CHARACTERS = [
  "SurvivorM_Boris","SurvivorM_Cyril","SurvivorM_Denis","SurvivorM_Elias","SurvivorM_Francis","SurvivorM_Guo","SurvivorM_Hassan","SurvivorM_Indar","SurvivorM_Jose","SurvivorM_Kaito","SurvivorM_Lewis","SurvivorM_Manua",
  "SurvivorF_Frida","SurvivorF_Gabi","SurvivorF_Helen","SurvivorF_Irena","SurvivorF_Judy","SurvivorF_Keiko","SurvivorF_Linda","SurvivorF_Maria","SurvivorF_Naomi","SurvivorF_Olivia","SurvivorF_Paula"
];

let _id = 0;
const uid = () => `slot_${++_id}`;

export default function DankLoadoutBuilder() {
  const [, navigate] = useLocation();
  const [loadoutName, setLoadoutName] = useState("Military_AKM");
  const [spawnWeight, setSpawnWeight] = useState(1);
  const [characterTypes, setCharacterTypes] = useState<string[]>(CHARACTERS);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [search, setSearch] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const filteredObjects = useMemo(() =>
    DAYZ_OBJECTS.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase())).slice(0, 50),
  [search]);

  function addSlot() {
    setSlots(prev => [...prev, {
      id: uid(),
      slotName: "Body",
      itemType: "",
      healthMin: 1.0,
      healthMax: 1.0,
      quantityMin: -1,
      quantityMax: -1,
      quickBarSlot: -1,
      attachments: []
    }]);
  }

  function updateSlot(id: string, patch: Partial<SlotItem>) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function removeSlot(id: string) {
    setSlots(prev => prev.filter(s => s.id !== id));
  }

  function insertItem(classname: string) {
    if (!focusedField) return;
    updateSlot(focusedField, { itemType: classname });
    setSearch("");
  }

  const json = useMemo(() => {
    const output = {
      spawnWeight,
      name: loadoutName,
      characterTypes,
      attachmentSlotItemSets: slots.map(s => ({
        slotName: s.slotName,
        discreteItemSets: [{
          itemType: s.itemType,
          spawnWeight: 100,
          attributes: {
            healthMin: s.healthMin,
            healthMax: s.healthMax,
            ...(s.quantityMin !== -1 ? { quantityMin: s.quantityMin, quantityMax: s.quantityMax } : {})
          },
          quickBarSlot: s.quickBarSlot,
          ...(s.attachments.length ? { simpleChildrenTypes: s.attachments } : {})
        }]
      })),
      discreteUnsortedItemSets: [] // Empty cargo for now
    };
    return JSON.stringify(output, null, 2);
  }, [loadoutName, spawnWeight, characterTypes, slots]);

  const download = () => {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([json], { type: "application/json" })),
      download: `${loadoutName}.json`,
    });
    a.click();
  };

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#e67e22] font-black text-[13px] tracking-widest">🎒 LOADOUT BUILDER (SCALESPEEDER COMPLIANT)</span>
        <button onClick={download} className="ml-auto px-3 py-1 bg-[#e67e22] text-[#080f09] text-[10px] font-bold rounded">⬇ EXPORT JSON</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Config & Item Finder */}
        <div className="w-64 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-4 space-y-4 overflow-y-auto">
          <div>
            <div className="text-[9px] text-[#3a6a3a] mb-1">LOADOUT NAME</div>
            <input value={loadoutName} onChange={e => setLoadoutName(e.target.value)} className="w-full bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded" />
          </div>
          <div>
            <div className="text-[9px] text-[#3a6a3a] mb-1">SPAWN WEIGHT</div>
            <input type="number" value={spawnWeight} onChange={e => setSpawnWeight(Number(e.target.value))} className="w-full bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded" />
          </div>
          <button onClick={addSlot} className="w-full py-2 bg-[#e67e22] text-[#080f09] font-black text-[11px] rounded">+ ADD SLOT</button>

          <div className="border-t border-[#1a2e1a] pt-4">
             <div className="text-[9px] text-[#3a6a3a] mb-1">ITEM FINDER</div>
             <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1.5 rounded mb-2" />
             <div className="max-h-64 overflow-y-auto space-y-1">
               {filteredObjects.map(o => (
                 <button key={o.value} onClick={() => insertItem(o.value)} className="w-full text-left px-2 py-1 text-[9px] hover:bg-[#1a2e1a] rounded">
                   {o.label}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Center: Slots */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {slots.map(s => (
            <div key={s.id} className="bg-[#0a1209] border border-[#1a2e1a] p-4 rounded relative">
              <button onClick={() => removeSlot(s.id)} className="absolute top-2 right-2 text-[#c0392b] text-[10px]">✕</button>
              <div className="flex items-center gap-3 mb-3">
                <select value={s.slotName} onChange={e => updateSlot(s.id, { slotName: e.target.value })} className="bg-[#080f09] border border-[#1a2e1a] text-[#e67e22] text-[10px] px-2 py-1 rounded font-bold">
                  {SLOT_NAMES.map(n => <option key={n}>{n}</option>)}
                </select>
                <input
                  value={s.itemType}
                  onChange={e => updateSlot(s.id, { itemType: e.target.value })}
                  onFocus={() => setFocusedField(s.id)}
                  placeholder="Item Classname..."
                  className="flex-1 bg-[#080f09] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded font-mono"
                />
              </div>
              <div className="grid grid-cols-4 gap-4 text-[9px]">
                <div>
                  <div className="text-[#3a6a3a] mb-1">HEALTH MIN/MAX</div>
                  <div className="flex gap-1">
                    <input type="number" step="0.1" value={s.healthMin} onChange={e => updateSlot(s.id, { healthMin: Number(e.target.value) })} className="w-full bg-[#080f09] border border-[#1a2e1a] p-1 rounded" />
                    <input type="number" step="0.1" value={s.healthMax} onChange={e => updateSlot(s.id, { healthMax: Number(e.target.value) })} className="w-full bg-[#080f09] border border-[#1a2e1a] p-1 rounded" />
                  </div>
                </div>
                <div>
                  <div className="text-[#3a6a3a] mb-1">QTY MIN/MAX (-1=NA)</div>
                  <div className="flex gap-1">
                    <input type="number" value={s.quantityMin} onChange={e => updateSlot(s.id, { quantityMin: Number(e.target.value) })} className="w-full bg-[#080f09] border border-[#1a2e1a] p-1 rounded" />
                    <input type="number" value={s.quantityMax} onChange={e => updateSlot(s.id, { quantityMax: Number(e.target.value) })} className="w-full bg-[#080f09] border border-[#1a2e1a] p-1 rounded" />
                  </div>
                </div>
                <div>
                  <div className="text-[#3a6a3a] mb-1">QUICKBAR SLOT</div>
                  <input type="number" value={s.quickBarSlot} onChange={e => updateSlot(s.id, { quickBarSlot: Number(e.target.value) })} className="w-full bg-[#080f09] border border-[#1a2e1a] p-1 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: JSON Preview */}
        <div className="w-80 shrink-0 border-l border-[#1a2e1a] flex flex-col">
          <div className="px-3 py-1.5 bg-[#0c1510] text-[10px] text-[#5a8a5a] border-b border-[#1a2e1a]">OUTPUT JSON</div>
          <textarea readOnly value={json} className="flex-1 bg-[#080f09] text-[#b09a6a] text-[9px] font-mono p-3 resize-none outline-none" />
        </div>
      </div>
    </div>
  );
}
