# Setup Guide - Delivery Management System

## Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn
- MySQL 8.0+
- Git

## Backend Setup

### 1. Installation

```bash
cd backend
composer install
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=delivery_system
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE delivery_system;"

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed
```

### 4. Configure Sanctum

```bash
# Already included in Laravel 13
# Just make sure SANCTUM_STATEFUL_DOMAINS is set in .env
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

### 5. Start Backend Server

```bash
php artisan serve
```

Backend will run on `http://127.0.0.1:8000`

## Frontend Setup

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env` file:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Authentication

The system uses Laravel Sanctum for API authentication.

### Token-Based Flow:
1. User registers or logs in
2. Server returns authentication token
3. Client stores token in localStorage
4. All subsequent requests include: `Authorization: Bearer {token}`

### API Endpoints:

#### Public Routes
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

#### Protected Routes (All require authentication)
- `GET /api/user` - Get current user info
- `POST /api/logout` - Logout user

#### Admin Routes (role:admin middleware)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET|POST /api/admin/orders` - Order management
- `GET|POST /api/admin/deliveries` - Delivery management
- `GET|POST /api/admin/users` - User management

#### Delivery Man Routes (role:delivery_man middleware)
- `GET /api/delivery/assigned` - Get assigned deliveries
- `GET /api/delivery/:id` - Get delivery details
- `PATCH /api/delivery/:id/status` - Update delivery status
- `POST /api/delivery/:id/location` - Update location
- `GET /api/delivery/history` - Get delivery history

#### Customer Routes (role:customer middleware)
- `GET /api/customer/orders` - Get orders
- `POST /api/customer/orders` - Create new order
- `GET /api/customer/orders/:id` - Get order details
- `GET /api/customer/orders/:id/track` - Track order

## Testing

### Admin Account
```
Email: admin@example.com
Password: password123
Role: Admin
```

### Delivery Person Account
```
Email: driver@example.com
Password: password123
Role: Delivery Man
```

### Customer Account
```
Email: customer@example.com
Password: password123
Role: Customer
```

## Features Implemented

### Authentication
✅ User registration
✅ User login with role-based access
✅ Token-based authentication (Sanctum)
✅ Logout functionality

### Admin Dashboard
✅ Statistics overview
✅ Order management
✅ Delivery tracking
✅ User management
✅ Reports and analytics

### Delivery Man Dashboard
✅ View assigned deliveries
✅ Update delivery status
✅ Live location tracking
✅ Delivery history

### Customer Dashboard
✅ Place new order
✅ Track order status
✅ View order history
✅ Notifications

### Maps & Tracking
⏳ Live GPS tracking (coming soon)
⏳ Route polylines (coming soon)
⏳ Real-time updates (coming soon)

## Troubleshooting

### CORS Errors
Make sure CORS is enabled in `config/cors.php`:
```php
'allowed_origins' => [
    'localhost:3000',
    '127.0.0.1:3000',
],
```

### Database Connection Failed
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database exists

### Token Issues
- Clear localStorage and log in again
- Check token expiry in Sanctum config
- Verify `Authorization` header is set correctly

## Next Steps

1. **Map Integration**
   - Set up React Leaflet
   - Integrate OpenStreetMap tiles
   - Implement live marker tracking

2. **Real-time Updates**
   - Setup WebSockets (Laravel Reverb)
   - Implement real-time notifications
   - Live location streaming

3. **Advanced Features**
   - Payment integration (Stripe)
   - SMS/Email notifications
   - Analytics dashboard
   - Driver ratings system

## Production Deployment

### Backend
```bash
# Optimize for production
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Start with proper server (nginx, Apache, etc.)
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to static hosting
```

## Project Structure Summary

```
ecommerce-project/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── API/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── Admin/
│   │   │   │   ├── DeliveryMan/
│   │   │   │   └── Customer/
│   │   │   └── Middleware/
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Order.php
│   │       ├── Delivery.php
│   │       ├── Location.php
│   │       ├── Notification.php
│   │       ├── Payment.php
│   │       └── Role.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Map/
│   │   │   └── UI/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── deliveryMan/
│   │   │   └── customer/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env
└── ARCHITECTURE.md
```

