# TODO

## Manager team assignment + user API permissions
- [ ] Update Prisma schema: add `managerId` to `User` (nullable) and relation to manager.
- [ ] Create migration + update Prisma client.
- [ ] Update `POST /users` (admin create user): allow optional `managerId` for MEMBER users.
- [ ] Update `GET /users`:
  - ADMIN sees all users in tenant
  - MANAGER sees only users with `managerId = req.user.id` (and optionally include manager)
- [ ] Update task assignment rules in `POST /tasks`:
  - ADMIN can assign to any user
  - MANAGER can assign only to users in their team
- [ ] Update task update rules in `PUT /tasks/:id` when `assignedToId` changes (MANAGER restriction)
- [ ] Run backend start and validate via Postman collection.


