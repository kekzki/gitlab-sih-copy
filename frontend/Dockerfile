# --- File: frontend/Dockerfile (FINAL, PERMANENT FIX) ---

# Stage 1: Build the static assets using Debian-based Node for stability
# Switching from 'alpine' to 'slim' prevents the musl/native dependency error.
FROM node:20-slim AS builder 

WORKDIR /app

# Copy package.json and install dependencies (no need for cache clean or double install now)
COPY package*.json ./
# Use --force to overcome any peer dependency conflicts specific to your packages
RUN npm install --force 

# Copy source code and build the project
COPY . .
# Build the project 
RUN npm run build 

# Stage 2: Serve the application using Nginx (keep Alpine for the small runtime image)
FROM nginx:alpine

# Copy the built assets from the builder stage to the Nginx serving directory
# The output is still the small, static build in /app/dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the standard HTTP port
EXPOSE 80

# Nginx will run by default
CMD ["nginx", "-g", "daemon off;"]