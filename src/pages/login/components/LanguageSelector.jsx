import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState('fr');

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ];

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    
    // In a real app, this would trigger app-wide language change
    console.log(`Language changed to: ${languageCode}`);
  };

  const currentLang = languages?.find(lang => lang?.code === currentLanguage);

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="flex items-center space-x-2">
        <Icon name="Globe" size={16} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Langue:</span>
      </div>
      <div className="flex items-center space-x-2">
        {languages?.map((language) => (
          <button
            key={language?.code}
            onClick={() => handleLanguageChange(language?.code)}
            className={`
              flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm
              transition-micro hover:bg-muted
              ${currentLanguage === language?.code 
                ? 'bg-primary/10 text-primary font-medium' :'text-muted-foreground hover:text-foreground'
              }
            `}
            aria-label={`Changer la langue vers ${language?.label}`}
          >
            <span className="text-base">{language?.flag}</span>
            <span>{language?.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;