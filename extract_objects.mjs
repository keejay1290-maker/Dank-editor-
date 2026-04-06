import fs from 'fs';
import path from 'path';

function extractNames(filePath, regex, groupIndex) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`[WARN] File missing: ${filePath}`);
            return new Set();
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const names = new Set();
        let match;
        while ((match = regex.exec(content)) !== null) {
            names.add(match[groupIndex]);
        }
        return names;
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
        return new Set();
    }
}

const mapgroupprotoNames = extractNames('c:/Users/Shadow/Downloads/mapgroupproto.xml', /<group\s+name="([^"]+)"/g, 1);
const mapgroupposNames = extractNames('c:/Users/Shadow/Downloads/mapgrouppos (1).xml', /<group\s+name="([^"]+)"/g, 1);
const typesNames = extractNames('c:/Users/Shadow/Downloads/types.xml', /<type\s+name="([^"]+)"/g, 1);

const allValidOrig = new Set([
    ...Array.from(mapgroupprotoNames),
    ...Array.from(mapgroupposNames),
    ...Array.from(typesNames)
]);

const allValidLower = new Set(Array.from(allValidOrig).map(n => n.toLowerCase()));

fs.writeFileSync('valid_objects_lower.json', JSON.stringify(Array.from(allValidLower), null, 2));

console.log(`Extraction complete.`);
console.log(`- mapgroupproto: ${mapgroupprotoNames.size}`);
console.log(`- mapgrouppos: ${mapgroupposNames.size}`);
console.log(`- types: ${typesNames.size}`);
console.log(`- Total unique: ${allValidOrig.size}`);
