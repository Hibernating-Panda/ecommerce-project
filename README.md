# E-Shop Project

A full-stack e-commerce application with Laravel backend and React frontend featuring complete authentication system.

## 🚀 Quick Start

### Prerequisites
- PHP 8.0+
- Composer
- Node.js & npm
- MySQL/MariaDB
- Git

### 📋 Setup Instructions

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-project
```

#### 2. Backend Setup (Laravel)
```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env file:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ecommerce
# DB_USERNAME=root
# DB_PASSWORD=

# Run database migrations
php artisan migrate:fresh

# Start Laravel server
php artisan serve
```

#### 3. Frontend Setup (React)
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm start
```

#### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Login**: Use existing user `test@example.com` / `password` or register a new account

## 🔧 Troubleshooting

### Common Issues & Solutions

#### CORS Error
If you get CORS errors, update `backend/config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000', 'http://localhost:3001'],
```

#### Database Connection Error
Ensure your `.env` file has correct database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### Port Already in Use
If port 3000 or 8000 is in use:
```bash
# Frontend (React)
PORT=3001 npm start

# Backend (Laravel)
php artisan serve --port=8001
```

#### Permission Issues
```bash
# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Set proper permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

#### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or use yarn
yarn install
```

#### Composer Issues
```bash
# Clean install
rm -rf vendor composer.lock
composer install

# Update dependencies
composer update
```

## 📁 Project Structure

```
ecommerce-project/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/API/
│   │   ├── Models/
│   │   └── ...
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── ...
└── README.md
```

## 🔐 Authentication Features

- User registration and login
- Token-based authentication (Sanctum)
- Protected routes
- Automatic token management
- Logout functionality
- User profile management

## 🛠 Technologies Used

### Backend
- Laravel 9+
- PHP 8.0+
- MySQL/MariaDB
- Laravel Sanctum (Authentication)
- CORS middleware

### Frontend
- React 18+
- React Router
- Axios
- Context API (State Management)
- CSS-in-JS styling

## 📝 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get single product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

## 🧪 Testing

### Backend Testing
```bash
cd backend
php artisan test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set up production database
2. Configure `.env` for production
3. Run `php artisan config:cache`
4. Set up web server (Apache/Nginx)
5. Configure SSL certificate

### Frontend Deployment
1. Run `npm run build`
2. Deploy build folder to web server
3. Configure routing for SPA

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error logs
3. Create an issue on GitHub
4. Contact the development team

---

**Note**: Always ensure you have the latest versions of PHP and Node.js installed for optimal compatibility.
