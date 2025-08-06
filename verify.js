const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

const prisma = new PrismaClient()

async function verifyData() {
  console.log("=== Data Verification ===\n")

  try {
    // Get total count
    const totalCount = await prisma.customer.count()
    console.log(`📊 Total customers in database: ${totalCount}`)

    // Get sample records
    const sampleRecords = await prisma.customer.findMany({
      take: 5,
      orderBy: { id: "asc" },
    })

    console.log("\n📋 Sample records:")
    sampleRecords.forEach(customer => {
      console.log(`  ID: ${customer.id}, Name: ${customer.firstName} ${customer.lastName}, Email: ${customer.email}`)
    })

    // Using simple schema - no additional fields to check
    console.log("\n✅ Using simple Customer schema with Indiv_ID as ID")

    // Check duplicate emails
    const emailCounts = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count 
      FROM "Customer" 
      GROUP BY email 
      HAVING COUNT(*) > 1 
      LIMIT 5
    `

    if (emailCounts.length > 0) {
      console.log("\n⚠️  Duplicate emails found:")
      emailCounts.forEach(row => {
        console.log(`  ${row.email}: ${row.count} occurrences`)
      })
    } else {
      console.log("\n✅ No duplicate emails found")
    }
  } catch (error) {
    console.error("❌ Error verifying data:", error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  verifyData().catch(console.error)
}

module.exports = { verifyData }
