import mongoose from 'mongoose';
import Image from './models/Image.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://glossixproweb_db_user:gMgocUEhZ5VonPv5@cluster0.8f39li6.mongodb.net/?appName=Cluster0';

const SAMPLE_IMAGES = [
    {
        src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop',
        alt: 'Abstract art',
        category: 'career-globe'
    },
    {
        src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop',
        alt: 'Modern sculpture',
        category: 'career-globe'
    },
    {
        src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop',
        alt: 'Digital artwork',
        category: 'career-globe'
    },
    {
        src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop',
        alt: 'Contemporary art',
        category: 'career-globe'
    },
    {
        src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop',
        alt: 'Geometric pattern',
        category: 'career-globe'
    },
    {
        src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop',
        alt: 'Textured surface',
        category: 'career-globe'
    },
    {
        src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large',
        alt: 'Social media image',
        category: 'career-globe'
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if images already exist to avoid duplicates
        const count = await Image.countDocuments({ category: 'career-globe' });
        if (count > 0) {
            console.log(`Found ${count} existing images in 'career-globe'. Skipping seed.`);
            process.exit(0);
        }

        console.log('Seeding sample images...');
        await Image.insertMany(SAMPLE_IMAGES);
        console.log('Successfully seeded images!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
