# Deploy app10.nextaura.fit (v16all-dashboard / Wild Breath)
param(
    [string]$ZipPath = "D:\Users\archi\Downloads\v16all-dashboard.zip"
)

$ErrorActionPreference = "Stop"
$root = "F:\v1FullCorpus"
$staging = "$root\public\app10_staging"
$out = "$root\public\app10"

if ($ZipPath -and (Test-Path $ZipPath)) {
    if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
    Expand-Archive -Path $ZipPath -DestinationPath $staging -Force
    Push-Location $staging
    try {
        npm install
        npm run build
    } finally {
        Pop-Location
    }
    if (Test-Path $out) { Remove-Item $out -Recurse -Force }
    Copy-Item -Recurse "$staging\dist" $out
    $idx = Join-Path $out "index.html"
    if (Test-Path $idx) {
        (Get-Content $idx -Raw) -replace 'My Google AI Studio App', 'Wild Breath — app10.nextaura.fit' | Set-Content $idx -Encoding utf8
    }
}

Push-Location "$root\workers"
try {
    npx wrangler deploy -c wrangler-app10.toml
} finally {
    Pop-Location
}

Write-Host "`nLIVE: https://app10.nextaura.fit" -ForegroundColor Green
