<#
.SYNOPSIS
    One-time bootstrap for the C:\Dev Rimes EDM workspace.

.DESCRIPTION
    Run from the root of a checkout of this repo. Creates C:\Dev, copies
    CLAUDE.md and workbench\ into it, initializes the workbench as a fresh git
    repo, clones the RIMES Azure DevOps repo, checks out vNext, verifies the
    az CLI + azure-devops extension, and finishes with a pipeline test:
    create, push, and delete a throwaway branch in the rimes repo.

.EXAMPLE
    .\setup-dev.ps1 -RimesCloneUrl "https://dev.azure.com/org/proj/_git/rimes" `
                    -AzDoOrgUrl "https://dev.azure.com/org" -AzDoProject "proj"
#>
[CmdletBinding()]
param(
    [string]$RimesCloneUrl = '',
    [string]$AzDoOrgUrl    = '',      # e.g. https://dev.azure.com/yourfirm
    [string]$AzDoProject   = '',
    [string]$DevRoot       = 'C:\Dev',
    [switch]$SkipPipelineTest
)

$ErrorActionPreference = 'Stop'
function Step([string]$msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok  ([string]$msg) { Write-Host "    OK: $msg" -ForegroundColor Green }
function Warn([string]$msg) { Write-Host "    WARN: $msg" -ForegroundColor Yellow }

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. C:\Dev ------------------------------------------------------------------
Step "Ensuring $DevRoot exists"
New-Item -ItemType Directory -Path $DevRoot -Force | Out-Null
Ok $DevRoot

# 2. Copy CLAUDE.md + workbench ----------------------------------------------
Step "Copying CLAUDE.md and workbench\ from $scriptRoot"
Copy-Item (Join-Path $scriptRoot 'CLAUDE.md') $DevRoot -Force
$wb = Join-Path $DevRoot 'workbench'
if (-not (Test-Path $wb)) {
    Copy-Item (Join-Path $scriptRoot 'workbench') $DevRoot -Recurse
    Ok "workbench copied"
} else {
    Warn "workbench already exists at $wb - not overwriting"
}

# 3. Init workbench as its own repo ------------------------------------------
if (-not (Test-Path (Join-Path $wb '.git'))) {
    Step "Initializing new git repo in $wb"
    git -C $wb init -b main
    git -C $wb add -A
    git -C $wb commit -m "Initial workbench structure"
    Ok "workbench repo initialized"
} else {
    Warn "workbench is already a git repo - skipping init"
}

# 4. Clone RIMES repo, check out vNext ----------------------------------------
$rimes = Join-Path $DevRoot 'rimes'
if (-not (Test-Path $rimes)) {
    if (-not $RimesCloneUrl) {
        $RimesCloneUrl = Read-Host 'Paste the RIMES Azure DevOps clone URL'
    }
    Step "Cloning RIMES repo into $rimes"
    git clone $RimesCloneUrl $rimes
} else {
    Warn "rimes repo already exists at $rimes - skipping clone"
}
Step "Checking out vNext"
git -C $rimes fetch origin vNext
git -C $rimes checkout vNext
git -C $rimes pull origin vNext
Ok "on vNext"

# 5. Verify az CLI + azure-devops extension ------------------------------------
Step "Verifying az CLI"
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    throw "az CLI not found. Install from https://aka.ms/installazurecliwindows, then re-run this script."
}
az version --output none
Ok "az CLI present"

Step "Verifying azure-devops extension"
$ext = az extension list --query "[?name=='azure-devops'].name" -o tsv
if (-not $ext) {
    az extension add --name azure-devops
    Ok "azure-devops extension installed"
} else {
    Ok "azure-devops extension present"
}

if ($AzDoOrgUrl -and $AzDoProject) {
    Step "Setting az devops defaults (org=$AzDoOrgUrl project=$AzDoProject)"
    az devops configure --defaults "organization=$AzDoOrgUrl" "project=$AzDoProject"
    Ok "defaults set"
}

Step "Checking Azure DevOps authentication"
try {
    az devops project list --top 1 --output none
    Ok "authenticated - 'az repos pr create' will work"
} catch {
    Warn "Not authenticated yet. Run 'az login', or 'az devops login' with a PAT (Code Read & Write scope), then re-run this check."
}

# 6. Pipeline test: throwaway branch ------------------------------------------
if ($SkipPipelineTest) {
    Warn "Pipeline test skipped (-SkipPipelineTest)"
} else {
    $stamp  = Get-Date -Format 'yyyyMMdd-HHmmss'
    $branch = "feature/pipeline-check-$stamp"
    Step "Pipeline test: create + push + delete throwaway branch $branch"
    git -C $rimes checkout -b $branch
    git -C $rimes push -u origin $branch
    git -C $rimes checkout vNext
    git -C $rimes push origin --delete $branch
    git -C $rimes branch -D $branch
    Ok "round-trip create/push/delete succeeded - the PR pipeline plumbing works"
}

Write-Host "`nAll done. Workspace ready at $DevRoot" -ForegroundColor Green
Write-Host "Read $DevRoot\CLAUDE.md for conventions and the RIMES 'ship it' workflow."
