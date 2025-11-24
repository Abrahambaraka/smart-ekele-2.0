
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className="text-7xl md:text-9xl font-extrabold text-primary-600 dark:text-primary-400">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mt-4">Page non trouvée</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Désolé, la page que vous recherchez n'existe pas.</p>
      <Link 
        to="/"
        className="mt-6 inline-block px-6 py-3 bg-brand-primary text-white font-semibold rounded-md shadow-md hover:bg-brand-secondary transition-colors"
      >
        Retourner à l'accueil
      </Link>
    </div>
  );
};

export default NotFound;