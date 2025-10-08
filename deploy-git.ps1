# Script de déploiement Git pour Smart Ekele
# Clone et déploie directement depuis GitHub
# Usage: .\deploy-git.ps1 -VpsHost "user@ip" -DestDir "/var/www/smart-ekele"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$true)]
    [string]$DestDir,
    
    [string]$GitRepo = "https://github.com/Abrahambaraka/smart-project-app.git",
    [string]$Branch = "master"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "🚀 DÉPLOIEMENT GIT - SMART EKELE" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📦 Repository: $GitRepo" -ForegroundColor Yellow
Write-Host "🌿 Branche: $Branch" -ForegroundColor Yellow
Write-Host "🎯 Serveur: $VpsHost" -ForegroundColor Yellow
Write-Host "📍 Destination: $DestDir" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔗 Connexion au serveur et déploiement..." -ForegroundColor Green

# Commandes de déploiement Git sur le serveur
$deployCommands = @"
#!/bin/bash
set -e

echo "🔧 Installation des dépendances système..."
# Installer Node.js et npm si nécessaire
if ! command -v node &> /dev/null; then
    echo "📦 Installation de Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v git &> /dev/null; then
    echo "📦 Installation de Git..."
    sudo apt-get update
    sudo apt-get install -y git
fi

echo "📁 Préparation du répertoire de destination..."
# Sauvegarder l'ancienne version si elle existe
if [ -d '$DestDir' ] && [ "`$(ls -A '$DestDir' 2>/dev/null)" ]; then
    echo "💾 Sauvegarde de l'ancienne version..."
    sudo mv '$DestDir' '${DestDir}_backup_$timestamp'
fi

# Créer le répertoire de destination
sudo mkdir -p '$DestDir'
cd '$DestDir'

echo "📥 Clonage du repository GitHub..."
sudo git clone '$GitRepo' .
sudo git checkout '$Branch'

echo "📦 Installation des dépendances npm..."
sudo npm install --production=false

echo "🏗️  Construction de l'application..."
sudo npm run build

echo "🗂️  Organisation des fichiers web..."
# Déplacer les fichiers build vers le répertoire web
if [ -d 'build' ]; then
    sudo cp -r build/* .
    sudo rm -rf build src node_modules package*.json *.config.* *.md
fi

echo "🔐 Configuration des permissions..."
sudo chown -R www-data:www-data '$DestDir'
sudo find '$DestDir' -type d -exec chmod 755 {} \;
sudo find '$DestDir' -type f -exec chmod 644 {} \;

echo "🌐 Configuration du serveur web..."
# Créer le fichier .htaccess pour Apache si nécessaire
if ! [ -f '.htaccess' ]; then
    sudo tee .htaccess > /dev/null << 'EOF'
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Cache des assets statiques
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header append Cache-Control "public"
</FilesMatch>

# Compression gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Headers de sécurité
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
EOF
    sudo chown www-data:www-data .htaccess
    sudo chmod 644 .htaccess
fi

echo "🔄 Redémarrage du serveur web..."
if systemctl is-active --quiet apache2; then
    sudo systemctl restart apache2
    echo "✅ Apache redémarré avec succès"
elif systemctl is-active --quiet nginx; then
    sudo systemctl restart nginx
    echo "✅ Nginx redémarré avec succès"
else
    echo "⚠️  Aucun serveur web détecté - veuillez redémarrer manuellement"
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "📍 Application déployée dans: '$DestDir'"
echo "🌐 Votre site Smart Ekele est maintenant en ligne"
"@

# Exécuter les commandes sur le serveur
try {
    $deployCommands | ssh $VpsHost "cat > /tmp/deploy-smart-ekele.sh && chmod +x /tmp/deploy-smart-ekele.sh && /tmp/deploy-smart-ekele.sh && rm /tmp/deploy-smart-ekele.sh"
    
    Write-Host ""
    Write-Host "🎉 DÉPLOIEMENT GIT RÉUSSI !" -ForegroundColor Green
    Write-Host "🌐 Smart Ekele est maintenant accessible sur votre serveur" -ForegroundColor Cyan
    Write-Host "📍 Emplacement: $DestDir" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Pour les mises à jour futures, utilisez:" -ForegroundColor Yellow
    Write-Host "   ssh $VpsHost 'cd $DestDir && git pull && npm run build'" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erreur lors du déploiement: $_" -ForegroundColor Red
    Write-Host "💡 Vérifiez votre connexion SSH et les permissions sur le serveur" -ForegroundColor Yellow
    exit 1
}