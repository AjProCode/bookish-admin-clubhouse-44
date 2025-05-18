# Docker Setup for Lovable Project

This project supports Docker for both development and production environments.

## Development Environment

To start the development environment with hot reloading:

```bash
docker-compose up app-dev
```

This will:
- Build the development Docker image
- Mount your local codebase into the container
- Start the development server with hot reloading
- Make the app available at http://localhost:8080

## Production Environment

To build and run the production environment:

```bash
docker-compose up app-prod
```

This will:
- Build a production-optimized Docker image
- Serve the built static files using Nginx
- Make the app available at http://localhost:3003

## Building and Running Manually

### Development

```bash
# Build the development image
docker build -t lovable-dev -f Dockerfile.dev .

# Run the container
docker run -p 8080:8080 -v $(pwd):/app -v /app/node_modules lovable-dev
```

### Production

```bash
# Build the production image
docker build -t lovable-prod .

# Run the container
docker run -p 3003:80 lovable-prod
```

## Environment Variables

To pass environment variables to your containers, you can:

1. Uncomment and modify the environment section in docker-compose.yml
2. Use a .env file with docker-compose
3. Pass them directly via command line:

```bash
docker run -p 3003:80 -e VITE_API_URL=https://api.example.com lovable-prod
``` 