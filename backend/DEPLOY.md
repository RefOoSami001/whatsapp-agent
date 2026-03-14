# Deploying the backend (e.g. Koyeb)

## Requirements

- **MongoDB**: Set `MONGODB_URI` (e.g. MongoDB Atlas).
- **Secrets**: `JWT_SECRET`, `GEMINI_API_KEY`.
- **CORS**: Set `CLIENT_ORIGIN` to your frontend URL (e.g. `https://yourapp.koyeb.app`).
- **Port**: The app reads `PORT`; Koyeb sets this automatically.

## Koyeb (Dockerfile)

1. In Koyeb, create a new **Web Service**.
2. **Source**: Connect your Git repo; set **Root directory** to `backend` (if the Dockerfile is inside `backend`).
3. **Builder**: Dockerfile (path `backend/Dockerfile` or `Dockerfile` if root is `backend`).
4. **Port**: Koyeb will set `PORT`; the app listens on `0.0.0.0:PORT`. Expose the same port in the service (e.g. 5000 or the one Koyeb assigns).
5. **Environment variables** (set in Koyeb):
   - `MONGODB_URI` (required)
   - `JWT_SECRET` (required)
   - `GEMINI_API_KEY` (required)
   - `CLIENT_ORIGIN` (your frontend URL)
   - `NODE_ENV=production`
   - Do **not** set `PUPPETEER_EXECUTABLE_PATH`; the Dockerfile sets it so QR works in the container.

## Puppeteer / QR in production

The Docker image installs Google Chrome and sets `PUPPETEER_EXECUTABLE_PATH` so WhatsApp Web QR code generation works in the container. If you deploy without Docker, set `PUPPETEER_EXECUTABLE_PATH` to your system Chrome/Chromium path (e.g. `/usr/bin/google-chrome-stable`).
