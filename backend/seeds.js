const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); // Assuming the User model is already set up
require('dotenv').config();

const createSuperAdmin = async () => {
  const superAdminEmail = 'superadmin@example.com'; // Super admin email
  const superAdminPassword = 'superadminpassword'; // Super admin password

  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if the super admin already exists
    const existingAdmin = await User.findOne({ email: superAdminEmail });
    if (existingAdmin) {
      console.log('Super admin already exists.');
      return;
    }

    // Hash the super admin password before saving
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
console.log('Hashed password:', hashedPassword);


    // Create and save the super admin user
    const superAdmin = new User({
      firstName: 'Super',
      email: superAdminEmail,
      phone: '1234567890',  // Sample phone number, adjust as necessary
      password: hashedPassword,  // Store the hashed password
      role: 'superadmin',  // Super admin role
    });

    // Save the super admin in the database
    await superAdmin.save();
    console.log('Super admin created successfully.');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    // Close the mongoose connection after the operation is complete
    mongoose.connection.close();
  }
};

// Run the function to create the super admin
createSuperAdmin();
