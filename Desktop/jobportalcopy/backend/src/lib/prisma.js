const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

// Create Prisma client with connection retry configuration
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection timeout and retry settings
    __internal: {
      engine: {
        connectTimeout: 30000, // 30 seconds
      },
    },
  });

// Helper function to test database connection with retry
async function testConnection(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Successfully connected to MongoDB');
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${i + 1}/${retries} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('⚠️  MongoDB Atlas cluster appears to be unreachable. Please check:');
        console.error('   1. MongoDB Atlas cluster status (check MongoDB Atlas dashboard)');
        console.error('   2. Network connectivity');
        console.error('   3. IP whitelist settings in MongoDB Atlas (allow 0.0.0.0/0 for testing)');
        console.error('   4. Connection string in .env file (verify DATABASE_URL)');
        console.error('   5. MongoDB Atlas cluster might be paused (free tier)');
        return false;
      }
    }
  }
  return false;
}

// Helper function to retry database queries
async function retryQuery(queryFn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      const errorMessage = error.message || String(error);
      const isConnectionError = 
        errorMessage.includes('Server selection timeout') ||
        errorMessage.includes('No available servers') ||
        errorMessage.includes('fatal alert: InternalError') ||
        errorMessage.includes('connection') ||
        error.code === 'P2010';
      
      if (isConnectionError && i < retries - 1) {
        console.log(`⚠️  Database query failed (attempt ${i + 1}/${retries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Try to reconnect
        try {
          await prisma.$disconnect();
          await prisma.$connect();
        } catch (reconnectError) {
          // Ignore reconnect errors, will retry query
        }
      } else {
        throw error;
      }
    }
  }
  throw new Error('Query failed after all retries');
}

// Test connection on startup (non-blocking)
if (process.env.NODE_ENV === 'development') {
  testConnection().catch(console.error);
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = { prisma, retryQuery };
