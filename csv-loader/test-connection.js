const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

const prisma = new PrismaClient()

async function testConnection() {
  console.log("=== Database Connection Test ===\n")

  try {
    // Test basic connection
    console.log("Testing database connection...")
    await prisma.$connect()
    console.log("✅ Database connection successful\n")

    // Try to query the database directly to see what tables exist
    console.log("Checking existing tables...")
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `

    console.log("📋 Tables found in database:")
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })

    // Check if the expected table exists
    const expectedTable = tables.find(
      table => table.table_name === "customers" || table.table_name === "Customer" || table.table_name === "customer",
    )

    if (expectedTable) {
      console.log(`\n✅ Found customer table: ${expectedTable.table_name}`)

      // Try to describe the table structure
      console.log("\n📊 Table structure:")
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = ${expectedTable.table_name}
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `

      columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === "YES" ? "(nullable)" : "(not null)"}`)
      })
    } else {
      console.log("\n❌ No customer table found")
      console.log("Available tables:", tables.map(t => t.table_name).join(", "))
    }
  } catch (error) {
    console.error("❌ Database connection error:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection().catch(console.error)
