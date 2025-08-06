const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

const prisma = new PrismaClient()

async function convertToAutoIncrement() {
  console.log("=== Converting ID to Auto-Increment ===\n")

  try {
    console.log("⚠️  This will modify the database structure and may take some time...")
    console.log("📋 Steps:")
    console.log("  1. Add new auto-increment column")
    console.log("  2. Copy existing data with new IDs")
    console.log("  3. Switch primary key to auto-increment")
    console.log("  4. Store original Indiv_ID values in a separate field\n")

    // Check current record count
    const currentCount = await prisma.customer.count()
    console.log(`📊 Current records in database: ${currentCount}`)

    if (currentCount === 0) {
      console.log("❌ No data found. Load CSV data first before converting to auto-increment.")
      return
    }

    console.log("\n🔄 Starting conversion process...\n")

    // Step 1: Add new columns for the conversion
    console.log("Step 1: Adding new auto-increment column...")
    await prisma.$executeRaw`
      ALTER TABLE "Customer" 
      ADD COLUMN new_id SERIAL,
      ADD COLUMN original_indiv_id BIGINT
    `

    // Step 2: Copy the current ID values to the original_indiv_id field
    console.log("Step 2: Preserving original Indiv_ID values...")
    await prisma.$executeRaw`
      UPDATE "Customer" 
      SET original_indiv_id = id
    `

    // Step 3: Drop the old primary key constraint and create new one
    console.log("Step 3: Updating primary key constraint...")
    await prisma.$executeRaw`
      ALTER TABLE "Customer" 
      DROP CONSTRAINT "Customer_pkey"
    `

    await prisma.$executeRaw`
      ALTER TABLE "Customer" 
      DROP COLUMN id
    `

    await prisma.$executeRaw`
      ALTER TABLE "Customer" 
      RENAME COLUMN new_id TO id
    `

    await prisma.$executeRaw`
      ALTER TABLE "Customer" 
      ADD PRIMARY KEY (id)
    `

    // Step 4: Add unique constraint on original indiv IDs
    console.log("Step 4: Adding unique constraint on original Indiv_ID values...")
    await prisma.$executeRaw`
      ALTER TABLE "Customer" 
      ADD CONSTRAINT "Customer_original_indiv_id_unique" 
      UNIQUE (original_indiv_id)
    `

    console.log("\n✅ Conversion completed successfully!")
    console.log(`📊 Records processed: ${currentCount}`)
    console.log("📋 Changes made:")
    console.log("  • ID is now auto-incrementing (starting from 1)")
    console.log("  • Original Indiv_ID values preserved in original_indiv_id field")
    console.log("  • original_indiv_id field has unique constraint")

    // Show sample of converted data
    console.log("\n📋 Sample of converted records:")
    const samples = await prisma.$queryRaw`
      SELECT id, original_indiv_id, "firstName", "lastName", email 
      FROM "Customer" 
      ORDER BY id 
      LIMIT 5
    `

    samples.forEach(record => {
      console.log(
        `  New ID: ${record.id}, Original Indiv_ID: ${record.original_indiv_id}, Name: ${record.firstName} ${record.lastName}`,
      )
    })
  } catch (error) {
    console.error("❌ Error during conversion:", error)
    console.log("\n🔄 Attempting to rollback changes...")

    try {
      // Attempt basic cleanup if possible
      await prisma.$executeRaw`
        ALTER TABLE "Customer" DROP COLUMN IF EXISTS new_id CASCADE
      `
      await prisma.$executeRaw`
        ALTER TABLE "Customer" DROP COLUMN IF EXISTS original_account_number CASCADE
      `
      console.log("✅ Rollback completed")
    } catch (rollbackError) {
      console.error("❌ Rollback failed:", rollbackError.message)
      console.log("⚠️  Manual database cleanup may be required")
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
if (require.main === module) {
  convertToAutoIncrement().catch(console.error)
}

module.exports = { convertToAutoIncrement }
