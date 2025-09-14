import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { updateTask } from './auth';

const socket = io('http://localhost:3001');

function Chat({ user, projectId }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const room = `project-${projectId}`;

  useEffect(() => {
    socket.emit('join-room', room);

    socket.on('connect', () => {
      setIsLoading(false);
    });

    socket.on('chat-message', (data) => {
      setMessages((prev) => [...prev, data]);
      setNewMessageCount((prev) => prev + 1);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    socket.on('task-update', (data) => {
      console.log('Task updated:', data);
    });

    return () => {
      socket.off('chat-message');
      socket.off('task-update');
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      const data = { room, message, user: user.email };
      socket.emit('chat-message', data);
      setMessages((prev) => [...prev, data]);
      setMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTaskUpdate = async (task) => {
    try {
      const updatedTask = await updateTask(
        task.id,
        task.title,
        task.description,
        task.due_date,
        task.status,
        task.duration
      );
      socket.emit('task-update', { room, task: updatedTask });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
        شات Planora {newMessageCount > 0 && `(${newMessageCount} رسائل جديدة)`}
      </h1>
      {isLoading && <p className="text-gray-700 dark:text-gray-300">جاري الاتصال...</p>}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4 h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-semibold">{msg.user}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
          placeholder="اكتب رسالتك..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 ml-2"
        >
          إرسال
        </button>
      </div>
    </div>
  );
}

export default Chat;