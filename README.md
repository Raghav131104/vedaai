# VedaAI — Assessment Creator Platform

VedaAI is a full-stack web application designed to help teachers create structured assessments through a simple and intuitive workflow.  
The platform provides real-time progress updates, assignment management capabilities, and a clean dashboard interface for managing academic content efficiently.

---

## Project Structure

vedaai/
├── preview.html → Open this file to view UI demo instantly
├── backend/ → Node.js + Express server
├── frontend/ → Next.js application
├── nginx/nginx.conf → Reverse proxy configuration
├── docker-compose.yml → Local development setup
├── docker-compose.prod.yml → Production deployment setup
└── .env.production.example → Environment template for production

---

## Quick Demo (No Setup Required)

If you only want to explore the interface:

1. Locate the file `preview.html`
2. Open it in your browser
3. Navigate through the screens — settings are stored locally in the browser

This mode runs without any server or database configuration.

---

## Running the Application Locally (Using Docker)

### Prerequisites

- Docker Desktop installed and running
- A valid external service API key

---

### Step 1 — Create Environment File

Inside the `backend/` directory, create a file named `.env`

Example configuration:

PORT=3001
MONGODB_URI=mongodb://mongodb:27017/vedaai
REDIS_HOST=redis
REDIS_PORT=6379

SERVICE_API_KEY=YOUR_API_KEY_HERE
SERVICE_PROXY=https://your-proxy-url.com

ALLOWED_ORIGINS=http://localhost:3000

---

### Step 2 — Start All Services

docker compose up --build

The first startup may take a few minutes as dependencies and container images are downloaded.

---

### Step 3 — Access the Application

Frontend  
http://localhost:3000

Backend  
http://localhost:3001

Health Check  
http://localhost:3001/health

---

### Step 4 — Stop Services

docker compose down

To remove all stored database data:

docker compose down -v

---

## Running Without Docker (Manual Setup)

### Requirements

- Node.js (v20 or higher)
- MongoDB running locally
- Redis running locally

---

### Start Backend

cd backend
npm install
cp .env.example .env
npm run dev

---

### Start Frontend

cd frontend
npm install
npm run dev

Then open:

http://localhost:3000

---

## Production Deployment

### Requirements

- Ubuntu Server (Recommended: 2 CPU / 4GB RAM)
- Domain pointing to server IP
- SSH access

---

### Install Docker

curl -fsSL https://get.docker.com
| sh
sudo usermod -aG docker $USER
newgrp docker

Install Docker Compose plugin:

sudo apt-get install docker-compose-plugin

---

### Clone Project

git clone https://github.com/yourusername/vedaai.git

cd vedaai

---

### Create Production Environment File

cp .env.production.example .env
nano .env

Fill the following values:

SERVICE_API_KEY=YOUR_API_KEY_HERE
SERVICE_PROXY=https://your-proxy-url.com

DOMAIN=yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com

NEXT_PUBLIC_API_URL=https://yourdomain.com/api

NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws

---

### Setup SSL Certificate

sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

---

### Start Production Stack

docker compose -f docker-compose.prod.yml up -d --build

Check status:

docker compose -f docker-compose.prod.yml ps
curl https://yourdomain.com/api/health

---

## Useful Commands

View backend logs:

docker compose -f docker-compose.prod.yml logs -f backend

Restart after changes:

docker compose -f docker-compose.prod.yml up -d --build

Stop services:

docker compose -f docker-compose.prod.yml down

---

## API Routes

| Method | Endpoint                        | Description                   |
| ------ | ------------------------------- | ----------------------------- |
| GET    | /health                         | Service health check          |
| POST   | /api/assignments                | Create new assignment         |
| GET    | /api/assignments                | Fetch assignments             |
| GET    | /api/assignments/:id/status     | Check assignment status       |
| GET    | /api/assessments/:id            | Retrieve generated assessment |
| POST   | /api/assessments/:id/regenerate | Regenerate assessment         |
| GET    | /api/settings                   | Fetch configuration           |
| PUT    | /api/settings                   | Update configuration          |

---

## Troubleshooting

| Issue                       | Solution                                   |
| --------------------------- | ------------------------------------------ |
| Port already in use         | Stop running containers or change port     |
| Backend not reachable       | Wait for database services to initialize   |
| Blank frontend              | Inspect frontend container logs            |
| WebSocket connection issues | Verify public WebSocket URL configuration  |
| Docker permission denied    | Re-login after adding user to docker group |

---
