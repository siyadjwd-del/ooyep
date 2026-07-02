# Workspace setup — C:\Dev

The GitHub repo's root maps to `C:\Dev` on your machine:

```
repo root            →  C:\Dev
├── CLAUDE.md        →  C:\Dev\CLAUDE.md        (governs both folders)
├── setup-dev.ps1    →  run once to bootstrap
└── workbench\       →  C:\Dev\workbench        (this folder — your personal tools)
                        C:\Dev\rimes            (cloned from Azure DevOps, NOT in GitHub)
```

## One-time setup (recommended: the script)

1. Clone this repo anywhere temporary and open PowerShell in the repo root.
2. Run:

   ```powershell
   .\setup-dev.ps1 -RimesCloneUrl "<Azure DevOps clone URL>" `
                   -AzDoOrgUrl "https://dev.azure.com/<org>" `
                   -AzDoProject "<project>"
   ```

   It will: create `C:\Dev`, copy `CLAUDE.md` + `workbench\` there, `git init` the
   workbench as a fresh repo, clone the RIMES repo, check out `vNext`, verify the
   `az` CLI + `azure-devops` extension (installing the extension if missing), set
   the org/project defaults, and finish with a pipeline test — create, push, and
   delete a throwaway branch in the rimes repo.

   Add `-SkipPipelineTest` to skip the throwaway-branch test.

## Manual alternative

1. `mkdir C:\Dev` and copy `CLAUDE.md` and `workbench\` into it.
2. `cd C:\Dev\workbench && git init -b main && git add -A && git commit -m "Initial workbench"`
3. `git clone <rimes-url> C:\Dev\rimes && cd C:\Dev\rimes && git checkout vNext`
4. `az extension add --name azure-devops` (if missing), then
   `az devops configure --defaults organization=https://dev.azure.com/<org> project=<project>`
5. Auth: `az login`, or `az devops login` with a Personal Access Token (Code
   Read & Write scope) if the org doesn't use AAD sign-in.

## Verifying PR creation works

```powershell
az repos pr list --repository <rimes-repo-name> --top 1
```

If that returns without an auth error, `az repos pr create` will work for the
"ship it" workflow described in CLAUDE.md.
