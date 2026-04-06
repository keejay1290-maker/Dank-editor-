import fs from 'fs';
const f = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/shapeGenerators.ts';
let code = fs.readFileSync(f, 'utf8');

// Inject into getRawPoints switch
const switchTarget = "case 'prison_tower': return gen_prison_tower(p);";
if(code.includes(switchTarget) && !code.includes("case 'eiffel_tower':")) {
  code = code.replace(switchTarget, switchTarget + "\n    case 'eiffel_tower': return gen_eiffel_tower(p);\n    case 'cyberpunk_nexus': return gen_cyberpunk_nexus(p);\n    case 'castle_keep': return gen_castle_keep(p);");
}

// We will overwrite gen_atat_walker.
const atatStart = code.indexOf('function gen_atat_walker(');
const borgCube = code.indexOf('function gen_borg_cube(');
if(atatStart > -1 && borgCube > -1) {
  const newAtat = `
function gen_atat_walker(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = Math.max(10, p.height || 30);
  const w = Math.max(10, p.width || 20);
  const legH = h * 0.42;
  const bodyY = legH;
  const bodyH = h * 0.35;
  const bW = w * 0.45;
  const bD = w * 0.6;
  
  function drawWall(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90; 
    const steps = Math.max(1, Math.ceil(len / 3.5)); // dense 3.5m steps fits 4m walls well
    for (let i=0; i<=steps; i++) {
       const t = i/steps;
       pts.push({ x: x1+dx*t, y: y1+dy*t, z: z1+dz*t, yaw: yaw });
    }
  }

  // BODY HULL (Box)
  for(let i=0; i<=5; i++) {
     const y = bodyY + bodyH * (i/5);
     drawWall(-bW, y, -bD, -bW, y, bD); // L
     drawWall(bW, y, -bD, bW, y, bD);   // R
     drawWall(-bW, y, -bD, bW, y, -bD); // F
     drawWall(-bW, y, bD, bW, y, bD);   // B
  }

  // LEGS
  const legCX = bW * 0.85, legCZ = bD * 0.75;
  [[legCX, legCZ], [legCX, -legCZ], [-legCX, legCZ], [-legCX, -legCZ]].forEach(([lx, lz]) => {
     for(let h_tier=0; h_tier<=Math.ceil(legH/3); h_tier++) {
        const y = h_tier * 3;
        for(let j=0; j<8; j++) {
           const a = j * Math.PI / 4;
           pts.push({ x: lx + w*0.12*Math.cos(a), y, z: lz + w*0.12*Math.sin(a), yaw: -a * 180 / Math.PI + 90 });
        }
     }
  });

  // NECK
  const neckLen = w * 0.7;
  const headZ = -bD - neckLen;
  for(let i=0; i<=3; i++) {
     const y = bodyY + bodyH * 0.3 + i*2;
     drawWall(-w*0.15, y, -bD, -w*0.15, y, headZ);
     drawWall(w*0.15, y, -bD, w*0.15, y, headZ);
  }

  // HEAD
  const hW = w*0.28, hH = h*0.22, hD = w*0.35;
  const headY = bodyY + bodyH*0.1;
  for(let i=0; i<=5; i++) {
     const y = headY + hH * (i/5);
     drawWall(-hW, y, headZ, -hW, y, headZ-hD);
     drawWall(hW, y, headZ, hW, y, headZ-hD);
     drawWall(-hW, y, headZ-hD, hW, y, headZ-hD); // face
  }

  // CANNONS
  drawWall(-hW*0.6, headY+hH*0.2, headZ-hD, -hW*0.6, headY+hH*0.2, headZ-hD-w*0.5);
  drawWall(hW*0.6, headY+hH*0.2, headZ-hD, hW*0.6, headY+hH*0.2, headZ-hD-w*0.5);
  
  return pts;
}

// ── NEW MASTERPIECE GENERATORS ──────────────────────────────────
function gen_eiffel_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const baseSize = Math.max(20, p.width || 60);
  const height = Math.max(30, p.height || 120);

  function drawWall(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90; 
    const steps = Math.max(1, Math.ceil(len / 3.5)); 
    for (let i=0; i<=steps; i++) {
       const t = i/steps;
       pts.push({ x: x1+dx*t, y: y1+dy*t, z: z1+dz*t, yaw, pitch: Math.atan2(dy, Math.sqrt(dx*dx+dz*dz)) * -180 / Math.PI });
    }
  }

  // Draw 4 curved tapering legs
  const legSteps = 30;
  for (let i=0; i<legSteps; i++) {
     const t1 = i/legSteps;
     const t2 = (i+1)/legSteps;
     
     // exponential curve inward
     const w1 = (baseSize / 2) * Math.pow(1 - t1, 1.8);
     const w2 = (baseSize / 2) * Math.pow(1 - t2, 1.8);
     const y1 = height * t1;
     const y2 = height * t2;

     // 4 pillars
     [[1,1], [1,-1], [-1,1], [-1,-1]].forEach(([sx, sz]) => {
        drawWall(w1*sx, y1, w1*sz, w2*sx, y2, w2*sz);
     });
     
     // Horizontal braces every 1/5th height
     if (i > 0 && i % Math.floor(legSteps/5) === 0) {
        drawWall(-w1, y1, -w1, w1, y1, -w1);
        drawWall(w1, y1, -w1, w1, y1, w1);
        drawWall(w1, y1, w1, -w1, y1, w1);
        drawWall(-w1, y1, w1, -w1, y1, -w1);
     }
  }
  return pts;
}

function gen_cyberpunk_nexus(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = Math.max(40, p.height || 100);
  const w = Math.max(15, p.width || 30);
  
  function drawWall(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90; 
    const steps = Math.max(1, Math.ceil(len / 3.5)); 
    for (let i=0; i<=steps; i++) { pts.push({ x: x1+dx*(i/steps), y: y1+dy*(i/steps), z: z1+dz*(i/steps), yaw }); }
  }

  // Main Central Spire (Hexagonal)
  for(let y_tier=0; y_tier<=h; y_tier+=4) {
    const t = y_tier/h;
    const cw = (w/2) * (1 - t*0.3); // slight taper
    for(let j=0; j<6; j++) {
       const a1 = j * Math.PI/3;
       const a2 = (j+1) * Math.PI/3;
       drawWall(cw*Math.cos(a1), y_tier, cw*Math.sin(a1), cw*Math.cos(a2), y_tier, cw*Math.sin(a2));
    }
  }

  // Sub-towers clustered around it
  for(let i=0; i<3; i++) {
     const subH = h * (0.4 + 0.3*Math.random());
     const subW = (w/2) * 0.6;
     const angle = i * (Math.PI*2/3) + Math.PI/6;
     const cx = (w/2 * 1.5) * Math.cos(angle);
     const cz = (w/2 * 1.5) * Math.sin(angle);
     
     for(let y_tier=0; y_tier<=subH; y_tier+=4) {
        for(let j=0; j<4; j++) {
           const a1 = j * Math.PI/2 + angle;
           const a2 = (j+1) * Math.PI/2 + angle;
           drawWall(cx+subW*Math.cos(a1), y_tier, cz+subW*Math.sin(a1), cx+subW*Math.cos(a2), y_tier, cz+subW*Math.sin(a2));
        }
     }
  }

  // Connecting sky-bridges
  for(let bridgeY = h*0.3; bridgeY <= h*0.8; bridgeY += h*0.4) {
     for(let i=0; i<3; i++) {
        const angle = i * (Math.PI*2/3) + Math.PI/6;
        const cx = (w/2 * 1.5) * Math.cos(angle);
        const cz = (w/2 * 1.5) * Math.sin(angle);
        drawWall(0, bridgeY, 0, cx, bridgeY, cz);
     }
  }

  return pts;
}

function gen_castle_keep(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const w = Math.max(20, p.width || 40);
  const h = Math.max(10, p.height || 20);
  
  function drawWall(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90; 
    const steps = Math.max(1, Math.ceil(len / 3.5)); 
    for (let i=0; i<=steps; i++) { pts.push({ x: x1+dx*(i/steps), y: y1+dy*(i/steps), z: z1+dz*(i/steps), yaw }); }
  }

  // Square layout with 4 corner towers
  // Main walls
  for(let y=0; y<=h; y+=4) {
     drawWall(-w/2, y, -w/2, w/2, y, -w/2);
     drawWall(-w/2, y, w/2, w/2, y, w/2);
     drawWall(-w/2, y, -w/2, -w/2, y, w/2);
     drawWall(w/2, y, -w/2, w/2, y, w/2);
  }

  // 4 circular towers at corners
  [[1,1], [1,-1], [-1,1], [-1,-1]].forEach(([sx, sz]) => {
     const cx = sx * w/2;
     const cz = sz * w/2;
     const tr = w*0.15;
     for(let y=0; y<=h*1.3; y+=3) { // Towers taller than walls
        for(let j=0; j<8; j++) {
           const a1 = j * Math.PI/4;
           const a2 = (j+1) * Math.PI/4;
           drawWall(cx+tr*Math.cos(a1), y, cz+tr*Math.sin(a1), cx+tr*Math.cos(a2), y, cz+tr*Math.sin(a2));
        }
     }
  });

  return pts;
}

`;
  
  code = code.substring(0, atatStart) + newAtat + code.substring(borgCube);
  fs.writeFileSync(f, code);
  console.log("Injected updated highly dense AT-AT and new Masterpiece generators");
} else {
  console.log("Could not find start index");
}
