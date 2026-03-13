# WhatsApp AI Auto-Reply Platform

Full-stack TypeScript application for managing WhatsApp AI auto-reply agents with Google Gemini, built with Fastify, MongoDB, whatsapp-web.js, React, Vite, and TailwindCSS.

## Stack

- **Backend**: Node.js, TypeScript, Fastify, Socket.io, Mongoose, whatsapp-web.js, Google Gemini API
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Zustand, Axios, Socket.io client
- **Database**: MongoDB

## Project structure

- `backend/` – Fastify API, WhatsApp manager, AI integration
- `frontend/frontend-app/` – React dashboard SPA

## Backend setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env` by copying `.env.example` and filling values:

```bash
cp .env.example .env
```

Required variables:

- `MONGODB_URI` – MongoDB connection string
- `GEMINI_API_KEY` – Google Gemini API key
- `JWT_SECRET` – secret for JWT signing
- `PORT` – backend port (default 4000)
- `CLIENT_ORIGIN` – frontend origin (default `http://localhost:5173`)

3. Run the backend in development mode:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

## REST API (backend-only usage)

You can fully control the system via REST without the frontend. Authenticate using `/api/auth/login` to obtain a JWT, then include it in `Authorization: Bearer <token>` for protected endpoints.

### Key endpoints

- `POST /api/auth/signup` – create a user
- `POST /api/auth/login` – login and get JWT
- `GET /api/instances` – list instances
- `POST /api/instances` – create instance
- `GET /api/instances/:id` – get instance metadata
- `POST /api/instances/:id/start` – start WhatsApp client
- `POST /api/instances/:id/connect` – force QR login
- `GET /api/instances/:id/qr` – fetch latest QR code (if generated)
- `POST /api/instances/:id/send` – send a WhatsApp message
- `POST /api/instances/:id/stop` – stop WhatsApp client
- `GET /api/instances/:id/conversations` – list recent conversations
- `GET /api/instances/:id/agent-config` – read AI agent config
- `PUT /api/instances/:id/agent-config` – update AI agent config
- `DELETE /api/instances/:id/agent-config` – reset AI agent config
- `GET /api/ai-agents` – list AI agents
- `POST /api/ai-agents` – create AI agent
- `PUT /api/ai-agents/:id` – update AI agent
- `DELETE /api/ai-agents/:id` – delete AI agent
- `POST /api/ai-agents/:id/assign/:instanceId` – bind an agent to an instance
- `POST /api/ai-agents/:id/unassign` – unbind an agent from its instance
- `GET /api/instances/:id/ai-agent` – get the agent assigned to an instance

## Frontend setup

1. Install dependencies:

```bash
cd frontend/frontend-app
npm install
```

2. Create `.env` file for the frontend:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

## MongoDB

You can use a local MongoDB instance (e.g. `mongodb://localhost:27017/whatsapp-ai`) or a managed cluster (MongoDB Atlas). Ensure `MONGODB_URI` in the backend `.env` points to your database.

## WhatsApp & Gemini

- When you click **Generate QR** for an instance on the Instances page, the backend starts a whatsapp-web.js client and streams a QR code over WebSocket. Scan it with your WhatsApp mobile app to connect.
- Configure the AI agent per instance on the **AI Agent** page (business details, tone, memory mode, delay, typing simulation).
- Incoming messages are routed through the Gemini API with conversation context according to the selected memory mode and replied via WhatsApp after a simulated delay/typing period.
