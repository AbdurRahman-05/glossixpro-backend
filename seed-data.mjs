import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

import Job from './models/Job.js';
import Image from './models/Image.js';

const sampleJobs = [
    {
        title: 'Senior Editor',
        location: 'Remote / New York',
        description: 'We are looking for an experienced editor to lead our content team. You will be responsible for overseeing the quality and consistency of all our publications.'
    },
    {
        title: 'Digital Publishing Specialist',
        location: 'London, UK',
        description: 'Join our technical team to help transform traditional manuscripts into digital formats. Experience with XML and ePub is required.'
    },
    {
        title: 'Graphic Designer',
        location: 'Remote',
        description: 'Create stunning visuals for our e-books and marketing materials. Proficiency in Adobe Creative Suite is a must.'
    }
];

const sampleImages = [
    {
        category: 'home',
        src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        alt: 'Office Workspace'
    },
    {
        category: 'home',
        src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        alt: 'Team Collaboration'
    },
    {
        category: 'home',
        src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
        alt: 'Meeting'
    },
    {
        category: 'home',
        src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        alt: 'Presentation'
    },
    {
        category: 'home',
        src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
        alt: 'Coworking'
    }
];

async function seedData() {
    try {
        console.log('🌱 Seeding Database...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Job.deleteMany({});
        await Image.deleteMany({});
        console.log('🧹 Cleared existing jobs and images');

        // Insert Jobs
        await Job.insertMany(sampleJobs);
        console.log(`✅ Added ${sampleJobs.length} sample jobs`);

        // Insert Images
        await Image.insertMany(sampleImages);
        console.log(`✅ Added ${sampleImages.length} sample images`);

        console.log('\n✨ Database seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed.');
        process.exit(0);
    }
}

seedData();
