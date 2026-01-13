@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════
echo    🔄 RÉINSTALLATION RAPIDE SIMPLE CRM
echo ═══════════════════════════════════════════════════════
echo.

:: Tuer l'application si elle tourne
echo [1/5] 🛑 Fermeture de Simple CRM...
taskkill /F /IM "Simple CRM.exe" 2>nul
timeout /t 2 /nobreak >nul
echo       ✅ Terminé

:: Désinstaller l'ancienne version silencieusement
echo.
echo [2/5] 🗑️  Désinstallation de l'ancienne version...
"%LocalAppData%\Programs\simple-crm\Uninstall Simple CRM.exe" /S 2>nul
if exist "%LocalAppData%\Programs\simple-crm\" (
    timeout /t 3 /nobreak >nul
    rd /s /q "%LocalAppData%\Programs\simple-crm\" 2>nul
)
echo       ✅ Terminé

:: Installer la nouvelle version
echo.
echo [3/5] 📦 Installation de la nouvelle version...
start /wait "" "%~dp0release\Simple CRM Setup 1.0.0.exe" /S
timeout /t 2 /nobreak >nul
echo       ✅ Terminé

:: Attendre que l'installation soit complète
echo.
echo [4/5] ⏳ Finalisation...
timeout /t 3 /nobreak >nul
echo       ✅ Terminé

:: Lancer l'application
echo.
echo [5/5] 🚀 Lancement de Simple CRM...
start "" "%LocalAppData%\Programs\simple-crm\Simple CRM.exe"
timeout /t 2 /nobreak >nul
echo       ✅ Terminé

echo.
echo ═══════════════════════════════════════════════════════
echo    ✨ SIMPLE CRM RÉINSTALLÉ AVEC SUCCÈS !
echo ═══════════════════════════════════════════════════════
echo.
echo L'application devrait s'ouvrir automatiquement.
echo Si ce n'est pas le cas, cherchez "Simple CRM" dans le menu Démarrer.
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
