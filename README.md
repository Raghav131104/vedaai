# VedaAI — AI Assessment Creator

Full-stack app: teacher fills a form → AI (Claude) generates a question paper → WebSocket shows live progress → output displayed.

---

## What is in this folder

```
vedaai/
├── preview.html              ← OPEN THIS to see the app without any setup
├── backend/                  ← Node.js + Express API
├── frontend/                 ← Next.js 14 app
├── nginx/nginx.conf          ← reverse proxy config (for production)
├── docker-compose.yml        ← run everything locally with one command
├── docker-compose.prod.yml   ← deploy to a server
└── .env.production.example   ← copy to .env for production
```

---

## Option 1 — Just open the HTML preview (no setup needed)

1. Find `preview.html` in this folder
2. Double-click it
3. It opens in your browser — all screens work, school settings save locally

This is a self-contained demo. No server, no API key needed.

---

## Option 2 — Run the full app locally (with real AI)

### What you need first
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Steps

**Step 1 — Create your .env file**

Inside the `backend/` folder, create a file called `.env` (copy from `.env.example`):

```
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/vedaai
REDIS_HOST=redis
REDIS_PORT=6379
ANTHROPIC_API_KEY=sk-ant-api03-REPLACE_WITH_YOUR_KEY
ALLOWED_ORIGINS=http://localhost:3000
```

On Mac/Linux:
```bash
cp backend/.env.example backend/.env
# then open backend/.env and paste your ANTHROPIC_API_KEY
```

On Windows: copy the file `backend/.env.example`, rename it to `.env`, open in Notepad and add your key.

**Step 2 — Start everything**

```bash
docker compose up --build
```

First time this takes 3-5 minutes to download images and install packages.

**Step 3 — Open in browser**

Once you see `VedaAI Backend running on port 3001` in the terminal:

- Frontend → http://localhost:3000
- Backend API → http://localhost:3001
- Health check → http://localhost:3001/health

**Step 4 — Stop the app**

```bash
docker compose down
```

To also delete all data (MongoDB + Redis):
```bash
docker compose down -v
```

---

## Option 3 — Run without Docker (manual)

You need: Node.js 20+, MongoDB running locally, Redis running locally.

**Terminal 1 — Start backend:**
```bash
cd backend
npm install
cp .env.example .env
# edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

**Terminal 2 — Start frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Option 4 — Deploy to a real server (production)

### What you need
- A VPS/server running Ubuntu 22.04 (DigitalOcean, AWS EC2, Hetzner, etc. — minimum 2 CPU, 4GB RAM)
- A domain name pointed at your server's IP (A record in DNS)
- SSH access to the server

### Step-by-step deployment

**On your server:**

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# 3. Clone/upload your project
git clone https://github.com/yourname/vedaai.git
cd vedaai
# (or use scp/rsync to upload the folder)

# 4. Create production .env
cp .env.production.example .env
nano .env
# Fill in:
#   ANTHROPIC_API_KEY=sk-ant-...
#   DOMAIN=yourdomain.com
#   ALLOWED_ORIGINS=https://yourdomain.com
#   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
#   NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws

# 5. Install Certbot for SSL
sudo apt install -y certbot
sudo certbot certonly --standalone -d yourdomain.com
# (make sure port 80 is open and your domain points to this server IP)

# 6. Update nginx config with your domain
nano nginx/nginx.conf
# Replace 'your-domain.com' with your actual domain (2 places)

# 7. Start production stack
docker compose -f docker-compose.prod.yml up -d --build

# 8. Check it's running
docker compose -f docker-compose.prod.yml ps
curl https://yourdomain.com/api/health
```

Your site is now live at `https://yourdomain.com`.

### Useful server commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f backend

# Restart after code changes
docker compose -f docker-compose.prod.yml up -d --build

# Stop
docker compose -f docker-compose.prod.yml down

# Renew SSL certificate (auto-renews via cron, but manual command is)
sudo certbot renew
```

---

## Common problems

| Problem | Fix |
|---------|-----|
| Port 3000 already in use | `docker compose down` then try again, or change port in docker-compose.yml |
| ANTHROPIC_API_KEY error | Make sure backend/.env exists and has the key without quotes |
| MongoDB connection refused | Wait 30 seconds after starting — Mongo takes time to be ready |
| Frontend shows blank page | Check `docker compose logs frontend` for errors |
| WebSocket not connecting | Make sure NEXT_PUBLIC_WS_URL matches the backend port |
| Docker: permission denied | Run `sudo usermod -aG docker $USER` then log out and back in |

---

## API endpoints (for testing/integration)

| Method | URL | What it does |
|--------|-----|--------------|
| GET | /health | Health check |
| POST | /api/assignments | Create assignment + start AI generation |
| GET | /api/assignments | List all assignments |
| GET | /api/assignments/:id/status | Poll job status |
| GET | /api/assessments/:id | Get generated paper |
| POST | /api/assessments/:id/regenerate | Regenerate paper |
| GET | /api/settings | Get school settings |
| PUT | /api/settings | Update school settings |

Test with curl:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/assignments
curl http://localhost:3001/api/settings
```

