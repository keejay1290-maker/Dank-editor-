import { useState, useCallback } from "react";
import {
  WEAPONS, WEAPON_MAP, ATTACHMENTS, ATTACHMENT_MAP,
  SLOT_LABELS, SLOT_COLORS, WEAPON_CATEGORIES,
  SlotType, WeaponDef,
} from "@/lib/weaponData";
import {
  VEHICLES, LOOT_ITEMS, LOOT_CATEGORIES,
  VehicleDef,
} from "@/lib/vehicleData";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface SlotState {
  attachId: string | null;
  dx: number;
  dy: number;
  dz: number;
}

interface VehicleLootSlot {
  itemClassname: string | null;
  qty: number;
}

const EMPTY_SLOT = (): SlotState => ({ attachId: null, dx: 0, dy: 0, dz: 0 });
const EMPTY_LOOT = (): VehicleLootSlot => ({ itemClassname: null, qty: 1 });

const ALL_SLOTS: SlotType[] = ['optic', 'muzzle', 'stock', 'magazine', 'handguard'];

// Build an id→vehicle lookup
const VEHICLE_MAP: Record<string, VehicleDef> = {};
VEHICLES.forEach(v => { VEHICLE_MAP[v.id] = v; });

// ─── WEAPON SILHOUETTE SVG ────────────────────────────────────────────────────

function WeaponDiagram({ weapon, slots }: {
  weapon: WeaponDef;
  slots: Record<SlotType, SlotState>;
}) {
  const W = 520, H = 200;
  const recX = W * 0.45, recY = H * 0.50;
  const stockX = W * 0.12;
  const muzzleX = W * 0.12 + (W * 0.82) * Math.min(1, weapon.barrelLen / 0.65);
  const barrelX2 = muzzleX;

  const anchors: Record<SlotType, [number, number]> = {
    optic:     [recX + 18, recY - 46],
    muzzle:    [barrelX2 + 10, recY],
    stock:     [stockX - 8, recY],
    magazine:  [recX + 8, recY + 52],
    handguard: [recX + 60, recY + 36],
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      style={{ fontFamily: 'monospace', userSelect: 'none' }}>
      <rect width={W} height={H} fill="#0a0804" />
      <rect x={stockX} y={recY - 10} width={recX - stockX} height={20} fill="#2a2016" stroke="#5a4820" strokeWidth="1" rx="2" />
      <rect x={recX - 20} y={recY + 10} width={22} height={32} fill="#2a2016" stroke="#5a4820" strokeWidth="1" rx="3" />
      <rect x={recX - 4} y={recY - 18} width={72} height={36} fill="#2e2416" stroke="#7a6030" strokeWidth="1.5" rx="3" />
      <path d={`M ${recX + 4} ${recY + 18} Q ${recX + 22} ${recY + 32} ${recX + 40} ${recY + 18}`}
        fill="none" stroke="#5a4820" strokeWidth="1.5" />
      <rect x={recX + 68} y={recY - 7} width={barrelX2 - (recX + 68)} height={14} fill="#252018" stroke="#5a4820" strokeWidth="1" rx="1" />
      <rect x={recX + 68} y={recY - 10} width={Math.min(80, barrelX2 - recX - 68)} height={20} fill="#2a2016" stroke="#5a4820" strokeWidth="1" rx="2" />
      <rect x={recX + 4} y={recY + 18} width={40} height={8} fill="#1e1810" stroke="#5a4820" strokeWidth="1" />
      <rect x={recX + 20} y={recY - 18} width={28} height={8} fill="#1a1408" stroke="#6a5020" strokeWidth="1" />
      <rect x={recX + 10} y={recY - 22} width={8} height={5} fill="#3a2e18" stroke="#7a6030" strokeWidth="1" />
      <rect x={barrelX2 - 14} y={recY - 16} width={4} height={9} fill="#3a2e18" stroke="#7a6030" strokeWidth="1" />
      {ALL_SLOTS.map(slot => {
        const state = slots[slot];
        const attId = state.attachId;
        const att   = attId ? ATTACHMENT_MAP[attId] : null;
        const color = SLOT_COLORS[slot];
        const [ax, ay] = anchors[slot];
        const active = !!att;
        return (
          <g key={slot}>
            <line x1={ax} y1={ay} x2={ax} y2={ay} stroke={active ? color : '#3a3020'} strokeWidth="1" strokeDasharray="2,2" />
            <circle cx={ax} cy={ay} r={active ? 9 : 6}
              fill={active ? color + '33' : '#1a1408'}
              stroke={active ? color : '#3a3020'}
              strokeWidth={active ? 2 : 1} />
            {active && (
              <>
                <text x={ax} y={ay + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fontWeight="bold" fill={color}>✓</text>
                <rect x={ax + 12} y={ay - 10} width={Math.min(140, att!.name.length * 5.5 + 8)} height={20}
                  fill="#12100a" stroke={color} strokeWidth="1" rx="3" />
                <text x={ax + 16} y={ay + 1} dominantBaseline="middle"
                  fontSize="8.5" fill={color} fontWeight="bold">
                  {att!.name.length > 22 ? att!.name.slice(0, 21) + '…' : att!.name}
                </text>
              </>
            )}
            {!active && (
              <text x={ax} y={ay + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fill="#5a4820">○</text>
            )}
          </g>
        );
      })}
      <text x="8" y="14" fontSize="11" fill="#d4a017" fontWeight="bold">{weapon.name}</text>
      <text x="8" y="26" fontSize="8.5" fill="#8a7840">{weapon.classname} · {weapon.category}</text>
      <text x={W - 8} y="14" fontSize="8" fill="#6a5a3a" textAnchor="end">TOP-DOWN VIEW</text>
      <text x={W - 8} y="24" fontSize="7" fill="#5a4820" textAnchor="end">← STOCK — MUZZLE →</text>
    </svg>
  );
}

// ─── VEHICLE SCHEMATIC SVG ───────────────────────────────────────────────────

function VehicleDiagram({ vehicle, lootSlots, onSlotClick, activeSlotId }: {
  vehicle: VehicleDef;
  lootSlots: Record<string, VehicleLootSlot>;
  onSlotClick: (slotId: string) => void;
  activeSlotId: string | null;
}) {
  const W = 520, H = 220;
  const ITEM_MAP: Record<string, string> = {};
  LOOT_ITEMS.forEach(i => { ITEM_MAP[i.classname] = i.name; });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      style={{ fontFamily: 'monospace', userSelect: 'none', cursor: 'pointer' }}>
      <rect width={W} height={H} fill="#0a0804" />

      {/* Vehicle body */}
      <rect x={W * 0.12} y={H * 0.25} width={W * 0.76} height={H * 0.50}
        fill="#1a1810" stroke="#3a3020" strokeWidth="1.5" rx="8" />
      <rect x={W * 0.22} y={H * 0.18} width={W * 0.56} height={H * 0.22}
        fill="#222018" stroke="#3a3020" strokeWidth="1" rx="4" />

      {/* Wheels */}
      {[[0.12, 0.28], [0.12, 0.62], [0.78, 0.28], [0.78, 0.62]].map(([wx, wy], i) => (
        <ellipse key={i} cx={W * wx} cy={H * wy} rx={W * 0.055} ry={H * 0.1}
          fill="#141208" stroke="#2a2418" strokeWidth="1.5" />
      ))}

      {/* Slot circles */}
      {vehicle.slots.map(slot => {
        const state = lootSlots[slot.id];
        const hasItem = !!state?.itemClassname;
        const isActive = activeSlotId === slot.id;
        const color = hasItem ? '#27ae60' : '#5a4820';
        const cx = (slot.svgX / 100) * W;
        const cy = (slot.svgY / 100) * H;
        const name = hasItem ? (ITEM_MAP[state.itemClassname!] ?? state.itemClassname!) : slot.label;

        return (
          <g key={slot.id} onClick={() => onSlotClick(slot.id)} style={{ cursor: 'pointer' }}>
            <circle cx={cx} cy={cy} r={isActive ? 13 : 10}
              fill={hasItem ? '#27ae6033' : isActive ? '#d4a01722' : '#1a1810'}
              stroke={isActive ? '#d4a017' : color}
              strokeWidth={isActive ? 2 : 1.5} />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill={isActive ? '#d4a017' : hasItem ? '#27ae60' : '#6a5a3a'}
              fontWeight="bold">
              {hasItem ? '✓' : '+'}
            </text>
            {/* Tooltip label */}
            {isActive && (
              <g>
                <rect x={cx - 55} y={cy - 28} width={110} height={16}
                  fill="#12100a" stroke="#d4a017" strokeWidth="1" rx="3" />
                <text x={cx} y={cy - 20} textAnchor="middle" dominantBaseline="middle"
                  fontSize="7.5" fill="#d4a017" fontWeight="bold">
                  {name.length > 18 ? name.slice(0, 17) + '…' : name}
                </text>
              </g>
            )}
          </g>
        );
      })}

      <text x="8" y="14" fontSize="11" fill="#3498db" fontWeight="bold">{vehicle.icon} {vehicle.name}</text>
      <text x="8" y="26" fontSize="8.5" fill="#8a7840">{vehicle.classname} · {vehicle.length}m × {vehicle.width}m</text>
      <text x={W - 8} y="14" fontSize="8" fill="#6a5a3a" textAnchor="end">TOP-DOWN VIEW</text>
      <text x={W - 8} y="24" fontSize="7" fill="#5a4820" textAnchor="end">Click slot to assign loot</text>
    </svg>
  );
}

// ─── WEAPON EXPORT ────────────────────────────────────────────────────────────

function buildWeaponExport(
  weapon: WeaponDef,
  slots: Record<SlotType, SlotState>,
  posX: number, posY: number, posZ: number,
  fmt: 'json' | 'initc',
): string {
  const items: { classname: string; x: number; y: number; z: number; note: string }[] = [];
  items.push({ classname: weapon.classname, x: posX, y: posY, z: posZ, note: 'weapon' });
  for (const slot of ALL_SLOTS) {
    const state = slots[slot];
    if (!state.attachId) continue;
    const att = ATTACHMENT_MAP[state.attachId];
    if (!att) continue;
    items.push({
      classname: att.classname,
      x: posX + att.offset.x + state.dx,
      y: posY + att.offset.y + state.dy,
      z: posZ + att.offset.z + state.dz,
      note: SLOT_LABELS[slot],
    });
  }
  if (fmt === 'json') {
    return JSON.stringify(
      items.map(i => ({ classname: i.classname, pos: [+i.x.toFixed(3), +i.y.toFixed(3), +i.z.toFixed(3)], ypr: [0,0,0], _slot: i.note })),
      null, 2
    );
  }
  return [
    `// ── ${weapon.name} Display Group ──────────────────────────────────`,
    `// Generated by DankDayZ Ultimate Builder — WEAPON DISPLAY TOOL`,
    `// Each item spawns separately — players pick up and attach themselves`,
    ``,
    ...items.map(i => `SpawnObject("${i.classname}", ${i.x.toFixed(3)}, ${i.y.toFixed(3)}, ${i.z.toFixed(3)}, 0, 0, 0); // ${i.note}`),
  ].join('\n');
}

// ─── VEHICLE EXPORT ───────────────────────────────────────────────────────────

function buildVehicleExport(
  vehicle: VehicleDef,
  lootSlots: Record<string, VehicleLootSlot>,
  posX: number, posY: number, posZ: number,
  vehYaw: number,
  fmt: 'json' | 'initc',
): string {
  const ITEM_MAP: Record<string, string> = {};
  LOOT_ITEMS.forEach(i => { ITEM_MAP[i.classname] = i.name; });

  const toRad = (deg: number) => deg * Math.PI / 180;
  const rotateXZ = (x: number, z: number, yaw: number): [number, number] => {
    const r = toRad(yaw);
    return [x * Math.cos(r) - z * Math.sin(r), x * Math.sin(r) + z * Math.cos(r)];
  };

  const items: { classname: string; x: number; y: number; z: number; note: string }[] = [];
  items.push({ classname: vehicle.classname, x: posX, y: posY, z: posZ, note: `${vehicle.name} (vehicle)` });

  vehicle.slots.forEach(slot => {
    const state = lootSlots[slot.id];
    if (!state?.itemClassname) return;
    const [rx, rz] = rotateXZ(slot.offsetX, slot.offsetZ, vehYaw);
    for (let q = 0; q < Math.max(1, state.qty); q++) {
      const spreadX = q > 0 ? (Math.random() - 0.5) * 0.3 : 0;
      const spreadZ = q > 0 ? (Math.random() - 0.5) * 0.3 : 0;
      items.push({
        classname: state.itemClassname,
        x: posX + rx + spreadX,
        y: posY + slot.offsetY,
        z: posZ + rz + spreadZ,
        note: slot.label,
      });
    }
  });

  if (fmt === 'json') {
    return JSON.stringify(
      items.map(i => ({ classname: i.classname, pos: [+i.x.toFixed(3), +i.y.toFixed(3), +i.z.toFixed(3)], ypr: [vehYaw, 0, 0], _slot: i.note })),
      null, 2
    );
  }
  return [
    `// ── ${vehicle.name} Display Group ──────────────────────────────────`,
    `// Generated by DankDayZ Ultimate Builder — VEHICLE DISPLAY TOOL`,
    `// Vehicle spawns with pre-positioned loot items`,
    ``,
    ...items.map((i, idx) =>
      `SpawnObject("${i.classname}", ${i.x.toFixed(3)}, ${i.y.toFixed(3)}, ${i.z.toFixed(3)}, ${idx === 0 ? vehYaw : 0}, 0, 0); // ${i.note}`
    ),
  ].join('\n');
}

// ─── WEAPON BUILDER PANEL ────────────────────────────────────────────────────

function WeaponPanel() {
  const [weaponId, setWeaponId]  = useState<string>(WEAPONS[0].id);
  const [slots, setSlots]        = useState<Record<SlotType, SlotState>>({
    optic: EMPTY_SLOT(), muzzle: EMPTY_SLOT(), stock: EMPTY_SLOT(),
    magazine: EMPTY_SLOT(), handguard: EMPTY_SLOT(),
  });
  const [posX, setPosX] = useState(7419.0);
  const [posY, setPosY] = useState(383.5);
  const [posZ, setPosZ] = useState(5695.0);
  const [fmt, setFmt]   = useState<'json' | 'initc'>('json');
  const [copied, setCopied] = useState(false);
  const [expandedSlot, setExpandedSlot] = useState<SlotType | null>(null);
  const [mobileView, setMobileView] = useState<'config' | 'output'>('config');

  const weapon = WEAPON_MAP[weaponId];

  const changeWeapon = useCallback((id: string) => {
    setWeaponId(id);
    const w = WEAPON_MAP[id];
    if (!w) return;
    setSlots(prev => {
      const next = { ...prev };
      for (const slot of ALL_SLOTS) {
        const attId = next[slot].attachId;
        if (attId && !w.attachments.includes(attId)) next[slot] = EMPTY_SLOT();
      }
      return next;
    });
    setExpandedSlot(null);
  }, []);

  const setSlotAttach = (slot: SlotType, attId: string | null) =>
    setSlots(prev => ({ ...prev, [slot]: { ...prev[slot], attachId: attId } }));

  const setSlotOffset = (slot: SlotType, axis: 'dx' | 'dy' | 'dz', val: number) =>
    setSlots(prev => ({ ...prev, [slot]: { ...prev[slot], [axis]: val } }));

  const clearAll = () => {
    setSlots({ optic: EMPTY_SLOT(), muzzle: EMPTY_SLOT(), stock: EMPTY_SLOT(), magazine: EMPTY_SLOT(), handguard: EMPTY_SLOT() });
    setExpandedSlot(null);
  };

  const output = buildWeaponExport(weapon, slots, posX, posY, posZ, fmt);
  const activeCount = ALL_SLOTS.filter(s => slots[s].attachId).length;

  const slotAttachments = (slot: SlotType) =>
    ATTACHMENTS.filter(a => a.slot === slot && weapon.attachments.includes(a.id));

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `weapon_${weapon.classname}.${fmt === 'json' ? 'json' : 'c'}`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile toggle — only visible on small screens */}
      <div className="flex sm:hidden border-b border-[#2e2518] bg-[#12100a] shrink-0">
        <button onClick={() => setMobileView('config')}
          className={`flex-1 py-2 text-[10px] font-bold transition-all border-b-2 ${mobileView === 'config' ? 'text-[#e67e22] border-[#e67e22]' : 'text-[#8a7840] border-transparent'}`}>
          ⚙ Configure
        </button>
        <button onClick={() => setMobileView('output')}
          className={`flex-1 py-2 text-[10px] font-bold transition-all border-b-2 ${mobileView === 'output' ? 'text-[#e67e22] border-[#e67e22]' : 'text-[#8a7840] border-transparent'}`}>
          📋 Output
        </button>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full sm:w-72 shrink-0 border-r border-[#2e2518] bg-[#0e0c08] flex-col overflow-y-auto ${mobileView === 'output' ? 'hidden sm:flex' : 'flex'}`}>
        <div className="px-3 py-2 border-b border-[#2e2518]">
          <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">Select Weapon</div>
          {WEAPON_CATEGORIES.map(cat => {
            const catWeapons = WEAPONS.filter(w => w.category === cat);
            if (catWeapons.length === 0) return null;
            return (
              <div key={cat} className="mb-2">
                <div className="text-[#6a5a3a] text-[8px] uppercase tracking-wider mb-1 pl-0.5">{cat}</div>
                <div className="flex flex-col gap-0.5">
                  {catWeapons.map(w => (
                    <button key={w.id} onClick={() => changeWeapon(w.id)}
                      className={`text-left px-2 py-1.5 rounded-sm text-[10px] font-bold transition-all border ${
                        weaponId === w.id ? 'bg-[#e67e22]/20 border-[#e67e22] text-[#e67e22]' : 'border-[#2e2518] text-[#b09a6a] hover:border-[#5a4820] hover:text-[#c8b99a]'
                      }`}>
                      {w.name}
                      <span className={`ml-1 text-[8px] font-normal ${weaponId === w.id ? 'text-[#e67e2299]' : 'text-[#6a5a3a]'}`}>{w.classname}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {weapon.note && (
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#8a7840] text-[9px] leading-relaxed">{weapon.note}</div>
          </div>
        )}

        <div className="px-3 py-2 border-b border-[#2e2518]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[#9a8858] text-[9px] uppercase tracking-wider">Attachments</div>
            {activeCount > 0 && (
              <button onClick={clearAll}
                className="text-[8px] text-[#c0392b] hover:text-[#e74c3c] border border-[#c0392b33] hover:border-[#c0392b] px-1.5 py-0.5 rounded-sm transition-all">
                Clear All
              </button>
            )}
          </div>
          {ALL_SLOTS.map(slot => {
            const availAtt = slotAttachments(slot);
            const disabled = availAtt.length === 0;
            const state    = slots[slot];
            const att      = state.attachId ? ATTACHMENT_MAP[state.attachId] : null;
            const color    = SLOT_COLORS[slot];
            const isExpanded = expandedSlot === slot;
            return (
              <div key={slot} className="mb-2">
                <button disabled={disabled} onClick={() => setExpandedSlot(isExpanded ? null : slot)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm border text-left transition-all ${
                    disabled ? 'border-[#1e1c18] text-[#3a3020] cursor-not-allowed opacity-50'
                    : att ? 'border-[#3a3020] bg-[#0f0e0a]' : 'border-[#2e2518] hover:border-[#5a4820]'
                  }`}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: disabled ? '#3a3020' : color }} />
                  <span className="flex-1 text-[10px] font-bold" style={{ color: disabled ? '#3a3020' : att ? color : '#b09a6a' }}>
                    {SLOT_LABELS[slot]}
                  </span>
                  {disabled && <span className="text-[8px] text-[#4a3820]">N/A</span>}
                  {!disabled && !att && <span className="text-[8px] text-[#5a4820]">— none —</span>}
                  {att && <span className="text-[8px] truncate max-w-[80px]" style={{ color }}>{att.name}</span>}
                  {!disabled && <span className="text-[#5a4820] text-[9px]">{isExpanded ? '▲' : '▼'}</span>}
                </button>
                {isExpanded && !disabled && (
                  <div className="mt-1 ml-2 border-l border-[#2e2518] pl-2 flex flex-col gap-1">
                    <button onClick={() => setSlotAttach(slot, null)}
                      className={`text-left px-2 py-1 text-[9px] rounded-sm border transition-all ${
                        !state.attachId ? 'border-[#5a4820] text-[#c8b99a] bg-[#1a1408]' : 'border-[#1e1c18] text-[#6a5a3a] hover:border-[#3a2e18]'
                      }`}>
                      — No {SLOT_LABELS[slot].split(' ')[1] || 'attachment'} —
                    </button>
                    {availAtt.map(a => (
                      <button key={a.id} onClick={() => setSlotAttach(slot, a.id)}
                        className={`text-left px-2 py-1 text-[9px] rounded-sm border transition-all ${
                          state.attachId === a.id ? 'border-current bg-[#0f0e0a]' : 'border-[#1e1c18] text-[#8a7840] hover:border-[#3a2e18] hover:text-[#b09a6a]'
                        }`}
                        style={{ color: state.attachId === a.id ? color : undefined }}>
                        <div className="font-bold">{a.name}</div>
                        <div className="text-[7.5px] opacity-70">{a.classname}</div>
                        {a.note && <div className="text-[7px] mt-0.5 opacity-60">{a.note}</div>}
                      </button>
                    ))}
                    {state.attachId && (
                      <div className="mt-1 bg-[#0d0b07] border border-[#1e1c18] rounded-sm px-2 py-1.5">
                        <div className="text-[8px] text-[#6a5a3a] mb-1.5 uppercase tracking-wider">Fine-tune position</div>
                        {(['dx', 'dy', 'dz'] as const).map(axis => (
                          <div key={axis} className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] w-12 text-[#8a7840]">
                              {axis === 'dx' ? 'X (±fwd)' : axis === 'dy' ? 'Y (±up)' : 'Z (±side)'}
                            </span>
                            <input type="range" min="-0.5" max="0.5" step="0.005"
                              value={state[axis]}
                              onChange={e => setSlotOffset(slot, axis, +e.target.value)}
                              className="flex-1 h-1 accent-[#e67e22]" />
                            <span className="text-[8px] text-[#c8b99a] w-10 text-right">
                              {state[axis] >= 0 ? '+' : ''}{state[axis].toFixed(3)}
                            </span>
                          </div>
                        ))}
                        <button onClick={() => setSlots(prev => ({ ...prev, [slot]: { ...prev[slot], dx: 0, dy: 0, dz: 0 } }))}
                          className="text-[7px] text-[#6a5a3a] hover:text-[#9a8858] transition-all mt-0.5">
                          Reset offsets
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-3 py-2 border-b border-[#2e2518]">
          <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">Weapon World Position</div>
          {(['X','Y','Z'] as const).map((axis, i) => {
            const val = [posX, posY, posZ][i];
            const set = [setPosX, setPosY, setPosZ][i];
            return (
              <div key={axis} className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-[#8a7840] w-5 font-bold">{axis}</span>
                <input type="number" step="0.1" value={val} onChange={e => set(+e.target.value)}
                  className="flex-1 bg-[#12100a] border border-[#2e2518] rounded-sm px-2 py-0.5 text-[10px] text-[#c8b99a] focus:outline-none focus:border-[#e67e22] min-w-0" />
              </div>
            );
          })}
        </div>

        <div className="px-3 py-2">
          <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">Export Format</div>
          <div className="flex gap-1">
            {(['json', 'initc'] as const).map(f => (
              <button key={f} onClick={() => setFmt(f)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-all ${
                  fmt === f ? 'bg-[#e67e22] text-[#0a0804] border-[#e67e22]' : 'text-[#b09a6a] border-[#2e2518] hover:border-[#6a5820]'
                }`}>
                {f === 'json' ? 'JSON' : 'init.c'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className={`flex-1 flex-col overflow-hidden min-w-0 ${mobileView === 'config' ? 'hidden sm:flex' : 'flex'}`}>
        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#0e0c08] border-b border-[#2e2518] shrink-0">
          <span className="text-[#e67e22] font-bold text-[11px]">{weapon.name}</span>
          <span className="text-[#6a5a3a] text-[10px]">{weapon.classname}</span>
          <span className="text-[#9a8858] text-[10px]">· {activeCount} attachment{activeCount !== 1 ? 's' : ''} · {activeCount + 1} objects</span>
          <div className="ml-auto flex gap-1.5">
            <button onClick={copy} className={`px-3 py-1 text-[10px] font-bold border rounded-sm transition-all ${
              copied ? 'bg-[#27ae60] text-[#0a0804] border-[#27ae60]' : 'border-[#e67e22] text-[#e67e22] hover:bg-[#e67e22] hover:text-[#0a0804]'
            }`}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button onClick={download}
              className="px-3 py-1 text-[10px] font-bold bg-[#e67e22] text-[#0a0804] border border-[#e67e22] rounded-sm hover:bg-[#d35400] hover:border-[#d35400] transition-all">
              ⬇ Download
            </button>
          </div>
        </div>
        <div className="bg-[#060402] border-b border-[#2e2518] shrink-0" style={{ height: '200px' }}>
          <WeaponDiagram weapon={weapon} slots={slots} />
        </div>
        <div className="flex gap-2 px-3 py-2 bg-[#0a0906] border-b border-[#2e2518] shrink-0 overflow-x-auto">
          {ALL_SLOTS.map(slot => {
            const att   = slots[slot].attachId ? ATTACHMENT_MAP[slots[slot].attachId!] : null;
            const color = SLOT_COLORS[slot];
            const avail = slotAttachments(slot).length > 0;
            return (
              <div key={slot} className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: avail ? (att ? color : '#3a3020') : '#1e1c18' }} />
                <span className="text-[9px]" style={{ color: att ? color : avail ? '#5a4820' : '#2a2018' }}>
                  {att ? att.name : (avail ? `No ${slot}` : `${slot} N/A`)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2e2518] bg-[#0e0c08] shrink-0">
            <span className="text-[#e67e22] text-[10px] font-bold tracking-wider">
              ▶ {fmt === 'json' ? 'JSON SPAWNER' : 'INIT.C OUTPUT'}
            </span>
            <span className="text-[#6a5a3a] text-[9px]">
              {fmt === 'json' ? '— paste into JSON Spawner mod' : '— paste into your mission init.c SpawnObject() block'}
            </span>
          </div>
          <pre className="flex-1 overflow-auto px-3 py-2 text-[10px] text-[#c8b99a] leading-relaxed whitespace-pre bg-[#070503]">{output}</pre>
        </div>
        <div className="px-3 py-1.5 border-t border-[#2e2518] bg-[#0e0c08] shrink-0">
          <div className="text-[8px] text-[#6a5a3a] leading-relaxed">
            💡 Tip: Spawn all items at the same time so they appear together. Lay the weapon flat (ypr 0,0,0). Players pick up attachments and slot them manually.
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── VEHICLE BUILDER PANEL ───────────────────────────────────────────────────

function VehiclePanel() {
  const [vehicleId, setVehicleId] = useState(VEHICLES[0].id);
  const [lootSlots, setLootSlots] = useState<Record<string, VehicleLootSlot>>({});
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [lootCategory, setLootCategory] = useState("All");
  const [lootSearch, setLootSearch] = useState("");
  const [posX, setPosX] = useState(7419.0);
  const [posY, setPosY] = useState(383.5);
  const [posZ, setPosZ] = useState(5695.0);
  const [vehYaw, setVehYaw] = useState(0);
  const [fmt, setFmt] = useState<'json' | 'initc'>('json');
  const [copied, setCopied] = useState(false);
  const [mobileView, setMobileView] = useState<'config' | 'output'>('config');

  const vehicle = VEHICLE_MAP[vehicleId];

  const changeVehicle = (id: string) => {
    setVehicleId(id);
    setLootSlots({});
    setActiveSlotId(null);
  };

  const setSlotItem = (slotId: string, classname: string | null) =>
    setLootSlots(prev => ({ ...prev, [slotId]: { ...prev[slotId], itemClassname: classname, qty: prev[slotId]?.qty ?? 1 } }));

  const setSlotQty = (slotId: string, qty: number) =>
    setLootSlots(prev => ({ ...prev, [slotId]: { ...prev[slotId], qty } }));

  const clearAll = () => { setLootSlots({}); setActiveSlotId(null); };

  const filteredItems = LOOT_ITEMS.filter(i => {
    const catOk = lootCategory === "All" || i.category === lootCategory;
    const q = lootSearch.trim().toLowerCase();
    const searchOk = !q || i.name.toLowerCase().includes(q) || i.classname.toLowerCase().includes(q);
    return catOk && searchOk;
  });
  const filledCount = vehicle.slots.filter(s => lootSlots[s.id]?.itemClassname).length;

  const output = buildVehicleExport(vehicle, lootSlots, posX, posY, posZ, vehYaw, fmt);

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vehicle_${vehicle.classname}.${fmt === 'json' ? 'json' : 'c'}`;
    a.click();
  };

  const activeSlot = vehicle.slots.find(s => s.id === activeSlotId) ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile toggle — only visible on small screens */}
      <div className="flex sm:hidden border-b border-[#2e2518] bg-[#12100a] shrink-0">
        <button onClick={() => setMobileView('config')}
          className={`flex-1 py-2 text-[10px] font-bold transition-all border-b-2 ${mobileView === 'config' ? 'text-[#3498db] border-[#3498db]' : 'text-[#8a7840] border-transparent'}`}>
          ⚙ Configure
        </button>
        <button onClick={() => setMobileView('output')}
          className={`flex-1 py-2 text-[10px] font-bold transition-all border-b-2 ${mobileView === 'output' ? 'text-[#3498db] border-[#3498db]' : 'text-[#8a7840] border-transparent'}`}>
          📋 Output
        </button>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full sm:w-72 shrink-0 border-r border-[#2e2518] bg-[#0e0c08] flex-col overflow-y-auto ${mobileView === 'output' ? 'hidden sm:flex' : 'flex'}`}>
        <div className="px-3 py-2 border-b border-[#2e2518]">
          <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">Select Vehicle</div>
          <div className="flex flex-col gap-0.5">
            {VEHICLES.map(v => (
              <button key={v.id} onClick={() => changeVehicle(v.id)}
                className={`text-left px-2 py-1.5 rounded-sm text-[10px] font-bold transition-all border ${
                  vehicleId === v.id ? 'bg-[#3498db]/20 border-[#3498db] text-[#3498db]' : 'border-[#2e2518] text-[#b09a6a] hover:border-[#4a6a8a] hover:text-[#c8b99a]'
                }`}>
                <span className="mr-1.5">{v.icon}</span>{v.name}
                <div className={`text-[7.5px] font-normal mt-0.5 ${vehicleId === v.id ? 'text-[#3498db99]' : 'text-[#6a5a3a]'}`}>
                  {v.classname} · {v.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active slot loot picker */}
        <div className="px-3 py-2 border-b border-[#2e2518] flex-1">
          {activeSlotId ? (
            <>
              <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1">
                Loot for: <span className="text-[#3498db]">{activeSlot?.label}</span>
              </div>

              {/* Qty */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] text-[#8a7840]">Qty:</span>
                <input type="number" min={1} max={5} step={1}
                  value={lootSlots[activeSlotId]?.qty ?? 1}
                  onChange={e => setSlotQty(activeSlotId, Math.max(1, Math.min(5, +e.target.value)))}
                  className="w-14 bg-[#12100a] border border-[#2e2518] rounded-sm px-1.5 py-0.5 text-[10px] text-[#c8b99a] focus:outline-none focus:border-[#3498db]" />
                <span className="text-[8px] text-[#6a5a3a]">(1–5 copies)</span>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search items..."
                value={lootSearch}
                onChange={e => setLootSearch(e.target.value)}
                className="w-full bg-[#060402] border border-[#2e2518] text-[#c8b99a] text-[9px] px-2 py-0.5 rounded-sm mb-1.5 focus:outline-none focus:border-[#3498db]"
              />

              {/* Category filter */}
              <div className="flex flex-wrap gap-0.5 mb-1.5">
                {['All', ...LOOT_CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setLootCategory(cat)}
                    className={`text-[8px] px-1.5 py-0.5 rounded-sm border transition-all ${
                      lootCategory === cat ? 'border-[#3498db] text-[#3498db] bg-[#0e1820]' : 'border-[#2e2518] text-[#8a7840] hover:text-[#b09a6a]'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* None option */}
              <button onClick={() => setSlotItem(activeSlotId, null)}
                className={`w-full text-left px-2 py-1 text-[9px] rounded-sm border transition-all mb-1 ${
                  !lootSlots[activeSlotId]?.itemClassname ? 'border-[#5a4820] text-[#c8b99a] bg-[#1a1408]' : 'border-[#1e1c18] text-[#6a5a3a] hover:border-[#3a2e18]'
                }`}>— Empty (no loot) —</button>

              <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
                {filteredItems.length === 0 && (
                  <div className="text-[#6a5a3a] text-[8px] text-center py-3">No items match — try a different search or category</div>
                )}
                {filteredItems.map(item => {
                  const isSelected = lootSlots[activeSlotId]?.itemClassname === item.classname;
                  return (
                    <button key={item.classname} onClick={() => setSlotItem(activeSlotId, item.classname)}
                      className={`text-left px-2 py-1 text-[9px] rounded-sm border transition-all ${
                        isSelected ? 'border-[#3498db] text-[#3498db] bg-[#0e1820]' : 'border-[#1e1c18] text-[#8a7840] hover:border-[#3a2e18] hover:text-[#b09a6a]'
                      }`}>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-[7px] opacity-60">{item.classname}</div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-[#6a5a3a] text-[9px] leading-relaxed py-2">
              Click a slot on the vehicle diagram to assign loot to it. Slots marked with <span className="text-[#27ae60]">✓</span> have items assigned.
            </div>
          )}
        </div>

        {filledCount > 0 && (
          <div className="px-3 py-1.5 border-b border-[#2e2518]">
            <button onClick={clearAll}
              className="w-full text-[8px] text-[#c0392b] hover:text-[#e74c3c] border border-[#c0392b33] hover:border-[#c0392b] px-1.5 py-1 rounded-sm transition-all">
              Clear All Loot
            </button>
          </div>
        )}

        <div className="px-3 py-2 border-b border-[#2e2518]">
          <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">Vehicle World Position</div>
          {(['X','Y','Z'] as const).map((axis, i) => {
            const val = [posX, posY, posZ][i];
            const set = [setPosX, setPosY, setPosZ][i];
            return (
              <div key={axis} className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-[#8a7840] w-5 font-bold">{axis}</span>
                <input type="number" step="0.1" value={val} onChange={e => set(+e.target.value)}
                  className="flex-1 bg-[#12100a] border border-[#2e2518] rounded-sm px-2 py-0.5 text-[10px] text-[#c8b99a] focus:outline-none focus:border-[#3498db] min-w-0" />
              </div>
            );
          })}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] text-[#8a7840] w-10 font-bold">Yaw°</span>
            <input type="number" step="1" min={0} max={360} value={vehYaw} onChange={e => setVehYaw(+e.target.value)}
              className="flex-1 bg-[#12100a] border border-[#2e2518] rounded-sm px-2 py-0.5 text-[10px] text-[#c8b99a] focus:outline-none focus:border-[#3498db] min-w-0" />
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">Export Format</div>
          <div className="flex gap-1">
            {(['json', 'initc'] as const).map(f => (
              <button key={f} onClick={() => setFmt(f)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-all ${
                  fmt === f ? 'bg-[#3498db] text-[#0a0804] border-[#3498db]' : 'text-[#b09a6a] border-[#2e2518] hover:border-[#3a6a9a]'
                }`}>
                {f === 'json' ? 'JSON' : 'init.c'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className={`flex-1 flex-col overflow-hidden min-w-0 ${mobileView === 'config' ? 'hidden sm:flex' : 'flex'}`}>
        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#0e0c08] border-b border-[#2e2518] shrink-0">
          <span className="text-[#3498db] font-bold text-[11px]">{vehicle.icon} {vehicle.name}</span>
          <span className="text-[#6a5a3a] text-[10px]">{vehicle.classname}</span>
          <span className="text-[#9a8858] text-[10px]">· {filledCount}/{vehicle.slots.length} slots filled</span>
          <div className="ml-auto flex gap-1.5">
            <button onClick={copy} className={`px-3 py-1 text-[10px] font-bold border rounded-sm transition-all ${
              copied ? 'bg-[#27ae60] text-[#0a0804] border-[#27ae60]' : 'border-[#3498db] text-[#3498db] hover:bg-[#3498db] hover:text-[#0a0804]'
            }`}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button onClick={download}
              className="px-3 py-1 text-[10px] font-bold bg-[#3498db] text-[#0a0804] border border-[#3498db] rounded-sm hover:bg-[#2980b9] hover:border-[#2980b9] transition-all">
              ⬇ Download
            </button>
          </div>
        </div>

        {/* Filled slot summary */}
        {filledCount > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-[#2e2518] bg-[#0a0906] shrink-0">
            {vehicle.slots.filter(s => lootSlots[s.id]?.itemClassname).map(slot => {
              const item = LOOT_ITEMS.find(i => i.classname === lootSlots[slot.id]?.itemClassname);
              const qty = lootSlots[slot.id]?.qty ?? 1;
              return (
                <div key={slot.id} className="flex items-center gap-1 bg-[#0e1820] border border-[#3498db33] rounded-sm px-1.5 py-0.5">
                  <span className="text-[#3498db] text-[8px] font-bold">{slot.label}:</span>
                  <span className="text-[#c8b99a] text-[8px]">{item?.name ?? lootSlots[slot.id].itemClassname}</span>
                  {qty > 1 && <span className="text-[#6a9abf] text-[7px]">×{qty}</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Diagram */}
        <div className="bg-[#060402] border-b border-[#2e2518] shrink-0" style={{ height: '220px' }}>
          <VehicleDiagram
            vehicle={vehicle}
            lootSlots={lootSlots}
            onSlotClick={id => setActiveSlotId(prev => prev === id ? null : id)}
            activeSlotId={activeSlotId}
          />
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2e2518] bg-[#0e0c08] shrink-0">
            <span className="text-[#3498db] text-[10px] font-bold tracking-wider">
              ▶ {fmt === 'json' ? 'JSON SPAWNER' : 'INIT.C OUTPUT'}
            </span>
            <span className="text-[#6a5a3a] text-[9px]">vehicle + {filledCount} loot item{filledCount !== 1 ? 's' : ''}</span>
          </div>
          <pre className="flex-1 overflow-auto px-3 py-2 text-[10px] text-[#c8b99a] leading-relaxed whitespace-pre bg-[#070503]">{output}</pre>
        </div>
        <div className="px-3 py-1.5 border-t border-[#2e2518] bg-[#0e0c08] shrink-0">
          <div className="text-[8px] text-[#6a5a3a] leading-relaxed">
            💡 Tip: Vehicle spawns first, then loot items around/inside it. Loot positions auto-rotate with vehicle yaw. All items appear on server restart.
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function WeaponBuilder() {
  const [subTab, setSubTab] = useState<'weapons' | 'vehicles'>('weapons');

  return (
    <div className="flex flex-col h-full bg-[#0a0804] text-[#c8b99a] font-mono overflow-hidden">

      {/* Sub-tab bar */}
      <div className="flex items-center gap-0 border-b border-[#2e2518] bg-[#0e0c08] shrink-0">
        <button onClick={() => setSubTab('weapons')}
          className={`px-4 py-2.5 text-[11px] font-black tracking-wider transition-all border-b-2 ${
            subTab === 'weapons'
              ? 'border-[#e67e22] text-[#e67e22] bg-[#0e0c08]'
              : 'border-transparent text-[#8a7840] hover:text-[#c8b99a]'
          }`}>
          🔫 WEAPON DISPLAY
        </button>
        <button onClick={() => setSubTab('vehicles')}
          className={`px-4 py-2.5 text-[11px] font-black tracking-wider transition-all border-b-2 ${
            subTab === 'vehicles'
              ? 'border-[#3498db] text-[#3498db] bg-[#0e0c08]'
              : 'border-transparent text-[#8a7840] hover:text-[#c8b99a]'
          }`}>
          🚗 VEHICLE DISPLAY
        </button>
        <div className="ml-auto px-3 py-2 text-[8px] text-[#5a4820]">
          {subTab === 'weapons' ? `${WEAPONS.length} weapons · ${Object.keys(ATTACHMENT_MAP).length} attachments` : `${VEHICLES.length} vehicles · ${LOOT_ITEMS.length} loot items`}
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {subTab === 'weapons' ? <WeaponPanel /> : <VehiclePanel />}
      </div>
    </div>
  );
}
