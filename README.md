# DevFlow — Full-Stack Project Management Workspace

DevFlow is a full-stack project management application designed for student teams and agile software development teams. Inspired by developer tools like Linear, Jira, and Notion, DevFlow provides team workspaces, interactive Kanban task boards, real-time collaboration, task discussions, and activity audit logging.

Built with **React**, **Vite**, **Express.js**, and an embedded **SQLite** database.

---

## 🚀 Features

- **User Authentication**: Secure user registration, login, and password hashing using bcrypt with JWT token authentication.
- **Role-Based Project Workspaces**: Role security (**Owner**, **Admin**, **Member**) restricting project settings, member management, and task actions.
- **Interactive Kanban Board**: Visual 3-column board (**To Do**, **In Progress**, **Done**) with HTML5 drag-and-drop and fallback dropdown controls.
- **Task Management**: Create, assign, prioritize (Low, Medium, High), set deadlines, and track deliverables.
- **Task Comments & Collaboration**: Threaded discussions on tasks with author-only edit and delete enforcement.
- **Live Progress Tracking**: Dynamic completion percentages computed from actual SQLite task records.
- **Activity History Audit Log**: Chronological timeline of all project actions (task updates, status changes, comments, member additions).
- **Workspace Dashboard**: Aggregated metrics across all projects (total tasks, overdue tasks, in-progress tasks, personal assigned tasks).
- **Developer-First Dark Theme**: Professional charcoal UI with custom SVG icons, modals, and toasts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM (v6), Axios, CSS Custom Properties (Dark Theme) |
| **Backend** | Node.js, Express.js, RESTful API architecture |
| **Database** | SQLite via `better-sqlite3` (WAL mode & foreign key cascading) |
| **Authentication** | JSON Web Tokens (JWT) + bcrypt password hashing |

---

## 📸 Screenshots Placeholder

| View | Description |
|---|---|
| **Dashboard** | Metrics cards, personal assigned tasks, and recent activity overview |
| **Kanban Board** | Visual 3-column drag-and-drop board for tasks |
| **Task Details & Comments** | Detailed task modal with assignees, due dates, and discussion thread |
| **Team Management** | Member list table with role assignments and invitation modal |

---

## 💻 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18, 20, 22, or 24)
- npm (installed with Node.js)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DevFlow_fullstack_project
```

### 2. Install & Start Backend
```bash
cd server
npm install
node database/seed.js    # Initializes SQLite schema and seeds demo accounts
npm start               # Starts Express server on http://localhost:5000
```

### 3. Install & Start Frontend (in a separate terminal)
```bash
cd client
npm install
npm run dev             # Starts Vite development server on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

> [!TIP]
> **Single-Server Production Mode**:
> If you build the client (`cd client && npm run build`), you only need to run `npm start` in `server/`. Express will automatically serve the full-stack application on **`http://localhost:5000`**!

---

## 🔑 Demo Credentials

The database is pre-seeded with 3 demo accounts ready for evaluation:

| User | Email | Password | Role in Demo Project |
|---|---|---|---|
| **Ekansh** | `Ekansh@devflow.com` | `password123` | **Owner** (DevFlow Platform) |
| **Arnaav** | `Arnaav@devflow.com` | `password123` | **Admin** (DevFlow Platform) / **Owner** (Mobile Redesign) |
| **Charlie Davis** | `member3@devflow.com` | `password123` | **Member** (DevFlow Platform) |

*The login page also includes 1-click credential fill buttons for fast demonstration.*

---

## 📁 Repository Structure

```
DevFlow_fullstack_project/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI, Kanban, Tasks, Team, Comments
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Dashboard, Projects, Workspace, Profile, Auth
│   │   ├── services/           # Axios API service callers
│   │   ├── utils/              # Formatting helpers and color mappers
│   │   ├── App.jsx             # React Router routing & protected guards
│   │   └── index.css           # Design tokens & styles
│   └── vite.config.js          # Vite config with /api proxy
│
├── server/                     # Express & SQLite Backend
│   ├── config/                 # Database and JWT configuration
│   ├── controllers/            # Business logic and SQL execution
│   ├── database/               # SQLite initialization (init.js) and seeder (seed.js)
│   ├── middleware/             # JWT auth, project role authorization, error handling
│   ├── routes/                 # REST API endpoints
│   ├── services/               # Activity logger service
│   ├── test-backend.js         # 35-assertion automated integration test suite
│   ├── app.js                  # Express app setup and static asset serving
│   └── server.js               # Entry point
│
├── BACKEND_FLOW.md             # Detailed backend specification
├── PROJECT_FLOW.md             # Complete student execution flow & college viva guide
└── README.md                   # This project guide
```

---

## 🧪 Testing

The backend includes an automated integration test suite covering 35 test assertions across all routes and authorization checks:

```bash
cd server
node test-backend.js
```

**Test Coverage Summary:**
- Health check endpoint verification
- User registration and duplicate email handling
- Login with password hash verification
- Project CRUD, ownership assignment, and cascading deletes
- Team member additions, duplicate prevention, and role permissions
- Task creation, member assignment validation, and status transitions
- Task comment creation, viewing, and author-only edit/delete enforcement
- Real SQL aggregation calculations for dashboard metrics
- Project activity logging audit trail
- Authorization security boundaries (preventing unauthorized cross-project access)

---

## 📚 Project Documentation

For an in-depth explanation of the application architecture, database queries, step-by-step feature execution flows, and viva questions with answers, refer to:
- **[`PROJECT_FLOW.md`](./PROJECT_FLOW.md)** — Comprehensive architecture, Mermaid diagrams, feature flows, and 15+ viva Q&As.
- **[`BACKEND_FLOW.md`](./BACKEND_FLOW.md)** — Detailed backend architecture document.
