# 🎓 EduTrack — Student Management System

A full-stack Student Management System built with React.js, Node.js/Express, MongoDB, and JWT authentication.

---

## 📁 Folder Structure

```
student-management-system/
├── backend/
│   ├── config/
│   │   └── seed.js              # DB seeder (sample data)
│   ├── controllers/
│   │   ├── authController.js    # Login, register, profile
│   │   ├── adminController.js   # Full student CRUD + attendance/marks/fees
│   │   ├── studentController.js # Student's own dashboard
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── auth.js              # JWT verify + role guard
│   ├── models/
│   │   ├── Student.js           # Student schema
│   │   ├── Admin.js             # Admin schema
│   │   └── Notification.js      # Notification schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── studentRoutes.js
│   │   └── notificationRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Common/
    │   │       └── Layout.js    # Sidebar, StatCard, Modal, ProgressBar, Badge, etc.
    │   ├── context/
    │   │   └── AuthContext.js   # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── StudentDashboard.js
    │   │   ├── AdminDashboard.js
    │   │   ├── AdminStudents.js
    │   │   ├── AdminStudentDetail.js
    │   │   └── NotFoundPage.js
    │   ├── utils/
    │   │   └── api.js           # Axios instance with JWT interceptor
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

## 🚀 Setup Instructions

### Step 1 — Clone & Navigate
```bash
git clone <your-repo-url>
cd student-management-system
```

### Step 2 — Backend Setup
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**Edit `backend/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_management
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3 — Seed the Database (optional but recommended)
```bash
cd backend
node config/seed.js
```
This creates:
- Admin: `admin@sms.com` / `Admin@123`
- Students: `priya@student.com`, `arjun@student.com`, `kavya@student.com` — all password `Student@123`

### Step 4 — Start Backend
```bash
npm run dev   # uses nodemon for hot-reload
# or
npm start     # production mode
```
Backend runs at: http://localhost:5000

### Step 5 — Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
Frontend runs at: http://localhost:3000

---

## 🔐 Demo Credentials

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@sms.com          | Admin@123    |
| Student | priya@student.com      | Student@123  |
| Student | arjun@student.com      | Student@123  |
| Student | kavya@student.com      | Student@123  |

---

## 📡 API Reference

### Auth
| Method | Endpoint              | Description         | Auth     |
|--------|-----------------------|---------------------|----------|
| POST   | /api/auth/register    | Student register    | Public   |
| POST   | /api/auth/login       | Login (any role)    | Public   |
| GET    | /api/auth/profile     | Get current user    | Required |
| PUT    | /api/auth/change-password | Change password | Required |

### Student (authenticated student)
| Method | Endpoint                  | Description        |
|--------|---------------------------|--------------------|
| GET    | /api/students/dashboard   | Full dashboard data|
| PUT    | /api/students/profile     | Update own profile |

### Admin (admin only)
| Method | Endpoint                            | Description          |
|--------|-------------------------------------|----------------------|
| GET    | /api/admin/dashboard                | Stats overview       |
| GET    | /api/admin/students                 | List (search/filter) |
| GET    | /api/admin/students/:id             | Single student       |
| POST   | /api/admin/students                 | Create student       |
| PUT    | /api/admin/students/:id             | Edit student         |
| DELETE | /api/admin/students/:id             | Delete student       |
| POST   | /api/admin/students/:id/attendance  | Mark attendance      |
| PUT    | /api/admin/students/:id/marks       | Update marks         |
| PUT    | /api/admin/students/:id/fees        | Update fees          |

### Notifications (authenticated)
| Method | Endpoint                    | Description       |
|--------|-----------------------------|-------------------|
| GET    | /api/notifications          | Get notifications |
| PUT    | /api/notifications/read-all | Mark all read     |
| DELETE | /api/notifications/:id      | Delete one        |

---

## ✨ Features Summary

### Student Panel
- ✅ Login/Register with JWT
- ✅ Dashboard with personal info, marks, attendance, fees
- ✅ Subject-wise marks with grades and charts
- ✅ Attendance calendar visualization
- ✅ In-app notifications (low attendance, fees, marks updates)
- ✅ Responsive design (mobile + desktop)

### Admin Panel
- ✅ Admin login (separate credentials)
- ✅ Dashboard with stats, charts (course distribution, fee pie)
- ✅ Add / Edit / Delete students
- ✅ Mark attendance (with duplicate date handling)
- ✅ Update marks (auto grade calculation)
- ✅ Update fees status
- ✅ Search + filter by course/fees
- ✅ Pagination
- ✅ Per-student detail page
- ✅ Notifications auto-sent on actions

---

## 🛠️ Tech Stack

| Layer    | Technology                |
|----------|---------------------------|
| Frontend | React 18, React Router 6  |
| Charts   | Recharts                  |
| Toasts   | react-hot-toast           |
| Backend  | Node.js, Express 4        |
| Database | MongoDB + Mongoose 8      |
| Auth     | JWT + bcryptjs            |
| Styling  | CSS-in-JS (inline styles) |

