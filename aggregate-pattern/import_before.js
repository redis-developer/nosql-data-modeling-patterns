import { Schema, Entity } from 'redis-om';
import { getClient } from './client.js';
const { default: data } = await import('./data.json', {
    assert: { type: 'json' },
});

class Product extends Entity {}
class ProductReview extends Entity {}

const productSchema = new Schema(Product, {
    name: { type: 'string' },
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

let productId = '';
for (let product of data) {
    const productEntity = await products.createAndSave({ name: product.name });
    for (let review of product.reviews) {
        await productReviews.createAndSave({
            productId: productEntity.entityId,
            ...review
        });
    }
    productId = productEntity.entityId;
}


process.exit(1);
