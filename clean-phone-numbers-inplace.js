const fs = require("fs")
const csv = require("csv-parser")
const path = require("path")

// Target file path - will be modified in place
const CSV_FILE_PATH = path.join(__dirname, "../data/cdpprofile.csv")
const BACKUP_FILE_PATH = path.join(__dirname, "../data/cdpprofile_backup.csv")

/**
 * Clean phone number by removing all non-numeric characters
 * @param {string} phoneNumber - The phone number to clean
 * @returns {string} - Cleaned phone number with only digits
 */
function cleanPhoneNumber(phoneNumber) {
  if (!phoneNumber || phoneNumber.trim() === "") {
    return ""
  }

  // Remove all non-numeric characters
  return phoneNumber.replace(/\D/g, "")
}

/**
 * Clean phone numbers in place (overwrites original file)
 */
async function cleanPhoneNumbersInPlace() {
  console.log("=== Phone Number In-Place Cleaner ===\n")
  console.log(`⚠️  WARNING: This will modify the original file: ${CSV_FILE_PATH}`)
  console.log(`📋 A backup will be created at: ${BACKUP_FILE_PATH}\n`)

  // Check if input file exists
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ Input file not found: ${CSV_FILE_PATH}`)
    process.exit(1)
  }

  // Create backup
  console.log("💾 Creating backup of original file...")
  fs.copyFileSync(CSV_FILE_PATH, BACKUP_FILE_PATH)
  console.log("✅ Backup created successfully\n")

  const results = []
  let headers = []
  let totalRecords = 0
  let cleanedRecords = 0
  let emptyPhoneRecords = 0

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on("headers", headerList => {
        headers = headerList
        console.log("📋 CSV Headers found")

        if (!headers.includes("Cell_Number")) {
          console.error("❌ Cell_Number column not found in CSV!")
          reject(new Error("Cell_Number column not found"))
          return
        }

        console.log("✅ Cell_Number column found, starting cleanup...\n")
      })
      .on("data", row => {
        totalRecords++

        const originalPhone = row.Cell_Number
        const cleanedPhone = cleanPhoneNumber(originalPhone)

        // Update the row with cleaned phone number
        row.Cell_Number = cleanedPhone

        // Track statistics
        if (originalPhone && originalPhone.trim() !== "") {
          if (originalPhone !== cleanedPhone) {
            cleanedRecords++

            // Log first few examples
            if (cleanedRecords <= 3) {
              console.log(`📞 Example ${cleanedRecords}: "${originalPhone}" → "${cleanedPhone}"`)
            }
          }
        } else {
          emptyPhoneRecords++
        }

        results.push(row)

        // Progress indicator
        if (totalRecords % 10000 === 0) {
          console.log(`📊 Processed ${totalRecords} records...`)
        }
      })
      .on("end", () => {
        console.log(`\n📊 Processing completed!`)
        console.log(`   Total records: ${totalRecords}`)
        console.log(`   Records with phone numbers cleaned: ${cleanedRecords}`)
        console.log(`   Records with empty phone numbers: ${emptyPhoneRecords}`)
        console.log(`   Records unchanged: ${totalRecords - cleanedRecords - emptyPhoneRecords}\n`)

        // Write cleaned data back to original file
        writeCleanedCSVInPlace(results, headers)
          .then(() => {
            console.log("✅ In-place phone number cleanup completed successfully!")
            console.log(`📁 Original file updated: ${CSV_FILE_PATH}`)
            console.log(`📁 Backup available at: ${BACKUP_FILE_PATH}`)
            resolve()
          })
          .catch(reject)
      })
      .on("error", error => {
        console.error("❌ Error reading CSV file:", error)
        reject(error)
      })
  })
}

/**
 * Write cleaned data back to the original CSV file
 * @param {Array} data - Array of cleaned row objects
 * @param {Array} headers - CSV headers
 */
async function writeCleanedCSVInPlace(data, headers) {
  console.log("💾 Writing cleaned data back to original file...")

  try {
    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header] || ""
            // Escape values that contain commas, quotes, or newlines
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // Write to original file
    fs.writeFileSync(CSV_FILE_PATH, csvContent, "utf8")

    console.log(`✅ Original file updated successfully`)

    // Verify file
    const stats = fs.statSync(CSV_FILE_PATH)
    console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
  } catch (error) {
    console.error("❌ Error writing cleaned CSV file:", error)
    console.log("🔄 Attempting to restore from backup...")

    try {
      // Restore from backup
      fs.copyFileSync(BACKUP_FILE_PATH, CSV_FILE_PATH)
      console.log("✅ File restored from backup")
    } catch (restoreError) {
      console.error("❌ Failed to restore from backup:", restoreError)
    }

    throw error
  }
}

/**
 * Prompt user for confirmation
 */
function promptConfirmation() {
  return new Promise(resolve => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    readline.question("Do you want to proceed with in-place cleaning? (y/N): ", answer => {
      readline.close()
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

// Main execution
async function main() {
  try {
    console.log("⚠️  This script will modify your original CSV file in place.")
    console.log("A backup will be created before making changes.\n")

    // Prompt for confirmation in interactive mode
    if (process.stdin.isTTY) {
      const confirmed = await promptConfirmation()
      if (!confirmed) {
        console.log("❌ Operation cancelled by user")
        process.exit(0)
      }
    }

    // Clean phone numbers in place
    await cleanPhoneNumbersInPlace()

    console.log("\n🎉 In-place phone number cleaning completed successfully!")
  } catch (error) {
    console.error("❌ Error during in-place phone number cleaning:", error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Process interrupted. Exiting...")
  process.exit(0)
})

// Run the script
if (require.main === module) {
  main()
}

module.exports = { cleanPhoneNumbersInPlace }
