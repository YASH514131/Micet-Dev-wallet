Add-Type -AssemblyName System.Drawing

# Input image path (update the path if needed)
$inputImagePath = ".\logo.png"

# Output directory
$outputDir = ".\build\icons"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

# Icon sizes (Chrome recommends at least 16, 32, 48, 128, 256)
$sizes = @(16, 32, 48, 64, 96, 128, 256, 512)

# Load once to avoid re-reading the file for each resize
$original = [System.Drawing.Image]::FromFile($inputImagePath)

try {
    foreach ($size in $sizes) {
        # Create a new bitmap for resized icon
        $bitmap = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

        # High quality scaling
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        # Draw the resized image
        $graphics.DrawImage($original, 0, 0, $size, $size)

        # Save output
        $outputPath = Join-Path $outputDir "icon$size.png"
        $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

        $graphics.Dispose()
        $bitmap.Dispose()

        Write-Host "Created: $outputPath"
    }
}
finally {
    $original.Dispose()
}

Write-Host "Done! All icons created."
