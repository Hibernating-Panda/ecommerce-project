# Delivery Management & Live Tracking System - Architecture

## Project Overview
A full-stack real-time delivery management system with live GPS tracking, role-based dashboards, and comprehensive order management.

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Maps**: React Leaflet + OpenStreetMap
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: React Context API + Hooks

### Backend
- **Framework**: Laravel 13
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **API**: RESTful JSON API

## Database Schema

### Users Table
- id, name, email, password, phone, role_id, avatar, is_active, created_at, updated_at

### Roles Table
- id, name (admin, delivery_man, customer)

### Deliveries Table
- id, order_id, driver_id, status, pickup_location, delivery_location, current_lat, current_lng, estimated_time, started_at, completed_at

### Orders Table
- id, customer_id, status, total_price, payment_status, created_at, updated_at

### Locations Table
- id, delivery_id, latitude, longitude, timestamp, address

### Notifications Table
- id, user_id, type, message, is_read, created_at

### Payments Table
- id, order_id, method, amount, status, transaction_id, created_at

## API Endpoints

### Authentication
- POST `/api/register` - Register new user
- POST `/api/login` - Login user
- POST `/api/logout` - Logout user (protected)
- GET `/api/user` - Get current user (protected)

### Admin Routes (Protected with role:admin)
- GET `/api/admin/dashboard` - Admin dashboard stats
- GET|POST `/api/admin/orders` - Order management
- GET|POST `/api/admin/deliveries` - Delivery management
- GET|POST `/api/admin/users` - User management
- GET `/api/admin/reports` - Analytics

### Delivery Man Routes (Protected with role:delivery_man)
- GET `/api/deliveries/assigned` - Assigned deliveries
- GET `/api/deliveries/{id}` - Delivery details
- PATCH `/api/deliveries/{id}/status` - Update delivery status
- POST `/api/deliveries/{id}/location` - Update location
- GET `/api/deliveries/history` - Delivery history

### Customer Routes (Protected with role:customer)
- POST `/api/orders` - Create order
- GET `/api/orders` - Order history
- GET `/api/orders/{id}/track` - Track order
- GET `/api/notifications` - Get notifications

## Frontend Structure

### Components
- **Auth**: Login, Register, ProtectedRoute
- **Layout**: Sidebar, Navbar, Layout wrapper
- **Dashboard**: Admin, DeliveryMan, Customer dashboards
- **Map**: MapComponent, TrackingMap, RouteDisplay
- **UI**: Cards, Charts, Buttons, Forms, Modals

### Pages
- Login, Register
- Admin: Dashboard, Orders, Deliveries, Users, Reports
- DeliveryMan: Dashboard, Assignments, Tracking, History
- Customer: Dashboard, PlaceOrder, TrackingPage, Orders

## Key Features

1. **Authentication & Authorization**
   - Role-based access control
   - JWT token-based auth with Sanctum
   - Protected routes

2. **Real-time Tracking**
   - Live GPS location updates
   - Map display with markers
   - Route polylines
   - Driver movement simulation

3. **Order Management**
   - Create, view, update orders
   - Status tracking
   - Order history

4. **Notifications**
   - Real-time order updates
   - Delivery status changes
   - System notifications

5. **Analytics**
   - Dashboard statistics
   - Order reports
   - Delivery metrics
   - Revenue charts

## Setup Instructions

### Backend Setup
1. Install dependencies: `composer install`
2. Create `.env` from `.env.example`
3. Generate app key: `php artisan key:generate`
4. Run migrations: `php artisan migrate`
5. Seed database: `php artisan db:seed`
6. Start server: `php artisan serve`

### Frontend Setup
1. Install dependencies: `npm install`
2. Create `.env` with API_URL
3. Start dev server: `npm run dev`
4. Build for production: `npm run build`

## File Structure

```
ecommerce-project/
├── backend/ (Laravel)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── API/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── Admin/
│   │   │   │   │   ├── DeliveryMan/
│   │   │   │   │   └── Customer/
│   │   │   ├── Middleware/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Order.php
│   │   │   ├── Delivery.php
│   │   │   ├── Location.php
│   │   │   └── Notification.php
│   │   └── Traits/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   ├── config/
│   └── ...
├── frontend/ (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Layout/
│   │   │   ├── Dashboard/
│   │   │   ├── Map/
│   │   │   ├── UI/
│   │   │   └── Common/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── deliveryMan/
│   │   │   ├── customer/
│   │   │   └── auth/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── vite.config.js
│   └── tailwind.config.js
└── ARCHITECTURE.md
```

## Development Phases

### Phase 1: Backend Setup (Authentication & Database)
- [ ] Database migrations
- [ ] User & Role models
- [ ] Authentication endpoints
- [ ] Sanctum configuration

### Phase 2: Backend APIs (Orders & Deliveries)
- [ ] Order CRUD APIs
- [ ] Delivery CRUD APIs
- [ ] Location tracking API
- [ ] Admin management APIs

### Phase 3: Frontend Setup (Structure & Auth)
- [ ] Vite configuration
- [ ] Project structure
- [ ] Authentication flow
- [ ] Protected routes

### Phase 4: Frontend Components & Pages
- [ ] Layout components
- [ ] Dashboard pages
- [ ] Map integration
- [ ] Responsive UI

### Phase 5: Real-time Features
- [ ] Live location tracking
- [ ] WebSocket integration (optional)
- [ ] Notifications
- [ ] Real-time updates

### Phase 6: Final Polish
- [ ] Testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment preparation

