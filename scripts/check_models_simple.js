
const https = require('https');
const fs = require('fs');
const path = require('path');

// Simple .env parser
function getEnv(key) {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(new RegExp(`${key}=(.+)`));
        return match ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
}

const apiKey = getEnv('VITE_GROQ_API_KEY');

if (!apiKey) {
    console.error("Error: VITE_GROQ_API_KEY not found in .env");
    process.exit(1);
}

const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/models',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const json = JSON.parse(data);
                console.log("Available Models:");
                json.data.forEach(model => {
                    console.log(`- ${model.id}`);
                });
            } catch (e) {
                console.error("Error parsing JSON:", e);
                console.log("Raw response:", data);
            }
        } else {
            console.error(`API Error: ${res.statusCode}`);
            console.error(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
