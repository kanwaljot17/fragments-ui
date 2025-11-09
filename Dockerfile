# Dockerfile for fragments-ui (Multi-Stage Build)
# This file defines the instructions for Docker Engine to create a Docker Image
# The image will contain a static web site served by nginx
# Using a multi-stage build to optimize image size

# Stage 1: Build stage - Build the static web site
FROM node:18-alpine AS builder

# Metadata about this image
LABEL maintainer="Kanwaljot Singh <kanwaljot17@example.com>"
LABEL description="Fragments UI - builder stage"

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy package.json and package-lock.json files into the image
# This allows us to install dependencies before copying source code
# for better Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the static web site
RUN npm run build

# Stage 2: Runtime stage - Serve with nginx
FROM nginx:alpine

# Metadata about this image
LABEL maintainer="Kanwaljot Singh <kanwaljot17@example.com>"
LABEL description="Fragments UI - production stage with nginx"

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional - nginx default config works for SPA)
# If you need custom nginx config, uncomment and create nginx.conf
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 (nginx default)
EXPOSE 80

# nginx runs in foreground by default in the alpine image
CMD ["nginx", "-g", "daemon off;"]


