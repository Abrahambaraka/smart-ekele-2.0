@echo off
REM Script de déploiement pour Windows
REM Usage: deploy.bat [user@vps-ip] [répertoire-destination]

if "%~2"=="" (
    echo Usage: %0 ^<user@vps-ip^> ^<repertoire-destination^>
    echo Exemple: %0 root@192.168.1.100 /var/www/smart-ekele
    exit /b 1
)

set VPS_HOST=%1
set DEST_DIR=%2
set BUILD_DIR=.\build
set TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set ARCHIVE_NAME=smart-ekele-%TIMESTAMP%.tar.gz

echo 📦 Création de l'archive...
tar -czf "%ARCHIVE_NAME%" -C "%BUILD_DIR%" .

echo 📤 Transfert vers le VPS...
scp "%ARCHIVE_NAME%" "%VPS_HOST%:/tmp/"

echo 🚀 Déploiement sur le VPS...
ssh "%VPS_HOST%" "sudo mkdir -p %DEST_DIR% && cd %DEST_DIR% && sudo tar -xzf /tmp/%ARCHIVE_NAME% . && sudo chown -R www-data:www-data . && sudo find . -type d -exec chmod 755 {} \; && sudo find . -type f -exec chmod 644 {} \; && rm /tmp/%ARCHIVE_NAME% && (systemctl is-active --quiet apache2 && sudo systemctl restart apache2 || systemctl is-active --quiet nginx && sudo systemctl restart nginx) && echo Déploiement terminé"

REM Nettoyer l'archive locale
del "%ARCHIVE_NAME%"

echo 🎉 Déploiement réussi !
echo 🌐 Votre site devrait être accessible à l'adresse configurée