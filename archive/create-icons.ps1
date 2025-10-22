# PowerShell script to create simple placeholder icon files for Chrome extension
# This creates basic solid color PNG files as placeholders

Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [int]$size,
        [string]$outputPath
    )
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable anti-aliasing
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Background color (dark blue-gray)
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))
    $graphics.FillRectangle($bgBrush, 0, 0, $size, $size)
    
    # Create gradient effect
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $color1 = [System.Drawing.Color]::FromArgb(100, 59, 130, 246)
    $color2 = [System.Drawing.Color]::FromArgb(100, 139, 92, 246)
    $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45)
    $graphics.FillRectangle($gradientBrush, $rect)
    
    # Draw border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(71, 85, 105), 2)
    $graphics.DrawRectangle($borderPen, 1, 1, $size - 2, $size - 2)
    
    # Draw text "TW" for TestNet Wallet
    $fontSize = [math]::Floor($size * 0.4)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $text = "TW"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    
    $graphics.DrawString($text, $font, $textBrush, $x, $y)
    
    # Draw red dot (testnet indicator) for larger sizes
    if ($size -ge 48) {
        $dotSize = [math]::Floor($size * 0.15)
        $dotX = $size - $dotSize - 2
        $dotY = 2
        $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))
        $graphics.FillEllipse($redBrush, $dotX, $dotY, $dotSize, $dotSize)
    }
    
    # Save as PNG
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "✓ Created: $outputPath" -ForegroundColor Green
}

# Main execution
$iconsDir = "build\icons"

# Create icons directory if it doesn't exist
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
    Write-Host "✓ Created directory: $iconsDir" -ForegroundColor Green
}

# Create icons
Write-Host "`n🧩 Generating TestNet Wallet Icons..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Create-Icon -size 16 -outputPath "$iconsDir\icon16.png"
Create-Icon -size 48 -outputPath "$iconsDir\icon48.png"
Create-Icon -size 128 -outputPath "$iconsDir\icon128.png"

Write-Host "`n✅ All icons created successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`nIcons saved to: $iconsDir" -ForegroundColor Yellow
Write-Host "`nYou can now reload the extension in Chrome!" -ForegroundColor Yellow
