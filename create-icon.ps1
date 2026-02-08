Add-Type -AssemblyName System.Drawing

$size = 180
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Blue gradient background
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(0,0),
    [System.Drawing.Point]::new($size,$size),
    [System.Drawing.Color]::FromArgb(59,130,246),
    [System.Drawing.Color]::FromArgb(29,78,216)
)

# Rounded rectangle path
$radius = 36
$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc($rect.X, $rect.Y, $radius*2, $radius*2, 180, 90)
$path.AddArc($rect.Right - $radius*2, $rect.Y, $radius*2, $radius*2, 270, 90)
$path.AddArc($rect.Right - $radius*2, $rect.Bottom - $radius*2, $radius*2, $radius*2, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $radius*2, $radius*2, $radius*2, 90, 90)
$path.CloseFigure()

$g.FillPath($brush, $path)

# White pill icon
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.TranslateTransform($size/2, $size/2)
$g.RotateTransform(45)
$g.FillEllipse($whiteBrush, -18, -45, 36, 90)

# Save
$bmp.Save("apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Host "Icon created: apple-touch-icon.png"
