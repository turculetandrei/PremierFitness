@echo off
setlocal
cd /d "C:\Users\Turculet Andrei\Projects\PremierFitness"

set "PORT=3000"
set "URL=http://localhost:%PORT%"

echo Se construieste aplicatia...
call npm run build
if errorlevel 1 (
    echo.
    echo Build-ul a esuat. Apasa o tasta pentru a inchide.
    pause >nul
    exit /b 1
)

echo Pornire server pe portul %PORT%...
start "Premier Fitness Server" cmd /k "npm start -- -p %PORT%"

echo Se asteapta pornirea serverului...
set /a TRIES=0
:waitloop
timeout /t 2 /nobreak >nul
set /a TRIES+=1
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 3 | Out-Null; exit 0 } catch { exit 1 }"
if not errorlevel 1 goto ready
if %TRIES% geq 30 (
    echo.
    echo Serverul nu a pornit dupa 60 de secunde. Verifica fereastra "Premier Fitness Server".
    pause >nul
    exit /b 1
)
goto waitloop

:ready
echo Server pornit. Se deschide browserul...
start "" "%URL%"

endlocal
