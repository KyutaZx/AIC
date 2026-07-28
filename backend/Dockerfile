FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./

COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o backend .

FROM alpine:3.19

WORKDIR /app

COPY --from=builder /app/backend .
COPY --from=builder /app/offtaker_pool.json .

CMD ["./backend"]
