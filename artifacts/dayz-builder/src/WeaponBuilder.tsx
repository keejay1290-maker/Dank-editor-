import { useState, useCallback } from "react";
import {
  WEAPONS, WEAPON_MAP, ATTACHMENTS, ATTACHMENT_MAP,
  SLOT_LABELS, SLOT_COLORS, WEAPON_CATEGORIES,
  SlotType, WeaponDef,
} from "@/lib/weaponData";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface SlotState {
  attachId: string | null;
  dx: number; // extra offset from default (metres)
  dy: number;
  dz: number;
}

const EMPTY_SLOT = (): SlotState => ({ attachId: null, dx: 0, dy: 0, dz: 0 });

const ALL_SLOTS: SlotType[] = ['optic', 'muzzle', 'stock', 'magazine', 'handguard'];

// ─── WEAPON SILHOUETTE SVG ────────────────────────────────────────────────────

function WeaponDiagram({ weapon, slots }: {
  weapon: WeaponDef;
  slots: Record<SlotType, SlotState>;
}) {
  const W = 520, H = 200;
  // Weapon layout: receiver centered at x=55%, barrel goes right, stock goes left
  const recX = W * 0.45, recY = H * 0.50;
  const stockX = W * 0.12;
  const muzzleX = W * 0.12 + (W * 0.82) * Math.min(1, weapon.barrelLen / 0.65);
  const barrelX2 = muzzleX;

  // Slot anchor points (diagram pixel positions)
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

      {/* Background */}
      <rect width={W} height={H} fill="#0a0804" />

      {/* ── Weapon silhouette ── */}
      {/* Stock */}
      <rect x={stockX} y={recY - 10} width={recX - stockX} height={20} fill="#2a2016" stroke="#5a4820" strokeWidth="1" rx="2" />
      {/* Pistol grip */}
      <rect x={recX - 20} y={recY + 10} width={22} height={32} fill="#2a2016" stroke="#5a4820" strokeWidth="1" rx="3" />
      {/* Receiver */}
      <rect x={recX - 4} y={recY - 18} width={72} height={36} fill="#2e2416" stroke="#7a6030" strokeWidth="1.5" rx="3" />
      {/* Trigger guard */}
      <path d={`M ${recX + 4} ${recY + 18} Q ${recX + 22} ${recY + 32} ${recX + 40} ${recY + 18}`}
        fill="none" stroke="#5a4820" strokeWidth="1.5" />
      {/* Barrel */}
      <rect x={recX + 68} y={recY - 7} width={barrelX2 - (recX + 68)} height={14} fill="#252018" stroke="#5a4820" strokeWidth="1" rx="1" />
      {/* Handguard on barrel */}
      <rect x={recX + 68} y={recY - 10} width={Math.min(80, barrelX2 - recX - 68)} height={20} fill="#2a2016" stroke="#5a4820" strokeWidth="1" rx="2" />
      {/* Magazine well */}
      <rect x={recX + 4} y={recY + 18} width={40} height={8} fill="#1e1810" stroke="#5a4820" strokeWidth="1" />
      {/* Ejection port */}
      <rect x={recX + 20} y={recY - 18} width={28} height={8} fill="#1a1408" stroke="#6a5020" strokeWidth="1" />
      {/* Iron sight rear */}
      <rect x={recX + 10} y={recY - 22} width={8} height={5} fill="#3a2e18" stroke="#7a6030" strokeWidth="1" />
      {/* Iron sight front */}
      <rect x={barrelX2 - 14} y={recY - 16} width={4} height={9} fill="#3a2e18" stroke="#7a6030" strokeWidth="1" />

      {/* ── Attachment indicators ── */}
      {ALL_SLOTS.map(slot => {
        const state = slots[slot];
        const attId = state.attachId;
        const att   = attId ? ATTACHMENT_MAP[attId] : null;
        const color = SLOT_COLORS[slot];
        const [ax, ay] = anchors[slot];
        const active = !!att;

        return (
          <g key={slot}>
            {/* Leader line */}
            <line x1={ax} y1={ay} x2={ax} y2={ay} stroke={active ? color : '#3a3020'} strokeWidth="1" strokeDasharray="2,2" />
            {/* Marker circle */}
            <circle cx={ax} cy={ay} r={active ? 9 : 6}
              fill={active ? color + '33' : '#1a1408'}
              stroke={active ? color : '#3a3020'}
              strokeWidth={active ? 2 : 1} />
            {active && (
              <>
                <text x={ax} y={ay + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fontWeight="bold" fill={color}>✓</text>
                {/* Label bubble */}
                <rect x={ax + 12} y={ay - 10} width={Math.min(140, att.name.length * 5.5 + 8)} height={20}
                  fill="#12100a" stroke={color} strokeWidth="1" rx="3" />
                <text x={ax + 16} y={ay + 1} dominantBaseline="middle"
                  fontSize="8.5" fill={color} fontWeight="bold">
                  {att.name.length > 22 ? att.name.slice(0, 21) + '…' : att.name}
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

      {/* Weapon label */}
      <text x="8" y="14" fontSize="11" fill="#d4a017" fontWeight="bold">{weapon.name}</text>
      <text x="8" y="26" fontSize="8.5" fill="#8a7840">{weapon.classname} · {weapon.category}</text>

      {/* Legend */}
      <text x={W - 8} y="14" fontSize="8" fill="#6a5a3a" textAnchor="end">TOP-DOWN VIEW</text>
      <text x={W - 8} y="24" fontSize="7" fill="#5a4820" textAnchor="end">← STOCK — MUZZLE →</text>
    </svg>
  );
}

// ─── JSON EXPORT ─────────────────────────────────────────────────────────────

function buildExport(
  weapon: WeaponDef,
  slots: Record<SlotType, SlotState>,
  posX: number, posY: number, posZ: number,
  fmt: 'json' | 'initc',
): string {
  const items: { classname: string; x: number; y: number; z: number; note: string }[] = [];

  // Weapon itself
  items.push({ classname: weapon.classname, x: posX, y: posY, z: posZ, note: 'weapon' });

  // Each active attachment
  for (const slot of ALL_SLOTS) {
    const state = slots[slot];
    if (!state.attachId) continue;
    const att = ATTACHMENT_MAP[state.attachId];
    if (!att) continue;
    const x = posX + att.offset.x + state.dx;
    const y = posY + att.offset.y + state.dy;
    const z = posZ + att.offset.z + state.dz;
    items.push({ classname: att.classname, x, y, z, note: SLOT_LABELS[slot] });
  }

  if (fmt === 'json') {
    return JSON.stringify(
      items.map(i => ({
        classname: i.classname,
        pos: [+i.x.toFixed(3), +i.y.toFixed(3), +i.z.toFixed(3)],
        ypr: [0, 0, 0],
        _slot: i.note,
      })),
      null, 2
    );
  }

  // init.c format
  const lines = [
    `// ── ${weapon.name} Display Group ──────────────────────────────────`,
    `// Generated by DankDayZ Ultimate Builder — WEAPON DISPLAY TOOL`,
    `// Each item spawns separately — players pick up and attach themselves`,
    `// Paste inside your mission's init.c SpawnObject() block`,
    ``,
    ...items.map(i =>
      `SpawnObject("${i.classname}", ${i.x.toFixed(3)}, ${i.y.toFixed(3)}, ${i.z.toFixed(3)}, 0, 0, 0); // ${i.note}`
    ),
  ];
  return lines.join('\n');
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function WeaponBuilder() {
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

  const weapon = WEAPON_MAP[weaponId];

  // When weapon changes, clear any slots whose attachment is no longer compatible
  const changeWeapon = useCallback((id: string) => {
    setWeaponId(id);
    const w = WEAPON_MAP[id];
    if (!w) return;
    setSlots(prev => {
      const next = { ...prev };
      for (const slot of ALL_SLOTS) {
        const attId = next[slot].attachId;
        if (attId && !w.attachments.includes(attId)) {
          next[slot] = EMPTY_SLOT();
        }
      }
      return next;
    });
    setExpandedSlot(null);
  }, []);

  const setSlotAttach = (slot: SlotType, attId: string | null) => {
    setSlots(prev => ({ ...prev, [slot]: { ...prev[slot], attachId: attId } }));
  };

  const setSlotOffset = (slot: SlotType, axis: 'dx' | 'dy' | 'dz', val: number) => {
    setSlots(prev => ({ ...prev, [slot]: { ...prev[slot], [axis]: val } }));
  };

  const clearAll = () => {
    setSlots({ optic: EMPTY_SLOT(), muzzle: EMPTY_SLOT(), stock: EMPTY_SLOT(), magazine: EMPTY_SLOT(), handguard: EMPTY_SLOT() });
    setExpandedSlot(null);
  };

  const output = buildExport(weapon, slots, posX, posY, posZ, fmt);

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const download = () => {
    const ext = fmt === 'json' ? 'json' : 'c';
    const blob = new Blob([output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `weapon_${weapon.classname}.${ext}`;
    a.click();
  };

  // Attachments for this weapon, grouped by slot
  const slotAttachments = (slot: SlotType) =>
    ATTACHMENTS.filter(a => a.slot === slot && weapon.attachments.includes(a.id));

  const activeCount = ALL_SLOTS.filter(s => slots[s].attachId).length;

  return (
    <div className="flex h-full bg-[#0a0804] text-[#c8b99a] font-mono overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-72 shrink-0 border-r border-[#2e2518] bg-[#0e0c08] flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="px-3 py-2.5 border-b border-[#2e2518] bg-[#12100a]">
          <div className="text-[#e67e22] text-[11px] font-black tracking-widest">🔫 WEAPON DISPLAY BUILDER</div>
          <div className="text-[#8a7840] text-[9px] mt-0.5 leading-relaxed">
            Spawn weapons + attachments as separate items that LOOK attached.
            Players pick them up and attach themselves.
          </div>
        </div>

        {/* Weapon Selector */}
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
                    <button key={w.id}
                      onClick={() => changeWeapon(w.id)}
                      className={`text-left px-2 py-1.5 rounded-sm text-[10px] font-bold transition-all border ${
                        weaponId === w.id
                          ? 'bg-[#e67e22]/20 border-[#e67e22] text-[#e67e22]'
                          : 'border-[#2e2518] text-[#b09a6a] hover:border-[#5a4820] hover:text-[#c8b99a]'
                      }`}>
                      {w.name}
                      <span className={`ml-1 text-[8px] font-normal ${weaponId === w.id ? 'text-[#e67e2299]' : 'text-[#6a5a3a]'}`}>
                        {w.classname}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weapon info */}
        {weapon.note && (
          <div className="px-3 py-2 border-b border-[#2e2518]">
            <div className="text-[#8a7840] text-[9px] leading-relaxed">{weapon.note}</div>
          </div>
        )}

        {/* Attachment Slots */}
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
            const availAtt  = slotAttachments(slot);
            const disabled  = availAtt.length === 0;
            const state     = slots[slot];
            const att       = state.attachId ? ATTACHMENT_MAP[state.attachId] : null;
            const color     = SLOT_COLORS[slot];
            const isExpanded = expandedSlot === slot;

            return (
              <div key={slot} className="mb-2">
                {/* Slot header */}
                <button
                  disabled={disabled}
                  onClick={() => setExpandedSlot(isExpanded ? null : slot)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm border text-left transition-all ${
                    disabled
                      ? 'border-[#1e1c18] text-[#3a3020] cursor-not-allowed opacity-50'
                      : att
                      ? 'border-[#3a3020] bg-[#0f0e0a]'
                      : 'border-[#2e2518] hover:border-[#5a4820]'
                  }`}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: disabled ? '#3a3020' : color }} />
                  <span className="flex-1 text-[10px] font-bold" style={{ color: disabled ? '#3a3020' : att ? color : '#b09a6a' }}>
                    {SLOT_LABELS[slot]}
                  </span>
                  {disabled && <span className="text-[8px] text-[#4a3820]">N/A</span>}
                  {!disabled && !att && <span className="text-[8px] text-[#5a4820]">— none —</span>}
                  {att && <span className="text-[8px] truncate max-w-[80px]" style={{ color }}>{att.name}</span>}
                  {!disabled && (
                    <span className="text-[#5a4820] text-[9px]">{isExpanded ? '▲' : '▼'}</span>
                  )}
                </button>

                {/* Expanded: attachment picker + fine-tune */}
                {isExpanded && !disabled && (
                  <div className="mt-1 ml-2 border-l border-[#2e2518] pl-2 flex flex-col gap-1">
                    {/* None option */}
                    <button
                      onClick={() => setSlotAttach(slot, null)}
                      className={`text-left px-2 py-1 text-[9px] rounded-sm border transition-all ${
                        !state.attachId
                          ? 'border-[#5a4820] text-[#c8b99a] bg-[#1a1408]'
                          : 'border-[#1e1c18] text-[#6a5a3a] hover:border-[#3a2e18]'
                      }`}>
                      — No {SLOT_LABELS[slot].split(' ')[1] || 'attachment'} —
                    </button>
                    {availAtt.map(a => (
                      <button key={a.id}
                        onClick={() => setSlotAttach(slot, a.id)}
                        className={`text-left px-2 py-1 text-[9px] rounded-sm border transition-all ${
                          state.attachId === a.id
                            ? 'border-current bg-[#0f0e0a]'
                            : 'border-[#1e1c18] text-[#8a7840] hover:border-[#3a2e18] hover:text-[#b09a6a]'
                        }`}
                        style={{ color: state.attachId === a.id ? color : undefined }}>
                        <div className="font-bold">{a.name}</div>
                        <div className="text-[7.5px] opacity-70">{a.classname}</div>
                        {a.note && <div className="text-[7px] mt-0.5 opacity-60">{a.note}</div>}
                      </button>
                    ))}

                    {/* Fine-tune offsets (only show when attachment is selected) */}
                    {state.attachId && (
                      <div className="mt-1 bg-[#0d0b07] border border-[#1e1c18] rounded-sm px-2 py-1.5">
                        <div className="text-[8px] text-[#6a5a3a] mb-1.5 uppercase tracking-wider">Fine-tune position</div>
                        {(['dx', 'dy', 'dz'] as const).map((axis, i) => (
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

        {/* World Position */}
        <div className="px-3 py-2 border-b border-[#2e2518]">
          <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">Weapon World Position</div>
          <div className="text-[#6a5a3a] text-[8px] mb-2 leading-relaxed">Set where the weapon spawns in the world. Attachment positions auto-calculate.</div>
          {(['X', 'Y', 'Z'] as const).map((axis, i) => {
            const val = [posX, posY, posZ][i];
            const set = [setPosX, setPosY, setPosZ][i];
            return (
              <div key={axis} className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-[#8a7840] w-5 font-bold">{axis}</span>
                <input type="number" step="0.1"
                  value={val}
                  onChange={e => set(+e.target.value)}
                  className="flex-1 bg-[#12100a] border border-[#2e2518] rounded-sm px-2 py-0.5 text-[10px] text-[#c8b99a] focus:outline-none focus:border-[#e67e22] min-w-0"
                />
              </div>
            );
          })}
        </div>

        {/* Output format toggle */}
        <div className="px-3 py-2">
          <div className="text-[#9a8858] text-[9px] uppercase tracking-wider mb-1.5">Export Format</div>
          <div className="flex gap-1">
            {(['json', 'initc'] as const).map(f => (
              <button key={f}
                onClick={() => setFmt(f)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-all ${
                  fmt === f
                    ? 'bg-[#e67e22] text-[#0a0804] border-[#e67e22]'
                    : 'text-[#b09a6a] border-[#2e2518] hover:border-[#6a5820]'
                }`}>
                {f === 'json' ? 'JSON' : 'init.c'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN PANEL ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Info bar */}
        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#0e0c08] border-b border-[#2e2518] shrink-0">
          <span className="text-[#e67e22] font-bold text-[11px]">{weapon.name}</span>
          <span className="text-[#6a5a3a] text-[10px]">{weapon.classname}</span>
          <span className="text-[#6a5a3a] text-[10px]">·</span>
          <span className="text-[#9a8858] text-[10px]">{activeCount} attachment{activeCount !== 1 ? 's' : ''} selected</span>
          <span className="text-[#6a5a3a] text-[10px]">·</span>
          <span className="text-[#8a7840] text-[10px]">{activeCount + 1} total objects to spawn</span>
          <div className="ml-auto flex gap-1.5">
            <button onClick={copy}
              className={`px-3 py-1 text-[10px] font-bold border rounded-sm transition-all ${
                copied
                  ? 'bg-[#27ae60] text-[#0a0804] border-[#27ae60]'
                  : 'border-[#e67e22] text-[#e67e22] hover:bg-[#e67e22] hover:text-[#0a0804]'
              }`}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button onClick={download}
              className="px-3 py-1 text-[10px] font-bold bg-[#e67e22] text-[#0a0804] border border-[#e67e22] rounded-sm hover:bg-[#d35400] hover:border-[#d35400] transition-all">
              ⬇ Download
            </button>
          </div>
        </div>

        {/* Diagram area */}
        <div className="bg-[#060402] border-b border-[#2e2518] shrink-0" style={{ height: '200px' }}>
          <WeaponDiagram weapon={weapon} slots={slots} />
        </div>

        {/* Attachment summary row */}
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

        {/* Output panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2e2518] bg-[#0e0c08] shrink-0">
            <span className="text-[#e67e22] text-[10px] font-bold tracking-wider">
              ▶ {fmt === 'json' ? 'JSON SPAWNER' : 'INIT.C OUTPUT'}
            </span>
            <span className="text-[#6a5a3a] text-[9px]">
              {fmt === 'json'
                ? '— paste into JSON Spawner mod'
                : '— paste into your mission init.c SpawnObject() block'}
            </span>
          </div>
          <pre className="flex-1 overflow-auto px-3 py-2 text-[10px] text-[#c8b99a] leading-relaxed whitespace-pre bg-[#070503]">
            {output}
          </pre>
        </div>

        {/* Footer tip */}
        <div className="px-3 py-1.5 border-t border-[#2e2518] bg-[#0e0c08] shrink-0">
          <div className="text-[8px] text-[#6a5a3a] leading-relaxed">
            💡 Tip: Spawn all items at the same time so they appear together. Lay the weapon flat (ypr 0,0,0).
            Players see a weapon with its attachments visible nearby and attach them in-game.
            Rotate the weapon with ypr to point the barrel in any direction — attachments will need manual offset adjustment if you rotate.
          </div>
        </div>
      </div>
    </div>
  );
}
