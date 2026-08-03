# Build Wild Breath and deploy to Cloudflare (app10.nextaura.fit)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
npx wrangler deploy -c workers/wrangler-app10.toml
Pop-Location
