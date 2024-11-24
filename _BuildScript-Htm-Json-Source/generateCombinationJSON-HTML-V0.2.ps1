# Quell- und Zielverzeichnisse
$basePath = "C:\D\Add\_Projekte\Website\github\MaMuTH\MaMuTh\_BuildScript-Htm-Json-Source"
$outputPath = "C:\D\Add\_Projekte\Website\github\MaMuTH\MaMuTh\Analyse"
$htmlDirectory="HTML"
$outputSubPath = Join-Path $outputPath $htmlDirectory  # Vollständiger Pfad zum Unterverzeichnis

# Unterverzeichnis erstellen, falls es nicht existiert
if (!(Test-Path -Path $outputSubPath)) {
    New-Item -ItemType Directory -Path $outputSubPath
}

# Lade den Default-JSON-String aus der _default-Json.txt
$defaultJsonPath = Join-Path $basePath "_default-Json.txt"
$defaultJsonString = Get-Content -Path $defaultJsonPath -Raw

# Hole nur Dateien mit der Endung .htm
$htmFiles = Get-ChildItem -Path $basePath | Where-Object { $_.Extension -eq ".htm" }

# JSON-Dateien holen (außer _default-Json.txt)
$jsonFiles = Get-ChildItem -Path $basePath -Filter "*.json" | Where-Object { $_.Name -ne "_default-Json.txt" }

# Initialisiere Inhaltsverzeichnis
$indexContent = @()
$indexContent += "<html><head><title>Inhaltsverzeichnis</title></head><body>"
$indexContent += "<h1>Inhaltsverzeichnis</h1>"

# Verarbeite jede Kombination aus HTM- und JSON-Datei
foreach ($htmFile in $htmFiles) {
    # Kapitel für die aktuelle HTM-Datei im Inhaltsverzeichnis
    $chapterTitle = "<h2>${($htmFile.BaseName)}</h2>"
    $indexContent += $chapterTitle
    $indexContent += "<ul>"

    foreach ($jsonFile in $jsonFiles) {
        # Lese den Inhalt der aktuellen JSON-Datei
        $jsonContent = Get-Content -Path $jsonFile.FullName -Raw

        # Lese den Inhalt der aktuellen HTM-Datei
        $htmContent = Get-Content -Path $htmFile.FullName -Raw

        # Ersetze den Default-JSON-String durch den Inhalt der JSON-Datei
        $modifiedHtm = $htmContent -replace [regex]::Escape($defaultJsonString), $jsonContent

        # Ersetze ##TITLE## durch den Namen der Ausgangsdatei
        $modifiedHtm = $modifiedHtm -replace "##TITLE##", "$htmFile.BaseName: $jsonFile.BaseName"

        # Erstelle den neuen Dateinamen
        $htmBaseName = $htmFile.BaseName
        $jsonBaseName = $jsonFile.BaseName
        $newFileName = "${htmBaseName}_${jsonBaseName}.html"
        $newFilePath = Join-Path $outputSubPath $newFileName

        # Speichere die neue Datei
        Set-Content -Path $newFilePath -Value $modifiedHtm
        Write-Host "Erstellt: $newFilePath"

        # Füge den relativen Pfad für den Link zur Inhaltsverzeichnisdatei hinzu
        $relativePath = Join-Path $htmlDirectory $newFileName
        $indexContent += "<li><a href='$relativePath'>$newFileName</a></li>"
    }

    $indexContent += "</ul>"
}

# Schließe das Inhaltsverzeichnis
$indexContent += "</body></html>"

# Speichere die Inhaltsverzeichnisdatei
$indexFilePath = Join-Path $outputPath "Inhalt.html"
Set-Content -Path $indexFilePath -Value ($indexContent -join "`n")
Write-Host "Inhaltsverzeichnis erstellt: $indexFilePath"
