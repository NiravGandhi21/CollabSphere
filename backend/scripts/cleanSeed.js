/**
 * CollabSphere — Demo Data Cleanup Script
 *
 * Safety & Architecture:
 *  - Connects using backend/config/db.js.
 *  - Scoped to demo data only: Targets isDemo: true and @demo.collabsphere.edu.
 *  - NEVER drops collections, databases, or genuine non-demo user/project records.
 *  - Reports exact count of cleaned demo records.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Collaboration } from '../models/Collaboration.js';

export async function cleanDemoData() {
  console.log('🧹 Starting CollabSphere Demo Data Cleanup...');

  await connectDB();

  const dbName = mongoose.connection.name;
  console.log(`📍 Connected target database: "${dbName}"`);

  // Safety check: Prevent cleanup on production database
  if (dbName === 'production' || dbName === 'collabsphere_prod') {
    throw new Error('🛑 Safety Halt: Cleanup is strictly blocked on production database names.');
  }

  // 1. Delete Demo Collaborations
  const collabRes = await Collaboration.deleteMany({ isDemo: true });
  console.log(`   🗑️ Deleted ${collabRes.deletedCount} demo collaboration requests.`);

  // 2. Delete Demo Projects
  const projRes = await Project.deleteMany({ isDemo: true });
  console.log(`   🗑️ Deleted ${projRes.deletedCount} demo showcase projects.`);

  // 3. Delete Demo Users
  const userRes = await User.deleteMany({
    $or: [{ isDemo: true }, { email: /@demo\.collabsphere\.edu$/i }],
  });
  console.log(`   🗑️ Deleted ${userRes.deletedCount} demo student accounts.`);

  console.log('\n✨ Demo data cleanup complete. Zero real user or project records were touched.');

  return {
    deletedCollaborations: collabRes.deletedCount,
    deletedProjects: projRes.deletedCount,
    deletedUsers: userRes.deletedCount,
  };
}

// Direct CLI invocation
if (process.argv[1]?.endsWith('cleanSeed.js')) {
  cleanDemoData()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Cleanup Error:', err.message);
      await disconnectDB();
      process.exit(1);
    });
}
