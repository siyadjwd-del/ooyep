# Rimes EDM — UAT Checklist

Reusable per UAT cycle. Copy this file to `rimes-uat/cycles/YYYY-MM-DD_<scope>.md`,
fill in the header, and work through each in-scope domain. Every checked item needs
evidence (script name + result, or screenshot reference) in the Evidence column.

| Field | Value |
|-------|-------|
| UAT cycle / release | |
| As-of date(s) tested | |
| Environment | |
| Rimes load/batch ID | |
| Tester | |
| Date executed | |

**Standard tooling:** `test-data-validation/recon_template.sql` covers load
completeness and value accuracy (summary + position level). Referential-integrity
and staleness snippets are at the bottom of this file.

Check categories, applied to every domain:

1. **Load completeness** — everything that should have loaded, loaded; nothing extra.
2. **Value accuracy** — the numbers match source within tolerance.
3. **Referential integrity** — every foreign reference resolves; no orphans.
4. **Stale data check** — the data is for the expected as-of date; nothing old is masquerading as current.

---

## Domain: Accounts

| # | Check | Category | Status | Evidence |
|---|-------|----------|--------|----------|
| A1 | Source vs Rimes-loaded account count matches (recon summary) | Completeness | ☐ | |
| A2 | No expected accounts missing (no MISSING_IN_TARGET) | Completeness | ☐ | |
| A3 | No unexpected accounts appeared (no MISSING_IN_SOURCE) | Completeness | ☐ | |
| A4 | Account attributes spot-checked vs source for a sample of ≥10 accounts (name, type, status, inception) | Accuracy | ☐ | |
| A5 | Closed/terminated accounts carry correct status, not silently dropped | Accuracy | ☐ | |
| A6 | Every account referenced by holdings/market values exists in the account master | Integrity | ☐ | |
| A7 | Account master as-of/load date = expected business date | Staleness | ☐ | |

## Domain: Holdings

| # | Check | Category | Status | Evidence |
|---|-------|----------|--------|----------|
| H1 | recon_template.sql summary PASS: record count, total MV, distinct accounts, distinct securities | Completeness | ☐ | |
| H2 | Position-level recon: zero MISSING_IN_TARGET | Completeness | ☐ | |
| H3 | Position-level recon: zero MISSING_IN_SOURCE | Completeness | ☐ | |
| H4 | Position-level recon: zero VALUE_MISMATCH beyond tolerance | Accuracy | ☐ | |
| H5 | Quantity and price spot-checked for top 10 positions by MV | Accuracy | ☐ | |
| H6 | Every holding's account exists in account master | Integrity | ☐ | |
| H7 | Every holding's security exists in security master | Integrity | ☐ | |
| H8 | MAX(as-of date) = expected business date for every account (no accounts stuck on a prior date) | Staleness | ☐ | |
| H9 | No duplicate rows at account + security + as-of date grain | Integrity | ☐ | |

## Domain: Market Values

| # | Check | Category | Status | Evidence |
|---|-------|----------|--------|----------|
| M1 | Account-level MV present for every active account at as-of date | Completeness | ☐ | |
| M2 | Account MV = SUM(position MV) within tolerance, per account | Accuracy | ☐ | |
| M3 | Total firm MV vs source within tolerance (recon summary) | Accuracy | ☐ | |
| M4 | Day-over-day MV movement reviewed; moves > ±10% per account explained | Accuracy | ☐ | |
| M5 | Every MV row's account exists in account master | Integrity | ☐ | |
| M6 | MAX(as-of date) = expected business date; no account showing a stale MV | Staleness | ☐ | |

## Domain: Benchmarks

| # | Check | Category | Status | Evidence |
|---|-------|----------|--------|----------|
| B1 | All expected benchmark series loaded for the period | Completeness | ☐ | |
| B2 | Benchmark returns match vendor/source values for a sample of ≥5 series | Accuracy | ☐ | |
| B3 | Every account-to-benchmark assignment resolves to a loaded benchmark series | Integrity | ☐ | |
| B4 | No benchmark series has a gap in its date series over the period | Completeness | ☐ | |
| B5 | Latest benchmark date = expected business date (vendor lag accounted for) | Staleness | ☐ | |

---

## Sign-off

| Domain | Result (PASS / FAIL / N/A) | Open defects | Signed | Date |
|--------|---------------------------|--------------|--------|------|
| Accounts | | | | |
| Holdings | | | | |
| Market values | | | | |
| Benchmarks | | | | |

---

## Query snippets

Replace table/column names per CLAUDE.md schema reference (defaults shown).

**Orphan check — holdings without an account (H6, A6 pattern):**

```sql
SELECT h.AccountCode, COUNT(*) AS OrphanRows
FROM rptx.dbo.Holdings h
LEFT JOIN rptx.dbo.Accounts a ON a.AccountCode = h.AccountCode
WHERE h.AsAtDate = @AsOfDate
  AND a.AccountCode IS NULL
GROUP BY h.AccountCode;
```

**Duplicate grain check (H9):**

```sql
SELECT AccountCode, SecurityId, AsAtDate, COUNT(*) AS Dupes
FROM rptx.dbo.Holdings
WHERE AsAtDate = @AsOfDate
GROUP BY AccountCode, SecurityId, AsAtDate
HAVING COUNT(*) > 1;
```

**Stale data check — accounts not on the expected date (H8, M6 pattern):**

```sql
SELECT AccountCode, MAX(AsAtDate) AS LatestDate
FROM rptx.dbo.Holdings
GROUP BY AccountCode
HAVING MAX(AsAtDate) < @AsOfDate
ORDER BY LatestDate;
```

**Account MV vs sum of positions (M2):**

```sql
SELECT COALESCE(p.AccountCode, m.AccountCode) AS AccountCode,
       p.PositionMV, m.AccountMV,
       COALESCE(p.PositionMV, 0) - COALESCE(m.AccountMV, 0) AS Variance
FROM (SELECT AccountCode, SUM(MarketValue) AS PositionMV
      FROM rptx.dbo.Holdings WHERE AsAtDate = @AsOfDate
      GROUP BY AccountCode) p
FULL OUTER JOIN
     (SELECT AccountCode, MarketValue AS AccountMV
      FROM rptx.dbo.MarketValues WHERE AsAtDate = @AsOfDate) m
  ON m.AccountCode = p.AccountCode
WHERE ABS(COALESCE(p.PositionMV, 0) - COALESCE(m.AccountMV, 0)) > @Tolerance
ORDER BY ABS(COALESCE(p.PositionMV, 0) - COALESCE(m.AccountMV, 0)) DESC;
```

**Benchmark date-gap check (B4):**

```sql
SELECT BenchmarkCode, AsAtDate,
       LEAD(AsAtDate) OVER (PARTITION BY BenchmarkCode ORDER BY AsAtDate) AS NextDate,
       DATEDIFF(DAY, AsAtDate,
                LEAD(AsAtDate) OVER (PARTITION BY BenchmarkCode ORDER BY AsAtDate)) AS GapDays
FROM rptx.dbo.BenchmarkReturns
WHERE AsAtDate BETWEEN @PeriodStart AND @PeriodEnd
ORDER BY BenchmarkCode, AsAtDate;
-- review rows where GapDays > expected calendar gap (weekends/holidays)
```
