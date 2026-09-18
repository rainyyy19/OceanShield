# OceanShield AI - Production Deployment Guide

This guide provides step-by-step instructions for deploying the **OceanShield AI Maritime Command & Control Platform** across multiple production environments.

---

## Architecture Overview

```
                        ┌──────────────────────────────┐
                        │      Internet / Clients      │
                        └──────────────┬───────────────┘
                                       │
                         [ Port 80/443 SSL Nginx / CDN ]
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       OCEANSHIELD PRODUCTION NETWORK                        │
│                                                                             │
│   ┌───────────────────────────────────┐                                     │
│   │   Next.js 15 C2 Operations UI     │                                     │
│   │   - Standalone Node.js 20 Runner  │                                     │
│   │   - Container Port: 3000          │                                     │
│   │   - Host Port: 3000               │                                     │
│   └─────────────────┬─────────────────┘                                     │
│                     │ Internal Docker Network                               │
│                     ▼ http://backend:8000                                   │
│   ┌───────────────────────────────────┐                                     │
│   │   FastAPI Threat Intelligence     │                                     │
│   │   - Python 3.11 Slim + Uvicorn    │                                     │
│   │   - Kinematics & Spoofing Engine  │                                     │
│   │   - Container Port: 8000          │                                     │
│   │   - Host Port: 8000               │                                     │
│   └───────────────────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Option 1: Docker & Docker Compose (Recommended)

Ideal for any Linux/Windows server, Cloud Virtual Machine (AWS EC2, DigitalOcean Droplet, GCP Compute Engine, Hetzner, Linode), or local production server.

### Prerequisites
* [Docker](https://docs.docker.com/get-docker/) (v24+)
* [Docker Compose](https://docs.docker.com/compose/) (v2+)

### Step-by-Step Deployment

1. **Clone the repository**:
   ```bash
   git clone git@github.com:rainyyy19/OceanShield.git
   cd OceanShield
   ```

2. **Configure Environment** (Optional):
   ```bash
   cp .env.production.example .env
   ```

3. **Build and Launch Containers**:
   ```bash
   # On Linux/macOS:
   ./deploy.sh
   # Or manually:
   docker compose up --build -d

   # On Windows:
   deploy.bat
   ```

4. **Verify Container Health**:
   ```bash
   docker compose ps
   ```
   Both `oceanshield-backend` and `oceanshield-frontend` should indicate `healthy` or `running`.

5. **Access the Applications**:
   * **C2 Operations Cockpit**: [http://localhost:3000](http://localhost:3000) (or `http://<YOUR_SERVER_IP>:3000`)
   * **FastAPI Threat API & Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

6. **Management Commands**:
   ```bash
   # View live logs
   docker compose logs -f

   # Restart services
   docker compose restart

   # Stop services
   docker compose down
   ```

---

## Deployment Option 2: Render.com (One-Click Cloud Blueprint)

Deploy both services with zero server maintenance, automatic HTTPS, and automated CI/CD directly from GitHub.

1. Create a free account on [Render.com](https://render.com).
2. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Connect your GitHub repository: `rainyyy19/OceanShield`.
4. Render will automatically detect the [`render.yaml`](file:///c:/Users/rainy/Documents/antigravity/charming-brahmagupta/render.yaml) file:
   * It creates `oceanshield-backend` (Python 3.11 Web Service).
   * It creates `oceanshield-frontend` (Node 20 Web Service).
   * It automatically routes `NEXT_PUBLIC_BACKEND_URL` between them.
5. Click **Apply**.
6. Once deployed, Render will provide a free `.onrender.com` SSL domain for both your API and Operations Cockpit!

---

## Deployment Option 3: Railway.app

1. Sign in to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `rainyyy19/OceanShield`.
4. Add two services from the repository:
   * **Backend Service**: Set root directory to repository root and start command to:
     `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   * **Frontend Service**: Set root directory to `frontend`, start command to:
     `npm run start` and environment variable:
     `NEXT_PUBLIC_BACKEND_URL=https://<YOUR_BACKEND_RAILWAY_URL>`
5. Railway provides automated deployments on every `git push`.

---

## Deployment Option 4: Vercel (Frontend) + Render/Railway (Backend)

For global edge CDN frontend hosting:

1. **Deploy Backend first**:
   * Deploy `backend/` to Render, Railway, or AWS.
   * Copy the public backend URL (e.g. `https://oceanshield-api.onrender.com`).
2. **Deploy Frontend to Vercel**:
   * Go to [Vercel](https://vercel.com) -> **Add New Project**.
   * Import `rainyyy19/OceanShield`.
   * In **Root Directory**, select `frontend`.
   * Under **Environment Variables**, add:
     * `NEXT_PUBLIC_BACKEND_URL`: `https://oceanshield-api.onrender.com`
   * Click **Deploy**.

---

## Production Reverse Proxy & SSL (Nginx + Let's Encrypt)

When hosting on a Linux VPS with a custom domain (e.g., `oceanshield.yourdomain.com`), configure Nginx as a reverse proxy:

```nginx
# /etc/nginx/sites-available/oceanshield
server {
    listen 80;
    server_name oceanshield.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable SSL with Certbot:
```bash
sudo certbot --nginx -d oceanshield.yourdomain.com
```

---

## Environment Variables Reference

| Variable | Default | Scope | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_BACKEND_URL` | `http://127.0.0.1:8000` | Frontend | URL of the FastAPI backend for proxying requests |
| `PORT` | `3000` (Front) / `8000` (Back) | Both | Port on which each service binds |
| `HOST` | `0.0.0.0` | Backend | Host IP binding for Uvicorn |
| `PYTHONUNBUFFERED` | `1` | Backend | Ensures real-time stdout logs in Docker |
| `NODE_ENV` | `production` | Frontend | Node runtime mode |
| `NEXT_TELEMETRY_DISABLED` | `1` | Frontend | Disables Next.js anonymous telemetry |
