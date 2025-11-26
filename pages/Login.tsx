
import React, { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, signUpSchema, type LoginForm, type SignUpForm } from '../lib/validation';
import FormInput from '../components/FormInput';

// --- Icon Components ---
const iconProps = {
  className: "w-5 h-5",
};

const UserIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const SchoolIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
);

// --- Button Component ---
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', className = '', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 text-white font-semibold bg-brand-primary rounded-md shadow-sm hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-px ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// Les champs d'entrée sont maintenant fournis par components/FormInput avec gestion d'erreurs/a11y.

// --- Logo Component ---
const Logo: React.FC = () => (
    <div className="flex items-center justify-center mb-4 text-center">
        <SchoolIcon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary" />
        <span className="ml-2 sm:ml-3 text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Smart Ekele</span>
    </div>
);


// --- AuthForm Component ---
const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formError, setFormError] = useState<string>('');

  const { login, register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm & Partial<SignUpForm>>({
    resolver: zodResolver(isSignUp ? signUpSchema : loginSchema),
    mode: 'onBlur',
  });

  const handleToggleMode = () => {
    setIsSignUp(prev => !prev);
  };

  useEffect(() => {
    // Réinitialiser le formulaire quand on change de mode
    reset();
    setFormError('');
  }, [isSignUp, reset]);

  const onSubmit = async (data: LoginForm & Partial<SignUpForm>) => {
    setFormError('');
    if (isSignUp) {
      const { email, password, fullName, schoolName } = data;
      const { error } = await registerAuth(email, password, fullName!, schoolName!);
      if (error) {
        setFormError(`Erreur d'inscription: ${error.message}`);
        return;
      }
      // Succès: on peut naviguer ou afficher un message de succès silencieux
      // navigate('/'); // décommentez si nécessaire
    } else {
      const { email, password } = data;
      const { error } = await login(email, password);
      if (error) {
        setFormError(`Erreur de connexion: ${error.message}`);
        return;
      }
      // navigate('/'); // optionnel
    }
  };
  
  return (
    <div className="w-full animate-fade-in-up">
      <Logo />
      <h1 className="mb-2 text-xl sm:text-2xl font-bold text-gray-800 dark:text-white text-center">{isSignUp ? 'Créer une école' : 'Connexion'}</h1>
      <p className="mb-6 sm:mb-8 text-md font-light text-gray-500 dark:text-gray-300 text-center">
        {isSignUp ? 'Inscrivez votre établissement et commencez.' : 'Heureux de vous revoir !'}
      </p>

      {formError && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
          {formError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {isSignUp && (
          <div className="animate-fade-in space-y-4">
                <FormInput
                  id="fullName"
                  label="Nom complet (Directeur)"
                  type="text"
                  placeholder="Jean Dupont"
                  icon={<UserIcon />}
                  error={errors.fullName?.message as string}
                  {...register('fullName')}
                />
                <FormInput
                  id="schoolName"
                  label="Nom de l'école"
                  type="text"
                  placeholder="Collège Saint-Joseph"
                  icon={<SchoolIcon className="w-5 h-5" />}
                  error={errors.schoolName?.message as string}
                  {...register('schoolName')}
                />
            </div>
        )}
        
        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="vous@example.com"
          icon={<MailIcon />}
          error={errors.email?.message as string}
          {...register('email')}
        />
        
        <FormInput
          id="password"
          label="Mot de passe"
          type="password"
          placeholder="Entrez votre mot de passe"
          icon={<LockIcon />}
          error={errors.password?.message as string}
          {...register('password')}
        />
        
        {isSignUp && (
            <div className="animate-fade-in">
                <FormInput
                  id="confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  icon={<LockIcon />}
                  error={errors.confirmPassword?.message as string}
                  {...register('confirmPassword')}
                />
            </div>
        )}

        {!isSignUp && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-secondary dark:focus:ring-brand-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-300">Se souvenir de moi</label>
            </div>
            <a href="#" className="text-sm font-medium text-brand-primary hover:underline dark:text-brand-secondary">Mot de passe oublié?</a>
          </div>
        )}
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              Traitement...
            </span>
          ) : (
            isSignUp ? 'Créer mon école' : 'Se connecter'
          )}
        </Button>
      </form>
      
      <div className="mt-6 sm:mt-8 text-center text-sm text-gray-600 dark:text-gray-300">
        {isSignUp ? 'Vous avez déjà un compte?' : "Première visite ?"}
        <button onClick={handleToggleMode} className="font-semibold text-brand-primary hover:underline ml-1">
          {isSignUp ? 'Se connecter' : 'Créer une école'}
        </button>
      </div>
      
      <div className="mt-4 text-center text-xs text-slate-400">
        <p>Note: En créant un compte, vous deviendrez automatiquement Directeur de la nouvelle école créée.</p>
      </div>

    </div>
  );
};

// --- Illustration Component ---
const Illustration = () => (
  <div className="hidden lg:flex lg:flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-blue-900 text-white p-12 rounded-r-2xl">
    <div className="w-full max-w-md text-center">
      <SchoolIcon className="w-32 h-32 mx-auto mb-6" />
      <h1 className="text-4xl font-bold mb-4">Bienvenue sur Smart Ekele</h1>
      <p className="text-lg opacity-80">
        La plateforme tout-en-un pour une gestion scolaire simplifiée et efficace. Connectez parents, professeurs et administration.
      </p>
    </div>
  </div>
);

// --- Main Page Component ---
const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex flex-col m-2 sm:m-6 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl md:flex-row md:space-y-0 w-full max-w-4xl overflow-hidden">
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-14 w-full lg:w-1/2">
            <AuthForm />
        </div>
        <Illustration />
      </div>
    </div>
  );
};

export default Login;
