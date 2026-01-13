@echo off
chcp 65001 >nul
cls
echo.
echo ═══════════════════════════════════════════════════════
echo    ⚡ MODE DÉVELOPPEMENT RAPIDE - SIMPLE CRM
echo ═══════════════════════════════════════════════════════
echo.
echo 🌐 Ouverture du navigateur automatique...
echo 📝 Modifiez le code et voyez les changements instantanément !
echo 🛑 Appuyez sur Ctrl+C pour arrêter
echo.
echo ───────────────────────────────────────────────────────
echo.

cd /d "%~dp0"
start http://localhost:5179
npm run dev
