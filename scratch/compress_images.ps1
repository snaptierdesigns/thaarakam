Add-Type -AssemblyName System.Drawing

$sourceDir = "c:\Users\nonam\OneDrive\Desktop\thaarakam\public\images\products"
$files = Get-ChildItem -Path $sourceDir -Filter "*.*" -File | Where-Object { $_.Extension -match "^\.(jpe?g|png)$" }

Write-Host "Found $($files.Count) image files to compress."

foreach ($file in $files) {
    try {
        $oldSize = $file.Length
        if ($oldSize -lt 150000) {
            Write-Host "Skipping $($file.Name) (already small: $($oldSize / 1024) KB)"
            continue
        }

        Write-Host "Compressing $($file.Name) ($([Math]::Round($oldSize / 1024, 1)) KB)..."
        
        # Load image
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Calculate new size (max width/height = 1000)
        $maxSize = 1000
        $width = $img.Width
        $height = $img.Height
        
        if ($width -gt $maxSize -or $height -gt $maxSize) {
            if ($width -gt $height) {
                $height = [int]($height * ($maxSize / $width))
                $width = $maxSize
            } else {
                $width = [int]($width * ($maxSize / $height))
                $height = $maxSize
            }
        }
        
        # Create new bitmap
        $newImg = New-Object System.Drawing.Bitmap($width, $height)
        $g = [System.Drawing.Graphics]::FromImage($newImg)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $width, $height)
        
        # Get JPEG Encoder
        $codecs = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
        $jpegCodec = $codecs | Where-Object { $_.FormatDescription -eq "JPEG" }
        
        # Set quality to 80%
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80)
        
        # Release file lock on original image
        $img.Dispose()
        $g.Dispose()
        
        # Save to temp file
        $tempPath = $file.FullName + ".tmp"
        $newImg.Save($tempPath, $jpegCodec, $encoderParams)
        $newImg.Dispose()
        
        # Overwrite original
        Remove-Item -Path $file.FullName -Force
        Rename-Item -Path $tempPath -NewName $file.Name -Force
        
        $newSize = (Get-Item $file.FullName).Length
        Write-Host "Done! Reduced size to $([Math]::Round($newSize / 1024, 1)) KB (Saved $([Math]::Round(($oldSize - $newSize) / 1024, 1)) KB)"
    } catch {
        Write-Host "Failed to process $($file.Name): $_"
    }
}

Write-Host "Compression complete!"
