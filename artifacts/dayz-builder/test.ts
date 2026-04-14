
import { executePipeline } from './src/lib/pipeline';
import { getShapePoints } from './src/lib/shapeGenerators';

async function run() {
  const ctx = await executePipeline('test', 'generic', 0, { buildName: 'test', posX: 0, posY: 0, posZ: 0, shape: 'big_ben', height: 96 }, () => getShapePoints('big_ben', { height: 96 }));
  console.log('Objects Final Length:', ctx.objects_final.length);
}
run();
