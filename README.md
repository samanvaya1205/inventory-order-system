# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

| Layer           | Technology             |
|-----------------|------------------------|
| Frontend        | React 18 + Vite        |
| Backend         | Python + FastAPI       |
| Database        | PostgreSQL 16          |
| Containerization| Docker + Docker Compose|

## Features

- **Product Management** — CRUD with unique SKU enforcement, stock tracking
- **Customer Management** — Create/delete with unique email validation
- **Order Management** — Create orders with automatic stock reduction and total calculation
- **Dashboard** — Summary stats, low-stock alerts, recent orders
- **Business Rules** — Inventory validation, stock restoration on order cancellation
- **Responsive UI** — Works on desktop and mobile

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd inventory-system

# 2. Copy environment variables
cp .env.example .env

# 3. Build and run
docker compose up --build -d

# 4. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set your database URL
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Set backend API URL
echo "VITE_API_URL=http://localhost:8000/api" > .env

npm run dev
```

## API Endpoints

### Products
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | /api/products     | Create product       |
| GET    | /api/products     | List all products    |
| GET    | /api/products/:id | Get product by ID    |
| PUT    | /api/products/:id | Update product       |
| DELETE | /api/products/:id | Delete product       |

### Customers
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/customers      | Create customer      |
| GET    | /api/customers      | List all customers   |
| GET    | /api/customers/:id  | Get customer by ID   |
| DELETE | /api/customers/:id  | Delete customer      |

### Orders
| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| POST   | /api/orders      | Create order         |
| GET    | /api/orders      | List all orders      |
| GET    | /api/orders/:id  | Get order details    |
| DELETE | /api/orders/:id  | Cancel/delete order  |

### Dashboard
| Method | Endpoint        | Description             |
|--------|-----------------|-------------------------|
| GET    | /api/dashboard  | Summary stats & alerts  |

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders cannot be placed if inventory is insufficient
- Creating an order automatically reduces available stock
- Cancelling an order restores stock
- Total order amount is calculated server-side

## Deployment

### Backend (Render / Railway / Fly.io)
1. Push the backend to a Git repo or use the Docker image
2. Set environment variables: `DATABASE_URL`, `FRONTEND_URL`
3. Expose port 8000

### Frontend (Vercel / Netlify)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Set env variable: `VITE_API_URL=https://your-backend-url.com/api`

### Docker Hub
```bash
docker build -t yourusername/inventory-backend ./backend
docker push yourusername/inventory-backend
```

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, dashboard
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic validation
│   │   ├── database.py      # DB connection
│   │   └── routes/
│   │       ├── products.py
│   │       ├── customers.py
│   │       └── orders.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Orders.jsx
│   │   └── services/api.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```
