# Stage 1: Build the Go application
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum (if present) to download dependencies first
COPY go.mod .
# If you have go.sum:
# COPY go.sum .
# RUN go mod download 

# Copy the rest of the source code
COPY . .

# Build the application
# CGO_ENABLED=0 is important for creating a statically linked binary
RUN CGO_ENABLED=0 go build -o /app/server ./main.go

# Stage 2: Create the final minimal image
FROM alpine:latest

WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /app/server .

# Expose the port your Go app listens on (8080 is standard for your main.go)
EXPOSE 8080

# Command to run the executable
CMD ["/app/server"]