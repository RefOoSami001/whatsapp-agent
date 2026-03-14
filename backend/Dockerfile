# Use Node.js 18 slim for smaller image; Chrome is installed separately
FROM node:18-slim

# Install Chrome dependencies and Google Chrome (required for Puppeteer/QR in Docker)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    wget \
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
    libnss3 \
    libcups2 \
    libxrandr2 \
    libappindicator1 \
    fonts-liberation \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Add Google Chrome repo (modern signed-by method; apt-key is deprecated)
RUN curl -fSsL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer: use system Chrome so QR works in container (no bundled Chromium)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Prefer stable; fallback path is /usr/bin/google-chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --production

EXPOSE 5000

# Koyeb and most PaaS set PORT
ENV PORT=5000
CMD ["node", "dist/server.js"]
