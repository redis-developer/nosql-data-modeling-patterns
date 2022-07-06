import datetime
from typing import List, Optional
from aredis_om import connections, Field, JsonModel

from utils import Base


class ProductReview(JsonModel):
    product_id: str = Field(index=True)
    name: str = Field(index=True)
    rating: str
    published_date: datetime.date
    comment: str = Field(index=True, full_text_search=True)


class Product(JsonModel):
    name: str = Field(index=True)
    image: str = Field(index=True)
    price: int = Field(index=True)
    videos: Optional[List[str]]


async def get_reviews(product_id: str):
    return await ProductReview.find(
        ProductReview.product_id == product_id
    ).all()


async def get_products():
    results = await connections \
        .get_redis_connection() \
        .execute_command(
            f'FT.SEARCH {Product.Meta.index_name} * LIMIT 0 10 RETURN 3 name image price'
        )

    return Product.from_redis(results)


async def get_product(product_id: str):
    return await Product.get(product_id)


async def get_reviews(product_id: str):
    query = ProductReview.find(ProductReview.product_id == product_id)
    query.offset = 2
    return await query.all()


async def add_review(review: ProductReview):
    product = await Product.get(review.product_id)
    product.recent_reviews.insert(0, review)

    if (len(product.recent_reviews) > 2):
        product.recent_reviews.pop()

    await review.save()
    await product.save()
