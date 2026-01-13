@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════
echo    🔨 BUILD ET INSTALLATION SIMPLE CRM
echo ═══════════════════════════════════════════════════════
echo.

:: Vérifier que npm est disponible
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERREUR: npm n'est pas installé ou pas dans le PATH
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"

:: Tuer l'application si elle tourne
echo [1/6] 🛑 Fermeture de Simple CRM...
taskkill /F /IM "Simple CRM.exe" 2>nul
timeout /t 2 /nobreak >nul
echo       ✅ Terminé

:: Build de l'application
echo.
echo [2/6] 🔨 Compilation de l'application (cela peut prendre 2-3 minutes)...
call npm run build:win
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERREUR lors du build !
    echo.
    pause
    exit /b 1
)
echo       ✅ Build terminé

:: Désinstaller l'ancienne version
echo.
echo [3/6] 🗑️  Désinstallation de l'ancienne version...
"%LocalAppData%\Programs\simple-crm\Uninstall Simple CRM.exe" /S 2>nul
if exist "%LocalAppData%\Programs\simple-crm\" (
    timeout /t 3 /nobreak >nul
    rd /s /q "%LocalAppData%\Programs\simple-crm\" 2>nul
)
echo       ✅ Terminé

:: Installer la nouvelle version
echo.
echo [4/6] 📦 Installation de la nouvelle version...
start /wait "" "%~dp0release\Simple CRM Setup 1.0.0.exe" /S
timeout /t 2 /nobreak >nul
echo       ✅ Terminé

:: Attendre que l'installation soit complète
echo.
echo [5/6] ⏳ Finalisation...
timeout /t 3 /nobreak >nul
echo       ✅ Terminé

:: Lancer l'application
echo.
echo [6/6] 🚀 Lancement de Simple CRM...
start "" "%LocalAppData%\Programs\simple-crm\Simple CRM.exe"
timeout /t 2 /nobreak >nul
echo       ✅ Terminé

echo.
echo ═══════════════════════════════════════════════════════
echo    ✨ BUILD ET INSTALLATION RÉUSSIS !
echo ═══════════════════════════════════════════════════════
echo.
echo L'application devrait s'ouvrir automatiquement.
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
