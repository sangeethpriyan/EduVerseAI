# EduVerse AI - Deployment Guide

## Prerequisites

- Docker & Docker Compose (v20.10+)
- Node.js 18+ (for local development)
- PostgreSQL 16+ (for production)
- MongoDB 7+ (for production)
- Redis 7+ (for production)

## Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd eduverse-ai
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local configuration.

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

```bash
# Apply Prisma migrations
npm run db:push

# Seed demo data
npm run db:seed
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- API: http://localhost:3001

## Docker Deployment

### Local Docker Development

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Stop services
docker-compose down
```

Services will be available at:
- Web: http://localhost:3000
- API: http://localhost:3001
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379

### Production Docker Build

```bash
# Build API image
docker build -f Dockerfile.api -t eduverse-api:latest .

# Build Web image
docker build -f Dockerfile.web -t eduverse-web:latest .

# Tag for registry
docker tag eduverse-api:latest <registry>/eduverse-api:latest
docker tag eduverse-web:latest <registry>/eduverse-web:latest

# Push to registry
docker push <registry>/eduverse-api:latest
docker push <registry>/eduverse-web:latest
```

## AWS Deployment

### Prerequisites

- AWS Account with ECR, ECS, RDS, ElastiCache access
- AWS CLI configured
- ECR repositories created

### 1. Push Images to ECR

```bash
# Login to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Tag images
docker tag eduverse-api:latest <account-id>.dkr.ecr.<region>.amazonaws.com/eduverse-api:latest
docker tag eduverse-web:latest <account-id>.dkr.ecr.<region>.amazonaws.com/eduverse-web:latest

# Push images
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/eduverse-api:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/eduverse-web:latest
```

### 2. RDS Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier eduverse-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password <strong-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --no-publicly-accessible
```

### 3. ElastiCache Setup

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id eduverse-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### 4. DocumentDB Setup (MongoDB Alternative)

```bash
# Create DocumentDB cluster
aws docdb create-db-cluster \
  --db-cluster-identifier eduverse-docdb \
  --engine docdb \
  --master-username admin \
  --master-user-password <strong-password>
```

### 5. ECS Deployment

Create `ecs-task-definition.json`:

```json
{
  "family": "eduverse-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "<account-id>.dkr.ecr.<region>.amazonaws.com/eduverse-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "hostPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "postgresql://postgres:password@<rds-endpoint>:5432/eduverse_db"
        },
        {
          "name": "MONGODB_URI",
          "value": "mongodb://<docdb-endpoint>:27017/eduverse"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://<elasticache-endpoint>:6379"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/eduverse-api",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### 6. Create ECS Service

```bash
aws ecs create-service \
  --cluster eduverse-cluster \
  --service-name eduverse-api \
  --task-definition eduverse-api:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=api,containerPort=3001
```

## GCP Deployment

### Prerequisites

- GCP Project with Cloud Run, Cloud SQL, Memorystore access
- gcloud CLI configured

### 1. Deploy to Cloud Run

```bash
# Build and deploy API
gcloud run deploy eduverse-api \
  --source . \
  --entry-point "node dist/main.js" \
  --runtime nodejs18 \
  --memory 512Mi \
  --region us-central1 \
  --allow-unauthenticated
```

### 2. Cloud SQL Setup

```bash
# Create PostgreSQL instance
gcloud sql instances create eduverse-postgres \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region us-central1
```

### 3. Memorystore Redis Setup

```bash
# Create Redis instance
gcloud redis instances create eduverse-redis \
  --size=1 \
  --region=us-central1
```

## Multi-AZ & High Availability

### PostgreSQL Replication

```bash
# Create read replica
aws rds create-db-instance-read-replica \
  --db-instance-identifier eduverse-postgres-replica \
  --source-db-instance-identifier eduverse-postgres \
  --availability-zone <different-az>
```

### MongoDB Replica Set

```javascript
// In MongoDB shell
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "primary:27017" },
    { _id: 1, host: "secondary1:27017" },
    { _id: 2, host: "secondary2:27017" }
  ]
})
```

### Auto-scaling

```bash
# ECS auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/eduverse-cluster/eduverse-api \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10
```

## Monitoring & Logging

### CloudWatch Logs

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/eduverse-api

# View logs
aws logs tail /ecs/eduverse-api --follow
```

### Prometheus Metrics

Add to API configuration:

```typescript
import prometheus from "prom-client";

const httpRequestDuration = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"]
});
```

## Security Checklist

- [ ] Enable TLS/HTTPS
- [ ] Configure WAF rules
- [ ] Set up VPC and security groups
- [ ] Enable database encryption
- [ ] Implement rate limiting
- [ ] Set up DDoS protection
- [ ] Configure backups
- [ ] Enable audit logging
- [ ] Use secrets manager for credentials
- [ ] Regular security updates

## Backup & Recovery

### PostgreSQL Backups

```bash
# Automated daily backups
aws rds modify-db-instance \
  --db-instance-identifier eduverse-postgres \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"
```

### MongoDB Backups

```bash
# Enable automatic backups
aws docdb modify-db-cluster \
  --db-cluster-identifier eduverse-docdb \
  --backup-retention-period 35
```

## Performance Tuning

### Database Connection Pooling

```typescript
// Use connection pools
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Caching Strategy

```typescript
// Redis caching
const getCourses = async (studentId: string) => {
  const cacheKey = `student:${studentId}:courses`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const courses = await fetchCoursesFromDB(studentId);
  await redis.setex(cacheKey, 3600, JSON.stringify(courses));
  return courses;
};
```

### CDN for Static Assets

```bash
# CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name <s3-bucket>.s3.amazonaws.com
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs eduverse-api

# Inspect image
docker inspect <image-id>

# Test locally
docker run -it <image> /bin/sh
```

### Database Connection Issues

```bash
# Test connection
psql -h <host> -U postgres -d eduverse_db

# Check Redis
redis-cli -h <host> ping

# Test MongoDB
mongosh "mongodb://<host>:27017"
```

### Performance Issues

```bash
# Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;

# Monitor CPU/Memory
docker stats

# Profile Node.js
node --prof app.js
```

## Support

For deployment issues, contact: devops@eduverse.com
