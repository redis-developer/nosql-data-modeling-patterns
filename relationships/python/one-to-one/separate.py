import asyncio
from typing import List
from aredis_om import Field, JsonModel
from aredis_om.model import Migrator

from utils import Base

class Product(JsonModel):
    name: str = Field(index=True)
    image: str = Field(index=True)
    price: int = Field(index=True)


class ProductDetail(JsonModel):
    product_id: str = Field(index=True)
    description: str
    manufacturer: str
    dimensions: str
    weight: str
    images: List[str]


async def get_product_list():
    return await Product.find().all()


async def get_product_details(product_id: str):
    return {
        "product": await Product.get(product_id),
        "details": await ProductDetail.find(
            ProductDetail.product_id == product_id
        ).first()
    }
