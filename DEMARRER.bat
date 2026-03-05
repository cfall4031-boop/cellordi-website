@echo off
echo ========================================
echo   RÉPARATION CeLL^&Ordi — Démarrage
echo ========================================
echo.

echo [1/2] Démarrage du backend (port 3001)...
start "Backend CeLL&Ordi" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Démarrage du frontend (port 5173)...
start "Frontend CeLL&Ordi" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Ouverture du navigateur dans 4 secondes...
timeout /t 4 /nobreak >nul

start http://localhost:5173
start http://localhost:5173/admin

echo.
echo Appuyez sur une touche pour fermer cette fenêtre.
pause >nul
