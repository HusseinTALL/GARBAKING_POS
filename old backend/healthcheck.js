/**
 * Health check script for Docker container
 * Simple HTTP request to check if the server is running
 */

const http = require('http')

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 8000,
  path: '/health',
  method: 'GET',
  timeout: 3000
}

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    console.error(`Health check failed with status: ${res.statusCode}`)
    process.exit(1)
  }
})

req.on('error', (err) => {
  console.error(`Health check failed: ${err.message}`)
  process.exit(1)
})

req.on('timeout', () => {
  console.error('Health check timed out')
  req.destroy()
  process.exit(1)
})

req.end()