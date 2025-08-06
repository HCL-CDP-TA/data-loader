const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const csv = require("csv-parser")
const path = require("path")
require("dotenv").config()

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Path to the CSV file
const CSV_FILE_PATH = path.join(__dirname, "../data/cdpprofile_cleaned.csv")

// Batch size for database inserts (smaller for remote database)
const BATCH_SIZE = 50

async function loadCSVData() {
  console.log("Starting CSV data load...")

  try {
    const customers = []
    let processedCount = 0
    let totalCount = 0
    let batchQueue = []

    // Read and parse CSV file
    const stream = fs
      .createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on("data", row => {
        totalCount++

        // Map CSV columns to database fields
        const customer = {
          id: BigInt(row.Indiv_ID), // Using Indiv_ID as numeric id
          email: row.Email || `customer${row.Indiv_ID}@example.com`, // Fallback email if missing
          password: "", // Default empty password
          firstName: row.First_Name || "Unknown",
          lastName: row.Last_Name || "Unknown",
          phone: row.Cell_Number || null,
        }

        customers.push(customer)

        // Collect batches but don't process them yet
        if (customers.length >= BATCH_SIZE) {
          batchQueue.push(customers.splice(0, BATCH_SIZE))
        }
      })
      .on("end", async () => {
        console.log(`\nFinished reading CSV. Total records: ${totalCount}`)

        // Add remaining records as final batch
        if (customers.length > 0) {
          batchQueue.push(customers)
        }

        console.log(`\nProcessing ${batchQueue.length} batches sequentially...`)

        // Process batches sequentially to avoid connection pool exhaustion
        for (let i = 0; i < batchQueue.length; i++) {
          try {
            const count = await processBatch(batchQueue[i])
            processedCount += count
            console.log(
              `Processed batch ${i + 1}/${
                batchQueue.length
              }: ${count} records (Total: ${processedCount}/${totalCount})`,
            )
          } catch (error) {
            console.error(`Error processing batch ${i + 1}:`, error)
          }
        }

        console.log(`\nData load completed! Processed ${processedCount} records.`)
        await prisma.$disconnect()
      })
      .on("error", error => {
        console.error("Error reading CSV file:", error)
      })
  } catch (error) {
    console.error("Error loading CSV data:", error)
    await prisma.$disconnect()
  }
}

async function processBatch(batch) {
  try {
    // Use createMany for efficient batch insert
    // Skip duplicates to handle potential re-runs
    const result = await prisma.customer.createMany({
      data: batch,
      skipDuplicates: true,
    })

    return result.count
  } catch (error) {
    console.error("Error processing batch:", error)

    // If batch insert fails, try individual inserts to identify problematic records
    let successCount = 0
    for (const customer of batch) {
      try {
        await prisma.customer.create({
          data: customer,
        })
        successCount++
      } catch (individualError) {
        console.error(`Failed to insert customer ${customer.indivId}:`, individualError.message)
      }
    }

    return successCount
  }
}

// Function to clear all customer data
async function clearCustomerTable() {
  try {
    console.log("🗑️  Clearing existing customer data...")
    const result = await prisma.customer.deleteMany({})
    console.log(`✅ Cleared ${result.count} existing customer records`)
    return result.count
  } catch (error) {
    console.error("❌ Error clearing customer table:", error.message)
    throw error
  }
}

// Function to check if data already exists
async function checkExistingData() {
  const count = await prisma.customer.count()
  console.log(`Current customer count in database: ${count}`)

  if (count > 0) {
    console.log("Warning: Database already contains customer data.")
    console.log("The loader will skip duplicate records based on indivId.")
  }

  return count
}

// Function to validate database connection
async function validateConnection() {
  try {
    await prisma.$connect()
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    return false
  }
}

// Main execution
async function main() {
  console.log("=== CSV to Database Loader ===\n")

  // Validate database connection
  const isConnected = await validateConnection()
  if (!isConnected) {
    process.exit(1)
  }

  // Clear existing customer data
  await clearCustomerTable()

  // Validate CSV file exists
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ CSV file not found: ${CSV_FILE_PATH}`)
    process.exit(1)
  }

  console.log(`📁 Loading data from: ${CSV_FILE_PATH}\n`)

  // Start the data load
  await loadCSVData()
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT. Gracefully shutting down...")
  await prisma.$disconnect()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM. Gracefully shutting down...")
  await prisma.$disconnect()
  process.exit(0)
})

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error("❌ Application error:", error)
    process.exit(1)
  })
}

module.exports = { loadCSVData, checkExistingData, clearCustomerTable }
