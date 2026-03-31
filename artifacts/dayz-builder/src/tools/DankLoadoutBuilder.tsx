import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { DAYZ_OBJECTS } from "@/lib/dayzObjects";

interface SlotItem {
  id: string;
  slotType: string;
  classname: string;
  chance: number;
  quantity: number;
  children: { classname: string; chance: number; quantity: number }[];
}

const SLOT_TYPES = ["Headgear","Mask","Eyewear","Gloves","Body","Vest","Back","Legs","Feet","Melee","Handgun","Primary","Secondary","Attachment"];
const CHARACTERS = ["All","SurvivorM_Boris","SurvivorM_Cyril","SurvivorM_Denis","SurvivorM_Elias","SurvivorM_Francis","SurvivorM_Guo","SurvivorM_Hassan","SurvivorM_Indar","SurvivorM_Jose","SurvivorM_Kaito","SurvivorM_Lewis","SurvivorM_Manua","SurvivorF_Frida","SurvivorF_Gabi","SurvivorF_Helen","SurvivorF_Irena","SurvivorF_Judy","SurvivorF_Keiko","SurvivorF_Linda","SurvivorF_Maria","SurvivorF_Naomi","SurvivorF_Olivia","SurvivorF_Paula"];

let _id = 0;
const uid = () => `slot_${++_id}`;

function downloadFile(content: string, name: string) {
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([content], { type: "application/json" })),
    download: name,
  });
  a.click();
}

export default function DankLoadoutBuilder() {
  const [, navigate] = useLocation();
  const [loadoutName, setLoadoutName] = useState("MyLoadout");
  const [spawnWeight, setSpawnWeight] = useState(100);
  const [character, setCharacter] = useState("All");
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [search, setSearch] = useState("");
  const [focusedField, setFocusedField] = useState<{ slotId: string; childIdx?: number } | null>(null);
  const [showHow, setShowHow] = useState(false);

  const filteredObjects = useMemo(() =>
    DAYZ_OBJECTS.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase())).slice(0, 50),
  [search]);

  function addSlot() {
    setSlots(prev => [...prev, { id: uid(), slotType: "Body", classname: "", chance: 100, quantity: 1, children: [] }]);
  }

  function updateSlot(id: string, patch: Partial<SlotItem>) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function removeSlot(id: string) {
    setSlots(prev => prev.filter(s => s.id !== id));
  }

  function addChild(slotId: string) {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, children: [...s.children, { classname: "", chance: 100, quantity: 1 }] } : s));
  }

  function updateChild(slotId: string, idx: number, patch: Partial<{ classname: string; chance: number; quantity: number }>) {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, children: s.children.map((c, i) => i === idx ? { ...c, ...patch } : c) } : s));
  }

  function removeChild(slotId: string, idx: number) {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, children: s.children.filter((_, i) => i !== idx) } : s));
  }

  function insertItem(classname: string) {
    if (!focusedField) return;
    if (focusedField.childIdx !== undefined) {
      updateChild(focusedField.slotId, focusedField.childIdx, { classname });
    } else {
      updateSlot(focusedField.slotId, { classname });
    }
    setSearch("");
  }

  const json = useMemo(() => {
    const charList = character === "All" ? CHARACTERS.filter(c => c !== "All") : [character];
    const output: Record<string, unknown> = {
      name: loadoutName,
      spawnWeight,
      characters: charList,
      items: slots.map(s => ({
        slotType: s.slotType,
        classname: s.classname,
        chance: s.chance,
        quantity: s.quantity,
        ...(s.children.length ? { children: s.children } : {}),
      })),
    };
    return JSON.stringify(output, null, 2);
  }, [loadoutName, spawnWeight, character, slots]);

  return (
    <div className="flex flex-col h-screen bg-[#080f09] text-[#b8d4b8] font-mono overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-[#1a2e1a] bg-[#0c1510] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px] font-bold">← HOME</button>
        <span className="text-[#e67e22] font-black text-[13px] tracking-widest">🎒 DANKLOADOUT BUILDER</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => downloadFile(json, `${loadoutName}.json`)} className="px-3 py-1 bg-[#e67e22] text-[#080f09] text-[10px] font-bold rounded hover:bg-[#f39c12]">⬇ EXPORT JSON</button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Config */}
        <div className="w-64 shrink-0 border-r border-[#1a2e1a] bg-[#0a1209] p-3 flex flex-col gap-3 overflow-y-auto">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden">
            <button onClick={() => setShowHow(h => !h)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0c1510] text-[10px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-3 py-2 text-[9px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Set a loadout name and spawn weight.</p>
                <p>2. Click "+ ADD SLOT" to add clothing/gear slots.</p>
                <p>3. Click a slot to focus it, then search and click an item to assign it.</p>
                <p>4. Add child items (attachments) inside each slot.</p>
                <p>5. Export the JSON for use with a loadout mod (e.g. DayZ-Expansion).</p>
              </div>
            )}
          </div>
          <div>
            <div className="text-[9px] text-[#3a6a3a] mb-1">LOADOUT NAME</div>
            <input value={loadoutName} onChange={e => setLoadoutName(e.target.value)} className="w-full bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded" />
          </div>
          <div>
            <div className="text-[9px] text-[#3a6a3a] mb-1">SPAWN WEIGHT</div>
            <input type="number" value={spawnWeight} onChange={e => setSpawnWeight(Number(e.target.value))} className="w-full bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded" />
          </div>
          <div>
            <div className="text-[9px] text-[#3a6a3a] mb-1">CHARACTER</div>
            <select value={character} onChange={e => setCharacter(e.target.value)} className="w-full bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1.5 rounded">
              {CHARACTERS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={addSlot} className="w-full py-2 bg-[#e67e22] text-[#080f09] font-black text-[11px] rounded hover:bg-[#f39c12]">+ ADD SLOT</button>

          {/* Item finder */}
          <div className="border-t border-[#1a2e1a] pt-3">
            <div className="text-[9px] text-[#3a6a3a] mb-1">ITEM FINDER {focusedField ? <span className="text-[#e67e22]">(click to insert)</span> : <span>(click a field first)</span>}</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="w-full bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1.5 rounded mb-1" />
            <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
              {filteredObjects.map(o => (
                <button key={o.value} onClick={() => insertItem(o.value)} className="text-left px-2 py-1 rounded text-[9px] hover:bg-[#1a2e1a] text-[#b8d4b8]">
                  <span className="text-[#5a8a5a]">{o.group} · </span>{o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slots */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {slots.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[#3a6a3a] text-[11px]">Click "+ ADD SLOT" to start building your loadout</div>
          )}
          {slots.map(slot => (
            <div key={slot.id} className="border border-[#1a2e1a] rounded bg-[#0a1209] p-3">
              <div className="flex items-center gap-2 mb-2">
                <select value={slot.slotType} onChange={e => updateSlot(slot.id, { slotType: e.target.value })} className="bg-[#0e1a0e] border border-[#1a2e1a] text-[#e67e22] text-[10px] px-2 py-1 rounded font-bold">
                  {SLOT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input
                  value={slot.classname}
                  onChange={e => updateSlot(slot.id, { classname: e.target.value })}
                  onFocus={() => setFocusedField({ slotId: slot.id })}
                  placeholder="Classname..."
                  className="flex-1 bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1 rounded font-mono"
                />
                <div className="flex items-center gap-1 text-[9px] text-[#5a8a5a]">
                  <span>Chance</span>
                  <input type="number" value={slot.chance} onChange={e => updateSlot(slot.id, { chance: Number(e.target.value) })} className="w-12 bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[9px] px-1 py-0.5 rounded text-center" />
                  <span>%</span>
                  <span className="ml-1">Qty</span>
                  <input type="number" value={slot.quantity} onChange={e => updateSlot(slot.id, { quantity: Number(e.target.value) })} className="w-10 bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[9px] px-1 py-0.5 rounded text-center" />
                </div>
                <button onClick={() => addChild(slot.id)} className="text-[9px] px-2 py-1 bg-[#0e2010] border border-[#1a2e1a] text-[#27ae60] rounded hover:border-[#27ae60]">+ Child</button>
                <button onClick={() => removeSlot(slot.id)} className="text-[9px] px-2 py-1 text-[#c0392b] hover:bg-[#1a0a0a] rounded">✕</button>
              </div>
              {slot.children.map((child, ci) => (
                <div key={ci} className="ml-4 flex items-center gap-2 mt-1">
                  <span className="text-[#3a6a3a] text-[9px]">└</span>
                  <input
                    value={child.classname}
                    onChange={e => updateChild(slot.id, ci, { classname: e.target.value })}
                    onFocus={() => setFocusedField({ slotId: slot.id, childIdx: ci })}
                    placeholder="Child classname..."
                    className="flex-1 bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[9px] px-2 py-0.5 rounded font-mono"
                  />
                  <input type="number" value={child.chance} onChange={e => updateChild(slot.id, ci, { chance: Number(e.target.value) })} className="w-12 bg-[#0e1a0e] border border-[#1a2e1a] text-[#b8d4b8] text-[9px] px-1 py-0.5 rounded text-center" />
                  <span className="text-[9px] text-[#3a6a3a]">%</span>
                  <button onClick={() => removeChild(slot.id, ci)} className="text-[9px] text-[#c0392b] hover:bg-[#1a0a0a] px-1 rounded">✕</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* JSON preview */}
        <div className="w-72 shrink-0 border-l border-[#1a2e1a] flex flex-col min-h-0">
          <div className="shrink-0 px-3 py-1.5 border-b border-[#1a2e1a] bg-[#0c1510] text-[10px] text-[#5a8a5a]">JSON PREVIEW</div>
          <textarea readOnly value={json} className="flex-1 bg-[#080f09] text-[#b8d4b8] text-[9px] font-mono p-2 resize-none border-0 outline-none leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
