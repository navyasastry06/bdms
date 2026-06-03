const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Warning: Could not set custom DNS servers:', err.message);
}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

/* Load env from backend directory */
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    /* Check if admin already exists */
    const existingAdmin = await User.findOne({ email: 'admin@bdms.com' });
    if (existingAdmin) {
      console.log('Admin account already exists. Skipping.');
      process.exit(0);
    }

    /* Create default admin */
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@bdms.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true
    });

    console.log('Default admin created:');
    console.log('  Email: admin@bdms.com');
    console.log('  Password: Admin@123');
    console.log('  Role: admin');

    /* Seed blood inventory with all 8 blood groups */
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const existingInventory = await BloodInventory.countDocuments();

    if (existingInventory === 0) {
      const inventoryData = bloodGroups.map(bg => ({
        bloodGroup: bg,
        unitsAvailable: Math.floor(Math.random() * 20) + 5,
        updatedBy: admin._id
      }));
      await BloodInventory.insertMany(inventoryData);
      console.log('Blood inventory seeded with default values.');
    }

    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
