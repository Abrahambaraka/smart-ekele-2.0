# Instructions de déploiement pour Smart Ekele

## 1. Transfert des fichiers vers le VPS

### Option A: Via SCP (si vous avez accès SSH)
```bash
# Compresser le dossier build
tar -czf smart-ekele-build.tar.gz build/

# Transférer vers le VPS
scp smart-ekele-build.tar.gz user@votre-vps-ip:/home/user/

# Se connecter au VPS et extraire
ssh user@votre-vps-ip
tar -xzf smart-ekele-build.tar.gz
```

### Option B: Via FTP/SFTP
- Utilisez FileZilla ou WinSCP pour transférer le contenu du dossier `build/`
- Téléchargez tout le contenu vers `/var/www/smart-ekele/` (ou le répertoire de votre choix)

## 2. Configuration Apache (si vous utilisez Apache)

Créer un nouveau Virtual Host pour smart-ekele :

```apache
<VirtualHost *:80>
    ServerName smart-ekele.votre-domaine.com
    DocumentRoot /var/www/smart-ekele
    
    # Configuration pour React Router
    <Directory /var/www/smart-ekele>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Redirection pour SPA
        FallbackResource /index.html
    </Directory>
    
    # Gestion du cache pour les assets
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
    
    ErrorLog ${APACHE_LOG_DIR}/smart-ekele-error.log
    CustomLog ${APACHE_LOG_DIR}/smart-ekele-access.log combined
</VirtualHost>
```

## 3. Configuration Nginx (si vous utilisez Nginx)

```nginx
server {
    listen 80;
    server_name smart-ekele.votre-domaine.com;
    root /var/www/smart-ekele;
    index index.html;

    # Gestion des fichiers statiques
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pour les assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/smart-ekele-access.log;
    error_log /var/log/nginx/smart-ekele-error.log;
}
```

## 4. Fichier .htaccess (pour Apache)

Si vous ne pouvez pas modifier la configuration du serveur, créez un fichier `.htaccess` dans le répertoire racine :

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Cache des assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

## 5. Configuration SSL (recommandé)

### Pour Apache avec Let's Encrypt :
```bash
sudo certbot --apache -d smart-ekele.votre-domaine.com
```

### Pour Nginx avec Let's Encrypt :
```bash
sudo certbot --nginx -d smart-ekele.votre-domaine.com
```

## 6. Permissions des fichiers

```bash
# Se positionner dans le répertoire web
cd /var/www/smart-ekele

# Définir les bonnes permissions
sudo chown -R www-data:www-data .
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;
```

## 7. Variables d'environnement

Si votre application utilise des variables d'environnement (Supabase, etc.), assurez-vous qu'elles sont correctement configurées dans la build de production.

## 8. Test et activation

1. Redémarrer le serveur web :
   ```bash
   # Apache
   sudo systemctl restart apache2
   
   # Nginx
   sudo systemctl restart nginx
   ```

2. Tester l'accès à votre site : `http://smart-ekele.votre-domaine.com`

## Dépannage courant

- **404 sur les routes** : Vérifiez que la redirection vers `index.html` est bien configurée
- **Fichiers CSS/JS non chargés** : Vérifiez les permissions et les chemins relatifs
- **Erreurs CORS** : Configurez correctement les headers si nécessaire