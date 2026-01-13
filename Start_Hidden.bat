@echo off
cd /d "%~dp0"

REM Lancement du navigateur
start http://localhost:5179

REM Demarrage du serveur (sans pause a la fin)
call npm run dev
