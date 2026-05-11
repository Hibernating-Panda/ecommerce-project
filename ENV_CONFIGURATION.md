# Environment Configuration Files

## Backend .env Configuration

Create `backend/.env` with the following configuration:

```env
# Application
APP_NAME="Delivery Management System"
APP_ENV=local
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=delivery_system
DB_USERNAME=root
DB_PASSWORD=

# Cache & Queue
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

# Mail (Optional - for testing)
MAIL_MAILER=log
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@deliverysystem.com
MAIL_FROM_NAME="Delivery System"

# Redis (Optional)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Sanctum (API Authentication)
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
SANCTUM_EXPIRATION=10080

# CORS Configuration
APP_CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Logging
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Timezone
APP_TIMEZONE=UTC

# Locale
APP_LOCALE=en
FALLBACK_LOCALE=en
```

## Frontend .env Configuration

Create `frontend/.env` with the following configuration:

```env
# API Configuration
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME="Delivery Management System"

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# Map Configuration
VITE_MAP_ZOOM_LEVEL=12
VITE_DEFAULT_LAT=40.7128
VITE_DEFAULT_LNG=-74.0060

# Performance
VITE_ENABLE_SOURCE_MAP=true
```

## Production Environment Variables

### Backend Production (.env.production)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database (use managed database in production)
DB_HOST=your-db-host.com
DB_USERNAME=production_user
DB_PASSWORD=secure_password_here

# Cache
CACHE_DRIVER=redis
REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=redis_password

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-key

# Sanctum
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com

# Logging
LOG_CHANNEL=single
LOG_LEVEL=warning

# Security
SESSION_SECURE_COOKIES=true
SESSION_HTTP_ONLY=true
```

### Frontend Production (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME="Delivery Management System"
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
```

## Database Configuration for Different Environments

### Local Development
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=delivery_system_dev
DB_USERNAME=root
DB_PASSWORD=
```

### Testing
```env
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
# or
DB_DATABASE=database/testing.sqlite
```

### Production
```env
DB_HOST=prod-db.example.com
DB_PORT=3306
DB_DATABASE=delivery_system_prod
DB_USERNAME=prod_user
DB_PASSWORD=ultra_secure_password_123!
# Use SSL connection
DB_SSL_MODE=require
```

## Docker Compose Configuration (Optional)

Create `docker-compose.yml` for containerized development:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: delivery_mysql
    environment:
      MYSQL_DATABASE: delivery_system
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - delivery_network

  redis:
    image: redis:7-alpine
    container_name: delivery_redis
    ports:
      - "6379:6379"
    networks:
      - delivery_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: delivery_backend
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    volumes:
      - ./backend:/app
    networks:
      - delivery_network

volumes:
  mysql_data:

networks:
  delivery_network:
    driver: bridge
```

## Quick Setup Script

Create `setup.sh` for automated setup:

```bash
#!/bin/bash

echo "🚀 Setting up Delivery Management System..."

# Backend Setup
echo "📦 Setting up backend..."
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
echo "✅ Backend ready!"

# Frontend Setup
echo "📦 Setting up frontend..."
cd ../frontend
cp .env.example .env
npm install
echo "✅ Frontend ready!"

echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Update frontend/.env with your API URL"
echo "3. Run 'php artisan serve' in backend directory"
echo "4. Run 'npm run dev' in frontend directory"
echo "5. Open http://localhost:3000 in your browser"
```

## Windows Batch Setup Script

Create `setup.bat` for Windows:

```batch
@echo off
echo.
echo 🚀 Setting up Delivery Management System...
echo.

REM Backend Setup
echo 📦 Setting up backend...
cd backend
copy .env.example .env
call composer install
call php artisan key:generate
call php artisan migrate --seed
echo ✅ Backend ready!
cd ..

REM Frontend Setup
echo 📦 Setting up frontend...
cd frontend
copy .env.example .env
call npm install
echo ✅ Frontend ready!
cd ..

echo.
echo 🎉 Setup complete!
echo.
echo 📝 Next steps:
echo 1. Update backend\.env with your database credentials
echo 2. Update frontend\.env with your API URL
echo 3. Run 'php artisan serve' in backend directory
echo 4. Run 'npm run dev' in frontend directory
echo 5. Open http://localhost:3000 in your browser
pause
```

## Environment Verification Checklist

Before starting the application, verify:

- [ ] MySQL database is running and accessible
- [ ] Redis is running (if using caching)
- [ ] Backend .env file is configured correctly
- [ ] Frontend .env file is configured correctly
- [ ] No port conflicts (8000 for backend, 3000 for frontend)
- [ ] PHP version is 8.2 or higher
- [ ] Node.js version is 18 or higher
- [ ] All dependencies are installed (composer install, npm install)
- [ ] Database migrations have run successfully
- [ ] Seeders have populated demo data

## Testing Connectivity

### Backend
```bash
curl http://127.0.0.1:8000/api/login
# Should return 422 (validation error) or login form
```

### Frontend (after running dev server)
```bash
curl http://localhost:3000
# Should return HTML content
```

### Database Connection
```bash
php artisan tinker
> DB::connection()->getPdo();
> Role::all();
```

---

**Keep these .env files secure and never commit them to version control!**
