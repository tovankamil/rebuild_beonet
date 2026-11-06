# ==============================================================
# Multi-Stage Dockerfile for SYNETIQ Platform
# 1. Builds React SPA using Node.js (build stage only)
# 2. Compiles Go Backend with React SPA embedded via //go:embed
# 3. Final Production Container: Pure Alpine + Go binary (NO Node.js!)
# ==============================================================

# STAGE 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# STAGE 2: Build Golang Server with Embedded Frontend
FROM golang:alpine AS backend-builder
WORKDIR /app/backend

# Install build essentials if needed for static compilation
RUN apk add --no-cache git ca-certificates

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
# Inject frontend dist directly into backend/dist for //go:embed all:dist
COPY --from=frontend-builder /app/frontend/dist ./dist

# Compile fully static Linux binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /synetiq-server .

# STAGE 3: Final Production Image (Ultra-lightweight, NO Node.js)
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy binary from builder
COPY --from=backend-builder /synetiq-server /app/synetiq-server

# Create uploads directory for attachments
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

EXPOSE 8081
ENV PORT=8081 \
    GIN_MODE=release

ENTRYPOINT ["/app/synetiq-server"]

