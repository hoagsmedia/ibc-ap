#!/usr/bin/env node

console.log('🧪 Basic test script running...');
console.log('📁 Current directory:', process.cwd());
console.log('🌍 Environment variables:');
console.log('  UPLOADTHING_TOKEN:', process.env.UPLOADTHING_TOKEN ? 'Present' : 'Missing');

import { readdir } from 'fs/promises';
import { join } from 'path';

const resourcesPath = join(process.cwd(), 'static', 'resources');
console.log('📂 Checking resources directory:', resourcesPath);

try {
	const files = await readdir(resourcesPath);
	const imageFiles = files.filter(
		(file) => file.match(/\.(jpg|jpeg|png|gif)$/i) && !file.includes('no-mbr')
	);

	console.log(`📸 Found ${imageFiles.length} profile images`);
	console.log('📋 Sample files:', imageFiles.slice(0, 3));
} catch (error) {
	console.error('❌ Error reading directory:', error);
}
