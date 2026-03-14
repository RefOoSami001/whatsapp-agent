# Use Node.js 18 LTS for stability and Chrome compatibility (Koyeb supports 18.x)
FROM node:18-slim

# Install Chrome dependencies and Google Chrome (required for Puppeteer/whatsapp-web.js on Koyeb)
RUN apt-get update && apt-get install -y --no-install-recommends \
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
    libnss3 \
    libcups2 \
    libappindicator1 \
    fonts-liberation \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Add Google Chrome repo (signed-by method; apt-key is deprecated)
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer/Chrome env for container (Koyeb runs in Docker)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

# App listens on PORT; Koyeb can override this (e.g. 8000)
ENV PORT=4000
EXPOSE 4000

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build \
    && npm prune --omit=dev

CMD ["node", "dist/server.js"]
