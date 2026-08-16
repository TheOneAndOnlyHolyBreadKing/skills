param (
    [Parameter(Mandatory=$true)]
    [string]$SkillName
)

$AntigravityPath = "C:\Users\light\.gemini\antigravity\skills\$SkillName"
$CliPath = "C:\Users\light\.gemini\skills\$SkillName"

Write-Host "Attempting to remove skill: $SkillName" -ForegroundColor Cyan

if (Test-Path $AntigravityPath) {
    Remove-Item -Path $AntigravityPath -Recurse -Force
    Write-Host "Removed from Antigravity: $AntigravityPath" -ForegroundColor Green
} else {
    Write-Host "Skill not found in Antigravity: $AntigravityPath" -ForegroundColor Yellow
}

if (Test-Path $CliPath) {
    Remove-Item -Path $CliPath -Recurse -Force
    Write-Host "Removed from CLI: $CliPath" -ForegroundColor Green
} else {
    Write-Host "Skill not found in CLI: $CliPath" -ForegroundColor Yellow
}

Write-Host "Deletion process complete." -ForegroundColor Cyan
