# Restaurant Service Architecture

## Purpose

The restaurant service owns restaurant, category, and dish data. It is the catalog service used by the frontend for restaurant listings, menus, categories, and dish lookup.

## Runtime

- Runtime: Node.js >= 24
- Framework: Express 5
- Language: TypeScript
- Database: configured through Prisma, current .env.example points at MongoDB
- Default local port in .env.example: 3002, recommended system port is 4004
- Entry point: src/index.ts

## Install and Run

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Production-style local run:

```bash
npm run build
npm run start:development
```

Useful checks:

```bash
npm run types:check
npm run lint:check
npm run format:check
```

## Required Environment

```env
PORT=4004
NODE_ENV=development
SERVICE_NAME=deliveroo-clone-restaurant-service
DATABASE_URL=mongodb://user:password@localhost:27017/restaurant-service?authSource=admin
API_KEY=shared-restaurant-service-key
LOG_LEVEL=info
APP_VERSION=1.0.0
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
```

The BFF's `RESTAURANT_SERVICE_API_KEY` must equal this service's `API_KEY`.

## Database

Prisma schema: prisma/schema.prisma

Main concepts:

- Restaurant
- Category
- Dish

Check the Prisma provider in schema.prisma before setting DATABASE_URL. The .env.example uses MongoDB; other services use PostgreSQL.

## Route Mounts

src/routes/index.ts currently mounts:

| Mount           | Purpose                 |
| --------------- | ----------------------- |
| /v1/restaurants | Restaurant CRUD/listing |
| /v1/categories  | Category CRUD/listing   |
| /v1/dishes      | Dish CRUD/listing       |

All routes use:

- x-api-key validation
- actorMiddleware

The BFF maps /api/restaurants to /v1/restaurants. Internal service routes use /v1 consistently.

## Restaurant Routes

| Method | Path                          | Purpose                       |
| ------ | ----------------------------- | ----------------------------- |
| GET    | /v1/restaurants               | List restaurants with filters |
| GET    | /v1/restaurants/:restaurantId | Get one restaurant            |
| POST   | /v1/restaurants               | Create restaurant             |
| PATCH  | /v1/restaurants/:restaurantId | Update restaurant             |
| DELETE | /v1/restaurants/:restaurantId | Delete restaurant             |

### List Query

Supported query params:

- search
- cuisine
- status: ACTIVE | DISABLED
- tags: comma-separated string
- rating
- minDeliveryFee
- maxDeliveryFee
- minOrderValue
- isOpen: true | false
- page
- limit
- sort

Frontend currently calls:

- GET /api/restaurants
- GET /api/restaurants?search=...
- GET /api/restaurants/:orgId or name-derived id from some cards

Make sure frontend uses actual restaurant id/orgId consistently. Restaurant names should not be used as route identifiers.

## Category Routes

| Method | Path                                     | Purpose         |
| ------ | ---------------------------------------- | --------------- |
| GET    | /v1/categories?restaurant=<restaurantId> | List categories |
| POST   | /v1/categories                           | Create category |
| PATCH  | /v1/categories/:categoryId               | Update category |
| DELETE | /v1/categories/:categoryId               | Delete category |

Frontend currently calls /api/categories without always passing restaurant. The schema requires restaurant query. Either frontend must pass it or the service must support global categories deliberately.

## Dish Routes

| Method | Path               | Purpose     |
| ------ | ------------------ | ----------- |
| GET    | /v1/dishes         | List dishes |
| GET    | /v1/dishes/:dishId | Get dish    |
| POST   | /v1/dishes         | Create dish |
| PATCH  | /v1/dishes/:dishId | Update dish |
| DELETE | /v1/dishes/:dishId | Delete dish |

List query params:

- category
- restaurant
- isVegetarian
- isAvailable

Frontend currently calls /api/dishes?category=<categoryId>. If dishes are restaurant-specific, pass restaurant too.

## DTO Notes

Create restaurant body:

```json
{
  "orgId": "org-id",
  "name": "Restaurant Name",
  "image": "https://example.com/image.jpg",
  "description": "Optional description",
  "tags": ["Pizza", "Italian"],
  "openingAt": "09:00",
  "closingAt": "22:00",
  "minimumValue": 10,
  "deliveryCharge": 5,
  "commissionPercentage": 15,
  "cuisine": "Italian"
}
```

Create category body:

```json
{
  "name": "Pizza",
  "sortOrder": 0,
  "restaurant": "restaurant-id"
}
```

Create dish body:

```json
{
  "categoryId": "category-id",
  "name": "Margherita Pizza",
  "description": "Tomato and mozzarella",
  "price": 12.99,
  "image": "https://example.com/pizza.jpg",
  "isVegetarian": true,
  "isSpicy": false,
  "isAvailable": true,
  "tags": ["BESTSELLER"],
  "sortOrder": 0
}
```

## Health Checks

- GET /health
- GET /health/ready
- GET /health/live

## Smoke Test

Direct service:

```bash
curl http://localhost:4004/v1/restaurants \
  -H 'x-api-key: shared-restaurant-service-key'
```

Through BFF after path mapping is fixed:

```bash
curl http://localhost:4000/api/restaurants \
  -H 'x-api-key: frontend-bff-key'
```

## Merge-Readiness Checklist

- [ ] Align route prefix with BFF.
- [ ] Frontend uses restaurant id/orgId, not restaurant name, for menu links.
- [ ] Category and dish frontend calls include restaurant when required.
- [ ] Restaurant response type is shared/generated into frontend.
- [ ] Actor model for admin writes is defined.
