const fetch = require('node-fetch');

async function testApi() {
    try {
        const response = await fetch('http://localhost:3002/api/images?category=career-globe');
        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            return;
        }
        const data = await response.json();
        console.log('Images found:', data.length);
        if (data.length > 0) {
            console.log('First image src:', data[0].src);
            console.log('First image category:', data[0].category);
        } else {
            console.log('No images found.');
        }
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

testApi();
