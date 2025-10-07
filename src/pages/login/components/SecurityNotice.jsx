import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityNotice = () => {
  return (
    <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
      <div className="flex items-start space-x-3">
        <Icon name="Shield" size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Sécurité et Confidentialité
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Vos données sont protégées par un chiffrement de niveau bancaire</p>
            <p>• Conforme aux normes RGPD européennes</p>
            <p>• Authentification sécurisée avec gestion des sessions</p>
            <p>• Sauvegarde automatique toutes les 24 heures</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Version 2.1.0</span>
          <span>Dernière mise à jour: 15/09/2025</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice;