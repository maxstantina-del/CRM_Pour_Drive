@echo off
echo ===================================================
echo      LANCEMENT DU CRM (Fusion Parfaite)
echo ===================================================

cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] Premiere installation detectee.
    echo [INFO] Installation des dependances en cours... (Cela peut prendre 1-2 minutes)
    call npm install
    echo [OK] Installation terminee.
)

echo [INFO] Demarrage du serveur local...
echo [INFO] Une page web va s'ouvrir automatiquement.
start http://localhost:5179

call npm run dev
pause
