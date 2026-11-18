# Link Shortener: start, stop or inspect the full app in Docker.
# Usage:  .\run.ps1 start | stop | logs | status
param(
    [ValidateSet('start', 'stop', 'logs', 'status')]
    [string]$Command = 'start'
)

Set-Location $PSScriptRoot   # always run from the folder this script lives in

switch ($Command) {
    'start' {
        Write-Host "Building and starting MongoDB, backend and frontend..." -ForegroundColor Cyan
        docker compose --profile full up -d --build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Docker failed. Is Docker Desktop running?" -ForegroundColor Red
            exit 1
        }

        Write-Host "Waiting for the backend to be ready..." -ForegroundColor Cyan
        $ready = $false
        for ($i = 0; $i -lt 60; $i++) {
            try {
                Invoke-RestMethod -Uri 'http://127.0.0.1:8080/api/ping' -TimeoutSec 5 | Out-Null
                $ready = $true
                break
            }
            catch {
                Start-Sleep -Seconds 2
            }
        }

        if (-not $ready) {
            Write-Host "The backend did not answer within 2 minutes. See: .\run.ps1 logs" -ForegroundColor Red
            exit 1
        }

        Write-Host ""
        Write-Host "Link Shortener is running" -ForegroundColor Green
        Write-Host "  App:       http://localhost:3000"
        Write-Host "  API:       http://localhost:8080/api/ping"
        Write-Host "  Database:  mongodb://localhost:27017  (MongoDB Compass)"
        Write-Host ""
        Write-Host "Stop it with: .\run.ps1 stop"
        Start-Process 'http://localhost:3000'   # open the app in your default browser
    }
    'stop' {
        docker compose --profile full down
        Write-Host "Stopped. Your links are still saved in the mongo-data volume." -ForegroundColor Green
    }
    'logs' {
        Write-Host "Live logs (press Ctrl+C to stop watching; the app keeps running)" -ForegroundColor Cyan
        docker compose --profile full logs -f backend frontend
    }
    'status' {
        docker compose --profile full ps
    }
}