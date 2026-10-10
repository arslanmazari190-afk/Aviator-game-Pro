# 🚀 Production Deployment & Infrastructure Guide

This guide covers deployment instructions for AWS (EC2/ECS), DigitalOcean, GCP, and Cloudflare WAF/DDoS configuration.

---

## 📦 1. Quick Docker Compose Deployment

### Prerequisites:
- Docker & Docker Compose installed on your Linux / Cloud VM.

### Steps:
```bash
# 1. Clone repository
git clone <YOUR_REPO_URL>
cd "vs games aviater"

# 2. Configure Environment Variables
cp server/.env.example server/.env

# 3. Launch full stack with Docker Compose
docker-compose up -d --build

# 4. Check running containers
docker-compose ps
```

The application is now accessible at:
- Web App: `http://<YOUR_SERVER_IP>`
- API & Sockets: `http://<YOUR_SERVER_IP>:5000`

---

## 🛡️ 2. Cloudflare Enterprise / Pro Edge & DDoS Protection

### A. DNS & SSL Setup
1. Point your domain (e.g. `aviator.yourdomain.com`) to your server IP with **Proxied (Orange Cloud)** enabled.
2. Set SSL/TLS Encryption Mode to **Full (Strict)**.

### B. WebSockets Support
1. In Cloudflare Dashboard ➔ **Network** ➔ enable **WebSockets**.
2. WebSockets proxying operates automatically over standard port `443` (WSS).

### C. Rate Limiting & Bot Mitigation
In Cloudflare Dashboard ➔ **Security** ➔ **WAF** ➔ **Rate Limiting Rules**:
1. **Rule 1 (Betting DDoS Protection):**
   - URI Path equals `/api/wallet/deposit` or `/api/wallet/withdraw`
   - Action: Block or Managed Challenge if requests exceed 20 per 10 seconds per IP.
2. **Rule 2 (Socket Connection Flood):**
   - URI Path equals `/socket.io/`
   - Action: Challenge if connection attempts exceed 100 per minute per IP.

---

## 💳 3. Pakistani Payment Gateway Webhook URLs

When registering your merchant credentials with EasyPaisa & JazzCash:
- **EasyPaisa IPN URL:** `https://yourdomain.com/api/webhooks/easypaisa`
- **JazzCash IPN URL:** `https://yourdomain.com/api/webhooks/jazzcash`
- **Crypto Blockchain Webhook:** `https://yourdomain.com/api/webhooks/crypto`
