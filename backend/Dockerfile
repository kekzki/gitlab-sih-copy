FROM golang:1.25-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o main main.go

FROM alpine:latest AS final

RUN apk --no-cache add ca-certificates

WORKDIR /

COPY --from=build /app/main /main

EXPOSE 8080

CMD ["/main"]
