# Task Tracker API Testing Guide

## Overview
This guide provides instructions for testing all API endpoints with Postman, including comprehensive multitenant isolation tests.

## Prerequisites
- Node.js and npm installed
- PostgreSQL database running
- Backend server running on port 5000 (or configured PORT)
- Postman desktop application installed

## Setup Instructions

### 1. Start the Backend Server
```bash
cd backend
npm install
npx prisma migrate dev
npm start
```

### 2. Import Postman Collection
1. Open Postman
2. Click "Import" in the top left
3. Select `Task_Tracker_API_Postman_Collection.json` from the backend folder
4. The collection will be imported with all endpoints organized in folders

### 3. Configure Environment Variables
The collection uses the following variables (auto-configured):
- `baseUrl`: API base URL (default: http://localhost:5000)
- `tenant1_token`: JWT token for Tenant 1 admin
- `tenant2_token`: JWT token for Tenant 2 admin
- `tenant1_admin_id`: User ID for Tenant 1 admin
- `tenant2_admin_id`: User ID for Tenant 2 admin
- `tenant1_task_id`: Task ID created for Tenant 1
- `tenant2_task_id`: Task ID created for Tenant 2

## API Endpoints Summary

### Authentication Routes (`/api/auth`)
- **POST** `/api/auth/signup` - Create new user with tenantId
- **POST** `/api/auth/login` - Login and receive JWT token

### Task Routes (`/api/tasks`)
- **POST** `/api/tasks` - Create task (ADMIN, MANAGER only)
- **GET** `/api/tasks` - Get all tasks for tenant (filtered by role)
- **GET** `/api/tasks/:id` - Get specific task (tenant-scoped)
- **PUT** `/api/tasks/:id` - Update task (MEMBER can only update status)
- **DELETE** `/api/tasks/:id` - Delete task (ADMIN, MANAGER only)

### User Routes (`/api/users`)
- **GET** `/api/users` - Get all users for tenant (ADMIN only)
- **PUT** `/api/users/:id/role` - Update user role (ADMIN only)

### Comment Routes (`/api/tasks/:id/comments`)
- **POST** `/api/tasks/:id/comments` - Add comment to task
- **GET** `/api/tasks/:id/comments` - Get comments for task

## Testing Workflow

### Phase 1: Setup Tenants
Run requests in order:
1. **1. AUTH - Tenant 1 Setup**
   - Signup Tenant 1 Admin
   - Signup Tenant 1 Manager
   - Signup Tenant 1 Member
   - Login Tenant 1 Admin (auto-saves token)

2. **2. AUTH - Tenant 2 Setup**
   - Signup Tenant 2 Admin
   - Signup Tenant 2 Manager
   - Signup Tenant 2 Member
   - Login Tenant 2 Admin (auto-saves token)

### Phase 2: Test Task Operations
3. **3. TASKS - Tenant 1 Operations**
   - Create Task - Tenant 1
   - Get All Tasks - Tenant 1
   - Get Task by ID - Tenant 1
   - Update Task - Tenant 1

4. **4. TASKS - Tenant 2 Operations**
   - Create Task - Tenant 2
   - Get All Tasks - Tenant 2
   - Get Task by ID - Tenant 2

### Phase 3: Multitenant Isolation Tests
5. **5. MULTITENANT ISOLATION TESTS**
   - TEST: Tenant 1 cannot access Tenant 2 task (should return 404)
   - TEST: Tenant 2 cannot access Tenant 1 task (should return 404)
   - TEST: Tenant 1 users only (should only show tenant-1 users)
   - TEST: Tenant 2 users only (should only show tenant-2 users)

### Phase 4: Comment Operations
6. **6. COMMENTS - Tenant 1**
   - Add Comment - Tenant 1
   - Get Comments - Tenant 1

7. **7. COMMENTS - Tenant 2**
   - Add Comment - Tenant 2
   - Get Comments - Tenant 2

### Phase 5: User Management
8. **8. USER MANAGEMENT - Admin Only**
   - Get All Users - Tenant 1 Admin
   - Update User Role - Tenant 1 Admin

### Phase 6: Role-Based Access Tests
9. **9. ROLE-BASED ACCESS TESTS**
   - TEST: Member cannot create task (should fail with 403)
   - TEST: Member can only update status

### Phase 7: Cleanup
10. **10. CLEANUP**
    - Delete Task - Tenant 1
    - Delete Task - Tenant 2

## Multitenant Architecture Verification

### How Multitenancy Works
1. **Tenant Identification**: Each user has a `tenantId` field
2. **JWT Token**: Includes `tenantId` in the payload
3. **Data Filtering**: All queries filter by `req.user.tenantId`
4. **Isolation**: Users from one tenant cannot access another tenant's data

### Expected Behavior
- Users from Tenant 1 can only see tasks with `tenantId = "tenant-1"`
- Users from Tenant 2 can only see tasks with `tenantId = "tenant-2"`
- Cross-tenant access attempts return 404 (not found)
- Comments are also tenant-scoped

### Manual Verification Steps
1. Create tasks for both tenants
2. Note the task IDs from responses
3. Try accessing Tenant 2's task with Tenant 1's token
4. Verify you get 404 error
5. Check that each tenant's task list only shows their own tasks

## Role-Based Access Control

### Roles and Permissions
- **ADMIN**: Full access to all endpoints
- **MANAGER**: Can create/update/delete tasks, view all tenant tasks
- **MEMBER**: Can only view assigned tasks, update task status only

### Testing RBAC
1. Login as different roles
2. Try accessing endpoints beyond role permissions
3. Verify 403 Forbidden responses for unauthorized access

## Common Issues and Solutions

### Issue: "User already exists"
**Solution**: Change email addresses in signup requests or clear database

### Issue: "Task not found" (404)
**Solution**: Ensure you're using the correct tenant token and task ID

### Issue: "Invalid credentials"
**Solution**: Verify email and password match exactly what was used in signup

### Issue: "tenantId is required"
**Solution**: Ensure tenantId is included in signup request body

### Issue: "Invalid role"
**Solution**: Use only: ADMIN, MANAGER, or MEMBER (case-insensitive)

## Database Schema Reference

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(MEMBER)
  tenantId  String
  createdAt DateTime @default(now())
}
```

### Task Model
```prisma
model Task {
  id           Int      @id @default(autoincrement())
  title        String
  description  String
  priority     String
  status       Status   @default(TODO)
  dueDate      DateTime
  tenantId     String
  createdById  Int
  assignedToId Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Comment Model
```prisma
model Comment {
  id          Int      @id @default(autoincrement())
  message     String
  tenantId    String
  taskId      Int
  createdById Int
  createdAt   DateTime @default(now())
}
```

## Automated Testing Scripts

### Run All Tests in Order
1. In Postman, right-click the collection
2. Select "Run collection"
3. Choose the iteration count (usually 1)
4. Click "Run Task Tracker API - Multitenant"

### Run Specific Folder
1. Expand the collection
2. Right-click on a folder (e.g., "5. MULTITENANT ISOLATION TESTS")
3. Select "Run folder"
4. Click "Run"

## Security Considerations

### JWT Token Structure
```json
{
  "id": 1,
  "role": "ADMIN",
  "tenantId": "tenant-1",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Best Practices
- Never share JWT tokens
- Use HTTPS in production
- Implement token refresh mechanism
- Validate all inputs on server side
- Use environment variables for sensitive data

## Troubleshooting

### Server Not Responding
```bash
# Check if server is running
netstat -an | findstr :5000

# Restart server
cd backend
npm start
```

### Database Connection Issues
```bash
# Check DATABASE_URL in .env file
# Ensure PostgreSQL is running
# Run migrations
npx prisma migrate dev
```

### Clear Database for Fresh Testing
```bash
npx prisma migrate reset
```

## Additional Resources

- Prisma Documentation: https://www.prisma.io/docs
- Express.js Documentation: https://expressjs.com/
- JWT Documentation: https://jwt.io/
- Postman Learning Center: https://learning.postman.com/

## Support
For issues or questions, refer to the backend TODO.md or contact the development team.
