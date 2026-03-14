# Deploying the backend on Koyeb

This backend is ready to deploy on [Koyeb](https://www.koyeb.com/) using Docker. It uses Puppeteer (via whatsapp-web.js) with a system Chrome installation in the container.

## Prerequisites

- A Koyeb account
- MongoDB (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))
- Google Gemini API key

## Build and run locally with Docker

```bash
cd backend
docker build -t ai-agent-backend .
docker run -p 4000:4000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  -e GEMINI_API_KEY="your-gemini-key" \
  -e CLIENT_ORIGIN="https://your-frontend.koyeb.app" \
  ai-agent-backend
```

## Deploy on Koyeb

1. **Push your code** to a Git repository (GitHub, GitLab, etc.).

2. **Create a new Web Service** on [Koyeb](https://app.koyeb.com/):
   - **Deploy from**: Git (or Docker image if you build and push to a registry).
   - **Build**: Dockerfile (path: `backend/Dockerfile` if deploying from monorepo root; or use build context `backend`).
   - **Port**: Set to `4000` (or the port you set via `PORT` env var). The app reads `PORT` from the environment; Koyeb can override it (e.g. 8000).
   - **Instance type**: Use at least 1 GB RAM for Chrome/Puppeteer.

3. **Environment variables** (set in Koyeb service → Variables):
   - `MONGODB_URI` (required)
   - `JWT_SECRET` (required)
   - `GEMINI_API_KEY` (required)
   - `CLIENT_ORIGIN` (required in production) – your frontend URL, e.g. `https://your-app.koyeb.app`
   - `PORT` – optional; Koyeb often sets this (e.g. 8000). The app uses it automatically.
   - `NODE_ENV=production` (optional; Dockerfile already sets it)
   - `GEMINI_MODEL` (optional) – e.g. `gemini-2.5-flash` or `gemini-2.0-flash`

4. **Puppeteer/Chrome**: No extra env vars needed. The Dockerfile installs Google Chrome and sets `PUPPETEER_EXECUTABLE_PATH`. The app uses it for headless WhatsApp Web.

5. **Health check**: Use `GET /health`. Koyeb can use this for readiness checks.

## Monorepo note

If the repo root is the project root and the backend lives in `backend/`:
- In Koyeb, set **Build context** (or Docker build context) to `backend` so the Dockerfile and `package.json` are in the build context.
- Or move/copy the Dockerfile to the repo root and adjust `COPY` paths (e.g. `COPY backend/package*.json .` and `COPY backend/ .`).

## Troubleshooting

- **Chrome/Puppeteer fails**: Ensure the service has at least 1 GB RAM. Check logs for "Failed to start browser" and that `PUPPETEER_EXECUTABLE_PATH` is set in the image.
- **CORS errors**: Set `CLIENT_ORIGIN` to the exact frontend origin (including protocol and no trailing slash).
- **Port**: If Koyeb assigns a different port (e.g. 8000), the app reads `PORT` from the environment; no code change needed.
