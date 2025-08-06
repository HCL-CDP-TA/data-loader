const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function resumeLoad() {
  console.log("=== Resume CSV Data Load ===\n")

  try {
    // Check current state
    const currentCount = await prisma.customer.count()
    console.log(`📊 Current records in database: ${currentCount}`)

    if (currentCount > 0) {
      console.log("⚠️  Database contains partial data from previous load")
      console.log("Options:")
      console.log("1. Continue loading (will skip duplicates)")
      console.log("2. Clear database and start fresh")
      console.log("\nTo clear database: npm run prisma:reset")
      console.log("To continue loading: npm start")

      // Show sample of existing data
      const samples = await prisma.customer.findMany({
        take: 3,
        orderBy: { id: "asc" },
      })

      console.log("\nSample existing records:")
      samples.forEach(customer => {
        console.log(`  ID: ${customer.id}, Name: ${customer.firstName} ${customer.lastName}, Email: ${customer.email}`)
      })
    } else {
      console.log("✅ Database is empty and ready for fresh load")
      console.log("Run: npm start")
    }
  } catch (error) {
    console.error("❌ Error checking database state:", error)
  } finally {
    await prisma.$disconnect()
  }
}

resumeLoad().catch(console.error)
