import React from 'react';
import Button from './Button'; // Import Button component
import { useTranslation } from '../TranslationContext'; // Import useTranslation
import Select from './Select'; // Import Select component
import { UserRole } from '../types'; // Import UserRole

interface HeaderProps {
  title: string;
  username: string | null;
  loggedInUserRole: UserRole | null; // New prop
  onLogout: () => void;
  toggleSidebar: () => void; // New prop
  onOpenSettings: () => void; // New prop to open settings modal
}

const Header: React.FC<HeaderProps> = ({ title, username, loggedInUserRole, onLogout, toggleSidebar, onOpenSettings }) => {
  const { t, language, changeLanguage } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
  ];

  return (
    <header className="bg-white shadow p-4 md:p-6 flex items-center justify-between z-30">
      <div className="flex items-center">
        {/* Hamburger menu for mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-4 rounded-md p-1"
          aria-label={t('common.open_sidebar')}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Language Selector */}
        <Select
          id="language-select"
          options={languageOptions}
          value={language}
          onChange={handleLanguageChange}
          className="w-28 text-sm sm:w-32 sm:text-base hidden sm:block"
          aria-label={t('common.language')}
        />
        {/* Personalize Labels Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenSettings}
          aria-label={t('common.personalize_labels')}
          className="hidden sm:inline-flex"
        >
          {t('common.personalize_labels')}
        </Button>

        {username && (
          <span className="text-gray-600 mr-2 text-sm sm:text-base hidden sm:block">
            {t('common.welcome', { username: username })}
            {loggedInUserRole && ` (${t(`roles.${loggedInUserRole.toLowerCase()}`)})`}
          </span>
        )}
        <img
          src="https://picsum.photos/40/40"
          alt={t('common.user_avatar')}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 mr-3"
        />
        <Button variant="danger" size="sm" onClick={onLogout} aria-label={t('common.logout')} className="hidden sm:inline-flex">
          {t('common.logout')}
        </Button>
        {/* Mobile logout button - visible only if space is tight */}
        <button
          onClick={onLogout}
          className="sm:hidden text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 rounded-md p-1"
          aria-label={t('common.logout')}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;