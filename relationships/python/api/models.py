import datetime
from typing import List
from aredis_om import Field, JsonModel, EmbeddedJsonModel

from utils import Base


class Address(Base("addresses"), EmbeddedJsonModel):
    street: str
    city: str
    zip: str


class Inventory(Base("inventories"), JsonModel):
    store_id: str = Field(index=True)
    product_id: str = Field(index=True)
    store_name: str
    store_contact: str
    store_address: Address
    quantity: int = Field(index=True)
    price: int


class Store(Base("stores"), JsonModel):
    name: str
    contact: str
    address: Address


class ProductDetail(Base("product_details"), EmbeddedJsonModel):
    full_summary: str
    manufacturer: str
    package_dimensions: str
    images: List[str]


class Product(Base("products"), JsonModel):
    name: str
    description: str
    image: str
    review_count: int
    rating_sum: int
    details: ProductDetail


class Review(Base("reviews"), JsonModel):
    product_id: str = Field(index=True)
    reviewer: str
    rating: str = Field(index=True)
    comment: str
    published_date: datetime.date = Field(index=True)
