# 🚀 Aviator Crash Game - Real-Time Multiplayer Application

![Aviator Banner](https://img.shields.io/badge/Aviator-Crash%20Game%20Pro-e51e38?style=for-the-badge&logo=rocket)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-28a745?style=for-the-badge)

A high-performance, full-stack **Aviator** style real-time crash game featuring 60 FPS HTML5 Canvas flight trajectories, dual simultaneous betting panels, cryptographic **Provably Fair SHA-256 HMAC** verification, multi-currency wallet support (**PKR** & **USDT**), Pakistani local payment gateways (**EasyPaisa, JazzCash, IBFT Bank Transfers**), and an administrative backoffice dashboard.

---

## 🌟 Key Features

1. **✈️ High-Performance 60 FPS Flight Graphics:**
   - Smooth exponential flight trajectory rendered on HTML5 Canvas.
   - Aerodynamic red propeller aeroplane with dynamic particle smoke/exhaust trail.
   - Dynamic $X$ (Time) & $Y$ (Multiplier) radar grid axes.
   - Web Audio API synthesized sound engine (Engine drone, takeoff, cashout coin chimes, crash thud).

2. **🎲 Provably Fair SHA-256 HMAC Engine:**
   - Deterministic crash multiplier calculation before round start.
   - Pre-hashed Server Seed published publicly before takeoff.
   - Interactive front-end verification tool with step-by-step hex calculation inspection.

3. **💰 Dual Simultaneous Betting Panels:**
   - Place independent **Bet 1** and **Bet 2** in the same round.
   - Quick chips, half (`/2`), and double (`2X`) shortcuts.
   - **Auto Bet** and **Auto Cashout** multiplier thresholds.
   - Dynamic real-time cashout button calculating winning payouts on every tick.

4. **💳 Multi-Currency Wallet & Pakistani Payment Gateways:**
   - Native support for **PKR (₨)** and **USDT ($)**.
   - **EasyPaisa & JazzCash:** Instant USSD / Merchant API integration.
   - **Bank Transfer (IBFT):** Meezan Bank / HBL / Bank Alfalah with screenshot proof upload preview.
   - **Crypto USDT TRC-20:** Instant address generation, QR code, and blockchain transaction tracking.

5. **🎛️ Comprehensive Admin Backoffice:**
   - Real-time GGR, NGR, Turnover, and Payout financial analytics.
   - Live flight monitor with **Emergency Manual Crash** trigger.
   - Next-round crash target multiplier override.
   - RTP % (Return to Player) & House Margin slider configuration.
   - Pending deposit & withdrawal approval queues with bank slip preview.
   - User account management, balance adjustments (credit/debit), and freezing.

6. **💬 Multiplayer Lobby & Live Social Features:**
   - Live bets sidebar tracking all players and simulated bots in real time.
   - Recent multiplier pills ribbon (color-coded by tier: <2x Blue, 2x-10x Purple, >10x Gold).
   - Real-time player chat room with quick emoji reactions.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, HTML5 Canvas 2D, Lucide Icons, Canvas Confetti, Web Audio API.
- **Backend:** Node.js, Express.js, Socket.io (WebSocket), JWT Authentication, Multer.
- **Database & State:** Relational PostgreSQL schema + Persistent embedded database adapter + Redis caching support.
- **DevOps:** Docker, Docker Compose, Nginx Reverse Proxy.

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure the backend signing key
The backend requires a private `JWT_SECRET` of at least 32 characters and will not start with a built-in default. Generate a strong key with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Put the generated value in `server/.env` as `JWT_SECRET=<generated-value>`. For Docker Compose, set the same variable in the root `.env` file or your shell environment. Changing this key invalidates previously issued login tokens.

### 3. Run Locally
In terminal 1 (Start Backend Server):
```bash
npm run server
```

In terminal 2 (Start Frontend Client):
```bash
npm run client
```

Open your browser at **`http://localhost:5173`**!

---

## 🔑 Default Accounts

- **Demo Player:** 1-Click login available on UI or use `demo@aviator.local` / `demo123` (Pre-credited with 50,000 PKR + 500 USDT).
- There is no default admin account or one-click admin login. Register your own account, then grant it admin access from the server directory:
  ```bash
  node scripts/promote-admin.js your-account@example.com
  ```
  Run this command from the `server` directory after creating `server/.env`. The current backend persists users in `server/data/db.json`; restart the server after changing a role so existing client state refreshes through `/api/auth/me`. Legacy seeded admin accounts are downgraded during database load.
- To create a new admin account or reset an existing account's password and grant it admin access, run `node scripts/setup-admin.js your-account@example.com` from the `server` directory. It prints a randomly generated temporary password once; save it securely and change it after logging in.

---

## 📚 Documentation Links
- [API & WebSocket Specification](file:///c:/Users/Arslan%20Khan/OneDrive/Desktop/working%20project/vs%20games%20aviater/docs/API_DOCUMENTATION.md)
- [Provably Fair Cryptography Guide](file:///c:/Users/Arslan%20Khan/OneDrive/Desktop/working%20project/vs%20games%20aviater/docs/PROVABLY_FAIR.md)
- [Production Deployment Guide](file:///c:/Users/Arslan%20Khan/OneDrive/Desktop/working%20project/vs%20games%20aviater/docs/DEPLOYMENT_GUIDE.md)
