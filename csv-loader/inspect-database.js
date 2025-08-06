const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

const prisma = new PrismaClient()

async function inspectDatabase() {
  console.log("=== Comprehensive Database Inspection ===\n")

  try {
    // Test basic connection
    console.log("Testing database connection...")
    await prisma.$connect()
    console.log("✅ Database connection successful\n")

    // Get all tables in all schemas
    console.log("Checking all tables in database...")
    const allTables = await prisma.$queryRaw`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
      ORDER BY schemaname, tablename
    `

    console.log("📋 All tables found:")
    allTables.forEach(table => {
      console.log(`  ${table.schemaname}.${table.tablename}`)
    })

    // Look specifically for customer/customers tables (case insensitive)
    console.log("\n🔍 Looking for customer-related tables...")
    const customerTables = await prisma.$queryRaw`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE LOWER(tablename) LIKE '%customer%'
      AND schemaname NOT IN ('information_schema', 'pg_catalog')
    `

    if (customerTables.length > 0) {
      console.log("📋 Customer-related tables:")
      for (const table of customerTables) {
        console.log(`\n  📊 Table: ${table.schemaname}.${table.tablename}`)

        // Get column details for each customer table
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = ${table.tablename}
          AND table_schema = ${table.schemaname}
          ORDER BY ordinal_position
        `

        columns.forEach(col => {
          const nullable = col.is_nullable === "YES" ? "(nullable)" : "(not null)"
          const defaultVal = col.column_default ? ` default: ${col.column_default}` : ""
          console.log(`    ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`)
        })

        // Get row count
        try {
          const countResult = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM "${table.schemaname}"."${table.tablename}"`,
          )
          console.log(`    📊 Row count: ${countResult[0].count}`)
        } catch (error) {
          console.log(`    📊 Row count: Unable to determine (${error.message})`)
        }
      }
    } else {
      console.log("❌ No customer-related tables found")
    }

    // Show current database and schema being used
    const dbInfo = await prisma.$queryRaw`SELECT current_database(), current_schema()`
    console.log(`\n📍 Current database: ${dbInfo[0].current_database}`)
    console.log(`📍 Current schema: ${dbInfo[0].current_schema}`)
  } catch (error) {
    console.error("❌ Database inspection error:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

inspectDatabase().catch(console.error)
