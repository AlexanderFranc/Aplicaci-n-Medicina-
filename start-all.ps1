$ErrorActionPreference = 'SilentlyContinue'
Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command','npm run dev' -WorkingDirectory "$PSScriptRoot\backend"
Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command','npm run start:web' -WorkingDirectory "$PSScriptRoot\frontend-mobile"
Start-Sleep -Seconds 3
Start-Process 'http://localhost:8081/'