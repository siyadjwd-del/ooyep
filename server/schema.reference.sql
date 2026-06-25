-- ===========================================================================
-- REFERENCE SCHEMA for the Sit Invest client portal.
--
-- This is the shape the backend (server/index.js) queries against. You do NOT
-- have to create these exact tables — if your SSMS database already stores
-- this data under different names, just edit the column/table names in the
-- SQL statements in server/index.js to match yours.
--
-- Run this in SSMS only if you want a ready-made schema to start from.
-- ===========================================================================

CREATE TABLE dbo.Clients (
    ClientId       NVARCHAR(40)  NOT NULL PRIMARY KEY,
    FullName       NVARCHAR(120) NOT NULL,
    Email          NVARCHAR(160) NOT NULL UNIQUE,
    PasswordHash   NVARCHAR(255) NOT NULL,   -- bcrypt/argon2 hash, never plaintext
    AdvisorName    NVARCHAR(120) NULL,
    AdvisorEmail   NVARCHAR(160) NULL,
    AccountNumber  NVARCHAR(40)  NOT NULL,
    MemberSince    DATE          NOT NULL
);

CREATE TABLE dbo.PortfolioSummary (
    ClientId         NVARCHAR(40) NOT NULL PRIMARY KEY REFERENCES dbo.Clients(ClientId),
    TotalValue       DECIMAL(18,2) NOT NULL,
    CostBasis        DECIMAL(18,2) NOT NULL,
    YtdReturnPct     DECIMAL(6,2)  NOT NULL,
    EstAnnualIncome  DECIMAL(18,2) NOT NULL,
    AvgYieldPct      DECIMAL(6,2)  NOT NULL,
    AvgRating        NVARCHAR(8)   NOT NULL,
    CashBalance      DECIMAL(18,2) NOT NULL,
    AsOf             DATE          NOT NULL
);

CREATE TABLE dbo.PortfolioValueHistory (
    ClientId    NVARCHAR(40)  NOT NULL REFERENCES dbo.Clients(ClientId),
    AsOfDate    DATE          NOT NULL,
    MarketValue DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (ClientId, AsOfDate)
);

CREATE TABLE dbo.AllocationBySector (
    ClientId    NVARCHAR(40)  NOT NULL REFERENCES dbo.Clients(ClientId),
    SectorName  NVARCHAR(80)  NOT NULL,
    MarketValue DECIMAL(18,2) NOT NULL,
    ColorHex    NVARCHAR(9)   NOT NULL,   -- e.g. '#0b2545'
    PRIMARY KEY (ClientId, SectorName)
);

CREATE TABLE dbo.Holdings (
    HoldingId    NVARCHAR(40)  NOT NULL PRIMARY KEY,
    ClientId     NVARCHAR(40)  NOT NULL REFERENCES dbo.Clients(ClientId),
    Issuer       NVARCHAR(120) NOT NULL,
    BondType     NVARCHAR(40)  NOT NULL,  -- Treasury / Corporate / Municipal / Agency / MBS
    Cusip        NVARCHAR(20)  NULL,
    CouponPct    DECIMAL(6,3)  NOT NULL,
    YieldPct     DECIMAL(6,3)  NOT NULL,
    Rating       NVARCHAR(8)   NOT NULL,
    Maturity     DATE          NOT NULL,
    MaturityYear NVARCHAR(8)   NOT NULL,  -- e.g. '2029' or '2032+'
    FaceValue    DECIMAL(18,2) NOT NULL,
    MarketValue  DECIMAL(18,2) NOT NULL,
    GainPct      DECIMAL(6,2)  NOT NULL
);

CREATE TABLE dbo.CouponPayments (
    PaymentId NVARCHAR(40)  NOT NULL PRIMARY KEY,
    ClientId  NVARCHAR(40)  NOT NULL REFERENCES dbo.Clients(ClientId),
    Issuer    NVARCHAR(120) NOT NULL,
    PayDate   DATE          NOT NULL,
    Amount    DECIMAL(18,2) NOT NULL,
    Status    NVARCHAR(12)  NOT NULL   -- 'scheduled' | 'paid'
);

CREATE TABLE dbo.Documents (
    DocumentId NVARCHAR(40)  NOT NULL PRIMARY KEY,
    ClientId   NVARCHAR(40)  NOT NULL REFERENCES dbo.Clients(ClientId),
    Period     NVARCHAR(40)  NOT NULL,  -- 'May 2026'
    IssuedDate DATE          NOT NULL,
    DocType    NVARCHAR(40)  NOT NULL,  -- 'Monthly Statement' | 'Tax Document' | 'Trade Confirmation'
    SizeKb     INT           NOT NULL,
    StoragePath NVARCHAR(400) NULL      -- where the actual PDF lives (blob/disk)
);

CREATE TABLE dbo.Messages (
    MessageId NVARCHAR(40)   NOT NULL PRIMARY KEY,
    ClientId  NVARCHAR(40)   NOT NULL REFERENCES dbo.Clients(ClientId),
    Sender    NVARCHAR(12)   NOT NULL,  -- 'client' | 'advisor'
    Author    NVARCHAR(120)  NOT NULL,
    Body      NVARCHAR(MAX)  NOT NULL,
    SentAt    DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);
