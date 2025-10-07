# Configuration de déploiement Smart Ekele
# Modifiez ces variables selon votre configuration

# Informations du serveur
$VPS_HOST = "user@votre-ip-vps"  # Remplacez par vos infos
$DEST_DIR = "/var/www/smart-ekele"  # Répertoire de destination

# Exemple de configurations courantes :
# $VPS_HOST = "root@192.168.1.100"
# $VPS_HOST = "ubuntu@monserveur.com"
# $DEST_DIR = "/var/www/html/smart-ekele"
# $DEST_DIR = "/home/user/public_html/smart-ekele"

Write-Host "⚙️  Configuration actuelle:" -ForegroundColor Cyan
Write-Host "   Serveur: $VPS_HOST" -ForegroundColor White
Write-Host "   Destination: $DEST_DIR" -ForegroundColor White
Write-Host ""
Write-Host "📝 Pour modifier cette configuration, éditez le fichier config.ps1" -ForegroundColor Yellow
Write-Host ""

# Fonction de déploiement rapide
function Deploy-SmartEkele {
    .\deploy.ps1 -VpsHost $VPS_HOST -DestDir $DEST_DIR
}

Write-Host "🚀 Pour déployer rapidement, utilisez la commande:" -ForegroundColor Green
Write-Host "   Deploy-SmartEkele" -ForegroundColor White
Write-Host ""
Write-Host "💡 Ou utilisez directement:" -ForegroundColor Green
Write-Host "   .\deploy.ps1 -VpsHost `"$VPS_HOST`" -DestDir `"$DEST_DIR`"" -ForegroundColor White