import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

from .database import engine, Base, get_db
from .models import Product, Customer, Order, OrderItem
from .schemas import DashboardResponse, ProductResponse, OrderResponse, OrderItemResponse
from .routes import products, customers, orders

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System",
    description="A full-stack system for managing products, customers, orders, and inventory tracking.",
    version="1.0.0",
)

# CORS – allow the React frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Inventory & Order Management API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()

    low_stock = db.query(Product).filter(Product.quantity <= 10).order_by(Product.quantity.asc()).limit(10).all()

    recent_orders = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.id.desc())
        .limit(5)
        .all()
    )

    serialized_orders = []
    for o in recent_orders:
        serialized_orders.append(
            OrderResponse(
                id=o.id,
                customer_id=o.customer_id,
                customer_name=o.customer.full_name if o.customer else None,
                total_amount=o.total_amount,
                status=o.status,
                created_at=o.created_at,
                items=[
                    OrderItemResponse(
                        id=i.id, product_id=i.product_id,
                        product_name=i.product.name if i.product else None,
                        quantity=i.quantity, unit_price=i.unit_price, subtotal=i.subtotal,
                    ) for i in o.items
                ],
            )
        )

    return DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=[ProductResponse.model_validate(p) for p in low_stock],
        recent_orders=serialized_orders,
    )
