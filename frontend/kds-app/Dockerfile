# KDS Frontend Dockerfile
# Purpose: Development container for the KDS Vue app exposing port 3002.
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3002

# Development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]