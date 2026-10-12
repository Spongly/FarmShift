Add-Type -AssemblyName System.Drawing
$srcPath = (Resolve-Path "public\logo-raw.png").Path
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$minX = 412
$maxX = 632
$minY = 262
$maxY = 512

$w = $maxX - $minX + 1
$h = $maxY - $minY + 1

$pad = 20
$outW = $w + ($pad * 2)
$outH = $h + ($pad * 2)

$dest = New-Object System.Drawing.Bitmap($outW, $outH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $src.GetPixel($minX + $x, $minY + $y)
        $brightness = [Math]::Min($p.R, $p.G)
        if ($brightness -gt 240) {
            $dest.SetPixel($x + $pad, $y + $pad, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        } elseif ($brightness -gt 180) {
            $alpha = [int](($brightness - 180) / 60.0 * 255)
            $dest.SetPixel($x + $pad, $y + $pad, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
        }
    }
}

$dest.Save("public\logo-symbol-white.png", [System.Drawing.Imaging.ImageFormat]::Png)

$destGreen = New-Object System.Drawing.Bitmap($outW, $outH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $outH; $y++) {
    for ($x = 0; $x -lt $outW; $x++) {
        $p = $dest.GetPixel($x, $y)
        if ($p.A -gt 0) {
            $destGreen.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($p.A, 45, 80, 22))
        }
    }
}
$destGreen.Save("public\logo-symbol-forest.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Crop the full artwork badge
$cropPad = 50
$badgeX = [Math]::Max(0, $minX - $cropPad)
$badgeY = [Math]::Max(0, $minY - $cropPad)
$badgeW = [Math]::Min($src.Width - $badgeX, $w + ($cropPad * 2))
$badgeH = [Math]::Min($src.Height - $badgeY, $h + ($cropPad * 2))

$badge = New-Object System.Drawing.Bitmap($badgeW, $badgeH)
$g = [System.Drawing.Graphics]::FromImage($badge)
$rect = New-Object System.Drawing.Rectangle(0, 0, $badgeW, $badgeH)
$srcRect = New-Object System.Drawing.Rectangle($badgeX, $badgeY, $badgeW, $badgeH)
$g.DrawImage($src, $rect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$badge.Save("public\logo-badge.png", [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
$dest.Dispose()
$destGreen.Dispose()
$badge.Dispose()
Write-Host "Logo generation completed."
