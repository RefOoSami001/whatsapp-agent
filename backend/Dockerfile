# Use Node.js 18 slim for better Chrome compatibility
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxtst6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libxrandr2 \
    libgconf-2-4 \
    libxss1 \
    libappindicator1 \
    fonts-liberation \
    lsb-release \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

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