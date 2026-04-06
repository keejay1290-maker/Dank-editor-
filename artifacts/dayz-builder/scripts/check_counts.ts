import { getShapePoints } from '../src/lib/shapeGenerators';
console.log('Black Hole:', getShapePoints('black_hole', {}).length);
console.log('Log Cabin:', getShapePoints('log_cabin', {}).length);
console.log('Avengers Tower:', getShapePoints('avengers_tower', {}).length);
console.log('Death Star:', getShapePoints('deathstar', {}).length);
