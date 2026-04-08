# Stage 1: 빌드
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: 서빙
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci

EXPOSE 80

CMD ["npm", "run", "preview"]
