import React from 'react';

const registerUser = async (name, username, email, password, account_type) => {
  console.log('registerUser called with:', { name, username, email, account_type });
  return window.electronAPI.registerUser({ name, username, email, password, account_type });
};

const verifyEmail = async (user_id, code) => {
  console.log('verifyEmail called with:', { user_id, code });
  return window.electronAPI.verifyEmail({ user_id, code });
};

const loginUser = async (username, password) => {
  console.log('loginUser called with:', { username });
  return window.electronAPI.loginUser({ username, password });
};

const requestPasswordReset = async (email) => {
  console.log('requestPasswordReset called with:', { email });
  return window.electronAPI.requestPasswordReset({ email });
};

const resetPassword = async (user_id, token, new_password) => {
  console.log('resetPassword called with:', { user_id, token });
  return window.electronAPI.resetPassword({ user_id, token, new_password });
};

const addTask = async (user_id, title, description, due_date, start_time, end_time) => {
  console.log('addTask called with:', { user_id, title, description, due_date, start_time, end_time });
  if (!start_time || !end_time) {
    throw new Error('وقت البدء أو الانتهاء غير محدد');
  }
  return window.electronAPI.addTask({ user_id, title, description, due_date, start_time, end_time });
};

const getTasks = async (user_id, date) => {
  console.log('getTasks called with:', { user_id, date });
  return window.electronAPI.getTasks({ user_id, date });
};

const updateTask = async (id, title, description, due_date, status, start_time, end_time) => {
  console.log('updateTask called with:', { id, title, description, due_date, status, start_time, end_time });
  if (!start_time || !end_time) {
    throw new Error('وقت البدء أو الانتهاء غير محدد');
  }
  return window.electronAPI.updateTask({ id, title, description, due_date, status, start_time, end_time });
};

const deleteTask = async (id) => {
  console.log('deleteTask called with:', { id });
  return window.electronAPI.deleteTask({ id });
};

const getReport = async (user_id, start_date, end_date) => {
  console.log('getReport called with:', { user_id, start_date, end_date });
  return window.electronAPI.getReport({ user_id, start_date, end_date });
};

const getArchivedTasks = async (user_id, month, year) => {
  console.log('getArchivedTasks called with:', { user_id, month, year });
  return window.electronAPI.getArchivedTasks({ user_id, month, year });
};

const searchArchivedTasks = async (user_id, query) => {
  console.log('searchArchivedTasks called with:', { user_id, query });
  return window.electronAPI.searchArchivedTasks({ user_id, query });
};

const generateTestData = async (user_id, count) => {
  console.log('generateTestData called with:', { user_id, count });
  return window.electronAPI.generateTestData({ user_id, count });
};

const updateUser = async (user_id, { name, username }) => {
  console.log('updateUser called with:', { user_id, name, username });
  return window.electronAPI.updateUser({ user_id, name, username });
};

const uploadProfilePicture = async (user_id, pictureUrl) => {
  console.log('uploadProfilePicture called with:', { user_id, pictureUrl });
  if (!pictureUrl || typeof pictureUrl !== 'string' || pictureUrl.trim() === '') {
    throw new Error('Invalid or empty profile picture URL');
  }
  return window.electronAPI.uploadProfilePicture({ user_id, pictureUrl });
};

export {
  registerUser,
  verifyEmail,
  loginUser,
  requestPasswordReset,
  resetPassword,
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  getReport,
  getArchivedTasks,
  searchArchivedTasks,
  generateTestData,
  updateUser,
  uploadProfilePicture,
};