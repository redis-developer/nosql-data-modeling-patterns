import { Schema, Entity } from 'redis-om';
import { getClient } from './client.js';
const { default: data } = await import('./data.json', {
    assert: { type: 'json' },
});

class Product extends Entity {}
class ProductReview extends Entity {}

const productSchema = new Schema(Product, {
    name: { type: 'string' },
    numReviews: { type: 'number' },
    sumRatings: { type: 'number' },
});

const productReviewSchema = new Schema(ProductReview, {
    productId: { type: 'string' },
    author: { type: 'string' },
    rating: { type: 'number' },
});

const client = await getClient();
await client.execute(['FLUSHDB']);
const products = client.fetchRepository(productSchema);
const productReviews = client.fetchRepository(productReviewSchema);
await products.createIndex();
await productReviews.createIndex();

for (let product of data) {
    const numReviews = product.reviews.length;
    const productEntity = products.createEntity({
        name: product.name,
        numReviews,
        sumRatings: 0,
    });
    let sum = 0;
    for (let review of product.reviews) {
        sum += review.rating;
        await productReviews.createAndSave({
            productId: productEntity.entityId,
            ...review,
        });
    }

    productEntity.entityData.sumRatings = sum;

    await products.save(productEntity);
}

process.exit(1);
