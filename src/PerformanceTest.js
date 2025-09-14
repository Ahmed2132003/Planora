import React, { useState } from 'react';
import { getReport, getArchivedTasks } from './auth';

function PerformanceTest({ user }) {
  const [taskCount, setTaskCount] = useState(1000);
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateTestData = async () => {
    setIsLoading(true);
    try {
      const startTime = performance.now();
      await window.electronAPI.generateTestData({ user_id: user.id, count: taskCount });
      const endTime = performance.now();
      setTestResults((prev) => ({
        ...prev,
        generateTime: (endTime - startTime) / 1000,
      }));
    } catch (err) {
      console.error('Error generating test data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testReport = async () => {
    setIsLoading(true);
    try {
      const startTime = performance.now();
      await getReport(user.id, '2025-01-01', '2025-12-31');
      const endTime = performance.now();
      setTestResults((prev) => ({
        ...prev,
        reportTime: (endTime - startTime) / 1000,
      }));
    } catch (err) {
      console.error('Error testing report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testArchive = async () => {
    setIsLoading(true);
    try {
      const startTime = performance.now();
      await getArchivedTasks(user.id, 8, 2025);
      const endTime = performance.now();
      setTestResults((prev) => ({
        ...prev,
        archiveTime: (endTime - startTime) / 1000,
      }));
    } catch (err) {
      console.error('Error testing archive:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">اختبار أداء Planora</h1>
      <div className="mb-6">
        <label className="block text-gray-700">عدد المهام للاختبار</label>
        <input
          type="number"
          value={taskCount}
          onChange={(e) => setTaskCount(parseInt(e.target.value))}
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={generateTestData}
          disabled={isLoading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          إنشاء بيانات وهمية
        </button>
      </div>
      <div className="mb-6">
        <button
          onClick={testReport}
          disabled={isLoading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 mr-2"
        >
          اختبار التقارير
        </button>
        <button
          onClick={testArchive}
          disabled={isLoading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          اختبار الأرشيف
        </button>
      </div>
      {isLoading && <p className="text-gray-700">جاري الاختبار...</p>}
      {testResults && (
        <div>
          <h2 className="text-2xl font-bold mb-4">نتائج الاختبار</h2>
          {testResults.generateTime && (
            <p>زمن إنشاء {taskCount} مهمة: {testResults.generateTime.toFixed(2)} ثانية</p>
          )}
          {testResults.reportTime && (
            <p>زمن استرجاع التقرير: {testResults.reportTime.toFixed(2)} ثانية</p>
          )}
          {testResults.archiveTime && (
            <p>زمن استرجاع الأرشيف: {testResults.archiveTime.toFixed(2)} ثانية</p>
          )}
        </div>
      )}
    </div>
  );
}

export default PerformanceTest;