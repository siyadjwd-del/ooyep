# workbench

Personal SQL Server / Power BI tools supporting the Rimes EDM implementation.
Lives at `C:\Dev\workbench`. Deployable code does **not** live here — stored
procedures, tables, and notebooks that reach a server belong in `C:\Dev\rimes`
(the RIMES Azure DevOps repo).

## Structure

| Folder | Contents |
|--------|----------|
| `queries/dmx` `queries/imx` `queries/rptx` | Ad-hoc and saved queries, one folder per database |
| `test-data-validation/` | Reconciliation and data-quality scripts (`recon_template.sql`) |
| `powerbi-datasets/` | Dataset documentation, DAX measures, M queries, `.pbit` templates |
| `rimes-uat/` | UAT checklists and cycle results (`uat_checklist.md`) |
| `docs/` | Notes, setup instructions, schema discoveries |

## Data safety

Nothing with real client or holdings data is ever committed. `.gitignore` blocks
`*.csv`, `*.xlsx`, `*.pbix`, connection strings, and credentials — don't weaken it.
Keep extracts outside the repo entirely.

See `CLAUDE.md` (one level up, at `C:\Dev`) for conventions and the RIMES workflow.
