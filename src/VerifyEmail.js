import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { verifyEmail } from './auth';

function VerifyEmail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user_id, email } = location.state || {};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // التحقق من وجود user_id و email
  if (!user_id || !email) {
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
            {t('verify_email')}
          </h2>
          <p className="text-danger-light dark:text-danger-dark mb-4 text-center">
            {t('error.invalid_verification_data')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary-light dark:bg-primary-dark text-white p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark"
          >
            {t('back_to_login')}
          </button>
        </div>
      </motion.div>
    );
  }

  const handleVerify = async () => {
    if (!code.trim()) {
      setError(t('error.verification_code_required'));
      setSuccess('');
      return;
    }

    try {
      console.log('Attempting to verify email with user_id:', user_id, 'and code:', code);
      await verifyEmail(user_id, code);
      setSuccess(t('success.verify'));
      setError('');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Verification error:', err);
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
          {t('verify_email')}
        </h2>
        <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mb-4">
          {t('verification_code_sent', { email })}
        </p>
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
          onClick={handleVerify}
          className="w-full bg-primary-light dark:bg-primary-dark text-white p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark"
        >
          {t('verify')}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default VerifyEmail;