# Unified Department Coordination Platform (UDCP)

> The Unified Department Coordination Platform (UDCP) is a full-stack solution for streamlining inter-departmental collaboration and infrastructure planning. Built with React, Node.js, and PostGIS, it features spatial conflict detection, multi-tier approvals, role-based dashboards, and a citizen portal for public transparency.

## 🌟 Key Features
- **Spatial Conflict Detection:** Identify overlapping infrastructure projects across different departments using geospatial data (PostGIS).
- **Multi-tier Approvals:** Automated workflow for project submission, review, and approval.
- **Role-based Dashboards:** Custom views for Admins, Department Planners, Approvers, Field Engineers, and Citizens.
- **Real-time Notifications:** Instant alerts using Socket.io when conflicts arise or project statuses change.
- **Analytics & Audit Logs:** Track completion rates, budget utilization, and maintain a history of actions.
- **Citizen Portal:** A public-facing interface for citizens to view ongoing infrastructure projects and submit feedback.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** PostgreSQL, PostGIS (for geospatial queries)
- **ORM:** Sequelize

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (v16+) with **PostGIS extension** installed

---

### 1. Database Setup (PostGIS)

**Option A: Using Docker (Recommended for quick setup)**
```bash
docker run -d \
  --name udcp-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=udcp_db \
  -p 5432:5432 \
  postgis/postgis:16-3.4
```

**Option B: Local Installation**
1. Install PostgreSQL 16+ and the PostGIS extension.
2. Open your SQL terminal (psql) and run:
```sql
CREATE DATABASE udcp_db;
\c udcp_db
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

### 2. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd Backend
```

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```
Edit the `.env` file and set your `DATABASE_URL` with your actual Postgres credentials:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/udcp_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

3. **Database Migration & Seeding:**
Run the following commands to set up the tables and populate demo data:
```bash
npm run reset  # This will migrate and seed the database
```

4. **Start the backend server:**
```bash
npm run dev
```
The server will be running at `http://localhost:5000`.

---

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:
```bash
cd Frontend
```

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the `Frontend` folder (or copy from `.env.example` if available) and add:
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Start the frontend application:**
```bash
npm run dev
```
The app will be running at `http://localhost:5173`.

---

## 🔑 Demo Credentials (Post-Seeding)
Once you have run the database seeders, you can log into the platform using the following accounts. The default password for all demo accounts is **`password123`**.

| Role | Email |
| :--- | :--- |
| **Admin** | `admin@udcp.gov` |
| **Dept Planner (PWD)** | `pwd.planner@udcp.gov` |
| **Approver** | `approver@udcp.gov` |
| **Field Engineer** | `engineer@udcp.gov` |
| **Citizen** | `citizen@example.com` |

---

## 📁 Project Structure

```
UDCP Prototype/
├── Backend/                 # Node.js Express server
│   ├── src/
│   │   ├── controllers/     # Route logic
│   │   ├── migrations/      # DB schema changes
│   │   ├── models/          # Sequelize schemas
│   │   ├── routes/          # Express API endpoints
│   │   └── seeders/         # Mock data injection
│   └── package.json
└── Frontend/                # React Vite application
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Application views/routes
    │   └── services/        # API integrations
    └── package.json
```

## 📝 License
This project is licensed under the ISC License.
