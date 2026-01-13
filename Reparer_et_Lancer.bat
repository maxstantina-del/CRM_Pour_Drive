@echo off
echo ===================================================
echo      REPARATION ET LANCEMENT DU CRM
echo ===================================================

cd /d "%~dp0"

echo [1/4] Nettoyage du cache Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo [2/4] Verification des dependances...
if not exist node_modules (
    echo [INFO] Node_modules manquant. Installation...
    call npm install
)

echo [3/4] Lancement du navigateur...
start http://localhost:5179

echo [4/4] Demarrage du serveur...
echo.
echo SI CELA RESTE BLOQUE SUR "ready in ... ms" C'EST NORMAL !
echo Le navigateur devrait afficher l'application.
echo.
call npm run dev
pause
