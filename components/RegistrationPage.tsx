import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select'; // Import Select for role selection
import { useTranslation } from '../TranslationContext';
import { User, UserRole } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void; // Modified to accept User object
  users: User[]; // All registered users
  onAddUser: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, users, onAddUser }) => {
  const { t } = useTranslation();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(''); // New for registration
  const [role, setRole] = useState<UserRole>(UserRole.Sales); // Default role for registration
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setRole(UserRole.Sales);
    setErrors({});
  };

  const validateLogin = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) newErrors.email = t('auth_page.email_required');
    if (!password) newErrors.password = t('auth_page.password_required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: { [key: string]: string } = {};
    if (!username.trim()) newErrors.username = t('auth_page.username_required');
    if (!email.trim()) newErrors.email = t('auth_page.email_required');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth_page.email_invalid');
    else if (users.some(u => u.email === email)) newErrors.email = t('auth_page.email_already_registered');
    if (!password) newErrors.password = t('auth_page.password_required');
    else if (password.length < 6) newErrors.password = t('auth_page.password_length');
    if (!confirmPassword) newErrors.confirmPassword = t('auth_page.confirm_password_required');
    if (password !== confirmPassword) newErrors.confirmPassword = t('auth_page.passwords_not_match');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLogin()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          onAuthSuccess(user);
        } else {
          setErrors(prev => ({ ...prev, general: t('auth_page.invalid_credentials') }));
        }
        setLoading(false);
      }, 1500);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateRegister()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          username,
          email,
          password,
          role,
        };
        onAddUser(newUser);
        onAuthSuccess(newUser); // Log in new user immediately
        setLoading(false);
      }, 1500);
    }
  };

  const roleOptions = Object.values(UserRole).map(r => ({
    value: r,
    label: t(`roles.${r.toLowerCase()}`),
  }));

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Button
            variant={isLoginView ? 'primary' : 'secondary'}
            onClick={() => { setIsLoginView(true); clearForm(); }}
            className="mr-2"
          >
            {t('auth_page.login_tab')}
          </Button>
          <Button
            variant={!isLoginView ? 'primary' : 'secondary'}
            onClick={() => { setIsLoginView(false); clearForm(); }}
            className="ml-2"
          >
            {t('auth_page.register_tab')}
          </Button>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isLoginView ? t('auth_page.login_title') : t('auth_page.register_title')}
        </h2>

        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errors.general}</span>
          </div>
        )}

        <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} aria-label={isLoginView ? t('auth_page.login_title') : t('auth_page.register_title')}>
          {!isLoginView && (
            <Input
              id="username"
              label={t('auth_page.username_label')}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              disabled={loading}
              aria-required="true"
            />
          )}
          <Input
            id="email"
            label={t('auth_page.email_label')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={loading}
            aria-required="true"
          />
          <Input
            id="password"
            label={t('auth_page.password_label')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
            aria-required="true"
          />
          {!isLoginView && (
            <>
              <Input
                id="confirmPassword"
                label={t('auth_page.confirm_password_label')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                disabled={loading}
                aria-required="true"
              />
              <Select
                id="role"
                label={t('auth_page.role_label')}
                options={roleOptions}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={loading}
              />
            </>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full mt-6 py-3"
            loading={loading}
            disabled={loading}
          >
            {isLoginView ? t('auth_page.login_button') : t('auth_page.register_button')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;