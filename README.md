# Demo Data Project

This project contains tools and data for customer data processing and database loading.

## Structure

- `csv-loader/` - Node.js application for loading CSV data into PostgreSQL database
- `data/` - Contains the CSV data files to be processed

## Quick Start

1. Navigate to the csv-loader directory:
   ```bash
   cd csv-loader
   ```

2. Follow the setup instructions in `csv-loader/README.md`

## Components

### CSV Loader
A Node.js application that:
- Loads customer data from CSV files into a PostgreSQL database
- Uses Prisma ORM for database operations
- Handles batch processing for efficient data loading
- Clears existing data before import to ensure clean loads

### Data
Contains the source CSV files with customer profile data.

For detailed instructions, see the README in the csv-loader directory.
