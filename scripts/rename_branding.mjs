import fs from 'fs';
import path from 'path';

// Define multiple possible paths for the Custom directory in case it's in a different location.
const BASE_PATHS = [
  'C:/Users/Shadow/Documents/DayZ/Editor/Custom',
  'C:/Users/Users/Shadow/Documents/DayZ/Editor/Custom', // In case of nested Users folder
];

function renameRecursive(currentPath) {
  if (!fs.existsSync(currentPath)) return;

  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    
    // Case-insensitive replace of "Bennetts" with "Dank"
    let newName = entry.name.replace(/Bennetts/gi, 'Dank');
    let targetPath = path.join(currentPath, newName);

    if (newName !== entry.name) {
      console.log(`Renaming: ${entry.name} -> ${newName} at ${currentPath}`);
      try {
        fs.renameSync(fullPath, targetPath);
      } catch (err) {
        console.error(`Failed to rename ${fullPath}: ${err.message}`);
        continue;
      }
    } else {
      targetPath = fullPath;
    }

    // Recurse into directories
    if (entry.isDirectory() || (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory())) {
      renameRecursive(targetPath);
    } 
    // Process file content
    else {
      const ext = path.extname(targetPath).toLowerCase();
      if (['.json', '.c', '.dze', '.txt'].includes(ext)) {
        try {
          const content = fs.readFileSync(targetPath, 'utf8');
          if (content.match(/Bennetts/gi)) {
            console.log(`Updating internal content: ${newName}`);
            const updatedContent = content.replace(/Bennetts/gi, 'Dank');
            fs.writeFileSync(targetPath, updatedContent, 'utf8');
          }
        } catch (e) {
          console.error(`Error processing file content for ${targetPath}:`, e.message);
        }
      }
    }
  }
}

console.log("--- Starting Global Branding Rename (Bennetts -> Dank) ---");
let foundBase = false;
for (const basePath of BASE_PATHS) {
    if (fs.existsSync(basePath)) {
        console.log(`Found base path: ${basePath}`);
        renameRecursive(basePath);
        foundBase = true;
    }
}

if (!foundBase) {
    console.error("CRITICAL: No valid Custom directory found in expected locations.");
} else {
    console.log("--- Branding Rename Complete ---");
}
