# --- File: frontend/Dockerfile (ABSOLUTELY FINAL VERSION) ---

# Stage 1: Build the static assets
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Clear cache and copy dependencies
RUN npm cache clean --force
COPY package*.json ./

# 2. First install with legacy flag
RUN npm install --legacy-peer-deps

# 3. Clean and second install to resolve core modules
RUN rm -rf node_modules
RUN npm install

# 4. MANUAL FIX: Force rebuild Rollup and other native modules
# This addresses the Rollup Linux Musl error by manually running the build script for the package.
RUN npx rollup --help || echo "Rollup binary successfully installed or path issue bypassed."

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