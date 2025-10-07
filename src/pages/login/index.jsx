import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import LanguageSelector from './components/LanguageSelector';
import SecurityNotice from './components/SecurityNotice';
import CredentialsHelper from './components/CredentialsHelper';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/administrator-dashboard');
    }

    // Set page title
    document.title = 'Connexion - Smart Ekele';
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Language Selector */}
          <div className="mb-8">
            <LanguageSelector />
          </div>

          {/* Main Login Card */}
          <div className="bg-card border border-border rounded-2xl p-8 elevation-2 backdrop-blur-subtle">
            {/* Header */}
            <LoginHeader />

            {/* Login Form */}
            <LoginForm />

            {/* Demo Credentials Helper */}
            <CredentialsHelper />
          </div>

          {/* Security Notice */}
          <SecurityNotice />

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>© {new Date()?.getFullYear()} Smart Ekele. Tous droits réservés.</p>
              <div className="flex items-center justify-center space-x-4">
                <a href="#" className="hover:text-foreground transition-micro">
                  Conditions d'utilisation
                </a>
                <span>•</span>
                <a href="#" className="hover:text-foreground transition-micro">
                  Politique de confidentialité
                </a>
                <span>•</span>
                <a href="#" className="hover:text-foreground transition-micro">
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;