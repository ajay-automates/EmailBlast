const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

console.log('=== .env.local Content ===')
envContent.split('\n').forEach(line => {
    if (line.includes('SENDGRID')) {
        if (line.includes('API_KEY')) {
            const parts = line.split('=')
            console.log(`${parts[0]}=${parts[1]?.substring(0, 10)}...`)
        } else {
            console.log(line)
        }
    }
})
console.log('========================')
