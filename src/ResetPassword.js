import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { requestPasswordReset, resetPassword } from './auth';

function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async () => {
    try {
      const response = await requestPasswordReset(email);
      setSuccess(t('success.reset_request'));
      setError('');
      setUserId(response.user_id);
      setStep(2);
    } catch (err) {
      setError(t('error.' + err.message.toLowerCase().replace(' ', '_')) || err.message);
      setSuccess('');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setError(t('error.password_mismatch'));
      return;
    }
    try {
      await resetPassword(userId, code, newPassword);
      setSuccess(t('success.reset_success'));
      setError('');
      setTimeout(() => navigate('/'), 2000);
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
          {t('reset_password')}
        </h2>
        {step === 1 ? (
          <>
            <div className="mb-4">
              <label className="block text-text-secondary-light dark:text-text-secondary-dark">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
                required
              />
            </div>
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
              onClick={handleRequestReset}
              className="w-full bg-primary-light dark:bg-primary-dark text-white p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark"
            >
              {t('submit')}
            </motion.button>
            <p className="mt-4 text-center">
              <Link
                to="/"
                className="text-primary-light dark:text-primary-dark hover:underline"
              >
                {t('already_have_account')}
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-text-secondary-light dark:text-text-secondary-dark">
                {t('verification_code')}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-text-secondary-light dark:text-text-secondary-dark">
                {t('new_password')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-text-secondary-light dark:text-text-secondary-dark">
                {t('confirm_password')}
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-text-dark dark:border-gray-600"
                required
              />
            </div>
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
              onClick={handleResetPassword}
              className="w-full bg-primary-light dark:bg-primary-dark text-white p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark"
            >
              {t('reset_password')}
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default ResetPassword;