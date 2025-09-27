# Admin POS Frontend Dockerfile
# Purpose: Development container for the Admin POS Vue app exposing port 3000.
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
EXPOSE 3000

# Development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]