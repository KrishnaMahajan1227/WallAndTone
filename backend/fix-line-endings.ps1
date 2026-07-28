# Run this from inside your "backend" folder in PowerShell.
# Converts all .js files (excluding node_modules) from CRLF to LF line endings.

$files = Get-ChildItem -Path . -Filter *.js -Recurse | Where-Object { $_.FullName -notmatch "\\node_modules\\" }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content -match "`r`n") {
        $content = $content -replace "`r`n", "`n"
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host ""
Write-Host "Done! Now run: git add . ; git commit -m 'fix: convert line endings to LF' ; git push"
