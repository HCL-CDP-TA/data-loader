# CSV to Database Loader

This Node.js application loads customer data from a CSV file into a PostgreSQL database using Prisma ORM.

## Features

- Batch processing for efficient data loading
- Uses original CSV Indiv_ID values as primary keys
- Handles duplicate records gracefully
- Comprehensive error handling and logging
- Graceful shutdown handling

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` with your PostgreSQL connection string

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
   ```

3. **Setup database:**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate
   ```

## Usage

### Load CSV Data

```bash
npm start
```

### Development Mode (with auto-restart)

```bash
npm run dev
```

## Database Schema

The application creates a `customers` table with the following structure:

- `id` - Primary key using original CSV `Indiv_ID` values (BigInt)
- `indiv_id` - Unique field preserving the original CSV `Indiv_ID`
- `email` - Customer email (unique)
- `password` - Default empty string (not in CSV)
- `first_name` - Customer first name
- `last_name` - Customer last name
- `phone` - Customer phone number (optional)
- `created_at` - Timestamp when record was created
- Additional fields from CSV: `age`, `gender`, `city`, `state`, `zip`, `country`, `annual_income`, `occupation`

## Data Mapping

The loader maps CSV columns to database fields as follows:

| CSV Column   | Database Field | Notes                          |
| ------------ | -------------- | ------------------------------ |
| Indiv_ID     | indiv_id       | Preserved as unique identifier |
| Email        | email          | Fallback generated if missing  |
| First_Name   | first_name     | Default "Unknown" if missing   |
| Last_Name    | last_name      | Default "Unknown" if missing   |
| Cell_Number  | phone          | Optional field                 |
| Age          | age            | Converted to integer           |
| Gender_Code  | gender         | Optional                       |
| City         | city           | Optional                       |
| State        | state          | Optional                       |
| Zip          | zip            | Optional                       |
| Country      | country        | Optional                       |
| AnnualIncome | annual_income  | Converted to integer           |
| Occupation   | occupation     | Optional                       |

## Error Handling

- Invalid records are logged but don't stop the process
- Duplicate records are skipped automatically
- Connection issues are reported clearly
- Batch failures fall back to individual inserts

## Performance

- Processes data in batches of 100 records
- Uses Prisma's `createMany` for efficient bulk inserts
- Provides progress updates during processing

## Prisma Commands

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create and apply new migration
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:deploy

# Reset database (caution: deletes all data)
npm run prisma:reset
```
