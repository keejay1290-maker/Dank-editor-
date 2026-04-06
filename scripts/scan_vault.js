const fs = require('fs');
const path = require('path');

const BASE_PATH = 'C:/Users/Shadow/Documents/DayZ/Editor/Custom';
const TARGET_FILE = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/vaultData.ts';

function scanDir(dir, category) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory doesn't exist: ${dir}`);
    return [];
  }
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(f => f.endsWith('.json') || f.endsWith('.dze'))
      .map(f => {
        const fullPath = path.join(dir, f);
        const stats = fs.statSync(fullPath);
        return {
          name: f,
          category: category,
          path: fullPath,
          size: stats.size,
          mtime: stats.mtime
        };
      });
  } catch (err) {
    console.error(`Error scanning ${dir}:`, err.message);
    return [];
  }
}

function run() {
  const categories = [
    { name: 'Airdrops', path: 'airdrops' },
    { name: 'Arenas', path: 'arenas' },
    { name: 'Bunkers', path: 'bunkers' },
    { name: 'Races', path: 'races' },
    { name: 'Trader', path: 'trader' },
    { name: 'Builds', path: 'builds big' },
    { name: 'Small Builds', path: 'small builds' },
    { name: 'Misc', path: '' }
  ];

  const allFiles = [];
  categories.forEach(cat => {
    const fullPath = path.join(BASE_PATH, cat.path);
    allFiles.push(...scanDir(fullPath, cat.name));
  });

  const tsContent = `export interface VaultFile {
  name: string;
  category: string;
  path: string;
  size: number;
  mtime: string | Date;
}

export const VAULT_FILES: VaultFile[] = ${JSON.stringify(allFiles, null, 2)};
`;

  try {
    fs.writeFileSync(TARGET_FILE, tsContent);
    console.log(`Indexed ${allFiles.length} files into vaultData.ts`);
  } catch (err) {
    console.error(`Error writing target file:`, err.message);
  }
}

run();
