# Script de déploiement PowerShell pour Smart Ekele
# Usage: .\deploy.ps1 -VpsHost "user@ip" -DestDir "/var/www/smart-ekele"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$true)]
    [string]$DestDir,
    
    [string]$BuildDir = ".\build"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "smart-ekele-$timestamp.tar.gz"

Write-Host "📦 Création de l'archive de déploiement..." -ForegroundColor Yellow

# Vérifier que le dossier build existe
if (-not (Test-Path $BuildDir)) {
    Write-Host "❌ Erreur: Le dossier build n'existe pas. Lancez 'npm run build' d'abord." -ForegroundColor Red
    exit 1
}

# Créer l'archive
try {
    tar -czf $archiveName -C $BuildDir .
    Write-Host "✅ Archive créée: $archiveName" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création de l'archive: $_" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Transfert vers le VPS ($VpsHost)..." -ForegroundColor Yellow

# Transférer l'archive
try {
    scp $archiveName "${VpsHost}:/tmp/"
    Write-Host "✅ Fichier transféré avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du transfert: $_" -ForegroundColor Red
    Remove-Item $archiveName -Force
    exit 1
}

Write-Host "🚀 Déploiement sur le serveur..." -ForegroundColor Yellow

# Commandes de déploiement sur le serveur
$deployCommands = @"
# Créer le répertoire de destination
sudo mkdir -p '$DestDir'

# Sauvegarder l'ancienne version si elle existe
if [ -d '$DestDir' ] && [ "`$(ls -A '$DestDir' 2>/dev/null)" ]; then
    echo '📦 Sauvegarde de l'ancienne version...'
    sudo mv '$DestDir' '${DestDir}_backup_$timestamp'
    sudo mkdir -p '$DestDir'
fi

# Se positionner et extraire
cd '$DestDir'
echo '📂 Extraction des fichiers...'
sudo tar -xzf '/tmp/$archiveName' .

# Définir les permissions
echo '🔐 Configuration des permissions...'
sudo chown -R www-data:www-data .
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;

# Nettoyer le fichier temporaire
rm '/tmp/$archiveName'

# Redémarrer le serveur web
if systemctl is-active --quiet apache2; then
    echo '🔄 Redémarrage d''Apache...'
    sudo systemctl restart apache2
    echo '✅ Apache redémarré avec succès'
elif systemctl is-active --quiet nginx; then
    echo '🔄 Redémarrage de Nginx...'
    sudo systemctl restart nginx
    echo '✅ Nginx redémarré avec succès'
else
    echo '⚠️  Aucun serveur web détecté (Apache/Nginx)'
fi

echo '✅ Déploiement terminé dans $DestDir'
"@

# Exécuter les commandes sur le serveur
try {
    ssh $VpsHost $deployCommands
    Write-Host "✅ Déploiement réussi sur le serveur !" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du déploiement: $_" -ForegroundColor Red
    Remove-Item $archiveName -Force
    exit 1
}

# Nettoyer l'archive locale
Remove-Item $archiveName -Force
Write-Host "🧹 Nettoyage terminé" -ForegroundColor Green

Write-Host "`n🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "🌐 Votre site Smart Ekele est maintenant en ligne" -ForegroundColor Cyan
Write-Host "📍 Emplacement: $DestDir sur $VpsHost" -ForegroundColor Cyan