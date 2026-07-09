# UDCP Backend

Node.js + Express + PostgreSQL/PostGIS backend for the Unified Department Coordination Platform.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 16+ with PostGIS extension
- A PostgreSQL database named `udcp_db` (or your preferred name)

## PostGIS Setup

### Option 1: Docker (Recommended for development)
```bash
docker run -d \
  --name udcp-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=udcp_db \
  -p 5432:5432 \
  postgis/postgis:16-3.4
```

### Option 2: Local PostgreSQL Installation
1. Install PostgreSQL 16+
2. Install PostGIS extension for your PostgreSQL version
3. Create database:
```sql
CREATE DATABASE udcp_db;
\c udcp_db
CREATE EXTENSION IF NOT EXISTS postgis;
```

Verify PostGIS is working:
```sql
SELECT PostGIS_version();
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example` and update values):
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/udcp_db
JWT_SECRET=your-long-random-secret-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

3. Run database migrations:
```bash
npm run migrate
```

4. Seed the database with demo data:
```bash
npm run seed
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env).

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run all pending migrations
- `npm run migrate:undo` - Undo all migrations
- `npm run seed` - Seed database with demo data
- `npm run seed:undo` - Clear seeded data
- `npm run reset` - Full database reset (undo migrations → migrate → seed)
- `npm test` - Run tests with Jest

## Database Reset (Fresh Start)

If you need to completely reset your database:
```bash
npm run reset
```

This will:
1. Undo all migrations (drop all tables)
2. Run all migrations (recreate schema)
3. Seed demo data

## API Routes

All API routes are prefixed with `/api`.

### Authentication
- `POST /api/auth/register` - Register new user (citizen or staff)
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/pending-staff` - List pending staff approvals (admin only)
- `POST /api/users/:id/approve` - Approve pending staff (admin only)
- `POST /api/users/:id/reject` - Reject pending staff (admin only)

### Projects
- `GET /api/projects` - List projects (with filters)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/timeline` - Get project status history

### Conflicts
- `GET /api/conflicts` - List detected conflicts
- `GET /api/conflicts/:id` - Get conflict details
- `POST /api/conflicts/:id/resolve` - Mark conflict as resolved

### Approvals
- `GET /api/approvals` - List pending approvals
- `POST /api/approvals/:projectId/approve` - Approve project
- `POST /api/approvals/:projectId/reject` - Reject project
- `GET /api/approvals/:projectId/history` - Get approval history

### Notifications
- `GET /api/notifications` - List user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update preferences
- `GET /api/notifications/email-sms-log` - View simulated email/SMS log

### Analytics
- `GET /api/analytics/completion-rate` - Project completion statistics
- `GET /api/analytics/conflict-trend` - Conflict detection trends
- `GET /api/analytics/department-performance` - Department metrics
- `GET /api/analytics/budget-utilization` - Budget analysis

### Audit Logs
- `GET /api/audit-logs` - List audit logs (admin only, with filters)

### Citizen Portal
- `GET /api/citizen/projects` - Public project listing (no auth required)
- `POST /api/citizen/feedback` - Submit citizen feedback

## Health Check

- `GET /health` - Server health status

## Demo Credentials (after seeding)

### Admin
- Email: `admin@udcp.gov`
- Password: `password123`

### Department Planner (PWD)
- Email: `pwd.planner@udcp.gov`
- Password: `password123`

### Approver
- Email: `approver@udcp.gov`
- Password: `password123`

### Field Engineer
- Email: `engineer@udcp.gov`
- Password: `password123`

### Citizen (Public Viewer)
- Email: `citizen@example.com`
- Password: `password123`

## Socket.io

Real-time notifications are available via Socket.io on the same server.

Connect to: `http://localhost:5000`

Events:
- `notification:new` - Emitted when a new notification is created

## Troubleshooting

### PostGIS Extension Not Found
```
ERROR: extension "postgis" is not available
```

Solution: Install PostGIS for your PostgreSQL version, or use the Docker image with PostGIS pre-installed (see PostGIS Setup above).

### Database Connection Failed
Check your `.env` file `DATABASE_URL` format:
```
DATABASE_URL=postgresql://username:password@host:port/database
```

Make sure:
- PostgreSQL server is running
- Database exists
- Credentials are correct
- Special characters in password are URL-encoded (e.g., `@` becomes `%40`, `#` becomes `%23`)

### Migration Errors
If migrations fail partway through:
```bash
npm run migrate:undo
npm run migrate
```

## Project Structure

```
Backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # HTTP server + Socket.io setup
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middleware
│   ├── migrations/         # Database schema migrations
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── seeders/            # Database seed data
│   ├── services/           # Business logic
│   ├── sockets/            # Socket.io handlers
│   ├── utils/              # Utility functions
│   └── validators/         # Zod validation schemas
├── .env                    # Environment variables (git-ignored)
├── .env.example            # Environment template
├── .sequelizerc            # Sequelize CLI config
├── jest.config.js          # Jest test configuration
└── package.json
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## License

ISC
