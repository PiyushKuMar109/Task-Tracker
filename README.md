# 🚀 TaskFlow Workspace

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Issues](https://img.shields.io/github/issues/PiyushKuMar109/task-tracker)](https://github.com/PiyushKuMar109/task-tracker/issues)
[![Last Commit](https://img.shields.io/github/last-commit/PiyushKuMar109/task-tracker)](https://github.com/PiyushKuMar109/task-tracker/commits/main)
[![Top Language](https://img.shields.io/github/languages/top/PiyushKuMar109/task-tracker)](https://github.com/PiyushKuMar109/task-tracker)

An enterprise-grade, multi-tenant workspace task tracker, team scheduler, and collaboration console.

---

## 📌 Overview

**TaskFlow** is a full-stack project tracker built to serve complex organizational workflows. The application solves critical operational bottlenecks by providing:
* **Multi-Tenant Workspace Boundaries**: Dynamic workspace separation ensuring zero data leakage across different client tenants.
* **Role-Based Operational Access**: Granular auth authorization tiers spanning administrators, managers, HR coordinators, developers, QAs, designers, and general members.
* **Scheduling & Performance Auditing**: Real-time Gantt timelines, interactive calendars, leave request pipelines, workload balancers, and stopwatch-synced logged hour analytics.

---

## ✨ Features

* **Multi-Tenant Workspaces**: Scoped tenant isolation boundaries checked via API route parameters.
* **Granular Role Controls (RBAC)**: Role checks (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `HR`, `DEVELOPER`, `QA`, `DESIGNER`, `MEMBER`) enforced via server-side middleware.
* **Drag-and-Drop Kanban Board**: Dynamic columns for visual task movements between Todo, In Progress, and Done.
* **Custom Task Tagging**: Color-coded text labels (e.g. `FE`, `QA`, `Design`) displaying as soft-colored capsules on task cards.
* **Task Checklists & Subtasks**: Nested checklist progress tracker showing completed steps percentage.
* **Stopwatch Time Tracker**: Synced inline timer that tracks logged seconds and writes automatically to the database on unmount or pause.
* **Pomodoro Focus Timer**: Customizable deep-work timer integrated directly into the sidebar panel.
* **Integrated Workspace Chat**: Polled message hub for real-time team chats.
* **Activity Logs Feed**: Workspace event logging recording changes to tasks, leaves, and configurations.
* **Leave Management Portal**: Complete submit-and-review absences mapping, overlaying approved leaves directly onto calendars.
* **Interactive Timeline View**: 14-day Gantt timeline grid representing active task schedule bars.
* **Inline Dashboard Calendar**: Integrated calendar toggle mapping task deadlines and leave requests.
* **Resource Workload Balancer**: Stats panel tracking assigned task ratios and total stopwatch hours per user.
* **Export Reports**: Generate and download CSV reports for both tasks and leave applications.
* **Base64 Task Attachments**: Direct file uploads and downloads stored securely as base64 strings in the database.
* **Workspace Policies Panel**: Admin portal to customize company name, maximum annual leaves, and weekly hours targets.
* **Developer API Access Keys**: Secure credentials keys generator for backend webhook integrations.
* **Live Day/Night Theme Switcher**: CSS Variables switcher with localStorage persistence swapping light/dark slate layouts instantly.

---

## 🛠 Tech Stack

### Frontend
* **Core**: React.js (Vite)
* **Styling**: Custom CSS Variables, Tailwind CSS
* **Icons & Notifications**: Lucide React, React Toastify

### Backend
* **Core**: Node.js, Express.js
* **ORM**: Prisma Client v6

### Database
* **Engine**: PostgreSQL

### Authentication
* **Token Auth**: JSON Web Tokens (JWT), Bcrypt password hashing

### Integrations
* **Exporters**: File-saver, Base64 File Readers

---

## 📂 Project Structure

```bash
Task-Tracker/
├── backend/                  # Server-side application directory
│   ├── prisma/               # Prisma Database Schemas and migrations
│   └── src/src/
│       ├── controllers/      # Express requests controllers
│       ├── routes/           # REST endpoints definitions
│       ├── middleware/       # JWT auth & role validation middleware
│       ├── utils/            # Activity logging and Prisma clients
│       └── app.js            # Express application mounting
│
├── frontend/                 # Client-side React application directory
│   ├── src/
│   │   ├── pages/            # Core views (Dashboard, Tasks, Leaves, Users, Settings, Login)
│   │   ├── components/       # Visual widgets (Navbar, Sidebar, TaskCard, Charts, Chat, Pomodoro)
│   │   ├── context/          # React authentication state providers
│   │   └── api/              # Axios HTTP request clients
│   └── index.html
│
└── README.md                 # Project documentation
```

### Purpose of Major Folders
* **`backend/src/src/controllers/`**: House logic endpoints, validation schemas, and database calls.
* **`backend/src/src/middleware/`**: Check request headers for valid JWT keys and authenticate role tiers.
* **`frontend/src/components/`**: House visual UI widgets (e.g. customized SVG donut and HTML bar charts).
* **`frontend/src/context/`**: Manages global logged user states, tokens, and active workspace tenant metadata.

---

## ⚙️ Environment Variables

Create a `.env` configuration file in the `backend/` folder:

| Variable     | Description | Example |
| ------------ | ----------- | ------- |
| `DATABASE_URL` | PostgreSQL connection endpoint | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`   | Key used to sign JWT auth cookies | `super_secure_random_key_token` |
| `PORT`         | Port backend server runs on | `5000` |

---

## 🛠 Installation

### 1. Database & Backend Configuration
```bash
# Clone the repository
git clone https://github.com/PiyushKuMar109/task-tracker.git
cd task-tracker

# Install server dependencies
cd backend
npm install

# Run schema migrations
npx prisma migrate dev --name init_schema
```

### 2. Frontend Installation
```bash
cd ../frontend
npm install
```

---

## 🚀 Running the Project

### 1. Run Backend Server (Development)
```bash
cd backend
npm run dev
```

### 2. Run Frontend Client (Development)
```bash
cd frontend
npm run dev
```

### 3. Build for Production
```bash
# Backend production run
cd backend
npm start

# Frontend compile build
cd frontend
npm run build
```

---

## 📖 API Documentation

### Authentication APIs
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/auth/register` | Register user under a tenant workspace |
| `POST` | `/api/auth/login` | Login user and issue JWT token |

### Task & Comments APIs
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/tasks` | Get all tasks scoped to the user's tenant |
| `POST` | `/api/tasks` | Create a new task and associate custom tags |
| `GET` | `/api/tasks/:id` | Get detailed task metrics by ID |
| `PUT` | `/api/tasks/:id` | Update task details, status, or assignee |
| `DELETE` | `/api/tasks/:id` | Delete task and cascade delete comments |
| `GET` | `/api/tasks/:id/comments` | Get flat task comments list |
| `POST` | `/api/tasks/:id/comments` | Create new comment on a task |
| `PUT` | `/api/tasks/:id/time` | Update logged stopwatch seconds |

### Subtasks & Attachments APIs
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/tasks/:id/subtasks` | Get checklist items |
| `POST` | `/api/tasks/:id/subtasks` | Add checkbox checklist item |
| `PUT` | `/api/tasks/subtasks/:id/toggle` | Toggle subtask completed state |
| `DELETE` | `/api/tasks/subtasks/:id` | Delete subtask item |
| `GET` | `/api/tasks/:id/attachments` | Get list of file attachments |
| `POST` | `/api/tasks/:id/attachments` | Upload Base64 file attachment |
| `GET` | `/api/tasks/attachments/:id` | Download attachment file stream |

### Leave Management & Users Directory APIs
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/leaves` | Retrieve leaves list (role scoped) |
| `POST` | `/api/leaves` | Request time-off application |
| `PUT` | `/api/leaves/:id/status` | Approve or Reject leave (Manager/HR/Admin only) |
| `GET` | `/api/users` | Retrieve workspace team directory list |
| `POST` | `/api/users` | Add user to workspace (restricted access) |
| `DELETE` | `/api/users/:id` | Remove user from workspace directory |

### Workspace Extras APIs
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/api/memos` | Retrieve checklist memos |
| `POST` | `/api/memos` | Add personal checkable memo |
| `PUT` | `/api/memos/:id/toggle` | Toggle memo completed status |
| `DELETE` | `/api/memos/:id` | Remove personal memo |
| `GET` | `/api/chat` | Retrieve workspace chat discussions logs |
| `POST` | `/api/chat` | Send a chat message to group |
| `GET` | `/api/export/tasks` | Download tasks database report as CSV |
| `GET` | `/api/export/leaves` | Download leaves database report as CSV |
| `GET` | `/api/notifications` | Get user notifications alerts |
| `PUT` | `/api/notifications/read-all` | Mark all user alerts as read |
| `PUT` | `/api/notifications/:id/read` | Mark alert as read by ID |
| `GET` | `/api/tenant-settings` | Get company settings policy thresholds |
| `PUT` | `/api/tenant-settings` | Update settings policies (restricted access) |
| `GET` | `/api/api-keys` | Retrieve active developer webhook API keys |
| `POST` | `/api/api-keys` | Create developer API key |
| `DELETE` | `/api/api-keys/:id` | Revoke developer API key |

---

## 🗄 Database Design

```mermaid
erDiagram
    TENANT ||--o{ USER : contains
    USER ||--o{ TASK : assignedTo
    USER ||--o{ TASK : createdBy
    TASK ||--o{ COMMENT : has
    TASK ||--o{ ATTACHMENT : contains
    TASK ||--o{ SUBTASK : includes
    TASK ||--o{ TAG : has
    USER ||--o{ LEAVEREQUEST : requests
    USER ||--o{ LEAVEREQUEST : approves
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ APIKEY : manages
    USER ||--o{ MEMO : drafts
    USER ||--o{ CHATMESSAGES : sends
```

### Models & Key Attributes
* **Tenant**: Contains `id` [CUID PK], `tenantId` [Unique index], `name`.
* **User**: Contains `id` [Int PK], `name`, `email` [Unique index], `password`, `role` [Enum Role], `tenantId`.
* **Task**: Contains `id` [Int PK], `title`, `description`, `priority` [LOW/MEDIUM/HIGH], `status` [Enum Status], `dueDate`, `timeSpent`.
* **Tag**: Contains `id` [Int PK], `name`, `color` [Hex value], `taskId`.

### Relationships Summary
* **One Tenant → Many Users** (Organization workspace isolation).
* **One User → Many Assigned Tasks** (Task allocations).
* **One Task → Many Comments / Subtasks / Attachments / Tags** (Cascaded lists on cards).
* **One User → Many Leave Requests** (Absences records).

---

## 🔄 Application Workflow

1. **User Sign Up & Login**: 
   - A user signs up under a specific tenant workspace.
   - The user authenticates, and the backend issues a signed JWT containing their role.
2. **Dashboard Overview**:
   - The user views their personalized dashboard. 
   - Custom SVG charts dynamically plot progress metrics, a private checklist handles quick memos, and a workspace event feed logs global updates.
   - If the user has overdue tasks, a red banner displays at the top of the dashboard.
3. **Task Operations**:
   - Authorized users create tasks, define priorities, allocate due dates, and add custom tags.
   - Assignees toggle subtask lists, log work stopwatch hours, upload/download Base64 attachments, and post comments on-demand.
4. **Kanban & Gantt Scheduling**:
   - Team members drag task cards across columns, sync stopwatch hours, view active deadlines in a 14-day Gantt timeline grid, or review them on a monthly calendar alongside approved leaves.
5. **Team Absence Requests**:
   - Members apply for leaves. Managers or HR review and approve/reject applications, which automatically maps absences onto calendars.
6. **Workspace Administration**:
   - Admins configure workspace policy limits and generate developer API keys for system automation integrations.

---

## 📷 Screenshots

### Login Page
*(Add Screenshot Here)*

### Dashboard Overview
*(Add Screenshot Here)*

### Tasks & Kanban Board
*(Add Screenshot Here)*

### Leaves Dashboard
*(Add Screenshot Here)*

### Team Management
*(Add Screenshot Here)*

### Settings & Developer Keys
*(Add Screenshot Here)*

---

## 🚀 Deployment

### Render Deployment (Backend Node API)
1. Link your GitHub repository.
2. Configure **Build Command**: `cd backend && npm install`.
3. Configure **Start Command**: `cd backend && node src/src/app.js` (or trigger starting index).
4. Map your Environment Variables (`DATABASE_URL`, `JWT_SECRET`) in Render's configuration.

### Vercel Deployment (Frontend React App)
1. Set framework preset to **Vite**.
2. Configure **Build Command**: `npm run build`.
3. Configure **Output Directory**: `dist`.

---

## 🧪 Testing

Run backend integrations unit tests:
```bash
cd backend
npm run test
```

---

## 🔒 Security Features

* **JWT Token Security**: Stored headers authentication token signatures validated on every private API route.
* **Bcrypt Password Encryption**: Salt-hashed passwords stored securely in PostgreSQL.
* **Role Verification Middleware**: Rejects unauthorized access queries based on the user's role.
* **CORS Protocol**: Configured to restrict requests to authorized server and client domains.
* **Prisma Injection Safeguards**: Queries parameterized natively by Prisma ORM to prevent SQL Injection.

---

## ⚡ Performance Optimizations

* **Vite Rendering Speed**: Fast, optimized dev server loads pages instantly.
* **Custom SVG Charts**: Custom computed inline SVG graphics replace heavy third-party recharts libraries, **cutting production bundle size by 50%** (from `728.51 kB` down to `394.70 kB`).
* **Relational Query Includes**: Optimized PostgreSQL indexes and joins to fetch all records in single queries.

---

## 🔮 Future Improvements

* **Slack Real-time Webhooks**: Dispatch automated alerts directly to Slack channels when tasks are completed.
* **OAuth SSO Login**: Allow team members to log in using Google Workspace or Microsoft Azure profiles.
* **Overdue Email Digests**: Cron jobs to dispatch weekly reminders for pending overdue tasks.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 👤 Author

* **Name**: Piyush
* **GitHub**: [@PiyushKuMar109](https://github.com/PiyushKuMar109)

---

⭐ *If you found this project helpful, please consider giving it a star on GitHub!*