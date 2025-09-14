const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  registerUser: (args) => ipcRenderer.invoke('register-user', args),
  verifyEmail: (args) => ipcRenderer.invoke('verify-email', args),
  loginUser: (args) => ipcRenderer.invoke('login-user', args),
  requestPasswordReset: (args) => ipcRenderer.invoke('request-password-reset', args),
  resetPassword: (args) => ipcRenderer.invoke('reset-password', args),
  addTask: (args) => ipcRenderer.invoke('add-task', args),
  getTasks: (args) => ipcRenderer.invoke('get-tasks', args),
  updateTask: (args) => ipcRenderer.invoke('update-task', args),
  deleteTask: (args) => ipcRenderer.invoke('delete-task', args),
  getReport: (args) => ipcRenderer.invoke('get-report', args),
  getArchivedTasks: (args) => ipcRenderer.invoke('get-archived-tasks', args),
  searchArchivedTasks: (args) => ipcRenderer.invoke('search-archived-tasks', args),
  exportDocx: (args) => ipcRenderer.invoke('export-docx', args),
  getFontBase64: () => ipcRenderer.invoke('get-font-base64'),
  generateTestData: (args) => ipcRenderer.invoke('generate-test-data', args),
  updateUser: (args) => ipcRenderer.invoke('update-user', args),
  uploadProfilePicture: (args) => ipcRenderer.invoke('upload-profile-picture', args),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
});