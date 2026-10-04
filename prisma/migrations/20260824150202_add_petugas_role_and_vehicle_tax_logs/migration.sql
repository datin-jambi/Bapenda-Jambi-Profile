-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'Petugas';

-- CreateTable
CREATE TABLE "vehicle_tax_check_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vehicleType" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lokasi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_tax_check_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicle_tax_check_logs" ADD CONSTRAINT "vehicle_tax_check_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
