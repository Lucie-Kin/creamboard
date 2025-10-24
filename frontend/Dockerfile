# Frontend Dockerfile
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

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production image - serve with nginx
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
