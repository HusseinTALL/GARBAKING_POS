# Customer App Frontend Dockerfile
# Purpose: Development container for the Customer Vue app exposing port 3001.
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port for dev server
EXPOSE 3001

# Development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
