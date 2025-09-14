import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { registerUser, loginUser } from './auth';

function Login({ onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('Personal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError(t('error.password_mismatch'));
          return;
        }
        const user = await registerUser(name, username, email, password, accountType);
        setSuccess(t('success.signup'));
        setError('');
        navigate('/verify-email', { state: { user_id: user.id, email } });
      } else {
        const user = await loginUser(username, password);
        setSuccess(t('success.login', { username: user.username }));
        setError('');
        onLogin(user);
      }
    } catch (err) {
      setError(t('error.' + err.message.toLowerCase().replace(' ', '_')) || err.message);
      setSuccess('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark"
    >
      <div className="bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-lg w-full max-w-md">
        <img
          src="https://i.postimg.cc/N0dZQLy6/planora.jpg"
          alt="Planora Logo"
          className="h-16 mx-auto mb-6"
        />
        <h2 className="text-2xl font-bold mb-6 text-center text-text-light dark:text-text-dark">
          {isRegister ? t('signup') : t('login')}
        </h2>
        <div>
          {isRegister && (
            <>
              <div className="mb-4">
                <label className="block text-text-secondary-light dark:text-text-secondary-dark">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-text-secondary-light dark:text-text-secondary-dark">
                  {t('username')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
                  required
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block text-text-secondary-light dark:text-text-secondary-dark">
              {isRegister ? t('email') : t('username')}
            </label>
            <input
              type={isRegister ? 'email' : 'text'}
              value={isRegister ? email : username}
              onChange={(e) => (isRegister ? setEmail(e.target.value) : setUsername(e.target.value))}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-text-secondary-light dark:text-text-secondary-dark">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
              required
            />
          </div>
          {isRegister && (
            <>
              <div className="mb-4">
                <label className="block text-text-secondary-light dark:text-text-secondary-dark">
                  {t('confirm_password')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-text-secondary-light dark:text-text-secondary-dark">
                  {t('account_type')}
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
                >
                  <option value="Personal">{t('personal')}</option>
                  <option value="Company">{t('company')}</option>
                </select>
              </div>
            </>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-danger-light dark:text-danger-dark mb-4"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-success-light dark:text-success-dark mb-4"
            >
              {success}
            </motion.p>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="w-full bg-primary-light dark:bg-primary-dark text-white p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark"
          >
            {isRegister ? t('create_account') : t('login')}
          </motion.button>
          <p className="mt-4 text-center">
            <button
              className="text-primary-light dark:text-primary-dark hover:underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? t('already_have_account') : t('dont_have_account')}
            </button>
          </p>
          {!isRegister && (
            <p className="mt-2 text-center">
              <Link
                to="/reset-password"
                className="text-primary-light dark:text-primary-dark hover:underline"
              >
                {t('forgot_password')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Login;