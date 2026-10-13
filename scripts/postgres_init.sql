-- Production PostgreSQL Schema Initialization Script
-- Hemophilia Factor Management System
-- Generated for PostgreSQL 14+ / 15+ / 16+

-- 1. Offices Table
CREATE TABLE IF NOT EXISTS "Office" (
    "id" VARCHAR(64) PRIMARY KEY,
    "nameNepali" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "isCentral" BOOLEAN NOT NULL DEFAULT FALSE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" VARCHAR(64) PRIMARY KEY,
    "username" VARCHAR(100) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL, -- 'SUPER_ADMIN' | 'OFFICE_USER'
    "officeId" VARCHAR(64) REFERENCES "Office"("id") ON DELETE SET NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Companies Table
CREATE TABLE IF NOT EXISTS "Company" (
    "id" VARCHAR(64) PRIMARY KEY,
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS "Product" (
    "id" VARCHAR(64) PRIMARY KEY,
    "companyId" VARCHAR(64) NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "factorType" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_Product_Company_Name_Factor" UNIQUE ("companyId", "name", "factorType")
);

-- 5. Product Capacities
CREATE TABLE IF NOT EXISTS "ProductCapacity" (
    "id" VARCHAR(64) PRIMARY KEY,
    "capacityIu" INTEGER UNIQUE NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- 6. Central Stock Batches
CREATE TABLE IF NOT EXISTS "CentralStockBatch" (
    "id" VARCHAR(64) PRIMARY KEY,
    "companyId" VARCHAR(64) NOT NULL REFERENCES "Company"("id"),
    "productId" VARCHAR(64) NOT NULL REFERENCES "Product"("id"),
    "capacityIu" INTEGER NOT NULL,
    "batchNumber" VARCHAR(100) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "receivedVials" INTEGER NOT NULL DEFAULT 0,
    "transferredVials" INTEGER NOT NULL DEFAULT 0,
    "adjustedVials" INTEGER NOT NULL DEFAULT 0,
    "currentVials" INTEGER NOT NULL DEFAULT 0,
    "isQuarantined" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_CentralStockBatch" UNIQUE ("productId", "capacityIu", "batchNumber")
);

-- 7. Central Stock Entries
CREATE TABLE IF NOT EXISTS "CentralStockEntry" (
    "id" VARCHAR(64) PRIMARY KEY,
    "receiptDate" TIMESTAMP(3) NOT NULL,
    "companyId" VARCHAR(64) NOT NULL REFERENCES "Company"("id"),
    "productId" VARCHAR(64) NOT NULL REFERENCES "Product"("id"),
    "capacityIu" INTEGER NOT NULL,
    "vialCount" INTEGER NOT NULL,
    "totalIu" INTEGER NOT NULL,
    "batchNumber" VARCHAR(100) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdById" VARCHAR(64) NOT NULL REFERENCES "User"("id"),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Stock Transfers (Central to Office)
CREATE TABLE IF NOT EXISTS "StockTransfer" (
    "id" VARCHAR(64) PRIMARY KEY,
    "transferNumber" VARCHAR(100) UNIQUE NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "destinationOfficeId" VARCHAR(64) NOT NULL REFERENCES "Office"("id"),
    "sentById" VARCHAR(64) NOT NULL REFERENCES "User"("id"),
    "totalVials" INTEGER NOT NULL,
    "totalIu" INTEGER NOT NULL,
    "remarks" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "StockTransferItem" (
    "id" VARCHAR(64) PRIMARY KEY,
    "stockTransferId" VARCHAR(64) NOT NULL REFERENCES "StockTransfer"("id") ON DELETE CASCADE,
    "centralStockBatchId" VARCHAR(64) NOT NULL REFERENCES "CentralStockBatch"("id"),
    "companyName" VARCHAR(255) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "factorType" VARCHAR(100) NOT NULL,
    "capacityIu" INTEGER NOT NULL,
    "batchNumber" VARCHAR(100) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "vialCount" INTEGER NOT NULL,
    "totalIu" INTEGER NOT NULL
);

-- 9. Office Stock Batches
CREATE TABLE IF NOT EXISTS "OfficeStockBatch" (
    "id" VARCHAR(64) PRIMARY KEY,
    "officeId" VARCHAR(64) NOT NULL REFERENCES "Office"("id"),
    "companyId" VARCHAR(64) NOT NULL REFERENCES "Company"("id"),
    "productId" VARCHAR(64) NOT NULL REFERENCES "Product"("id"),
    "capacityIu" INTEGER NOT NULL,
    "batchNumber" VARCHAR(100) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "receivedVials" INTEGER NOT NULL DEFAULT 0,
    "distributedVials" INTEGER NOT NULL DEFAULT 0,
    "adjustedVials" INTEGER NOT NULL DEFAULT 0,
    "currentVials" INTEGER NOT NULL DEFAULT 0,
    "isQuarantined" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_OfficeStockBatch" UNIQUE ("officeId", "productId", "capacityIu", "batchNumber")
);

-- 10. Patients
CREATE TABLE IF NOT EXISTS "Patient" (
    "id" VARCHAR(64) PRIMARY KEY,
    "patientCode" VARCHAR(100) UNIQUE NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "isDobEstimated" BOOLEAN NOT NULL DEFAULT FALSE,
    "age" INTEGER NOT NULL,
    "gender" VARCHAR(50),
    "phone" VARCHAR(50) NOT NULL,
    "bloodGroup" VARCHAR(20) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "localLevel" VARCHAR(150) NOT NULL,
    "wardNo" INTEGER NOT NULL,
    "toleAddress" VARCHAR(255),
    "tempAddress" VARCHAR(255),
    "factorType" VARCHAR(100) NOT NULL,
    "otherFactorDetails" TEXT,
    "factorLevelPercent" DOUBLE PRECISION,
    "severity" VARCHAR(50) NOT NULL,
    "severityOverridden" BOOLEAN NOT NULL DEFAULT FALSE,
    "overrideReason" TEXT,
    "registeredOfficeId" VARCHAR(64) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Patient Distributions
CREATE TABLE IF NOT EXISTS "PatientDistribution" (
    "id" VARCHAR(64) PRIMARY KEY,
    "voucherNumber" VARCHAR(100) UNIQUE NOT NULL,
    "distributionDate" TIMESTAMP(3) NOT NULL,
    "patientId" VARCHAR(64) NOT NULL REFERENCES "Patient"("id"),
    "officeId" VARCHAR(64) NOT NULL REFERENCES "Office"("id"),
    "dispensedById" VARCHAR(64) NOT NULL REFERENCES "User"("id"),
    "prescribingClinician" VARCHAR(255),
    "purposes" TEXT NOT NULL, -- JSON array
    "purposeDetails" TEXT,
    "totalVials" INTEGER NOT NULL,
    "totalIu" INTEGER NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PatientDistributionItem" (
    "id" VARCHAR(64) PRIMARY KEY,
    "patientDistributionId" VARCHAR(64) NOT NULL REFERENCES "PatientDistribution"("id") ON DELETE CASCADE,
    "officeStockBatchId" VARCHAR(64) NOT NULL REFERENCES "OfficeStockBatch"("id"),
    "companyName" VARCHAR(255) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "factorType" VARCHAR(100) NOT NULL,
    "capacityIu" INTEGER NOT NULL,
    "batchNumber" VARCHAR(100) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "vialCount" INTEGER NOT NULL,
    "totalIu" INTEGER NOT NULL
);

-- 12. Distribution Purposes Master
CREATE TABLE IF NOT EXISTS "DistributionPurposeMaster" (
    "id" VARCHAR(64) PRIMARY KEY,
    "category" VARCHAR(50) NOT NULL,
    "nameNepali" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- 13. Audit Log
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" VARCHAR(64) PRIMARY KEY,
    "userId" VARCHAR(64),
    "userName" VARCHAR(255) NOT NULL,
    "officeId" VARCHAR(64),
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(100) NOT NULL,
    "details" TEXT NOT NULL,
    "reason" TEXT,
    "ipAddress" VARCHAR(100),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. System Settings
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "key" VARCHAR(100) PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS "IDX_Patient_Phone" ON "Patient"("phone");
CREATE INDEX IF NOT EXISTS "IDX_Patient_FullName" ON "Patient"("fullName");
CREATE INDEX IF NOT EXISTS "IDX_CentralStockBatch_Product" ON "CentralStockBatch"("productId");
CREATE INDEX IF NOT EXISTS "IDX_OfficeStockBatch_Office_Product" ON "OfficeStockBatch"("officeId", "productId");
CREATE INDEX IF NOT EXISTS "IDX_PatientDistribution_Patient" ON "PatientDistribution"("patientId");
CREATE INDEX IF NOT EXISTS "IDX_PatientDistribution_Office" ON "PatientDistribution"("officeId");
CREATE INDEX IF NOT EXISTS "IDX_AuditLog_Timestamp" ON "AuditLog"("timestamp" DESC);
