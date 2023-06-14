from fastapi import APIRouter

from generate import clear_data, generate_data
from models import Inventory, Product, Review, Store


router = APIRouter()


@router.get("/clear")
async def clear_sample_data():
    return await clear_data()


@router.get("/generate")
async def generate_sample_data():
    return await generate_data()


@router.get("/stores")
async def get_stores():
    return await Store.find().all()


# Get all products for a store
@router.get("/products/{store_id}")
async def get_products_for_store(store_id: str):
    return await Inventory.find(
        (Inventory.store_id == store_id)
    ).all()


# Get products and product details
@router.get("/products")
async def get_products():
    return await Product.find().all()


# Get stores that have products in stock
@router.get("/stores/with/{product_id}")
async def get_stores_with_product(product_id: str):
    return await Inventory.find(
        (Inventory.product_id == product_id) &
        (Inventory.quantity > 0)
    ).all()


# Get reviews for a product
@router.get("/reviews/{product_id}")
async def get_reviews(product_id: str):
    return await Review.find(
        (Review.product_id == product_id)
    ).all()
