import fs from 'fs';
import path from 'path';

const BASE_PATH = 'C:/Users/Shadow/Documents/DayZ/Editor/Custom';
const TARGET_FILE = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/vaultData.ts';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".json" || ext === ".dze" || ext === ".c") {
        const relativePath = path.relative(BASE_PATH, fullPath);
        const isCommunity = relativePath.startsWith("Community");
        
        // Handle both forward and backward slashes for Windows/Unix compatibility
        const pathParts = relativePath.split(/[\\\/]/);
        let category = pathParts.length > 1 ? pathParts[0] : "Misc";
        
        const lowerFile = file.toLowerCase();
        const lowerRel = relativePath.toLowerCase();

        // Categorization Priority Logic
        if (lowerFile.includes("loadout") || lowerRel.includes("loadout")) category = "loadouts";
        else if (lowerFile.includes("arena") || lowerFile.includes("pvp")) category = "arenas";
        else if (lowerFile.includes("bunker")) category = "bunkers";
        else if (lowerFile.includes("race") || lowerFile.includes("track")) category = "races";
        else if (lowerFile.includes("airdrop")) category = "airdrops";
        else if (lowerFile.includes("trader")) category = "traders";
        else if (lowerFile.includes("bridge") || lowerFile.includes("freeway")) category = "freeways";

        const stats = fs.statSync(fullPath);
        arrayOfFiles.push({
          name: file,
          category: category,
          ext: ext.replace('.', ''),
          path: fullPath.replace(/\\/g, '/'),
          size: stats.size,
          mtime: stats.mtime.toISOString(),
          isCommunity: isCommunity
        });
      }
    }
  });

  return arrayOfFiles;
}

function run() {
  console.log(`--- Syncing Vault from ${BASE_PATH} ---`);
  if (!fs.existsSync(BASE_PATH)) {
    console.error("CRITICAL: Base path does not exist:", BASE_PATH);
    return;
  }

  const allFiles = getAllFiles(BASE_PATH);
  console.log(`Success: Indexed ${allFiles.length} files.`);
  
  // Log recently added files (last 1 hour) for immediate feedback
  const now = new Date();
  const recent = allFiles.filter(f => (now - new Date(f.mtime)) < 3600000);
  if (recent.length > 0) {
    console.log(`Found ${recent.length} recent/new files:`, recent.map(f => f.name).join(', '));
  }

  const tsContent = `export interface VaultFile {
  name: string;
  category: string;
  ext: string;
  path: string;
  size: number;
  mtime: string;
  isCommunity?: boolean;
}

export const VAULT_FILES: VaultFile[] = ${JSON.stringify(allFiles, null, 2)};`;

  fs.writeFileSync(TARGET_FILE, tsContent);
  console.log(`Updated: ${TARGET_FILE}`);
}

run();
