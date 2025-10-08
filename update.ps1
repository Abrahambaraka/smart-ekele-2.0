# Script de mise à jour rapide pour Smart Ekele
# Usage: .\update.ps1 -VpsHost "user@ip" -DestDir "/var/www/smart-ekele"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$true)]
    [string]$DestDir
)

Write-Host "🔄 MISE À JOUR SMART EKELE" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "🎯 Serveur: $VpsHost" -ForegroundColor Yellow
Write-Host "📍 Répertoire: $DestDir" -ForegroundColor Yellow
Write-Host ""

$updateCommands = @"
cd '$DestDir'
echo "📥 Récupération des dernières modifications..."
git pull origin master

echo "📦 Mise à jour des dépendances..."
npm install

echo "🏗️  Reconstruction de l'application..."
npm run build

echo "🗂️  Mise à jour des fichiers web..."
if [ -d 'build' ]; then
    cp -r build/* .
    rm -rf build
fi

echo "🔐 Mise à jour des permissions..."
sudo chown -R www-data:www-data .
sudo find . -type f -exec chmod 644 {} \;

echo "🔄 Redémarrage du serveur..."
if systemctl is-active --quiet apache2; then
    sudo systemctl reload apache2
elif systemctl is-active --quiet nginx; then
    sudo systemctl reload nginx
fi

echo "✅ Mise à jour terminée !"
"@

try {
    ssh $VpsHost $updateCommands
    Write-Host "🎉 MISE À JOUR RÉUSSIE !" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la mise à jour: $_" -ForegroundColor Red
}