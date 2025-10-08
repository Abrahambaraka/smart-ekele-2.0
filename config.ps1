# Configuration de déploiement Smart Ekele
# Modifiez ces variables selon votre configuration

# Informations du serveur
$VPS_HOST = "root@195.35.3.36"  # Votre serveur VPS
$DEST_DIR = "/var/www/smart-ekele"  # Répertoire de destination
$GIT_REPO = "https://github.com/Abrahambaraka/smart-project-app.git"

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

# Fonctions de déploiement rapide
function Deploy-SmartEkele {
    .\deploy.ps1 -VpsHost $VPS_HOST -DestDir $DEST_DIR
}

function Deploy-SmartEkeleGit {
    .\deploy-git.ps1 -VpsHost $VPS_HOST -DestDir $DEST_DIR -GitRepo $GIT_REPO
}

function Update-SmartEkele {
    .\update.ps1 -VpsHost $VPS_HOST -DestDir $DEST_DIR
}

Write-Host "🚀 Commandes de déploiement disponibles:" -ForegroundColor Green
Write-Host "   Deploy-SmartEkeleGit    # Déploiement via Git (recommandé)" -ForegroundColor White
Write-Host "   Deploy-SmartEkele       # Déploiement direct des fichiers" -ForegroundColor White
Write-Host "   Update-SmartEkele       # Mise à jour rapide" -ForegroundColor White
Write-Host ""
Write-Host "💡 Ou utilisez directement:" -ForegroundColor Green
Write-Host "   .\deploy-git.ps1 -VpsHost `"$VPS_HOST`" -DestDir `"$DEST_DIR`"" -ForegroundColor White