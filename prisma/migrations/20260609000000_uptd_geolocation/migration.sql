-- AlterTable: add geolocation and wilayah fields to uptds
-- Safe migration: all new columns are nullable, existing data is preserved

ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "description"     TEXT;
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "province"        TEXT DEFAULT 'Jambi';
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "city"            TEXT;
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "district"        TEXT;
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "subDistrict"     TEXT;
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "postalCode"      TEXT;
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "latitude"        DOUBLE PRECISION;
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "longitude"       DOUBLE PRECISION;
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "googleMapsUrl"   TEXT;
ALTER TABLE "uptds" ADD COLUMN IF NOT EXISTS "showOnPublicMap" BOOLEAN NOT NULL DEFAULT false;
