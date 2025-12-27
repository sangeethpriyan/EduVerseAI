# EduVerse AI - System Architecture

## System Overview

EduVerse AI is a distributed, production-ready platform consisting of three main layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  Next.js 14 (React 18) - Student/Teacher/Admin Portals    │
│         Running on port 3000 (development)                  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
│     Express.js + TypeScript - RESTful API                  │
│    Running on port 3001 (development)                      │
│  • Controllers → Services → Repositories                   │
│  • JWT Auth & RBAC Middleware                             │
│  • Error Handling & Logging                               │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL/NoSQL
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                               │
│  • PostgreSQL (Structured Data) - Prisma ORM              │
│  • MongoDB (Unstructured Data) - Mongoose                 │
│  • Redis (Caching & Sessions)                            │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Architecture

### 1. Frontend Layer (apps/web)

**Technology**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS

**Structure**:
```
apps/web/
├── app/                           # App Router pages
│   ├── (auth)/                   # Public auth routes
│   │   ├── page.tsx              # Login
│   │   └── register/page.tsx     # Register
│   ├── (student)/                # Protected student routes
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── assignments/
│   │   ├── attendance/
│   │   └── fees/
│   ├── (teacher)/                # Protected teacher routes
│   ├── (admin)/                  # Protected admin routes
│   └── layout.tsx                # Root layout
├── components/                    # Reusable components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components
│   ├── dashboard/                # Dashboard-specific
│   └── ai/                       # AI chat components
├── lib/                          # Utilities & hooks
│   ├── api-client.ts            # Axios instance
│   ├── hooks/                   # Custom React hooks
│   └── utils/                   # Helper functions
└── styles/                       # Global styles
```

**Key Features**:
- Server-side rendering (SSR) with Next.js
- Client-side state management with Zustand
- Data fetching with React Query (TanStack Query)
- Form handling with React Hook Form + Zod validation
- Tailwind CSS for styling
- Responsive design (mobile-first)

**Authentication Flow**:
```
1. User enters credentials on login page
2. Submit to /api/auth/login
3. Receive access_token + refresh_token
4. Store in localStorage + httpOnly cookie
5. Include access_token in Authorization header for API calls
6. On token expiry, use refresh_token to get new access_token
```

### 2. API Layer (apps/api)

**Technology**: Express.js, TypeScript, Node.js 18

**Architecture Pattern**: MVC + Repository Pattern

```
apps/api/src/
├── controllers/          # Request handlers (MVC Controller)
│   ├── auth.controller.ts
│   ├── student.controller.ts
│   ├── teacher.controller.ts
│   └── admin.controller.ts
├── services/            # Business logic (MVC Model)
│   ├── auth.service.ts
│   ├── student.service.ts
│   ├── teacher.service.ts
│   ├── ai.service.ts
│   └── document.service.ts
├── repositories/        # Data access layer (Database layer)
│   ├── user.repository.ts
│   ├── course.repository.ts
│   ├── assignment.repository.ts
│   └── attendance.repository.ts
├── middleware/          # Express middleware
│   ├── auth.ts         # JWT validation, RBAC
│   ├── validation.ts   # Input validation (Zod)
│   └── errorHandler.ts # Error handling
├── routes/             # API endpoint definitions
│   ├── auth.routes.ts
│   ├── student.routes.ts
│   ├── teacher.routes.ts
│   └── admin.routes.ts
├── utils/              # Utility functions
│   ├── jwt.ts         # JWT generation/verification
│   ├── password.ts    # Bcrypt hashing
│   ├── logger.ts      # Winston logging
│   ├── response.ts    # Response formatting
│   └── cache.ts       # Redis caching
├── config/             # Configuration
│   ├── database.ts
│   ├── redis.ts
│   └── ai.ts
└── main.ts            # Express app entry point
```

**Request Flow**:
```
Client Request
    ↓
Express Middleware (CORS, Helmet, Rate Limit)
    ↓
Authentication Middleware (JWT validation)
    ↓
Authorization Middleware (RBAC permission check)
    ↓
Controller (Request parsing)
    ↓
Service (Business logic)
    ↓
Repository (Database queries)
    ↓
Response Handler (Formatting & sending response)
```

**Example Endpoint**:
```typescript
// Route definition
router.get("/student/courses", authMiddleware, StudentController.getCourses);

// Controller
class StudentController {
  static async getCourses(req: Request, res: Response) {
    const { studentId } = req.user;
    const courses = await studentService.getEnrolledCourses(studentId);
    ApiResponseHandler.success(res, courses);
  }
}

// Service
class StudentService {
  async getEnrolledCourses(studentId: string) {
    return await prisma.enrollment.findMany({
      where: { studentId },
      include: { course: true }
    });
  }
}
```

### 3. Database Layer (packages/db)

**Technology**: Prisma (PostgreSQL), Mongoose (MongoDB)

**Data Model**:

#### PostgreSQL (Structured ERP/LMS Data)

```
User (Authentication)
├── Student
│   ├── Enrollment → Course
│   │   ├── CourseMaterial
│   │   ├── Assignment
│   │   │   └── AssignmentSubmission
│   │   ├── Attendance
│   │   └── StudentMark
│   ├── FeeStructure
│   │   ├── FeeInstallment
│   │   └── Payment
│   └── ChatSession
└── Teacher
    ├── Course
    ├── Assignment
    ├── StudentMark
    └── AuditLog
```

**Key Tables**:

- **User**: Core user entity (email, password, role)
- **Student**: Student profile (rollNo, semester, status)
- **Teacher**: Teacher profile (empId, department, expertise)
- **Course**: Course definition (code, name, credits)
- **Enrollment**: Student-Course relationship
- **Attendance**: Daily attendance records
- **Assignment**: Assignment definitions
- **AssignmentSubmission**: Student submissions with metadata
- **FeeStructure**: Fee information per semester
- **StudentMark**: Internal + external marks

#### MongoDB (Unstructured Data)

```javascript
// AuditLog Collection
{
  _id: ObjectId,
  userId: "string",
  action: "string",
  resourceType: "string",
  changes: {...},
  timestamp: Date
}

// ChatMessage Collection
{
  _id: ObjectId,
  sessionId: "string",
  role: "user" | "assistant",
  content: "string",
  retrievedDocuments: [{id, title, excerpt, score}],
  timestamp: Date
}

// DocumentChunk Collection
{
  _id: ObjectId,
  documentId: "string",
  content: "string",
  tokenCount: number,
  embeddingId: "string",  // Reference to vector DB
  createdAt: Date
}
```

**Redis (Caching & Sessions)**:
```
Key Format Patterns:
- user:session:{sessionId} → User session data
- student:courses:{studentId} → Cached courses
- course:materials:{courseId} → Cached materials
- attendance:cache:{courseId} → Attendance summary

TTL Strategy:
- 5 minutes: Session data
- 30 minutes: User profile
- 1 hour: Course list
- 24 hours: Static configurations
```

### 4. Shared Packages

#### @eduverse/shared
```
shared/src/
├── rbac/                    # Role-based access control
│   └── index.ts            # Roles, permissions, ROLE_PERMISSIONS map
├── types/
│   ├── models.ts           # TypeScript interfaces
│   └── validation.ts       # Zod schemas
├── constants/
│   └── index.ts            # Constants (thresholds, limits)
└── index.ts               # Main export
```

**RBAC Structure**:
```typescript
enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin"
}

enum Permission {
  VIEW_OWN_COURSES = "view_own_courses",
  SUBMIT_ASSIGNMENT = "submit_assignment",
  GRADE_ASSIGNMENTS = "grade_assignments",
  MANAGE_SYSTEM_CONFIG = "manage_system_config",
  // ... 30+ permissions
}

ROLE_PERMISSIONS: Record<UserRole, Permission[]>
// Defines which permissions each role has
```

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────┐
│          User Registration              │
└─────────────────────────────────────────┘
            ↓
    Password hashing (bcryptjs)
            ↓
┌─────────────────────────────────────────┐
│       User Login                        │
│  Email + Password Validation            │
└─────────────────────────────────────────┘
            ↓
    Check credentials against hash
            ↓
┌─────────────────────────────────────────┐
│   Generate Tokens                       │
│  • Access Token (24h, JWT)             │
│  • Refresh Token (7d, httpOnly cookie) │
└─────────────────────────────────────────┘
            ↓
    Send to client
            ↓
┌─────────────────────────────────────────┐
│   Client stores tokens                  │
│  • Access in memory/localStorage       │
│  • Refresh in httpOnly cookie          │
└─────────────────────────────────────────┘
            ↓
    On API request: Include access token
            ↓
┌─────────────────────────────────────────┐
│   API validates token                   │
│  • Verify JWT signature                │
│  • Check expiry                        │
│  • Extract claims (userId, role)       │
└─────────────────────────────────────────┘
```

### RBAC Implementation

```typescript
// Middleware to check permission
const requirePermission = (permission: Permission) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.permissions.includes(permission)) {
    return ApiResponseHandler.forbidden(res);
  }
  next();
};

// Usage
app.post("/courses", 
  authMiddleware,
  requirePermission(Permission.CREATE_COURSE),
  createCourseHandler
);
```

### Data Security

1. **In Transit**: TLS/HTTPS (configured in production)
2. **At Rest**: Sensitive data encrypted (AES-256 simulation with comments)
3. **Passwords**: bcryptjs hashing with salt rounds = 10
4. **PII**: Stored encrypted in database
5. **Audit Logging**: All sensitive actions logged to MongoDB

## Integration Points

### External Services

```
┌─────────────────────────────────────────┐
│        OpenAI API                       │
│  • Chat completions (gpt-4-turbo)      │
│  • Embeddings (text-embedding-3-small) │
└─────────────────────────────────────────┘
            ↕ (AI Service)
┌─────────────────────────────────────────┐
│      AWS S3 / Compatible                │
│  • File storage (assignments, materials)│
│  • Document uploads                    │
└─────────────────────────────────────────┘
            ↕ (Storage Service)
┌─────────────────────────────────────────┐
│       Vector Database                   │
│  • Pinecone (or compatible)            │
│  • Store embeddings for RAG            │
└─────────────────────────────────────────┘
            ↕ (RAG Service)
```

## Deployment Architecture

### Local Development
```
Docker Compose
├── PostgreSQL (5432)
├── MongoDB (27017)
├── Redis (6379)
├── API (3001)
└── Web (3000)
```

### Production (AWS)
```
CloudFront (CDN) → ALB → ECS Tasks (Web + API)
                          ↓
                    RDS PostgreSQL
                    DocumentDB
                    ElastiCache Redis
                    S3 (File Storage)
                    CloudWatch (Logging)
```

### Production (GCP)
```
Cloud CDN → Cloud Load Balancer → Cloud Run
                                    ↓
                            Cloud SQL (PostgreSQL)
                            Firestore (Alternative to MongoDB)
                            Memorystore (Redis)
                            Cloud Storage (Files)
                            Cloud Logging
```

## Performance Optimization Strategies

### Frontend
- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- CSS-in-JS with Tailwind for tree-shaking
- React Query for intelligent caching
- Virtual scrolling for large lists

### Backend
- Connection pooling (PostgreSQL)
- Query result caching (Redis)
- Database indexing on frequently queried columns
- Pagination for large datasets
- Lazy loading of relationships

### Database
- Indexes on: email, userId, courseId, date
- Partitioning for large tables (future)
- Query optimization with EXPLAIN ANALYZE
- Connection pooling configuration

## Monitoring & Logging

### Winston Logger (Backend)
```
logs/
├── error.log      # Error level logs
└── combined.log   # All logs
```

### CloudWatch (Production)
- Real-time log streaming
- Metric alarms (CPU, memory, errors)
- Distributed tracing with X-Ray

### Monitoring Metrics
- Request latency (P50, P95, P99)
- Error rate and types
- Database query performance
- Cache hit rate
- User engagement metrics

## Future Scalability

### Phase 2 Enhancements
- Implement WebSocket for real-time features
- Add message queue (RabbitMQ/SQS) for async tasks
- Implement GraphQL API
- Add ElasticSearch for advanced search
- Implement machine learning models for predictions

### Horizontal Scaling
```
Load Balancer
├── API Instance 1
├── API Instance 2
├── API Instance 3
└── ...

PostgreSQL
├── Primary
└── Replicas (read-only)

MongoDB
├── Primary
├── Secondary 1
└── Secondary 2

Redis
└── Cluster (high availability)
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: December 24, 2025
