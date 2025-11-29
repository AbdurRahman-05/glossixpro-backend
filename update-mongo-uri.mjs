import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

// Read current .env file
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

// Updated MongoDB URI with database name and proper parameters
const newMongoUri = 'mongodb+srv://glossixproweb_db_user:gMgocUEhZ5VonPv5@cluster0.8f39li6.mongodb.net/glossixpro?retryWrites=true&w=majority&appName=Cluster0';

// Update or add MONGO_URI
const lines = envContent.split('\n');
let mongoUriFound = false;

const updatedLines = lines.map(line => {
    if (line.startsWith('MONGO_URI=')) {
        mongoUriFound = true;
        return `MONGO_URI=${newMongoUri}`;
    }
    return line;
});

// If MONGO_URI wasn't found, add it
if (!mongoUriFound) {
    updatedLines.push(`MONGO_URI=${newMongoUri}`);
}

// Write back to .env
fs.writeFileSync(envPath, updatedLines.join('\n'));

console.log('✅ MongoDB URI updated successfully!');
console.log('📝 New URI:', newMongoUri);
console.log('\n🔄 Please restart your backend server for changes to take effect.');
