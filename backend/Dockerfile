# /backend/Dockerfile
# Stage 1: Build the Go application
FROM golang:1.23-alpine AS build

# Install Git for go mod operations that might require fetching private repos, 
# and a standard shell for safety, though often unnecessary for simple modules
RUN apk add --no-cache git

WORKDIR /app

# 1. Copy initial dependencies
COPY go.mod go.sum ./
RUN go mod download

# 2. Copy all source code
COPY . .

# 3. Resolve and tidy dependencies (crucial for finding all imports like upload.go)
RUN go mod tidy

RUN go get github.com/jackc/pgx/v5/pgxpool

# 4. Final build
# -o main: creates the executable named 'main'
# main.go: assumes this is your entry point, which imports other packages like 'upload.go'
RUN CGO_ENABLED=0 go build -o main .

# --- Build Check (Optional but Recommended) ---
# Check if the executable was successfully created.
RUN if [ ! -f main ]; then echo "Error: Go build failed, executable 'main' not found."; exit 1; fi
# -----------------------------------------------

# Stage 2: Create a minimal final image
FROM alpine:latest AS final

# Install necessary runtime dependencies (only ca-certificates for TLS)
RUN apk --no-cache add ca-certificates

WORKDIR /

# Copy the built Go application from the build stage
COPY --from=build /app/main /main

# Set the entrypoint and expose the port
EXPOSE 8080

# This is the command that must run a long-running process (your HTTP server)
CMD ["/main"]