# Developer Quick Reference

## Project Overview

This is a full-stack delivery management system with live GPS tracking capabilities.

**Backend**: Laravel 13 API on `http://127.0.0.1:8000`  
**Frontend**: React 19 with Vite on `http://localhost:3000`

## Quick Commands

### Backend
```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate                    # Run migrations
php artisan migrate:refresh --seed     # Reset & seed
php artisan db:seed                    # Seed only

# Development
php artisan serve                      # Start server (port 8000)
php artisan tinker                     # Interactive shell

# Cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Development
npm run dev                            # Start dev server (port 3000)
npm run build                          # Build for production
npm run preview                        # Preview production build
npm run lint                           # Run linter
```

## Authentication Flow

### 1. User Registers
```
POST /api/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 000-0000",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "customer"
}

Returns: { token, user }
```

### 2. Store Token
```javascript
// Frontend (React)
localStorage.setItem('token', response.data.token);

// Axios instance
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### 3. Access Protected Routes
```
Headers: { Authorization: 'Bearer {token}' }
GET /api/user
```

## Database Schema

### Key Tables
```sql
-- users (id, name, email, phone, role_id, is_active, timestamps)
-- roles (id, name, description, timestamps)
-- orders (id, customer_id, status, total_price, timestamps)
-- deliveries (id, order_id, driver_id, status, lat/lng, timestamps)
-- locations (id, delivery_id, latitude, longitude, timestamp)
-- notifications (id, user_id, type, message, is_read, timestamps)
-- payments (id, order_id, amount, method, status, timestamps)
```

## Frontend Structure

### Components
```
src/
  ├── components/
  │   ├── Layout/           # Sidebar, Navbar, Layout wrapper
  │   ├── Map/              # Map components for tracking
  │   ├── Auth/             # Auth related components
  │   └── UI/               # Reusable UI components
  ├── pages/
  │   ├── auth/             # Login, Register
  │   ├── admin/            # Admin pages
  │   ├── deliveryMan/      # Driver pages
  │   └── customer/         # Customer pages
  ├── services/
  │   ├── api.js            # Axios config
  │   └── authService.js    # Auth utilities
  ├── context/
  │   └── AuthContext.jsx   # Auth state management
  └── App.jsx               # Main app component
```

### Authentication Context
```javascript
import { useAuth } from './context/AuthContext';

const { user, token, loading, login, register, logout } = useAuth();

// Protected route
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

## API Routes

### Structure
```
/api/
  ├── register (POST)
  ├── login (POST)
  ├── logout (POST) - protected
  ├── user (GET) - protected
  ├── admin/
  │   ├── dashboard
  │   ├── orders
  │   ├── deliveries
  │   └── users
  ├── delivery/
  │   ├── assigned
  │   ├── :id
  │   ├── :id/status
  │   ├── :id/location
  │   └── history
  └── customer/
      ├── orders (GET/POST)
      ├── orders/:id
      └── orders/:id/track
```

## Important Files to Know

### Backend
- `app/Models/User.php` - User model with role relationships
- `app/Models/Delivery.php` - Delivery model with tracking
- `app/Http/Controllers/API/AuthController.php` - Authentication logic
- `database/migrations/` - Schema definitions
- `routes/api.php` - API endpoints
- `config/cors.php` - CORS configuration

### Frontend
- `src/context/AuthContext.jsx` - Authentication state
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/App.jsx` - Main routing
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind configuration

## Common Tasks

### Adding a New API Endpoint

1. **Create Controller Method** (backend)
```php
// app/Http/Controllers/API/SomeController.php
public function index() {
    return response()->json(SomeModel::all());
}
```

2. **Add Route** (backend)
```php
// routes/api.php
Route::get('/some-endpoint', [SomeController::class, 'index']);
```

3. **Create Service/Hook** (frontend)
```javascript
// src/services/api.js
export const fetchSomeData = async () => {
    const response = await axios.get('/api/some-endpoint');
    return response.data;
};
```

4. **Use in Component** (frontend)
```jsx
import { fetchSomeData } from '../services/api';

useEffect(() => {
    fetchSomeData().then(data => setData(data));
}, []);
```

### Adding a New Page

1. Create page file: `src/pages/SomePath/SomePage.jsx`
2. Add route in `App.jsx`
3. Create components as needed in `src/components/`
4. Use Layout wrapper for consistent UI

```jsx
import Layout from '../../components/Layout/Layout';

export default function SomePage() {
    return (
        <Layout title="Page Title">
            {/* Page content */}
        </Layout>
    );
}
```

## Debugging Tips

### Backend
```bash
# Tinker into database
php artisan tinker

# Check latest queries
DB::listen(function($query) { dump($query->sql); });

# Check what roles exist
Role::all();

# Create test user
User::create([
    'name' => 'Test',
    'email' => 'test@example.com',
    'password' => Hash::make('password'),
    'role_id' => 1
]);
```

### Frontend
```javascript
// Check auth state
console.log(localStorage.getItem('token'));

// Check API requests
axios.interceptors.response.use(
    r => (console.log(r), r),
    e => (console.error(e), Promise.reject(e))
);

// React DevTools
// Install React DevTools browser extension
```

## Environment Configuration

### Backend (.env)
```env
APP_ENV=local
APP_DEBUG=true
DB_DATABASE=delivery_system
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Performance Optimization

### Backend
- Use `with()` for eager loading relationships
- Implement pagination with `paginate(15)`
- Cache frequently accessed data
- Index database columns properly

### Frontend
- Code splitting with React.lazy()
- Memoization for expensive components
- Debounce/throttle frequent operations
- Optimize images and assets

## Security Checklist

- ✅ Use HTTPS in production
- ✅ Validate all user inputs (backend)
- ✅ Sanitize outputs
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting
- ✅ Use CSRF protection tokens
- ✅ Secure password hashing (bcrypt)
- ✅ Implement request throttling
- ✅ Use SQL prepared statements (Eloquent ORM)

## Testing

```bash
# Backend
php artisan test                    # Run tests
php artisan test --filter=TestName  # Specific test

# Frontend
npm test                            # Run Jest tests
npm run test:watch                  # Watch mode
```

## Deployment Checklist

### Backend
- [ ] Set `APP_DEBUG=false`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan migrate --force`
- [ ] Use environment-specific `.env`
- [ ] Setup proper logging
- [ ] Configure CORS for production domain

### Frontend
- [ ] Run `npm run build`
- [ ] Test production build locally
- [ ] Configure API_URL for production
- [ ] Setup CDN for static assets
- [ ] Configure compression
- [ ] Setup error tracking

## Resources

- [Laravel Docs](https://laravel.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Leaflet](https://react-leaflet.js.org)
- [Vite Docs](https://vitejs.dev)

## Support

For issues or questions:
1. Check documentation files first
2. Review error messages carefully
3. Check browser console (frontend)
4. Check Laravel logs (`storage/logs/laravel.log`)
5. Enable debug mode temporarily

---

**Last Updated:** May 2024  
**Version:** 1.0.0  
**Status:** Active Development
