# 🚀 Hosting on Render: Step-by-Step Deployment Guide

This guide details how to host the **Interactive CFG and PDA Learning Tool** on [Render](https://render.com) using their **Free Tier**.

---

## 📋 Overview of Deployment Methods

| Method | Complexity | Free Tier Compatibility | Output URLs |
| :--- | :--- | :--- | :--- |
| **Method 1: Render Blueprint (`render.yaml`)** *(Recommended)* | ⭐ Easiest (1 Click) | 100% Free | Backend API + Static Frontend |
| **Method 2: Manual Dashboard Setup** | ⭐⭐ Step-by-Step | 100% Free | Backend API + Static Frontend |
| **Method 3: Multi-Stage Docker Container** | ⭐⭐ Intermediate | Free Web Service | Single Unified URL |

---

## 🛠️ Step 0: Push Code to GitHub / GitLab

Render deploys directly from your Git repository:

1. In your local terminal inside `d:\TE - SEM(5)\toc`:
   ```bash
   git init
   git add .
   git commit -m "feat: complete CFG & PDA learning tool with ultra-premium UI"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

---

## ⚡ Method 1: 1-Click Render Blueprint (Recommended)

The repository includes a ready-to-use [`render.yaml`](../render.yaml) file.

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` and automatically configure:
   - **`cfg-pda-backend`**: Python FastAPI Web Service (`/api/health`).
   - **`cfg-pda-frontend`**: React Vite Static Site with automatic SPA redirect rules and automatic linking of `VITE_API_BASE_URL`.
5. Click **Apply**.
6. Render builds both services and provisions free HTTPS URLs!

---

## 🖱️ Method 2: Manual Dashboard Setup

If you prefer to configure the services manually via the Render web UI:

### Part A: Deploy the Backend (Python Web Service)
1. In Render Dashboard, click **New +** → **Web Service**.
2. Select your repository.
3. Configure the following settings:
   - **Name**: `cfg-pda-backend`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: **Free**
4. Under **Advanced**, add an Environment Variable:
   - `PYTHON_VERSION` = `3.11.9`
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g. `https://cfg-pda-backend.onrender.com`).

---

### Part B: Deploy the Frontend (Free Static Site)
1. In Render Dashboard, click **New +** → **Static Site**.
2. Select the same repository.
3. Configure the following settings:
   - **Name**: `cfg-pda-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://cfg-pda-backend.onrender.com` *(paste your actual backend URL from Part A)*
5. Under **Redirects/Rewrites**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
   *(This ensures client-side routes like `/grammar`, `/cyk`, and `/pda` reload without 404s)*.
6. Click **Create Static Site**.

---

## 🐳 Method 3: Unified Docker Web Service (Single URL)

If you prefer a **single domain** where the FastAPI backend serves both API endpoints and the built frontend assets:

1. Click **New +** → **Web Service**.
2. Select your repository.
3. Configure:
   - **Name**: `cfg-pda-fullstack`
   - **Runtime**: `Docker`
   - **DockerfilePath**: `Dockerfile`
   - **Instance Type**: **Free**
4. Click **Create Web Service**.
5. Render uses the multi-stage [`Dockerfile`](../Dockerfile) to build the frontend, package the Python backend, and serve both on a single unified URL.

---

## 💡 Important Tips for Render's Free Tier

1. **Spin-down Behavior**:
   - Render's Free Web Services sleep after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to boot up (a spin-up spinner/status indicator is included in the app Topbar).
   - The Static Site frontend **never sleeps** and loads instantly.
2. **CORS**:
   - The backend has CORS enabled with `allow_origins=["*"]`, so requests from your Render frontend domain will connect without CORS errors.
3. **Logs**:
   - If you encounter any issues, click the **Logs** tab in Render to view live Uvicorn and FastAPI console output.
