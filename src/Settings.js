import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { updateUser, uploadProfilePicture } from './auth';

function Settings({ user, onUpdateUser }) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePicture || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isArabic = i18n.language === 'ar';

  // Validate URL format
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return url.match(/\.(jpeg|jpg|png|gif)$/i); // Ensure it's an image URL
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Update user info
      console.log('Updating user with:', { name, username });
      const updatedUser = await updateUser(user.id, { name, username });
      console.log('User updated successfully:', updatedUser);
      onUpdateUser(updatedUser);

      // Update profile picture URL if provided and valid
      if (profilePictureUrl && isValidUrl(profilePictureUrl)) {
        console.log('Updating profile picture URL:', profilePictureUrl);
        const pictureUrl = await uploadProfilePicture(user.id, profilePictureUrl);
        console.log('Profile picture URL updated:', pictureUrl);
        onUpdateUser({ ...updatedUser, profilePicture: pictureUrl });
      } else if (profilePictureUrl) {
        console.log('Invalid profile picture URL:', profilePictureUrl);
        setError(t('invalid_image_url'));
        return;
      } else {
        console.log('No profile picture URL provided');
      }

      setSuccess(t('settings_updated_successfully'));
    } catch (err) {
      setError(t('error_updating_settings') + ': ' + err.message);
      console.error('Error in handleSubmit:', err);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('settings')}</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-4 mb-4 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('username')}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('profile_picture')}</label>
          <div className="mt-1 flex items-center space-x-4">
            {profilePictureUrl && isValidUrl(profilePictureUrl) ? (
              <img src={profilePictureUrl} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">{t('no_image')}</span>
              </div>
            )}
            <input
              type="text"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
              placeholder={t('enter_image_url')}
              className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
        >
          {t('save_changes')}
        </button>
      </form>

      <footer className="mt-12 text-center text-gray-600 text-sm">
        {t('footer_text')}
      </footer>
    </motion.div>
  );
}

export default Settings;