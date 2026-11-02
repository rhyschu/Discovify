$ErrorActionPreference = 'Stop'
$recommenderRoot = $PSScriptRoot
$pythonExe = Join-Path (Split-Path $recommenderRoot -Parent) '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $pythonExe)) { throw 'Create the root .venv and install recommender/requirements.lock.txt first.' }
Push-Location $recommenderRoot
try { & $pythonExe -m uvicorn app:app --host 127.0.0.1 --port 8091 }
finally { Pop-Location }
