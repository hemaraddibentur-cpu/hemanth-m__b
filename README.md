# 🅿️ ParkSmart - Intelligent Campus Parking Management System

A comprehensive, production-ready full-stack Smart Parking Management & Slot Allocation Application designed for educational institutions.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Security, Faculty, Staff, Student, Visitor)
- Password reset functionality
- Email verification support

### 🚗 Parking Slot Booking
- Interactive zone selection with real-time availability
- Visual slot grid with occupancy status
- Multi-step booking wizard
- QR code generation for entry
- Cancellation and rescheduling

### 🚧 Gate Entry System
- QR code scanning at entry points
- License plate recognition (simulated)
- Auto-duration timer from entry
- RFID sticker verification

### 📊 Admin Dashboard & Analytics
- Real-time occupancy monitoring per zone
- Booking trends (area charts)
- Revenue overview (bar charts)
- Zone usage distribution (pie charts)
- Peak hours analysis
- User management with activate/suspend

### 🛡️ Security Dashboard
- Live occupancy monitoring with mini slot grids
- Violation alerts and management
- Fine issuance and tracking
- Real-time WebSocket updates

### 💳 Payment System
- Simulated payment gateway integration
- Transaction history with filtering
- Multiple payment methods (UPI, Cards, Wallet, Net Banking)
- Invoice tracking

### 🔔 Notifications
- In-app notifications with type-based styling
- Booking confirmations, reminders, violations
- Mark as read / mark all read

### 📱 Real-Time Features
- WebSocket (Socket.io) for live updates
- Slot availability auto-refresh
- Violation alerts
- Entry/exit event broadcasting

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS 3 + Custom Design System |
| **State Management** | Redux Toolkit |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend** | Node.js + Express.js + TypeScript |
| **ORM** | Prisma |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Real-time** | Socket.io |
| **Auth** | JWT + bcrypt |
| **Containerization** | Docker + Docker Compose |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│   React Frontend│────▶│  Express.js Backend   │────▶│ PostgreSQL  │
│   (Port 5173)   │     │    (Port 5000)        │     │ (Port 5432) │
│                 │     │                      │     └─────────────┘
│  - Redux Store  │◀───▶│  - REST API          │
│  - React Router │     │  - JWT Auth          │     ┌─────────────┐
│  - Socket.io    │     │  - Socket.io Server  │────▶│   Redis     │
│  - Recharts     │     │  - Prisma ORM        │     │ (Port 6379) │
└─────────────────┘     └──────────────────────┘     └─────────────┘
```

---

## 🚀 Quick Start (Docker)

```bash
# Clone the repository
git clone <repo-url>
cd mm

# Start all services
docker-compose up -d

# Run database migrations
docker exec parking-backend npx prisma migrate deploy

# Seed the database
docker exec parking-backend npx tsx prisma/seed.ts

# Open the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api/health
```

---

## 🔧 Manual Setup

### Prerequisites
- **Node.js** v18+ (https://nodejs.org)
- **PostgreSQL** v14+ (or use Docker for DB only)
- **Redis** v6+ (or use Docker for cache only)

### Database Setup (Docker - Recommended)
```bash
# Start only PostgreSQL and Redis
docker-compose up -d postgres redis
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 👥 Demo Accounts

All accounts use the password: **`password123`**

| Role | Email | Access |
|------|-------|--------|
| **Admin** | admin@campus.edu | Full system access, analytics, user management |
| **Security** | security@campus.edu | Security dashboard, violations, gate control |
| **Faculty** | prof.sharma@campus.edu | Booking, vehicles, payments |
| **Staff** | staff.mehra@campus.edu | Booking, vehicles, payments |
| **Student** | student.arjun@campus.edu | Booking, vehicles, payments |
| **Visitor** | visitor@example.com | Booking, vehicles, payments |

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Users & Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/vehicles` | Register vehicle |
| GET | `/api/users/vehicles` | List vehicles |
| DELETE | `/api/users/vehicles/:id` | Remove vehicle |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/availability` | Check slot availability |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | List bookings |
| GET | `/api/bookings/:id` | Get booking details |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |
| GET | `/api/bookings/:id/qrcode` | Get QR code |

### Parking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/parking/entry` | Process entry (Security) |
| POST | `/api/parking/exit` | Process exit (Security) |
| GET | `/api/parking/real-time-status` | Live zone status |
| GET | `/api/parking/navigation/:slotId` | Navigation directions |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard-stats` | Dashboard statistics |
| GET | `/api/admin/analytics/usage` | Usage analytics |
| GET | `/api/admin/analytics/revenue` | Revenue analytics |
| POST | `/api/admin/zones` | Create parking zone |
| PUT | `/api/admin/zones/:id` | Update zone |
| GET | `/api/admin/violations` | List violations |
| POST | `/api/admin/violations` | Create violation |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/toggle-status` | Suspend/activate user |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initiate` | Initiate payment |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments/history` | Payment history |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |

---

## 🗄️ Database Schema

The system uses 12 database tables:

1. **Users** - User accounts with role-based access
2. **Vehicles** - Registered vehicles with RFID tags
3. **ParkingZones** - Campus parking zones with rates
4. **ParkingSlots** - Individual slots with position data
5. **Bookings** - Slot reservations with QR codes
6. **EntryLogs** - Vehicle entry records
7. **ExitLogs** - Vehicle exit records with duration
8. **Violations** - Parking violations with fines
9. **Payments** - Transaction records
10. **Passes** - Monthly/quarterly parking passes
11. **Notifications** - In-app notifications

### Seed Data Included
- 🧑 10 users (all roles)
- 🚗 10 vehicles
- 🅿️ 5 parking zones
- 📍 50 parking slots
- 📋 20 bookings (various statuses)
- 💳 15+ payment records
- ⚠️ 5 violations
- 🎫 4 parking passes
- 🔔 5 notifications

---

## 📁 Project Structure

```
mm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (12 tables)
│   │   └── seed.ts                # Seed data script
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts           # Environment config
│   │   │   ├── database.ts        # Prisma client
│   │   │   └── logger.ts          # Winston logger
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT auth + role guard
│   │   │   ├── validate.ts        # Input validation
│   │   │   └── errorHandler.ts    # Error handling
│   │   ├── controllers/
│   │   │   ├── authController.ts      # Auth operations
│   │   │   ├── vehicleController.ts   # Vehicle CRUD
│   │   │   ├── bookingController.ts   # Booking operations
│   │   │   ├── parkingController.ts   # Entry/exit/status
│   │   │   ├── adminController.ts     # Admin analytics
│   │   │   ├── paymentController.ts   # Payment processing
│   │   │   └── notificationController.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── bookingRoutes.ts
│   │   │   ├── parkingRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   ├── paymentRoutes.ts
│   │   │   └── notificationRoutes.ts
│   │   ├── websocket/
│   │   │   └── index.ts           # Socket.io server
│   │   └── server.ts              # Express app
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx         # Main layout + sidebar
│   │   ├── pages/
│   │   │   ├── Landing.tsx            # Public landing page
│   │   │   ├── Login.tsx              # Login form
│   │   │   ├── Register.tsx           # Registration form
│   │   │   ├── Dashboard.tsx          # Role-aware dashboard
│   │   │   ├── BookingPage.tsx        # Multi-step booking wizard
│   │   │   ├── MyBookings.tsx         # Booking list + QR modal
│   │   │   ├── Vehicles.tsx           # Vehicle management
│   │   │   ├── Payments.tsx           # Payment history
│   │   │   ├── AdminPanel.tsx         # Analytics with charts
│   │   │   ├── SecurityDashboard.tsx  # Live monitoring
│   │   │   ├── Settings.tsx           # Profile settings
│   │   │   ├── Notifications.tsx      # Notification center
│   │   │   ├── UserManagement.tsx     # Admin user mgmt
│   │   │   └── ViolationsPage.tsx     # Violation management
│   │   ├── store/
│   │   │   ├── index.ts           # Redux store config
│   │   │   └── authSlice.ts       # Auth state management
│   │   ├── services/
│   │   │   └── api.ts             # Axios + API wrappers
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   ├── App.tsx                # Router + guards
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Tailwind + custom CSS
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🔒 Security

- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation on all endpoints
- ✅ Rate limiting (200 req/15min)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (Helmet)
- ✅ Environment variable management

---

## 📝 License

This project is built for educational purposes and hackathon demonstrations.

---

Built with ❤️ for campus communities
