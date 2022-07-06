import asyncio
from typing import List, Optional
from aredis_om import connections, Field, JsonModel, EmbeddedJsonModel
from aredis_om.model import Migrator

from utils import Base


class ProductDetail(Base("product_details"), EmbeddedJsonModel):
    description: str
    manufacturer: str
    dimensions: str
    weight: str
    images: List[str]

class Product(Base("products"), JsonModel):
    name: str = Field(index=True)
    image: str = Field(index=True)
    price: int = Field(index=True)
    details: Optional[ProductDetail]


async def get_product_list():
    results = await connections \
        .get_redis_connection() \
        .execute_command(
            f'FT.SEARCH {Product.Meta.index_name} * LIMIT 0 10 RETURN 3 name image price'
        )

    return Product.from_redis(results)


async def get_product_details(product_id: str):
    return await Product.get(product_id)
