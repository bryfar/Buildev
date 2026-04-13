-- AlterTable: allow OAuth-only users without local password
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
