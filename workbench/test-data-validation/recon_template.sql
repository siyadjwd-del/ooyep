/* ================================================================================
   recon_template.sql
   Source vs. Rimes-loaded reconciliation  (T-SQL / SQL Server)
   --------------------------------------------------------------------------------
   Compares a source table against its Rimes-loaded counterpart for one as-of
   date, at two levels:

     1. Summary  : record count, SUM(market value), distinct accounts,
                   distinct securities — side by side with variance.
     2. Position : FULL OUTER JOIN on account + security + as-of date, flagging
                   MISSING_IN_TARGET, MISSING_IN_SOURCE, or VALUE_MISMATCH where
                   ABS(source MV - target MV) > @Tolerance.

   Output — three result sets, in order:
     RS1  PASS/FAIL line: result, mismatch counts by type, total abs $ impact
     RS2  Summary metrics side by side with variance
     RS3  Position-level mismatch report, ordered by absolute dollar impact

   Usage: edit the PARAMETERS block, run the whole script in SSMS / ADS.

   Notes
   - Table names may be 2- or 3-part (db.schema.table), bracketed or not.
   - Column-name defaults match the CLAUDE.md assumptions; source and target
     columns are declared separately in case the two tables differ.
   - Both sides are aggregated to account + security + date grain (SUM of MV),
     so a lot-level source still recons cleanly against a position-level target.
   - RS2 reports both raw row counts and post-aggregation position counts.
   ================================================================================ */
SET NOCOUNT ON;

--------------------------------------------------------------------------------
-- PARAMETERS — edit these
--------------------------------------------------------------------------------
DECLARE @AsOfDate    date          = '2026-06-30';
DECLARE @SourceTable nvarchar(400) = N'dmx.dbo.Holdings';    -- source of truth
DECLARE @TargetTable nvarchar(400) = N'rptx.dbo.Holdings';   -- Rimes-loaded
DECLARE @Tolerance   decimal(19,4) = 0.01;                   -- per-position $ tolerance

-- Column names in the SOURCE table
DECLARE @SrcAccountCol  sysname = N'AccountCode';
DECLARE @SrcSecurityCol sysname = N'SecurityId';
DECLARE @SrcDateCol     sysname = N'AsAtDate';
DECLARE @SrcMvCol       sysname = N'MarketValue';

-- Column names in the TARGET table
DECLARE @TgtAccountCol  sysname = N'AccountCode';
DECLARE @TgtSecurityCol sysname = N'SecurityId';
DECLARE @TgtDateCol     sysname = N'AsAtDate';
DECLARE @TgtMvCol       sysname = N'MarketValue';

--------------------------------------------------------------------------------
-- Resolve and validate table names (handles brackets, 2- or 3-part names)
--------------------------------------------------------------------------------
IF PARSENAME(@SourceTable, 1) IS NULL OR PARSENAME(@TargetTable, 1) IS NULL
BEGIN
    RAISERROR('Could not parse @SourceTable or @TargetTable — use db.schema.table or schema.table.', 16, 1);
    RETURN;
END;
IF PARSENAME(@SourceTable, 4) IS NOT NULL OR PARSENAME(@TargetTable, 4) IS NOT NULL
BEGIN
    RAISERROR('Four-part (linked server) names are not supported.', 16, 1);
    RETURN;
END;

DECLARE @SrcQ nvarchar(400) =
      CASE WHEN PARSENAME(@SourceTable, 3) IS NULL THEN N''
           ELSE QUOTENAME(PARSENAME(@SourceTable, 3)) + N'.' END
    + QUOTENAME(COALESCE(PARSENAME(@SourceTable, 2), N'dbo')) + N'.'
    + QUOTENAME(PARSENAME(@SourceTable, 1));

DECLARE @TgtQ nvarchar(400) =
      CASE WHEN PARSENAME(@TargetTable, 3) IS NULL THEN N''
           ELSE QUOTENAME(PARSENAME(@TargetTable, 3)) + N'.' END
    + QUOTENAME(COALESCE(PARSENAME(@TargetTable, 2), N'dbo')) + N'.'
    + QUOTENAME(PARSENAME(@TargetTable, 1));

IF OBJECT_ID(@SrcQ) IS NULL
BEGIN
    RAISERROR('Source table not found: %s', 16, 1, @SrcQ);
    RETURN;
END;
IF OBJECT_ID(@TgtQ) IS NULL
BEGIN
    RAISERROR('Target table not found: %s', 16, 1, @TgtQ);
    RETURN;
END;

--------------------------------------------------------------------------------
-- Stage both sides at account + security + date grain
--------------------------------------------------------------------------------
IF OBJECT_ID('tempdb..#src')   IS NOT NULL DROP TABLE #src;
IF OBJECT_ID('tempdb..#tgt')   IS NOT NULL DROP TABLE #tgt;
IF OBJECT_ID('tempdb..#recon') IS NOT NULL DROP TABLE #recon;

CREATE TABLE #src (
    AccountKey  nvarchar(100)  NULL,
    SecurityKey nvarchar(100)  NULL,
    AsOfDate    date           NULL,
    MarketValue decimal(19, 4) NULL,
    IsPresent   bit            NOT NULL
);
CREATE TABLE #tgt (
    AccountKey  nvarchar(100)  NULL,
    SecurityKey nvarchar(100)  NULL,
    AsOfDate    date           NULL,
    MarketValue decimal(19, 4) NULL,
    IsPresent   bit            NOT NULL
);

DECLARE @sql         nvarchar(max);
DECLARE @SrcRawCount int, @TgtRawCount int;

-- Raw row counts for the as-of date (pre-aggregation)
SET @sql = N'SELECT @cnt = COUNT(*) FROM ' + @SrcQ
         + N' WHERE ' + QUOTENAME(@SrcDateCol) + N' = @AsOfDate;';
EXEC sp_executesql @sql, N'@AsOfDate date, @cnt int OUTPUT',
     @AsOfDate = @AsOfDate, @cnt = @SrcRawCount OUTPUT;

SET @sql = N'SELECT @cnt = COUNT(*) FROM ' + @TgtQ
         + N' WHERE ' + QUOTENAME(@TgtDateCol) + N' = @AsOfDate;';
EXEC sp_executesql @sql, N'@AsOfDate date, @cnt int OUTPUT',
     @AsOfDate = @AsOfDate, @cnt = @TgtRawCount OUTPUT;

-- Source, aggregated to reconciliation grain
SET @sql = N'
INSERT #src (AccountKey, SecurityKey, AsOfDate, MarketValue, IsPresent)
SELECT CAST(' + QUOTENAME(@SrcAccountCol)  + N' AS nvarchar(100)),
       CAST(' + QUOTENAME(@SrcSecurityCol) + N' AS nvarchar(100)),
       '      + QUOTENAME(@SrcDateCol)     + N',
       SUM(CAST(' + QUOTENAME(@SrcMvCol)   + N' AS decimal(19, 4))),
       1
FROM ' + @SrcQ + N'
WHERE ' + QUOTENAME(@SrcDateCol) + N' = @AsOfDate
GROUP BY ' + QUOTENAME(@SrcAccountCol) + N', '
           + QUOTENAME(@SrcSecurityCol) + N', '
           + QUOTENAME(@SrcDateCol) + N';';
EXEC sp_executesql @sql, N'@AsOfDate date', @AsOfDate = @AsOfDate;

-- Target, aggregated to reconciliation grain
SET @sql = N'
INSERT #tgt (AccountKey, SecurityKey, AsOfDate, MarketValue, IsPresent)
SELECT CAST(' + QUOTENAME(@TgtAccountCol)  + N' AS nvarchar(100)),
       CAST(' + QUOTENAME(@TgtSecurityCol) + N' AS nvarchar(100)),
       '      + QUOTENAME(@TgtDateCol)     + N',
       SUM(CAST(' + QUOTENAME(@TgtMvCol)   + N' AS decimal(19, 4))),
       1
FROM ' + @TgtQ + N'
WHERE ' + QUOTENAME(@TgtDateCol) + N' = @AsOfDate
GROUP BY ' + QUOTENAME(@TgtAccountCol) + N', '
           + QUOTENAME(@TgtSecurityCol) + N', '
           + QUOTENAME(@TgtDateCol) + N';';
EXEC sp_executesql @sql, N'@AsOfDate date', @AsOfDate = @AsOfDate;

--------------------------------------------------------------------------------
-- Position-level reconciliation: FULL OUTER JOIN on account + security + date
--------------------------------------------------------------------------------
SELECT
    COALESCE(s.AccountKey , t.AccountKey ) AS AccountKey,
    COALESCE(s.SecurityKey, t.SecurityKey) AS SecurityKey,
    COALESCE(s.AsOfDate   , t.AsOfDate   ) AS AsOfDate,
    s.MarketValue                          AS SourceMV,
    t.MarketValue                          AS TargetMV,
    COALESCE(s.MarketValue, 0) - COALESCE(t.MarketValue, 0) AS MVVariance,
    CASE
        WHEN t.IsPresent IS NULL THEN 'MISSING_IN_TARGET'
        WHEN s.IsPresent IS NULL THEN 'MISSING_IN_SOURCE'
        WHEN ABS(COALESCE(s.MarketValue, 0) - COALESCE(t.MarketValue, 0)) > @Tolerance
             THEN 'VALUE_MISMATCH'
        ELSE 'MATCH'
    END AS ReconStatus
INTO #recon
FROM #src s
FULL OUTER JOIN #tgt t
       ON  t.AccountKey  = s.AccountKey
       AND t.SecurityKey = s.SecurityKey
       AND t.AsOfDate    = s.AsOfDate;

--------------------------------------------------------------------------------
-- RS1: PASS/FAIL summary line
--------------------------------------------------------------------------------
SELECT
    CASE WHEN COUNT(CASE WHEN ReconStatus <> 'MATCH' THEN 1 END) = 0
         THEN 'PASS' ELSE 'FAIL' END                                AS Result,
    @AsOfDate                                                       AS AsOfDate,
    @SourceTable                                                    AS SourceTable,
    @TargetTable                                                    AS TargetTable,
    @Tolerance                                                      AS Tolerance,
    COUNT(CASE WHEN ReconStatus = 'MISSING_IN_TARGET' THEN 1 END)   AS MissingInTarget,
    COUNT(CASE WHEN ReconStatus = 'MISSING_IN_SOURCE' THEN 1 END)   AS MissingInSource,
    COUNT(CASE WHEN ReconStatus = 'VALUE_MISMATCH'    THEN 1 END)   AS ValueMismatch,
    COUNT(CASE WHEN ReconStatus = 'MATCH'             THEN 1 END)   AS Matched,
    COALESCE(SUM(CASE WHEN ReconStatus <> 'MATCH'
                      THEN ABS(MVVariance) END), 0)                 AS TotalAbsDollarImpact
FROM #recon;

--------------------------------------------------------------------------------
-- RS2: summary metrics side by side with variance
--------------------------------------------------------------------------------
WITH s AS (
    SELECT COUNT(*)                       AS PositionCount,
           COALESCE(SUM(MarketValue), 0)  AS TotalMV,
           COUNT(DISTINCT AccountKey)     AS DistinctAccounts,
           COUNT(DISTINCT SecurityKey)    AS DistinctSecurities
    FROM #src
), t AS (
    SELECT COUNT(*)                       AS PositionCount,
           COALESCE(SUM(MarketValue), 0)  AS TotalMV,
           COUNT(DISTINCT AccountKey)     AS DistinctAccounts,
           COUNT(DISTINCT SecurityKey)    AS DistinctSecurities
    FROM #tgt
)
SELECT
    m.Metric,
    m.SourceValue,
    m.TargetValue,
    m.SourceValue - m.TargetValue AS Variance,
    CASE
        WHEN m.Metric = 'Total market value'
             THEN CASE WHEN ABS(m.SourceValue - m.TargetValue) <= @Tolerance
                       THEN 'OK' ELSE 'CHECK' END
        ELSE CASE WHEN m.SourceValue = m.TargetValue THEN 'OK' ELSE 'CHECK' END
    END AS Status
FROM s
CROSS JOIN t
CROSS APPLY (VALUES
    ('Record count (raw rows)',        CAST(@SrcRawCount         AS decimal(19, 4)), CAST(@TgtRawCount         AS decimal(19, 4))),
    ('Positions (acct+sec grain)',     CAST(s.PositionCount      AS decimal(19, 4)), CAST(t.PositionCount      AS decimal(19, 4))),
    ('Total market value',             s.TotalMV,                                    t.TotalMV),
    ('Distinct accounts',              CAST(s.DistinctAccounts   AS decimal(19, 4)), CAST(t.DistinctAccounts   AS decimal(19, 4))),
    ('Distinct securities',            CAST(s.DistinctSecurities AS decimal(19, 4)), CAST(t.DistinctSecurities AS decimal(19, 4)))
) m (Metric, SourceValue, TargetValue);

--------------------------------------------------------------------------------
-- RS3: position-level mismatch report, ordered by absolute dollar impact
--------------------------------------------------------------------------------
SELECT
    ReconStatus,
    AccountKey,
    SecurityKey,
    AsOfDate,
    SourceMV,
    TargetMV,
    MVVariance,
    ABS(MVVariance) AS AbsDollarImpact
FROM #recon
WHERE ReconStatus <> 'MATCH'
ORDER BY ABS(MVVariance) DESC, AccountKey, SecurityKey;

-- Echo the verdict to the Messages tab as well
DECLARE @failCount int  = (SELECT COUNT(*) FROM #recon WHERE ReconStatus <> 'MATCH');
DECLARE @msg nvarchar(200) =
    CASE WHEN @failCount = 0
         THEN N'RECON PASS — source and target agree at ' + CONVERT(nvarchar(10), @AsOfDate, 120)
         ELSE N'RECON FAIL — ' + CAST(@failCount AS nvarchar(20)) + N' mismatched positions at '
              + CONVERT(nvarchar(10), @AsOfDate, 120) END;
PRINT @msg;
