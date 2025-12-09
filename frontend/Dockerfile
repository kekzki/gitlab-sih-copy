# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Define build arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# 1. Copy package files and install dependencies (Highly cacheable layer)
COPY package*.json ./
RUN npm install

# 2. Copy all source code (Less cacheable layer)
COPY . .

# Set environment variables so Vite can see them during the build
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS final

# 1. Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# 2. Copy your custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copy the built React files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]