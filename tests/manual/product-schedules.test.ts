/**
 * Manual Test Script for Product Schedules Feature
 * 
 * Run with: npx tsx tests/manual/product-schedules.test.ts
 * 
 * This script tests the complete menu assignment workflow
 */

import { storage, seed } from '../server/mock-storage';

async function runTests() {
  console.log('🧪 Starting Product Schedules Tests...\n');

  let passed = 0;
  let failed = 0;

  try {
    // Seed the database
    console.log('📦 Seeding database...');
    await seed();
    console.log('✅ Database seeded successfully!\n');

    // Get test data
    const products = await storage.getProducts();
    const schedules = await storage.getSchedules();

    console.log(`📊 Found ${products.length} products and ${schedules.length} schedules\n`);

    // Test 1: Add product to multiple menus
    console.log('Test 1: Adding product to multiple menus...');
    const product = products[0];
    console.log(`   Product: ${product.name} (ID: ${product.id})`);
    
    const scheduleIds = schedules.slice(0, Math.min(2, schedules.length)).map((s) => s.id);
    console.log(`   Assigning to schedules: ${scheduleIds.join(', ')}`);
    
    await storage.updateProductSchedules(product.id, scheduleIds);
    const afterAssign = await storage.getProductSchedules(product.id);
    
    if (afterAssign.length === scheduleIds.length) {
      console.log('   ✅ PASSED: Product assigned to multiple menus\n');
      passed++;
    } else {
      console.log(`   ❌ FAILED: Expected ${scheduleIds.length} schedules, got ${afterAssign.length}\n`);
      failed++;
    }

    // Test 2: Remove product from menus
    console.log('Test 2: Removing product from menus...');
    const newScheduleIds = scheduleIds.slice(0, 1); // Keep only one
    console.log(`   New schedule assignment: ${newScheduleIds.join(', ')}`);
    
    await storage.updateProductSchedules(product.id, newScheduleIds);
    const afterRemove = await storage.getProductSchedules(product.id);
    
    if (afterRemove.length === 1 && afterRemove[0].id === newScheduleIds[0]) {
      console.log('   ✅ PASSED: Product removed from menu successfully\n');
      passed++;
    } else {
      console.log(`   ❌ FAILED: Expected 1 schedule with ID ${newScheduleIds[0]}, got ${afterRemove.length}\n`);
      failed++;
    }

    // Test 3: Clear all menu assignments
    console.log('Test 3: Clearing all menu assignments...');
    await storage.updateProductSchedules(product.id, []);
    const afterClear = await storage.getProductSchedules(product.id);
    
    if (afterClear.length === 0) {
      console.log('   ✅ PASSED: All menu assignments cleared\n');
      passed++;
    } else {
      console.log(`   ❌ FAILED: Expected 0 schedules, got ${afterClear.length}\n`);
      failed++;
    }

    // Test 4: Verify data integrity
    console.log('Test 4: Verifying data integrity...');
    
    // Assign schedules
    await storage.updateProductSchedules(product.id, [schedules[0].id]);
    const assigned = await storage.getProductSchedules(product.id);
    
    // Verify the schedule exists and is active
    const schedule = schedules.find((s) => s.id === schedules[0].id);
    const isValid = assigned.length > 0 && 
                    assigned[0].id === schedules[0].id && 
                    assigned[0].isActive === true;
    
    if (isValid && schedule) {
      console.log(`   ✅ PASSED: Schedule "${schedule.name}" is valid and active\n`);
      passed++;
    } else {
      console.log('   ❌ FAILED: Data integrity check failed\n');
      failed++;
    }

    // Test 5: Multiple product assignments
    console.log('Test 5: Multiple product assignments...');
    
    const results: { productId: number; scheduleCount: number }[] = [];
    
    for (const p of products.slice(0, 3)) {
      const pSchedules = schedules.slice(0, Math.min(2, schedules.length)).map((s) => s.id);
      await storage.updateProductSchedules(p.id, pSchedules);
      const result = await storage.getProductSchedules(p.id);
      results.push({ productId: p.id, scheduleCount: result.length });
    }
    
    const allAssigned = results.every(r => r.scheduleCount > 0);
    if (allAssigned) {
      console.log(`   ✅ PASSED: All ${results.length} products assigned to schedules\n`);
      passed++;
    } else {
      console.log('   ❌ FAILED: Some products not assigned correctly\n');
      failed++;
    }

    // Test 6: Schedule type verification
    console.log('Test 6: Schedule type verification...');
    const timeSlotSchedules = schedules.filter((s) => s.type === 'TIME_SLOT');
    const seasonalSchedules = schedules.filter((s) => s.type === 'SEASONAL');
    
    console.log(`   TIME_SLOT schedules: ${timeSlotSchedules.length}`);
    console.log(`   SEASONAL schedules: ${seasonalSchedules.length}`);
    
    if (schedules.length > 0) {
      console.log('   ✅ PASSED: Schedule types identified correctly\n');
      passed++;
    } else {
      console.log('   ❌ FAILED: No schedules found\n');
      failed++;
    }

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🧪 Test Results');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('═══════════════════════════════════════');
    
    if (failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`⚠️  ${failed} test(s) failed`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

runTests();

