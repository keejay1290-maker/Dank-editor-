export interface AirdropObject {
  name: string;
  pos: [number, number, number];
  ypr: [number, number, number];
  scale: number;
  enableCEPersistency: number;
  customString: string;
}

export interface AirdropFile {
  Objects: AirdropObject[];
}

export async function listAirdrops(): Promise<string[]> {
  const res = await fetch('/api/airdrops');
  if (!res.ok) throw new Error('Failed to list airdrops');
  return res.json();
}

export async function loadAirdrop(filename: string): Promise<AirdropFile> {
  const res = await fetch(`/api/airdrops/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}`);
  return res.json();
}

export async function saveAirdrop(filename: string, data: AirdropFile): Promise<void> {
  const res = await fetch(`/api/airdrops/${filename}`, {
    method: 'POST',
    body: JSON.stringify(data, null, 2),
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Failed to save ${filename}`);
}

// ─── GENERATION LOGIC ────────────────────────────────────────────────────────

export function generateRandomAirdrop(template: AirdropFile): AirdropFile {
  // Simple randomization: jitter positions and rotations of existing objects
  // or add random loot piles based on the template's style.
  const newObjects = template.Objects.map(obj => {
    // Jitter positions slightly (±0.5m)
    const jitterX = (Math.random() - 0.5) * 1.0;
    const jitterZ = (Math.random() - 0.5) * 1.0;
    
    // Randomize yaw (0-360) for standalone objects like barrels/crates
    let newYaw = obj.ypr[1];
    if (obj.name.toLowerCase().includes('barrel') || obj.name.toLowerCase().includes('crate')) {
       newYaw = Math.floor(Math.random() * 4) * 90;
    }

    return {
      ...obj,
      pos: [obj.pos[0] + jitterX, obj.pos[1], obj.pos[2] + jitterZ] as [number, number, number],
      ypr: [obj.ypr[0], newYaw, obj.ypr[2]] as [number, number, number]
    };
  });

  return { Objects: newObjects.slice(0, 1200) };
}
