# queries

One folder per database (`dmx/`, `imx/`, `rptx/`). All SQL is T-SQL.

## Naming

- Saved queries: snake_case, `<purpose>_<detail>.sql` — e.g. `holdings_by_account.sql`
- Proc runners: `exec_<proc_name>.sql` — variables declared at the top, alternate
  invocations kept as commented lines (see `rptx/exec_charm_v2.sql`)

## Header block

Start every saved script with:

```sql
/* ------------------------------------------------------------
   <file name>
   Purpose : <one line>
   Inputs  : <variables to edit before running>
   Output  : <result sets / side effects>
   ------------------------------------------------------------ */
```

Stored procedure *definitions* don't belong here — deployable code goes in the
RIMES repo (`C:\Dev\rimes`), per CLAUDE.md.
