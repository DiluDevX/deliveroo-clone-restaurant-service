FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 app

WORKDIR /app

ARG ENV=production
ARG APP_VERSION=unknown
ENV ENV=$ENV \
    APP_VERSION=$APP_VERSION \
    NODE_ENV=production

COPY --from=deps    --chown=app:nodejs /app/node_modules    ./node_modules
COPY --from=builder --chown=app:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=app:nodejs /app/dist            ./dist
COPY --from=builder --chown=app:nodejs /app/package.json    ./package.json

COPY --chown=app:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER app
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/index.js"]
