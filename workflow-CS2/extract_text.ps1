$files = Get-ChildItem 'c:\Users\user\Desktop\Agy-project\CS2-calculytor\workflow-buff\*.docx'
$outputPath = 'c:\Users\user\Desktop\Agy-project\CS2-calculytor\workflow-buff\workflow_content_v2.txt'
"" | Out-File $outputPath -Encoding UTF8

foreach ($file in $files) {
    try {
        $zipFile = Join-Path $file.DirectoryName ($file.BaseName + "_tmpv2.zip")
        $tempDir = Join-Path $file.DirectoryName ('temp_v2_' + $file.BaseName)
        
        Copy-Item $file.FullName $zipFile -Force
        if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
        
        Expand-Archive -Path $zipFile -DestinationPath $tempDir -Force
        
        $xmlPath = Join-Path $tempDir 'word/document.xml'
        if (Test-Path $xmlPath) {
            $xml = Get-Content $xmlPath -Raw
            $text = [regex]::Matches($xml, '(?<=<w:t[^>]*>).*?(?=</w:t>)').Value -join ' '
            "--- FILE: $($file.Name) ---`n$text`n`n" | Out-File $outputPath -Append -Encoding UTF8
        }
        
        Remove-Item -Force $zipFile
        Remove-Item -Recurse -Force $tempDir
    } catch {
        "Error processing $($file.Name): $($_.Exception.Message)" | Out-File $outputPath -Append -Encoding UTF8
    }
}
