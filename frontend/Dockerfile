# --- File: frontend/Dockerfile (FINAL, RELIABLE VERSION) ---

# Stage 1: Build the static assets using Debian-based Node for stability
FROM node:20-slim AS builder 

WORKDIR /app

# 1. Copy ALL files FIRST, including package.json and source code.
# This avoids confusion about which environment to install packages for.
COPY package*.json ./
COPY . .

# 2. Run ONE single, definitive installation after files are copied.
# We include --force to prevent peer dependency conflicts.
RUN npm install --force 

# 3. Build the project 
RUN npm run build 

# Stage 2: Serve the application using Nginx (keep Alpine for the small runtime image)
FROM nginx:alpine

# Copy the built assets from the builder stage to the Nginx serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the standard HTTP port
EXPOSE 80

# Nginx will run by default
CMD ["nginx", "-g", "daemon off;"]