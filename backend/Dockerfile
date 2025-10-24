# Backend Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
RUN npm install

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["npm", "start"]
