import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CredentialsHelper = () => {
  const [isVisible, setIsVisible] = useState(false);

  const mockCredentials = [
    {
      role: 'Administrateur',
      email: 'admin@smartekele.fr',
      password: 'Admin123!',
      icon: 'Shield',
      color: 'text-primary'
    },
    {
      role: 'Enseignant',
      email: 'prof@smartekele.fr',
      password: 'Prof123!',
      icon: 'BookOpen',
      color: 'text-accent'
    },
    {
      role: 'Étudiant',
      email: 'etudiant@smartekele.fr',
      password: 'Etudiant123!',
      icon: 'UserCheck',
      color: 'text-success'
    },
    {
      role: 'Parent',
      email: 'parent@smartekele.fr',
      password: 'Parent123!',
      icon: 'Heart',
      color: 'text-warning'
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text)?.then(() => {
      console.log('Copied to clipboard:', text);
    });
  };

  return (
    <div className="mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        iconName={isVisible ? 'ChevronUp' : 'ChevronDown'}
        iconPosition="right"
        className="w-full justify-center"
      >
        Identifiants de démonstration
      </Button>
      {isVisible && (
        <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Info" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              Comptes de test disponibles
            </span>
          </div>

          {mockCredentials?.map((credential, index) => (
            <div key={index} className="p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name={credential?.icon} size={16} className={credential?.color} />
                <span className="text-sm font-medium text-foreground">
                  {credential?.role}
                </span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">E-mail:</span>
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 bg-muted rounded text-foreground">
                      {credential?.email}
                    </code>
                    <button
                      onClick={() => copyToClipboard(credential?.email)}
                      className="p-1 hover:bg-muted rounded transition-micro"
                      title="Copier l'e-mail"
                    >
                      <Icon name="Copy" size={12} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mot de passe:</span>
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 bg-muted rounded text-foreground">
                      {credential?.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(credential?.password)}
                      className="p-1 hover:bg-muted rounded transition-micro"
                      title="Copier le mot de passe"
                    >
                      <Icon name="Copy" size={12} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={14} className="text-warning" />
              <span className="text-xs text-warning">
                Ces identifiants sont uniquement pour la démonstration
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialsHelper;