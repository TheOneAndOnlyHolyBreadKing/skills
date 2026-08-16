# sync-skills.ps1
# Synchronizes skills between Antigravity and CLI directories.
# This version performs a bidirectional update (newer files win).

$AntigravityPath = "C:\Users\light\.gemini\antigravity\skills"
$CLIPath = "C:\Users\light\.gemini\skills"

$Exclusions = @(
    "/XF", "skills-lock.json", 
    "/XD", ".agents", ".tmp.drivedownload", ".tmp.driveupload", "node_modules", ".git"
)

Write-Host "Starting bidirectional skill synchronization..." -ForegroundColor Cyan
Write-Host "Antigravity Path: $AntigravityPath"
Write-Host "CLI Path:         $CLIPath"

# 1. Sync Antigravity -> CLI (Update newer/missing)
Write-Host "`nSyncing Antigravity -> CLI..." -ForegroundColor Gray
robocopy $AntigravityPath $CLIPath /E /XO @Exclusions

# 2. Sync CLI -> Antigravity (Update newer/missing)
Write-Host "`nSyncing CLI -> Antigravity..." -ForegroundColor Gray
robocopy $CLIPath $AntigravityPath /E /XO @Exclusions

$exitCode = $LASTEXITCODE

if ($exitCode -le 3) {
    Write-Host "`nSynchronization successful! Both environments are up to date." -ForegroundColor Green
} else {
    Write-Host "`nSynchronization finished with status code: $exitCode." -ForegroundColor Yellow
    Write-Host "Note: Status codes 0-3 are generally successful for robocopy."
}
