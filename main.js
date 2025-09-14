const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'build/index.html')}`,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('chat-message', (data) => {
    io.to(data.room).emit('chat-message', data);
  });

  socket.on('task-update', (data) => {
    io.to(data.room).emit('task-update', data);
    console.log('Task update broadcasted:', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const dbPath = path.join(__dirname, 'planora.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        name TEXT,
        username TEXT,
        account_type TEXT,
        is_verified INTEGER DEFAULT 0,
        profile_picture TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        description TEXT,
        due_date TEXT,
        status TEXT,
        start_time TEXT,
        end_time TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, () => {
      checkColumnExists('tasks', 'start_time', (exists) => {
        if (!exists) {
          db.run(`ALTER TABLE tasks ADD COLUMN start_time TEXT`, (err) => {
            if (err) {
              console.error('Error adding start_time column:', err.message);
            } else {
              console.log('start_time column added.');
            }
          });
        }
      });
      checkColumnExists('tasks', 'end_time', (exists) => {
        if (!exists) {
          db.run(`ALTER TABLE tasks ADD COLUMN end_time TEXT`, (err) => {
            if (err) {
              console.error('Error adding end_time column:', err.message);
            } else {
              console.log('end_time column added.');
            }
          });
        }
      });
      checkColumnExists('tasks', 'created_at', (exists) => {
        if (!exists) {
          db.run(`ALTER TABLE tasks ADD COLUMN created_at TEXT`, (err) => {
            if (err) {
              console.error('Error adding created_at column:', err.message);
            } else {
              console.log('created_at column added.');
            }
          });
        }
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_user_id ON tasks(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_due_date ON tasks(due_date)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_created_at ON tasks(created_at)`);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        code TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    addColumn('name', 'TEXT', () => {
      addColumn('username', 'TEXT', () => {
        checkColumnExists('users', 'username', (exists) => {
          if (exists) {
            db.run(
              `UPDATE users SET username = email WHERE username IS NULL`,
              (err) => {
                if (err) {
                  console.error('Error updating username for existing users:', err.message);
                } else {
                  console.log('Updated username for existing users.');
                }
                db.run(`
                  CREATE UNIQUE INDEX IF NOT EXISTS idx_username ON users(username)
                `, (err) => {
                  if (err) {
                    console.error('Error adding UNIQUE constraint to username:', err.message);
                  } else {
                    console.log('UNIQUE constraint added to username.');
                  }
                  addColumn('account_type', 'TEXT', () => {
                    addColumn('is_verified', 'INTEGER DEFAULT 0', () => {
                      addColumn('profile_picture', 'TEXT', () => {
                        console.log('All new columns added or verified.');
                      });
                    });
                  });
                });
              }
            );
          } else {
            console.error('Username column still not added, skipping update.');
            addColumn('account_type', 'TEXT', () => {
              addColumn('is_verified', 'INTEGER DEFAULT 0', () => {
                addColumn('profile_picture', 'TEXT', () => {
                  console.log('All new columns added or verified.');
                });
              });
            });
          }
        });
      });
    });
  }
});

const checkColumnExists = (table, column, callback) => {
  db.all(`PRAGMA table_info(${table})`, (err, columns) => {
    if (err) {
      console.error(`Error checking columns for ${table}:`, err.message);
      callback(false);
      return;
    }
    const columnExists = columns.some((col) => col.name === column);
    callback(columnExists);
  });
};

const addColumn = (columnName, columnType, callback) => {
  checkColumnExists('users', columnName, (exists) => {
    if (!exists) {
      db.run(`ALTER TABLE users ADD COLUMN ${columnName} ${columnType}`, (err) => {
        if (err) {
          console.error(`Error adding ${columnName} column:`, err.message);
        } else {
          console.log(`${columnName} column added.`);
        }
        if (callback) callback();
      });
    } else {
      console.log(`${columnName} column already exists.`);
      if (callback) callback();
    }
  });
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'creativitycode78@gmail.com',
    pass: 'npxb fvrw vivs hwii',
  },
});

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

ipcMain.handle('register-user', async (event, { name, username, email, password, account_type }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: register-user called with:', { name, username, email, account_type });
    checkColumnExists('users', 'username', (exists) => {
      if (!exists) {
        reject(new Error('Username column does not exist in users table'));
        return;
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.run(
        `INSERT INTO users (name, username, email, password, account_type, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, username, email, hashedPassword, account_type, 'User', 0],
        function (err) {
          if (err) {
            console.error('Error registering user:', err);
            reject(err);
          } else {
            const userId = this.lastID;
            const code = generateCode();
            const created_at = new Date().toISOString();
            db.run(
              `INSERT INTO verification_codes (user_id, code, created_at) VALUES (?, ?, ?)`,
              [userId, code, created_at],
              (err) => {
                if (err) {
                  console.error('Error inserting verification code:', err);
                  reject(err);
                } else {
                  transporter.sendMail({
                    from: '"Planora" <creativitycode78@gmail.com>',
                    to: email,
                    subject: 'Planora Email Verification',
                    text: `Your verification code is: ${code}`,
                  }, (err) => {
                    if (err) {
                      console.error('Error sending verification email:', err);
                      reject(err);
                    } else {
                      resolve({ id: userId, name, username, email, account_type, role: 'User', is_verified: 0 });
                    }
                  });
                }
              }
            );
          }
        }
      );
    });
  });
});

ipcMain.handle('verify-email', async (event, { user_id, code }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: verify-email called with:', { user_id, code });
    db.get(
      `SELECT * FROM verification_codes WHERE user_id = ? AND code = ?`,
      [user_id, code],
      (err, row) => {
        if (err) {
          console.error('Error verifying email:', err);
          reject(err);
        } else if (!row) {
          reject(new Error('Invalid or expired code'));
        } else {
          db.run(
            `UPDATE users SET is_verified = 1 WHERE id = ?`,
            [user_id],
            (err) => {
              if (err) {
                console.error('Error updating user verification:', err);
                reject(err);
              } else {
                db.run(`DELETE FROM verification_codes WHERE user_id = ?`, [user_id]);
                resolve({ success: true });
              }
            }
          );
        }
      }
    );
  });
});

ipcMain.handle('login-user', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: login-user called with:', { username });
    checkColumnExists('users', 'username', (exists) => {
      if (!exists) {
        reject(new Error('Username column does not exist in users table'));
        return;
      }
      db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, user) => {
          if (err) {
            console.error('Error logging in user:', err);
            reject(err);
          } else if (!user) {
            reject(new Error('User not found'));
          } else if (!user.is_verified) {
            reject(new Error('Email not verified'));
          } else if (!bcrypt.compareSync(password, user.password)) {
            reject(new Error('Invalid password'));
          } else {
            resolve(user);
          }
        }
      );
    });
  });
});

ipcMain.handle('request-password-reset', async (event, { email }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: request-password-reset called with:', { email });
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
      if (err) {
        console.error('Error requesting password reset:', err);
        reject(err);
      } else if (!user) {
        reject(new Error('User not found'));
      } else {
        const token = generateCode();
        const created_at = new Date().toISOString();
        db.run(
          `INSERT INTO reset_tokens (user_id, token, created_at) VALUES (?, ?, ?)`,
          [user.id, token, created_at],
          (err) => {
            if (err) {
              console.error('Error inserting reset token:', err);
              reject(err);
            } else {
              transporter.sendMail({
                from: '"Planora" <creativitycode78@gmail.com>',
                to: email,
                subject: 'Planora Password Reset',
                text: `Your password reset code is: ${token}`,
              }, (err) => {
                if (err) {
                  console.error('Error sending reset email:', err);
                  reject(err);
                } else {
                  resolve({ success: true, user_id: user.id });
                }
              });
            }
          }
        );
      }
    });
  });
});

ipcMain.handle('reset-password', async (event, { user_id, token, new_password }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: reset-password called with:', { user_id, token });
    db.get(
      `SELECT * FROM reset_tokens WHERE user_id = ? AND token = ?`,
      [user_id, token],
      (err, row) => {
        if (err) {
          console.error('Error resetting password:', err);
          reject(err);
        } else if (!row) {
          reject(new Error('Invalid or expired token'));
        } else {
          const hashedPassword = bcrypt.hashSync(new_password, 10);
          db.run(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, user_id],
            (err) => {
              if (err) {
                console.error('Error updating password:', err);
                reject(err);
              } else {
                db.run(`DELETE FROM reset_tokens WHERE user_id = ?`, [user_id]);
                resolve({ success: true });
              }
            }
          );
        }
      }
    );
  });
});

ipcMain.handle('update-user', async (event, { user_id, name, username }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: update-user called with:', { user_id, name, username });
    db.run(
      `UPDATE users SET name = ?, username = ? WHERE id = ?`,
      [name, username, user_id],
      function (err) {
        if (err) {
          console.error('Error updating user:', err);
          reject(err);
        } else {
          db.get(
            `SELECT id, name, username, email, account_type, role, is_verified, profile_picture FROM users WHERE id = ?`,
            [user_id],
            (err, user) => {
              if (err) {
                console.error('Error fetching updated user:', err);
                reject(err);
              } else {
                console.log('User updated:', user);
                resolve(user);
              }
            }
          );
        }
      }
    );
  });
});

ipcMain.handle('upload-profile-picture', async (event, { user_id, pictureUrl }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: upload-profile-picture called with:', { user_id, pictureUrl });
    if (!pictureUrl || typeof pictureUrl !== 'string' || pictureUrl.trim() === '') {
      console.error('Invalid or empty profile picture URL');
      reject(new Error('Invalid or empty profile picture URL'));
      return;
    }

    // Validate URL format
    try {
      new URL(pictureUrl);
      if (!pictureUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
        console.error('URL does not point to a valid image');
        reject(new Error('URL does not point to a valid image'));
        return;
      }
    } catch (err) {
      console.error('Invalid URL format:', err);
      reject(new Error('Invalid URL format'));
      return;
    }

    db.run(
      `UPDATE users SET profile_picture = ? WHERE id = ?`,
      [pictureUrl, user_id],
      (err) => {
        if (err) {
          console.error('Error updating profile picture in database:', err);
          reject(err);
        } else {
          console.log('Profile picture URL updated in database:', pictureUrl);
          resolve(pictureUrl);
        }
      }
    );
  });
});

ipcMain.handle('add-task', async (event, { user_id, title, description, due_date, start_time, end_time }) => {
  return new Promise((resolve, reject) => {
    const created_at = new Date().toISOString();
    console.log('Backend: add-task called with:', { user_id, title, description, due_date, start_time, end_time, created_at });

    db.run(
      `INSERT INTO tasks (user_id, title, description, due_date, status, start_time, end_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, description, due_date, 'pending', start_time || null, end_time || null, created_at],
      function (err) {
        if (err) {
          console.error('Error adding task:', err);
          reject(err);
        } else {
          const task = { id: this.lastID, user_id, title, description, due_date, status: 'pending', start_time, end_time, created_at };
          console.log('Task added:', task);
          io.emit('task-update', { user_id, task }); 
          resolve(task);
        }
      }
    );
  });
});

ipcMain.handle('get-tasks', async (event, { user_id, date }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: get-tasks called with:', { user_id, date });
    db.all(
      `SELECT * FROM tasks WHERE user_id = ? AND due_date = ?`,
      [user_id, date],
      (err, tasks) => {
        if (err) {
          console.error('Error getting tasks:', err);
          reject(err);
        } else {
          console.log('Tasks retrieved:', tasks);
          resolve(tasks);
        }
      }
    );
  });
});

ipcMain.handle('update-task', async (event, { id, title, description, due_date, status, start_time, end_time }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: update-task called with:', { id, title, description, due_date, status, start_time, end_time });

    db.run(
      `UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ?, start_time = ?, end_time = ? WHERE id = ?`,
      [title, description, due_date, status, start_time || null, end_time || null, id],
      function (err) {
        if (err) {
          console.error('Error updating task:', err);
          reject(err);
        } else {
          const task = { id, title, description, due_date, status, start_time, end_time };
          console.log('Task updated:', task);
          io.emit('task-update', { task }); 
          resolve(task);
        }
      }
    );
  });
});

ipcMain.handle('delete-task', async (event, { id }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: delete-task called with:', { id });
    db.run(`DELETE FROM tasks WHERE id = ?`, [id], function (err) {
      if (err) {
        console.error('Error deleting task:', err);
        reject(err);
      } else {
        console.log('Task deleted:', id);
        io.emit('task-update', { id, deleted: true }); 
        resolve({ id });
      }
    });
  });
});

ipcMain.handle('get-report', async (event, { user_id, start_date, end_date }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: get-report called with:', { user_id, start_date, end_date });
    db.all(
      `SELECT * FROM tasks WHERE user_id = ? AND due_date BETWEEN ? AND ?`,
      [user_id, start_date, end_date],
      (err, tasks) => {
        if (err) {
          console.error('Error getting report:', err);
          reject(err);
        } else {
          const completed = tasks.filter((task) => task.status === 'completed').length;
          const pending = tasks.filter((task) => task.status === 'pending').length;
          const report = {
            tasks,
            summary: {
              total: tasks.length,
              completed,
              pending,
            },
          };
          console.log('Report retrieved:', report);
          resolve(report);
        }
      }
    );
  });
});

ipcMain.handle('get-font-base64', async (event) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: get-font-base64 called');
    const fontPath = path.join(__dirname, 'public', 'fonts', 'Amiri-Regular.ttf');
    fs.readFile(fontPath, (err, data) => {
      if (err) {
        console.error('Error reading font file:', err);
        reject(err);
      } else {
        const base64 = Buffer.from(data).toString('base64');
        console.log('Font file read successfully');
        resolve(base64);
      }
    });
  });
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: show-save-dialog called with options:', options);
    dialog.showSaveDialog(options).then((result) => {
      console.log('Save dialog result:', result);
      resolve(result);
    }).catch((err) => {
      console.error('Error in show-save-dialog:', err);
      reject(err);
    });
  });
});

ipcMain.handle('export-docx', async (event, { start_date, end_date, report, language }) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Exporting report to docx:', { start_date, end_date, language });

      const translations = {
        ar: {
          title: 'تقارير Planora',
          startDate: 'من',
          endDate: 'إلى',
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
          notSpecified: 'غير محدد',
          footer: '© Creativity Code 2025',
        },
        en: {
          title: 'Planora Reports',
          startDate: 'From',
          endDate: 'To',
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
          notSpecified: 'Not specified',
          footer: '© Creativity Code 2025',
        },
      };

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, 
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: [
              new Paragraph({
                text: translations[language].title,
                heading: 'Title',
                bidirectional: true,
                alignment: language === 'ar' ? 'right' : 'left',
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: `${translations[language].startDate}: ${start_date} ${translations[language].endDate}: ${end_date}`,
                bidirectional: true,
                alignment: language === 'ar' ? 'right' : 'left',
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: `${translations[language].totalTasks}: ${report.summary.total}`,
                bidirectional: true,
                alignment: language === 'ar' ? 'right' : 'left',
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: `${translations[language].completedTasks}: ${report.summary.completed}`,
                bidirectional: true,
                alignment: language === 'ar' ? 'right' : 'left',
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: `${translations[language].pendingTasks}: ${report.summary.pending}`,
                bidirectional: true,
                alignment: language === 'ar' ? 'right' : 'left',
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: translations[language].taskDetails,
                heading: 'Heading1',
                bidirectional: true,
                alignment: language === 'ar' ? 'right' : 'left',
                spacing: { after: 200 },
              }),
              ...report.tasks.flatMap((task, index) => [
                new Paragraph({
                  text: `${index + 1}. ${translations[language].taskTitle}: ${task.title || 'غير متوفر'}`,
                  bidirectional: true,
                  alignment: language === 'ar' ? 'right' : 'left',
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  text: `${translations[language].taskDescription}: ${task.description || translations[language].notSpecified}`,
                  bidirectional: true,
                  alignment: language === 'ar' ? 'right' : 'left',
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  text: `${translations[language].startTime}: ${task.start_time ? new Date(task.start_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : translations[language].notSpecified}`,
                  bidirectional: true,
                  alignment: language === 'ar' ? 'right' : 'left',
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  text: `${translations[language].endTime}: ${task.end_time ? new Date(task.end_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : translations[language].notSpecified}`,
                  bidirectional: true,
                  alignment: language === 'ar' ? 'right' : 'left',
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  text: `${translations[language].status}: ${task.status === 'completed' ? translations[language].completed : translations[language].pending}`,
                  bidirectional: true,
                  alignment: language === 'ar' ? 'right' : 'left',
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '',
                      break: 1,
                    }),
                    new TextRun({
                      text: '______________________________',
                      bidirectional: true,
                    }),
                  ],
                  alignment: language === 'ar' ? 'right' : 'left',
                  spacing: { after: 200 },
                }),
              ]),
              new Paragraph({
                text: translations[language].footer,
                bidirectional: true,
                alignment: language === 'ar' ? 'right' : 'left',
                spacing: { before: 400 },
              }),
            ],
          },
        ],
      });

      Packer.toBuffer(doc).then(async (buffer) => {
        const fileName = `report_${start_date}_to_${end_date}.docx`;
        console.log('Opening save dialog for DOCX:', fileName);
        const saveResult = await dialog.showSaveDialog({
          defaultPath: fileName,
          filters: [{ name: 'Word Documents', extensions: ['docx'] }],
        });
        console.log('Save dialog result:', saveResult);

        if (saveResult.canceled || !saveResult.filePath) {
          console.log('DOCX save canceled');
          resolve(null);
          return;
        }

        fs.writeFileSync(saveResult.filePath, buffer);
        console.log('Report exported:', saveResult.filePath);
        resolve(saveResult.filePath);
      }).catch((err) => {
        console.error('Error exporting docx:', err);
        reject(err);
      });
    } catch (err) {
      console.error('Error in export-docx:', err);
      reject(err);
    }
  });
});

ipcMain.handle('get-archived-tasks', async (event, { user_id, month, year }) => {
  return new Promise((resolve, reject) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    console.log('Backend: get-archived-tasks called with:', { user_id, month, year });
    db.all(
      `SELECT * FROM tasks WHERE user_id = ? AND created_at LIKE ?`,
      [user_id, `${year}-${month.toString().padStart(2, '0')}%`],
      (err, tasks) => {
        if (err) {
          console.error('Error getting archived tasks:', err);
          reject(err);
        } else {
          console.log('Archived tasks retrieved:', tasks);
          resolve(tasks);
        }
      }
    );
  });
});

ipcMain.handle('search-archived-tasks', async (event, { user_id, query }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: search-archived-tasks called with:', { user_id, query });
    db.all(
      `SELECT * FROM tasks WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)`,
      [user_id, `%${query}%`, `%${query}%`],
      (err, tasks) => {
        if (err) {
          console.error('Error searching archived tasks:', err);
          reject(err);
        } else {
          console.log('Archived tasks search results:', tasks);
          resolve(tasks);
        }
      }
    );
  });
});

ipcMain.handle('generate-test-data', async (event, { user_id, count }) => {
  return new Promise((resolve, reject) => {
    console.log('Backend: generate-test-data called with:', { user_id, count });
    const stmt = db.prepare(`
      INSERT INTO tasks (user_id, title, description, due_date, status, start_time, end_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const date = new Date();
    for (let i = 0; i < count; i++) {
      const created_at = new Date(date.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
      const due_date = new Date(date.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const start_time = new Date(date.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
      const end_time = new Date(date.getTime() - i * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString();
      console.log('Generating test task:', { user_id, title: `Task ${i + 1}`, start_time, end_time });
      stmt.run(
        user_id,
        `Task ${i + 1}`,
        `Description for task ${i + 1}`,
        due_date,
        i % 2 === 0 ? 'completed' : 'pending',
        start_time,
        end_time,
        created_at,
        (err) => {
          if (err) {
            console.error('Error generating test task:', err);
            reject(err);
          }
        }
      );
    }
    stmt.finalize((err) => {
      if (err) {
        console.error('Error finalizing test data:', err);
        reject(err);
      } else {
        console.log(`Generated ${count} test tasks`);
        resolve({ message: `Generated ${count} test tasks` });
      }
    });
  });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'public', 'icons', 'app-icon.ico'), // Add icon path
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'build/index.html')}`
  );
}

app.whenReady().then(() => {
  createWindow();
  server.listen(3001, () => {
    console.log('Socket.io server running on port 3001');
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});