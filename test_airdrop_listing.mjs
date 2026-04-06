import fs from 'fs';
import path from 'path';

const AIRDROPS_DIR = 'C:/Users/Shadow/Documents/DayZ/Editor/Custom/airdrops';

function testAirdropListing() {
    try {
        if (!fs.existsSync(AIRDROPS_DIR)) {
            console.error(`Directory not found: ${AIRDROPS_DIR}`);
            return;
        }

        const files = fs.readdirSync(AIRDROPS_DIR).filter(f => f.endsWith('.json'));
        console.log(`Found ${files.length} airdrop files:`);
        
        files.forEach(f => {
            const content = fs.readFileSync(path.join(AIRDROPS_DIR, f), 'utf-8');
            const data = JSON.parse(content);
            console.log(`- ${f}: ${data.Objects?.length || 0} objects`);
        });
    } catch (e) {
        console.error(`Test failed: ${e.message}`);
    }
}

testAirdropListing();
