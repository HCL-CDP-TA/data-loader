const fs = require("fs")
const csv = require("csv-parser")
const path = require("path")

// Input and output file paths
const INPUT_CSV_PATH = path.join(__dirname, "../data/cdpprofile.csv")
const OUTPUT_CSV_PATH = path.join(__dirname, "../data/cdpprofile_cleaned.csv")

// Track statistics
let totalRecords = 0
let cleanedRecords = 0
let emptyPhoneRecords = 0

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
  const cleaned = phoneNumber.replace(/\D/g, "")

  return cleaned
}

/**
 * Process CSV file and clean phone numbers
 */
async function cleanPhoneNumbers() {
  console.log("=== Phone Number Cleaner ===\n")
  console.log(`📁 Input file: ${INPUT_CSV_PATH}`)
  console.log(`📁 Output file: ${OUTPUT_CSV_PATH}\n`)

  // Check if input file exists
  if (!fs.existsSync(INPUT_CSV_PATH)) {
    console.error(`❌ Input file not found: ${INPUT_CSV_PATH}`)
    process.exit(1)
  }

  const results = []
  let headers = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_CSV_PATH)
      .pipe(csv())
      .on("headers", headerList => {
        headers = headerList
        console.log("📋 CSV Headers:", headers.join(", "))
        console.log("🔍 Looking for Cell_Number column...\n")

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
            if (cleanedRecords <= 5) {
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
        console.log(`   Records with unchanged phone numbers: ${totalRecords - cleanedRecords - emptyPhoneRecords}\n`)

        // Write cleaned data to output file
        writeCleanedCSV(results, headers)
          .then(() => {
            console.log("✅ Phone number cleanup completed successfully!")
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
 * Write cleaned data to output CSV file
 * @param {Array} data - Array of cleaned row objects
 * @param {Array} headers - CSV headers
 */
async function writeCleanedCSV(data, headers) {
  console.log("💾 Writing cleaned data to output file...")

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

    // Write to file
    fs.writeFileSync(OUTPUT_CSV_PATH, csvContent, "utf8")

    console.log(`✅ Cleaned data written to: ${OUTPUT_CSV_PATH}`)

    // Verify file was created
    const stats = fs.statSync(OUTPUT_CSV_PATH)
    console.log(`📊 Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
  } catch (error) {
    console.error("❌ Error writing cleaned CSV file:", error)
    throw error
  }
}

/**
 * Show sample of cleaned phone numbers
 */
async function showSample() {
  console.log("\n=== Sample of Cleaned Phone Numbers ===\n")

  let count = 0
  const sampleSize = 10

  fs.createReadStream(OUTPUT_CSV_PATH)
    .pipe(csv())
    .on("data", row => {
      if (count < sampleSize && row.Cell_Number && row.Cell_Number.trim() !== "") {
        console.log(`${row.Indiv_ID}: ${row.First_Name} ${row.Last_Name} - ${row.Cell_Number}`)
        count++
      }
    })
    .on("end", () => {
      console.log(`\n📋 Showing ${count} sample records with cleaned phone numbers`)
    })
}

/**
 * Validate cleaned phone numbers
 */
async function validateCleanedData() {
  console.log("\n=== Validation ===\n")

  let validPhone = 0
  let invalidPhone = 0
  let emptyPhone = 0
  let totalValidated = 0

  return new Promise(resolve => {
    fs.createReadStream(OUTPUT_CSV_PATH)
      .pipe(csv())
      .on("data", row => {
        totalValidated++
        const phone = row.Cell_Number

        if (!phone || phone.trim() === "") {
          emptyPhone++
        } else if (/^\d+$/.test(phone)) {
          validPhone++
        } else {
          invalidPhone++
          if (invalidPhone <= 5) {
            console.log(`⚠️  Invalid phone found: "${phone}" for ID ${row.Indiv_ID}`)
          }
        }
      })
      .on("end", () => {
        console.log(`📊 Validation Results:`)
        console.log(`   Total records validated: ${totalValidated}`)
        console.log(`   Valid numeric phone numbers: ${validPhone}`)
        console.log(`   Empty phone numbers: ${emptyPhone}`)
        console.log(`   Invalid phone numbers: ${invalidPhone}`)

        if (invalidPhone === 0) {
          console.log("✅ All phone numbers are properly cleaned (numeric only)!")
        } else {
          console.log("⚠️  Some phone numbers may need additional cleaning")
        }

        resolve()
      })
  })
}

// Main execution
async function main() {
  try {
    // Clean phone numbers
    await cleanPhoneNumbers()

    // Show sample
    await showSample()

    // Validate results
    await validateCleanedData()

    console.log("\n🎉 Phone number cleaning process completed successfully!")
    console.log(`📁 Cleaned file available at: ${OUTPUT_CSV_PATH}`)
  } catch (error) {
    console.error("❌ Error during phone number cleaning:", error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Process interrupted. Cleaning up...")
  process.exit(0)
})

// Run the script
if (require.main === module) {
  main()
}

module.exports = { cleanPhoneNumber, cleanPhoneNumbers }
