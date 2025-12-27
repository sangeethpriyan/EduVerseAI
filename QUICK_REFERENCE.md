# EduVerse AI - Quick Reference Card

## 🚀 Common Commands

```bash
# Development
npm run dev                    # Start all servers (frontend + API)
npm run build                 # Build all packages
npm run lint                  # Lint all code
npm run test                  # Run tests

# Database
npm run db:push              # Apply Prisma migrations
npm run db:migrate           # Create new migration
npm run db:seed             # Seed demo data

# Docker
docker-compose up -d        # Start all services
docker-compose down         # Stop all services
docker-compose logs -f api  # View API logs

# Individual Apps
npm run dev -w apps/api     # Start only API
npm run dev -w apps/web     # Start only frontend
npm run build -w packages/shared  # Build shared package
```

## 📁 Important Files & Locations

| Purpose | Location |
|---------|----------|
| Environment Variables | `.env.example`, `.env.local` |
| Database Schema | `packages/db/prisma/schema.prisma` |
| API Routes | `apps/api/src/routes/*.routes.ts` |
| API Middleware | `apps/api/src/middleware/auth.ts` |
| API Services | `apps/api/src/services/*.service.ts` |
| Frontend Pages | `apps/web/app/(role)/*/page.tsx` |
| Shared Types | `packages/shared/src/types/` |
| RBAC Config | `packages/shared/src/rbac/index.ts` |
| Docker Setup | `docker-compose.yml` |

## 🔐 Authentication

### Login Process
```typescript
// 1. POST /api/auth/login
const response = await axios.post("/api/auth/login", {
  email: "user@example.com",
  password: "password123"
});

// 2. Store tokens
localStorage.setItem("accessToken", response.data.data.accessToken);
// refreshToken stored automatically in httpOnly cookie

// 3. Make API calls
axios.get("/api/student/courses", {
  headers: { Authorization: `Bearer ${token}` }
});

// 4. Refresh token when expired
const newToken = await axios.post("/api/auth/refresh");
```

### Required Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 📊 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout

### Student
- `GET /api/student/courses` - Enrolled courses
- `GET /api/student/courses/:id` - Course details
- `GET /api/student/attendance` - Attendance status
- `GET /api/student/fees` - Fee information
- `GET /api/student/assignments/:courseId` - Assignments
- `POST /api/student/assignments/:id/submit` - Submit assignment

## 🎯 Role Permissions Quick Lookup

### Student
- `view_own_courses`, `submit_assignment`, `view_own_attendance`, `view_own_fees`, `use_ai_assistant`

### Teacher
- Everything student + `create_course`, `grade_assignments`, `mark_attendance`, `use_ai_tools`

### Admin
- Everything teacher + `manage_students`, `manage_teachers`, `manage_courses`, `view_financial_reports`

### Super Admin
- All 30+ permissions

## 🗄️ Database Tables

### Core Entities
- `User` - Authentication
- `Student` - Student profile
- `Teacher` - Teacher profile
- `Course` - Course definition
- `Enrollment` - Student-Course relationship

### Academic
- `Assignment` - Assignment definition
- `AssignmentSubmission` - Student submission
- `Attendance` - Daily attendance
- `StudentMark` - Internal + External marks

### Finance
- `FeeStructure` - Fee information
- `FeeInstallment` - Installment plan
- `Payment` - Payment records

### Other
- `AuditLog` (MongoDB) - Action logging
- `ChatSession`, `ChatMessage` (MongoDB) - AI chat
- `AIDocument`, `DocumentChunk` (Both) - RAG system

## 🔄 Adding New Features

### New API Endpoint
1. Update/Create service in `apps/api/src/services/`
2. Create controller in `apps/api/src/controllers/`
3. Add route in `apps/api/src/routes/`
4. Import route in `apps/api/src/main.ts`

### New Database Table
1. Add model to `packages/db/prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Export in `packages/db/src/index.ts`

### New Page
1. Create file in `apps/web/app/(role)/feature/page.tsx`
2. Create API hook in `apps/web/lib/hooks/`
3. Import and use in component

### New Type
1. Add to `packages/shared/src/types/models.ts`
2. Export from `packages/shared/src/index.ts`
3. Import in consuming packages

## 🐛 Debugging

### API Issues
```bash
# Check API logs
docker logs eduverse-api

# Test endpoint
curl -X GET http://localhost:3001/health

# Check database connection
npm run db:push --dry-run
```

### Frontend Issues
```bash
# Check browser console
# Check Network tab for API calls
# Check localStorage for tokens

# View build errors
npm run build -w apps/web

# Check environment variables
cat .env.local
```

### Database Issues
```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d eduverse_db

# Connect to MongoDB
mongosh "mongodb://localhost:27017/eduverse"

# Check Redis
redis-cli ping
```

## 📈 Performance Tips

1. **Caching**: Use Redis for frequently accessed data
2. **Pagination**: Always paginate large result sets
3. **Indexing**: Add database indexes for common queries
4. **Lazy Loading**: Load components on demand in React
5. **Code Splitting**: Use Next.js dynamic imports

## 🔒 Security Checklist

- [ ] Environment variables are secure
- [ ] No passwords in logs
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Input validation enabled
- [ ] SQL injection protected (Prisma)
- [ ] XSS protection (React auto-escapes)

## 📱 Testing Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `student1@eduverse.com` | `student123` |
| Teacher | `teacher1@eduverse.com` | `teacher123` |
| Admin | `admin@eduverse.com` | `admin123` |

## 🌍 Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/eduverse_db
MONGODB_URI=mongodb://localhost:27017/eduverse
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=24h

# API
API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: AI, Storage, Email
OPENAI_API_KEY=your-key
AWS_REGION=us-east-1
SMTP_HOST=smtp.gmail.com
```

## 📞 Getting Help

- Check `DEVELOPMENT.md` for detailed guide
- Check `ARCHITECTURE.md` for system design
- Check `API_DOCS.md` for endpoint details
- Check inline code comments
- Check git history for changes

## ⚡ Performance Targets

- Login: < 1 second
- Dashboard load: < 2 seconds
- API response (avg): < 500ms
- AI response: < 3 seconds
- Page transition: < 200ms

## 🔄 CI/CD Pipeline (Ready to Implement)

1. Code pushed to GitHub
2. GitHub Actions runs tests
3. Build Docker images
4. Push to registry
5. Deploy to production
6. Run smoke tests

---

**Last Updated**: December 24, 2025
