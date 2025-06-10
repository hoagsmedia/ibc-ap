import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('static/resources');
const destDir = path.resolve('public/resources');

if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir, { recursive: true });
}

for (const file of fs.readdirSync(srcDir)) {
	const src = path.join(srcDir, file);
	const dest = path.join(destDir, file);
	fs.copyFileSync(src, dest);
}

console.log('Copied user images to public/resources');
