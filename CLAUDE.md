# CLAUDE.md — Rimes EDM Workspace

This file governs all work under `C:\Dev` (both `C:\Dev\rimes` and `C:\Dev\workbench`).
In the GitHub copy of this workspace, the repo root maps to `C:\Dev`.

## Context

Sole SQL Server / Power BI developer at an investment firm, supporting a Rimes EDM
implementation. Three SQL Server databases hold financial data (accounts, holdings,
market values, performance):

| Database | Role (ASSUMED — confirm) |
|----------|--------------------------|
| `dmx`    | Data management / source-side data |
| `imx`    | Investment data (source-side) |
| `rptx`   | Reporting — Rimes-loaded data consumed by Power BI |

## Non-negotiable rules

1. **All SQL is T-SQL for SQL Server.** No other dialects. Prefer `CREATE OR ALTER`
   for procs, `sysname` for object-name variables, `QUOTENAME()` + `sp_executesql`
   for any dynamic SQL.
2. **Data safety: nothing with real client or holdings data is ever committed — in
   either repo.** No data extracts (`*.csv`, `*.xlsx`), no connection strings, no
   credentials, no `.pbix` files (they embed imported data — commit `.pbit` templates
   instead). The `.gitignore` files enforce this; do not weaken them.
3. **Code placement:**
   - Deployable code (stored procedures, tables, notebooks — anything that ends up
     on a server) goes in `C:\Dev\rimes`, inside RIMES's existing folder structure.
     Never restructure that repo; RIMES owns its layout.
   - Personal / testing / analysis tools go in `C:\Dev\workbench`.
   - Rule of thumb: the workbench holds how you *call* things; the rimes repo holds
     what things *are*. Never duplicate a proc definition into the workbench.

## RIMES repo workflow (`C:\Dev\rimes`)

- Feature branches are cut from `vNext`, named `feature/YYYY-MM-short-description`
  (e.g. `feature/2026-07-holdings-recon-proc`).
- **Never commit to `vNext` directly.**
- Every deployment = commit + push + pull request into `vNext` + **RSD ticket text**
  generated from the diff. RSD ticket text format:
  - Bullet list of changed objects with a one-line description of each change.
  - Any ad-hoc manual scripts (one-off data fixes, permissions, jobs) explicitly
    flagged as `MANUAL STEP:`.
  - A blank line labelled `Deploy date/time:` left for the deployer to fill in.

### "Ship it"

When the user says **"ship it"**, execute the full workflow on the current changes:

1. Confirm which files changed (`git status` / `git diff` in `C:\Dev\rimes`).
2. Cut `feature/YYYY-MM-short-description` from up-to-date `vNext` (if not already on one).
3. Commit with a descriptive message; push with `-u`.
4. Create a pull request into `vNext` (via `az repos pr create`).
5. Generate the RSD ticket text from the diff (format above) and present it to the user.

## Schema reference (ASSUMED defaults — confirm and correct)

The interview on table names/grain was answered with "use defaults", so everything
below is an assumption. **Correct this section as real names are learned.**

| Concept | Assumed column | Notes |
|---------|----------------|-------|
| Account identifier  | `AccountCode`  | business code, `varchar(20)` |
| Security identifier | `SecurityId`   | could be CUSIP/ISIN/internal id |
| As-of date          | `AsAtDate`     | `date` — Rimes-style "AsAt" naming, seen in `charm_v2` |
| Market value        | `MarketValue`  | `decimal(19,4)` assumed |

Assumed table grains (names unknown):

- Holdings/positions: one row per account + security + as-of date.
- Account master: one row per account.
- Account-level market values: one row per account + as-of date.
- Performance: one row per account + period.

**Known real objects** (learned from actual usage):

- `rptx.charm_v2` — stored procedure. Params: `@AsAtDate` (required),
  `@AccountCode` (optional — omit to run all accounts). Runner saved at
  `workbench/queries/rptx/exec_charm_v2.sql`.
  ⚠ Ambiguity: two-part name means `rptx` is a *schema* here. If `rptx` is only a
  database, the true name is likely `rptx.dbo.charm_v2` — confirm.

### Source → Rimes mapping (ASSUMED)

Working assumption: `dmx`/`imx` hold source-side data, Rimes loads validated data
into `rptx` for reporting and Power BI. Staging schemas, load-batch/audit columns
unknown. Reconciliations compare a source table against its Rimes-loaded
counterpart with `workbench/test-data-validation/recon_template.sql`.

## Naming conventions (proposed defaults)

- **Query files** live in `workbench/queries/<database>/`, snake_case:
  `<purpose>_<detail>.sql` (e.g. `holdings_by_account.sql`).
- **Proc runners**: `exec_<proc_name>.sql` (e.g. `exec_charm_v2.sql`). Variables
  declared at the top; alternate invocations kept as commented lines.
- **Stored procedures** (deployable, in the rimes repo): `usp_<Domain><Action>`
  PascalCase (e.g. `usp_HoldingsRecon`) — unless RIMES's repo shows an existing
  convention, in which case match it.
- **Recon/validation scripts**: `recon_<subject>.sql` in `test-data-validation/`.
- Every saved script starts with a header comment: purpose, params, expected output.

## Open questions (answer these to upgrade the defaults)

1. Real table names + grain for holdings, account master, market values, performance,
   benchmarks, security master.
2. Real identifier columns per database, and whether dmx/imx/rptx differ.
3. Whether `rptx` in `rptx.charm_v2` is a schema or the database.
4. Actual source → Rimes flow: which DB/schemas Rimes loads, staging areas,
   load-batch/audit columns.
5. RIMES Azure DevOps org, project, and clone URL (needed by `setup-dev.ps1`).
