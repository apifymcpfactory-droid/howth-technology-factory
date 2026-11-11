import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
for (const file of walk(root).filter(file => file.endsWith('.html'))) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replaceAll('>For Agents<', '>For AI builders<');
  if (after !== before) fs.writeFileSync(file, after);
}
