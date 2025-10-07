#!/bin/bash

# Script de déploiement automatique pour Smart Ekele
# Usage: ./deploy.sh [user@vps-ip] [répertoire-destination]

if [ $# -lt 2 ]; then
    echo "Usage: $0 <user@vps-ip> <répertoire-destination>"
    echo "Exemple: $0 root@192.168.1.100 /var/www/smart-ekele"
    exit 1
fi

VPS_HOST=$1
DEST_DIR=$2
BUILD_DIR="./build"
ARCHIVE_NAME="smart-ekele-$(date +%Y%m%d_%H%M%S).tar.gz"

echo "📦 Création de l'archive..."
tar -czf "$ARCHIVE_NAME" -C "$BUILD_DIR" .

echo "📤 Transfert vers le VPS..."
scp "$ARCHIVE_NAME" "$VPS_HOST:/tmp/"

echo "🚀 Déploiement sur le VPS..."
ssh "$VPS_HOST" << EOF
    # Créer le répertoire de destination si nécessaire
    sudo mkdir -p "$DEST_DIR"
    
    # Sauvegarder l'ancienne version si elle existe
    if [ -d "$DEST_DIR" ] && [ "$(ls -A $DEST_DIR)" ]; then
        sudo mv "$DEST_DIR" "${DEST_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        sudo mkdir -p "$DEST_DIR"
    fi
    
    # Extraire la nouvelle version
    cd "$DEST_DIR"
    sudo tar -xzf "/tmp/$ARCHIVE_NAME" .
    
    # Définir les bonnes permissions
    sudo chown -R www-data:www-data .
    sudo find . -type d -exec chmod 755 {} \;
    sudo find . -type f -exec chmod 644 {} \;
    
    # Nettoyer le fichier temporaire
    rm "/tmp/$ARCHIVE_NAME"
    
    # Redémarrer le serveur web
    if systemctl is-active --quiet apache2; then
        sudo systemctl restart apache2
        echo "✅ Apache redémarré"
    elif systemctl is-active --quiet nginx; then
        sudo systemctl restart nginx
        echo "✅ Nginx redémarré"
    fi
    
    echo "✅ Déploiement terminé dans $DEST_DIR"
EOF

# Nettoyer l'archive locale
rm "$ARCHIVE_NAME"

echo "🎉 Déploiement réussi !"
echo "🌐 Votre site devrait être accessible à l'adresse configurée"