# Direct Icon Generator for TestNet Wallet Extension
# Generates PNG icons directly in build/icons folder

Write-Host "🎨 Creating extension icons..." -ForegroundColor Cyan

# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

# Output directory
$outputDir = ".\build\icons"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Icon sizes to generate
$sizes = @(16, 48, 128)

foreach ($size in $sizes) {
    Write-Host "Creating ${size}x${size} icon..." -ForegroundColor Yellow
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable anti-aliasing for smooth graphics
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Background gradient (blue to purple - testnet theme)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $startColor = [System.Drawing.Color]::FromArgb(255, 59, 130, 246)  # Blue
    $endColor = [System.Drawing.Color]::FromArgb(255, 147, 51, 234)    # Purple
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $startColor, $endColor, 45)
    $graphics.FillRectangle($brush, $rect)
    
    # Draw border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 255, 255), [Math]::Max(1, $size / 32))
    $graphics.DrawRectangle($borderPen, 0, 0, $size - 1, $size - 1)
    
    # Draw "T" for TestNet in the center
    $fontSize = [Math]::Max(8, $size * 0.6)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    # Center the text
    $text = "T"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    
    $graphics.DrawString($text, $font, $textBrush, $x, $y)
    
    # Save icon
    $outputPath = Join-Path $outputDir "icon${size}.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $borderPen.Dispose()
    $font.Dispose()
    $textBrush.Dispose()
    
    Write-Host "✓ Created: $outputPath" -ForegroundColor Green
}

Write-Host "`n✅ All icons created successfully!" -ForegroundColor Green
Write-Host "📁 Location: .\build\icons\" -ForegroundColor Cyan
Write-Host "`n🔄 Now reload your extension in Chrome!" -ForegroundColor Yellow
