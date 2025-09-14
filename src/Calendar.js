import React, { useState } from 'react';
import Calendar from 'react-calendar';
import Tasks from './Tasks';

function PlanoraCalendar({ user }) {
  const [date, setDate] = useState(new Date());
  const [language, setLanguage] = useState('ar'); // حالة اللغة (عربي افتراضي)
  const [isDarkMode, setIsDarkMode] = useState(false); // حالة الدارك مود

  // كائن الترجمة للعربي والإنجليزي
  const translations = {
    ar: {
      title: 'تقويم Planora',
      selectedDate: 'التاريخ المختار',
      toggleLanguage: 'English',
      toggleTheme: 'الوضع الداكن',
    },
    en: {
      title: 'Planora Calendar',
      selectedDate: 'Selected Date',
      toggleLanguage: 'العربية',
      toggleTheme: 'Dark Mode',
    },
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle('dark'); // لتطبيق الدارك مود على ملف CSS خارجي
  };

  return (
    <div className={`calendar-container ${isDarkMode ? 'dark' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <style>
        {`
          .calendar-container {
            padding: 24px;
            min-height: 100vh;
            transition: background-color 0.3s ease, color 0.3s ease;
            font-family: 'Amiri', Arial, sans-serif;
          }

          .calendar-container:not(.dark) {
            background-color: #F9FAFB;
            color: #1F2937;
          }

          .calendar-container.dark {
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
            font-size: 28px;
            font-weight: bold;
            text-align: ${language === 'ar' ? 'right' : 'left'};
            animation: fadeIn 0.5s ease-in;
          }

          .calendar-wrapper {
            max-width: 400px;
            margin: 0 auto 24px;
            padding: 16px;
            background-color: ${isDarkMode ? '#1E1E1E' : '#FFFFFF'};
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease, transform 0.3s ease;
          }

          .calendar-wrapper:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          .react-calendar {
            background-color: ${isDarkMode ? '#1E1E1E' : '#FFFFFF'};
            color: ${isDarkMode ? '#E5E7EB' : '#1F2937'};
            border: 1px solid ${isDarkMode ? '#444' : '#D1D5DB'};
            border-radius: 8px;
            font-family: 'Amiri', Arial, sans-serif;
          }

          .react-calendar__tile--active {
            background-color: #3A86FF !important;
            color: #FFFFFF !important;
          }

          .react-calendar__tile--now {
            background-color: ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
          }

          .react-calendar__navigation button {
            color: ${isDarkMode ? '#E5E7EB' : '#1F2937'};
            background-color: ${isDarkMode ? '#2A2A3E' : '#F9FAFB'};
            transition: background-color 0.3s ease;
          }

          .react-calendar__navigation button:hover {
            background-color: ${isDarkMode ? '#4B5563' : '#E5E7EB'};
          }

          p {
            margin: 16px 0;
            font-size: 16px;
            text-align: ${language === 'ar' ? 'right' : 'left'};
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

          .toggle-button {
            background-color: ${isDarkMode ? '#4B5563' : '#E5E7EB'};
            color: ${isDarkMode ? '#E5E7EB' : '#1F2937'};
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .toggle-button:hover {
            background-color: ${isDarkMode ? '#6B7280' : '#D1D5DB'};
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
      <div className="calendar-wrapper">
        <Calendar
          onChange={(newDate) => {
            console.log('Selected date:', newDate);
            setDate(newDate);
          }}
          value={date}
          locale={language === 'ar' ? 'ar-EG' : 'en-US'}
          className="react-calendar"
        />
        <p>
          {translations[language].selectedDate}: {date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </p>
      </div>
      <Tasks user={user} selectedDate={date} />
    </div>
  );
}

export default PlanoraCalendar;