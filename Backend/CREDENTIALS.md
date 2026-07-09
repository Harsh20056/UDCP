# UDCP Backend - Demo Credentials

## Server Information
- **Base URL**: http://localhost:5000
- **API Base**: http://localhost:5000/api
- **Database**: PostgreSQL with PostGIS 3.6
- **Status**: ✅ Running

## Demo User Accounts

### 1. Admin
- **Email**: admin@udcp.gov
- **Password**: Admin@123
- **Role**: admin
- **Permissions**: Full system access
- **Department**: N/A (system-wide access)

### 2. Department Planner
- **Email**: planner@udcp.gov
- **Password**: Staff@123
- **Role**: department_planner
- **Permissions**: Create/edit projects for their department
- **Department**: PWD (Public Works Department)

### 3. Approver
- **Email**: approver@udcp.gov
- **Password**: Staff@123
- **Role**: approver
- **Permissions**: Approve/reject projects
- **Department**: Municipal Corporation

### 4. Field Engineer
- **Email**: engineer@udcp.gov
- **Password**: Staff@123
- **Role**: field_engineer
- **Permissions**: View and update assigned projects
- **Department**: Water Supply & Sewerage

### 5. Citizen (Public Viewer)
- **Email**: citizen@udcp.gov
- **Password**: Citizen@123
- **Role**: public_viewer
- **Permissions**: View public project information only
- **Department**: N/A (public access)

## Pending Approval Accounts

These accounts need admin approval before they can login:

### 6. Pending Planner
- **Email**: pending.planner@udcp.gov
- **Password**: Staff@123
- **Status**: PENDING_APPROVAL
- **Role**: department_planner (when approved)
- **Department**: Electricity Board

### 7. Pending Engineer
- **Email**: pending.engineer@udcp.gov
- **Password**: Staff@123
- **Status**: PENDING_APPROVAL
- **Role**: field_engineer (when approved)
- **Department**: Telecom

## Testing User Approval Flow

1. **Try to login with pending account** (e.g., pending.planner@udcp.gov)
   - Response will indicate account is pending approval
   
2. **Login as admin** (admin@udcp.gov / Admin@123)

3. **Navigate to**: GET /api/users/pending-staff
   - View list of pending accounts

4. **Approve account**: POST /api/users/:id/approve
   - Or reject: POST /api/users/:id/reject

5. **Pending user can now login** successfully

## Quick Login Test

### Using cURL:

```bash
# Admin Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@udcp.gov",
    "password": "Admin@123"
  }'

# Department Planner Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "planner@udcp.gov",
    "password": "Staff@123"
  }'

# Citizen Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@udcp.gov",
    "password": "Citizen@123"
  }'
```

### Postman/Insomnia:

**Request**: 
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@udcp.gov",
  "password": "Admin@123"
}
```

**Response** (on success):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@udcp.gov",
      "role": "admin",
      "department": null
    }
  }
}
```

## Using the JWT Token

After login, use the returned token in subsequent requests:

```
Authorization: Bearer <your_jwt_token_here>
```

Example:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
```

## Frontend Integration

Update your `Frontend/.env`:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:5001/api
```

The frontend will now use these same credentials to authenticate against the real backend.

## Password Hashing

All passwords are hashed using bcrypt (salt rounds: 10) before storing in the database. Never store plaintext passwords.

## Security Notes

⚠️ **These are demo credentials for development only!**

For production:
- Use strong, unique passwords
- Enable HTTPS
- Implement rate limiting
- Add account lockout after failed attempts
- Use environment-specific JWT secrets
- Implement refresh tokens
- Add two-factor authentication

## Resetting Credentials

If you need to reset all data including credentials:

```bash
cd Backend
npm run reset
```

This will:
1. Drop all tables
2. Re-run migrations
3. Re-seed with demo data (using the credentials above)

---

**Last Updated**: After database reset with corrected credentials
**Database Status**: ✅ Fresh seed with all 5 active users + 2 pending
