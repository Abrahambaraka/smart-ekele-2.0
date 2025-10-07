import React from 'react';
import Icon from '../../../components/AppIcon';


const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo Section */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center elevation-2">
            <Icon name="GraduationCap" size={32} className="text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground">Smart Ekele</h1>
            <p className="text-sm text-muted-foreground">Système de Gestion Scolaire</p>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Bienvenue
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Connectez-vous à votre compte pour accéder à votre tableau de bord personnalisé
        </p>
      </div>

      {/* Features Preview */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/50">
          <Icon name="Users" size={20} className="text-primary" />
          <span className="text-xs text-muted-foreground">Gestion</span>
        </div>
        <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/50">
          <Icon name="BookOpen" size={20} className="text-primary" />
          <span className="text-xs text-muted-foreground">Classes</span>
        </div>
        <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/50">
          <Icon name="CreditCard" size={20} className="text-primary" />
          <span className="text-xs text-muted-foreground">Paiements</span>
        </div>
        <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/50">
          <Icon name="BarChart3" size={20} className="text-primary" />
          <span className="text-xs text-muted-foreground">Rapports</span>
        </div>
      </div>
    </div>
  );
};

export default LoginHeader;