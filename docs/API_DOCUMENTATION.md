# 📘 Aviator Crash Game - API & WebSocket Documentation

Comprehensive technical reference for Aviator REST API endpoints and real-time Socket.io events.

---

## 🌐 1. Base URLs
- **REST API Base:** `http://localhost:5000/api`
- **WebSocket Gateway:** `ws://localhost:5000`

---

## 🔐 2. Authentication API (`/api/auth`)

### 1. Register New Player
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "username": "LuckyPilot",
    "email": "pilot@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful! Welcome bonus credited.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c7b5b5c0-1234-4567-89ab-cdef01234567",
      "username": "LuckyPilot",
      "email": "pilot@example.com",
      "role": "user",
      "balance_pkr": 5000.00,
      "balance_usdt": 20.00,
      "kyc_status": "unverified"
    }
  }
  ```

### 2. Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "identifier": "pilot@example.com",
    "password": "SecurePassword123"
  }
  ```

### 3. 1-Click Demo Login
- **Endpoint:** `POST /api/auth/demo-login`
- **Description:** Loads standard demo player account with test PKR & USDT balances.

### 4. 1-Click Admin Login
- **Endpoint:** `POST /api/auth/admin-login`
- **Description:** Authorizes administrative operator with `role: "admin"`.

### 5. Get Current Profile
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

---

## 💳 3. Multi-Currency Wallet API (`/api/wallet`)

### 1. Get Wallet Balance
- **Endpoint:** `GET /api/wallet/balance`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:**
  ```json
  {
    "success": true,
    "balance_pkr": 50000.00,
    "balance_usdt": 500.00
  }
  ```

### 2. Request Deposit
- **Endpoint:** `POST /api/wallet/deposit`
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `gateway`: `EASYPAISA` | `JAZZCASH` | `BANK_TRANSFER` | `CRYPTO_USDT`
  - `amount`: `5000`
  - `currency`: `PKR` | `USDT`
  - `accountNumber`: `03001234567`
  - `receipt`: (Optional file upload for IBFT bank transfers)

### 3. Request Withdrawal
- **Endpoint:** `POST /api/wallet/withdraw`
- **Body:**
  ```json
  {
    "gateway": "EASYPAISA",
    "amount": 2500,
    "currency": "PKR",
    "accountNumber": "03001234567",
    "accountTitle": "Arslan Khan"
  }
  ```

---

## 🎲 4. Game & Provably Fair API (`/api/game`)

### 1. Recent Completed Rounds
- **Endpoint:** `GET /api/game/recent-rounds`
- **Response:**
  ```json
  {
    "success": true,
    "rounds": [
      {
        "round_number": 1025,
        "crash_multiplier": 3.70,
        "server_seed": "8cf5e640438f2e2e6b7ab4da1d980c42a56a13a7aeaf272f977ba9bee532be30",
        "server_seed_hash": "17fa2730ba4020f1882e5668bcf8c8c5029e0da765e7cead2e06c74bf9129e92",
        "client_seed": "c1f7281ab0982341",
        "nonce": 1025
      }
    ]
  }
  ```

### 2. Independent Provably Fair Verifier
- **Endpoint:** `POST /api/game/verify`
- **Body:**
  ```json
  {
    "serverSeed": "8cf5e640438f2e2e6b7ab4da1d980c42a56a13a7aeaf272f977ba9bee532be30",
    "clientSeed": "c1f7281ab0982341",
    "nonce": 1025
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "verification": {
      "serverSeed": "8cf5e6...",
      "serverSeedHash": "17fa27...",
      "multiplier": 3.70,
      "hash": "3a88fb037996ba3a1e2f78a...",
      "hexSub": "3a88fb037996b"
    }
  }
  ```

---

## ⚡ 5. Real-Time WebSocket Events (Socket.io)

### Client ➔ Server Events

| Event Name | Payload | Description |
|---|---|---|
| `place_bet` | `{ token, betNumber: 1, currency: "PKR", amount: 500, autoCashoutMultiplier: 2.0 }` | Places a bet during `WAITING` phase |
| `cash_out` | `{ token, betId: "..." }` | Claims winnings during `FLYING` phase |
| `send_chat` | `{ token, message: "Let's go!", emoji: "🚀" }` | Sends live chat message |

### Server ➔ Client Events

| Event Name | Payload | Trigger |
|---|---|---|
| `game_init` | Full initial lobby snapshot | Sent immediately upon connection |
| `game_waiting` | `{ roundNumber, serverSeedHash, durationMs, countdownEnd }` | 5-second betting phase begins |
| `game_started` | `{ roundNumber, startTime }` | Plane takes off, flight phase begins |
| `multiplier_tick` | `{ multiplier: 2.45, elapsedMs: 3200 }` | Emitted every 50ms (20 FPS) |
| `bet_placed` | `{ id, username, amount, currency }` | When any player/bot places a bet |
| `bet_cashed_out` | `{ betId, username, multiplier, payout }` | When any player/bot cashes out |
| `game_crashed` | `{ roundNumber, crashMultiplier, serverSeed, serverSeedHash }` | Plane crashes / flies away |
| `chat_message` | `{ id, username, message, emoji, created_at }` | Real-time chat message broadcast |

---

## 🎛️ 6. Admin Backoffice Endpoints (`/api/admin`)

*Note: All admin routes require `role: "admin"` in JWT bearer token.*

- `GET /api/admin/dashboard` - Financial overview (GGR, NGR, Turnover, Payouts, Queues)
- `GET /api/admin/users` - Player accounts list with balance & KYC status
- `POST /api/admin/users/:id/adjust-balance` - Adjust balance (Credit/Debit)
- `PATCH /api/admin/users/:id/status` - Freeze/Unfreeze account or set KYC
- `POST /api/admin/transactions/:id/approve` - Approve deposit or withdrawal
- `POST /api/admin/transactions/:id/reject` - Reject transaction (auto-refunds withdrawals)
- `POST /api/admin/settings` - Update RTP %, house margin, and bet limits
- `POST /api/admin/emergency-crash` - Trigger instant manual crash
- `POST /api/admin/set-next-multiplier` - Preset target crash multiplier for testing
