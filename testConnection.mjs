import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glossixpro';

console.log('🔍 Testing MongoDB Connection...\n');
console.log('📝 Connection Details:');
console.log('   URI:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password
console.log('   Database:', mongoose.connection.name || 'glossixpro');
console.log('\n⏳ Connecting...\n');

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ SUCCESS! MongoDB connected successfully');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('🔌 Port:', mongoose.connection.port || 'N/A (using SRV)');
        console.log('📦 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Unknown');

        // List collections
        mongoose.connection.db.listCollections().toArray()
            .then(collections => {
                console.log('\n📚 Existing Collections:');
                if (collections.length === 0) {
                    console.log('   (No collections yet - this is normal for a new database)');
                } else {
                    collections.forEach(col => {
                        console.log(`   - ${col.name}`);
                    });
                }

                console.log('\n✨ Connection test completed successfully!');
                console.log('👍 You can now use MongoDB Atlas with your application.\n');
                process.exit(0);
            })
            .catch(err => {
                console.error('⚠️  Could not list collections:', err.message);
                process.exit(0);
            });
    })
    .catch(err => {
        console.error('❌ FAILED! MongoDB connection error\n');
        console.error('Error Type:', err.name);
        console.error('Error Message:', err.message);
        console.log('\n💡 Troubleshooting Tips:');

        if (err.message.includes('bad auth')) {
            console.log('   - Check your username and password in the connection string');
            console.log('   - Ensure special characters in password are URL-encoded');
        } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
            console.log('   - Check your internet connection');
            console.log('   - Verify the cluster address is correct');
        } else if (err.message.includes('IP') || err.message.includes('whitelist')) {
            console.log('   - Add your IP address to Atlas Network Access');
            console.log('   - Or allow access from anywhere (0.0.0.0/0)');
        } else {
            console.log('   - Verify your MONGO_URI in .env file');
            console.log('   - Check MongoDB Atlas dashboard for cluster status');
        }

        console.log('\n📖 See MONGODB_ATLAS_MIGRATION_GUIDE.md for detailed help\n');
        process.exit(1);
    });

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});
