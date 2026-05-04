incase of error

backend setup:
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh
php artisan serve

frontend setup:
cd frontend
npm install
npm start

