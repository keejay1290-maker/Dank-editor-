/**
 * DankTimeline — Server event & wipe schedule planner.
 * Create a visual timeline of server events (wipes, events, updates, maintenance)
 * and export a Discord-ready schedule post.
 */
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = "wipe" | "event" | "update" | "maintenance" | "custom";

interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;   // ISO date string YYYY-MM-DD
  time: string;   // HH:MM
  duration: number; // hours
  notes: string;
  recurring: "none" | "weekly" | "biweekly" | "monthly";
}

const TYPE_META: Record<EventType, { emoji: string; color: string; label: string }> = {
  wipe:        { emoji: "🔄", color: "#e74c3c", label: "WIPE" },
  event:       { emoji: "🎪", color: "#27ae60", label: "EVENT" },
  update:      { emoji: "⬆", color: "#3498db", label: "UPDATE" },
  maintenance: { emoji: "🔧", color: "#f39c12", label: "MAINTENANCE" },
  custom:      { emoji: "📌", color: "#9b59b6", label: "CUSTOM" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: string): string {
  if (!date) return "TBD";
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function buildDiscordPost(events: TimelineEvent[], serverName: string): string {
  const sorted = [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const lines = [
    `📅 **${serverName} — Server Schedule**`,
    ``,
    ...sorted.map(ev => {
      const m = TYPE_META[ev.type];
      const recur = ev.recurring !== "none" ? ` *(${ev.recurring})*` : "";
      const dur = ev.duration > 0 ? ` — ${ev.duration}h` : "";
      const notes = ev.notes ? `\n   > ${ev.notes}` : "";
      return `${m.emoji} **${m.label}** · ${formatDate(ev.date)} ${ev.time}${dur}${recur}\n   ${ev.title}${notes}`;
    }),
    ``,
    `*All times are server time. Subject to change.*`,
  ];
  return lines.join("\n");
}

let nextId = 1;
function makeId() { return String(nextId++); }

// ─── Component ────────────────────────────────────────────────────────────────

export default function DankTimeline() {
  const [serverName, setServerName] = useState("My DayZ Server");
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: makeId(), type: "wipe", title: "Full Server Wipe",
      date: new Date().toISOString().split("T")[0],
      time: "18:00", duration: 1, notes: "Map + character wipe", recurring: "monthly",
    },
    {
      id: makeId(), type: "event", title: "PvP Tournament",
      date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      time: "20:00", duration: 3, notes: "Prizes for top 3", recurring: "none",
    },
  ]);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const sorted = [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const discordPost = buildDiscordPost(events, serverName);

  function addEvent() {
    const ev: TimelineEvent = {
      id: makeId(), type: "event", title: "New Event",
      date: new Date().toISOString().split("T")[0],
      time: "18:00", duration: 2, notes: "", recurring: "none",
    };
    setEvents(prev => [...prev, ev]);
    setEditing(ev);
  }

  function updateEvent(updated: TimelineEvent) {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditing(updated);
  }

  function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  function copy() {
    navigator.clipboard.writeText(discordPost).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const inputCls = "w-full bg-[#0a1209] border border-[#1a2e1a] text-[#b8d4b8] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#27ae60]";
  const labelCls = "text-[10px] text-[#5a8a5a] font-bold uppercase tracking-wider mb-1 block";

  return (
    <div className="min-h-screen bg-[#080f09] text-[#b8d4b8] font-mono">
      <div className="border-b border-[#1a2e1a] bg-[#0c1510] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#5a8a5a] hover:text-[#27ae60] text-[11px]">← HOME</a>
        <span className="text-[#1a2e1a]">/</span>
        <span className="text-[11px] font-black text-[#27ae60]">📅 DANKTIMELINE</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60]">UNIQUE TOOL</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: timeline + editor */}
        <div className="space-y-4">
          {/* HOW TO USE */}
          <div className="border border-[#1a2e1a] rounded overflow-hidden">
            <button onClick={() => setShowHow(h => !h)}
              className="w-full flex items-center justify-between px-4 py-2 bg-[#0c1510] text-[11px] font-black text-[#5a8a5a] hover:text-[#27ae60]">
              <span>📖 HOW TO USE</span><span>{showHow ? "▲" : "▼"}</span>
            </button>
            {showHow && (
              <div className="px-4 py-3 text-[10px] text-[#5a8a5a] space-y-1 bg-[#080f09]">
                <p>1. Enter your server name.</p>
                <p>2. Add events — wipes, PvP events, updates, maintenance.</p>
                <p>3. Click an event to edit its details.</p>
                <p>4. Copy the Discord post to paste into your server's #schedule channel.</p>
              </div>
            )}
          </div>

          {/* Server name */}
          <div>
            <label className={labelCls}>Server Name</label>
            <input className={inputCls} value={serverName} onChange={e => setServerName(e.target.value)} />
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black text-[#27ae60] tracking-widest">EVENTS ({events.length})</div>
              <button onClick={addEvent}
                className="px-3 py-1 text-[10px] font-black bg-[#0e2010] border border-[#27ae60] text-[#27ae60] rounded hover:bg-[#1a3a1a] transition-colors">
                + ADD EVENT
              </button>
            </div>
            {sorted.map(ev => {
              const m = TYPE_META[ev.type];
              const isEditing = editing?.id === ev.id;
              return (
                <div key={ev.id}
                  className={`border rounded p-3 cursor-pointer transition-colors ${
                    isEditing ? "border-[#27ae60] bg-[#0e1a0e]" : "border-[#1a2e1a] bg-[#0a1209] hover:border-[#2a4a2a]"
                  }`}
                  onClick={() => setEditing(isEditing ? null : ev)}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black" style={{ color: m.color }}>{m.label}</span>
                        <span className="text-[10px] text-[#b8d4b8] truncate">{ev.title}</span>
                      </div>
                      <div className="text-[9px] text-[#5a8a5a]">
                        {formatDate(ev.date)} {ev.time}
                        {ev.duration > 0 && ` · ${ev.duration}h`}
                        {ev.recurring !== "none" && ` · ${ev.recurring}`}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                      className="text-[#3a6a3a] hover:text-[#c0392b] text-[10px] px-1">✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Editor */}
          {editing && (
            <div className="bg-[#0a1209] border border-[#27ae60] rounded p-4 space-y-3">
              <div className="text-[10px] font-black text-[#27ae60] tracking-widest">EDIT EVENT</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={editing.type}
                    onChange={e => updateEvent({ ...editing, type: e.target.value as EventType })}>
                    {(Object.keys(TYPE_META) as EventType[]).map(t => (
                      <option key={t} value={t}>{TYPE_META[t].emoji} {TYPE_META[t].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Recurring</label>
                  <select className={inputCls} value={editing.recurring}
                    onChange={e => updateEvent({ ...editing, recurring: e.target.value as TimelineEvent["recurring"] })}>
                    <option value="none">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Title</label>
                <input className={inputCls} value={editing.title}
                  onChange={e => updateEvent({ ...editing, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Date</label>
                  <input type="date" className={inputCls} value={editing.date}
                    onChange={e => updateEvent({ ...editing, date: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Time</label>
                  <input type="time" className={inputCls} value={editing.time}
                    onChange={e => updateEvent({ ...editing, time: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Duration (h)</label>
                  <input type="number" className={inputCls} value={editing.duration} min={0} max={24}
                    onChange={e => updateEvent({ ...editing, duration: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input className={inputCls} value={editing.notes} placeholder="Optional details..."
                  onChange={e => updateEvent({ ...editing, notes: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        {/* Right: Discord post */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-[#27ae60] tracking-widest">DISCORD POST PREVIEW</div>
          <pre className="bg-[#050c06] border border-[#1a2e1a] rounded p-4 text-[10px] text-[#b8d4b8] overflow-auto whitespace-pre leading-relaxed max-h-[600px]">
            {discordPost}
          </pre>
          <button onClick={copy}
            className="w-full py-2 rounded text-[11px] font-black border border-[#27ae60] text-[#27ae60] hover:bg-[#0e2010] transition-colors">
            {copied ? "✅ COPIED" : "📋 COPY DISCORD POST"}
          </button>
        </div>
      </div>
    </div>
  );
}
