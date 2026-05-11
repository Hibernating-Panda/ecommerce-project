# API Documentation - Delivery Management System

## Base URL
```
http://127.0.0.1:8000/api
```

## Authentication
All protected endpoints require the following header:
```
Authorization: Bearer {token}
```

Tokens are obtained from login/register endpoints and should be stored in localStorage on the client.

---

## Authentication Endpoints

### Register
- **URL:** `POST /register`
- **Auth Required:** No
- **Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 000-0000",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "customer"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 000-0000",
    "role": "customer",
    "is_active": true,
    "created_at": "2024-05-11T10:00:00.000000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
- **URL:** `POST /login`
- **Auth Required:** No
- **Description:** Authenticate and get bearer token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "is_active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
- **URL:** `GET /user`
- **Auth Required:** Yes
- **Description:** Get authenticated user details

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 000-0000",
  "role": "customer",
  "is_active": true
}
```

### Logout
- **URL:** `POST /logout`
- **Auth Required:** Yes
- **Description:** Invalidate current token

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Admin Endpoints

### Get Dashboard Statistics
- **URL:** `GET /admin/dashboard`
- **Auth Required:** Yes (role: admin)
- **Description:** Get admin dashboard statistics

**Response (200):**
```json
{
  "stats": {
    "total_orders": 250,
    "pending_orders": 12,
    "completed_orders": 200,
    "active_deliveries": 15,
    "total_users": 342,
    "total_revenue": 45230.50,
    "customers": 300,
    "delivery_men": 35,
    "admins": 2
  },
  "chartData": [
    {
      "date": "Mon",
      "revenue": 2400,
      "orders": 120
    },
    ...
  ]
}
```

### Get Orders
- **URL:** `GET /admin/orders`
- **Auth Required:** Yes (role: admin)
- **Description:** List all orders with pagination

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15)
- `status` - Filter by status

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "customer_id": 5,
      "status": "completed",
      "total_price": 45.99,
      "payment_status": "paid",
      "created_at": "2024-05-10T10:00:00.000000Z"
    },
    ...
  ],
  "pagination": {
    "current_page": 1,
    "total": 250,
    "per_page": 15
  }
}
```

### Get Deliveries
- **URL:** `GET /admin/deliveries`
- **Auth Required:** Yes (role: admin)
- **Description:** List all deliveries

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "order_id": 1,
      "driver_id": 10,
      "status": "in_transit",
      "pickup_location": "Central Store",
      "delivery_location": "123 Main Street",
      "current_lat": 40.7128,
      "current_lng": -74.0060,
      "started_at": "2024-05-11T09:30:00.000000Z"
    },
    ...
  ]
}
```

---

## Delivery Man Endpoints

### Get Assigned Deliveries
- **URL:** `GET /delivery/assigned`
- **Auth Required:** Yes (role: delivery_man)
- **Description:** Get all assigned deliveries for the current driver

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "order_id": 5,
      "status": "in_transit",
      "pickup_location": "Central Store",
      "delivery_location": "123 Main Street",
      "current_lat": 40.7128,
      "current_lng": -74.0060,
      "latestLocation": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "123 Main Street"
      }
    }
  ]
}
```

### Get Delivery Details
- **URL:** `GET /delivery/{id}`
- **Auth Required:** Yes (role: delivery_man)
- **Description:** Get detailed information about a specific delivery

**Response (200):**
```json
{
  "id": 1,
  "order_id": 5,
  "driver_id": 10,
  "status": "in_transit",
  "pickup_location": "Central Store",
  "delivery_location": "123 Main Street",
  "pickup_lat": 40.7100,
  "pickup_lng": -74.0050,
  "current_lat": 40.7128,
  "current_lng": -74.0060,
  "delivery_lat": 40.7200,
  "delivery_lng": -74.0100,
  "estimated_time": 45,
  "started_at": "2024-05-11T09:30:00.000000Z",
  "locations": [
    {
      "latitude": 40.7100,
      "longitude": -74.0050,
      "address": "Start Location",
      "timestamp": "2024-05-11T09:30:00.000000Z"
    },
    ...
  ]
}
```

### Update Delivery Status
- **URL:** `PATCH /delivery/{id}/status`
- **Auth Required:** Yes (role: delivery_man)
- **Description:** Update the status of a delivery

**Request Body:**
```json
{
  "status": "picked_up",
  "notes": "Package picked up successfully"
}
```

**Response (200):**
```json
{
  "message": "Status updated successfully",
  "delivery": {
    "id": 1,
    "status": "picked_up",
    "picked_up_at": "2024-05-11T10:15:00.000000Z"
  }
}
```

**Valid Status Values:**
- `picked_up` - Item has been picked up
- `in_transit` - On the way to delivery
- `delivered` - Successfully delivered
- `cancelled` - Delivery cancelled

### Update Current Location
- **URL:** `POST /delivery/{id}/location`
- **Auth Required:** Yes (role: delivery_man)
- **Description:** Update driver's current GPS location

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main Street, New York"
}
```

**Response (200):**
```json
{
  "message": "Location updated successfully"
}
```

### Get Delivery History
- **URL:** `GET /delivery/history`
- **Auth Required:** Yes (role: delivery_man)
- **Description:** Get completed deliveries for the current driver

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "order_id": 5,
      "status": "delivered",
      "delivery_location": "123 Main Street",
      "completed_at": "2024-05-11T10:45:00.000000Z",
      "order": {
        "id": 5,
        "total_price": 45.99
      }
    }
  ]
}
```

---

## Customer Endpoints

### Get My Orders
- **URL:** `GET /customer/orders`
- **Auth Required:** Yes (role: customer)
- **Description:** Get all orders for current customer

**Response (200):**
```json
{
  "data": [
    {
      "id": 5,
      "customer_id": 1,
      "status": "completed",
      "total_price": 45.99,
      "payment_status": "paid",
      "created_at": "2024-05-10T10:00:00.000000Z",
      "delivery": {
        "id": 1,
        "status": "delivered"
      }
    }
  ]
}
```

### Create New Order
- **URL:** `POST /customer/orders`
- **Auth Required:** Yes (role: customer)
- **Description:** Create a new delivery order

**Request Body:**
```json
{
  "delivery_location": "456 Oak Avenue, New York",
  "delivery_lat": 40.7200,
  "delivery_lng": -74.0100,
  "total_price": 45.99,
  "notes": "Please ring the doorbell"
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 10,
    "customer_id": 1,
    "status": "pending",
    "total_price": 45.99,
    "created_at": "2024-05-11T11:00:00.000000Z"
  }
}
```

### Track Order
- **URL:** `GET /customer/orders/{id}/track`
- **Auth Required:** Yes (role: customer)
- **Description:** Get live tracking information for an order

**Response (200):**
```json
{
  "id": 5,
  "status": "in_transit",
  "delivery": {
    "id": 1,
    "status": "in_transit",
    "current_lat": 40.7128,
    "current_lng": -74.0060,
    "delivery_location": "456 Oak Avenue",
    "estimated_time": 15,
    "driver": {
      "id": 10,
      "name": "John Driver",
      "phone": "+1 (555) 555-5555"
    },
    "latestLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "Current Location",
      "timestamp": "2024-05-11T11:30:00.000000Z"
    }
  }
}
```

### Get Order Details
- **URL:** `GET /customer/orders/{id}`
- **Auth Required:** Yes (role: customer)
- **Description:** Get full details of a specific order

**Response (200):**
```json
{
  "id": 5,
  "customer_id": 1,
  "status": "completed",
  "total_price": 45.99,
  "created_at": "2024-05-10T10:00:00.000000Z",
  "delivery": {
    "id": 1,
    "status": "delivered",
    "locations": [
      {
        "latitude": 40.7100,
        "longitude": -74.0050,
        "timestamp": "2024-05-10T10:00:00.000000Z"
      }
    ]
  },
  "payment": {
    "id": 1,
    "status": "completed",
    "method": "card",
    "amount": 45.99
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized action"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Default:** 60 requests per minute per IP
- **Authentication:** 5 attempts per minute per email

Response header when rate limited:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

---

## Webhook Events

The system can send webhooks for important events:

### Delivery Status Changed
```json
{
  "event": "delivery.status_changed",
  "delivery_id": 1,
  "status": "in_transit",
  "timestamp": "2024-05-11T11:00:00.000000Z"
}
```

### Order Created
```json
{
  "event": "order.created",
  "order_id": 5,
  "customer_id": 1,
  "total_price": 45.99,
  "timestamp": "2024-05-11T11:00:00.000000Z"
}
```

