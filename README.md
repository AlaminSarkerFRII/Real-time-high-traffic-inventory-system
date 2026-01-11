# Real-Time High-Traffic Inventory System

A Node.js backend for managing limited edition sneaker drops with real-time stock updates and atomic reservations.

## 🌐 Live Application

- **Frontend**: [https://real-time-high-traffic-inventory-sy.vercel.app/](https://real-time-high-traffic-inventory-sy.vercel.app/)
- **Backend API**: [https://real-time-high-traffic-inventory-system-production.up.railway.app](https://real-time-high-traffic-inventory-system-production.up.railway.app)

## Features

- **Atomic Reservations**: Prevent overselling with database-level locking
- **Real-Time Updates**: Live stock updates via WebSockets
- **Automatic Expiration**: 60-second reservation windows with background cleanup
- **Activity Feed**: Top 3 recent purchasers per drop
- **Purchase Flow**: Complete reserved items with permanent stock deduction

## Tech Stack

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **ORM**: Sequelize
- **Deployment**: Railway (Backend) + Vercel (Frontend)

## API Endpoints

### Health Check
```bash
curl https://real-time-high-traffic-inventory-system-production.up.railway.app/api/health
```

**Response:**
```json
{"status":"OK","message":"Inventory system is running"}
```

### Get All Active Drops
```bash
curl https://real-time-high-traffic-inventory-system-production.up.railway.app/api/drops
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Air Jordan 1 High OG",
    "price": 200,
    "availableStock": 100,
    "totalStock": 100,
    "dropStartTime": "2026-01-11T09:00:00.000Z",
    "recentPurchases": []
  }
]
```

### Get Specific Drop
```bash
curl https://real-time-high-traffic-inventory-system-production.up.railway.app/api/drops/1
```

### Create a Drop
```bash
curl -X POST https://real-time-high-traffic-inventory-system-production.up.railway.app/api/drops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Air Jordan 1 High OG",
    "price": 200,
    "totalStock": 100
  }'
```

**Response:**
```json
{
  "message": "Drop created successfully",
  "drop": {
    "id": 1,
    "name": "Air Jordan 1 High OG",
    "price": 200,
    "totalStock": 100,
    "availableStock": 100
  }
}
```

### Make a Reservation
```bash
curl -X POST https://real-time-high-traffic-inventory-system-production.up.railway.app/api/reserve/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**Response:**
```json
{
  "message": "Reservation successful",
  "reservation": {
    "id": 1,
    "status": "ACTIVE",
    "expires_at": "2026-01-11T09:01:00.000Z"
  }
}
```

### Complete Purchase
```bash
curl -X POST https://real-time-high-traffic-inventory-system-production.up.railway.app/api/purchase/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**Response:**
```json
{
  "message": "Purchase completed successfully",
  "purchase": {
    "id": 1,
    "userId": 1,
    "dropId": 1
  }
}
```

### Get All Users
```bash
curl https://real-time-high-traffic-inventory-system-production.up.railway.app/api/users
```

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "demo_user"
    }
  ]
}
```

### Create User
```bash
curl -X POST https://real-time-high-traffic-inventory-system-production.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "demo_user"}'
```

**Request Body:**
```json
{
  "username": "string (required, unique)"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "demo_user"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Username is required"
}
```

## Real-Time Events (WebSocket)

The application uses Socket.io for real-time updates. Connect to:
```
https://real-time-high-traffic-inventory-system-production.up.railway.app
```

**Events:**
- `stockUpdate`: `{dropId, availableStock}` - Stock changes
- `newPurchase`: `{dropId, userId, username, timestamp}` - New purchases
- `connected`: `{message}` - Connection confirmation

## Database Schema

### Users
- `id` (Primary Key)
- `username` (Unique)

### Drops
- `id` (Primary Key)
- `name`
- `price`
- `total_stock`
- `available_stock`
- `drop_start_time`

### Reservations
- `id` (Primary Key)
- `userId` (Foreign Key)
- `dropId` (Foreign Key)
- `status` (ACTIVE/EXPIRED/PURCHASED)
- `expires_at`

### Purchases
- `id` (Primary Key)
- `userId` (Foreign Key)
- `dropId` (Foreign Key)

## Architecture Highlights

### Concurrency Prevention
- Database row-level locking (`SELECT ... FOR UPDATE`)
- Transaction-based operations ensure consistency
- No race conditions between multiple reservation attempts

### Expiration Handling
- Background service checks every 10 seconds
- Automatic stock recovery for expired reservations
- Real-time broadcast of stock updates

### Real-Time Communication
- Socket.io for instant client updates
- Broadcast stock changes to all connected clients
- Activity feed updates for purchase events

## Local Setup

### Prerequisites
- Node.js (v16+)
- Neon database account (or local PostgreSQL)

### Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:AlaminSarkerFRII/Real-time-high-traffic-inventory-system.git
   cd Real-time-high-traffic-inventory-system
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Neon database connection string:
   ```env
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   PGSSLMODE=require
   PORT=4000
   VITE_BACKEND_URL=http://localhost:4000
   ```

3. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Setup Frontend (in new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000/api`
   - Health Check: `http://localhost:4000/api/health`

## Docker Setup

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Run with Docker:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - Application: `http://localhost:8080`
   - Backend API: `http://localhost:8080/api`

## Deployment

### Backend (Railway)
- Platform: [Railway](https://railway.app)
- URL: `https://real-time-high-traffic-inventory-system-production.up.railway.app`
- Environment Variables: `DATABASE_URL`, `PGSSLMODE`, `FRONTEND_URL`, `CORS_ORIGIN`

### Frontend (Vercel)
- Platform: [Vercel](https://vercel.com)
- URL: `https://real-time-high-traffic-inventory-sy.vercel.app/`
- Environment Variables: `VITE_BACKEND_URL`

## License

ISC
