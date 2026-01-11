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

1. **Clone the repository:**
   ```bash
   git clone git@github.com:AlaminSarkerFRII/Real-time-high-traffic-inventory-system.git
   cd Real-time-high-traffic-inventory-system
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   The `.env` file contains all necessary configuration. You can edit it if you need to change database credentials or ports.

3. **Run with Docker:**
   ```bash
   docker compose up --build
   ```
   
   This will:
   - Start PostgreSQL database
   - Build and start the backend server
   - Build and start the frontend
   - Start Nginx reverse proxy

4. **Access the application:**
   - **Application (via Nginx)**: `http://localhost:8080`
   - **Backend API**: `http://localhost:8080/api`
   - **Database (from host)**: `localhost:15432`
   
   > **Note**: All services are accessible through Nginx on port 8080. The frontend and API are proxied through Nginx.

### Option 2: Manual Setup

#### Prerequisites

- Node.js (v16+)
- PostgreSQL database (local or cloud like Neon)

#### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone git@github.com:AlaminSarkerFRII/Real-time-high-traffic-inventory-system.git
   cd Real-time-high-traffic-inventory-system
   ```
   **Default branch:** `main`

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file in the root directory with your database credentials:
   ```env
   # Database Configuration
   POSTGRES_DB=inventory_db
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432

   # Backend Configuration
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/inventory_db
   PGSSLMODE=disable
   PORT=4000

   # Frontend Configuration
   VITE_BACKEND_URL=http://localhost:4000/api
   ```
   
   > **For Neon or other cloud databases**, set `PGSSLMODE=require` and update `DATABASE_URL` with your connection string.

3. **Setup Backend:**
   
   Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the `backend` directory (or use the root `.env`):
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/inventory_db
   PGSSLMODE=disable
   PORT=4000
   ```
   
   Start the backend server:
   ```bash
   npm start
   ```
   
   You should see:
   ```
   Connected to Neon PostgreSQL
   Database synced
   🚀 Server running on port 4000
   ```

4. **Setup Frontend:**
   
   Open a **new terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_BACKEND_URL=http://localhost:4000/api
   ```
   
   Start the frontend development server:
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:4000/api`
   - **Health Check**: `http://localhost:4000/api/health`

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

> **Note**: If using Docker, replace `localhost:4000` with `localhost:8080` in the URLs below.

### 1. Create a Drop
```bash
# Docker (via Nginx)
curl -X POST http://localhost:8080/api/drops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Air Jordan 1 High OG",
    "price": 200,
    "totalStock": 100
  }'

# Manual Setup
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
# Docker (via Nginx)
curl http://localhost:8080/api/drops

# Manual Setup
curl http://localhost:4000/api/drops
```

### 3. Make a Reservation
```bash
# Docker (via Nginx)
curl -X POST http://localhost:8080/api/reserve/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'

# Manual Setup
curl -X POST http://localhost:4000/api/reserve/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### 4. Complete Purchase
```bash
# Docker (via Nginx)
curl -X POST http://localhost:8080/api/purchase/1 \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'

# Manual Setup
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

The project uses a `.env` file for configuration. Copy `.env.example` to `.env` and update the values:

```env
# Database Configuration
POSTGRES_DB=inventory_db
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Backend Configuration
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
PGSSLMODE=require  # or 'disable' for local development
PORT=4000

# Frontend Configuration
VITE_BACKEND_URL=http://localhost:4000/api  # or http://localhost:8080/api for Docker
```

> **Important**: `.env` files to version control. The `.env.example` file serves as a template.

## Development

### Docker Development
- Services automatically restart on code changes (volume mounts)
- Database persists in Docker volume `postgres_data`
- View logs: `docker compose logs -f [service_name]`
- Stop services: `docker compose down`
- Stop and remove volumes: `docker compose down -v`

### Manual Development
- Backend: Use `npm run dev` for development with nodemon (if configured)
- Frontend: Vite hot-reload is enabled by default
- Database syncs automatically on startup (`alter: true`)
- CORS enabled for frontend development

### Troubleshooting

**Docker Connection Issues:**
- Ensure PostgreSQL healthcheck passes before backend starts
- Check logs: `docker compose logs postgres` and `docker compose logs backend`
- Verify `.env` file exists and has correct values

**Manual Setup Issues:**
- Ensure PostgreSQL is running and accessible
- Verify `.env` files exist in both `backend/` and `frontend/` directories
- Check that ports 4000 and 5173 are not in use
