# Real-Time High-Traffic Inventory System

A Node.js backend for managing limited edition sneaker drops with real-time stock updates and atomic reservations.

## Features

- **Atomic Reservations**: Prevent overselling with database-level locking
- **Real-Time Updates**: Live stock updates via WebSockets
- **Automatic Expiration**: 60-second reservation windows with background cleanup
- **Activity Feed**: Top 3 recent purchasers per drop
- **Purchase Flow**: Complete reserved items with permanent stock deduction

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Sequelize
- **Real-Time**: Socket.io
- **State Management**: Database transactions for consistency

## Setup

### Option 1: Docker (Recommended for Easy Setup)

1. Clone the repository:
   ```bash
   git clone git@github.com:AlaminSarkerFRII/Real-time-high-traffic-inventory-system.git
   cd Real-time-high-traffic-inventory-system
   ```

2. **Run with Docker:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000`
   - Database: `localhost:5432` (accessible from host)

### Option 2: Manual Setup

#### Prerequisites

- Node.js (v16+)
- PostgreSQL database (Neon recommended)

#### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:AlaminSarkerFRII/Real-time-high-traffic-inventory-system.git
   cd Real-time-high-traffic-inventory-system
   ```
   **Default branch:** `main`

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Configure `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   PORT=4000
   ```
   Start backend server:
   ```bash
   npm start
   ```

3. **Setup Frontend (in new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000`

## API Endpoints

### Drops
- `GET /api/drops` - Get all active drops with activity feed
- `GET /api/drops/:id` - Get specific drop details
- `POST /api/drops` - Create new drop (admin)

### Reservations
- `POST /api/reserve/:dropId` - Reserve item (body: `{userId: number}`)

### Purchases
- `POST /api/purchase/:reservationId` - Complete purchase (body: `{userId: number}`)

### Health Check
- `GET /api/health` - Server health status

## Real-Time Events (WebSocket)

- `stockUpdate`: `{dropId, availableStock}` - Stock changes
- `newPurchase`: `{dropId, userId, username, timestamp}` - New purchases
- `connected`: `{message}` - Connection confirmation

## Database Schema

### Users
- id (Primary Key)
- username (Unique)

### Drops
- id (Primary Key)
- name
- price
- total_stock
- available_stock
- drop_start_time

### Reservations
- id (Primary Key)
- userId (Foreign Key)
- dropId (Foreign Key)
- status (ACTIVE/EXPIRED/PURCHASED)
- expires_at

### Purchases
- id (Primary Key)
- userId (Foreign Key)
- dropId (Foreign Key)

## Testing the System

### 1. Create a Drop
```bash
curl -X POST http://localhost:4000/api/drops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Air Jordan 1 High OG",
    "price": 200,
    "totalStock": 100
  }'
```

### 2. Get Active Drops
```bash
curl http://localhost:4000/api/drops
```

### 3. Make a Reservation
```bash
curl -X POST http://localhost:4000/api/reserve/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### 4. Complete Purchase
```bash
curl -X POST http://localhost:4000/api/purchase/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

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

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy backend API to `/api` routes
4. Use Neon for PostgreSQL database

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
PORT=4000
```

## Development

- Use `npm run dev` for development with nodemon
- Database syncs automatically on startup (`alter: true`)
- CORS enabled for frontend development
