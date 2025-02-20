# Stage 1: Build the Go binary
FROM golang:1.20 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files, then download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code into the container
COPY . .

# Build the Go binary for Linux (required for Lambda)
#RUN GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o main main.go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main main.go

# Stage 2: Create a minimal runtime image
FROM public.ecr.aws/lambda/provided:al2

# Copy the binary from the builder stage
COPY --from=builder /app/main /var/runtime/bootstrap

# Set the bootstrap as the entrypoint (AWS Lambda runtime looks for /var/runtime/bootstrap)
ENTRYPOINT ["/var/runtime/bootstrap"]