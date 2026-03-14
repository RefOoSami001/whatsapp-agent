# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Install Chromium and dependencies for Puppeteer (fallback)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Create cache directory for Puppeteer
RUN mkdir -p /app/.cache/puppeteer && chmod -R 777 /app/.cache/puppeteer

# Set Puppeteer cache directory
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Install Puppeteer browsers (downloads Chrome to cache)
RUN npx puppeteer browsers install chrome

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]