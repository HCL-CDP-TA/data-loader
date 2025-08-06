/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Customer";

-- CreateTable
CREATE TABLE "customers" (
    "primary_account_number" TEXT NOT NULL,
    "indiv_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "cell_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "age" INTEGER,
    "gender_code" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "annual_income" INTEGER,
    "savings_balance" INTEGER,
    "credit_card_balance" INTEGER,
    "monthly_debt_payment" INTEGER,
    "occupation" TEXT,
    "occupation_category" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("primary_account_number")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_indiv_id_key" ON "customers"("indiv_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
