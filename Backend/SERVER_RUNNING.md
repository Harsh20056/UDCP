# ✅ UDCP Backend Server - Successfully Running

## Server Status
- **Status**: ✅ Running
- **URL**: http://localhost:5001
- **Database**: ✅ Connected (PostgreSQL + PostGIS 3.6)
- **Socket.io**: ✅ Attached
- **CORS**: Configured for http://localhost:5173

## Port Change
⚠️ **Note**: Port changed from 5000 → 5001 because port 5000 was already in use.

**Action Required for Frontend**: Update the frontend `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## Database Setup Complete
- ✅ PostGIS extension enabled
- ✅ All 10 migrations completed
- ✅ Seed data loaded

### Seeded Demo Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@udcp.gov | Admin@123 |
| Approver | approver@udcp.gov | Staff@123 |
| Department Planner (PWD) | planner@udcp.gov | Staff@123 |
| Field Engineer | engineer@udcp.gov | Staff@123 |
| Citizen | citizen@udcp.gov | Citizen@123 |

**Plus 2 pending staff accounts** waiting for admin approval:
- pending.planner@udcp.gov / Staff@123 (Pending)
- pending.engineer@udcp.gov / Staff@123 (Pending)

## Quick Test

Health check endpoint working:
```bash
curl http://localhost:5001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-09T15:14:37.467Z"
}
```

## Available API Endpoints

All routes are prefixed with `/api`:

### Authentication (No auth required)
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Protected Routes (Require JWT token)
- `GET /api/auth/me`
- `GET /api/users/pending-staff` (admin only)
- `POST /api/users/:id/approve` (admin only)
- `POST /api/users/:id/reject` (admin only)
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/timeline`
- `GET /api/conflicts`
- `GET /api/conflicts/:id`
- `POST /api/conflicts/:id/resolve`
- `GET /api/approvals`
- `POST /api/approvals/:projectId/approve`
- `POST /api/approvals/:projectId/reject`
- `GET /api/approvals/:projectId/history`
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `GET /api/notifications/preferences`
- `PUT /api/notifications/preferences`
- `GET /api/notifications/email-sms-log`
- `GET /api/analytics/completion-rate`
- `GET /api/analytics/conflict-trend`
- `GET /api/analytics/department-performance`
- `GET /api/analytics/budget-utilization`
- `GET /api/audit-logs` (admin only)

### Citizen Portal (Public)
- `GET /api/citizen/projects` (no auth)
- `POST /api/citizen/feedback` (no auth)

## Testing with Postman/Insomnia

1. **Login** to get JWT token:
```
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "admin@udcp.gov",
  "password": "password123"
}
```

2. **Use the token** in subsequent requests:
```
Authorization: Bearer <your_jwt_token>
```

## Next Steps

### 1. Update Frontend Configuration
Edit `Frontend/.env`:
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:5001/api
```

### 2. Start Frontend
```bash
cd Frontend
npm run dev
```

### 3. Test Full Stack
- Login with demo credentials
- Create a new project
- Check conflict detection
- Test approval workflow
- View real-time notifications (Socket.io)

## Development Commands

```bash
# Restart server (in Backend directory)
npm run dev

# Reset database (clear all data and reseed)
npm run reset

# Run migrations only
npm run migrate

# Seed data only
npm run seed

# Undo all migrations
npm run migrate:undo

# Run tests
npm test

# Check setup health
node check-setup.js
```

## Server Logs

The server is running with nodemon and will auto-reload on file changes.

Current output:
```
✅ Database connected successfully
🚀 UDCP Backend running on http://localhost:5001
📡 Socket.io attached
🌐 CORS origin: http://localhost:5173
```

## Features Active

✅ **PostGIS Conflict Detection** - Spatial queries for location overlap  
✅ **JWT Authentication** - Secure token-based auth  
✅ **RBAC Authorization** - Role-based access control  
✅ **Request Validation** - Zod schema validation on all inputs  
✅ **Audit Logging** - All state changes tracked  
✅ **Real-time Notifications** - Socket.io for live updates  
✅ **State Machine Workflow** - Project status transitions  
✅ **Simulated Communications** - Email/SMS logging  

## Troubleshooting

### Server won't start
- Check if port 5001 is available
- Verify `.env` file has correct DATABASE_URL
- Check PostgreSQL is running

### Database errors
- Ensure PostGIS is installed: `SELECT PostGIS_version();`
- Try resetting: `npm run reset`

### CORS errors from frontend
- Verify CLIENT_URL in `.env` matches frontend URL
- Check frontend is using correct API_BASE_URL

---

**Server Status**: ✅ **RUNNING**  
**Ready for**: Full-stack integration testing
