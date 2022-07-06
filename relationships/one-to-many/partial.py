import asyncio
import datetime
from typing import List, Optional
from aredis_om import connections, Field, JsonModel
from aredis_om.model import Migrator

from utils import Base


class ProductReview(JsonModel):
    product_id: str = Field(index=True)
    reviewer: str
    rating: str
    published_date: datetime.date
    comment: str


class Product(JsonModel):
    name: str = Field(index=True)
    image: str = Field(index=True)
    price: int = Field(index=True)
    videos: Optional[List[str]]
    recent_reviews: Optional[List[ProductReview]]


async def add_product():
    product = {
        "name": "Earbuds",
        "image": "https://www.example.com/image.jpg",
        "price": 1999,
        "videos": ["https://www.example.com/video1.mp4", "https://www.example.com/video2.mp4"],
        "recent_reviews": [],
    }

    return await Product(**product).save()

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

async def add_reviews(product: Product):
    await add_review(ProductReview(
        product_id=product.pk,
        reviewer="John Doe",
        rating="5",
        published_date=datetime.date.today(),
        comment="Great product!"
    ))
    await add_review(ProductReview(
        product_id=product.pk,
        reviewer="Jane Doe",
        rating="2",
        published_date=datetime.date.today(),
        comment="Bad product!"
    ))
    await add_review(ProductReview(
        product_id=product.pk,
        reviewer="Jerry Doe",
        rating="4",
        published_date=datetime.date.today(),
        comment="Great product!"
    ))
    await add_review(ProductReview(
        product_id=product.pk,
        reviewer="Jill Doe",
        rating="4",
        published_date=datetime.date.today(),
        comment="Great product!"
    ))
    await add_review(ProductReview(
        product_id=product.pk,
        reviewer="Jake Doe",
        rating="1",
        published_date=datetime.date.today(),
        comment="Awful product!"
    ))

async def main():
    await Migrator().run()
    product = await add_product()
    await add_reviews(product)
    db_product = await get_product(product.pk)
    # print(db_product.recent_reviews)
    reviews = await get_reviews(product.pk)
    # print(reviews)
    print(await get_products())

if __name__ == '__main__':
    asyncio.run(main())
