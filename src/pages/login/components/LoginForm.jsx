import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials for easy testing
  const demoCredentials = [
    { email: 'admin@smartekele.fr', password: 'Admin123!', role: 'Super Admin' },
    { email: 'ecole1@smartekele.fr', password: 'Ecole123!', role: 'École Primaire' },
    { email: 'college@smartekele.fr', password: 'College123!', role: 'Collège' },
    { email: 'prof@smartekele.fr', password: 'Prof123!', role: 'Enseignant' },
    { email: 'parent@smartekele.fr', password: 'Parent123!', role: 'Parent' }
  ];

  const roleOptions = [
    { value: '', label: 'Sélectionnez votre rôle' },
    { value: 'super_admin', label: 'Super Administrateur' },
    { value: 'school_admin', label: 'Administrateur École' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'parent', label: 'Parent' },
    { value: 'student', label: 'Étudiant' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email?.trim()) {
      newErrors.email = 'L\'adresse e-mail est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Format d\'e-mail invalide';
    }

    if (!formData?.password?.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Role selection is now optional for login
    // Users can login and their role will be fetched from the database

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);

      if (error) {
        // Handle Supabase auth errors
        let errorMessage = 'Erreur de connexion. Veuillez réessayer.';
        
        if (error?.message?.includes('Invalid login credentials')) {
          errorMessage = 'Identifiants incorrects. Vérifiez votre email et mot de passe.';
        } else if (error?.message?.includes('Email not confirmed')) {
          errorMessage = 'Veuillez confirmer votre adresse email avant de vous connecter.';
        } else if (error?.message?.includes('Too many requests')) {
          errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.';
        } else if (error?.message?.includes('User not found')) {
          errorMessage = 'Compte utilisateur non trouvé. Veuillez vérifier votre email.';
        } else if (error?.message?.includes('Invalid email')) {
          errorMessage = 'Format d\'email invalide.';
        }
        
        setErrors({
          general: errorMessage
        });
        return;
      }

      if (data?.user) {
        console.log('Login successful, user:', data?.user?.id);
        
        // Set authentication flag in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        
        // Navigate to dashboard
        navigate('/administrator-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({
        general: 'Erreur de réseau. Vérifiez votre connexion internet et réessayez.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (credentials) => {
    setFormData({
      email: credentials?.email,
      password: credentials?.password,
      role: '' // Reset role selection
    });
    // Clear any existing errors
    setErrors({});
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Message */}
        {errors?.general && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
              <p className="text-sm text-error">{errors?.general}</p>
            </div>
          </div>
        )}

        {/* Email Field */}
        <Input
          label="Adresse e-mail"
          type="email"
          placeholder="votre.email@smartekele.fr"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
          className="w-full"
          autoComplete="email"
        />

        {/* Password Field */}
        <div className="relative">
          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            placeholder="Entrez votre mot de passe"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
            className="w-full pr-12"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 p-1 rounded hover:bg-muted transition-micro"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <Icon 
              name={showPassword ? 'EyeOff' : 'Eye'} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
        </div>

        {/* Role Selection - Optional */}
        <Select
          label="Rôle (optionnel)"
          options={roleOptions}
          value={formData?.role}
          onChange={(value) => handleInputChange('role', value)}
          error={errors?.role}
          placeholder="Sélectionnez votre rôle"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground -mt-2">
          * Votre rôle sera automatiquement déterminé selon votre compte
        </p>

        {/* Login Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading || loading}
          iconName="LogIn"
          iconPosition="right"
          disabled={isLoading || loading}
        >
          {isLoading || loading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:text-primary/80 transition-micro"
          >
            Mot de passe oublié ?
          </button>
        </div>
      </form>

      {/* Demo Credentials Section */}
      <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-muted">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Key" size={16} className="mr-2 text-primary" />
          Identifiants de démonstration
        </h3>
        <div className="space-y-3">
          {demoCredentials?.map((cred, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-background rounded border">
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{cred?.role}</div>
                <div className="text-xs text-muted-foreground">{cred?.email}</div>
                <div className="text-xs text-muted-foreground font-mono">{cred?.password}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(cred)}
                className="ml-3"
              >
                Utiliser
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          * Cliquez sur "Utiliser" pour remplir automatiquement les champs de connexion
        </p>
      </div>
    </div>
  );
};

export default LoginForm;