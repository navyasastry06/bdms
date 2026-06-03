const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Warning: Could not set custom DNS servers:', err.message);
}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Camp = require('./models/Camp');

const seedCamps = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found. Please run seedAdmin.js first.');
      process.exit(1);
    }

    const campsData = [
      {
        name: "Summer Blood Drive",
        organizer: "Bangalore Community Center",
        date: new Date("2026-06-12"),
        time: "9:00 AM - 4:00 PM",
        venue: "Bangalore Community Center",
        city: "Bangalore",
        description: "Join us for our annual Summer donation drive. Free refreshments and checks provided.",
        createdBy: admin._id,
        status: "Upcoming"
      },
      {
        name: "Metro Hope Campaign",
        organizer: "Metro Red Cross",
        date: new Date("2026-06-25"),
        time: "10:00 AM - 5:00 PM",
        venue: "City General Plaza",
        city: "Mumbai",
        description: "Emergency blood replenishing campaign organized in association with Metro Red Cross.",
        createdBy: admin._id,
        status: "Upcoming"
      },
      {
        name: "RaktaBandhu Campus Camp",
        organizer: "KLE Student Union",
        date: new Date("2026-07-05"),
        time: "9:00 AM - 3:00 PM",
        venue: "KLE Tech Campus Arena",
        city: "Hubli",
        description: "Youth lead campaign targeting critical student donor support and awareness.",
        createdBy: admin._id,
        status: "Upcoming"
      }
    ];

    for (const camp of campsData) {
      const exists = await Camp.findOne({ name: camp.name });
      if (!exists) {
        await Camp.create(camp);
        console.log(`Created camp: ${camp.name}`);
      } else {
        console.log(`Camp already exists: ${camp.name}`);
      }
    }

    console.log('Seeding camps complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding camps:', error);
    process.exit(1);
  }
};

seedCamps();
