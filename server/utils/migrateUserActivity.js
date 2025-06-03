const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrateUserActivity() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all users to remove activityLog field
    const result = await User.updateMany(
      { activityLog: { $exists: true } },
      { $unset: { activityLog: "" } }
    );

    console.log(`Updated ${result.modifiedCount} documents`);

    // Check if any users still have activityLog
    const remaining = await User.countDocuments({ activityLog: { $exists: true } });
    console.log(`Users still having activityLog: ${remaining}`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateUserActivity(); 