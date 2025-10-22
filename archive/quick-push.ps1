# Quick Push Script for OnlyDev_Wallet
# Usage: .\quick-push.ps1 "your commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$message,
    
    [Parameter(Mandatory=$false)]
    [switch]$force
)

Write-Host ""
Write-Host "🧩 OnlyDev_Wallet - Git Push Automation" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if there are changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️  No changes to commit." -ForegroundColor Yellow
    exit 0
}

# Show what will be committed
Write-Host "📋 Files to be committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Add all files
Write-Host "➕ Adding files..." -ForegroundColor Cyan
git add .

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m "$message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    exit 1
}

# Push
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan

if ($force) {
    git push --force
} else {
    git push
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🔗 https://github.com/YASH514131/OnlyDev_Wallet" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push failed! Please check the error above." -ForegroundColor Red
    Write-Host ""
    exit 1
}
