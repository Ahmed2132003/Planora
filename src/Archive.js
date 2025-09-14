import React, { useState, useEffect } from 'react';
import { getArchivedTasks, searchArchivedTasks } from './auth';

function Archive({ user }) {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('ar'); 
  const [isDarkMode, setIsDarkMode] = useState(false); 

  const translations = {
    ar: {
      title: 'أرشيف Planora',
      month: 'الشهر',
      year: 'السنة',
      fetchArchive: 'عرض الأرشيف',
      searchArchive: 'بحث',
      loading: 'جاري التحميل...',
      taskTitle: 'العنوان',
      taskDescription: 'الوصف',
      createdAt: 'تاريخ الإنشاء',
      status: 'الحالة',
      completed: 'مكتملة',
      pending: 'قيد التنفيذ',
      searchPlaceholder: 'ابحث بالعنوان أو الوصف',
      toggleLanguage: 'English',
      toggleTheme: 'الوضع الداكن',
    },
    en: {
      title: 'Planora Archive',
      month: 'Month',
      year: 'Year',
      fetchArchive: 'Fetch Archive',
      searchArchive: 'Search',
      loading: 'Loading...',
      taskTitle: 'Title',
      taskDescription: 'Description',
      createdAt: 'Created At',
      status: 'Status',
      completed: 'Completed',
      pending: 'Pending',
      searchPlaceholder: 'Search by title or description',
      toggleLanguage: 'العربية',
      toggleTheme: 'Dark Mode',
    },
  };

  const handleFetchArchive = async () => {
    setIsLoading(true);
    try {
      const tasks = await getArchivedTasks(user.id, parseInt(month), parseInt(year));
      setArchivedTasks(tasks);
    } catch (err) {
      console.error('Error fetching archived tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const tasks = await searchArchivedTasks(user.id, searchQuery);
      setArchivedTasks(tasks);
    } catch (err) {
      console.error('Error searching archived tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle('dark');
  };

  return (
    <div className={`reports-container ${isDarkMode ? 'dark' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <style>
        {`
          .reports-container {
            padding: 24px;
            min-height: 100vh;
            transition: background-color 0.3s ease, color 0.3s ease;
            font-family: 'Amiri', Arial, sans-serif;
          }

          .reports-container:not(.dark) {
            background-color: #F9FAFB;
            color: #1F2937;
          }

          .reports-container.dark {
            background-color: #121212;
            color: #E5E7EB;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          h1 {
            font-size: 24px;
            font-weight: bold;
            text-align: ${language === 'ar' ? 'right' : 'left'};
          }

          .input-group {
            margin-bottom: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          input {
            padding: 10px;
            border: 1px solid ${isDarkMode ? '#444' : '#D1D5DB'};
            border-radius: 4px;
            background-color: ${isDarkMode ? '#1E1E1E' : '#FFFFFF'};
            color: ${isDarkMode ? '#E5E7EB' : '#1F2937'};
            font-size: 16px;
            transition: border-color 0.3s ease, background-color 0.3s ease;
          }

          input:focus {
            outline: none;
            border-color: #3A86FF;
            box-shadow: 0 0 5px rgba(58, 134, 255, 0.3);
          }

          button {
            padding: 10px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease, transform 0.2s ease;
          }

          button:hover {
            transform: scale(1.05);
          }

          .generate-button {
            background-color: #3A86FF;
            color: #FFFFFF;
          }

          .generate-button:hover {
            background-color: #2563EB;
          }

          .search-button {
            background-color: #06D6A0;
            color: #FFFFFF;
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .search-button:hover {
            background-color: #059669;
          }

          .toggle-button {
            background-color: ${isDarkMode ? '#4B5563' : '#E5E7EB'};
            color: ${isDarkMode ? '#E5E7EB' : '#1F2937'};
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .toggle-button:hover {
            background-color: ${isDarkMode ? '#6B7280' : '#D1D5DB'};
          }

          .report-item {
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 16px;
            background-color: ${isDarkMode ? '#1E1E1E' : '#FFFFFF'};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.5s ease-in;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .report-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          ul {
            list-style: none;
            padding: 0;
          }

          p {
            margin: 8px 0;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div className="header">
        <h1>{translations[language].title}</h1>
        <div>
          <button className="toggle-button" onClick={toggleLanguage}>
            {translations[language].toggleLanguage}
          </button>
          <button className="toggle-button" onClick={toggleTheme}>
            {translations[language].toggleTheme}
          </button>
        </div>
      </div>
      <div className="input-group">
        <label>{translations[language].month}</label>
        <input
          type="number"
          placeholder={translations[language].month + ' (1-12)'}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full p-2 border rounded mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        <label>{translations[language].year}</label>
        <input
          type="number"
          placeholder={translations[language].year + ' (مثلًا 2025)'}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full p-2 border rounded mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        <button
          className="generate-button"
          onClick={handleFetchArchive}
          disabled={isLoading}
        >
          {translations[language].fetchArchive}
        </button>
      </div>
      <div className="input-group">
        <label>{translations[language].searchArchive}</label>
        <input
          type="text"
          placeholder={translations[language].searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        <button
          className="search-button"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {translations[language].searchArchive}
        </button>
      </div>
      {isLoading && <p>{translations[language].loading}</p>}
      <ul className="space-y-4">
        {archivedTasks.map((task) => (
          <li key={task.id} className="report-item">
            <h3 className="text-lg font-semibold">{translations[language].taskTitle}: {task.title}</h3>
            <p>{translations[language].taskDescription}: {task.description}</p>
            <p>{translations[language].createdAt}: {new Date(task.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
            <p>{translations[language].status}: {task.status === 'completed' ? translations[language].completed : translations[language].pending}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Archive;
