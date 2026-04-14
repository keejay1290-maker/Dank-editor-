
require('ts-node/register');
const { executePipeline } = require('./src/lib/pipeline.ts');
const { getShapePoints } = require('./src/lib/shapeGenerators.ts');

async function run() {
  console.log('Running Pipeline...');
  const ctx = await executePipeline('test', 'generic', 0, { buildName: 'test', posX: 0, posY: 0, posZ: 0, shape: 'big_ben', height: 96 }, () => getShapePoints('big_ben', { height: 96 }));
  console.log('Objects Final Length:', ctx.objects_final.length);
}
run();
