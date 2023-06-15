import { Schema, Repository, EntityId } from 'redis-om';
import { getClient } from './client.js';
const { default: data } = await import('./data.json', {
    assert: { type: 'json' },
});

const productSchema = new Schema('Product', {
    name: { type: 'string' },
    numReviews: { type: 'number' },
    sumRatings: { type: 'number' },
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
    const numReviews = product.reviews.length;
    const productEntity = await products.save({
        name: product.name,
        numReviews,
        sumRatings: 0,
    });
    let sum = 0;
    for (let review of product.reviews) {
        sum += review.rating;
        await productReviews.save({
            productId: productEntity[EntityId],
            ...review,
        });
    }

    productEntity.sumRatings = sum;

    await products.save(productEntity);
}

process.exit(1);
