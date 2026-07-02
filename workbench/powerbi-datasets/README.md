# powerbi-datasets

Documentation and source-controlled pieces of the Power BI layer:

- Dataset documentation: source tables, relationships, refresh schedule (`.md`)
- DAX measure definitions (`.dax` or `.md`)
- Power Query / M source (`.pq` / `.m` — plain text)
- `.pbit` templates (structure without data) — OK to commit

**Never commit `.pbix` files** — they embed imported data, which can include real
client/holdings data. `.gitignore` blocks them. To share a report definition,
save as `.pbit` (File → Export → Power BI template) and commit that instead.
