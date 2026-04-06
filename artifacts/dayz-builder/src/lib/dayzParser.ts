/**
 * DayZ File Parser Utilities
 * Handles conversion between .c (init), .dze (XML), and JSON spawner formats.
 */

export interface DayZObject {
  name: string;
  pos: [number, number, number];
  ypr: [number, number, number];
  scale?: number;
  meta?: Record<string, any>;
}

/**
 * Parses init.c (CreateObjectEx) script content.
 */
export function parseInitC(text: string): DayZObject[] {
  // Regex to match GetGame().CreateObjectEx("Classname", "7200 0 2400", ...) or Vector(7200, 0, 2400)
  // Our current tool uses a specific Vector regex, but let's be robust.
  const re = /CreateObjectEx\s*\(\s*"([^"]+)"\s*,\s*Vector\s*\(([^)]+)\)/g;
  const results: DayZObject[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const coords = m[2].split(",").map(s => parseFloat(s.trim()));
    if (coords.length === 3) {
      results.push({
        name: m[1],
        pos: [coords[0], coords[1], coords[2]],
        ypr: [0, 0, 0] // init.c usually needs another line for orientation, but 0 0 0 is default
      });
    }
  }
  return results;
}

/**
 * Parses .dze (XML) format from the DayZ Editor.
 */
export function parseDZE(xmlText: string): DayZObject[] {
  const objects: DayZObject[] = [];
  // Simple regex-based XML parser to avoid large dependencies
  const entryRegex = /<EditorObject>([\s\S]*?)<\/EditorObject>/g;
  let entryMatch;

  while ((entryMatch = entryRegex.exec(xmlText)) !== null) {
    const content = entryMatch[1];
    const typeMatch = /<Type>([^<]+)<\/Type>/.exec(content);
    const posMatch = /<Position>([^,]+),([^,]+),([^<]+)<\/Position>/.exec(content);
    const rotMatch = /<Orientation>([^,]+),([^,]+),([^<]+)<\/Orientation>/.exec(content);
    const scaleMatch = /<Scale>([^<]+)<\/Scale>/.exec(content);

    if (typeMatch && posMatch) {
      const ypr: [number, number, number] = [0, 0, 0];
      if (rotMatch) {
        ypr[0] = parseFloat(rotMatch[1]);
        ypr[1] = parseFloat(rotMatch[2]);
        ypr[2] = parseFloat(rotMatch[3]);
      }

      objects.push({
        name: typeMatch[1].trim(),
        pos: [
          parseFloat(posMatch[1]),
          parseFloat(posMatch[2]),
          parseFloat(posMatch[3])
        ],
        ypr: ypr,
        scale: scaleMatch ? parseFloat(scaleMatch[1]) : 1.0
      });
    }
  }
  return objects;
}

/**
 * Standardizes any JSON variant (Objects[] or Object spawner format)
 */
export function parseJSONSpawner(text: string): DayZObject[] {
  try {
    const data = JSON.parse(text);
    const raw = Array.isArray(data) ? data : (data.Objects || []);
    return raw.map((obj: any) => ({
      name: obj.name || obj.classname || "Unknown",
      pos: obj.pos || obj.position || [0, 0, 0],
      ypr: obj.ypr || obj.orientation || [0, 0, 0],
      scale: obj.scale || 1.0
    }));
  } catch {
    return [];
  }
}
