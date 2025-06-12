#!/usr/bin/env tsx

/**
 * Simple test script to verify migration setup
 */

import { readdir } from 'fs/promises';
import { join } from 'path';
import 'dotenv/config';

async function testMigration() {
	console.log('🧪 Testing migration setup...');

	// Test 1: Check environment
	const token = process.env.UPLOADTHING_TOKEN;
	console.log('✅ UPLOADTHING_TOKEN:', token ? 'Present' : 'Missing');

	// Test 2: Check directory
	const resourcesPath = join(process.cwd(), 'static', 'resources');
	console.log('📁 Resources path:', resourcesPath);

	try {
		const files = await readdir(resourcesPath);
		const imageFiles = files.filter(
			(file) => file.match(/\.(jpg|jpeg|png|gif)$/i) && !file.includes('no-mbr')
		);

		console.log(`📸 Found ${imageFiles.length} profile images to migrate`);
		console.log('📋 First 5 files:', imageFiles.slice(0, 5));

		// Test 3: Database import
		try {
			const { db } = await import('../src/lib/server/db');
			console.log('✅ Database connection: OK');
		} catch (error) {
			console.error('❌ Database connection failed:', error);
		}
	} catch (error) {
		console.error('❌ Failed to read directory:', error);
	}
}

testMigration().catch(console.error);
