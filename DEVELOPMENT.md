# EduVerse AI - Implementation Guide

## Project Overview

This is a production-ready monorepo for EduVerse AI - a unified ERP + LMS + AI platform for educational institutions.

**Version**: 1.0.0  
**Technology Stack**: Next.js 14, Express.js, PostgreSQL, MongoDB, Redis, OpenAI

## Directory Structure

```
eduverse-ai/
├── apps/
│   ├── api/                          # Express API server
│   │   ├── src/
│   │   │   ├── controllers/          # Request handlers
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── student.controller.ts
│   │   │   │   ├── teacher.controller.ts
│   │   │   │   └── admin.controller.ts
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── student.service.ts
│   │   │   │   ├── teacher.service.ts
│   │   │   │   ├── ai.service.ts
│   │   │   │   └── document.service.ts
│   │   │   ├── repositories/         # Data access layer
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── course.repository.ts
│   │   │   │   └── assignment.repository.ts
│   │   │   ├── middleware/           # Express middleware
│   │   │   │   ├── auth.ts           # JWT, RBAC
│   │   │   │   ├── validation.ts     # Input validation
│   │   │   │   └── errorHandler.ts   # Error handling
│   │   │   ├── routes/               # API endpoints
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── student.routes.ts
│   │   │   │   ├── teacher.routes.ts
│   │   │   │   └── admin.routes.ts
│   │   │   ├── utils/                # Utilities
│   │   │   │   ├── jwt.ts            # JWT service
│   │   │   │   ├── password.ts       # Bcrypt, hashing
│   │   │   │   ├── logger.ts         # Winston logging
│   │   │   │   ├── response.ts       # Response formatting
│   │   │   │   └── cache.ts          # Redis caching
│   │   │   ├── config/               # Configuration
│   │   │   │   ├── database.ts
│   │   │   │   ├── redis.ts
│   │   │   │   └── ai.ts
│   │   │   ├── main.ts               # Entry point
│   │   │   └── tests/                # Unit tests
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Next.js frontend
│       ├── app/
│       │   ├── (auth)/               # Auth pages
│       │   │   ├── page.tsx          # Login
│       │   │   └── register/page.tsx # Register
│       │   ├── (student)/            # Student portal
│       │   │   ├── dashboard/
│       │   │   ├── courses/
│       │   │   ├── assignments/
│       │   │   ├── attendance/
│       │   │   └── fees/
│       │   ├── (teacher)/            # Teacher portal
│       │   │   ├── dashboard/
│       │   │   ├── courses/
│       │   │   ├── assessments/
│       │   │   ├── analytics/
│       │   │   └── ai-tools/
│       │   ├── (admin)/              # Admin portal
│       │   │   ├── dashboard/
│       │   │   ├── students/
│       │   │   ├── finances/
│       │   │   ├── analytics/
│       │   │   └── documents/
│       │   ├── layout.tsx            # Root layout
│       │   └── globals.css           # Global styles
│       ├── components/               # Reusable React components
│       │   ├── ui/                   # Base UI components
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.tsx
│       │   │   └── Modal.tsx
│       │   ├── forms/                # Form components
│       │   │   ├── LoginForm.tsx
│       │   │   └── CourseForm.tsx
│       │   ├── dashboard/            # Dashboard components
│       │   │   ├── MetricsCard.tsx
│       │   │   ├── Chart.tsx
│       │   │   └── Table.tsx
│       │   └── ai/                   # AI components
│       │       ├── ChatBox.tsx
│       │       └── DocumentUpload.tsx
│       ├── lib/                      # Utilities
│       │   ├── api-client.ts         # Axios instance
│       │   ├── hooks/                # Custom hooks
│       │   │   ├── useAuth.ts
│       │   │   ├── useCourses.ts
│       │   │   └── useLocalStorage.ts
│       │   └── utils/                # Helper functions
│       │       ├── formatters.ts
│       │       └── validators.ts
│       ├── styles/                   # Style files
│       │   └── theme.css
│       ├── public/                   # Static assets
│       ├── package.json
│       ├── next.config.js
│       └── tsconfig.json
│
├── packages/
│   ├── db/                           # Database layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Prisma schema
│   │   │   ├── migrations/           # DB migrations
│   │   │   └── seed.ts               # Demo data
│   │   ├── src/
│   │   │   ├── models/               # Mongoose models
│   │   │   │   ├── audit-log.model.ts
│   │   │   │   ├── chat.model.ts
│   │   │   │   └── document-chunk.model.ts
│   │   │   └── index.ts              # Export models
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                       # Shared code
│       ├── src/
│       │   ├── rbac/
│       │   │   └── index.ts          # Roles, permissions, RBAC
│       │   ├── types/
│       │   │   ├── models.ts         # Type definitions
│       │   │   └── validation.ts     # Zod schemas
│       │   ├── constants/
│       │   │   └── index.ts          # Constants
│       │   └── index.ts              # Main export
│       ├── package.json
│       └── tsconfig.json
│
├── deployment/                       # Deployment configs
│   ├── aws/
│   │   ├── terraform/                # IaC
│   │   ├── cloudformation/
│   │   └── scripts/
│   ├── gcp/
│   │   ├── terraform/
│   │   └── scripts/
│   └── k8s/
│       ├── api-deployment.yaml
│       ├── web-deployment.yaml
│       └── helm-chart/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
├── package.json
├── turbo.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
├── README.md
├── DEPLOYMENT.md
└── DEVELOPMENT.md
```

## Key Features Implementation

### 1. Authentication & RBAC

**Location**: `apps/api/src/middleware/auth.ts`, `apps/api/src/utils/jwt.ts`

**Features**:
- JWT token generation with role claims
- Refresh token rotation
- HTTP-only cookies for token storage
- Permission-based middleware

**Usage**:
```typescript
// Protect route with auth
app.get("/api/profile", authMiddleware, handler);

// Require specific permission
app.post("/api/courses", requirePermission(Permission.CREATE_COURSE), handler);
```

### 2. Student Portal

**Location**: `apps/web/app/(student)/`, `apps/api/src/services/student.service.ts`

**Features Implemented**:
- Dashboard with quick stats
- Enrolled courses with progress tracking
- Attendance status with risk predictions
- Fee structure and payment status
- Assignment submission

**Key Endpoints**:
```
GET  /api/student/courses
GET  /api/student/attendance
GET  /api/student/fees
GET  /api/student/courses/:courseId/assignments
POST /api/student/assignments/:assignmentId/submit
```

### 3. Teacher Portal

**Location**: `apps/web/app/(teacher)/`, `apps/api/src/services/teacher.service.ts`

**Features to Implement**:
- Content management (upload materials)
- Assignment creation and grading
- Attendance marking
- Student analytics
- AI-powered MCQ generation

**Key Endpoints**:
```
POST /api/teacher/courses/:courseId/materials
POST /api/teacher/assignments
PUT  /api/teacher/assignments/:assignmentId/grade
POST /api/teacher/attendance/mark
GET  /api/teacher/students/analytics
```

### 4. Admin/Super Admin Portal

**Location**: `apps/web/app/(admin)/`, `apps/api/src/services/admin.service.ts`

**Features to Implement**:
- Student lifecycle (admission, promotion)
- Financial dashboards
- Analytics (attendance heatmap, dropout risk)
- Document generation
- System configuration

### 5. AI Engine & RAG

**Location**: `apps/api/src/services/ai.service.ts`

**Implementation Pattern**:
```typescript
class AIService {
  // Document ingestion
  async ingestDocument(file: Buffer, metadata: DocumentMetadata): Promise<void> {
    // 1. Chunk document (~512 tokens)
    const chunks = await this.chunkDocument(file);
    
    // 2. Generate embeddings
    const embeddings = await openai.createEmbeddings({
      model: "text-embedding-3-small",
      input: chunks
    });
    
    // 3. Store in vector DB
    await vectorDB.upsert(embeddings);
  }

  // Semantic search with RAG
  async query(userQuestion: string, userRole: UserRole): Promise<string> {
    // 1. Embed query
    const queryEmbedding = await openai.embed(userQuestion);
    
    // 2. Semantic search
    const relevantDocs = await vectorDB.search(queryEmbedding, topK: 5);
    
    // 3. Role-based filtering
    const filtered = this.filterByRole(relevantDocs, userRole);
    
    // 4. Generate response with LLM
    const response = await openai.createCompletion({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are an AI assistant for..." },
        { role: "user", content: `Context: ${filtered}\n\nQuestion: ${userQuestion}` }
      ]
    });
    
    return response.choices[0].message.content;
  }
}
```

### 6. Document Generation Engine

**Location**: `apps/api/src/services/document.service.ts`

**Implementation Pattern**:
```typescript
class DocumentService {
  async generateMarkSheet(studentId: string, semester: number): Promise<Buffer> {
    // 1. Fetch data
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const marks = await prisma.studentMark.findMany({
      where: { studentId, course: { semester } }
    });
    
    // 2. Generate PDF using Puppeteer
    const html = await this.renderTemplate("mark-sheet", { student, marks });
    const pdf = await puppeteer.generatePDF(html);
    
    // 3. Add digital signature + QR code
    const signed = await this.addSignature(pdf);
    const withQR = await this.addQRCode(signed);
    
    // 4. Upload to S3
    const url = await s3.upload(withQR);
    
    return withQR;
  }
}
```

## Extending the Project

### Add New Endpoint

1. **Create Controller**:
```typescript
// apps/api/src/controllers/new.controller.ts
export class NewController {
  static async handler(req: Request, res: Response): Promise<void> {
    try {
      const data = await newService.process(req.params.id);
      ApiResponseHandler.success(res, data);
    } catch (error) {
      ApiResponseHandler.error(res, "ERROR_CODE", error.message);
    }
  }
}
```

2. **Create Service**:
```typescript
// apps/api/src/services/new.service.ts
export class NewService {
  async process(id: string): Promise<any> {
    // Business logic
  }
}

export const newService = new NewService();
```

3. **Add Route**:
```typescript
// apps/api/src/routes/new.routes.ts
router.get("/:id", authMiddleware, NewController.handler);
```

4. **Register in Main**:
```typescript
// apps/api/src/main.ts
import newRoutes from "./routes/new.routes";
app.use("/api/new", newRoutes);
```

### Add New Portal Page

1. **Create Page**:
```typescript
// apps/web/app/(role)/feature/page.tsx
"use client";

export default function FeaturePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

2. **Create API Hook**:
```typescript
// apps/web/lib/hooks/useFeature.ts
import { useQuery } from "@tanstack/react-query";

export function useFeature() {
  return useQuery({
    queryKey: ["feature"],
    queryFn: () => apiClient.get("/api/feature")
  });
}
```

## Testing Strategy

### Unit Tests

```bash
npm run test -w apps/api
```

**Example**:
```typescript
// apps/api/src/__tests__/auth.service.test.ts
describe("AuthService", () => {
  it("should hash password correctly", async () => {
    const hashed = await passwordService.hashPassword("password123");
    expect(await passwordService.verifyPassword("password123", hashed)).toBe(true);
  });

  it("should generate valid JWT", () => {
    const token = jwtService.generateToken({
      userId: "123",
      email: "test@test.com",
      role: UserRole.STUDENT,
      permissions: []
    });
    const verified = jwtService.verifyToken(token);
    expect(verified.userId).toBe("123");
  });
});
```

### Integration Tests

```bash
npm run test:integration -w apps/api
```

### E2E Tests

Use Cypress or Playwright for full user flows.

## Performance Optimization

### Caching Strategy

```typescript
// Cache frequently accessed data
const getCourses = cache(async (studentId) => {
  return await prisma.course.findMany({
    where: { enrollments: { some: { studentId } } }
  });
}, ["student-courses"]);
```

### Database Optimization

- Add indexes on frequently queried columns
- Use pagination for large datasets
- Implement query result caching

### API Response Optimization

- Gzip compression
- Selective field inclusion
- Lazy loading of relationships

## Security Best Practices

1. **Input Validation**: Use Zod schemas for all inputs
2. **SQL Injection**: Prisma prevents via parameterized queries
3. **XSS Protection**: React's automatic escaping + CSP headers
4. **CSRF**: Token validation via middleware
5. **Rate Limiting**: Express rate-limit middleware
6. **HTTPS**: Enforce in production
7. **Secrets**: Use environment variables
8. **Audit Logging**: Log all sensitive actions to MongoDB

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis cache configured
- [ ] API rate limiting enabled
- [ ] Error logging configured
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Database backups scheduled
- [ ] Monitoring & alerting setup
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated

## Support & Maintenance

- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **Security Issues**: security@eduverse.com
- **General Support**: support@eduverse.com

---

**Last Updated**: December 24, 2025
