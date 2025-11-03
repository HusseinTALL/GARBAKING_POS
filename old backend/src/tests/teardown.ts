/**
 * Jest global teardown
 * Cleans up test database and resources after all tests complete
 */

export default async () => {
  // Clean up test database file if it exists
  const fs = require('fs')
  const path = require('path')

  const testDbPath = path.join(__dirname, '../../test.db')
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath)
      console.log('🧹 Test database cleaned up')
    } catch (error: any) {
      console.warn('Warning: Could not delete test database file:', error.message)
    }
  }
}