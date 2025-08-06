const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

// Test with connection pool configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function testBatchInsert() {
  console.log("Testing batch insert with connection pool management...\n")

  try {
    // Create test data (using Indiv_ID range)
    const testCustomers = [
      {
        id: BigInt("1"),
        email: "test1@example.com",
        password: "",
        firstName: "Test",
        lastName: "User1",
        phone: "1234567890",
      },
      {
        id: BigInt("2"),
        email: "test2@example.com",
        password: "",
        firstName: "Test",
        lastName: "User2",
        phone: "1234567891",
      },
    ]

    console.log("Inserting test records...")
    const result = await prisma.customer.createMany({
      data: testCustomers,
      skipDuplicates: true,
    })

    console.log(`✅ Successfully inserted ${result.count} records`)

    // Verify the records
    const count = await prisma.customer.count()
    console.log(`📊 Total records in database: ${count}`)

    // Clean up test data
    console.log("\nCleaning up test data...")
    await prisma.customer.deleteMany({
      where: {
        email: {
          in: ["test1@example.com", "test2@example.com"],
        },
      },
    })

    console.log("✅ Test completed successfully!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testBatchInsert().catch(console.error)
