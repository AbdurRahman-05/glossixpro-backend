import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://glossixproweb_db_user:gMgocUEhZ5VonPv5@cluster0.8f39li6.mongodb.net/?appName=Cluster0';

import User from './models/User.js';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Default admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password';

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log(`⚠️  Admin user with email "${adminEmail}" already exists!`);
      console.log('   If you want to update the password, delete the existing user first.');
      process.exit(0);
    }

    // Create admin user
    console.log(`Creating admin user: ${adminEmail}`);
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword // Will be hashed by the pre-save hook
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🚀 You can now login at: http://localhost:5173/admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
