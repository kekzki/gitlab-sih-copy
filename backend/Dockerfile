# /backend/Dockerfile
FROM golang:1.23-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go mod tidy

# --- FIX: Force download of the missing dependency ---
RUN go get github.com/jackc/pgx/v5/pgxpool
# -----------------------------------------------------

RUN CGO_ENABLED=0 go build -o testdb testdb.go

FROM alpine:latest AS final

RUN apk --no-cache add ca-certificates

WORKDIR /

COPY --from=build /app/testdb /testdb

EXPOSE 8080

CMD ["/testdb"]
