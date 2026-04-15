import { copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const seedPath = resolve(projectRoot, 'src/tasks.seed.json');
const dataPath = resolve(projectRoot, 'src/tasks.json');

await copyFile(seedPath, dataPath);

console.log('Reset src/tasks.json from src/tasks.seed.json');
