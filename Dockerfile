# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy only what's needed for running
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]