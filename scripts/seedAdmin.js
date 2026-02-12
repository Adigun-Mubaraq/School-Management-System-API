const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/index.config');
const User = require('../managers/entities/user/User.mongoModel');

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(config.dotEnv.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        const adminEmail = 'superadmin@school.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Superadmin already exists. Skipping seed.');
        } else {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const superAdmin = new User({
                _id: new mongoose.Types.ObjectId('65ca1e1e1e1e1e1e1e1e1e1e'), // Fixed ID for wild.system mapping
                username: 'superadmin',
                email: adminEmail,
                password: hashedPassword,
                role: 'superadmin'
            });

            await superAdmin.save();
            console.log('Superadmin seeded successfully!');
            console.log('Email: superadmin@school.com');
            console.log('Password: admin123');
        }

    } catch (error) {
        console.error('Error seeding superadmin:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

seedSuperAdmin();
