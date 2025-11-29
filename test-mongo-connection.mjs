import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('🔍 Testing MongoDB Connection...\n');
console.log('📝 Connection String:', MONGO_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

async function testConnection() {
    try {
        await mongoose.connect(MONGO_URI);

        console.log('\n✅ MongoDB Connection Successful!');
        console.log('📊 Database Name:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('📡 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📚 Collections in database:');
        if (collections.length === 0) {
            console.log('   (No collections yet - database is empty)');
        } else {
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
        }

        console.log('\n✨ Connection test completed successfully!');

    } catch (error) {
        console.error('\n❌ MongoDB Connection Failed!');
        console.error('Error:', error.message);

        if (error.message.includes('IP')) {
            console.error('\n💡 Tip: Make sure your IP address is whitelisted in MongoDB Atlas');
            console.error('   Go to: Network Access → Add IP Address');
        }
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed.');
        process.exit(0);
    }
}

testConnection();
