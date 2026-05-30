# 🚀 Task Tracker

<p align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-black?logo=prisma)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

</p>

---

## 📌 Overview

Task Tracker is a full-stack multi-tenant task management system built with:

- React + Vite
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Authentication

It allows organizations to manage tasks, assign users, track progress, and monitor productivity through an analytics dashboard.

---

## ✨ Features

### Authentication

✅ Login

✅ Registration

✅ JWT Authentication

✅ Role Based Access

---

### Task Management

✅ Create Tasks

✅ Assign Tasks

✅ Update Task Status

✅ Delete Tasks

✅ Task Comments

✅ Search Tasks

✅ Filter Tasks

---

### Dashboard

✅ Total Tasks

✅ Completed Tasks

✅ Pending Tasks

✅ Analytics Charts

✅ Progress Tracking

---

### User Management

✅ View Users

✅ Role Control

✅ Admin Access Only

---

### Modern UI

✅ Dark Productivity Theme

✅ Responsive Design

✅ Mobile Sidebar

✅ Loading Skeletons

✅ Empty States

✅ Confirmation Modals

---

## 🛠 Tech Stack

### Frontend

- React
- React Router DOM
- Tailwind CSS
- Axios
- Recharts
- React Toastify
- Lucide React

### Backend

- Node.js
- Express.js
- Prisma ORM
- JWT
- bcrypt

### Database

- PostgreSQL

---

# 📷 Screenshots

## Login

![Login](screenshots/login.png)

---

## Dashboard

![Dashboard](screenshots/dashboard.png)

---

## Tasks

![Tasks](screenshots/tasks.png)

---

## Users

![Users](screenshots/users.png)

---

# 📂 Project Structure

```bash
Task-Tracker/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── app.js
│   │
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── api/
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

---

# ⚙️ Backend Setup

## 1 Clone Repository

```bash
git clone https://github.com/yourusername/task-tracker.git

cd task-tracker
```

---

## 2 Backend Installation

```bash
cd backend

npm install
```

---

## 3 Create Environment Variables

Create:

```env
backend/.env
```

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/task_tracker"

JWT_SECRET="your_secret_key"

PORT=5000
```

---

## 4 Setup Database

Open PostgreSQL and create database:

```sql
CREATE DATABASE task_tracker;
```

---

## 5 Run Prisma Migration

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

## 6 Start Backend

```bash
npm run dev
```

Server:

```bash
http://localhost:5000
```

---

# 🎨 Frontend Setup

## 1 Install Dependencies

```bash
cd frontend

npm install
```

---

## 2 Create Environment File

Create:

```env
frontend/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 3 Start Frontend

```bash
npm run dev
```

Frontend:

```bash
http://localhost:5173
```

---

# 🗄 Database Setup

Open Prisma Studio:

```bash
npx prisma studio
```

URL:

```bash
http://localhost:5555
```

---

## Prisma Commands

Migration

```bash
npx prisma migrate dev --name update
```

Generate Client

```bash
npx prisma generate
```

Reset Database

```bash
npx prisma migrate reset
```

Open Studio

```bash
npx prisma studio
```

---

# 🔑 Roles

| Role | Permissions |
|--------|-------------|
| ADMIN | Full Access |
| MANAGER | Create & Manage Tasks |
| MEMBER | View & Update Assigned Tasks |

---

# 📡 API Endpoints

## Auth

```http
POST /api/auth/register
POST /api/auth/login
```

---

## Tasks

```http
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

---

## Users

```http
GET /api/users
```

---

## Comments

```http
GET  /api/comments/task/:taskId
POST /api/comments
```

---

# 🚀 Future Improvements

- Email Notifications
- Drag & Drop Kanban Board
- Team Workspaces
- File Attachments
- Real-Time Updates (Socket.io)
- Activity Logs
- Dark/Light Theme Toggle

---

# 👨‍💻 Author

**Piyush**

GitHub:

https://github.com/yourusername

LinkedIn:

https://linkedin.com/in/yourprofile

---

## ⭐ Support

If you like this project:

⭐ Star the repository

🍴 Fork the repository

🐛 Open issues

📢 Share with others

---

Made with ❤️ using React, Node.js and PostgreSQL