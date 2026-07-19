# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies (cached layer) ----
FROM base AS deps
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS build
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production

# Only production deps
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Compiled output only
COPY --from=build /app/dist ./dist

# Run as non-root
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

EXPOSE 5000

CMD ["node", "dist/index.js"]