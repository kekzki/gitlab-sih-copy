# --- File: frontend/Dockerfile (FINAL, FINAL VERSION) ---

# Stage 1: Build the static assets
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Clear cache before installing dependencies
RUN npm cache clean --force

# Copy package.json and install dependencies
COPY package*.json ./

# 2. First install with legacy flag
RUN npm install --legacy-peer-deps

# 3. Clean and second install to fix native modules
RUN rm -rf node_modules
RUN npm install

# Copy source code and build the project
COPY . .
# Build the project (This should now work)
RUN npm run build 

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built assets from the builder stage to the Nginx serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the standard HTTP port
EXPOSE 80

# Nginx will run by default
CMD ["nginx", "-g", "daemon off;"]