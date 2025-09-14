
import React, { useState, useEffect } from 'react';
import { getReport } from './auth';
import { jsPDF } from 'jspdf';

function Reports({ user }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('ar'); 
  const [isDarkMode, setIsDarkMode] = useState(false); 

  
  const translations = {
    ar: {
      title: 'تقارير Planora',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ النهاية',
      generateReport: 'إنشاء تقرير',
      loading: 'جاري التحميل...',
      reportSummary: 'ملخص التقرير',
      totalTasks: 'إجمالي المهام',
      completedTasks: 'المهام المكتملة',
      pendingTasks: 'المهام قيد التنفيذ',
      taskDetails: 'تفاصيل المهام',
      taskTitle: 'العنوان',
      taskDescription: 'الوصف',
      startTime: 'تاريخ البداية',
      endTime: 'تاريخ النهاية',
      status: 'الحالة',
      completed: 'مكتملة',
      pending: 'قيد التنفيذ',
      exportPDF: 'تصدير PDF',
      exportDOCX: 'تصدير DOCX',
      toggleLanguage: 'English',
      toggleTheme: 'الوضع الداكن',
      notSpecified: '', 
      errorGenerate: 'حدث خطأ أثناء إنشاء التقرير',
      errorExportPDF: 'حدث خطأ أثناء تصدير PDF',
      errorExportDOCX: 'حدث خطأ أثناء تصدير DOCX',
      footer: '© Creativity Code 2025',
    },
    en: {
      title: 'Planora Reports',
      startDate: 'Start Date',
      endDate: 'End Date',
      generateReport: 'Generate Report',
      loading: 'Loading...',
      reportSummary: 'Report Summary',
      totalTasks: 'Total Tasks',
      completedTasks: 'Completed Tasks',
      pendingTasks: 'Pending Tasks',
      taskDetails: 'Task Details',
      taskTitle: 'Title',
      taskDescription: 'Description',
      startTime: 'Start Time',
      endTime: 'End Time',
      status: 'Status',
      completed: 'Completed',
      pending: 'Pending',
      exportPDF: 'Export PDF',
      exportDOCX: 'Export DOCX',
      toggleLanguage: 'العربية',
      toggleTheme: 'Dark Mode',
      notSpecified: '', 
      errorGenerate: 'An error occurred while generating the report',
      errorExportPDF: 'An error occurred while exporting PDF',
      errorExportDOCX: 'An error occurred while exporting DOCX',
      footer: '© Creativity Code 2025',
    },
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const reportData = await getReport(user.id, startDate, endDate);
      setReport(reportData);
    } catch (err) {
      console.error('Error generating report:', err);
      alert(translations[language].errorGenerate);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!report) return;
    setIsLoading(true);
    try {
      const fontBase64 = await window.electronAPI.getFontBase64();
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.setFont('Amiri');

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - 2 * margin;

      const addPageContent = (yStart) => {
        
        doc.setLineWidth(0.5);
        doc.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5));

        doc.setLanguage(language === 'ar' ? 'ar' : 'en');
        doc.setFontSize(24);
        doc.text(translations[language].title, language === 'ar' ? pageWidth - margin : margin, yStart, { align: language === 'ar' ? 'right' : 'left' });
        let y = yStart + 15;

        doc.setFontSize(12);
        doc.text(
          `${translations[language].startDate}: ${startDate} ${translations[language].endDate}: ${endDate}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left' }
        );
        y += 8;
        doc.text(
          `${translations[language].totalTasks}: ${report.summary.total}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left' }
        );
        y += 8;
        doc.text(
          `${translations[language].completedTasks}: ${report.summary.completed}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left' }
        );
        y += 8;
        doc.text(
          `${translations[language].pendingTasks}: ${report.summary.pending}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left' }
        );
        y += 15;

        doc.setFontSize(24);
        doc.text(
          translations[language].taskDetails,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left' }
        );
        y += 10;

        return y;
      };

      let y = addPageContent(margin + 10);

      doc.setFontSize(12);
      report.tasks.forEach((task, index) => {
        if (y > pageHeight - margin - 20) {
          doc.setFontSize(10);
          doc.text(
            translations[language].footer,
            language === 'ar' ? pageWidth - margin : margin,
            pageHeight - margin,
            { align: language === 'ar' ? 'right' : 'left' }
          );
          doc.addPage();
          y = addPageContent(margin);
        }

        doc.setFontSize(24);
        doc.text(
          `${index + 1}. ${translations[language].taskTitle}: ${task.title || ''}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left', maxWidth: contentWidth }
        );
        y += 10;
        doc.setFontSize(12);
        doc.text(
          `${translations[language].taskDescription}: ${task.description || ''}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left', maxWidth: contentWidth }
        );
        y += 8;
        doc.text(
          `${translations[language].startTime}: ${task.start_time ? new Date(task.start_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left', maxWidth: contentWidth }
        );
        y += 8;
        doc.text(
          `${translations[language].endTime}: ${task.end_time ? new Date(task.end_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left', maxWidth: contentWidth }
        );
        y += 8;
        doc.text(
          `${translations[language].status}: ${task.status === 'completed' ? translations[language].completed : translations[language].pending}`,
          language === 'ar' ? pageWidth - margin : margin,
          y,
          { align: language === 'ar' ? 'right' : 'left', maxWidth: contentWidth }
        );
        y += 10;

        y += 10; 
      });

      doc.setFontSize(10);
      doc.text(
        translations[language].footer,
        language === 'ar' ? pageWidth - margin : margin,
        pageHeight - margin,
        { align: language === 'ar' ? 'right' : 'left' }
      );

      const fileName = `report_${startDate}_to_${endDate}.pdf`;
      const saveResult = await window.electronAPI.showSaveDialog({
        defaultPath: fileName,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      });

      if (saveResult && !saveResult.canceled && saveResult.filePath) {
        doc.save(saveResult.filePath);
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert(translations[language].errorExportPDF);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToDOCX = async () => {
    if (!report) return;
    setIsLoading(true);
    try {
      const filePath = await window.electronAPI.exportDocx({ start_date: startDate, end_date: endDate, report, language });
      if (filePath) {
        const link = document.createElement('a');
        link.href = `file://${filePath}`;
        link.download = `report_${startDate}_to_${endDate}.docx`;
        link.click();
      }
    } catch (err) {
      console.error('Error exporting DOCX:', err);
      alert(translations[language].errorExportDOCX);
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

          .export-pdf-button {
            background-color: #06D6A0;
            color: #FFFFFF;
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .export-pdf-button:hover {
            background-color: #059669;
          }

          .export-docx-button {
            background-color: #06D6A0;
            color: #FFFFFF;
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .export-docx-button:hover {
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
        <label>{translations[language].startDate}</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>{translations[language].endDate}</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          className="generate-button"
          onClick={handleGenerateReport}
          disabled={isLoading}
        >
          {translations[language].generateReport}
        </button>
      </div>
      {isLoading && <p>{translations[language].loading}</p>}
      {report && (
        <div>
          <h2>{translations[language].reportSummary}</h2>
          <p>{translations[language].totalTasks}: {report.summary.total}</p>
          <p>{translations[language].completedTasks}: {report.summary.completed}</p>
          <p>{translations[language].pendingTasks}: {report.summary.pending}</p>
          <h3>{translations[language].taskDetails}</h3>
          <ul>
            {report.tasks.map((task) => (
              <li key={task.id} className="report-item">
                <p><strong>{translations[language].taskTitle}:</strong> {task.title || ''}</p>
                <p><strong>{translations[language].taskDescription}:</strong> {task.description || ''}</p>
                <p><strong>{translations[language].startTime}:</strong> {task.start_time ? new Date(task.start_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}</p>
                <p><strong>{translations[language].endTime}:</strong> {task.end_time ? new Date(task.end_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}</p>
                <p><strong>{translations[language].status}:</strong> {task.status === 'completed' ? translations[language].completed : translations[language].pending}</p>
              </li>
            ))}
          </ul>
          <div>
            <button
              className="export-pdf-button"
              onClick={exportToPDF}
              disabled={isLoading}
            >
              {translations[language].exportPDF}
            </button>
            <button
              className="export-docx-button"
              onClick={exportToDOCX}
              disabled={isLoading}
            >
              {translations[language].exportDOCX}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
