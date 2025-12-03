# --- File: frontend/Dockerfile (FINAL VERSION) ---

# Stage 1: Build the static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
# Note: Using --force may be necessary for some Vite/Tailwind dependency conflicts
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Fix Rollup/Vite Native Dependency Conflict (Specific to Alpine/musl)
# This removes the built modules and forces a clean install, which resolves the musl linking issue.
RUN rm -rf node_modules
RUN npm install

# Copy source code and build the project
COPY . .
# Build the project (Assuming your package.json has a 'build' script)
RUN npm run build 

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built assets from the builder stage to the Nginx serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the standard HTTP port
EXPOSE 80

# Nginx will run by default
CMD ["nginx", "-g", "daemon off;"]