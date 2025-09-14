import React, { useState, useEffect } from 'react';
import { addTask, getTasks, updateTask, deleteTask } from './auth';
import useSound from 'use-sound';

function Tasks({ user, selectedDate }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [remainingTimes, setRemainingTimes] = useState({});
  const [language, setLanguage] = useState('ar'); // حالة اللغة (عربي افتراضي)
  const [isDarkMode, setIsDarkMode] = useState(false); // حالة الدارك مود
  const [playSound] = useSound('/notification.mp3', { volume: 0.5 });

  // كائن الترجمة للعربي والإنجليزي
  const translations = {
    ar: {
      title: 'إدارة المهام',
      addTask: 'إضافة مهمة',
      editTask: 'تعديل المهمة',
      taskTitle: 'عنوان المهمة',
      taskDescription: 'وصف المهمة',
      startTime: 'وقت البدء',
      endTime: 'وقت الانتهاء',
      startTask: 'بدء المهمة',
      edit: 'تعديل',
      delete: 'حذف',
      complete: 'إنهاء',
      status: 'الحالة',
      pending: 'قيد التنفيذ',
      completed: 'مكتملة',
      remainingTime: 'الوقت المتبقي',
      taskEnded: 'انتهى وقت المهمة',
      errorAddUpdate: 'حدث خطأ أثناء إضافة/تحديث المهمة',
      errorStart: 'حدث خطأ أثناء بدء المهمة',
      errorDelete: 'حدث خطأ أثناء حذف المهمة',
      errorComplete: 'حدث خطأ أثناء إنهاء المهمة',
      invalidTime: 'وقت الانتهاء يجب أن يكون بعد وقت البدء',
      timeRequired: 'يرجى تحديد وقت البدء ووقت الانتهاء',
      toggleLanguage: 'English',
      toggleTheme: 'الوضع الداكن',
      notSpecified: 'غير محدد',
    },
    en: {
      title: 'Task Management',
      addTask: 'Add Task',
      editTask: 'Edit Task',
      taskTitle: 'Task Title',
      taskDescription: 'Task Description',
      startTime: 'Start Time',
      endTime: 'End Time',
      startTask: 'Start Task',
      edit: 'Edit',
      delete: 'Delete',
      complete: 'Complete',
      status: 'Status',
      pending: 'Pending',
      completed: 'Completed',
      remainingTime: 'Remaining Time',
      taskEnded: 'Task has ended',
      errorAddUpdate: 'An error occurred while adding/updating the task',
      errorStart: 'An error occurred while starting the task',
      errorDelete: 'An error occurred while deleting the task',
      errorComplete: 'An error occurred while completing the task',
      invalidTime: 'End time must be after start time',
      timeRequired: 'Please specify start and end time',
      toggleLanguage: 'العربية',
      toggleTheme: 'Dark Mode',
      notSpecified: 'Not specified',
    },
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        console.log('Fetching tasks for user:', user.id, 'date:', dateStr);
        const tasksData = await getTasks(user.id, dateStr);
        console.log('Fetched tasks:', tasksData);
        setTasks(tasksData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, [user, selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimes((prev) => {
        const updated = {};
        let hasActiveTasks = false;

        tasks.forEach((task) => {
          if (task.status === 'completed' || !task.end_time) return;

          const endTimeMs = new Date(task.end_time).getTime();
          const nowMs = Date.now();
          const remainingSeconds = Math.max(0, Math.floor((endTimeMs - nowMs) / 1000));

          if (remainingSeconds > 0) {
            updated[task.id] = {
              time: remainingSeconds,
              title: task.title,
            };
            hasActiveTasks = true;
          } else if (remainingSeconds === 0 && prev[task.id]?.time > 0) {
            console.log('Task ended:', task.title);
            playSound();
            alert(`${translations[language].taskEnded}: ${task.title}`);
            updateTask(
              task.id,
              task.title,
              task.description,
              task.due_date,
              'completed',
              task.start_time,
              task.end_time
            )
              .then((updatedTask) => {
                console.log('Task updated to completed:', updatedTask);
                setTasks((prevTasks) =>
                  prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
                );
              })
              .catch((err) => {
                console.error('Error updating task status:', err);
              });
          }
        });

        console.log('Remaining times:', updated);
        return hasActiveTasks ? updated : {};
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks, playSound, language]);

  const handleAddOrUpdateTask = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Adding/Updating task:', { title, description, startTime, endTime, dateStr });

      if (!startTime || !endTime) {
        alert(translations[language].timeRequired);
        return;
      }
      if (new Date(startTime) >= new Date(endTime)) {
        alert(translations[language].invalidTime);
        return;
      }

      const formattedStartTime = startTime ? new Date(startTime).toISOString() : null;
      const formattedEndTime = endTime ? new Date(endTime).toISOString() : null;

      if (editingTask) {
        const updatedTask = await updateTask(
          editingTask.id,
          title,
          description,
          dateStr,
          editingTask.status,
          formattedStartTime,
          formattedEndTime
        );
        console.log('Updated task:', updatedTask);
        setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
        setEditingTask(null);
      } else {
        const newTask = await addTask(user.id, title, description, dateStr, formattedStartTime, formattedEndTime);
        console.log('Added task:', newTask);
        setTasks([...tasks, newTask]);
      }
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      console.error('Error adding/updating task:', err);
      alert(translations[language].errorAddUpdate);
    }
  };

  const handleEditTask = (task) => {
    console.log('Editing task:', task);
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStartTime(task.start_time || '');
    setEndTime(task.end_time || '');
  };

  const handleDeleteTask = async (id) => {
    try {
      console.log('Deleting task:', id);
      await deleteTask(id);
      setTasks(tasks.filter((task) => task.id !== id));
      setRemainingTimes((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(translations[language].errorDelete);
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      console.log('Completing task:', task.id);
      const updatedTask = await updateTask(
        task.id,
        task.title,
        task.description,
        task.due_date,
        'completed',
        task.start_time,
        task.end_time
      );
      console.log('Completed task:', updatedTask);
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setRemainingTimes((prev) => {
        const updated = { ...prev };
        delete updated[task.id];
        return updated;
      });
    } catch (err) {
      console.error('Error completing task:', err);
      alert(translations[language].errorComplete);
    }
  };

  const startTask = async (task) => {
    try {
      const now = new Date().toISOString();
      console.log('Starting task:', task.id, 'with start_time:', now);
      const updatedTask = await updateTask(
        task.id,
        task.title,
        task.description,
        task.due_date,
        task.status,
        now,
        task.end_time
      );
      console.log('Started task:', updatedTask);
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (err) {
      console.error('Error starting task:', err);
      alert(translations[language].errorStart);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle('dark'); // لتطبيق الدارك مود على ملف CSS خارجي
  };

  return (
    <div className={`tasks-container ${isDarkMode ? 'dark' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <style>
        {`
          .tasks-container {
            padding: 24px;
            min-height: 100vh;
            transition: background-color 0.3s ease, color 0.3s ease;
            font-family: 'Amiri', Arial, sans-serif;
          }

          .tasks-container:not(.dark) {
            background-color: #F9FAFB;
            color: #1F2937;
          }

          .tasks-container.dark {
            background-color: #121212;
            color: #E5E7EB;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          h2 {
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

          input, textarea {
            padding: 10px;
            border: 1px solid ${isDarkMode ? '#444' : '#D1D5DB'};
            border-radius: 4px;
            background-color: ${isDarkMode ? '#1E1E1E' : '#FFFFFF'};
            color: ${isDarkMode ? '#E5E7EB' : '#1F2937'};
            font-size: 16px;
            transition: border-color 0.3s ease, background-color 0.3s ease;
          }

          input:focus, textarea:focus {
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

          .add-button {
            background-color: #3A86FF;
            color: #FFFFFF;
          }

          .add-button:hover {
            background-color: #2563EB;
          }

          .edit-button {
            background-color: #17A2B8;
            color: #FFFFFF;
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .edit-button:hover {
            background-color: #138496;
          }

          .delete-button {
            background-color: #EF233C;
            color: #FFFFFF;
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .delete-button:hover {
            background-color: #C82333;
          }

          .complete-button {
            background-color: #06D6A0;
            color: #FFFFFF;
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .complete-button:hover {
            background-color: #059669;
          }

          .start-button {
            background-color: #FF006E;
            color: #FFFFFF;
            margin-right: ${language === 'ar' ? '0' : '8px'};
            margin-left: ${language === 'ar' ? '8px' : '0'};
          }

          .start-button:hover {
            background-color: #D0005A;
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

          .task-item {
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 16px;
            background-color: ${isDarkMode ? '#1E1E1E' : '#FFFFFF'};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.5s ease-in;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .task-item:hover {
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
        <h2>{translations[language].title} - {selectedDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</h2>
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
        <input
          type="text"
          placeholder={translations[language].taskTitle}
          value={title}
          onChange={(e) => {
            console.log('title input:', e.target.value);
            setTitle(e.target.value);
          }}
        />
        <textarea
          placeholder={translations[language].taskDescription}
          value={description}
          onChange={(e) => {
            console.log('description input:', e.target.value);
            setDescription(e.target.value);
          }}
        />
        <input
          type="datetime-local"
          placeholder={translations[language].startTime}
          value={startTime}
          onChange={(e) => {
            console.log('startTime input:', e.target.value);
            setStartTime(e.target.value);
          }}
        />
        <input
          type="datetime-local"
          placeholder={translations[language].endTime}
          value={endTime}
          onChange={(e) => {
            console.log('endTime input:', e.target.value);
            setEndTime(e.target.value);
          }}
        />
        <button className="add-button" onClick={handleAddOrUpdateTask}>
          {editingTask ? translations[language].editTask : translations[language].addTask}
        </button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
              {translations[language].startTime}:{' '}
              {task.start_time
                ? new Date(task.start_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')
                : translations[language].notSpecified}
            </p>
            <p>
              {translations[language].endTime}:{' '}
              {task.end_time
                ? new Date(task.end_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')
                : translations[language].notSpecified}
            </p>
            <p>
              {translations[language].status}:{' '}
              {task.status === 'completed' ? translations[language].completed : translations[language].pending}
            </p>
            {remainingTimes[task.id] && task.status !== 'completed' && (
              <p>
                {translations[language].remainingTime}:{' '}
                {Math.floor(remainingTimes[task.id].time / 60)}:
                {(remainingTimes[task.id].time % 60).toString().padStart(2, '0')}
              </p>
            )}
            <div>
              <button className="edit-button" onClick={() => handleEditTask(task)}>
                {translations[language].edit}
              </button>
              <button className="delete-button" onClick={() => handleDeleteTask(task.id)}>
                {translations[language].delete}
              </button>
              {task.status !== 'completed' && (
                <>
                  <button className="complete-button" onClick={() => handleCompleteTask(task)}>
                    {translations[language].complete}
                  </button>
                  {!task.start_time && (
                    <button className="start-button" onClick={() => startTask(task)}>
                      {translations[language].startTask}
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;