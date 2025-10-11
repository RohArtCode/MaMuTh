# Konfiguriere das Quellverzeichnis
$basePath = "C:\D\Add\_Projekte\Website\github\MaMuTH\MaMuTh\_JSON-Source"
# Pfad zur _default-Json.txt
$defaultJsonPath = Join-Path $basePath "_default-Json.txt"
$defaultJsonString = Get-Content $defaultJsonPath -Raw

# Hole alle HTM-Dateien (HTML Vorlagen müssen Endung htm haben) 
#$htmFiles = Get-ChildItem -Path $basePath -Filter "*.htm"
$htmFiles = Get-ChildItem -Path $basePath | Where-Object { $_.Extension -eq ".htm" }

# Hole alle JSON-Dateien (außer _default-Json.txt)
$jsonFiles = Get-ChildItem -Path $basePath -Filter "*.json" | Where-Object { $_.Name -ne "_default-Json.txt" }

foreach ($htmFile in $htmFiles) {
    foreach ($jsonFile in $jsonFiles) {
        # Inhalt der aktuellen JSON-Datei laden
        $jsonContent = Get-Content $jsonFile.FullName -Raw

        # HTML-Inhalt laden
        $htmlContent = Get-Content $htmFile.FullName -Raw

        # Ersetze den default-JSON-String mit dem JSON-Inhalt
        $modifiedHtml = $htmlContent -replace [regex]::Escape($defaultJsonString), $jsonContent

        # Erstelle den neuen Dateinamen
        $htmlBaseName = $htmFile.BaseName
        $jsonBaseName = $jsonFile.BaseName
        $newFileName = "${htmlBaseName}_${jsonBaseName}.html"
        $newFilePath = Join-Path $basePath $newFileName

        # Speichere die neue Datei
        Set-Content -Path $newFilePath -Value $modifiedHtml
        Write-Host "Erstellt: $newFilePath"
    }
}