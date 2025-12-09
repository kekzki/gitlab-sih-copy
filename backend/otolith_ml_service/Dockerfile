# /backend/Dockerfile
FROM golang:1.23-alpine AS build

WORKDIR /app

# 1. Copy initial dependencies for caching
COPY go.mod go.sum ./
RUN go mod download

# 2. Copy ALL source code (ensures main.go and upload.go are present)
COPY . .

# 3. Resolve and clean up dependencies based on ALL source code
# RUN go mod tidy

# The go get is now likely redundant, but harmless if tidy succeeds
# RUN go get github.com/jackc/pgx/v5/pgxpool

# 4. Final build (should succeed now that upload.go is copied and dependencies are resolved)
# RUN CGO_ENABLED=0 go build -o main main.go

FROM alpine:latest AS final
# ... (rest of the file)