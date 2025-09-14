const { ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');
const nodemailer = require('nodemailer');

const dbPath = path.join(__dirname, 'planora.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // إنشاء جدول users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      }
    });

    // إنشاء جدول tasks مع start_time و end_time
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

    // إنشاء جدول verification_codes
    db.run(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        code TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // إنشاء جدول reset_tokens
    db.run(`
      CREATE TABLE IF NOT EXISTS reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // إضافة الأعمدة الجديدة لجدول users
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
                      console.log('All new columns added or verified.');
                    });
                  });
                });
              }
            );
          } else {
            console.error('Username column still not added, skipping update.');
            addColumn('account_type', 'TEXT', () => {
              addColumn('is_verified', 'INTEGER DEFAULT 0', () => {
                console.log('All new columns added or verified.');
              });
            });
          }
        });
      });
    });
  }
});

// دالة للتحقق من وجود عمود
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

// دالة لإضافة عمود
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
                  reject(err);
                } else {
                  transporter.sendMail({
                    from: '"Planora" <creativitycode78@gmail.com>',
                    to: email,
                    subject: 'Planora Email Verification',
                    text: `Your verification code is: ${code}`,
                  }, (err) => {
                    if (err) {
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
    db.get(
      `SELECT * FROM verification_codes WHERE user_id = ? AND code = ?`,
      [user_id, code],
      (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Invalid or expired code'));
        } else {
          db.run(
            `UPDATE users SET is_verified = 1 WHERE id = ?`,
            [user_id],
            (err) => {
              if (err) {
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
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
      if (err) {
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
              reject(err);
            } else {
              transporter.sendMail({
                from: '"Planora" <creativitycode78@gmail.com>',
                to: email,
                subject: 'Planora Password Reset',
                text: `Your password reset code is: ${token}`,
              }, (err) => {
                if (err) {
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
    db.get(
      `SELECT * FROM reset_tokens WHERE user_id = ? AND token = ?`,
      [user_id, token],
      (err, row) => {
        if (err) {
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

ipcMain.handle('add-task', async (event, { user_id, title, description, due_date, start_time, end_time }) => {
  return new Promise((resolve, reject) => {
    const created_at = new Date().toISOString();
    console.log('Adding task:', { user_id, title, description, due_date, start_time, end_time, created_at });
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
          resolve(task);
        }
      }
    );
  });
});

ipcMain.handle('get-tasks', async (event, { user_id, date }) => {
  return new Promise((resolve, reject) => {
    console.log('Getting tasks for user:', user_id, 'date:', date);
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
    console.log('Updating task:', { id, title, description, due_date, status, start_time, end_time });
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
          resolve(task);
        }
      }
    );
  });
});

ipcMain.handle('delete-task', async (event, { id }) => {
  return new Promise((resolve, reject) => {
    console.log('Deleting task:', id);
    db.run(`DELETE FROM tasks WHERE id = ?`, [id], function (err) {
      if (err) {
        console.error('Error deleting task:', err);
        reject(err);
      } else {
        console.log('Task deleted:', id);
        resolve({ id });
      }
    });
  });
});

ipcMain.handle('get-report', async (event, { user_id, start_date, end_date }) => {
  return new Promise((resolve, reject) => {
    console.log('Getting report for user:', user_id, 'from:', start_date, 'to:', end_date);
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

ipcMain.handle('export-docx', async (event, { start_date, end_date, report }) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Exporting report to docx:', { start_date, end_date });
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({ text: 'Planora Task Report', heading: 'Title' }),
              new Paragraph({ text: `From: ${start_date} To: ${end_date}` }),
              new Paragraph({ text: `Total Tasks: ${report.summary.total}` }),
              new Paragraph({ text: `Completed Tasks: ${report.summary.completed}` }),
              new Paragraph({ text: `Pending Tasks: ${report.summary.pending}` }),
              ...report.tasks.map(
                (task, index) =>
                  new Paragraph({
                    text: `${index + 1}. ${task.title} - ${task.status === 'completed' ? 'Completed' : 'Pending'}`,
                  })
              ),
            ],
          },
        ],
      });

      Packer.toBuffer(doc).then((buffer) => {
        const filePath = path.join(__dirname, `report_${start_date}_to_${end_date}.docx`);
        fs.writeFileSync(filePath, buffer);
        console.log('Report exported:', filePath);
        resolve(filePath);
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

ipcMain.handle('get-font-base64', async (event) => {
  return new Promise((resolve, reject) => {
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

ipcMain.handle('get-archived-tasks', async (event, { user_id, month, year }) => {
  return new Promise((resolve, reject) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    console.log('Getting archived tasks for user:', user_id, 'month:', month, 'year:', year);
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
    console.log('Searching archived tasks for user:', user_id, 'query:', query);
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