# --- File: frontend/Dockerfile (Simplified and Final) ---

# Stage 1: Build the static assets using Debian-based Node for stability
FROM node:20-slim AS builder 

WORKDIR /app

# 1. Copy ALL files (source code, package.json, etc.)
# .dockerignore prevents node_modules/ and package-lock.json from being copied.
COPY . .

# 2. Install dependencies (Node will perform a clean, Linux-native install)
RUN npm install --force 

# 3. Build the project 
RUN npm run build 

# Stage 2: Serve the application using Nginx 
FROM nginx:alpine

# Copy the built assets from the builder stage to the Nginx serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the standard HTTP port
EXPOSE 80

# Nginx will run by default
CMD ["nginx", "-g", "daemon off;"]