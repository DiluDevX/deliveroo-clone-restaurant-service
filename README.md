# deliveroo-clone-restaurant-service

A production-ready TypeScript/Express microservice for restaurant management in a Deliveroo clone application. Provides APIs for managing restaurants, categories, and dishes.

## Features

- **TypeScript** with strict mode for full type safety
- **Express.js 5.x** web framework
- **Prisma ORM** with PostgreSQL
- **Zod** for runtime input validation and environment variable validation
- **Pino** structured logging (with pretty-printing in development)
- **Security-first**: API key authentication, timing-safe comparison
- **Soft deletes** for data recovery
- **Rate limiting** with configurable limiters
- **API versioning** with routes under `/v1/`
- **Conventional Commits** enforced via commitlint and Husky
- **Docker** multi-stage build support
- **GitHub Actions** CI/CD workflows

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values (DATABASE_URL, API_KEY, SERVICE_NAME, etc.)

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run database migrations
npm run prisma:migrate:new

# 5. Start development server
npm run dev
```

## Folder Structure

```
project-root/
├── src/
│   ├── config/           # Environment and database configuration
│   ├── controllers/      # Route handler functions (common + v1)
│   ├── dtos/             # Data Transfer Object type definitions
│   ├── middleware/       # Express middleware (validation, auth, rate-limit, logging)
│   ├── routes/           # Express route definitions (v1 for API routes)
│   ├── schema/           # Zod validation schemas
│   ├── services/         # Business logic and database services
│   ├── types/            # Global TypeScript types
│   ├── utils/            # Utility functions (errors, logger, constants)
│   └── index.ts          # Application entry point
├── prisma/
│   └── schema.prisma     # Prisma data model
├── .github/workflows/    # CI/CD pipeline definitions
├── .husky/               # Git hooks (pre-commit, commit-msg)
├── Dockerfile            # Multi-stage Docker build
├── docker-entrypoint.sh  # Container startup script
└── ...config files
```

## API Endpoints

All routes are prefixed with `/api/v1`. Authentication required via API key header.

### Health

| Method | Path            | Description     |
| ------ | --------------- | --------------- |
| GET    | `/health`       | Health check    |
| GET    | `/health/ready` | Readiness check |
| GET    | `/health/live`  | Liveness check  |

**Response:**

```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.45
  }
}
```

### Restaurants

| Method | Path                      | Description            | Body             |
| ------ | ------------------------- | ---------------------- | ---------------- |
| GET    | `/api/v1/restaurants`     | List all restaurants   | -                |
| GET    | `/api/v1/restaurants/:id` | Get restaurant by ID   | -                |
| POST   | `/api/v1/restaurants`     | Create a restaurant    | See schema below |
| PATCH  | `/api/v1/restaurants/:id` | Update a restaurant    | See schema below |
| DELETE | `/api/v1/restaurants/:id` | Soft-delete restaurant | -                |

### Categories

| Method | Path                                               | Description          | Body             |
| ------ | -------------------------------------------------- | -------------------- | ---------------- |
| GET    | `/api/v1/restaurants/:restaurantId/categories`     | List categories      | -                |
| GET    | `/api/v1/restaurants/:restaurantId/categories/:id` | Get category         | -                |
| POST   | `/api/v1/restaurants/:restaurantId/categories`     | Create a category    | See schema below |
| PATCH  | `/api/v1/restaurants/:restaurantId/categories/:id` | Update category      | See schema below |
| DELETE | `/api/v1/restaurants/:restaurantId/categories/:id` | Soft-delete category | -                |

### Dishes

| Method | Path                                           | Description      | Body             |
| ------ | ---------------------------------------------- | ---------------- | ---------------- |
| GET    | `/api/v1/restaurants/:restaurantId/dishes`     | List dishes      | -                |
| GET    | `/api/v1/restaurants/:restaurantId/dishes/:id` | Get dish         | -                |
| POST   | `/api/v1/restaurants/:restaurantId/dishes`     | Create a dish    | See schema below |
| PATCH  | `/api/v1/restaurants/:restaurantId/dishes/:id` | Update dish      | See schema below |
| DELETE | `/api/v1/restaurants/:restaurantId/dishes/:id` | Soft-delete dish | -                |

**Authentication:** All `/api/v1/*` endpoints require:

- `x-api-key` header with the API key
- `x-actor-type` header to identify the actor type (optional)
- `x-actor-id` or `x-actor-user-id` headers for actor identification (optional)

## Environment Variables

| Variable               | Required | Default       | Description                            |
| ---------------------- | -------- | ------------- | -------------------------------------- |
| `NODE_ENV`             | No       | `development` | `development`, `production`, or `test` |
| `PORT`                 | No       | `3002`        | HTTP server port                       |
| `DATABASE_URL`         | **Yes**  | -             | PostgreSQL connection string           |
| `API_KEY`              | **Yes**  | -             | API key for authentication             |
| `SERVICE_NAME`         | **Yes**  | -             | Service name used in logs              |
| `LOG_LEVEL`            | No       | `info`        | Pino log level                         |
| `APP_VERSION`          | No       | `1.0.0`       | Application version                    |
| `RATE_LIMIT_WINDOW_MS` | No       | varies        | Rate limit window in milliseconds      |
| `RATE_LIMIT_MAX`       | No       | varies        | Max requests per window                |

## Development Commands

```bash
npm run dev               # Start with nodemon (hot reload)
npm run build             # Compile TypeScript to dist/
npm run start:development # Run compiled app (development)
npm run start:production  # Run compiled app (production)
npm run lint:check        # Check for lint errors
npm run lint:fix          # Auto-fix lint errors
npm run format:check      # Check formatting
npm run format:fix       # Auto-fix formatting
npm run types:check      # Type-check without emitting
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate:new # Create and run a new migration
npm run prisma:push      # Push schema to DB without migration
npm run prisma:studio    # Open Prisma Studio
```

## Docker

```bash
# Build the image
docker build -t deliveroo-clone-restaurant-service .

# Run the container
docker run -p 3002:3002 \
  -e DATABASE_URL=postgresql://... \
  -e API_KEY=your-api-key \
  -e SERVICE_NAME=restaurant-service \
  deliveroo-clone-restaurant-service
```

## Deployment

The repository includes GitHub Actions workflows:

- **`pr-quality-check.yml`**: Runs lint, format, type-check on every PR
- **`release-main.yml`**: Runs semantic-release on pushes to `main`, auto-deploys to production
- **`release-develop.yml`**: Runs semantic-release on pushes to `develop`, auto-deploys to development
- **`deploy.yml`**: Reusable workflow that builds Docker, pushes to ECR, deploys to EC2

### GitHub Secrets Configuration

Go to **Repository Settings → Secrets and variables → Actions** and add these secrets:

#### Required Secrets

| Secret                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS IAM user with EC2 and ECR permissions      |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret key                        |
| `EC2_HOST`              | Public IP or DNS of your EC2 instance          |
| `EC2_USER`              | SSH username (e.g., `ec2-user`, `ubuntu`)      |
| `EC2_SSH_KEY`           | Private SSH key for EC2 authentication         |
| `RELEASE_TOKEN`         | GitHub Personal Access Token with `repo` scope |

#### Required Variables

| Variable         | Description                   | Example                   |
| ---------------- | ----------------------------- | ------------------------- |
| `AWS_REGION`     | AWS region                    | `us-east-1`               |
| `ECR_REPOSITORY` | ECR repository name           | `restaurant-service`      |
| `CONTAINER_NAME` | Docker container name         | `restaurant-service`      |
| `CONTAINER_PORT` | Container port                | `3002`                    |
| `SECRET`         | AWS Secrets Manager secret ID | `restaurant-service/prod` |

### AWS Secrets Manager Setup

Create a secret in AWS Secrets Manager with all required environment variables:

1. Go to **AWS Console → Secrets Manager → Store a new secret**
2. Choose **Other type of secret (key/value)**
3. Add all required keys:

```json
{
  "DATABASE_URL": "postgresql://user:password@host:5432/dbname",
  "API_KEY": "your-api-key",
  "SERVICE_NAME": "restaurant-service",
  "PORT": "3002",
  "NODE_ENV": "production",
  "LOG_LEVEL": "info"
}
```

4. Name the secret (e.g., `restaurant-service/prod`) - use this as the `SECRET` variable in GitHub

### IAM Policy for Deploy User

Create an IAM user with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetRepositoryPolicy",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:region:account:secret:my-service/*"
    }
  ]
}
```

### Manual Trigger

You can manually trigger releases from GitHub Actions:

1. Go to **Actions → Production Release** (or Development)
2. Click **Run workflow**
3. Select the environment and click **Run workflow**

Both workflows also run automatically on push to `main` (production) or `develop` (development).
