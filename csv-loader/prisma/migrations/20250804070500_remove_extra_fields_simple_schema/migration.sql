/*
  Warnings:

  - You are about to drop the column `age` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `annual_income` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `credit_card_balance` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `gender_code` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `indiv_id` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `language_code` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `marital_status_code` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_debt_payment` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `name_prefix` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `name_suffix` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `occupation` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `occupation_category` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `savings_balance` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Customer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Customer_indiv_id_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "age",
DROP COLUMN "annual_income",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "credit_card_balance",
DROP COLUMN "gender_code",
DROP COLUMN "indiv_id",
DROP COLUMN "language_code",
DROP COLUMN "marital_status_code",
DROP COLUMN "middle_name",
DROP COLUMN "monthly_debt_payment",
DROP COLUMN "name_prefix",
DROP COLUMN "name_suffix",
DROP COLUMN "occupation",
DROP COLUMN "occupation_category",
DROP COLUMN "savings_balance",
DROP COLUMN "state",
DROP COLUMN "zip";
