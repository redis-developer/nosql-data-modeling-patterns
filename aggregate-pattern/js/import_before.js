import { Schema, Repository, EntityId } from 'redis-om';
import { getClient } from './client.js';
const { default: data } = await import('./data.json', {
    assert: { type: 'json' },
});

const productSchema = new Schema('Product', {
    name: { type: 'string' },
});

const productReviewSchema = new Schema('ProductReview', {
    productId: { type: 'string' },
    author: { type: 'string' },
    rating: { type: 'number' },
});

const client = await getClient();
await client.flushDb();
const products = new Repository(productSchema, client);
const productReviews = new Repository(productReviewSchema, client);
await products.createIndex();
await productReviews.createIndex();

for (let product of data) {
    const productEntity = await products.save({ name: product.name });
    for (let review of product.reviews) {
        await productReviews.save({
            productId: productEntity[EntityId],
            ...review
        });
    }
}


process.exit(1);
