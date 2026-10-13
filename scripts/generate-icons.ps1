Add-Type -AssemblyName System.Drawing

$src = "C:\Users\Acer\.gemini\antigravity-ide\brain\26edc70c-8a61-4d1a-9a23-e25e8c642779\hemophilia_app_icon_1791870507736.jpg"

function Resize-Image($srcPath, $destPath, $w, $h) {
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $destImg = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($destImg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $w, $h)
    $destImg.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $destImg.Dispose()
    $srcImg.Dispose()
    Write-Host "Created: $destPath ($w x $h)"
}

Resize-Image $src "d:\webside\hemophilia app\public\icon-512.png" 512 512
Resize-Image $src "d:\webside\hemophilia app\public\icon-192.png" 192 192
Resize-Image $src "d:\webside\hemophilia app\public\apple-touch-icon.png" 180 180
Resize-Image $src "d:\webside\hemophilia app\public\favicon.png" 64 64
Resize-Image $src "d:\webside\hemophilia app\public\favicon.ico" 32 32

Write-Host "All icons generated successfully!"
