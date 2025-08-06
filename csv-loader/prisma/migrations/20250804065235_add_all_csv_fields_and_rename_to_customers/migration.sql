/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Customer";

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indiv_id" INTEGER,
    "age" INTEGER,
    "gender_code" TEXT,
    "language_code" TEXT,
    "marital_status_code" TEXT,
    "name_prefix" TEXT,
    "middle_name" TEXT,
    "name_suffix" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "annual_income" INTEGER,
    "savings_balance" INTEGER,
    "credit_card_balance" INTEGER,
    "monthly_debt_payment" INTEGER,
    "occupation" TEXT,
    "primary_account_number" TEXT,
    "occupation_category" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_indiv_id_key" ON "customers"("indiv_id");
