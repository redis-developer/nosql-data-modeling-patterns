import datetime
import random
import requests
from typing import List
from models import Inventory, Store, Review, Product


async def random_data(resource_endpoint: str, resource: str = None, size=5):
    if not resource:
        resource = resource_endpoint

    response = requests.get(
        f"https://random-data-api.com/api/{resource_endpoint}/random_{resource}?size={size}")
    return response.json()


async def random_appliances():
    users = await random_data("appliance")
    return [{"manufacturer": x['brand']} for x in users]


async def random_sentences():
    sentences = await random_data("hipster", "hipster_stuff")
    return [x['sentence'] for x in sentences]


async def random_dimensions():
    return f'{random.randint(1, 100)} x {random.randint(1, 100)} x {random.randint(1, 100)}'


async def random_users():
    users = await random_data("users", "user")
    return [{"name": f"{x['first_name']} {x['last_name']}"} for x in users]


images = []


async def random_images():
    global images

    if len(images) > 0:
        return images

    placeholders = await random_data("placeholdit")
    images = [x['image'] for x in placeholders]

    return images


async def random_products():
    commerce = await random_data("commerce")
    images = await random_images()
    products = []

    for idx, product in enumerate(commerce):
        products.append({
            "name": product['product_name'],
            "description": f"A new {product['product_name']}",
            "image": images[idx],
            "review_count": 0,
            "rating_sum": 0,
        })

    return products


async def random_quantity():
    return random.randint(0, 10)


async def random_price():
    return random.randint(100, 100000)


async def random_rating():
    return random.randint(1, 5)


async def random_addresses():
    addresses = await random_data("address")
    return [{
        "street": x['street_name'],
        "city": x['city'],
        "zip": x['zip']
    } for x in addresses]


async def random_contacts():
    addresses = await random_data("phone_number")
    return [x['cell_phone'] for x in addresses]


async def random_stores():
    companies = await random_data("company")
    addresses = await random_addresses()
    contacts = await random_contacts()
    stores = []

    for idx, company in enumerate(companies):
        stores.append({
            "name": company['business_name'],
            "contact": contacts[idx],
            "address": addresses[idx]
        })

    return stores


async def generate_stores():
    return [
        await Store(**store).save()
        for store in await random_stores()
    ]


async def generate_product_details(products: List[Product]):
    appliances = await random_appliances()
    sentences = await random_sentences()

    for idx, product in enumerate(products):
        product['details'] = {
            "manufacturer": appliances[idx]['manufacturer'],
            "package_dimensions": await random_dimensions(),
            "images": await random_images(),
            "full_summary": sentences[idx]
        }

    return products


async def generate_products():
    products = await random_products()
    products = await generate_product_details(products)

    return [
        await Product(**product).save()
        for product in products
    ]


async def generate_reviews(products: List[Product]):
    reviews = []
    users = await random_users()
    for product in products:
        for user in users:
            rating = await random_rating()
            reviews.append(await Review(
                product_id=product.pk,
                reviewer=user['name'],
                rating=rating,
                comment=f"This is a{' great' if rating > 3 else ' good' if rating > 2 else 'n okay' if rating > 1 else ' terrible'} {product.name}, {rating}/5 stars!",
                published_date=datetime.date(
                    2021, random.randint(1, 12), random.randint(1, 28))
            ).save())
            product.review_count += 1
            product.rating_sum += rating
            await product.save()

    return [reviews, products]


async def generate_inventory(stores: List[Store], products: List[Product]):
    inventory = []
    for store in stores:
        for product in products:
            inventory.append(await Inventory(
                store_id=store.pk,
                product_id=product.pk,
                store_name=store.name,
                store_contact=store.contact,
                store_address=store.address,
                quantity=await random_quantity(),
                price=await random_price()
            ).save())

    return inventory


async def clear_data():
    stores = await Store.find().all()
    for store in stores:
        await store.delete()

    reviews = await Review.find().all()
    for review in reviews:
        await review.delete()

    inventories = await Inventory.find().all()
    for inventory in inventories:
        await inventory.delete()

    products = await Product.find().all()
    for product in products:
        await product.delete()


async def generate_data():
    await clear_data()
    stores = await generate_stores()
    products = await generate_products()
    [reviews, products] = await generate_reviews(products)
    inventory = await generate_inventory(stores, products)

    return {
        "stores": stores,
        "products": products,
        "reviews": reviews,
        "inventory": inventory
    }
