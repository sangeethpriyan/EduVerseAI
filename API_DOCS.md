# EduVerse AI API Documentation

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.eduverse.com`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via login and expire after 24 hours. Use the refresh token endpoint to get a new access token.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-12-24T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2024-12-24T10:30:00Z"
}
```

## API Endpoints

### Authentication

#### POST /api/auth/register

Register a new user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### POST /api/auth/login

Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response**: Same as register

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### GET /api/auth/profile

Get current user profile.

**Auth**: Required  
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "student",
    "isActive": true,
    "createdAt": "2024-12-24T10:30:00Z"
  }
}
```

#### POST /api/auth/logout

Logout current user (clears refresh token).

**Auth**: Required  
**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Student Portal

#### GET /api/student/courses

Get enrolled courses for current student.

**Auth**: Required  
**Query Parameters**:
- `page` (number, default: 1): Pagination page
- `limit` (number, default: 20): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "courseId": "course-id",
        "code": "CS101",
        "name": "Data Structures",
        "credits": 4,
        "progress": 75,
        "status": "active"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

#### GET /api/student/courses/:courseId

Get course details with materials and assignments.

**Auth**: Required  
**Response**:
```json
{
  "success": true,
  "data": {
    "courseId": "course-id",
    "courseName": "Data Structures",
    "courseCode": "CS101",
    "progress": 75,
    "materials": [
      {
        "id": "material-id",
        "title": "Chapter 1: Arrays",
        "type": "pdf",
        "fileUrl": "https://...",
        "difficultyLevel": "medium"
      }
    ],
    "assignments": [
      {
        "id": "assignment-id",
        "title": "Implement Stack",
        "dueDate": "2024-12-31T23:59:59Z",
        "maxScore": 100
      }
    ],
    "teacher": {
      "firstName": "Dr.",
      "lastName": "Smith",
      "email": "teacher@example.com"
    }
  }
}
```

#### GET /api/student/attendance

Get attendance status for all courses.

**Auth**: Required  
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "courseId": "course-id",
      "courseName": "Data Structures",
      "totalClasses": 30,
      "attendedClasses": 25,
      "absentClasses": 5,
      "percentage": 83,
      "riskLevel": "low"
    }
  ]
}
```

#### GET /api/student/fees

Get fee status and payment history.

**Auth**: Required  
**Response**:
```json
{
  "success": true,
  "data": {
    "fees": [
      {
        "semester": 1,
        "totalAmount": 100000,
        "paidAmount": 50000,
        "dueAmount": 50000,
        "status": "partial",
        "dueDate": "2024-12-31T23:59:59Z"
      }
    ],
    "totalOwed": 50000,
    "overdueAmount": 0
  }
}
```

#### GET /api/student/assignments/:courseId

Get assignments for a course with submission status.

**Auth**: Required  
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "assignment-id",
      "title": "Implement Stack",
      "description": "Create a stack data structure",
      "dueDate": "2024-12-31T23:59:59Z",
      "maxScore": 100,
      "submission": {
        "id": "submission-id",
        "fileName": "stack.cpp",
        "submittedAt": "2024-12-30T10:00:00Z",
        "score": 95,
        "feedback": "Excellent implementation"
      }
    }
  ]
}
```

#### POST /api/student/assignments/:assignmentId/submit

Submit assignment.

**Auth**: Required  
**Request Body** (multipart/form-data):
- `file` (file): Assignment file (max 10MB)

**Response**:
```json
{
  "success": true,
  "data": {
    "submissionId": "submission-id",
    "assignmentId": "assignment-id",
    "submittedAt": "2024-12-24T10:30:00Z",
    "contentHash": "sha256-hash..."
  }
}
```

### Student Dashboard

#### GET /api/student/dashboard

Get dashboard overview data.

**Auth**: Required  
**Response**:
```json
{
  "success": true,
  "data": {
    "totalCourses": 5,
    "averageAttendance": 85,
    "upcomingAssignments": 3,
    "feesStatus": "partial",
    "attendanceAlerts": [
      {
        "courseId": "course-id",
        "courseName": "Web Development",
        "riskLevel": "high",
        "message": "Attendance below 75%"
      }
    ]
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_CREDENTIALS | 401 | Email or password is incorrect |
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | User doesn't have required permissions |
| NOT_FOUND | 404 | Requested resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| DUPLICATE_ENTRY | 409 | Resource already exists |
| INTERNAL_SERVER_ERROR | 500 | Server error |

## Rate Limiting

API endpoints are rate limited to 100 requests per 15 minutes per IP address.

Headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Pagination

List endpoints support pagination via query parameters:

- `page`: Page number (1-indexed, default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Column to sort by
- `sortOrder`: 'asc' or 'desc'

Response includes pagination metadata:
```json
{
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

## WebSocket Events (Future)

- `chat:message` - New chat message
- `attendance:marked` - Attendance marked
- `assignment:graded` - Assignment graded
- `notification:new` - New notification

---

**Last Updated**: December 24, 2025  
**Version**: 1.0.0
