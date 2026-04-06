import fs from 'fs';

const f = './src/lib/completedBuilds.ts';
let code = fs.readFileSync(f, 'utf8');

// Regex to find posX and posY in the same object block
// We'll iterate through each CompletedBuild object
const buildRegex = /{[^}]*posX":\s*(\d+)[^}]*posY":\s*(\d+)[^}]*}/g;

code = code.replace(buildRegex, (match, posXStr, posYStr) => {
  const posX = parseInt(posXStr);
  const posY = parseInt(posYStr);
  
  let newY = posY;
  if (posX > 4000 && posX < 4110) {
    newY = 340; // NWAF
  } else if (posX > 11900 && posX < 12010) {
    newY = 140; // Krasmo
  }
  
  if (newY !== posY) {
    console.log(`Fixing Build at posX=${posX}: posY ${posY} -> ${newY}`);
    return match.replace(`"posY": ${posY}`, `"posY": ${newY}`);
  }
  return match;
});

fs.writeFileSync(f, code, 'utf8');
console.log('completedBuilds.ts coordinate audit complete.');
