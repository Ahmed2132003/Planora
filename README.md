Planora - Task Management Application

Planora is a cross-platform task management desktop application built with Electron and React. It helps users organize their tasks, track progress, and generate reports efficiently. The app supports both Arabic and English languages with a responsive UI, real-time task updates via Socket.IO, and a SQLite database for persistent storage.
المشروع بالعربية
بلانورا هي تطبيق مكتبي لإدارة المهام، مصمم لتنظيم المهام اليومية ومتابعة التقدم بسهولة. يدعم التطبيق اللغتين العربية والإنجليزية مع واجهة مستخدم ديناميكية، تحديثات فورية للمهام باستخدام Socket.IO، وقاعدة بيانات SQLite لحفظ البيانات.
المميزات

إدارة المهام: إنشاء، تعديل، وحذف المهام مع تحديد تواريخ الاستحقاق والحالة.
دعم متعدد اللغات: تبديل بين العربية والإنجليزية مع دعم كامل لاتجاه النص (RTL/LTR).
تقارير مخصصة: تصدير تقارير المهام إلى ملفات DOCX.
لوحة الإدارة: واجهة خاصة للمشرفين لإدارة المستخدمين.
دعم الصور الشخصية: إمكانية رفع صور الملف الشخصي.
الأرشيف: عرض المهام المؤرشفة مع إمكانية البحث.
واجهة حديثة: تصميم مستجيب مع أنيميشن باستخدام Framer Motion.


Features

Task Management: Create, edit, and delete tasks with due dates and status tracking.
Multilingual Support: Switch between Arabic and English with full RTL/LTR support.
Custom Reports: Export task reports to DOCX format.
Admin Panel: Dedicated interface for admins to manage users.
Profile Pictures: Upload and save user profile pictures.
Task Archive: View archived tasks with search functionality.
Modern UI: Responsive design with animations powered by Framer Motion.


Prerequisites
To run Planora locally, ensure you have the following installed:

Node.js (v14 or higher)
npm (comes with Node.js)
Git


Installation

Clone the Repository:
git clone https://github.com/Ahmed2132003/Planora.git
cd planora-app


Install Dependencies:
npm install


Run the Application:
npm run start


Build for Production (optional):To create an executable for your platform (Windows, macOS, Linux):
npm run build




التثبيت (بالعربية)

استنساخ المستودع:
git clone https://github.com/Ahmed2132003/Planora.git
cd planora-app


تثبيت التبعيات:
npm install


تشغيل التطبيق:
npm run start


بناء التطبيق للإصدار (اختياري):لإنشاء ملف تنفيذي لنظامك (Windows، macOS، Linux):
npm run build




Dependencies
The project relies on the following key packages:

Electron: For building the cross-platform desktop app.
React: For the frontend UI.
react-i18next: For multilingual support.
Socket.IO: For real-time task updates.
SQLite3: For local database storage.
bcrypt: For secure password hashing.
nodemailer: For email verification and password reset.
docx: For generating task reports in DOCX format.
Framer Motion: For UI animations.

See package.json for the full list of dependencies.

Project Structure
planora-app/
├── public/                # Static assets (logos, fonts, icons)
├── src/                   # React source code
│   ├── components/        # Reusable React components
│   ├── i18n.js            # i18next configuration for translations
│   ├── App.js             # Main app component
│   └── ...                # Other components (Calendar, Settings, etc.)
├── main.js                # Electron main process
├── planora.db             # SQLite database (not included in repo)
├── package.json           # Project metadata and dependencies
└── README.md              # This file


How to Contribute

Fork the repository.
Create a new branch: git checkout -b feature/your-feature-name.
Commit your changes: git commit -m "Add your feature".
Push to the branch: git push origin feature/your-feature-name.
Open a Pull Request on GitHub.


كيفية المساهمة

قم بعمل Fork للمستودع.
أنشئ فرعًا جديدًا: git checkout -b feature/اسم-ميزتك.
سجل التغييرات: git commit -m "إضافة ميزتك".
ارفع الفرع: git push origin feature/اسم-ميزتك.
افتح طلب سحب (Pull Request) على GitHub.


License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
For questions or feedback, reach out to:

Email: creativitycode78@gmail.com
GitHub: yourusername

© 2025 Creativity Code
